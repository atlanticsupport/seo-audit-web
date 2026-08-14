const form = document.querySelector('#audit-form');
const input = document.querySelector('#url');
const button = form.querySelector('.primary');
const notice = document.querySelector('#notice');
const results = document.querySelector('#results');
const download = document.querySelector('#download-report');
const gscConnect = document.querySelector('#gsc-connect');
const viewContent = document.querySelector('.view-content');
const viewTabs = [...document.querySelectorAll('.view-tab')];
const rulesPromise = fetch('/supported-rules.json').then(response => response.json());
const GSC_ORIGIN = 'https://seo-gsc-oauth.support-e04.workers.dev';
const MAX_PAGES = 50_000;
const MAX_EXTERNAL = 10_000;
const PAGE_CONCURRENCY = 12;
const FETCH_BATCH_SIZE = 20;
const FETCH_CONCURRENCY = 6;
const OPTIONAL_CODES = new Set(['PRD-002', 'PRD-003']);
const liveRows = new WeakMap();
let run = 0;
let reportUrl = '';
let auditState = {};

for (const tab of viewTabs) tab.addEventListener('click', () => switchView(tab.dataset.view));
document.querySelector('.view-tabs').addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  event.preventDefault();
  const current = viewTabs.findIndex(tab => tab.classList.contains('active'));
  const next = (current + (event.key === 'ArrowRight' ? 1 : -1) + viewTabs.length) % viewTabs.length;
  switchView(viewTabs[next].dataset.view);
  viewTabs[next].focus();
});
switchView('checks');

const oauth = new URLSearchParams(location.hash.slice(1)).get('gsc');
if (oauth) {
  sessionStorage.setItem('gsc-session', oauth);
  history.replaceState(null, '', `${location.pathname}${location.search}`);
}
setGscConnected(Boolean(sessionStorage.getItem('gsc-session')));
gscConnect.addEventListener('click', () => {
  if (sessionStorage.getItem('gsc-session')) {
    if (!window.confirm('Confirmar a desassociação do Google Search Console?')) return;
    disconnectGsc();
    return;
  }
  location.href = `${GSC_ORIGIN}/oauth/start?return_to=${encodeURIComponent(`${location.origin}${location.pathname}`)}`;
});
rulesPromise.then(rules => { if (!run) renderLoading(rules, false); });

input.addEventListener('input', () => input.setCustomValidity(''));

