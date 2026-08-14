import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { onRequest } from '../functions/api/audit.js';
import { parsePage } from '../functions/_lib/html.js';
import { publicUrl } from '../functions/_lib/net.js';
import { evaluate, supportedCodes } from '../functions/_lib/evaluate.js';
import { RULES } from '../functions/_lib/rules.generated.js';

test('o registo contém 288 problemas diretos e 273 detetores executáveis neste runtime', () => {
  assert.equal(RULES.length, 288);
  assert.equal(new Set(RULES.map(rule => rule.code)).size, 288);
  assert.equal(supportedCodes().length, 273);
  assert.ok(supportedCodes().every(code => RULES.some(rule => rule.code === code)));
});

test('a interface recebe apenas as 273 regras com detetor', async () => {
  const rules = JSON.parse(await readFile(new URL('../public/supported-rules.json', import.meta.url), 'utf8'));
  assert.equal(rules.length, 273);
  assert.deepEqual(rules.map(rule => rule.code).sort(), supportedCodes());
});

test('a interface respeita a CSP sem estilos inline', async () => {
  const [html, app] = await Promise.all([
    readFile(new URL('../public/index.html', import.meta.url), 'utf8'),
    readFile(new URL('../public/app.js', import.meta.url), 'utf8')
  ]);
  assert.doesNotMatch(html, /\sstyle=/i);
  assert.doesNotMatch(app, /\.style\.|setAttribute\(['"]style/);
});

test('o relatório para LLM exporta só findings e referencia URLs sem repetição', async () => {
  const app = await readFile(new URL('../public/app.js', import.meta.url), 'utf8');
  const source = app.slice(app.indexOf('function buildReport'), app.indexOf('function resetRanking'));
  const buildReport = Function('OPTIONAL_CODES', 'clean', `${source}; return buildReport;`)(new Set(['OPT']), value => String(value ?? '').replace(/\s+/g, ' ').trim());
  const report = buildReport({
    site: 'https://example.com/', pages: 2, pagesMap: new Map(), limited: false, gsc: null, serp: null, comparisons: [],
    rules: [
      { code: 'ERR', name: 'Erro', category: 'Técnico', details: 'Falha real.', solution: 'Corrigir.' },
      { code: 'OPT', name: 'Opcional', category: 'Conteúdo', details: 'Melhoria.', solution: 'Otimizar.' },
      { code: 'PASS', name: 'Correto', category: 'Técnico', details: 'Texto inútil.', solution: 'Nada.' }
    ],
    failures: new Map([['ERR', new Set(['https://example.com/a'])], ['OPT', new Set(['https://example.com/a'])]])
  });
  assert.match(report, /^# SEO_AUDIT_V2/m);
  assert.match(report, /scan: pages=2; checks=3; passed=1; optional=1; errors=1; crawl_limited=false/);
  assert.match(report, /### ERR\|error\|Técnico\|Erro/);
  assert.match(report, /### OPT\|optional\|Conteúdo\|Opcional/);
  assert.doesNotMatch(report, /PASS|Texto inútil|Nada\./);
  assert.equal(report.match(/https:\/\/example\.com\/a/g)?.length, 1);
});

test('endereços privados e protocolos impróprios são recusados', () => {
  assert.throws(() => publicUrl('http://127.0.0.1'));
  assert.throws(() => publicUrl('http://10.0.0.1'));
  assert.throws(() => publicUrl('file:///etc/passwd'));
  assert.equal(publicUrl('example.com').href, 'https://example.com/');
});

test('bootstrap devolve JSON sem analisar novamente o HTML completo', async t => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, options) => {
    const url = String(input);
    const headers = new Headers(options?.headers);
    const agent = headers.get('user-agent') ?? '';
    assert.equal(headers.get('accept-encoding'), 'br, gzip');
    if (url.endsWith('/robots.txt')) return new Response('User-agent: *\nAllow: /', { status: 200, headers: { 'content-type': 'text/plain' } });
    return new Response('<!doctype html><title>Teste</title>', { status: agent.includes('OAI-SearchBot') ? 403 : 200, headers: { 'content-type': 'text/html' } });
  };
  t.after(() => { globalThis.fetch = originalFetch; });

  const response = await onRequest({ request: new Request('https://audit.test/api/audit', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'bootstrap', url: 'example.com' })
  }) });
  const data = await response.json();
  assert.equal(response.headers.get('content-type'), 'application/json');
  assert.equal(data.root, 'https://example.com/');
  assert.deepEqual(data.failures.map(item => item.code), ['AIX-003', 'AIX-005']);
});

test('PageSpeed usa a chave do servidor e devolve Lighthouse compacto', async t => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async input => {
    const url = String(input);
    assert.match(url, /key=server-key/);
    if (url.includes('chromeuxreport')) return Response.json({ error: { message: 'not found' } }, { status: 404 });
    return Response.json({ lighthouseResult: {
      finalUrl: 'https://example.com/', fetchTime: '2026-08-14T12:00:00Z',
      categories: { performance: { score: .72, auditRefs: [{ id: 'render-blocking-insight', group: 'insights' }] }, seo: { score: 1 } },
      audits: {
        'first-contentful-paint': { numericValue: 2_000 }, 'largest-contentful-paint': { numericValue: 4_200 },
        'total-blocking-time': { numericValue: 300 }, 'cumulative-layout-shift': { numericValue: .12 }, 'speed-index': { numericValue: 3_000 },
        'render-blocking-insight': { id: 'render-blocking-insight', title: 'Render blocking', score: 0, displayValue: '1,200 ms', details: { items: [{ url: 'https://example.com/app.css', wastedMs: 1_200 }] } }
      }
    } });
  };
  t.after(() => { globalThis.fetch = originalFetch; });

  const request = new Request('https://audit.test/api/audit', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'performance', root: 'https://example.com/', urls: ['https://example.com/'] })
  });
  const response = await onRequest({ request, env: { GOOGLE_API_KEY: 'server-key' } });
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.pages.length, 2);
  assert.equal(data.pages[0].score, 72);
  assert.equal(data.pages[0].metrics.lcpMs, 4_200);
  assert.deepEqual(data.pages[0].audits[0], { id: 'render-blocking-insight', title: 'Render blocking', score: 0, display: '1,200 ms', resources: ['https://example.com/app.css (wastedMs=1200)'] });
  assert.equal(data.crux, null);
});

