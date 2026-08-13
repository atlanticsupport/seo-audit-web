import { collectSite } from '../_lib/collect.js';
import { evaluate, supportedCodes } from '../_lib/evaluate.js';

export async function onRequest({ request }) {
  if (request.method !== 'POST') return json({ error: 'Método não permitido.' }, 405, { allow: 'POST' });
  if (Number(request.headers.get('content-length') ?? 0) > 2_048) return json({ error: 'Pedido demasiado grande.' }, 413);

  try {
    const body = await request.json();
    if (typeof body?.url !== 'string' || body.url.length > 2_000) return json({ error: 'Indica um URL válido.' }, 400);
    const context = await collectSite(body.url);
    const results = evaluate(context);
    const passed = results.filter(item => item.ok).length;
    return json({
      url: context.finalUrl,
      pagesScanned: context.pages.length,
      sampled: context.sampled,
      limits: context.limits,
      supportedDetectors: supportedCodes().length,
      summary: { checked: results.length, passed, failed: results.length - passed },
      results
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível concluir a auditoria.';
    const clientError = /URL|HTTP|HTTPS|público|porta|credenciais|endereço/i.test(message);
    return json({ error: message }, clientError ? 400 : 502);
  }
}

function json(body, status = 200, headers = {}) {
  return Response.json(body, {
    status,
    headers: { 'cache-control': 'no-store', ...headers }
  });
}