form.addEventListener('submit', async event => {
  event.preventDefault();
  const current = ++run;
  let url;
  try {
    url = normalizeInput(input.value);
    input.setCustomValidity('');
  } catch {
    input.setCustomValidity('Indica um domínio ou URL válido.');
    input.reportValidity();
    return;
  }

  const rules = await rulesPromise;
  const rows = renderLoading(rules);
  const failures = new Map();
  liveRows.set(failures, rows);
  button.disabled = true;
  download.hidden = true;
  download.removeAttribute('href');
  resetRanking();
  showNotice('A mapear páginas, recursos e sinais de pesquisa…');

  try {
    const bootstrap = await post({ action: 'bootstrap', url });
    ensureCurrent(current);
    input.value = bootstrap.root.replace(/^https?:\/\//, '');
    addFailures(failures, bootstrap.failures);

    const origin = bootstrap.origin;
    const gscPromise = loadGsc(bootstrap.root).catch(error => ({ error: error.message }));
    const sitemapItems = await crawlSitemaps(bootstrap.sitemapSeeds, origin, current);
    const sitemapUrls = new Set(sitemapItems.filter(item => item.kind === 'urlset').flatMap(item => item.urls).filter(url => sameOrigin(url, origin) && likelyPage(url)).map(normalize));
    const pageData = await crawlPages(bootstrap.root, origin, sitemapUrls, failures, current);
    const [resourceFacts, , performance] = await Promise.all([
      inspectResources(pageData.resources, failures, current),
      inspectExternal(pageData.external, failures, current),
      loadPerformance(bootstrap.root, pageData.pages).catch(error => ({ error: error.message, pages: [], crux: null }))
    ]);
    ensureCurrent(current);
    applyGraphChecks(failures, pageData.pages, sitemapItems, sitemapUrls, bootstrap.root, origin, resourceFacts);
    applyPerformanceFailures(failures, performance);
    finishRows(rows, failures);
    showSummary(pageData.count, rows.size, failures, pageData.limitReached);
    renderPerformance(performance);

    const gsc = await gscPromise;
    ensureCurrent(current);
    if (!gsc.error) renderGsc(gsc);
    const queries = keywordCandidates(bootstrap.root, pageData.pages, gsc.error ? null : gsc);
    let serp = null;
    let comparisons = [];
    try {
      serp = await loadRankings(bootstrap.root, queries);
      ensureCurrent(current);
      comparisons = await compareCompetitors(serp, pageData.pages, bootstrap.root, current);
      renderRankings(serp, gsc.error ? null : gsc, comparisons, pageData.pages, bootstrap.root, performance);
    } catch (error) {
      renderRankingUnavailable(error, queries.length, gsc.error ? null : gsc, pageData.pages, bootstrap.root, performance);
    }
    auditState = { site: bootstrap.root, pages: pageData.count, pagesMap: pageData.pages, rules, failures, limited: pageData.limitReached, gsc: gsc.error ? null : gsc, serp, comparisons, performance };
    if (reportUrl) URL.revokeObjectURL(reportUrl);
    reportUrl = URL.createObjectURL(new Blob([buildReport(auditState)], { type: 'text/markdown;charset=utf-8' }));
    download.href = reportUrl;
    download.download = `seo-audit-${new URL(bootstrap.root).hostname}-${new Date().toISOString().slice(0, 10)}.md`;
    download.hidden = false;
    const suffix = [gsc.error && 'GSC não ligado', !serp && 'ranking sem fornecedor', performance.error && 'PageSpeed indisponível'].filter(Boolean).join(' · ');
    showNotice(`Auditoria concluída${suffix ? ` · ${suffix}` : ''}.`);
  } catch (error) {
    if (current === run) {
      stopRows(rows);
      showNotice(error instanceof Error ? error.message : 'Não foi possível concluir a auditoria.', true);
    }
  } finally {
    if (current === run) button.disabled = false;
  }
});

async function crawlSitemaps(seeds, origin, current) {
  const queue = [...new Set(seeds.map(normalize))];
  const seen = new Set();
  const items = [];
  while (queue.length) {
    ensureCurrent(current);
    const batch = queue.splice(0, 3).filter(url => !seen.has(url));
    if (!batch.length) continue;
    batch.forEach(url => seen.add(url));
    const data = await post({ action: 'sitemaps', urls: batch });
    for (const item of data.items) {
      items.push(item);
      if (item.kind === 'index') for (const url of item.urls) if (sameOrigin(url, origin) && !seen.has(normalize(url))) queue.push(normalize(url));
    }
  }
  return items;
}

async function crawlPages(root, origin, sitemapUrls, failures, current) {
  const queue = [normalize(root), ...sitemapUrls].slice(0, MAX_PAGES);
  const queued = new Set(queue);
  const visited = new Set();
  const pages = new Map();
  const external = new Set();
  const resources = new Map();

  const visit = async url => {
    const data = await post({ action: 'pages', root, urls: [url] });
    addFailures(failures, data.failures);

    for (const page of data.summaries) {
      pages.set(normalize(page.requestedUrl), page);
      pages.set(normalize(page.finalUrl), page);
      queued.add(normalize(page.finalUrl));
      for (const link of page.links) {
        if (sameOrigin(link.url, origin) && !likelyPage(link.url)) mergeResource(resources, { url: link.url, kinds: ['internal-target'], owners: [page.url] });
      }
      for (const canonical of page.canonical) if (sameOrigin(canonical, origin) && !likelyPage(canonical)) mergeResource(resources, { url: canonical, kinds: ['canonical-target'], owners: [page.url] });
    }
    for (const resource of data.resources) mergeResource(resources, resource);
    for (const target of data.external) if (external.size < MAX_EXTERNAL) external.add(normalize(target));
    for (const target of data.discovered) {
      const normalized = normalize(target);
      if (sameOrigin(normalized, origin) && likelyPage(normalized) && !queued.has(normalized) && !visited.has(normalized) && queued.size < MAX_PAGES) {
        queued.add(normalized);
        queue.push(normalized);
      }
    }
  };

  const first = queue.shift();
  if (first) {
    visited.add(first);
    await visit(first);
  }
  await Promise.all(Array.from({ length: PAGE_CONCURRENCY }, async () => {
    while (queue.length && visited.size < MAX_PAGES) {
      ensureCurrent(current);
      const url = queue.shift();
      if (visited.has(url)) continue;
      visited.add(url);
      await visit(url);
    }
  }));
  return { pages, external, resources, count: uniqueObjects([...pages.values()]).length, limitReached: queue.length > 0 || sitemapUrls.size + 1 > MAX_PAGES };
}

async function loadPerformance(root, pagesMap) {
  return post({ action: 'performance', root, urls: performanceTargets(root, pagesMap) }, 1);
}

function performanceTargets(root, pagesMap) {
  const targets = [normalize(root)];
  const group = value => {
    const parts = new URL(value).pathname.split('/').filter(Boolean);
    return /^[a-z]{2}(?:-[a-z]{2})?$/i.test(parts[0] ?? '') ? parts.slice(0, 2).join('/') : parts[0] ?? '/';
  };
  const groups = new Set([group(root)]);
  for (const page of uniqueObjects([...pagesMap.values()]).filter(item => item.status >= 200 && item.status < 300)) {
    const section = group(page.url);
    if (groups.has(section)) continue;
    groups.add(section);
    targets.push(normalize(page.url));
    if (targets.length === 3) break;
  }
  return targets;
}

function applyPerformanceFailures(failures, performance) {
  const auditCodes = { 'font-size': 'UXP-004', 'uses-text-compression': 'UXP-006', viewport: 'UXP-013' };
  for (const page of performance?.pages ?? []) {
    if (page.error) continue;
    if (page.score < 90) addFailure(failures, 'UXP-001', page.url);
    for (const audit of page.audits) if (auditCodes[audit.id]) addFailure(failures, auditCodes[audit.id], page.url);
  }
}

async function inspectResources(resources, failures, current) {
  const entries = [...resources.values()];
  const facts = new Map();
  let index = 0;
  await Promise.all(Array.from({ length: FETCH_CONCURRENCY }, async () => {
    while (index < entries.length) {
      ensureCurrent(current);
      const batch = entries.slice(index, index + FETCH_BATCH_SIZE);
      index += FETCH_BATCH_SIZE;
      const data = await post({ action: 'fetch', entries: batch.map(({ url, kinds }) => ({ url, kinds })) });
      for (const item of data.items) {
        const resource = resources.get(normalize(item.url)) ?? batch.find(entry => normalize(entry.url) === normalize(item.url));
        const owners = resource?.owners?.length ? resource.owners : [item.url];
        facts.set(normalize(item.url), item);
        applyResourceFailures(failures, item, owners);
      }
    }
  }));
  return facts;
}

async function inspectExternal(urls, failures, current) {
  const values = [...urls];
  let index = 0;
  await Promise.all(Array.from({ length: FETCH_CONCURRENCY }, async () => {
    while (index < values.length) {
      ensureCurrent(current);
      const batch = values.slice(index, index + FETCH_BATCH_SIZE);
      index += FETCH_BATCH_SIZE;
      const data = await post({ action: 'fetch', entries: batch.map(url => ({ url, kinds: ['external'] })) });
      for (const item of data.items) {
        if (item.redirects.length) addFailure(failures, 'EXT-001', item.url);
        if (item.status >= 400 && item.status < 500) addFailure(failures, 'EXT-002', item.url);
        if (item.status >= 500) addFailure(failures, 'EXT-003', item.url);
        if (item.error === 'timeout') addFailure(failures, 'EXT-004', item.url);
      }
    }
  }));
}

function applyResourceFailures(failures, item, owners) {
  const broken = item.error || item.status >= 400;
  const redirect = item.redirects.length > 0;
  const kind = value => item.kinds.includes(value);
  if (kind('css')) {
    if (broken) addMany(failures, ['CSS-001', 'CSS-005'], owners);
    if (item.contentLength > 15_000) addMany(failures, ['CSS-002'], owners);
    if (redirect) addMany(failures, ['CSS-003', 'CSS-006'], owners);
  }
  if (kind('js')) {
    if (broken) addMany(failures, ['JSC-001', 'JSC-002'], owners);
    if (redirect) addMany(failures, ['JSC-004', 'JSC-005'], owners);
  }
  if (kind('image')) {
    if (item.contentLength > 1_000_000) addMany(failures, ['IMG-001'], owners);
    if (broken) addMany(failures, ['IMG-002', 'IMG-003'], owners);
    if (redirect) addMany(failures, ['IMG-005', 'IMG-007'], owners);
    if (!imageFormat(item.url, item.contentType)) addMany(failures, ['GIM-003'], owners);
  }
  if (kind('icon') && (broken || item.iconValid === false)) addMany(failures, ['IDN-002'], owners);
  if (kind('video')) {
    if (!videoFormat(item.url, item.contentType)) addMany(failures, ['VID-005'], owners);
    if (broken) addMany(failures, ['VID-006'], owners);
  }
  if (kind('structured') && broken) addMany(failures, ['SDG-004'], owners);
  if (kind('internal-target')) {
    if (item.status === 404) addFailure(failures, 'HTTP-001', item.url);
    if (item.status >= 400 && item.status < 500) addFailure(failures, 'HTTP-002', item.url);
    if (item.status === 500) addFailure(failures, 'HTTP-003', item.url);
    if (item.status >= 500) addFailure(failures, 'HTTP-004', item.url);
    if (item.error === 'timeout') addFailure(failures, 'HTTP-005', item.url);
    if (broken) addMany(failures, ['LNK-004', 'LNK-015'], owners);
    if (redirect) addMany(failures, ['LNK-006', 'LNK-019'], owners);
  }
  if (item.smallFonts) addMany(failures, ['UXP-004'], owners);
  if ((kind('css') || kind('js')) && item.contentLength > 1_000 && !/(?:br|gzip|deflate|zstd)/i.test(item.contentEncoding)) addMany(failures, ['UXP-006'], owners);
}

function applyGraphChecks(failures, pagesMap, sitemaps, sitemapUrls, root, origin, resourceFacts) {
  const pages = uniqueObjects([...pagesMap.values()]);
  const responses = new Map();
  for (const page of pages) {
    responses.set(normalize(page.requestedUrl), page);
    responses.set(normalize(page.finalUrl), page);
  }
  for (const [url, fact] of resourceFacts) responses.set(url, fact);
  const indexable = pages.filter(page => page.status >= 200 && page.status < 300 && !page.robots.includes('noindex'));
  const incoming = new Map();

  for (const page of pages) for (const link of page.links.filter(link => sameOrigin(link.url, origin))) {
    const key = normalize(link.url);
    incoming.set(key, [...(incoming.get(key) ?? []), { ...link, source: page.url }]);
    const target = responses.get(key);
    if (target?.error || target?.status >= 400) addMany(failures, ['LNK-004', 'LNK-015'], [page.url]);
    if (target?.redirects?.length) addMany(failures, ['LNK-006', 'LNK-019'], [page.url]);
    if (page.url.startsWith('https:') && link.url.startsWith('http:')) addMany(failures, ['LNK-002', 'LNK-013'], [page.url]);
    if (page.url.startsWith('http:') && link.url.startsWith('https:')) addMany(failures, ['LNK-009', 'LNK-018'], [page.url]);
  }

  for (const page of indexable) {
    const links = page.links.filter(link => sameOrigin(link.url, origin));
    const incomingLinks = incoming.get(normalize(page.url)) ?? [];
    if (normalize(page.url) !== normalize(root) && !incomingLinks.length) addMany(failures, ['LNK-003', 'LNK-014', 'AIX-014'], [page.url]);
    if (!links.length) addMany(failures, ['LNK-005', 'LNK-016'], [page.url]);
    if (incomingLinks.length && incomingLinks.every(link => link.rel.includes('nofollow'))) addMany(failures, ['LNK-007', 'LNK-021'], [page.url]);
    if (incomingLinks.some(link => link.rel.includes('nofollow')) && incomingLinks.some(link => !link.rel.includes('nofollow'))) addMany(failures, ['LNK-010', 'LNK-020'], [page.url]);
    if (incomingLinks.filter(link => !link.rel.includes('nofollow')).length === 1) addMany(failures, ['LNK-012', 'LNK-017'], [page.url]);
    if (links.some(link => link.rel.includes('nofollow'))) addMany(failures, ['LNK-011', 'LNK-022'], [page.url]);
    if (sitemapUrls.size && !sitemapUrls.has(normalize(page.url))) addMany(failures, ['SMP-013', 'AIX-013'], [page.url]);
    if (!sitemapUrls.size) addFailure(failures, 'AIX-013', page.url);
  }

  for (const page of pages.filter(page => page.redirects.length && !(incoming.get(normalize(page.requestedUrl))?.length))) addMany(failures, ['LNK-008', 'LNK-023'], [page.requestedUrl]);
  for (const url of new Set(indexable.flatMap(page => page.canonical.map(normalize)))) if (!(incoming.get(url)?.length)) addFailure(failures, 'LNK-001', url);
  applyCanonicalChecks(failures, indexable, responses);
  applyDuplicateChecks(failures, indexable);
  applyHreflangChecks(failures, pages, responses);
  applySitemapChecks(failures, sitemaps, sitemapUrls, responses, indexable);
}

function applyCanonicalChecks(failures, pages, responses) {
  for (const page of pages) for (const canonical of page.canonical) {
    const target = responses.get(normalize(canonical));
    if (target?.status >= 400 && target.status < 500) addFailure(failures, 'IDX-001', page.url);
    if (target?.status >= 500) addFailure(failures, 'IDX-002', page.url);
    if (target?.redirects?.length) addFailure(failures, 'IDX-003', page.url);
    if (target?.canonical?.[0] && normalize(target.canonical[0]) !== normalize(target.url)) addFailure(failures, 'IDX-009', page.url);
  }
}

function applyDuplicateChecks(failures, pages) {
  const groups = groupBy(pages.filter(page => page.fingerprint), page => page.fingerprint);
  for (const duplicates of groups.values()) if (duplicates.length > 1) {
    for (const page of duplicates.filter(item => !item.canonical.length)) addMany(failures, ['DUP-001', 'AIX-015'], [page.url]);
    if (duplicates.some(page => page.structured) && duplicates.some(page => !page.structured)) for (const page of duplicates.filter(item => !item.structured)) addFailure(failures, 'SDG-005', page.url);
  }
}

function applyHreflangChecks(failures, pages, responses) {
  for (const page of pages) {
    if (!page.lang) addFailure(failures, 'LOC-011', page.url);
    if (page.lang && !validLanguage(page.lang)) addFailure(failures, 'LOC-005', page.url);
    if (!page.hreflang.length) continue;
    if (!page.lang) addFailure(failures, 'LOC-010', page.url);
    if (!page.hreflang.some(item => item.language === 'x-default')) addFailure(failures, 'LOC-013', page.url);
    if (!page.hreflang.some(item => item.language !== 'x-default' && normalize(item.url) === normalize(page.url))) addFailure(failures, 'LOC-009', page.url);
    if (new Set(page.hreflang.map(item => item.language)).size !== page.hreflang.length) addFailure(failures, 'LOC-007', page.url);
    const urls = groupBy(page.hreflang.filter(item => item.language !== 'x-default'), item => normalize(item.url));
    if ([...urls.values()].some(items => new Set(items.map(item => primaryLanguage(item.language))).size > 1)) addFailure(failures, 'LOC-008', page.url);

    for (const annotation of page.hreflang) {
      const target = responses.get(normalize(annotation.url));
      if (!validLanguage(annotation.language)) addFailure(failures, 'LOC-003', page.url);
      if (!target) addFailure(failures, 'LOC-012', page.url);
      if (target?.error || target?.status >= 400 || target?.redirects?.length) addFailure(failures, 'LOC-004', page.url);
      if (target?.canonical?.[0] && normalize(target.canonical[0]) !== normalize(target.url)) addFailure(failures, 'LOC-001', page.url);
      if (target?.lang && annotation.language !== 'x-default' && primaryLanguage(target.lang) !== primaryLanguage(annotation.language)) addFailure(failures, 'LOC-002', page.url);
      if (target?.hreflang && !target.hreflang.some(item => normalize(item.url) === normalize(page.url))) addFailure(failures, 'LOC-006', page.url);
    }
  }
}

function applySitemapChecks(failures, sitemaps, sitemapUrls, responses, indexable) {
  const valid = sitemaps.filter(item => item.status === 200 && item.kind !== 'invalid');
  if (!valid.length) for (const sitemap of sitemaps) addFailure(failures, 'SMP-008', sitemap.url);
  const membership = new Map();
  for (const sitemap of sitemaps) {
    if (sitemap.syntaxError) addFailure(failures, 'SMP-007', sitemap.url);
    if (sitemap.contentLength > 52_428_800) addFailure(failures, 'SMP-009', sitemap.url);
    if (!sitemap.truncated && sitemap.urls.length > 50_000) addFailure(failures, 'SMP-010', sitemap.url);
    if (sitemap.status === 200 && sitemap.kind === 'invalid') addFailure(failures, 'SMP-011', sitemap.url);
    if (sitemap.kind === 'urlset') for (const url of sitemap.urls) {
      const key = normalize(url);
      membership.set(key, (membership.get(key) ?? 0) + 1);
      if (!sitemapScope(url, sitemap.url)) addFailure(failures, 'SMP-012', sitemap.url);
    }
  }
  for (const [url, count] of membership) if (count > 1) addFailure(failures, 'SMP-015', url);
  for (const url of sitemapUrls) {
    const page = responses.get(url);
    if (!page) continue;
    if (page.redirects?.length) addFailure(failures, 'SMP-001', url);
    if (page.status >= 400 && page.status < 500) addFailure(failures, 'SMP-002', url);
    if (page.status >= 500) addFailure(failures, 'SMP-003', url);
    if (page.error === 'timeout') addFailure(failures, 'SMP-006', url);
    if (page.robots?.includes('noindex')) addFailure(failures, 'SMP-004', url);
    if (page.canonical?.[0] && normalize(page.canonical[0]) !== normalize(page.url)) addFailure(failures, 'SMP-005', url);
  }
  if (sitemapUrls.size) for (const page of indexable) if (!sitemapUrls.has(normalize(page.url))) addFailure(failures, 'SMP-013', page.url);
}

function renderLoading(rules, loading = true) {
  results.replaceChildren();
  const checksStatus = document.querySelector('#checks-status');
  if (loading) showLoader(checksStatus);
  else checksStatus.textContent = rules.length;
  const rows = new Map();
  const groups = groupBy(rules, rule => rule.category);
  for (const [category, items] of groups) {
    const group = document.createElement('section');
    group.className = 'category-section';
    const heading = document.createElement('div');
    heading.className = 'category-heading';
    const title = document.createElement('strong');
    title.textContent = category;
    const count = document.createElement('small');
    count.textContent = `${items.length} ${loading ? 'a verificar' : items.length === 1 ? 'verificação' : 'verificações'}`;
    heading.append(title, count);
    const body = document.createElement('div');
    body.className = 'category-body';
    group.append(heading, body);
    results.append(group);
    for (const rule of items) {
      const row = document.createElement('article');
      row.className = 'row';
      const name = document.createElement('div');
      name.className = 'name';
      const code = document.createElement('span');
      code.className = 'code';
      code.textContent = rule.code;
      name.append(code, document.createTextNode(rule.name));
      const indicator = document.createElement('button');
      indicator.type = 'button';
      indicator.className = `indicator${loading ? ' loading' : ''}`;
      indicator.setAttribute('aria-label', loading ? 'A verificar' : 'Por analisar');
      row.append(name, indicator, help(rule));
      body.append(row);
      rows.set(rule.code, indicator);
    }
  }
  return rows;
}

function finishRows(rows, failures) {
  for (const [code, indicator] of rows) {
    const urls = [...(failures.get(code) ?? [])].sort();
    if (urls.length) showFailure(code, indicator, urls);
    else {
      indicator.className = 'indicator pass';
      indicator.setAttribute('aria-label', 'Certo');
      indicator.replaceChildren();
    }
  }
  for (const group of results.querySelectorAll('.category-section')) {
    const indicators = [...group.querySelectorAll('.indicator')];
    const problems = indicators.filter(item => item.classList.contains('fail')).length;
    const optional = indicators.filter(item => item.classList.contains('optional')).length;
    group.querySelector('.category-heading small').textContent = problems ? `${problems} ${problems === 1 ? 'problema' : 'problemas'}` : optional ? `${optional} ${optional === 1 ? 'opcional' : 'opcionais'}` : `${indicators.length} ${indicators.length === 1 ? 'certo' : 'certos'}`;
  }
}

function stopRows(rows) {
  for (const indicator of rows.values()) {
    if (indicator.matches('.fail,.optional')) continue;
    indicator.className = 'indicator';
    indicator.setAttribute('aria-label', 'Não verificado');
  }
  document.querySelector('#checks-status').textContent = 'Interrompido';
}

function help(rule) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'help';
  button.setAttribute('aria-label', `Detalhes de ${rule.name}`);
  button.textContent = '?';
  const tip = document.createElement('span');
  tip.className = 'tooltip';
  const detailTitle = document.createElement('strong');
  detailTitle.textContent = 'Detalhes';
  const detail = document.createElement('span');
  detail.textContent = clean(rule.details);
  const solutionTitle = document.createElement('strong');
  solutionTitle.textContent = 'Solução';
  const solution = document.createElement('span');
  solution.textContent = clean(rule.solution);
  tip.append(detailTitle, detail, solutionTitle, solution);
  button.append(tip);
  bindPopover(button, tip);
  return button;
}

