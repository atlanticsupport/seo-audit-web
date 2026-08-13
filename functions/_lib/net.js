const PRIVATE_V4 = [
  /^0\./,
  /^10\./,
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,
  /^127\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.0\.0\./,
  /^192\.0\.2\./,
  /^192\.168\./,
  /^198\.(1[89])\./,
  /^198\.51\.100\./,
  /^203\.0\.113\./,
  /^(22[4-9]|23\d)\./,
  /^(24\d|25[0-5])\./
];

export function publicUrl(value, base) {
  const raw = String(value ?? '').trim();
  if (!base && /^[a-z][a-z\d+.-]*:/i.test(raw) && !/^https?:/i.test(raw)) throw new Error('Usa um URL HTTP ou HTTPS.');
  const candidate = base ? new URL(raw, base) : new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  if (!['http:', 'https:'].includes(candidate.protocol)) throw new Error('Usa um URL HTTP ou HTTPS.');
  if (candidate.username || candidate.password) throw new Error('O URL não pode conter credenciais.');
  if (candidate.port && !['80', '443'].includes(candidate.port)) throw new Error('Apenas as portas HTTP e HTTPS padrão são permitidas.');

  const host = candidate.hostname.toLowerCase().replace(/\.$/, '');
  if (!host || host === 'localhost' || /\.(localhost|local|internal|home|lan|test|invalid)$/.test(host)) throw new Error('O endereço tem de ser público.');
  if (host.includes(':') || PRIVATE_V4.some(pattern => pattern.test(host))) throw new Error('Endereços IP privados ou reservados não são permitidos.');
  return candidate;
}

export async function fetchLimited(value, options = {}) {
  const maxBytes = options.maxBytes ?? 600_000;
  const headers = new Headers(options.headers);
  headers.set('accept', options.accept ?? 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.5');
  headers.set('user-agent', options.userAgent ?? 'Mozilla/5.0 (compatible; VerifiableSEOAudit/1.0; +https://seo-audit-web.pages.dev)');
  let url = publicUrl(value, options.base);
  const redirects = [];
  const started = Date.now();

  try {
    for (let hop = 0; hop <= (options.maxRedirects ?? 4); hop++) {
      const response = await fetch(url, {
        method: options.method ?? 'GET',
        headers,
        redirect: 'manual',
        signal: AbortSignal.timeout(options.timeout ?? 8_000)
      });
      const status = response.status;
      if (status >= 300 && status < 400 && response.headers.has('location')) {
        const next = publicUrl(response.headers.get('location'), url);
        redirects.push({ from: url.href, to: next.href, status });
        url = next;
        continue;
      }

      const contentLength = number(response.headers.get('content-range')?.match(/\/(\d+)$/)?.[1]) || number(response.headers.get('content-length'));
      const data = options.method === 'HEAD' ? { bytes: new Uint8Array(), truncated: false } : await readBody(response.body, maxBytes);
      return {
        requestedUrl: publicUrl(value, options.base).href,
        finalUrl: url.href,
        status,
        headers: Object.fromEntries(response.headers),
        contentType: response.headers.get('content-type')?.toLowerCase() ?? '',
        contentLength: contentLength || data.bytes.byteLength,
        bytes: data.bytes,
        text: isText(response.headers.get('content-type')) ? new TextDecoder().decode(data.bytes) : '',
        truncated: data.truncated || contentLength > maxBytes,
        redirects,
        elapsedMs: Date.now() - started,
        error: ''
      };
    }
    return failure(value, started, redirects, 'redirect_limit');
  } catch (error) {
    return failure(value, started, redirects, error?.name === 'TimeoutError' ? 'timeout' : 'fetch_failed');
  }
}

async function readBody(body, maxBytes) {
  if (!body) return { bytes: new Uint8Array(), truncated: false };
  const reader = body.getReader();
  const chunks = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const room = maxBytes - total;
    if (room <= 0) {
      await reader.cancel();
      return { bytes: join(chunks, total), truncated: true };
    }
    chunks.push(value.byteLength <= room ? value : value.slice(0, room));
    total += Math.min(value.byteLength, room);
    if (value.byteLength > room) {
      await reader.cancel();
      return { bytes: join(chunks, total), truncated: true };
    }
  }
  return { bytes: join(chunks, total), truncated: false };
}

function join(chunks, total) {
  const output = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return output;
}

function isText(contentType = '') {
  return /(?:text\/|json|javascript|xml|svg)/i.test(contentType);
}

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function failure(value, started, redirects, error) {
  return {
    requestedUrl: String(value), finalUrl: redirects.at(-1)?.to ?? String(value), status: 0,
    headers: {}, contentType: '', contentLength: 0, bytes: new Uint8Array(), text: '', truncated: false,
    redirects, elapsedMs: Date.now() - started, error
  };
}
