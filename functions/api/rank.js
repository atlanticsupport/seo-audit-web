const MAX_QUERIES = 50;
const PROVIDER_URL = 'https://google.serper.dev/search';

export async function onRequestPost({ request, env }) {
  if (Number(request.headers.get('content-length') ?? 0) > 50_000) return json({ error: 'Pedido demasiado grande.' }, 413);
  try {
    const body = await request.json();
    const queries = [...new Set((body.queries ?? []).map(value => String(value).trim()).filter(Boolean))].slice(0, MAX_QUERIES);
    const domain = hostname(body.domain);
    const market = detectedMarket(request);
    const language = detectedLanguage(request, market);
    const key = env.SERPER_API_KEY;
    if (!queries.length || !domain) return json({ error: 'Indica o domínio e pelo menos uma pesquisa.' }, 400);
    if (!key) return json({ error: 'ranking_not_configured' }, 503);

    const results = [];
    for (let offset = 0; offset < queries.length; offset += 5) {
      results.push(...await Promise.all(queries.slice(offset, offset + 5).map(query => search(query, domain, market, language, key))));
    }
    return json({ provider: 'Serper', market, domain, generatedAt: new Date().toISOString(), results });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Não foi possível analisar as posições.' }, 502);
  }
}

async function search(query, domain, market, language, key) {
  const response = await fetch(PROVIDER_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key },
    body: JSON.stringify({ q: query, gl: market, hl: language, num: 20 })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || `O fornecedor de ranking respondeu HTTP ${response.status}.`);
  const organic = (data.organic ?? []).map(item => ({
    position: Number(item.position),
    title: item.title ?? '',
    url: item.link ?? '',
    domain: safeHostname(item.link),
    snippet: item.snippet ?? ''
  })).filter(item => item.position && item.url);
  const own = organic.filter(item => item.domain === domain || item.domain.endsWith(`.${domain}`));
  return {
    query,
    ownPosition: own[0]?.position ?? null,
    ownUrl: own[0]?.url ?? '',
    cannibalization: own.length > 1,
    features: {
      answerBox: Boolean(data.answerBox),
      knowledgeGraph: Boolean(data.knowledgeGraph),
      peopleAlsoAsk: (data.peopleAlsoAsk ?? []).map(item => item.question).filter(Boolean).slice(0, 6),
      relatedSearches: (data.relatedSearches ?? []).map(item => item.query).filter(Boolean).slice(0, 8)
    },
    organic
  };
}

function hostname(value) {
  try { return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`).hostname.replace(/^www\./, '').toLowerCase(); }
  catch { return ''; }
}

function safeHostname(value) {
  try { return new URL(value).hostname.replace(/^www\./, '').toLowerCase(); }
  catch { return ''; }
}

function detectedMarket(request) {
  const value = String(request.cf?.country ?? request.headers.get('cf-ipcountry') ?? '').toLowerCase();
  return /^[a-z]{2}$/.test(value) ? value : 'pt';
}

function detectedLanguage(request, market) {
  return request.headers.get('accept-language')?.match(/[a-z]{2}/i)?.[0].toLowerCase() ?? market;
}

function json(body, status = 200) {
  return Response.json(body, { status, headers: { 'cache-control': 'no-store' } });
}