function showFailure(code, indicator, urls) {
  const optional = OPTIONAL_CODES.has(code);
  indicator.className = `indicator ${optional ? 'optional' : 'fail'}`;
  indicator.setAttribute('aria-label', `${optional ? 'Melhoria opcional' : 'Problema'} em ${urls.length} páginas`);
  let popup = indicator.querySelector('.occurrences');
  if (!popup) {
    popup = document.createElement('span');
    popup.className = 'occurrences';
    indicator.replaceChildren(popup);
    bindPopover(indicator, popup);
  }
  popup.textContent = urls.join('\n');
}

function bindPopover(trigger, popup) {
  popup.setAttribute('popover', 'manual');
  const supported = typeof popup.showPopover === 'function';
  const show = () => supported ? !popup.matches(':popover-open') && popup.showPopover() : popup.classList.add('open');
  const hide = () => supported ? popup.matches(':popover-open') && popup.hidePopover() : popup.classList.remove('open');
  trigger.addEventListener('mouseenter', show);
  trigger.addEventListener('mouseleave', hide);
  trigger.addEventListener('focus', show);
  trigger.addEventListener('blur', hide);
}

function showSummary(pages, total, failures, limited) {
  const optional = [...failures.keys()].filter(code => OPTIONAL_CODES.has(code)).length;
  const problems = failures.size - optional;
  const score = Math.round((total - problems - optional * .25) / total * 100);
  const donut = document.querySelector('#health-donut');
  document.querySelector('#health-ring').setAttribute('stroke-dasharray', `${score} 100`);
  donut.querySelector('span').textContent = score;
  document.querySelector('#health-copy').textContent = `${pages} páginas · ${problems} problemas · ${optional} opcionais${limited ? ' · limite atingido' : ''}`;
  document.querySelector('#checks-status').textContent = problems ? `${problems} problemas` : optional ? `${optional} opcionais` : 'Tudo certo';
}

