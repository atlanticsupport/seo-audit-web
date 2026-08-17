import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequestPost } from '../functions/api/rank.js';

test('ranking normaliza resultados e encontra o domínio próprio', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json({ organic: [
    { position: 1, title: 'Concorrente', link: 'https://example.net/a' },
    { position: 4, title: 'Próprio', link: 'https://www.example.com/produto' }
  ] });
  try {
    const request = new Request('https://audit.test/api/rank', {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-serper-key': 'test' },
      body: JSON.stringify({ domain: 'example.com', market: 'pt', queries: ['produto personalizado'] })
    });
    const response = await onRequestPost({ request, env: { SERPER_API_KEY: 'server-secret' } });
    const data = await response.json();
    assert.equal(response.status, 200);
    assert.equal(data.results[0].ownPosition, 4);
    assert.equal(data.results[0].organic[0].domain, 'example.net');
  } finally { globalThis.fetch = originalFetch; }
});

test('ranking exige configuração segura no servidor', async () => {
  const request = new Request('https://audit.test/api/rank', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ domain: 'example.com', queries: ['produto personalizado'] })
  });
  assert.equal((await onRequestPost({ request, env: {} })).status, 503);
});

test('ranking deteta o mercado pelo pedido Cloudflare', async () => {
  const originalFetch = globalThis.fetch;
  let requestBody;
  globalThis.fetch = async (_url, init) => { requestBody = JSON.parse(init.body); return Response.json({ organic: [] }); };
  try {
    const request = new Request('https://audit.test/api/rank', {
      method: 'POST', headers: { 'content-type': 'application/json', 'cf-ipcountry': 'ES', 'accept-language': 'es-ES' },
      body: JSON.stringify({ domain: 'example.com', queries: ['producto personalizado'] })
    });
    const response = await onRequestPost({ request, env: { SERPER_API_KEY: 'server-secret' } });
    assert.equal((await response.json()).market, 'es');
    assert.deepEqual({ gl: requestBody.gl, hl: requestBody.hl }, { gl: 'es', hl: 'es' });
  } finally { globalThis.fetch = originalFetch; }
});
