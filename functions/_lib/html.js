export function parsePage(response) {
  const html = response.text;
  const url = new URL(response.finalUrl);
  const htmlAttrs = attributes(firstTag(html, 'html'));
  const metas = startTags(html, 'meta').map(attributes);
  const linkTags = startTags(html, 'link').map(attributes);
  const anchors = pairedTags(html, 'a').map(item => ({ ...attributes(item.open), text: text(item.body) }));
  const images = startTags(html, 'img').map(attributes);
  const scripts = pairedTags(html, 'script').map(item => ({ ...attributes(item.open), body: item.body }));
  const videos = [
    ...pairedTags(html, 'video').map(item => ({ ...attributes(item.open), sources: startTags(item.body, 'source').map(attributes) })),
    ...pairedTags(html, 'iframe').map(item => ({ ...attributes(item.open), iframe: true, sources: [] }))
  ];
  const titles = pairedTags(html, 'title').map(item => text(item.body));
  const h1 = pairedTags(html, 'h1').map(item => text(item.body));
  const descriptions = metas.filter(meta => meta.name?.toLowerCase() === 'description').map(meta => meta.content ?? '');
  const htmlRobots = directiveTokens(metas.filter(meta => /^(robots|googlebot)$/i.test(meta.name ?? '')).map(meta => meta.content));
  const headerRobots = directiveTokens([response.headers['x-robots-tag']]);
  const robots = [...htmlRobots, ...headerRobots];
  const canonical = linkTags.filter(link => rel(link, 'canonical')).map(link => absolute(link.href, url)).filter(Boolean);
  const hreflang = linkTags.filter(link => rel(link, 'alternate') && link.hreflang).map(link => ({
    language: link.hreflang.toLowerCase(), url: absolute(link.href, url)
  })).filter(item => item.url);
  const links = anchors.map(anchor => ({
    url: absolute(anchor.href, url), rel: tokens(anchor.rel), text: anchor.text
  })).filter(item => item.url);
  const css = linkTags.filter(link => rel(link, 'stylesheet')).map(link => absolute(link.href, url)).filter(Boolean);
  const icons = linkTags.filter(link => tokens(link.rel).some(value => ['icon', 'shortcut', 'apple-touch-icon'].includes(value))).map(link => absolute(link.href, url)).filter(Boolean);
  const js = scripts.map(script => absolute(script.src, url)).filter(Boolean);
  const imageUrls = images.flatMap(image => [absolute(image.src, url), ...srcset(image.srcset, url)]).filter(Boolean);
  const cssImages = [...html.matchAll(/(?:background(?:-image)?\s*:|url\()\s*(?:url\()?\s*["']?([^"')\s]+)["']?\)?/gi)]
    .map(match => absolute(match[1], url)).filter(Boolean);
  const jsonLd = scripts.filter(script => /application\/ld\+json/i.test(script.type ?? '')).flatMap(script => parseJsonLd(script.body));
  const structuredNodes = flattenStructured(jsonLd);
  const structuredByType = new Map();
  for (const node of structuredNodes) for (const type of types(node)) {
    const entries = structuredByType.get(type);
    if (entries) entries.push(node);
    else structuredByType.set(type, [node]);
  }
  const visibleText = text(html.replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' '));

  return {
    ...response,
    url: url.href,
    origin: url.origin,
    isHtml: /(?:text\/html|application\/xhtml\+xml)/i.test(response.contentType) || /^\s*<!doctype html|^\s*<html/i.test(html),
    htmlAttrs,
    metas,
    linkTags,
    anchors,
    images,
    scripts,
    videos,
    titles,
    h1,
    descriptions,
    robots,
    htmlRobots,
    headerRobots,
    canonical,
    hreflang,
    links,
    css,
    icons,
    js,
    imageUrls,
    cssImages,
    jsonLd,
    structuredNodes,
    structuredByType,
    visibleText,
    viewport: metas.find(meta => meta.name?.toLowerCase() === 'viewport')?.content ?? '',
    refresh: metas.find(meta => meta['http-equiv']?.toLowerCase() === 'refresh')?.content ?? '',
    og: Object.fromEntries(metas.filter(meta => meta.property?.startsWith('og:')).map(meta => [meta.property.toLowerCase(), meta.content ?? ''])),
    twitter: Object.fromEntries(metas.filter(meta => meta.name?.startsWith('twitter:')).map(meta => [meta.name.toLowerCase(), meta.content ?? ''])),
    dataNosnippet: (html.match(/\bdata-nosnippet(?:\s|=|>)/gi) ?? []).length,
    notranslate: metas.some(meta => meta.name?.toLowerCase() === 'google' && /notranslate/i.test(meta.content ?? '')) || /\bclass=["'][^"']*\bnotranslate\b/i.test(html),
    ampStory: /<amp-story\b/i.test(html),
    picturesWithoutFallback: pairedTags(html, 'picture').filter(item => startTags(item.body, 'source').some(source => attributes(source).srcset) && !startTags(item.body, 'img').some(image => attributes(image).src)).length,
    hasMicrodata: /\bitemscope(?:\s|=|>)/i.test(html),
    hasRdfa: /\b(?:vocab|typeof)\s*=/i.test(html),
    usesDataVocabulary: /data-vocabulary\.org/i.test(html),
    plugins: /<(?:object|embed|applet)\b/i.test(html),
    smallFonts: [...html.matchAll(/font-size\s*:\s*([\d.]+)(px|pt)/gi)].filter(match => Number(match[1]) < (match[2].toLowerCase() === 'pt' ? 9 : 12)).length,
    dates: dateSignals(metas, html),
    wordCount: visibleText ? visibleText.split(/\s+/).length : 0
  };
}

export function nodesOf(page, type) {
  return page.structuredByType?.get(type) ?? page.structuredNodes.filter(node => types(node).includes(type));
}

export function types(node) {
  return [node?.['@type']].flat().filter(Boolean).map(String);
}

export function get(node, path) {
  return path.split('.').reduce((value, key) => value?.[key], node);
}

export function values(value) {
  return value == null ? [] : Array.isArray(value) ? value : [value];
}

export function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)?$/.test(value) && !Number.isNaN(Date.parse(value));
}