function buildReport({ site, pages, pagesMap, rules, failures, limited, gsc, serp, comparisons, performance }) {
  const findings = rules.flatMap(rule => {
    const urls = [...(failures.get(rule.code) ?? [])].sort();
    return urls.length ? [{ rule, urls }] : [];
  });
  const optional = findings.filter(({ rule }) => OPTIONAL_CODES.has(rule.code)).length;
  const problems = findings.length - optional;
  const urls = [...new Set(findings.flatMap(finding => finding.urls))].sort();
  const urlIds = new Map(urls.map((url, index) => [url, `U${index + 1}`]));
  const lines = [
    '# SEO_AUDIT_V2',
    'schema: seo-audit/2',
    `site: ${site}`,
    `generated_at: ${new Date().toISOString()}`,
    `scan: pages=${pages}; checks=${rules.length}; passed=${rules.length - findings.length}; optional=${optional}; errors=${problems}; crawl_limited=${Boolean(limited)}`
  ];
  if (gsc) {
    const row = gsc.overall;
    lines.push('', '## GSC',
      `period: ${gsc.currentPeriod.startDate}/${gsc.currentPeriod.endDate}`,
      `metrics: clicks=${row.clicks}; impressions=${row.impressions}; ctr=${row.ctr}; avg_position=${row.position}`);
  }
  if (performance) {
    const measured = performance.pages?.filter(page => !page.error) ?? [];
    lines.push('', '## PAGESPEED', 'url\tstrategy\tscore\tseo\tfcp_ms\tlcp_ms\ttbt_ms\tcls\tspeed_index_ms',
      ...measured.map(page => `${page.url}\t${page.strategy}\t${page.score}\t${page.seoScore}\t${Math.round(page.metrics.fcpMs)}\t${Math.round(page.metrics.lcpMs)}\t${Math.round(page.metrics.tbtMs)}\t${page.metrics.cls}\t${Math.round(page.metrics.speedIndexMs)}`));
    const audits = measured.flatMap(page => page.audits.map(audit => `${page.url}\t${page.strategy}\t${audit.id}\t${audit.score}\t${clean(audit.display) || '-'}\t${audit.resources.join(';') || '-'}`));
    if (audits.length) lines.push('', '## LIGHTHOUSE_FINDINGS', 'url\tstrategy\taudit\tscore\tmeasurement\tresources', ...audits);
    if (performance.crux?.metrics) lines.push('', '## CRUX_PHONE', `period: ${performance.crux.period}`, 'metric\tp75\tdistribution_good_needs_poor',
      ...Object.entries(performance.crux.metrics).map(([metric, value]) => `${metric}\t${value.p75}\t${value.distribution.join(',')}`));
  }
  if (serp) {
    const profiles = competitorProfiles(serp);
    lines.push('', '## RANKINGS', 'query\tposition\turl', ...serp.results.map(item => `${clean(item.query)}\t${item.ownPosition ?? 'GT20'}\t${item.ownUrl || '-'}`));
    lines.push('', '## COMPETITORS', 'domain\tvisibility\ttop10\tqueries', ...profiles.slice(0, 15).map(item => `${item.domain}\t${decimal(item.score)}\t${item.top10}\t${item.queries}`));
  }
  if (serp || gsc || performance) {
    const opportunities = buildOpportunities(serp, gsc, comparisons, pagesMap, site, performance).slice(0, 60);
    lines.push('', '## ACTIONS', 'priority\tsignal\taction\tevidence_or_fix', ...opportunities.map(item => `${item.priority}\t${clean(item.label) || '-'}\t${clean(item.title)}\t${clean(item.detail)}`));
  }
  if (urls.length) lines.push('', '## URLS', 'id\turl', ...urls.map(url => `${urlIds.get(url)}\t${url}`));
  lines.push('', '## FINDINGS');
  if (!findings.length) lines.push('none');
  for (const { rule, urls: affected } of findings) {
    lines.push('', `### ${rule.code}|${OPTIONAL_CODES.has(rule.code) ? 'optional' : 'error'}|${clean(rule.category)}|${clean(rule.name)}`,
      `urls: ${affected.map(url => urlIds.get(url)).join(',')}`,
      `details: ${clean(rule.details).replace(/\s*Referência oficial\.?$/i, '')}`,
      `fix: ${clean(rule.solution).replace(/\s*Referência oficial\.?$/i, '')}`);
  }
  return `${lines.join('\n')}\n`;
}

