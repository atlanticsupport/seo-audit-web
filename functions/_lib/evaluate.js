import { RULES } from './rules.generated.js';
import { get, nodesOf, types, validDate, validUrl, values } from './html.js';
import { responseFor } from './collect.js';

const TESTS = new Map();
const add = (codes, test) => codes.forEach(code => TESTS.set(code, test));
const issueFree = (items, issue, applicable = true) => applicable ? !items.some(issue) : null;

export function evaluate(context, excluded) {
  const results = [];
  for (const rule of RULES) {
    if (excluded?.has(rule.code)) continue;
    const test = TESTS.get(rule.code);
    if (!test) continue;
    const ok = test(context);
    if (ok == null) continue;
    results.push({ ...rule, ok: Boolean(ok) });
  }
  return results;
}

export const supportedCodes = () => [...TESTS.keys()].sort();

const htmlPages = context => context.htmlPages ??= context.pages.filter(page => page.isHtml && page.status >= 200 && page.status < 400);
const indexablePages = context => context.indexablePages ??= htmlPages(context).filter(page => !page.robots.includes('noindex'));
const internalResponses = context => unique([
  ...context.pageResponses.values(),
  ...context.targets.values()
]).filter(response => sameOrigin(response.requestedUrl, context.origin));
const asset = (context, kind) => context.resources.filter(item => item.kind === kind || item.kinds?.includes(kind));
const externalResponses = context => [...context.targets.values()].filter(response => !sameOrigin(response.requestedUrl, context.origin));
const redirected = response => response.redirects.length > 0;
const broken = response => response.error || response.status >= 400;
const directive = (page, value) => page.robots.some(item => item === value || item.startsWith(`${value}:`));

add(['HTTP-001'], context => issueFree(internalResponses(context), response => response.status === 404));
add(['HTTP-002'], context => issueFree(internalResponses(context), response => response.status >= 400 && response.status < 500));
add(['HTTP-003'], context => issueFree(internalResponses(context), response => response.status === 500));
add(['HTTP-004'], context => issueFree(internalResponses(context), response => response.status >= 500));
add(['HTTP-005'], context => issueFree(internalResponses(context), response => response.error === 'timeout'));
add(['HTTP-006'], context => issueFree(htmlPages(context), page => page.url.startsWith('https:') && [...page.css, ...page.js, ...page.imageUrls, ...page.links.map(link => link.url)].some(url => url.startsWith('http:'))));

add(['IDX-001'], context => canonicalTargets(context, response => response.status >= 400 && response.status < 500));
add(['IDX-002'], context => canonicalTargets(context, response => response.status >= 500));
add(['IDX-003'], context => canonicalTargets(context, redirected));
add(['IDX-004'], context => issueFree(htmlPages(context), page => page.contentLength > 2_000_000 || (page.truncated && page.bytes.byteLength >= 2_000_000)));
add(['IDX-005'], context => issueFree(htmlPages(context), page => directive(page, 'noindex')));
add(['IDX-006'], context => issueFree(htmlPages(context), page => page.htmlRobots.includes('noindex') && page.headerRobots.includes('noindex')));
add(['IDX-007'], context => issueFree(htmlPages(context), page => page.htmlRobots.includes('nofollow') && page.headerRobots.includes('nofollow')));
add(['IDX-008'], context => issueFree(htmlPages(context), page => directive(page, 'nofollow')));
add(['IDX-009'], context => {
  const targets = htmlPages(context).flatMap(page => page.canonical.map(url => responseFor(context, url))).filter(Boolean);
  return issueFree(targets, response => {
    const target = context.pages.find(page => normalize(page.url) === normalize(response.finalUrl));
    return target?.canonical[0] && normalize(target.canonical[0]) !== normalize(target.url);
  }, targets.length > 0);
});
add(['IDX-010'], context => issueFree(htmlPages(context), page => directive(page, 'noindex') && !directive(page, 'nofollow')));
add(['IDX-011'], context => issueFree(htmlPages(context), page => page.url.startsWith('http:') && page.canonical.some(url => url.startsWith('https:'))));
add(['IDX-012'], context => issueFree(htmlPages(context), page => page.url.startsWith('https:') && page.canonical.some(url => url.startsWith('http:'))));
add(['IDX-015'], context => issueFree(htmlPages(context), page => directive(page, 'noindex') && directive(page, 'nofollow')));

add(['CNT-001', 'CNT-020'], context => issueFree(indexablePages(context), page => page.descriptions.length > 1));
add(['CNT-002', 'CNT-021'], context => issueFree(indexablePages(context), page => page.titles.length > 1));
add(['CNT-003', 'CNT-022'], context => issueFree(indexablePages(context), page => page.titles.length === 0 || page.titles.some(title => !title)));
add(['CNT-004', 'CNT-026'], context => issueFree(indexablePages(context), page => page.descriptions.some(value => value.length > 0 && value.length < 110)));
add(['CNT-005', 'CNT-023'], context => issueFree(indexablePages(context), page => page.h1.length === 0 || page.h1.some(value => !value)));
add(['CNT-007', 'CNT-019'], context => issueFree(indexablePages(context), page => page.descriptions.length === 0 || page.descriptions.some(value => !value)));
add(['CNT-008', 'CNT-025'], context => issueFree(indexablePages(context), page => page.descriptions.some(value => value.length > 160)));
add(['CNT-009', 'CNT-028'], context => issueFree(indexablePages(context), page => page.titles.some(value => value.length > 60 || titlePixels(value) > 600)));
add(['CNT-010', 'CNT-029'], context => issueFree(indexablePages(context), page => page.titles.some(value => value.length > 0 && value.length < 50)));
add(['CNT-013', 'CNT-027'], context => issueFree(indexablePages(context), page => page.h1.length > 1));

add(['DUP-001'], context => {
  const groups = groupBy(indexablePages(context).filter(page => page.visibleText.length > 120), page => page.visibleText.toLowerCase().replace(/\d+/g, '#'));
  return ![...groups.values()].some(pages => pages.length > 1 && pages.some(page => !page.canonical.length));
});

add(['LNK-001'], context => {
  const incoming = incomingLinks(context);
  const canonicals = unique(indexablePages(context).flatMap(page => page.canonical));
  return issueFree(canonicals, url => !incoming.get(normalize(url))?.length, canonicals.length > 0);
});
add(['LNK-002', 'LNK-013'], context => issueFree(htmlPages(context), page => page.url.startsWith('https:') && internalLinks(page, context).some(link => link.url.startsWith('http:'))));
add(['LNK-003', 'LNK-014'], context => {
  const incoming = incomingLinks(context);
  return issueFree(indexablePages(context).filter(page => normalize(page.url) !== normalize(context.finalUrl)), page => !incoming.get(normalize(page.url))?.length);
});
add(['LNK-004', 'LNK-015'], context => linkTargetCheck(context, response => broken(response)));
add(['LNK-005', 'LNK-016'], context => issueFree(htmlPages(context), page => internalLinks(page, context).length === 0));
add(['LNK-006', 'LNK-019'], context => linkTargetCheck(context, redirected));
add(['LNK-007', 'LNK-021'], context => incomingRelCheck(context, links => links.length > 0 && links.every(link => link.rel.includes('nofollow'))));
add(['LNK-008', 'LNK-023'], context => {
  const incoming = incomingLinks(context);
  const responses = internalResponses(context).filter(redirected);
  return issueFree(responses, response => !incoming.get(normalize(response.requestedUrl))?.length, responses.length > 0);
});
add(['LNK-009', 'LNK-018'], context => issueFree(htmlPages(context), page => page.url.startsWith('http:') && internalLinks(page, context).some(link => link.url.startsWith('https:'))));
add(['LNK-010', 'LNK-020'], context => incomingRelCheck(context, links => links.some(link => link.rel.includes('nofollow')) && links.some(link => !link.rel.includes('nofollow'))));
add(['LNK-011', 'LNK-022'], context => issueFree(htmlPages(context), page => internalLinks(page, context).some(link => link.rel.includes('nofollow'))));
add(['LNK-012', 'LNK-017'], context => incomingRelCheck(context, links => links.filter(link => !link.rel.includes('nofollow')).length === 1));

