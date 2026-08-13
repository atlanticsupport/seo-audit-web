# Auditor SEO verificável

Webapp minimalista com 273 verificações SEO determinísticas. Percorre recursivamente sitemaps, links internos e recursos em lotes, conserva a evidência no browser e suporta até 50.000 páginas por auditoria sem base de dados.

## Executar

```bash
npm install
npm run build
npm run dev
```

## Verificar e publicar

```bash
npm run check
npm run deploy
```

O serviço limita URLs, redirects, bytes e tempo de resposta; aceita apenas HTTP/HTTPS público e não guarda auditorias.