function resetRanking() {
  for (const id of ['opportunities', 'rankings', 'competitors']) {
    const section = document.querySelector(`#${id}`);
    section.replaceChildren();
  }
  for (const id of ['opportunities-status', 'rankings-status', 'competitors-status', 'ranked-count', 'competitor-count', 'health-copy', 'pagespeed-status']) showLoader(document.querySelector(`#${id}`));
  document.querySelector('#rank-bars').replaceChildren();
  document.querySelector('#competitor-bars').replaceChildren();
  document.querySelector('#trend-chart polyline').setAttribute('points', '');
  for (const id of ['clicks', 'impressions', 'ctr', 'position']) document.querySelector(`#kpi-${id}`).textContent = '—';
  for (const id of ['psi-mobile', 'psi-desktop', 'crux-lcp', 'crux-inp', 'crux-cls']) document.querySelector(`#${id}`).textContent = '—';
  document.querySelector('#gsc-period').textContent = sessionStorage.getItem('gsc-session') ? 'A carregar' : 'Não ligado';
  document.querySelector('#health-ring').setAttribute('stroke-dasharray', '0 100');
  document.querySelector('#health-donut span').textContent = '—';
}

function renderPerformance(performance) {
  const pages = performance?.pages?.filter(page => !page.error) ?? [];
  const mobile = pages.find(page => page.strategy === 'mobile');
  const desktop = pages.find(page => page.strategy === 'desktop');
  const metrics = performance?.crux?.metrics ?? {};
  document.querySelector('#psi-mobile').textContent = mobile?.score ?? '—';
  document.querySelector('#psi-desktop').textContent = desktop?.score ?? '—';
  document.querySelector('#crux-lcp').textContent = metrics.lcpMs ? `${decimal(metrics.lcpMs.p75 / 1000)} s` : '—';
  document.querySelector('#crux-inp').textContent = metrics.inpMs ? `${number(metrics.inpMs.p75)} ms` : '—';
  document.querySelector('#crux-cls').textContent = metrics.cls ? decimal(metrics.cls.p75) : '—';
  const urls = new Set(pages.map(page => page.url)).size;
  const failed = (performance?.pages ?? []).filter(page => page.error).length;
  document.querySelector('#pagespeed-status').textContent = performance?.error ? 'Indisponível' : `${urls} URLs${failed ? ` · ${failed} falhas` : ''}${performance?.crux ? '' : ' · sem CrUX'}`;
}

function showLoader(element) {
  const spinner = document.createElement('span');
  spinner.className = 'indicator loading compact';
  spinner.setAttribute('aria-hidden', 'true');
  const label = document.createElement('span');
  label.className = 'sr-only';
  label.textContent = 'A analisar';
  element.replaceChildren(spinner, label);
}

function showNotice(message, error = false) {
  notice.hidden = !message;
  notice.classList.toggle('error', error);
  notice.textContent = message;
}

async function loadGsc(site) {
  const session = sessionStorage.getItem('gsc-session');
  if (!session) throw new Error('GSC não ligado');
  const property = `sc-domain:${new URL(site).hostname.replace(/^www\./, '')}`;
  const response = await fetch(`${GSC_ORIGIN}/gsc/ranking?days=28&site=${encodeURIComponent(property)}`, { headers: { authorization: `Bearer ${session}` } });
  const data = await response.json();
  if (response.status === 401) disconnectGsc();
  if (!response.ok) throw new Error(data.error || 'Não foi possível ler o Search Console.');
  if (session !== sessionStorage.getItem('gsc-session')) throw new Error('GSC não ligado');
  return data;
}

function setGscConnected(connected) {
  gscConnect.classList.toggle('connected', connected);
  const label = connected ? 'Google Search Console ligado' : 'Ligar Google Search Console';
  gscConnect.title = label;
  gscConnect.setAttribute('aria-label', label);
}

function disconnectGsc() {
  sessionStorage.removeItem('gsc-session');
  setGscConnected(false);
  document.querySelector('#gsc-period').textContent = 'Não ligado';
  for (const id of ['clicks', 'impressions', 'ctr', 'position']) document.querySelector(`#kpi-${id}`).textContent = '—';
  document.querySelector('#trend-chart polyline').setAttribute('points', '');
  auditState.gsc = null;
}

function keywordCandidates(site, pagesMap, gsc) {
  const host = new URL(site).hostname.replace(/^www\./, '');
  const brand = host.split('.')[0].replace(/[-_]/g, ' ').toLowerCase();
  const candidates = [];
  const add = value => {
    const phrase = clean(value).replace(/\s+[|–—-]\s+.*$/, '').replace(new RegExp(`\\b${escapeRegExp(brand)}\\b`, 'ig'), '').replace(/\s+/g, ' ').trim();
    if (phrase.split(/\s+/).length < 2 || phrase.length < 6 || phrase.length > 80 || candidates.some(item => item.toLowerCase() === phrase.toLowerCase())) return;
    candidates.push(phrase);
  };
  for (const row of (gsc?.queries ?? []).sort((a, b) => b.impressions - a.impressions)) if (!row.keys[0].toLowerCase().includes(brand)) add(row.keys[0]);
  for (const page of uniqueObjects([...pagesMap.values()]).filter(item => item.status === 200)) {
    add(page.h1);
    add(page.title);
    const slug = new URL(page.url).pathname.split('/').filter(Boolean).at(-1)?.replace(/[-_]+/g, ' ');
    if (slug && !/^\d+$/.test(slug)) add(slug);
  }
  return candidates.slice(0, 50);
}

