import { fetchLimited, publicUrl } from './net.js';
import { parsePage } from './html.js';

const PAGE_BATCH = 1;
const SITEMAP_BATCH = 3;
const FETCH_BATCH = 20;

export async function bootstrapSite(value) {
  const start = publicUrl(value);
  const robotsUrl = new URL('/robots.txt', start).href;
  const [first, robotsResponse, ...botResponses] = await Promise.all([
    fetchLimited(start, { maxBytes: 100_000 }),
    fetchLimited(robotsUrl, { maxBytes: 600_000, accept: 'text/plain,*/*;q=0.5', forceText: true }),
    ...Object.values(BOT_AGENTS).map(userAgent => fetchLimited(start, { userAgent, maxBytes: 100_000 }))
  ]);
  if (!first.status && first.error) throw new Error('Não foi possível aceder ao URL indicado.');
  const origin = new URL(first.finalUrl).origin;
  const robots = parseRobots(robotsResponse);
  return {
    startUrl: start.href,
    finalUrl: first.finalUrl,
    origin,
    first,
    robots,
    bots: Object.fromEntries(Object.keys(BOT_AGENTS).map((name, index) => [name, botResponses[index]])),
    sitemapSeeds: [...new Set([...robots.sitemaps, new URL('/sitemap.xml', origin).href])]
  };
}

export async function collectPageBatch(root, values) {
  const origin = publicUrl(root).origin;
  const urls = unique(values.map(value => publicUrl(value).href)).filter(value => new URL(value).origin === origin).slice(0, PAGE_BATCH);
  const responses = await Promise.all(urls.map(url => safeFetch(url, { maxBytes: 2_100_000 })));
  const pages = responses.filter(response => response.text && htmlResponse(response)).map(parsePage);
  const pageResponses = new Map();
  for (const response of responses) {
    pageResponses.set(normalize(response.requestedUrl), response);
    pageResponses.set(normalize(response.finalUrl), response);
  }
  const context = emptyContext(origin, pages, pageResponses);
  return {
    context,
    summaries: responses.map(response => summarizeResponse(response, pages.find(page => normalize(page.url) === normalize(response.finalUrl)))),
    discovered: unique(pages.filter(page => page.status >= 200 && page.status < 400).flatMap(page => [
      ...page.links.map(link => link.url),
      ...page.canonical,
      ...page.hreflang.map(item => item.url)
    ])).filter(url => sameOrigin(url, origin)),
    external: unique(pages.flatMap(page => page.links.map(link => link.url))).filter(url => !sameOrigin(url, origin)),
    resources: mergeResources(pages.flatMap(page => pageResources(page)))
  };
}

export async function collectSitemapBatch(values) {
  const urls = unique(values.map(value => publicUrl(value).href)).slice(0, SITEMAP_BATCH);
  const responses = await Promise.all(urls.map(url => safeFetch(url, { maxBytes: 10_000_000, accept: 'application/xml,text/xml,*/*;q=0.5', forceText: true })));
  return responses.map((response, index) => parseSitemap(urls[index], response));
}

export async function collectFetchBatch(entries) {
  const clean = entries.slice(0, FETCH_BATCH).map(entry => ({
    url: publicUrl(entry.url).href,
    kinds: unique([entry.kinds].flat().map(String))
  }));
  const responses = await Promise.all(clean.map(entry => safeFetch(entry.url, {
    maxBytes: entry.kinds.some(kind => ['css', 'js'].includes(kind)) ? 500_000 : 70_000,
    forceText: entry.kinds.some(kind => ['css', 'js'].includes(kind)),
    headers: entry.kinds.every(kind => ['image', 'icon', 'video'].includes(kind)) ? { range: 'bytes=0-65535' } : undefined,
    accept: '*/*'
  })));
  return clean.map((entry, index) => ({
    ...entry,
    ...publicResponse(responses[index]),
    smallFonts: /font-size\s*:\s*(?:[0-9]|1[01])px/i.test(responses[index].text),
    iconValid: entry.kinds.includes('icon') ? squareIcon(responses[index].bytes) : null
  }));
}