add(['CSS-001'], context => resourceCheck(context, 'css', broken));
add(['CSS-002'], context => resourceCheck(context, 'css', response => response.contentLength > 15_000));
add(['CSS-003'], context => resourceCheck(context, 'css', redirected));
add(['CSS-004'], context => issueFree(htmlPages(context), page => page.url.startsWith('https:') && page.css.some(url => url.startsWith('http:'))));
add(['CSS-005'], context => pageResourceCheck(context, 'css', broken));
add(['CSS-006'], context => pageResourceCheck(context, 'css', redirected));
add(['JSC-001'], context => resourceCheck(context, 'js', broken));
add(['JSC-002'], context => pageResourceCheck(context, 'js', broken));
add(['JSC-003'], context => issueFree(htmlPages(context), page => page.url.startsWith('https:') && page.js.some(url => url.startsWith('http:'))));
add(['JSC-004'], context => resourceCheck(context, 'js', redirected));
add(['JSC-005'], context => pageResourceCheck(context, 'js', redirected));
add(['IMG-001'], context => resourceCheck(context, 'image', response => response.contentLength > 1_000_000));
add(['IMG-002'], context => resourceCheck(context, 'image', broken));
add(['IMG-003'], context => pageResourceCheck(context, 'image', broken));
add(['IMG-004'], context => issueFree(htmlPages(context), page => page.url.startsWith('https:') && page.imageUrls.some(url => url.startsWith('http:'))));
add(['IMG-005'], context => resourceCheck(context, 'image', redirected));
add(['IMG-006'], context => issueFree(htmlPages(context), page => page.images.some(image => !('alt' in image) || !image.alt.trim())));
add(['IMG-007'], context => pageResourceCheck(context, 'image', redirected));

add(['EXT-001'], context => externalCheck(context, response => redirected(response)));
add(['EXT-002'], context => externalCheck(context, response => response.status >= 400 && response.status < 500));
add(['EXT-003'], context => externalCheck(context, response => response.status >= 500));
add(['EXT-004'], context => externalCheck(context, response => response.error === 'timeout'));

add(['RED-001'], context => issueFree(internalResponses(context), response => response.error || (redirected(response) && response.status >= 400)));
add(['RED-002'], context => issueFree(internalResponses(context), response => response.error === 'redirect_limit' || response.redirects.length > 5));
add(['RED-003'], context => issueFree(internalResponses(context), response => hasRedirectLoop(response.redirects)));
add(['RED-004'], context => issueFree(internalResponses(context), redirected));
add(['RED-005'], context => issueFree(internalResponses(context), response => response.redirects.some(item => item.status === 302)));
add(['RED-006'], context => issueFree(internalResponses(context), response => response.redirects.some(item => item.from.startsWith('https:') && item.to.startsWith('http:'))));
add(['RED-007'], context => issueFree(internalResponses(context), response => response.redirects.some(item => item.from.startsWith('http:') && item.to.startsWith('https:'))));
add(['RED-008'], context => issueFree(internalResponses(context), response => response.redirects.length > 1));
add(['RED-009'], context => issueFree(htmlPages(context), page => Boolean(page.refresh)));

add(['SMP-001'], context => sitemapUrlCheck(context, response => redirected(response)));
add(['SMP-002'], context => sitemapUrlCheck(context, response => response.status >= 400 && response.status < 500));
add(['SMP-003'], context => sitemapUrlCheck(context, response => response.status >= 500));
add(['SMP-004'], context => sitemapPageCheck(context, page => page.robots.includes('noindex')));
add(['SMP-005'], context => sitemapPageCheck(context, page => page.canonical[0] && normalize(page.canonical[0]) !== normalize(page.url)));
add(['SMP-006'], context => sitemapUrlCheck(context, response => response.error === 'timeout'));
add(['SMP-007'], context => issueFree(context.sitemaps, sitemap => sitemap.syntaxError, context.sitemaps.length > 0));
add(['SMP-008'], context => context.sitemaps.some(sitemap => sitemap.response.status === 200 && sitemap.kind !== 'invalid'));
add(['SMP-009'], context => issueFree(context.sitemaps, sitemap => sitemap.response.contentLength > 52_428_800, context.sitemaps.length > 0));
add(['SMP-010'], context => {
  const complete = context.sitemaps.filter(sitemap => !sitemap.truncated);
  return issueFree(complete, sitemap => sitemap.urls.length > 50_000, complete.length > 0);
});
add(['SMP-011'], context => issueFree(context.sitemaps, sitemap => sitemap.response.status === 200 && sitemap.kind === 'invalid', context.sitemaps.length > 0));
add(['SMP-012'], context => issueFree(context.sitemaps.filter(item => item.kind === 'urlset'), sitemap => sitemap.urls.some(url => !sitemapScope(url, sitemap.url))));
add(['SMP-013'], context => {
  const urls = sitemapUrls(context);
  return issueFree(indexablePages(context), page => !urls.has(normalize(page.url)), urls.size > 0);
});
add(['SMP-015'], context => {
  const counts = new Map();
  for (const sitemap of context.sitemaps.filter(item => item.kind === 'urlset')) for (const url of sitemap.urls) counts.set(normalize(url), (counts.get(normalize(url)) ?? 0) + 1);
  return ![...counts.values()].some(count => count > 1);
});

add(['SOC-001'], context => issueFree(htmlPages(context), page => ['og:title', 'og:description', 'og:image', 'og:url', 'og:type'].some(key => !page.og[key])));
add(['SOC-002'], context => issueFree(htmlPages(context), page => page.og['og:url'] && page.canonical[0] && normalize(page.og['og:url']) !== normalize(page.canonical[0])));
add(['SOC-003'], context => issueFree(htmlPages(context), page => page.twitter['twitter:card'] && ['twitter:title', 'twitter:description', 'twitter:image'].some(key => !page.twitter[key])));
add(['SOC-004'], context => issueFree(htmlPages(context), page => Object.keys(page.og).length === 0));
add(['SOC-005'], context => issueFree(htmlPages(context), page => Object.keys(page.twitter).length === 0));

add(['UXP-001'], context => issueFree(htmlPages(context), page => page.elapsedMs > 2_000));
add(['UXP-003'], context => issueFree(htmlPages(context), page => page.plugins));
add(['UXP-004'], context => issueFree(htmlPages(context), page => page.smallFonts > 0 || asset(context, 'css').some(item => /font-size\s*:\s*(?:[0-9]|1[01])px/i.test(item.response.text))));
add(['UXP-005'], context => issueFree(htmlPages(context), page => page.contentLength > 2_000_000));
add(['UXP-006'], context => {
  const textResponses = [...htmlPages(context), ...context.resources.filter(item => ['css', 'js'].includes(item.kind)).map(item => item.response)].filter(response => response.contentLength > 1_000);
  return issueFree(textResponses, response => !/(?:br|gzip|deflate|zstd)/i.test(response.headers['content-encoding'] ?? ''));
});
add(['UXP-013'], context => issueFree(htmlPages(context), page => !page.viewport));