async function loadRankings(site, queries) {
  if (!queries.length) throw new Error('Não foram encontrados termos concretos para acompanhar. Ligue o GSC para usar pesquisas reais.');
  const response = await fetch('/api/rank', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ domain: new URL(site).hostname, queries })
  });
  const data = await response.json();
  if (response.status === 503) throw new Error('O serviço de posições ainda não está configurado no servidor.');
  if (!response.ok) throw new Error(data.error || 'Não foi possível medir as posições.');
  return data;
}

async function compareCompetitors(serp, pagesMap, site, current) {
  const profiles = competitorProfiles(serp).slice(0, 5);
  return (await Promise.all(profiles.map(async profile => {
    const hit = serp.results.flatMap(result => result.organic.map(item => ({ ...item, query: result.query }))).find(item => item.domain === profile.domain && item.position <= 10);
    if (!hit) return null;
    try {
      const data = await post({ action: 'pages', root: hit.url, urls: [hit.url] });
      ensureCurrent(current);
      return { ...profile, query: hit.query, url: hit.url, position: hit.position, page: data.summaries[0] ?? null };
    } catch { return { ...profile, query: hit.query, url: hit.url, position: hit.position, page: null }; }
  }))).filter(Boolean);
}

function renderGsc(gsc) {
  document.querySelector('#gsc-period').textContent = `${gsc.currentPeriod.startDate} — ${gsc.currentPeriod.endDate}`;
  document.querySelector('#kpi-clicks').textContent = number(gsc.overall.clicks);
  document.querySelector('#kpi-impressions').textContent = number(gsc.overall.impressions);
  document.querySelector('#kpi-ctr').textContent = percent(gsc.overall.ctr);
  document.querySelector('#kpi-position').textContent = decimal(gsc.overall.position);
  const values = gsc.daily.map(row => Number(row.position)).filter(Boolean);
  if (!values.length) return;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values.map((value, index) => `${index / Math.max(values.length - 1, 1) * 420},${12 + (value - min) / span * 96}`).join(' ');
  document.querySelector('#trend-chart polyline').setAttribute('points', points);
}

function renderRankings(serp, gsc, comparisons, pagesMap, site, performance) {
  const rankings = rankContent('rankings', `${serp.results.length} pesquisas · ${serp.market.toUpperCase()}`);
  const table = document.createElement('table');
  table.className = 'ranking-table';
  const head = table.createTHead().insertRow();
  for (const label of ['Pesquisa', 'Ao vivo', ...(gsc ? ['GSC 28d'] : []), 'Página encontrada']) { const th = document.createElement('th'); th.textContent = label; head.append(th); }
  const body = table.createTBody();
  for (const item of serp.results) {
    const row = body.insertRow();
    row.insertCell().textContent = item.query;
    row.insertCell().textContent = item.ownPosition ?? '>20';
    if (gsc) {
      const gscRow = gsc.queries.find(entry => entry.keys[0].toLowerCase() === item.query.toLowerCase());
      row.insertCell().textContent = gscRow ? decimal(gscRow.position) : '—';
    }
    const cell = row.insertCell();
    if (item.ownUrl) { const link = document.createElement('a'); link.href = item.ownUrl; link.target = '_blank'; link.rel = 'noopener'; link.textContent = compactUrl(item.ownUrl); cell.append(link); }
    else cell.textContent = 'Não encontrada';
  }
  rankings.append(table);

  const distribution = [
    ['Top 3', serp.results.filter(item => item.ownPosition && item.ownPosition <= 3).length],
    ['4–10', serp.results.filter(item => item.ownPosition >= 4 && item.ownPosition <= 10).length],
    ['11–20', serp.results.filter(item => item.ownPosition >= 11 && item.ownPosition <= 20).length],
    ['Fora do top 20', serp.results.filter(item => !item.ownPosition || item.ownPosition > 20).length]
  ];
  setBars(document.querySelector('#rank-bars'), distribution);
  document.querySelector('#ranked-count').textContent = `${serp.results.length} pesquisas`;

  const profiles = competitorProfiles(serp);
  setBars(document.querySelector('#competitor-bars'), profiles.slice(0, 8).map(item => [item.domain, item.score]));
  renderCompetitors(comparisons, profiles);
  renderOpportunities(buildOpportunities(serp, gsc, comparisons, pagesMap, site, performance));
}

function renderRankingUnavailable(error, queryCount, gsc, pagesMap, site, performance) {
  const rankings = rankContent('rankings', queryCount ? `${queryCount} termos preparados` : 'Sem termos');
  const message = document.createElement('p');
  message.className = 'notice';
  message.textContent = `${error.message} ${queryCount ? `${queryCount} termos já preparados.` : ''}`.trim();
  rankings.append(message);
  if (gsc) {
    appendGscTable(rankings, gsc);
    renderOpportunities(buildOpportunities(null, gsc, [], pagesMap, site, performance));
  } else renderOpportunities(buildOpportunities(null, null, [], pagesMap, site, performance));
  rankContent('competitors', 'Não analisado');
  document.querySelector('#ranked-count').textContent = gsc ? 'Só dados GSC' : 'Não analisado';
  document.querySelector('#competitor-count').textContent = 'Não analisado';
}

function appendGscTable(section, gsc) {
  const table = document.createElement('table');
  table.className = 'ranking-table';
  const head = table.createTHead().insertRow();
  for (const label of ['Pesquisa', 'Posição média', 'Impressões', 'CTR']) { const th = document.createElement('th'); th.textContent = label; head.append(th); }
  const body = table.createTBody();
  for (const item of gsc.queries.slice(0, 50)) {
    const row = body.insertRow();
    for (const value of [item.keys[0], decimal(item.position), number(item.impressions), percent(item.ctr)]) row.insertCell().textContent = value;
  }
  section.append(table);
}

function renderCompetitors(comparisons, profiles) {
  const section = rankContent('competitors', `${profiles.length} encontrados`);
  document.querySelector('#competitor-count').textContent = profiles.length ? `${profiles.length} domínios` : 'Sem dados';
  const list = document.createElement('div');
  list.className = 'insight-list';
  for (const profile of profiles.slice(0, 10)) {
    const comparison = comparisons.find(item => item.domain === profile.domain);
    const detail = comparison?.page
      ? `${profile.top10} aparições no top 10 · página observada para “${comparison.query}”: ${comparison.page.wordCount} palavras, ${comparison.page.imageCount} imagens, schema ${comparison.page.structuredTypes.join(', ') || 'não detetado'}.`
      : `${profile.top10} aparições no top 10 em ${profile.queries} pesquisas analisadas.`;
    list.append(insight('low', profile.domain, detail, decimal(profile.score)));
  }
  section.append(list);
}

function renderOpportunities(items) {
  const section = rankContent('opportunities', items.length ? `${items.length} oportunidades` : 'Sem oportunidades');
  const list = document.createElement('div');
  list.className = 'insight-list';
  for (const item of items.slice(0, 60)) list.append(insight(item.priority, item.title, item.detail, item.label));
  if (!items.length) { const empty = document.createElement('p'); empty.className = 'notice'; empty.textContent = 'Não surgiram oportunidades mensuráveis nos dados ligados.'; list.append(empty); }
  section.append(list);
}

function rankContent(id, status) {
  const section = document.querySelector(`#${id}`);
  document.querySelector(`#${id}-status`).textContent = status;
  section.replaceChildren();
  return section;
}

