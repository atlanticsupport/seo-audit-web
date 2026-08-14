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
    const response = await onRequestPost({ request, env: {} });
    const data = await response.json();
    assert.equal(response.status, 200);
    assert.equal(data.results[0].ownPosition, 4);
    assert.equal(data.results[0].organic[0].domain, 'example.net');
  } finally { globalThis.fetch = originalFetch; }
});

test('ranking exige uma chave quando o servidor não tem segredo', async () => {
  const request = new Request('https://audit.test/api/rank', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ domain: 'example.com', queries: ['produto personalizado'] })
  });
  assert.equal((await onRequestPost({ request, env: {} })).status, 428);
});