add(['OTH-004'], context => issueFree([...htmlPages(context).map(page => page.url), ...htmlPages(context).flatMap(page => page.links.map(link => link.url))], value => new URL(value).pathname.includes('//')));
add(['OTH-006'], context => context.robots.response.status !== 200 || context.robots.errors.length === 0);
add(['OTH-007'], context => !hasRedirectLoop(context.robots.response.redirects) && context.robots.response.error !== 'redirect_limit');
add(['OTH-008'], context => context.robots.response.status === 200);
add(['OTH-012'], context => issueFree(htmlPages(context), page => [...new URL(page.url).searchParams].length > 3));
add(['OTH-017'], context => issueFree(htmlPages(context), page => context.robots.disallows('*', page.url)));

add(['GSA-006'], context => issueFree(indexablePages(context), page => directive(page, 'nosnippet')));
add(['GSA-007'], context => issueFree(indexablePages(context), page => page.robots.some(value => /^max-snippet:(?:0|-?\D|-[2-9])/.test(value))));
add(['GSA-008'], context => issueFree(indexablePages(context), page => page.robots.some(value => /^max-image-preview:(?:none|standard)$/.test(value))));
add(['GSA-009'], context => issueFree(indexablePages(context), page => page.robots.some(value => /^max-video-preview:0$/.test(value))));
add(['GSA-013'], context => issueFree(indexablePages(context), page => page.notranslate));

add(['AIX-002'], context => issueFree(htmlPages(context), page => context.robots.disallows('googlebot', page.url)));
add(['AIX-003'], context => issueFree(htmlPages(context), page => context.robots.disallows('oai-searchbot', page.url) || blockedBot(context.bots.oaiSearchBot)));
add(['AIX-004'], context => issueFree(htmlPages(context), page => context.robots.disallows('perplexitybot', page.url) || blockedBot(context.bots.perplexityBot)));
add(['AIX-005'], context => issueFree(Object.values(context.bots), blockedBot));
add(['AIX-006'], context => issueFree(htmlPages(context), page => directive(page, 'noindex')));
add(['AIX-007'], context => issueFree(htmlPages(context), page => directive(page, 'nosnippet') || page.robots.includes('max-snippet:0') || page.dataNosnippet > 0));
add(['AIX-008'], context => issueFree(htmlPages(context), page => contradictoryDirectives(page.htmlRobots, page.headerRobots)));
add(['AIX-012'], context => issueFree(htmlPages(context), page => (page.canonical[0] && normalize(page.canonical[0]) !== normalize(page.url)) || page.redirects.length > 1));
add(['AIX-013'], context => {
  const urls = sitemapUrls(context);
  return issueFree(indexablePages(context), page => !urls.has(normalize(page.url)), urls.size > 0);
});
add(['AIX-014'], context => TESTS.get('LNK-003')(context));
add(['AIX-015'], context => TESTS.get('DUP-001')(context));

add(['GIM-002'], context => issueFree(htmlPages(context), page => page.picturesWithoutFallback > 0));
add(['GIM-003'], context => resourceCheck(context, 'image', (response, item) => !imageFormat(item.url, response.contentType)));

add(['IDN-001'], context => {
  const home = homePage(context);
  return home ? home.icons.length > 0 : null;
});
add(['IDN-002'], context => {
  const home = homePage(context);
  if (!home?.icons.length) return null;
  const icons = asset(context, 'icon');
  return issueFree(icons, item => broken(item.response) || !squareIcon(item.response.bytes), icons.length > 0);
});
add(['IDN-003'], context => {
  const home = homePage(context);
  return home ? nodesOf(home, 'WebSite').length === 1 : null;
});
add(['IDN-004'], context => {
  const home = homePage(context);
  if (!home) return null;
  const sites = nodesOf(home, 'WebSite');
  return sites.length <= 1 && (!sites[0]?.name || !home.og['og:site_name'] || sites[0].name === home.og['og:site_name']);
});

add(['DAT-002'], context => {
  const pages = htmlPages(context).filter(page => ['Article', 'NewsArticle', 'BlogPosting'].some(type => nodesOf(page, type).length) || page.dates.length);
  return issueFree(pages, page => {
    const article = nodesOf(page, 'Article')[0] ?? nodesOf(page, 'NewsArticle')[0] ?? nodesOf(page, 'BlogPosting')[0];
    return !article?.datePublished || (page.dates.length && !page.dates.includes(article.datePublished));
  }, pages.length > 0);
});
add(['DAT-003'], context => {
  const dates = htmlPages(context).flatMap(page => page.structuredNodes.flatMap(node => [node.datePublished, node.dateModified, node.startDate, node.endDate]).filter(Boolean));
  return issueFree(dates, date => !validDate(date), dates.length > 0);
});

add(['SDG-001'], context => {
  const pages = htmlPages(context).filter(page => page.jsonLd.length || page.hasMicrodata || page.hasRdfa || page.usesDataVocabulary);
  return issueFree(pages, page => page.usesDataVocabulary || page.structuredNodes.some(node => node.__invalid), pages.length > 0);
});
add(['SDG-003', 'SDG-008'], context => {
  const nodes = structured(context).filter(({ node }) => supportedStructuredType(node));
  return issueFree(nodes, ({ node }) => !minimumProperties(node), nodes.length > 0);
});
add(['SDG-004'], context => {
  const resources = asset(context, 'structured');
  return issueFree(resources, item => broken(item.response), resources.length > 0);
});
add(['SDG-005'], context => {
  const groups = groupBy(indexablePages(context).filter(page => page.visibleText.length > 120), page => page.visibleText.toLowerCase().replace(/\d+/g, '#'));
  const duplicates = [...groups.values()].filter(pages => pages.length > 1 && pages.some(page => page.structuredNodes.length));
  return issueFree(duplicates, pages => pages.some(page => page.structuredNodes.length === 0), duplicates.length > 0);
});
add(['SDG-007'], context => {
  const pages = htmlPages(context).filter(page => page.structuredNodes.length > 1);
  return issueFree(pages, page => {
    const ids = new Set(page.structuredNodes.map(node => node['@id']).filter(Boolean));
    return ids.size > 1 && !page.jsonLd.some(root => root?.['@graph']) && !page.structuredNodes.some(node => Object.values(node).some(value => values(value).some(item => item?.['@id'] && ids.has(item['@id']))));
  }, pages.length > 0);
});