function switchView(id) {
  for (const tab of viewTabs) {
    const selected = tab.dataset.view === id;
    tab.classList.toggle('active', selected);
    tab.setAttribute('aria-selected', selected);
    tab.tabIndex = selected ? 0 : -1;
  }
  for (const pane of document.querySelectorAll('.view-pane')) pane.hidden = pane.id !== id;
  viewContent.scrollTop = 0;
}

function buildOpportunities(serp, gsc, comparisons, pagesMap, site, performance) {
  const items = [];
  const add = (priority, title, detail, label = '') => items.push({ priority, title, detail, label });
  const queryRows = new Map((gsc?.queries ?? []).map(row => [row.keys[0].toLowerCase(), row]));
  const previous = new Map((gsc?.previousQueries ?? []).map(row => [row.keys[0].toLowerCase(), row]));
  for (const row of gsc?.queries ?? []) {
    const query = row.keys[0];
    if (row.impressions >= 10 && row.position >= 4 && row.position <= 20) add(row.position <= 10 ? 'high' : 'medium', `Subir “${query}”`, `A pesquisa teve ${number(row.impressions)} impressões, CTR ${percent(row.ctr)} e posição média ${decimal(row.position)}. Reforce a página que já aparece: alinhe title/H1 com a intenção, cubra entidades e dúvidas presentes nos resultados líderes e aumente links internos contextuais a partir de páginas fortes.`, `#${decimal(row.position)}`);
    const expected = row.position <= 3 ? .08 : row.position <= 10 ? .025 : row.position <= 20 ? .01 : 0;
    if (row.impressions >= 20 && expected && row.ctr < expected / 2) add('high', `CTR baixo em “${query}”`, `${number(row.impressions)} impressões mas só ${percent(row.ctr)} de CTR. Reescreva title e description da landing page para explicitar produto, medida/uso, entrega e diferenciação sem alterar a intenção que já posiciona.`, `${percent(row.ctr)} CTR`);
    const before = previous.get(query.toLowerCase());
    if (before?.impressions >= 10 && row.position - before.position >= 3) add('medium', `Queda em “${query}”`, `A posição média piorou de ${decimal(before.position)} para ${decimal(row.position)}. Compare a landing page e os atuais top 3 quanto a intenção, atualização, cobertura, links internos, disponibilidade e snippet antes de alterar o URL.`, `−${decimal(row.position - before.position)}`);
  }
  const grouped = groupBy(gsc?.queryPages ?? [], row => row.keys[0]);
  for (const [query, rows] of grouped) if (rows.filter(row => row.impressions > 0).length > 1 && rows.reduce((sum, row) => sum + row.impressions, 0) >= 10) add('high', `Possível canibalização em “${query}”`, `${rows.length} URLs recebem impressões para a mesma pesquisa. Escolha uma landing principal; diferencie intenção das restantes e consolide canonical, links internos e conteúdo quando forem equivalentes.`, `${rows.length} URLs`);

  for (const result of serp?.results ?? []) {
    const row = queryRows.get(result.query.toLowerCase());
    if (!result.ownPosition) add(row?.impressions >= 20 ? 'high' : 'medium', `Fora do top 20: “${result.query}”`, `Nenhuma página do domínio surgiu nos 20 resultados do mercado ${serp.market.toUpperCase()}. Analise o tipo de página dominante nos concorrentes e crie ou reoriente uma landing única para essa intenção; só depois reforce ligações internas e autoridade externa.`, '>20');
    else if (result.ownPosition >= 11) add('medium', `Página 2: “${result.query}”`, `A página ${compactUrl(result.ownUrl)} está em #${result.ownPosition}. Compare diretamente o seu title, H1, cobertura, schema e formato com os três concorrentes acima e aplique apenas diferenças que respondam melhor à intenção.`, `#${result.ownPosition}`);
    if (result.cannibalization) add('high', `Duas páginas no SERP para “${result.query}”`, `O domínio tem múltiplos resultados orgânicos. Confirme se servem intenções distintas; caso contrário, consolide sinais numa URL principal e atualize links internos/canonical.`, 'Duplicado');
    if (result.ownUrl && ((serp.market === 'pt' && /\/es(?:\/|$)/i.test(result.ownUrl)) || (serp.market === 'es' && /\/pt(?:\/|$)/i.test(result.ownUrl)))) add('high', `Idioma errado em “${result.query}”`, `${compactUrl(result.ownUrl)} aparece no mercado ${serp.market.toUpperCase()}. Corrija hreflang recíproco, canonical próprio, linguagem do conteúdo e links internos para que a variante certa receba os sinais.`, 'Localização');
  }

  for (const comparison of comparisons) {
    if (!comparison.page) continue;
    const result = serp.results.find(item => item.query === comparison.query);
    const own = result?.ownUrl ? pageByUrl(pagesMap, result.ownUrl) : bestPageForQuery(pagesMap, comparison.query);
    if (!own) continue;
    const query = comparison.query.toLowerCase();
    if (comparison.page.title.toLowerCase().includes(query) && !own.title.toLowerCase().includes(query)) add('medium', `Title menos explícito que ${comparison.domain}`, `Para “${comparison.query}”, o concorrente usa a expressão no title e a página própria não. Reescreva o title apenas se a expressão descrever exatamente o conteúdo e mantenha-o legível, único e dentro de ~50–60 caracteres/600 px.`, 'Title');
    const missingTypes = comparison.page.structuredTypes.filter(type => !own.structuredTypes.includes(type));
    if (missingTypes.length) add('low', `Dados estruturados usados por ${comparison.domain}`, `Na página líder para “${comparison.query}” foram detetados ${missingTypes.join(', ')} que não existem na landing própria. Implemente apenas tipos suportados pelo Google, aplicáveis e coincidentes com conteúdo visível; valide no Rich Results Test.`, 'Schema');
    if (comparison.page.wordCount > Math.max(400, own.wordCount * 1.5)) add('medium', `Cobertura inferior a ${comparison.domain}`, `A página concorrente observada tem ${comparison.page.wordCount} palavras úteis contra ${own.wordCount}. Não copie nem aumente texto por volume: levante secções, atributos, dúvidas e provas relevantes que o concorrente cobre e a página própria omite.`, 'Conteúdo');
  }
  for (const page of performance?.pages ?? []) {
    if (page.error) continue;
    const device = page.strategy === 'mobile' ? 'Mobile' : 'Desktop';
    if (page.metrics.lcpMs > 2_500) add(page.metrics.lcpMs > 4_000 ? 'high' : 'medium', `LCP laboratorial lento em ${device}`, `${compactUrl(page.url)}: ${decimal(page.metrics.lcpMs / 1000)} s. Priorize o elemento LCP, a descoberta do recurso, TTFB, compressão e bloqueios de renderização indicados pelo Lighthouse.`, 'LCP');
    if (page.metrics.tbtMs > 200) add(page.metrics.tbtMs > 600 ? 'high' : 'medium', `Bloqueio da main thread em ${device}`, `${compactUrl(page.url)}: TBT ${number(page.metrics.tbtMs)} ms. Reduza JavaScript executado no carregamento, tarefas longas e scripts terceiros não essenciais.`, 'TBT');
    if (page.metrics.cls > .1) add(page.metrics.cls > .25 ? 'high' : 'medium', `Instabilidade visual em ${device}`, `${compactUrl(page.url)}: CLS ${decimal(page.metrics.cls)}. Reserve dimensões para imagens/embeds e evite inserir conteúdo acima do conteúdo já renderizado.`, 'CLS');
    for (const audit of page.audits.slice(0, 6)) add(audit.score < 50 ? 'high' : 'medium', `PageSpeed: ${audit.title}`, `${device} · ${compactUrl(page.url)}${audit.display ? ` · ${audit.display}` : ''}${audit.resources.length ? ` · ${audit.resources.slice(0, 2).join('; ')}` : ''}`, `${audit.score}/100`);
  }
  for (const [metric, good, poor, label, unit] of [['lcpMs', 2_500, 4_000, 'LCP real', 'ms'], ['inpMs', 200, 500, 'INP real', 'ms'], ['cls', .1, .25, 'CLS real', '']]) {
    const value = performance?.crux?.metrics?.[metric]?.p75;
    if (value > good) add(value > poor ? 'high' : 'medium', `${label} acima do recomendado`, `CrUX PHONE p75: ${value}${unit}. Este é desempenho real agregado dos últimos 28 dias; corrigir os templates e recursos que afetam a maioria das visitas.`, 'CrUX');
  }
  return items.sort((a, b) => priority(a.priority) - priority(b.priority));
}

