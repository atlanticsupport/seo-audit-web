const form = document.querySelector('#audit-form');
const input = document.querySelector('#url');
const button = form.querySelector('button');
const summary = document.querySelector('#summary');
const results = document.querySelector('#results');
const download = document.querySelector('#download-report');
const rulesPromise = fetch('/supported-rules.json').then(response => response.json());
const MAX_PAGES = 50_000;
const MAX_EXTERNAL = 10_000;
const PAGE_CONCURRENCY = 12;
const FETCH_BATCH_SIZE = 20;
const FETCH_CONCURRENCY = 6;
const OPTIONAL_CODES = new Set(['PRD-002', 'PRD-003']);
let run = 0;

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
  button.disabled = true;
  download.hidden = true;
  download.removeAttribute('href');
  summary.hidden = true;
  summary.classList.remove('error');

  try {
    const bootstrap = await post({ action: 'bootstrap', url });
    ensureCurrent(current);
    input.value = bootstrap.root.replace(/^https?:\/\//, '');
    addFailures(failures, bootstrap.failures);

    const origin = bootstrap.origin;
    const sitemapItems = await crawlSitemaps(bootstrap.sitemapSeeds, origin, current);
    const sitemapUrls = new Set(sitemapItems.filter(item => item.kind === 'urlset').flatMap(item => item.urls).filter(url => sameOrigin(url, origin) && likelyPage(url)).map(normalize));
    const pageData = await crawlPages(bootstrap.root, origin, sitemapUrls, failures, current);
    const fetches = await Promise.all([
      inspectResources(pageData.resources, failures, current),
      inspectExternal(pageData.external, failures, current)
    ]);
    ensureCurrent(current);
    applyGraphChecks(failures, pageData.pages, sitemapItems, sitemapUrls, bootstrap.root, origin, fetches[0]);
    finishRows(rows, failures);
    showSummary(pageData.count, rows.size, failures, pageData.limitReached);
    download.href = `data:text/markdown;charset=utf-8,${encodeURIComponent(buildReport(bootstrap.root, pageData.count, rules, failures, pageData.limitReached))}`;
    download.download = `seo-audit-${new URL(bootstrap.root).hostname}-${new Date().toISOString().slice(0, 10)}.md`;
    download.hidden = false;
  } catch (error) {
    if (current === run) {
      stopRows(rows);
      summary.hidden = false;
      summary.classList.add('error');
      summary.textContent = error instanceof Error ? error.message : 'Não foi possível concluir a auditoria.';
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

function renderLoading(rules) {
  results.replaceChildren();
  const rows = new Map();
  const groups = groupBy(rules, rule => rule.category);
  for (const [category, items] of groups) {
    const heading = document.createElement('h2');
    heading.className = 'category';
    heading.textContent = category;
    results.append(heading);
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
      indicator.className = 'indicator loading';
      indicator.setAttribute('aria-label', 'A verificar');
      row.append(name, indicator, help(rule));
      results.append(row);
      rows.set(rule.code, indicator);
    }
  }
  return rows;
}

function finishRows(rows, failures) {
  for (const [code, indicator] of rows) {
    const urls = [...(failures.get(code) ?? [])].sort();
    const state = urls.length ? OPTIONAL_CODES.has(code) ? 'optional' : 'fail' : 'pass';
    indicator.className = `indicator ${state}`;
    indicator.setAttribute('aria-label', urls.length ? `${state === 'optional' ? 'Melhoria opcional' : 'Problema'} em ${urls.length} páginas` : 'Certo');
    indicator.replaceChildren();
    if (urls.length) {
      const tooltip = document.createElement('span');
      tooltip.className = 'occurrences';
      tooltip.textContent = urls.join('\n');
      indicator.append(tooltip);
    }
  }
}

function stopRows(rows) {
  for (const indicator of rows.values()) {
    indicator.className = 'indicator';
    indicator.setAttribute('aria-label', 'Não verificado');
  }
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
  return button;
}

function showSummary(pages, total, failures, limited) {
  const optional = [...failures.keys()].filter(code => OPTIONAL_CODES.has(code)).length;
  const problems = failures.size - optional;
  summary.hidden = false;
  summary.replaceChildren();
  for (const [value, label] of [[pages, ' páginas'], [total - problems - optional, ' certos'], [optional, ' opcionais'], [problems, ' problemas']]) {
    const item = document.createElement('span');
    const strong = document.createElement('strong');
    strong.textContent = value;
    item.append(strong, document.createTextNode(label));
    summary.append(item);
  }
  if (limited) summary.append(document.createTextNode(` Limite de ${MAX_PAGES} URLs atingido.`));
}

function buildReport(site, pages, rules, failures, limited) {
  const optional = rules.filter(rule => OPTIONAL_CODES.has(rule.code) && failures.has(rule.code)).length;
  const problems = rules.filter(rule => !OPTIONAL_CODES.has(rule.code) && failures.has(rule.code)).length;
  const lines = [
    '# Relatório completo de auditoria SEO', '',
    `- Site: ${site}`,
    `- Gerado: ${new Date().toISOString()}`,
    `- Páginas analisadas: ${pages}`,
    `- Verificações: ${rules.length}`,
    `- Certas: ${rules.length - problems - optional}`,
    `- Melhorias opcionais: ${optional}`,
    `- Problemas: ${problems}`,
    `- Limite atingido: ${limited ? 'sim' : 'não'}`
  ];
  let category;
  for (const rule of rules) {
    if (rule.category !== category) {
      category = rule.category;
      lines.push('', `## ${category}`);
    }
    const urls = [...(failures.get(rule.code) ?? [])].sort();
    lines.push('', `### ${rule.code} / ${rule.name}`, '', `**Estado:** ${urls.length ? OPTIONAL_CODES.has(rule.code) ? 'Melhoria opcional' : 'Problema' : 'Certo'}`, '', `**Detalhes:** ${clean(rule.details)}`, '', `**Solução:** ${clean(rule.solution)}`);
    if (urls.length) lines.push('', '**Páginas afetadas:**', '', ...urls.map(url => `- ${url}`));
  }
  return `${lines.join('\n')}\n`;
}

function addFailures(target, items) {
  for (const item of items ?? []) for (const url of item.urls ?? []) addFailure(target, item.code, url);
}

function addMany(target, codes, urls) {
  for (const code of codes) for (const url of urls) addFailure(target, code, url);
}

function addFailure(target, code, url) {
  target.set(code, new Set([...(target.get(code) ?? []), url]));
}

function mergeResource(target, item) {
  const key = normalize(item.url);
  const current = target.get(key) ?? { url: key, kinds: [], owners: [] };
  current.kinds = [...new Set([...current.kinds, ...item.kinds])];
  current.owners = [...new Set([...current.owners, ...item.owners])];
  target.set(key, current);
}

async function post(body) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
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
      if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 350 * 2 ** attempt));
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
