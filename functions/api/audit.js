import { bootstrapSite, collectFetchBatch, collectPageBatch, collectSitemapBatch } from '../_lib/collect.js';
import { evaluate, supportedCodes } from '../_lib/evaluate.js';
import { publicUrl } from '../_lib/net.js';

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return json({ error: 'Método não permitido.' }, 405, { allow: 'POST' });
  if (Number(request.headers.get('content-length') ?? 0) > 100_000) return json({ error: 'Pedido demasiado grande.' }, 413);

  try {
    const body = await request.json();
    if (body?.action === 'bootstrap') return json(await bootstrap(body.url));
    if (body?.action === 'pages') return json(await pages(body.root, body.urls));
    if (body?.action === 'sitemaps') return json({ items: await collectSitemapBatch(array(body.urls)) });
    if (body?.action === 'fetch') return json({ items: await collectFetchBatch(array(body.entries)) });
    if (body?.action === 'performance') {
      if (!env?.GOOGLE_API_KEY) return json({ error: 'PageSpeed não configurado no servidor.' }, 503);
      return json(await performance(body.root, body.urls, env.GOOGLE_API_KEY));
    }
    return json({ error: 'Ação inválida.' }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível concluir a auditoria.';
    const clientError = /URL|HTTP|HTTPS|público|porta|credenciais|endereço|Ação|máximo/i.test(message);
    return json({ error: message }, clientError ? 400 : 502);
  }
}

async function performance(root, values, key) {
  const site = publicUrl(root);
  const urls = [...new Set(array(values).map(value => publicUrl(value).href))];
  if (!urls.length || urls.length > 3) throw new Error('Indica entre 1 e 3 URLs para PageSpeed.');
  if (urls.some(url => new URL(url).origin !== site.origin)) throw new Error('Todos os URLs PageSpeed devem pertencer ao site auditado.');
  const [pages, crux] = await Promise.all([
    Promise.all(urls.flatMap(url => ['mobile', 'desktop'].map(strategy => pageSpeed(url, strategy, key).catch(error => ({ url, strategy, error: message(error) }))))),
    cruxData(site.origin, key).catch(error => ({ error: message(error) }))
  ]);
  return { pages, crux };
}

async function pageSpeed(url, strategy, key) {
  const query = new URLSearchParams({ url, strategy, key });
  query.append('category', 'performance');
  query.append('category', 'seo');
  const response = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${query}`, { signal: AbortSignal.timeout(90_000) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || `PageSpeed HTTP ${response.status}`);
  const result = data.lighthouseResult;
  if (!result?.audits) throw new Error('Resposta PageSpeed incompleta.');
  const auditIds = new Set((result.categories?.performance?.auditRefs ?? []).filter(item => ['insights', 'diagnostics'].includes(item.group)).map(item => item.id));
  const audits = [...auditIds].map(id => result.audits[id]).filter(audit => audit && audit.score != null && audit.score < 1).sort((a, b) => a.score - b.score).slice(0, 15).map(audit => ({
    id: audit.id,
    title: audit.title,
    score: Math.round(audit.score * 100),
    display: audit.displayValue ?? '',
    resources: auditResources(audit.details?.items)
  }));
  return {
    url,
    finalUrl: result.finalUrl ?? url,
    strategy,
    fetchedAt: result.fetchTime,
    score: Math.round((result.categories?.performance?.score ?? 0) * 100),
    seoScore: Math.round((result.categories?.seo?.score ?? 0) * 100),
    metrics: Object.fromEntries(Object.entries(PAGE_SPEED_METRICS).map(([name, id]) => [name, Number(result.audits[id]?.numericValue) || 0])),
    audits
  };
}

async function cruxData(origin, key) {
  const response = await fetch(`https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ origin, formFactor: 'PHONE' }),
    signal: AbortSignal.timeout(20_000)
  });
  const data = await response.json();
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(data.error?.message || `CrUX HTTP ${response.status}`);
  const period = data.record?.collectionPeriod;
  return {
    origin,
    formFactor: 'PHONE',
    period: period ? `${date(period.firstDate)}/${date(period.lastDate)}` : '',
    metrics: Object.fromEntries(Object.entries(CRUX_METRICS).flatMap(([name, id]) => {
      const metric = data.record?.metrics?.[id];
      return metric ? [[name, { p75: Number(metric.percentiles?.p75), distribution: metric.histogram?.map(bucket => bucket.density) ?? [] }]] : [];
    }))
  };
}

function auditResources(items) {
  return (items ?? []).flatMap(item => {
    const resource = item.url ?? item.source?.url ?? item.node?.selector ?? item.node?.snippet;
    if (!resource) return [];
    const values = ['wastedBytes', 'wastedMs', 'totalBytes', 'duration', 'transferSize'].flatMap(name => Number.isFinite(item[name]) ? [`${name}=${Math.round(item[name])}`] : []);
    return [`${String(resource).replace(/\s+/g, ' ').slice(0, 240)}${values.length ? ` (${values.join(',')})` : ''}`];
  }).slice(0, 5);
}

function date(value) {
  return `${value.year}-${String(value.month).padStart(2, '0')}-${String(value.day).padStart(2, '0')}`;
}

function message(error) {
  return String(error instanceof Error ? error.message : error).slice(0, 300);
}