export function validUrl(value, base) {
  try {
    return ['http:', 'https:'].includes(new URL(String(value), base).protocol);
  } catch {
    return false;
  }
}

function firstTag(html, tag) {
  return html.match(new RegExp(`<${tag}\\b([^>]*)>`, 'i'))?.[1] ?? '';
}

function startTags(html, tag) {
  return [...html.matchAll(new RegExp(`<${tag}\\b([^>]*)>`, 'gi'))].map(match => match[1]);
}

function pairedTags(html, tag) {
  return [...html.matchAll(new RegExp(`<${tag}\\b([^>]*)>([\\s\\S]*?)<\\/${tag}\\s*>`, 'gi'))]
    .map(match => ({ open: match[1], body: match[2] }));
}

function attributes(source = '') {
  const result = {};
  for (const match of source.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
    result[match[1].toLowerCase()] = decode(match[2] ?? match[3] ?? match[4] ?? '');
  }
  return result;
}

function text(value = '') {
  return decode(value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

function decode(value) {
  return String(value)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function absolute(value, base) {
  if (!value || /^(?:data:|blob:|javascript:|mailto:|tel:|#)/i.test(value)) return '';
  try {
    const url = new URL(value, base);
    url.hash = '';
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

function srcset(value, base) {
  return String(value ?? '').split(',').map(part => absolute(part.trim().split(/\s+/)[0], base)).filter(Boolean);
}

function tokens(value) {
  return String(value ?? '').toLowerCase().split(/[\s,]+/).filter(Boolean);
}

function rel(attrs, token) {
  return tokens(attrs.rel).includes(token);
}

function directiveTokens(values) {
  return values.filter(Boolean).flatMap(value => String(value).toLowerCase().split(',')).map(value => value.trim().replace(/\s*:\s*/g, ':')).filter(Boolean);
}

function parseJsonLd(source) {
  try {
    const value = JSON.parse(source.replace(/^\s*<!--|-->\s*$/g, '').trim());
    return Array.isArray(value) ? value : [value];
  } catch {
    return [{ __invalid: true, __source: source.slice(0, 500) }];
  }
}

function flattenStructured(items) {
  const nodes = [];
  const seen = new Set();
  const visit = value => {
    if (!value || typeof value !== 'object' || seen.has(value)) return;
    seen.add(value);
    if (value['@type'] || value.__invalid) nodes.push(value);
    for (const [key, child] of Object.entries(value)) if (key !== '__source') values(child).forEach(visit);
  };
  items.forEach(visit);
  return nodes;
}

function dateSignals(metas, html) {
  const metaDates = metas.filter(meta => /date|published|modified|updated/i.test(`${meta.property ?? ''} ${meta.name ?? ''}`)).map(meta => meta.content).filter(Boolean);
  const timeDates = startTags(html, 'time').map(attributes).map(item => item.datetime).filter(Boolean);
  return [...metaDates, ...timeDates];
}