test('PageSpeed recusa execução sem chave no servidor', async () => {
  const request = new Request('https://audit.test/api/audit', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'performance', root: 'https://example.com/', urls: ['https://example.com/'] })
  });
  assert.equal((await onRequest({ request, env: {} })).status, 503);
});

test('fixture válida e mutações mínimas produzem resultados distintos', () => {
  const valid = page(`<!doctype html><html lang="pt"><head>
    <title>Auditoria SEO técnica completa para aplicações modernas</title>
    <meta name="description" content="Auditoria técnica completa, verificável e reproduzível para encontrar problemas reais de SEO no código e na publicação de aplicações web modernas.">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="canonical" href="https://example.com/">
    <meta property="og:title" content="Auditoria SEO"><meta property="og:description" content="Descrição">
    <meta property="og:image" content="https://example.com/a.jpg"><meta property="og:url" content="https://example.com/"><meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="Auditoria SEO"><meta name="twitter:description" content="Descrição"><meta name="twitter:image" content="https://example.com/a.jpg">
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite","name":"Example","url":"https://example.com/"}</script>
  </head><body><h1>Auditoria SEO técnica</h1><a href="/guia">Guia</a></body></html>`);
  const validResults = resultMap(context(valid));
  assert.equal(validResults.get('CNT-003'), true);
  assert.equal(validResults.get('CNT-005'), true);
  assert.equal(validResults.get('CNT-007'), true);
  assert.equal(validResults.get('LOC-011'), true);
  assert.equal(validResults.get('UXP-013'), true);
  assert.equal(validResults.get('SOC-004'), true);

  const invalid = page('<html><head><title></title><title>Segundo</title></head><body></body></html>');
  const invalidResults = resultMap(context(invalid));
  assert.equal(invalidResults.get('CNT-002'), false);
  assert.equal(invalidResults.get('CNT-003'), false);
  assert.equal(invalidResults.get('CNT-005'), false);
  assert.equal(invalidResults.get('LOC-011'), false);
  assert.equal(invalidResults.get('UXP-013'), false);

  const noindexResults = resultMap(context(page('<html lang="pt"><head><meta name="robots" content="noindex"></head><body></body></html>')));
  assert.equal(noindexResults.get('IDX-005'), false);

  const fallback = resultMap(context(page('<html lang="pt-PT"><head><link rel="alternate" hreflang="pt-PT" href="https://example.com/"><link rel="alternate" hreflang="x-default" href="https://example.com/"></head></html>')));
  assert.equal(fallback.get('LOC-008'), true);

  const conflicting = resultMap(context(page('<html lang="pt"><head><link rel="alternate" hreflang="pt-PT" href="https://example.com/"><link rel="alternate" hreflang="en-GB" href="https://example.com/"></head></html>')));
  assert.equal(conflicting.get('LOC-008'), false);
});

function page(text) {
  return parsePage({
    requestedUrl: 'https://example.com/', finalUrl: 'https://example.com/', status: 200,
    headers: { 'content-type': 'text/html', 'content-encoding': 'gzip' }, contentType: 'text/html',
    contentLength: new TextEncoder().encode(text).length, bytes: new TextEncoder().encode(text), text,
    truncated: false, redirects: [], elapsedMs: 80, error: ''
  });
}

function context(parsed) {
  const responseMap = new Map([[parsed.url, parsed]]);
  return {
    startUrl: parsed.url, finalUrl: parsed.url, origin: parsed.origin, pages: [parsed], pageResponses: responseMap,
    targets: new Map(), resources: [], sitemaps: [], bots: {
      googlebot: parsed, oaiSearchBot: parsed, perplexityBot: parsed
    },
    robots: {
      response: { status: 404, redirects: [], error: '', text: '' }, errors: [],
      disallows: () => false
    }
  };
}

function resultMap(value) {
  return new Map(evaluate(value).map(item => [item.code, item.ok]));
}