async function bootstrap(url) {
  if (typeof url !== 'string' || url.length > 2_000) throw new Error('Indica um URL válido.');
  const data = await bootstrapSite(url);
  const robotsUrl = new URL('/robots.txt', data.origin).href;
  const failures = [
    ['OTH-006', data.robots.response.status === 200 && data.robots.errors.length > 0, robotsUrl],
    ['OTH-007', data.robots.response.error === 'redirect_limit' || redirectLoop(data.robots.response.redirects), robotsUrl],
    ['OTH-008', data.robots.response.status !== 200, robotsUrl],
    ['OTH-017', data.robots.disallows('*', data.finalUrl), data.finalUrl],
    ['AIX-002', data.robots.disallows('googlebot', data.finalUrl), robotsUrl],
    ['AIX-003', data.robots.disallows('oai-searchbot', data.finalUrl) || blockedBot(data.bots.oaiSearchBot), data.finalUrl],
    ['AIX-004', data.robots.disallows('perplexitybot', data.finalUrl) || blockedBot(data.bots.perplexityBot), data.finalUrl],
    ['AIX-005', Object.values(data.bots).some(blockedBot), data.finalUrl]
  ].filter(([, failed]) => failed).map(([code, , target]) => ({ code, urls: [target] }));
  return {
    root: data.finalUrl,
    origin: data.origin,
    sitemapSeeds: data.sitemapSeeds,
    failures,
    supportedCodes: supportedCodes()
  };
}

async function pages(root, urls) {
  if (typeof root !== 'string') throw new Error('URL raiz inválido.');
  const data = await collectPageBatch(root, array(urls));
  const hasHome = data.context.pages.some(page => new URL(page.url).pathname === '/');
  const results = evaluate(data.context, DEFERRED_CODES).filter(result => (!HOME_CODES.has(result.code) || hasHome) && !result.ok);
  const failures = results.map(result => ({ code: result.code, urls: occurrenceUrls(result.code, data) }));
  return {
    summaries: data.summaries,
    discovered: data.discovered,
    external: data.external,
    resources: data.resources,
    failures
  };
}

function occurrenceUrls(code, data) {
  const summaries = data.summaries.filter(summary => statusFailure(code, summary)).map(summary => summary.requestedUrl);
  return summaries.length ? summaries : data.context.pages.map(page => page.url);
}

function blockedBot(response) {
  return !response || [401, 403, 429, 503].includes(response.status) || /(?:captcha|challenge-platform|cf-chl-|access denied|verify you are human)/i.test(response.text ?? '');
}

function statusFailure(code, response) {
  if (code === 'HTTP-001') return response.status === 404;
  if (code === 'HTTP-002') return response.status >= 400 && response.status < 500;
  if (code === 'HTTP-003') return response.status === 500;
  if (code === 'HTTP-004') return response.status >= 500;
  if (code === 'HTTP-005') return response.error === 'timeout';
  if (code === 'RED-001') return response.error || response.redirects.length && response.status >= 400;
  if (code === 'RED-002') return response.error === 'redirect_limit' || response.redirects.length > 5;
  if (code === 'RED-003') return redirectLoop(response.redirects);
  if (code === 'RED-004') return response.redirects.length > 0;
  if (code === 'RED-005') return response.redirects.some(item => item.status === 302);
  if (code === 'RED-006') return response.redirects.some(item => item.from.startsWith('https:') && item.to.startsWith('http:'));
  if (code === 'RED-007') return response.redirects.some(item => item.from.startsWith('http:') && item.to.startsWith('https:'));
  if (code === 'RED-008') return response.redirects.length > 1;
  return false;
}

function redirectLoop(redirects) {
  const urls = redirects.flatMap(item => [item.from, item.to]);
  return new Set(urls).size < urls.length - 1;
}

function array(value) {
  if (!Array.isArray(value)) throw new Error('Lista inválida.');
  return value;
}

function json(body, status = 200, headers = {}) {
  return Response.json(body, { status, headers: { 'cache-control': 'no-store', ...headers } });
}

const BOOTSTRAP_CODES = new Set(['AIX-002', 'AIX-003', 'AIX-004', 'AIX-005', 'OTH-006', 'OTH-007', 'OTH-008', 'OTH-017']);
const HOME_CODES = new Set(['IDN-001', 'IDN-003', 'IDN-004']);
const DEFERRED_CODES = new Set([
  ...BOOTSTRAP_CODES,
  'DUP-001', 'SDG-004', 'SDG-005', 'AIX-013', 'AIX-014', 'AIX-015',
  'IDX-001', 'IDX-002', 'IDX-003', 'IDX-009',
  'FAC-002',
  ...Array.from({ length: 23 }, (_, index) => `LNK-${String(index + 1).padStart(3, '0')}`),
  ...Array.from({ length: 13 }, (_, index) => `LOC-${String(index + 1).padStart(3, '0')}`),
  ...Array.from({ length: 15 }, (_, index) => `SMP-${String(index + 1).padStart(3, '0')}`),
  'EXT-001', 'EXT-002', 'EXT-003', 'EXT-004',
  'CSS-001', 'CSS-002', 'CSS-003', 'CSS-005', 'CSS-006',
  'JSC-001', 'JSC-002', 'JSC-004', 'JSC-005',
  'IMG-001', 'IMG-002', 'IMG-003', 'IMG-005', 'IMG-007',
  'GIM-003', 'IDN-002', 'VID-005', 'VID-006', 'UXP-004', 'UXP-006'
]);
const PAGE_SPEED_METRICS = {
  fcpMs: 'first-contentful-paint',
  lcpMs: 'largest-contentful-paint',
  tbtMs: 'total-blocking-time',
  cls: 'cumulative-layout-shift',
  speedIndexMs: 'speed-index'
};
const CRUX_METRICS = {
  lcpMs: 'largest_contentful_paint',
  inpMs: 'interaction_to_next_paint',
  cls: 'cumulative_layout_shift',
  fcpMs: 'first_contentful_paint',
  ttfbMs: 'experimental_time_to_first_byte'
};