export function responseFor(context, url) {
  return context.pageResponses.get(normalize(url)) ?? context.targets.get(normalize(url)) ?? context.resources.find(item => normalize(item.url) === normalize(url))?.response;
}

export function parseRobots(response) {
  const text = response.text ?? '';
  const groups = [];
  const sitemaps = [];
  const errors = [];
  let group;

  for (const [index, source] of text.split(/\r?\n/).entries()) {
    const line = source.replace(/\s+#.*$/, '').trim();
    if (!line) continue;
    const match = line.match(/^([\w-]+)\s*:\s*(.*)$/);
    if (!match) {
      errors.push(index + 1);
      continue;
    }
    const key = match[1].toLowerCase();
    const value = match[2].trim();
    if (key === 'sitemap') {
      try { sitemaps.push(publicUrl(value).href); } catch { errors.push(index + 1); }
      continue;
    }
    if (key === 'user-agent') {
      if (!group || group.rules.length) {
        group = { agents: [], rules: [] };
        groups.push(group);
      }
      group.agents.push(value.toLowerCase());
      continue;
    }
    if (['allow', 'disallow'].includes(key)) {
      if (!group) errors.push(index + 1);
      else group.rules.push({ type: key, path: value });
    }
  }
  return { response, text, groups, sitemaps, errors, disallows: (agent, url) => disallowed(groups, agent, url) };
}

export function parseSitemap(url, response) {
  const text = response.text ?? '';
  const root = text.match(/<(urlset|sitemapindex)\b/i)?.[1]?.toLowerCase() ?? '';
  return {
    url,
    ...publicResponse(response),
    kind: root === 'sitemapindex' ? 'index' : root === 'urlset' ? 'urlset' : 'invalid',
    urls: [...text.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc\s*>/gi)].map(match => decodeXml(match[1].trim())).filter(validHttpUrl),
    syntaxError: response.status === 200 && (!root || !/<\/\s*(urlset|sitemapindex)\s*>/i.test(text)),
    truncated: response.truncated
  };
}

export function emptyContext(origin, pages = [], pageResponses = new Map()) {
  const ok = { requestedUrl: origin, finalUrl: origin, status: 200, headers: {}, contentType: 'text/html', contentLength: 0, bytes: new Uint8Array(), text: '', truncated: false, redirects: [], elapsedMs: 0, error: '' };
  return {
    startUrl: origin,
    finalUrl: pages[0]?.url ?? origin,
    origin,
    pages,
    pageResponses,
    targets: new Map(),
    resources: [],
    sitemaps: [],
    bots: { googlebot: ok, oaiSearchBot: ok, perplexityBot: ok },
    robots: { response: ok, text: '', groups: [], sitemaps: [], errors: [], disallows: () => false }
  };
}

function summarizeResponse(response, page) {
  return {
    ...publicResponse(response),
    url: page?.url ?? response.finalUrl,
    isHtml: Boolean(page?.isHtml),
    robots: page?.robots ?? [],
    canonical: page?.canonical ?? [],
    links: page?.links ?? [],
    hreflang: page?.hreflang ?? [],
    lang: page?.htmlAttrs.lang ?? '',
    fingerprint: page?.visibleText.length > 120 ? page.visibleText.toLowerCase().replace(/\d+/g, '#') : '',
    structured: Boolean(page?.structuredNodes.length)
  };
}

function publicResponse(response) {
  return {
    requestedUrl: response.requestedUrl,
    finalUrl: response.finalUrl,
    status: response.status,
    error: response.error,
    redirects: response.redirects,
    contentLength: response.contentLength,
    contentType: response.contentType,
    contentEncoding: response.headers['content-encoding'] ?? '',
    elapsedMs: response.elapsedMs,
    truncated: response.truncated
  };
}