add(['EDS-001'], context => typeCheck(context, ['Article', 'NewsArticle', 'BlogPosting'], node => ['headline', 'image', 'datePublished', 'dateModified'].every(key => present(node[key])) && values(node.author).every(author => present(author?.name ?? author))));
add(['EDS-002'], context => typeCheck(context, ['Article', 'NewsArticle', 'BlogPosting'], node => values(node.author).every(author => typeof author === 'object' && ['Person', 'Organization'].some(type => types(author).includes(type)) && present(author.name) && !/[;,]|\b(?:published by|escrito por|por:)\b/i.test(author.name))));
add(['EDS-003'], context => typeCheck(context, ['Article', 'NewsArticle', 'BlogPosting'], node => values(node.image).every(image => {
  const url = typeof image === 'string' ? image : image?.contentUrl ?? image?.url;
  const area = Number(image?.width) * Number(image?.height);
  return validUrl(url) && (!area || area >= 50_000);
})));
add(['EDS-004'], context => {
  const pages = htmlPages(context).filter(page => /(?:[?&](?:page|p)=\d+|\/page\/\d+|\/\d+\/?$)/i.test(page.url) && page.structuredNodes.some(node => ['Article', 'NewsArticle', 'BlogPosting'].some(type => types(node).includes(type))));
  return issueFree(pages, page => page.canonical[0] && normalize(page.canonical[0]) !== normalize(page.url) && !/view-all|all/i.test(page.canonical[0]), pages.length > 0);
});
add(['EDS-005'], context => typeCheck(context, 'BreadcrumbList', node => {
  const items = values(node.itemListElement);
  return items.length >= 2 && items.every((item, index) => Number(item?.position) === index + 1 && present(item?.name ?? item?.item?.name) && (index === items.length - 1 || present(item?.item ?? item?.url)));
}));
add(['EDS-007'], context => typeCheck(context, 'ItemList', node => {
  const items = values(node.itemListElement);
  const itemTypes = items.flatMap(item => types(item?.item ?? item)).filter(type => ['Course', 'Movie', 'Recipe', 'Restaurant'].includes(type));
  return itemTypes.length < 2 || (items.every((item, index) => Number(item?.position) === index + 1) && new Set(itemTypes).size === 1);
}));
add(['EDS-008'], context => typeCheck(context, 'ItemList', node => values(node.itemListElement).every(item => validUrl(item?.url ?? item?.item?.url))));
add(['EDS-009'], context => typeCheck(context, 'ItemList', node => {
  const items = values(node.itemListElement);
  return items.length >= 2 && items.every((item, index) => Number(item?.position) === index + 1 && validUrl(item?.url ?? item?.item?.url));
}));

add(['EDU-001'], context => {
  const pages = htmlPages(context).filter(page => nodesOf(page, 'ItemList').some(list => values(list.itemListElement).some(item => types(item.item ?? item).includes('Course'))));
  return issueFree(pages, page => nodesOf(page, 'Course').length < 3, pages.length > 0);
});
add(['EDU-002'], context => typeCheck(context, 'Course', node => present(node.name) && present(node.description) && String(node.description).length <= 60 && present(node.provider?.name ?? node.provider)));
add(['EDU-003'], context => typeCheck(context, 'Dataset', node => present(node.name) && typeof node.description === 'string' && node.description.length >= 50 && node.description.length <= 5_000));
add(['EDU-004'], context => typeCheck(context, 'DataDownload', node => validUrl(node.contentUrl)));
add(['EDU-005'], context => typeCheck(context, 'Dataset', node => present(node.identifier) && present(node.license) && present(node.creator ?? node.publisher)));
add(['EDU-007'], context => typeCheck(context, ['DiscussionForumPosting', 'SocialMediaPosting', 'Comment'], node => present(node.author?.name ?? node.author) && validDate(node.datePublished) && [node.text, node.image, node.video, node.url].some(present)));
add(['EDU-008'], context => typeCheck(context, ['DiscussionForumPosting', 'SocialMediaPosting'], node => (!node.commentCount || Number(node.commentCount) >= 0) && (!node.url || validUrl(node.url)) && values(node.comment).every(comment => types(comment).includes('Comment'))));
add(['EDU-009'], context => typeCheck(context, 'Quiz', node => {
  const questions = values(node.hasPart);
  return questions.length > 0 && questions.every(question => types(question).includes('Question') && question.eduQuestionType === 'Flashcard' && present(question.text) && values(question.acceptedAnswer).length === 1 && present(values(question.acceptedAnswer)[0]?.text));
}));
add(['EDU-011'], context => typeCheck(context, 'QAPage', node => {
  const question = node.mainEntity;
  const answers = [...values(question?.acceptedAnswer), ...values(question?.suggestedAnswer)];
  return types(question).includes('Question') && Number.isInteger(Number(question.answerCount)) && present(question.text) && (Number(question.answerCount) === 0 || answers.length > 0) && answers.every(answer => present(answer?.text));
}));

add(['SPC-001'], context => typeCheck(context, 'ImageObject', node => validUrl(node.contentUrl ?? node.url) && [node.creator, node.creditText, node.copyrightNotice, node.license].some(present)));
add(['SPC-002'], context => typeCheck(context, 'ImageObject', node => validUrl(node.license) && (!node.acquireLicensePage || validUrl(node.acquireLicensePage))));
add(['SPC-003'], context => typeCheck(context, 'Movie', node => present(node.name) && values(node.image).some(image => validUrl(typeof image === 'string' ? image : image?.contentUrl ?? image?.url))));
add(['SPC-005'], context => typeCheck(context, 'MathSolver', node => {
  const action = values(node.potentialAction).find(item => types(item).includes('SolveMathAction'));
  return action && present(action['mathExpression-input']) && present(action.eduQuestionType);
}));
add(['SPC-006'], context => typeCheck(context, ['SoftwareApplication', 'MobileApplication', 'WebApplication'], node => present(node.name) && present(node.offers?.price) && present(node.aggregateRating ?? node.review)));
add(['SPC-007'], context => typeCheck(context, ['SoftwareApplication', 'MobileApplication', 'WebApplication'], node => !node.applicationCategory || SOFTWARE_CATEGORIES.has(node.applicationCategory)));
add(['SPC-008'], context => typeCheck(context, 'SpeakableSpecification', node => Boolean(node.cssSelector) !== Boolean(node.xpath)));
add(['SPC-009'], context => {
  const entries = structured(context).filter(({ node }) => types(node).includes('SpeakableSpecification'));
  return issueFree(entries, ({ page }) => !/^en(?:-|$)/i.test(page.htmlAttrs.lang ?? '') || !page.structuredNodes.some(node => ['NewsArticle', 'Article'].some(type => types(node).includes(type))), entries.length > 0);
});

add(['BIZ-002'], context => typeCheck(context, 'EmployerAggregateRating', node => types(node.itemReviewed).includes('Organization') && numeric(node.ratingValue) && (numeric(node.ratingCount) || numeric(node.reviewCount))));
add(['BIZ-004'], context => typeCheck(context, 'Event', node => present(node.name) && validDate(node.startDate) && types(node.location).includes('Place') && present(node.location?.name) && present(node.location?.address)));
add(['BIZ-005'], context => typeCheck(context, 'Event', node => (!node.endDate || validDate(node.endDate)) && (!node.eventStatus || String(node.eventStatus).startsWith('https://schema.org/Event')) && values(node.offers).every(offer => validUrl(offer.url) && numeric(offer.price) && present(offer.priceCurrency))));
add(['BIZ-006'], context => typeCheck(context, 'JobPosting', node => present(node.datePosted) && present(node.description) && present(node.hiringOrganization) && present(node.title) && ((node.jobLocationType === 'TELECOMMUTE' && values(node.applicantLocationRequirements).length) || values(node.jobLocation).some(location => present(location?.address?.addressCountry)))));
add(['BIZ-008'], context => typeCheck(context, 'JobPosting', node => !node.validThrough || Date.parse(node.validThrough) >= Date.now()));
add(['BIZ-010'], context => typeCheck(context, LOCAL_BUSINESS_TYPES, node => present(node.name) && present(node.address)));
add(['BIZ-011'], context => typeCheck(context, LOCAL_BUSINESS_TYPES, node => {
  const geo = node.geo;
  const phone = node.telephone;
  const hours = values(node.openingHoursSpecification);
  return (!geo || decimalPlaces(geo.latitude) >= 5 && decimalPlaces(geo.longitude) >= 5) && (!phone || /^\+?[\d ()-]{7,}$/.test(phone)) && hours.every(item => /^\d{2}:\d{2}(?::\d{2})?$/.test(item.opens) && /^\d{2}:\d{2}(?::\d{2})?$/.test(item.closes)) && String(node.priceRange ?? '').length < 100;
}));
add(['BIZ-013'], context => typeCheck(context, 'Organization', node => {
  const logo = node.logo;
  if (!logo) return true;
  const url = typeof logo === 'string' ? logo : logo.contentUrl ?? logo.url;
  return validUrl(url) && (!logo.width || Number(logo.width) >= 112) && (!logo.height || Number(logo.height) >= 112);
}));
add(['BIZ-015'], context => typeCheck(context, 'ProfilePage', node => ['Person', 'Organization'].some(type => types(node.mainEntity).includes(type)) && present(node.mainEntity?.name ?? node.mainEntity?.alternateName)));

