import { bootstrapSite, collectFetchBatch, collectPageBatch, collectSitemapBatch, emptyContext } from '../_lib/collect.js';
import { evaluate, supportedCodes } from '../_lib/evaluate.js';
import { parsePage } from '../_lib/html.js';

export async function onRequest({ request }) {
  if (request.method !== 'POST') return json({ error: 'Método não permitido.' }, 405, { allow: 'POST' });
  if (Number(request.headers.get('content-length') ?? 0) > 100_000) return json({ error: 'Pedido demasiado grande.' }, 413);

  try {
    const body = await request.json();
    if (body?.action === 'bootstrap') return json(await bootstrap(body.url));
    if (body?.action === 'pages') return json(await pages(body.root, body.urls));
    if (body?.action === 'sitemaps') return json({ items: await collectSitemapBatch(array(body.urls)) });
    if (body?.action === 'fetch') return json({ items: await collectFetchBatch(array(body.entries)) });
    return json({ error: 'Ação inválida.' }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível concluir a auditoria.';
    const clientError = /URL|HTTP|HTTPS|público|porta|credenciais|endereço|Ação|máximo/i.test(message);
    return json({ error: message }, clientError ? 400 : 502);
  }
}

async function bootstrap(url) {
  if (typeof url !== 'string' || url.length > 2_000) throw new Error('Indica um URL válido.');
  const data = await bootstrapSite(url);
  const page = data.first.text ? parsePage(data.first) : null;
  const pageResponses = new Map([[data.first.requestedUrl, data.first], [data.first.finalUrl, data.first]]);
  const context = emptyContext(data.origin, page ? [page] : [], pageResponses);
  context.robots = data.robots;
  context.bots = data.bots;
  const failures = evaluate(context).filter(result => BOOTSTRAP_CODES.has(result.code) && !result.ok).map(result => ({
    code: result.code,
    urls: result.code.startsWith('OTH-00') || result.code === 'AIX-002' ? [new URL('/robots.txt', data.origin).href] : [data.finalUrl]
  }));
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
  const results = evaluate(data.context).filter(result => !DEFERRED_CODES.has(result.code) && (!HOME_CODES.has(result.code) || hasHome) && !result.ok);
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
  const candidates = HOME_CODES.has(code) ? data.context.pages.filter(page => new URL(page.url).pathname === '/') : data.context.pages;
  const urls = candidates.filter(page => {
    const context = emptyContext(data.context.origin, [page], data.context.pageResponses);
    return evaluate(context).some(result => result.code === code && !result.ok);
  }).map(page => page.url);
  if (urls.length) return urls;
  const summaries = data.summaries.filter(summary => statusFailure(code, summary)).map(summary => summary.requestedUrl);
  return summaries.length ? summaries : data.context.pages.map(page => page.url);
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
  ...Array.from({ length: 23 }, (_, index) => `LNK-${String(index + 1).padStart(3, '0')}`),
  ...Array.from({ length: 13 }, (_, index) => `LOC-${String(index + 1).padStart(3, '0')}`),
  ...Array.from({ length: 15 }, (_, index) => `SMP-${String(index + 1).padStart(3, '0')}`),
  'EXT-001', 'EXT-002', 'EXT-003', 'EXT-004',
  'CSS-001', 'CSS-002', 'CSS-003', 'CSS-005', 'CSS-006',
  'JSC-001', 'JSC-002', 'JSC-004', 'JSC-005',
  'IMG-001', 'IMG-002', 'IMG-003', 'IMG-005', 'IMG-007',
  'GIM-003', 'IDN-002', 'VID-005', 'VID-006', 'UXP-004', 'UXP-006'
]);
