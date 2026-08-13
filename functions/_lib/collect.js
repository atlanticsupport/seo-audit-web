import { fetchLimited, publicUrl } from './net.js';
import { parsePage } from './html.js';

const MAX_PAGES = 8;
const MAX_SITEMAPS = 3;
const MAX_TARGETS = 10;
const MAX_ASSETS = 10;

export async function collectSite(value) {
  const start = publicUrl(value);
  const robotsUrl = new URL('/robots.txt', start).href;
  const [firstResponse, robotsResponse] = await Promise.all([
    fetchLimited(start, { maxBytes: 2_100_000 }),
    fetchLimited(robotsUrl, { maxBytes: 600_000, accept: 'text/plain,*/*;q=0.5' })
  ]);
  if (!firstResponse.status && firstResponse.error) throw new Error('Não foi possível aceder ao URL indicado.');

  const origin = new URL(firstResponse.finalUrl).origin;
  const robots = parseRobots(robotsResponse);
  const sitemapSeeds = [...new Set([...robots.sitemaps, new URL('/sitemap.xml', origin).href])].slice(0, MAX_SITEMAPS);
  const sitemapResponses = await Promise.all(sitemapSeeds.map(url => safeFetch(url, { maxBytes: 1_100_000, accept: 'application/xml,text/xml,*/*;q=0.5' })));
  const sitemaps = sitemapResponses.map((response, index) => parseSitemap(sitemapSeeds[index], response));
  const childSitemaps = sitemaps.flatMap(sitemap => sitemap.kind === 'index' ? sitemap.urls : []).slice(0, Math.max(0, MAX_SITEMAPS - sitemaps.length));
  for (const response of await Promise.all(childSitemaps.map(url => safeFetch(url, { maxBytes: 1_100_000, accept: 'application/xml,text/xml,*/*;q=0.5' })))) {
    sitemaps.push(parseSitemap(response.requestedUrl, response));
  }

  const pages = [];
  const pageResponses = new Map([[normalize(firstResponse.requestedUrl), firstResponse], [normalize(firstResponse.finalUrl), firstResponse]]);
  const queued = new Set([normalize(firstResponse.finalUrl)]);
  const queue = [firstResponse];
  const sitemapPageUrls = sitemaps.flatMap(sitemap => sitemap.kind === 'urlset' ? sitemap.urls : []).filter(url => sameOrigin(url, origin));

  while (queue.length && pages.length < MAX_PAGES) {
    const response = queue.shift();
    if (!response?.text || !htmlResponse(response)) continue;
    const page = parsePage(response);
    pages.push(page);
    const candidates = [...page.links.map(link => link.url), ...sitemapPageUrls]
      .filter(url => sameOrigin(url, origin) && likelyPage(url))
      .map(normalize)
      .filter(url => !queued.has(url));
    const batch = candidates.slice(0, Math.min(3, MAX_PAGES - pages.length));
    batch.forEach(url => queued.add(url));
    const fetched = await Promise.all(batch.map(url => safeFetch(url, { maxBytes: 2_100_000 })));
    for (const item of fetched) {
      pageResponses.set(normalize(item.requestedUrl), item);
      pageResponses.set(normalize(item.finalUrl), item);
      queue.push(item);
    }
  }

  const allLinks = unique(pages.flatMap(page => page.links.map(link => link.url)));
  const uncheckedInternal = allLinks.filter(url => sameOrigin(url, origin) && !pageResponses.has(normalize(url))).slice(0, MAX_TARGETS);
  const external = allLinks.filter(url => !sameOrigin(url, origin)).slice(0, 5);
  const targetResponses = await Promise.all([...uncheckedInternal, ...external].map(url => safeFetch(url, { maxBytes: 50_000 })));
  const targets = new Map(targetResponses.map(response => [normalize(response.requestedUrl), response]));

  const assets = unique(pages.flatMap(page => [
    ...page.css.map(url => ({ url, kind: 'css' })),
    ...page.js.map(url => ({ url, kind: 'js' })),
    ...page.icons.map(url => ({ url, kind: 'icon' })),
    ...page.imageUrls.map(url => ({ url, kind: 'image' })),
    ...structuredUrls(page).map(url => ({ url, kind: 'structured' })),
    ...page.videos.flatMap(video => [video.src, video.poster, ...video.sources.map(source => source.src)].filter(Boolean).map(url => ({ url: new URL(url, page.url).href, kind: 'video' })))
  ]), item => item.url).slice(0, MAX_ASSETS);
  const assetResponses = await Promise.all(assets.map(asset => safeFetch(asset.url, {
    maxBytes: asset.kind === 'css' || asset.kind === 'js' ? 500_000 : 70_000,
    headers: asset.kind === 'image' || asset.kind === 'video' ? { range: 'bytes=0-65535' } : undefined,
    accept: '*/*'
  })));
  const resources = assets.map((asset, index) => ({ ...asset, response: assetResponses[index] }));

  const botEntries = await Promise.all(Object.entries({
    googlebot: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    oaiSearchBot: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot',
    perplexityBot: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot'
  }).map(async ([name, userAgent]) => [name, await safeFetch(start, { userAgent, maxBytes: 100_000 })]));

  return {
    startUrl: start.href,
    finalUrl: firstResponse.finalUrl,
    origin,
    pages,
    pageResponses,
    targets,
    resources,
    robots,
    sitemaps,
    bots: Object.fromEntries(botEntries),
    sampled: pages.length >= MAX_PAGES || sitemapPageUrls.length > pages.length || allLinks.length > uncheckedInternal.length + pages.length + external.length,
    limits: { pages: MAX_PAGES, targets: MAX_TARGETS, assets: MAX_ASSETS }
  };
}