add(['RCP-001'], context => typeCheck(context, 'Recipe', node => present(node.name) && values(node.image).some(image => validUrl(typeof image === 'string' ? image : image?.contentUrl ?? image?.url))));
add(['RCP-002'], context => typeCheck(context, 'Recipe', node => ['prepTime', 'cookTime', 'totalTime'].filter(key => node[key]).every(key => /^P(?:\d+D)?(?:T(?:\d+H)?(?:\d+M)?(?:\d+S)?)?$/.test(node[key])) && values(node.recipeInstructions).every(step => present(step?.text ?? step))));
add(['RCP-003'], context => typeCheck(context, 'Recipe', node => !node.nutrition || present(node.recipeYield)));
add(['RCP-004'], context => typeCheck(context, 'ItemList', node => {
  const recipeItems = values(node.itemListElement).filter(item => types(item.item ?? item).includes('Recipe'));
  return recipeItems.length === 0 || recipeItems.every((item, index) => Number(item.position) === index + 1 && validUrl(item.url ?? item.item?.url));
}));
add(['RCP-005'], context => typeCheck(context, 'Review', (node, page) => {
  const nested = page.structuredNodes.some(parent => values(parent.review).includes(node) && present(parent.name));
  return present(node.author?.name ?? node.author) && String(node.author?.name ?? node.author).length < 100 && numeric(node.reviewRating?.ratingValue) && (present(node.itemReviewed) || nested);
}));
add(['RCP-006'], context => typeCheck(context, 'AggregateRating', node => numeric(node.ratingValue) && (numeric(node.ratingCount) || numeric(node.reviewCount))));

add(['PAY-001'], context => {
  const pages = htmlPages(context).filter(page => /paywall|subscriber-only|meteredContent/i.test(page.text) || page.structuredNodes.some(node => node.hasPart || node.isAccessibleForFree === false));
  return issueFree(pages, page => !page.structuredNodes.some(node => node.isAccessibleForFree === false), pages.length > 0);
});
add(['PAY-002'], context => typeCheck(context, ['CreativeWork', 'Article', 'NewsArticle', 'Blog'], node => {
  if (!node.hasPart) return true;
  return values(node.hasPart).every(part => types(part).includes('WebPageElement') && part.isAccessibleForFree === false && /^\.[A-Za-z_-][\w-]*$/.test(part.cssSelector ?? ''));
}));

add(['VAC-001'], context => typeCheck(context, 'VacationRental', node => {
  const place = node.containsPlace;
  return types(place).includes('Accommodation') && Number.isInteger(Number(place?.occupancy?.value)) && present(node.identifier) && present(node.name) && decimalPlaces(node.latitude) >= 5 && decimalPlaces(node.longitude) >= 5 && values(node.image).length >= 8;
}));
add(['VAC-002'], context => typeCheck(context, 'VacationRental', node => (!node.address || /^[A-Z]{2}$/.test(node.address?.addressCountry ?? '')) && (!node.floorSize || ['FTK', 'SQFT', 'MTK', 'SQM'].includes(node.floorSize?.unitCode))));
add(['VAC-003'], context => typeCheck(context, 'VacationRental', node => values(node.review).every(review => validDate(review?.datePublished))));

add(['VDO-001'], context => typeCheck(context, 'VideoObject', node => present(node.name) && values(node.thumbnailUrl).some(url => validUrl(url)) && validDate(node.uploadDate)));
add(['VDO-002'], context => typeCheck(context, 'VideoObject', node => (validUrl(node.contentUrl) || validUrl(node.embedUrl)) && present(node.description) && (!node.duration || /^P(?:\d+D)?(?:T(?:\d+H)?(?:\d+M)?(?:\d+S)?)?$/.test(node.duration))));