function competitorProfiles(serp) {
  const ignored = new Set([serp.domain, 'google.com', 'youtube.com', 'facebook.com', 'instagram.com', 'pinterest.com', 'wikipedia.org']);
  const profiles = new Map();
  for (const result of serp.results) for (const item of result.organic) {
    if (!item.domain || ignored.has(item.domain) || item.domain.endsWith(`.${serp.domain}`)) continue;
    const current = profiles.get(item.domain) ?? { domain: item.domain, score: 0, top10: 0, queries: 0, seen: new Set() };
    current.score += 1 / Math.log2(item.position + 1);
    current.top10 += item.position <= 10 ? 1 : 0;
    current.seen.add(result.query);
    current.queries = current.seen.size;
    profiles.set(item.domain, current);
  }
  return [...profiles.values()].sort((a, b) => b.score - a.score);
}

function setBars(container, values) {
  container.replaceChildren();
  const max = Math.max(...values.map(([, value]) => value), 1);
  for (const [label, value] of values) {
    const row = document.createElement('div'); row.className = 'bar';
    const name = document.createElement('span'); name.textContent = label;
    const track = document.createElement('progress');
    track.className = 'track';
    track.max = max;
    track.value = value;
    track.setAttribute('aria-label', label);
    const count = document.createElement('strong'); count.textContent = Number.isInteger(value) ? value : decimal(value);
    row.append(name, track, count); container.append(row);
  }
}

function insight(level, title, detail, label) {
  const row = document.createElement('article'); row.className = 'insight';
  const dot = document.createElement('span'); dot.className = `priority ${level}`;
  const copy = document.createElement('div'); const strong = document.createElement('strong'); strong.textContent = title; const small = document.createElement('small'); small.textContent = detail; copy.append(strong, small);
  const badge = document.createElement('span'); badge.className = 'position'; badge.textContent = label;
  row.append(dot, copy, badge); return row;
}
function pageByUrl(pagesMap, url) { try { return [...pagesMap.values()].find(page => normalize(page.url) === normalize(url)); } catch { return null; } }
function bestPageForQuery(pagesMap, query) { const words = query.toLowerCase().split(/\s+/).filter(word => word.length > 3); return uniqueObjects([...pagesMap.values()]).sort((a, b) => scoreText(b, words) - scoreText(a, words))[0]; }
function scoreText(page, words) { const text = `${page.title} ${page.h1} ${page.url}`.toLowerCase(); return words.filter(word => text.includes(word)).length; }
function priority(value) { return { high: 0, medium: 1, low: 2 }[value] ?? 3; }
function compactUrl(value) { try { const url = new URL(value); return `${url.hostname}${url.pathname}`.replace(/\/$/, ''); } catch { return value; } }
function number(value) { return new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(Number(value) || 0); }
function decimal(value) { return new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 1 }).format(Number(value) || 0); }
function percent(value) { return new Intl.NumberFormat('pt-PT', { style: 'percent', maximumFractionDigits: 2 }).format(Number(value) || 0); }
function escapeRegExp(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function addFailures(target, items) {
  for (const item of items ?? []) for (const url of item.urls ?? []) addFailure(target, item.code, url);
}

function addMany(target, codes, urls) {
  for (const code of codes) for (const url of urls) addFailure(target, code, url);
}

function addFailure(target, code, url) {
  const urls = target.get(code) ?? new Set();
  if (urls.has(url)) return;
  urls.add(url);
  target.set(code, urls);
  const indicator = liveRows.get(target)?.get(code);
  if (indicator) showFailure(code, indicator, [...urls]);
}

function mergeResource(target, item) {
  const key = normalize(item.url);
  const current = target.get(key) ?? { url: key, kinds: [], owners: [] };
  current.kinds = [...new Set([...current.kinds, ...item.kinds])];
  current.owners = [...new Set([...current.owners, ...item.owners])];
  target.set(key, current);
}

async function post(body, attempts = 3) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const response = await fetch('/api/audit', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      const text = await response.text();
      let data;
      try { data = JSON.parse(text); }
      catch { throw new Error(text.match(/error code:\s*(\d+)/i)?.[1] === '1102' ? 'A página excedeu o limite de processamento do servidor.' : 'O servidor devolveu uma resposta inválida.'); }
      if (!response.ok) throw new Error(data.error || 'Falha na auditoria.');
      return data;
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) await new Promise(resolve => setTimeout(resolve, 350 * 2 ** attempt));
    }
  }
  throw lastError;
}

function ensureCurrent(value) {
  if (value !== run) throw new Error('Auditoria substituída por uma nova execução.');
}

function normalizeInput(value) {
  const raw = value.trim();
  return new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`).href;
}

function normalize(value) {
  const url = new URL(value);
  url.hash = '';
  return url.href;
}

function sameOrigin(value, origin) {
  try { return new URL(value).origin === origin; } catch { return false; }
}

function likelyPage(value) {
  try { return !/\.(?:avif|css|gif|ico|jpe?g|js|json|mp3|mp4|pdf|png|svg|webm|webp|woff2?|xml|zip)$/i.test(new URL(value).pathname); } catch { return false; }
}

function imageFormat(url, contentType) {
  return /image\/(?:avif|gif|jpeg|png|svg\+xml|webp|x-icon|vnd\.microsoft\.icon)/i.test(contentType) || /\.(?:avif|gif|ico|jpe?g|png|svg|webp)(?:$|\?)/i.test(url);
}

function videoFormat(url, contentType) {
  return /video\/(?:mp4|mpeg|ogg|quicktime|webm)/i.test(contentType) || /application\/(?:vnd\.apple\.mpegurl|x-mpegurl)/i.test(contentType) || /\.(?:m3u8|mp4|mov|mpeg|ogv|webm)(?:$|\?)/i.test(url);
}

function validLanguage(value) {
  return value === 'x-default' || /^[a-z]{2,3}(?:-[A-Z][a-z]{3})?(?:-(?:[A-Z]{2}|\d{3}))?$/i.test(value);
}

function primaryLanguage(value) {
  return String(value ?? '').split('-')[0].toLowerCase();
}

function sitemapScope(value, sitemap) {
  const target = new URL(value);
  const source = new URL(sitemap);
  return target.origin === source.origin && target.pathname.startsWith(source.pathname.slice(0, source.pathname.lastIndexOf('/') + 1));
}

function groupBy(items, key) {
  const groups = new Map();
  for (const item of items) {
    const value = key(item);
    groups.set(value, [...(groups.get(value) ?? []), item]);
  }
  return groups;
}

function uniqueObjects(items) {
  return [...new Map(items.map(item => [normalize(item.requestedUrl), item])).values()];
}

function clean(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}