export function responseFor(context, url) {
  return context.pageResponses.get(normalize(url)) ?? context.targets.get(normalize(url)) ?? context.resources.find(item => normalize(item.url) === normalize(url))?.response;
}

function parseRobots(response) {
  const text = response.text ?? '';
  const lines = text.split(/\r?\n/);
  const groups = [];
  const sitemaps = [];
  const errors = [];
  let group;

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index].replace(/\s+#.*$/, '').trim();
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

function disallowed(groups, agent, value) {
  const path = `${new URL(value).pathname}${new URL(value).search}`;
  const candidates = groups.filter(group => group.agents.some(item => item === '*' || agent.toLowerCase().includes(item)));
  const specific = candidates.filter(group => group.agents.some(item => item !== '*'));
  const matches = (specific.length ? specific : candidates).flatMap(group => group.rules)
    .filter(rule => rule.path && robotsPattern(rule.path).test(path))
    .sort((a, b) => b.path.length - a.path.length);
  return matches[0]?.type === 'disallow';
}

function robotsPattern(path) {
  const end = path.endsWith('$');
  const escaped = path.replace(/\$$/, '').replace(/[.+?^${}()|[\]\\]/g, '\\$&').replaceAll('*', '.*');
  return new RegExp(`^${escaped}${end ? '$' : ''}`);
}

function parseSitemap(url, response) {
  const text = response.text ?? '';
  const root = text.match(/<(urlset|sitemapindex)\b/i)?.[1]?.toLowerCase() ?? '';
  const urls = [...text.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc\s*>/gi)].map(match => decodeXml(match[1].trim())).filter(validHttpUrl);
  return {
    url,
    response,
    kind: root === 'sitemapindex' ? 'index' : root === 'urlset' ? 'urlset' : 'invalid',
    urls,
    syntaxError: response.status === 200 && (!root || !/<\/\s*(urlset|sitemapindex)\s*>/i.test(text)),
    truncated: response.truncated
  };
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

function likelyPage(value) {
  try { return !/\.(?:avif|css|gif|ico|jpe?g|js|json|mp3|mp4|pdf|png|svg|webm|webp|woff2?|xml|zip)$/i.test(new URL(value).pathname); } catch { return false; }
}

function sameOrigin(value, origin) {
  try { return new URL(value).origin === origin; } catch { return false; }
}

function normalize(value) {
  try {
    const url = new URL(value);
    url.hash = '';
    return url.href;
  } catch {
    return String(value);
  }
}

function unique(values, key = value => value) {
  return [...new Map(values.map(value => [key(value), value])).values()];
}

function structuredUrls(page) {
  const keys = new Set(['contentUrl', 'embedUrl', 'thumbnailUrl', 'image', 'logo']);
  return page.structuredNodes.flatMap(node => Object.entries(node).filter(([key]) => keys.has(key)).flatMap(([, value]) => [value].flat().map(item => typeof item === 'string' ? item : item?.contentUrl ?? item?.url)))
    .filter(Boolean).map(value => {
      try { return new URL(value, page.url).href; } catch { return ''; }
    }).filter(Boolean);
}

async function safeFetch(value, options) {
  try {
    return await fetchLimited(value, options);
  } catch {
    return {
      requestedUrl: String(value), finalUrl: String(value), status: 0, headers: {}, contentType: '', contentLength: 0,
      bytes: new Uint8Array(), text: '', truncated: false, redirects: [], elapsedMs: 0, error: 'blocked_address'
    };
  }
}