add(['VID-001'], context => {
  const pages = htmlPages(context).filter(page => page.videos.length || nodesOf(page, 'VideoObject').length);
  return issueFree(pages, page => page.videos.length === 0, pages.length > 0);
});
add(['VID-004'], context => {
  const pages = htmlPages(context).filter(page => page.videos.length || nodesOf(page, 'VideoObject').length);
  return issueFree(pages, page => page.titles.length !== 1 || page.descriptions.length !== 1, pages.length > 0);
});
add(['VID-005'], context => resourceCheck(context, 'video', (response, item) => !videoFormat(item.url, response.contentType)));
add(['VID-006'], context => resourceCheck(context, 'video', response => broken(response)));
add(['VID-007'], context => typeCheck(context, 'VideoObject', node => values(node.thumbnailUrl).some(url => validUrl(url))));
add(['VID-008'], context => typeCheck(context, 'VideoObject', (node, page) => !page.videos.some(video => video.poster) || values(node.thumbnailUrl).includes(new URL(page.videos.find(video => video.poster).poster, page.url).href)));
add(['VID-009'], context => typeCheck(context, 'VideoObject', node => (!node.contentUrl || !/youtube\.com\/watch|vimeo\.com\//i.test(node.contentUrl)) && (!node.embedUrl || !/\.(?:mp4|webm|m3u8)(?:$|\?)/i.test(node.embedUrl))));
add(['VID-010'], context => typeCheck(context, 'VideoObject', node => {
  const clips = values(node.hasPart).filter(item => types(item).includes('Clip'));
  const actions = values(node.potentialAction).filter(item => types(item).includes('SeekToAction'));
  return clips.every(clip => present(clip.name) && numeric(clip.startOffset) && validUrl(clip.url)) && actions.every(action => String(action.target ?? '').includes('{seek_to_second_number}') && action['startOffset-input'] === 'required name=seek_to_second_number');
}));
add(['VID-011'], context => typeCheck(context, 'VideoObject', node => !node.publication || values(node.publication).every(event => types(event).includes('BroadcastEvent') && event.isLiveBroadcast === true && validDate(event.startDate))));
add(['VID-012'], context => typeCheck(context, 'VideoObject', node => (!node.expires || validDate(node.expires)) && values(node.regionsAllowed).every(region => /^[A-Z]{2}$/.test(region))));

add(['LOC-001'], context => hreflangCheck(context, ({ target }) => target?.canonical[0] && normalize(target.canonical[0]) !== normalize(target.url)));
add(['LOC-002'], context => hreflangCheck(context, ({ annotation, target }) => target?.htmlAttrs.lang && primaryLanguage(annotation.language) !== primaryLanguage(target.htmlAttrs.lang)));
add(['LOC-003'], context => hreflangCheck(context, ({ annotation }) => !validLanguage(annotation.language)));
add(['LOC-004'], context => hreflangCheck(context, ({ response }) => !response || broken(response) || redirected(response)));
add(['LOC-005'], context => issueFree(htmlPages(context), page => page.htmlAttrs.lang && !validLanguage(page.htmlAttrs.lang)));
add(['LOC-006'], context => hreflangCheck(context, ({ page, annotation, target }) => target && !target.hreflang.some(item => normalize(item.url) === normalize(page.url) && item.language === annotation.language)));
add(['LOC-007'], context => {
  const pages = htmlPages(context).filter(page => page.hreflang.length);
  return issueFree(pages, page => page.hreflang.some((item, index) => page.hreflang.findIndex(other => other.language === item.language) !== index), pages.length > 0);
});
add(['LOC-008'], context => {
  const pages = htmlPages(context).filter(page => page.hreflang.length);
  return issueFree(pages, page => page.hreflang.filter(item => item.language !== 'x-default').some(item => page.hreflang.some(other => other.language !== 'x-default' && normalize(other.url) === normalize(item.url) && primaryLanguage(other.language) !== primaryLanguage(item.language))), pages.length > 0);
});
add(['LOC-009'], context => {
  const pages = htmlPages(context).filter(page => page.hreflang.length);
  return issueFree(pages, page => !page.hreflang.some(item => normalize(item.url) === normalize(page.url) && item.language !== 'x-default'), pages.length > 0);
});
add(['LOC-010'], context => {
  const pages = htmlPages(context).filter(page => page.hreflang.length);
  return issueFree(pages, page => !page.htmlAttrs.lang, pages.length > 0);
});
add(['LOC-011'], context => issueFree(htmlPages(context), page => !page.htmlAttrs.lang));
add(['LOC-012'], context => hreflangCheck(context, ({ target }) => !target));
add(['LOC-013'], context => {
  const pages = htmlPages(context).filter(page => page.hreflang.length);
  return issueFree(pages, page => !page.hreflang.some(item => item.language === 'x-default'), pages.length > 0);
});

add(['ECM-002'], context => typeCheck(context, 'Product', node => present(node.name) && present(node.image) && values(node.offers).some(offer => ['Offer', 'AggregateOffer'].some(type => types(offer).includes(type)) && present(offer.price ?? offer.lowPrice) && present(offer.priceCurrency))));
add(['ECM-004'], context => typeCheck(context, 'Product', node => new Set(values(node.offers).map(offer => offer?.priceCurrency).filter(Boolean)).size <= 1));
add(['ECM-005'], context => typeCheck(context, 'Product', node => [node.gtin, node.gtin8, node.gtin12, node.gtin13, node.gtin14, node.mpn, node.sku].some(value => typeof value === 'string' && /^[A-Za-z0-9_-]{4,}$/.test(value))));
add(['ECM-006'], context => typeCheck(context, 'Product', node => !node.category || typeof node.category === 'string' || present(node.category?.name)));
add(['ECM-008'], context => typeCheck(context, 'Offer', node => (!node.availability || SCHEMA_AVAILABILITY.has(node.availability)) && (!node.itemCondition || SCHEMA_CONDITION.has(node.itemCondition))));
add(['ECM-009'], context => typeCheck(context, 'Offer', node =>
  !node.priceSpecification || values(node.priceSpecification).every(price =>
    numeric(price.price) && present(price.priceCurrency) &&
    (!price.validFrom || validDate(price.validFrom)) &&
    (!price.validThrough || validDate(price.validThrough))
  )
));
add(['ECM-010'], context => typeCheck(context, 'UnitPriceSpecification', node => numeric(node.price) && present(node.priceCurrency) && numeric(node.referenceQuantity?.value) && present(node.referenceQuantity?.unitCode)));
add(['ECM-011'], context => typeCheck(context, 'UnitPriceSpecification', node => !node.validForMemberTier || numeric(node.price) && present(node.priceCurrency)));
add(['ECM-012'], context => typeCheck(context, 'LoyaltyPoints', node => numeric(node.points) && Number(node.points) >= 0));
add(['ECM-013'], context => typeCheck(context, 'Product', node => (!node.size || typeof node.size === 'string') && (!node.suggestedAge || present(node.suggestedAge?.minValue ?? node.suggestedAge?.maxValue)) && (!node.suggestedGender || ['Male', 'Female', 'Unisex'].includes(node.suggestedGender))));
add(['ECM-014'], context => typeCheck(context, 'Certification', node => present(node.name) && present(node.certificationIdentification ?? node.identifier) && present(node.issuedBy)));
add(['ECM-015'], context => typeCheck(context, '3DModel', node => validUrl(node.encoding?.contentUrl ?? node.contentUrl) && /model\/(?:gltf\+json|gltf-binary)|application\/octet-stream/i.test(node.encoding?.encodingFormat ?? node.encodingFormat ?? '')));
add(['ECM-016'], context => typeCheck(context, 'ProductGroup', node => !values(node.hasVariant).some(variant => values(variant.offers).some(offer => types(offer).includes('AggregateOffer')))));

add(['PRD-001'], context => typeCheck(context, 'Product', node => present(node.name) && present(node.image) && present(node.offers ?? node.review ?? node.aggregateRating)));
add(['PRD-002'], context => typeCheck(context, 'Product', node => present(node.aggregateRating)));
add(['PRD-003'], context => typeCheck(context, 'Product', node => present(node.review)));
add(['PRD-004'], context => typeCheck(context, ['Offer', 'AggregateOffer'], node => numeric(node.price ?? node.lowPrice) && /^[A-Z]{3}$/.test(node.priceCurrency ?? '')));

add(['MER-001'], context => typeCheck(context, 'OfferShippingDetails', node => present(node.deliveryTime?.handlingTime)));
add(['MER-002'], context => typeCheck(context, 'Product', node => values(node.offers).every(offer => present(offer?.shippingDetails))));
add(['MER-003'], context => typeCheck(context, 'OfferShippingDetails', node => present(node.shippingDestination) && present(node.deliveryTime) && present(node.shippingRate)));
add(['MER-004'], context => typeCheck(context, 'Product', node => values(node.offers).every(offer => present(offer?.hasMerchantReturnPolicy))));
add(['MER-005'], context => typeCheck(context, 'MerchantReturnPolicy', returnPolicyValid));

add(['RET-001'], context => typeCheck(context, 'MerchantReturnPolicy', node => (!node.merchantReturnLink || validUrl(node.merchantReturnLink)) && values(node.applicableCountry).every(country => /^[A-Z]{2}$/.test(country))));
add(['RET-002'], context => typeCheck(context, 'MerchantReturnPolicy', node => !node.returnFees || RETURN_FEES.has(node.returnFees)));
add(['RET-003'], context => typeCheck(context, 'MerchantReturnPolicy', node => values(node.returnMethod).every(value => RETURN_METHODS.has(value)) && values(node.itemCondition).every(value => SCHEMA_CONDITION.has(value)) && (!node.refundType || values(node.refundType).every(value => REFUND_TYPES.has(value)))));
add(['RET-004'], context => typeCheck(context, 'MerchantReturnPolicy', node => values(node.returnPolicySeasonalOverride).every(item => validDate(item.startDate) && validDate(item.endDate) && (numeric(item.merchantReturnDays) || present(item.returnPolicyCategory)))));
add(['RET-005'], context => typeCheck(context, 'MerchantReturnPolicy', (node, page) => types(node).includes('MerchantReturnPolicy') && (nodesOf(page, 'Organization').length > 0 || nodesOf(page, 'Offer').some(offer => values(offer.hasMerchantReturnPolicy).includes(node)))));

add(['SHP-001'], context => typeCheck(context, 'MerchantShippingPolicy', node => present(node.shippingDestination) || present(node.shippingConditions)));
add(['SHP-002'], context => typeCheck(context, 'MerchantShippingPolicy', node => present(node.shippingDestination ?? node.shippingConditions)));
add(['SHP-003'], context => typeCheck(context, 'DefinedRegion', node => values(node.addressCountry).every(country => /^[A-Z]{2}$/.test(country)) && values(node.addressRegion).every(present)));
add(['SHP-004'], context => typeCheck(context, 'ShippingDeliveryTime', node => durationRange(node.handlingTime) && durationRange(node.transitTime)));
add(['SHP-005'], context => typeCheck(context, ['MonetaryAmount', 'ShippingRateSettings'], node => !('value' in node) || numeric(node.value) && Number(node.value) >= 0 && present(node.currency)));
add(['SHP-006'], context => typeCheck(context, 'ShippingConditions', node => !node.doesNotShip || !node.shippingRate && !node.deliveryTime));
add(['SHP-007'], context => typeCheck(context, 'ShippingService', node => !node.shippingConditions || values(node.shippingConditions).some(condition => condition.doesNotShip !== true)));
add(['SHP-008'], context => typeCheck(context, 'OfferShippingDetails', node => values(node.shippingRate).length <= 1 && values(node.deliveryTime).length <= 1));

add(['LOY-001'], context => typeCheck(context, 'LoyaltyProgram', node => present(node.name) && values(node.hasTiers ?? node.member).length > 0));
add(['LOY-002'], context => typeCheck(context, 'MemberProgramTier', node => present(node.name) && values(node.hasTierBenefit).length > 0));
add(['LOY-003'], context => typeCheck(context, 'TierBenefitEnumeration', node => present(node.name ?? node['@id'])));

add(['VAR-001'], context => typeCheck(context, 'ProductGroup', node => values(node.hasVariant).every(variant => present(variant.sku ?? variant.gtin ?? variant.mpn))));
add(['VAR-002'], context => typeCheck(context, 'ProductGroup', node => present(node.productGroupID) && values(node.hasVariant).every(variant => !variant.inProductGroupWithID || variant.inProductGroupWithID === node.productGroupID)));
add(['VAR-003'], context => typeCheck(context, 'ProductGroup', node => values(node.hasVariant).every(variant => validUrl(variant.url))));
add(['VAR-004'], context => typeCheck(context, 'ProductGroup', (_node, page) => !page.canonical[0] || normalize(page.canonical[0]) === normalize(page.url)));
add(['VAR-005'], context => typeCheck(context, 'Product', node => !node.inProductGroupWithID || present(node.name) && present(node.offers) && present(node.sku ?? node.gtin ?? node.mpn)));
add(['VAR-006'], context => typeCheck(context, 'ProductGroup', node => values(node.variesBy).every(value => VARIES_BY.has(value))));

add(['WST-002'], context => {
  const pages = htmlPages(context).filter(page => page.ampStory);
  return issueFree(pages, page => !/\b(?:publisher|publisher-logo-src|poster-portrait-src|title)\s*=/i.test(page.text), pages.length > 0);
});
add(['WST-003'], context => {
  const pages = htmlPages(context).filter(page => page.ampStory);
  return issueFree(pages, page => page.canonical.length !== 1 || normalize(page.canonical[0]) !== normalize(page.url), pages.length > 0);
});
add(['WST-004'], context => {
  const pages = htmlPages(context).filter(page => page.ampStory);
  if (!pages.length) return null;
  const incoming = incomingLinks(context);
  return issueFree(pages, page => directive(page, 'noindex') || !incoming.get(normalize(page.url))?.length);
});
add(['WST-005'], context => {
  const pages = htmlPages(context).filter(page => page.ampStory);
  return issueFree(pages, page => !/\bposter-portrait-src\s*=/.test(page.text) || !/\bpublisher-logo-src\s*=/.test(page.text) || !/\btitle\s*=/.test(page.text), pages.length > 0);
});

function canonicalTargets(context, issue) {
  const responses = htmlPages(context).flatMap(page => page.canonical.map(url => responseFor(context, url))).filter(Boolean);
  return issueFree(responses, issue, responses.length > 0);
}

function linkTargetCheck(context, issue) {
  const responses = htmlPages(context).flatMap(page => internalLinks(page, context).map(link => responseFor(context, link.url))).filter(Boolean);
  return issueFree(unique(responses), issue, responses.length > 0);
}

function incomingLinks(context) {
  const incoming = new Map();
  for (const page of htmlPages(context)) for (const link of internalLinks(page, context)) {
    const key = normalize(link.url);
    incoming.set(key, [...(incoming.get(key) ?? []), { ...link, source: page.url }]);
  }
  return incoming;
}

function incomingRelCheck(context, issue) {
  const incoming = incomingLinks(context);
  const entries = indexablePages(context).filter(page => incoming.has(normalize(page.url)));
  return issueFree(entries, page => issue(incoming.get(normalize(page.url))), entries.length > 0);
}

function internalLinks(page, context) {
  return page.links.filter(link => sameOrigin(link.url, context.origin));
}

function resourceCheck(context, kind, issue) {
  const items = asset(context, kind);
  return issueFree(items, item => issue(item.response, item), items.length > 0);
}

function pageResourceCheck(context, kind, issue) {
  const items = asset(context, kind);
  if (!items.length) return null;
  return issueFree(items, item => issue(item.response, item));
}

function externalCheck(context, issue) {
  const responses = externalResponses(context);
  return issueFree(responses, issue, responses.length > 0);
}

function sitemapUrlCheck(context, issue) {
  const sitemap = sitemapUrls(context);
  const responses = [...sitemap].map(url => responseFor(context, url)).filter(Boolean);
  return issueFree(responses, issue, responses.length > 0);
}

function sitemapPageCheck(context, issue) {
  const sitemap = sitemapUrls(context);
  const pages = htmlPages(context).filter(page => sitemap.has(normalize(page.url)));
  return issueFree(pages, issue, pages.length > 0);
}

function sitemapUrls(context) {
  return new Set(context.sitemaps.filter(item => item.kind === 'urlset').flatMap(item => item.urls.map(normalize)));
}

function sitemapScope(value, sitemap) {
  const target = new URL(value);
  const source = new URL(sitemap);
  const directory = source.pathname.slice(0, source.pathname.lastIndexOf('/') + 1);
  return target.origin === source.origin && target.pathname.startsWith(directory);
}

function hreflangCheck(context, issue) {
  const entries = htmlPages(context).flatMap(page => page.hreflang.map(annotation => ({
    page,
    annotation,
    response: responseFor(context, annotation.url),
    target: htmlPages(context).find(target => normalize(target.url) === normalize(annotation.url))
  })));
  return issueFree(entries, issue, entries.length > 0);
}

function structured(context) {
  return context.structuredEntries ??= htmlPages(context).flatMap(page => page.structuredNodes.map(node => ({ node, page })));
}

function structuredTypes(context) {
  return context.structuredTypes ??= new Set(structured(context).flatMap(({ node }) => types(node)));
}

function typeCheck(context, requestedTypes, valid) {
  const wanted = values(requestedTypes);
  if (!wanted.some(type => structuredTypes(context).has(type))) return null;
  const entries = structured(context).filter(({ node }) => types(node).some(type => wanted.includes(type)));
  return issueFree(entries, ({ node, page }) => !valid(node, page), entries.length > 0);
}

function supportedStructuredType(node) {
  return types(node).some(type => REQUIRED[type]);
}

function minimumProperties(node) {
  const type = types(node).find(value => REQUIRED[value]);
  return !type || REQUIRED[type].every(path => present(get(node, path)));
}

function returnPolicyValid(node) {
  return values(node.applicableCountry).every(country => /^[A-Z]{2}$/.test(country)) && present(node.returnPolicyCategory) && (node.returnPolicyCategory !== 'https://schema.org/MerchantReturnFiniteReturnWindow' || numeric(node.merchantReturnDays));
}

function durationRange(value) {
  return value && numeric(value.minValue) && numeric(value.maxValue) && Number(value.minValue) <= Number(value.maxValue) && present(value.unitCode);
}

function blockedBot(response) {
  return !response || [401, 403, 429, 503].includes(response.status) || /(?:captcha|challenge-platform|cf-chl-|access denied|verify you are human)/i.test(response.text ?? '');
}

function contradictoryDirectives(html, header) {
  return (html.includes('index') && header.includes('noindex')) || (html.includes('noindex') && header.includes('index')) || (html.includes('follow') && header.includes('nofollow')) || (html.includes('nofollow') && header.includes('follow'));
}

function homePage(context) {
  return htmlPages(context).find(page => new URL(page.url).pathname === '/') ?? htmlPages(context)[0];
}

function hasRedirectLoop(redirects) {
  const urls = redirects.flatMap(item => [normalize(item.from), normalize(item.to)]);
  return new Set(urls).size < urls.length - 1;
}

function imageFormat(url, contentType) {
  return /image\/(?:avif|gif|jpeg|png|svg\+xml|webp|x-icon|vnd\.microsoft\.icon)/i.test(contentType) || /\.(?:avif|gif|ico|jpe?g|png|svg|webp)(?:$|\?)/i.test(url);
}

function videoFormat(url, contentType) {
  return /video\/(?:mp4|mpeg|ogg|quicktime|webm)/i.test(contentType) || /application\/(?:vnd\.apple\.mpegurl|x-mpegurl)/i.test(contentType) || /\.(?:m3u8|mp4|mov|mpeg|ogv|webm)(?:$|\?)/i.test(url);
}

function squareIcon(bytes) {
  if (bytes.length < 24) return false;
  if (bytes[0] === 0x89 && String.fromCharCode(...bytes.slice(1, 4)) === 'PNG') {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const width = view.getUint32(16);
    const height = view.getUint32(20);
    return width === height && width >= 8;
  }
  if (String.fromCharCode(...bytes.slice(0, 3)) === 'GIF') {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const width = view.getUint16(6, true);
    const height = view.getUint16(8, true);
    return width === height && width >= 8;
  }
  if (bytes[0] === 0 && bytes[1] === 0 && bytes[2] === 1 && bytes[3] === 0) return true;
  return true;
}

function titlePixels(value) {
  return [...value].reduce((width, char) => width + (/\s/.test(char) ? 4 : /[ilI1.,'|]/.test(char) ? 4.5 : /[MW@#%]/.test(char) ? 12 : /[A-Z0-9]/.test(char) ? 9 : 7.5), 0);
}

function validLanguage(value) {
  return value === 'x-default' || /^[a-z]{2,3}(?:-[A-Z][a-z]{3})?(?:-(?:[A-Z]{2}|\d{3}))?$/i.test(value);
}

function primaryLanguage(value) {
  return String(value ?? '').split('-')[0].toLowerCase();
}

function decimalPlaces(value) {
  return String(value ?? '').split('.')[1]?.length ?? 0;
}

function present(value) {
  return value !== undefined && value !== null && value !== '' && (!Array.isArray(value) || value.length > 0);
}

function numeric(value) {
  return value !== '' && value != null && Number.isFinite(Number(value));
}

function sameOrigin(value, origin) {
  try { return new URL(value).origin === origin; } catch { return false; }
}

function normalize(value) {
  try {
    const url = new URL(value);
    url.hash = '';
    url.hostname = url.hostname.toLowerCase();
    if ((url.protocol === 'https:' && url.port === '443') || (url.protocol === 'http:' && url.port === '80')) url.port = '';
    if (url.pathname !== '/') url.pathname = url.pathname.replace(/\/$/, '');
    return url.href;
  } catch { return String(value); }
}

function unique(items) {
  return [...new Set(items)];
}

function groupBy(items, key) {
  const groups = new Map();
  for (const item of items) groups.set(key(item), [...(groups.get(key(item)) ?? []), item]);
  return groups;
}

const SOFTWARE_CATEGORIES = new Set(['GameApplication', 'SocialNetworkingApplication', 'TravelApplication', 'ShoppingApplication', 'SportsApplication', 'LifestyleApplication', 'BusinessApplication', 'DesignApplication', 'DeveloperApplication', 'DriverApplication', 'EducationalApplication', 'HealthApplication', 'FinanceApplication', 'SecurityApplication', 'BrowserApplication', 'CommunicationApplication', 'DesktopEnhancementApplication', 'EntertainmentApplication', 'MultimediaApplication', 'HomeApplication', 'UtilitiesApplication', 'ReferenceApplication']);
const LOCAL_BUSINESS_TYPES = ['LocalBusiness', 'Store', 'Restaurant', 'Hotel', 'ProfessionalService', 'MedicalBusiness', 'FoodEstablishment', 'LodgingBusiness'];
const SCHEMA_AVAILABILITY = new Set(['https://schema.org/BackOrder', 'https://schema.org/Discontinued', 'https://schema.org/InStock', 'https://schema.org/InStoreOnly', 'https://schema.org/LimitedAvailability', 'https://schema.org/OnlineOnly', 'https://schema.org/OutOfStock', 'https://schema.org/PreOrder', 'https://schema.org/PreSale', 'https://schema.org/SoldOut']);
const SCHEMA_CONDITION = new Set(['https://schema.org/DamagedCondition', 'https://schema.org/NewCondition', 'https://schema.org/RefurbishedCondition', 'https://schema.org/UsedCondition']);
const RETURN_FEES = new Set(['https://schema.org/FreeReturn', 'https://schema.org/ReturnFeesCustomerResponsibility', 'https://schema.org/ReturnShippingFees']);
const RETURN_METHODS = new Set(['https://schema.org/ReturnAtKiosk', 'https://schema.org/ReturnByMail', 'https://schema.org/ReturnInStore']);
const REFUND_TYPES = new Set(['https://schema.org/ExchangeRefund', 'https://schema.org/FullRefund', 'https://schema.org/StoreCreditRefund']);
const VARIES_BY = new Set(['https://schema.org/color', 'https://schema.org/size', 'https://schema.org/suggestedAge', 'https://schema.org/suggestedGender', 'https://schema.org/material', 'https://schema.org/pattern']);
const REQUIRED = {
  BreadcrumbList: ['itemListElement'], Course: ['name', 'description'], Dataset: ['name', 'description'],
  EmployerAggregateRating: ['itemReviewed', 'ratingValue'], Event: ['name', 'startDate', 'location'],
  JobPosting: ['datePosted', 'description', 'hiringOrganization', 'title'], LocalBusiness: ['name', 'address'],
  Movie: ['name', 'image'], Product: ['name'], ProfilePage: ['mainEntity'], QAPage: ['mainEntity'], Recipe: ['name', 'image'],
  Review: ['author', 'reviewRating.ratingValue'], SoftwareApplication: ['name', 'offers.price'],
  VacationRental: ['containsPlace', 'identifier', 'name', 'latitude', 'longitude', 'image'], VideoObject: ['name', 'thumbnailUrl', 'uploadDate']
};
