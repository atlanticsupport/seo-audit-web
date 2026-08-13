# Auditor SEO verificável

Webapp minimalista que executa apenas verificações SEO determinísticas comprováveis por um crawl HTTP atual. Os critérios, detalhes e soluções vêm do catálogo SEO incluído em `docs/`.

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