function pageResources(page) {
  return [
    ...page.icons.map(url => ({ url, kind: 'icon', owner: page.url })),
    ...structuredUrls(page).map(url => ({ url, kind: 'structured', owner: page.url })),
    ...page.videos.flatMap(video => [video.src, video.poster, ...video.sources.map(source => source.src)].filter(Boolean).map(value => ({ url: new URL(value, page.url).href, kind: 'video', owner: page.url }))),
    ...page.css.map(url => ({ url, kind: 'css', owner: page.url })),
    ...page.js.map(url => ({ url, kind: 'js', owner: page.url })),
    ...page.imageUrls.map(url => ({ url, kind: 'image', owner: page.url }))
  ];
}

function structuredUrls(page) {
  const keys = new Set(['contentUrl', 'embedUrl', 'thumbnailUrl', 'image', 'logo']);
  return page.structuredNodes.flatMap(node => Object.entries(node).filter(([key]) => keys.has(key)).flatMap(([, value]) => [value].flat().map(item => typeof item === 'string' ? item : item?.contentUrl ?? item?.url)))
    .filter(Boolean).map(value => {
      try { return new URL(value, page.url).href; } catch { return ''; }
    }).filter(Boolean);
}

function mergeResources(items) {
  const resources = new Map();
  for (const item of items) {
    const current = resources.get(item.url) ?? { url: item.url, kinds: [], owners: [] };
    if (!current.kinds.includes(item.kind)) current.kinds.push(item.kind);
    if (!current.owners.includes(item.owner)) current.owners.push(item.owner);
    resources.set(item.url, current);
  }
  return [...resources.values()];
}

function disallowed(groups, agent, value) {
  const url = new URL(value);
  const path = `${url.pathname}${url.search}`;
  const candidates = groups.filter(group => group.agents.some(item => item === '*' || agent.toLowerCase().includes(item)));
  const specific = candidates.filter(group => group.agents.some(item => item !== '*'));
  const matches = (specific.length ? specific : candidates).flatMap(group => group.rules).filter(rule => rule.path && robotsPattern(rule.path).test(path)).sort((a, b) => b.path.length - a.path.length);
  return matches[0]?.type === 'disallow';
}

function robotsPattern(path) {
  const end = path.endsWith('$');
  const escaped = path.replace(/\$$/, '').replace(/[.+?^${}()|[\]\\]/g, '\\$&').replaceAll('*', '.*');
  return new RegExp(`^${escaped}${end ? '$' : ''}`);
}

function squareIcon(bytes) {
  if (bytes.length < 10) return false;
  if (bytes[0] === 0x89 && String.fromCharCode(...bytes.slice(1, 4)) === 'PNG' && bytes.length >= 24) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const width = view.getUint32(16);
    return width === view.getUint32(20) && width >= 8;
  }
  if (String.fromCharCode(...bytes.slice(0, 3)) === 'GIF') {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const width = view.getUint16(6, true);
    return width === view.getUint16(8, true) && width >= 8;
  }
  if (bytes[0] === 0 && bytes[1] === 0 && bytes[2] === 1 && bytes[3] === 0) return true;
  return true;
}

function decodeXml(value) {
  return value.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
}

function validHttpUrl(value) {
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
}

function htmlResponse(response) {
  return /(?:text\/html|application\/xhtml\+xml)/i.test(response.contentType) || /^\s*<!doctype html|^\s*<html/i.test(response.text);
}

function sameOrigin(value, origin) {
  try { return new URL(value).origin === origin; } catch { return false; }
}

function normalize(value) {
  try {
    const url = new URL(value);
    url.hash = '';
    return url.href;
  } catch { return String(value); }
}

function unique(values) {
  return [...new Set(values)];
}

async function safeFetch(value, options) {
  try {
    return await fetchLimited(value, options);
  } catch {
    return { requestedUrl: String(value), finalUrl: String(value), status: 0, headers: {}, contentType: '', contentLength: 0, bytes: new Uint8Array(), text: '', truncated: false, redirects: [], elapsedMs: 0, error: 'blocked_address' };
  }
}

const BOT_AGENTS = {
  googlebot: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  oaiSearchBot: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot',
  perplexityBot: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot'
};
