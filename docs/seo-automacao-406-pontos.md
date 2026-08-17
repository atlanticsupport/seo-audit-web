# Matriz de automatização dos 420 pontos SEO

## Resultado

Todos os 420 códigos do catálogo foram classificados individualmente segundo o tipo mínimo de execução necessário para produzir uma conclusão defensável.

| Classe | Significado | Total | Problemas | Funções |
|---|---|---:|---:|---:|
| A | Automatização local direta: código, HTTP, HTML, DOM renderizado, recursos, grafo interno ou validação estrutural. | 293 | 290 | 3 |
| B | Automatização com histórico: o teste é determinístico, mas exige duas ou mais observações persistidas. | 16 | 15 | 1 |
| C | Automatização com fonte externa: exige API, feed, ferramenta ou fornecedor de dados, mas pode ser executado sem julgamento humano depois de configurado. | 39 | 30 | 9 |
| D | Verificação híbrida: o script recolhe, mede e sinaliza candidatos, mas uma LLM ou pessoa precisa avaliar significado, veracidade, utilidade, intenção ou decisão comercial. | 72 | 62 | 10 |
| **Total** |  | **420** | **397** | **23** |

Conclusões:

- **293 pontos, 69,8%, podem ser automatizados imediatamente** com um auditor local bem construído.
- **309 pontos, 73,6%, ficam automatizados** quando o auditor também guardar snapshots históricos.
- **348 pontos, 82,9%, ficam automatizados** quando forem acrescentados os adaptadores externos necessários.
- Os restantes **72 pontos não devem receber aprovação automática**. O script pode produzir evidência e candidatos, mas a decisão final é semântica ou comercial.

Esta classificação avalia automatizabilidade, não aplicabilidade a um site concreto. Um detector só pode aprovar um código depois de implementar integralmente os critérios atómicos presentes no catálogo, possuir fixtures positivas e negativas e guardar evidência reproduzível.

## Arquitetura eficiente recomendada

Não criar 420 crawlers nem selecionar testes por palavras existentes nos nomes. Implementar uma recolha comum e um registo explícito por código:

1. `collector-http`: URLs, status, redirects, headers, tempos, tamanho e recursos.
2. `collector-html`: HTML inicial, metadados, headings, links, imagens, idioma, robots, canonical, hreflang e JSON-LD.
3. `collector-render`: DOM renderizado e diferenças face ao HTML inicial; executar somente em templates que dependam de JavaScript.
4. `collector-graph`: grafo de links internos, incoming/outgoing, profundidade, páginas órfãs e destinos.
5. `collector-media`: imagens, CSS, JavaScript e vídeo; status, redirects, MIME, bytes, dimensões e formatos.
6. `validator-sitemap-robots`: XML, limites, escopo, duplicados, diretivas e acessibilidade.
7. `validator-structured-data`: validadores dedicados por tipo, comparação com conteúdo visível e fonte de produto.
8. `snapshot-store`: valores normalizados e hashes por URL/data para os códigos da classe B.
9. `external-adapters`: GSC, Merchant Center, PageSpeed/CrUX, SERP e backlinks para a classe C.
10. `review-queue`: pacotes de evidência dos códigos da classe D, com checklist própria para decisão pela LLM/pessoa.
11. `reconciler`: garante que catálogo, testes, evidências, ocorrências e matriz possuem exatamente os mesmos códigos e não contêm contradições.

## Classe A — automatização local direta

Estes 293 pontos devem ter detectores determinísticos dedicados. Um único crawl pode fornecer dados a vários detectores, mas cada código conserva critérios, fixtures, resultado e evidência próprios.

- **`VideoObject` (2):** VDO-001, VDO-002
- **Alojamentos de férias (3):** VAC-001, VAC-002, VAC-003
- **Apresentação nos resultados do Google (6):** GSA-006, GSA-007, GSA-008, GSA-009, GSA-011, GSA-013
- **Content (20):** CNT-001, CNT-002, CNT-003, CNT-004, CNT-005, CNT-007, CNT-008, CNT-009, CNT-010, CNT-013, CNT-019, CNT-020, CNT-021, CNT-022, CNT-023, CNT-025, CNT-026, CNT-027, CNT-028, CNT-029
- **Conteúdo pago e amostragem (2):** PAY-001, PAY-002
- **CSS (6):** CSS-001, CSS-002, CSS-003, CSS-004, CSS-005, CSS-006
- **Dados estruturados — conteúdo editorial e navegação (8):** EDS-001, EDS-002, EDS-003, EDS-004, EDS-005, EDS-007, EDS-008, EDS-009
- **Dados estruturados — cursos, datasets e comunidades (9):** EDU-001, EDU-002, EDU-003, EDU-004, EDU-005, EDU-007, EDU-008, EDU-009, EDU-011
- **Dados estruturados — imagens, aplicações e conteúdo especializado (8):** SPC-001, SPC-002, SPC-003, SPC-005, SPC-006, SPC-007, SPC-008, SPC-009
- **Dados estruturados — negócios, eventos e emprego (9):** BIZ-002, BIZ-004, BIZ-005, BIZ-006, BIZ-008, BIZ-010, BIZ-011, BIZ-013, BIZ-015
- **Dados estruturados — receitas e avaliações (6):** RCP-001, RCP-002, RCP-003, RCP-004, RCP-005, RCP-006
- **Dados estruturados — regras gerais (7):** SDG-001, SDG-003, SDG-004, SDG-005, SDG-007, SDG-008, SDG-009
- **Datas editoriais (2):** DAT-002, DAT-003
- **Duplicates (1):** DUP-001
- **E-commerce — produto e oferta (13):** ECM-002, ECM-004, ECM-005, ECM-006, ECM-008, ECM-009, ECM-010, ECM-011, ECM-012, ECM-013, ECM-014, ECM-015, ECM-016
- **External pages (4):** EXT-001, EXT-002, EXT-003, EXT-004
- **Funcionalidades Google especializadas (1):** FEA-002
- **Google Images e Discover (4):** GIM-001, GIM-002, GIM-003, GIM-004
- **Identidade visual e nome do site (4):** IDN-001, IDN-002, IDN-003, IDN-004
- **Images (7):** IMG-001, IMG-002, IMG-003, IMG-004, IMG-005, IMG-006, IMG-007
- **Indexability (13):** IDX-001, IDX-002, IDX-003, IDX-004, IDX-005, IDX-006, IDX-007, IDX-008, IDX-009, IDX-010, IDX-011, IDX-012, IDX-015
- **Indexação e citação em sistemas de IA (14):** AIX-002, AIX-003, AIX-004, AIX-005, AIX-006, AIX-007, AIX-008, AIX-009, AIX-012, AIX-013, AIX-014, AIX-015, AIX-025, AIX-027
- **Funções operacionais (3):** FUN-010, FUN-018, FUN-019
- **Internal pages (6):** HTTP-001, HTTP-002, HTTP-003, HTTP-004, HTTP-005, HTTP-006
- **JavaScript (5):** JSC-001, JSC-002, JSC-003, JSC-004, JSC-005
- **Links (23):** LNK-001, LNK-002, LNK-003, LNK-004, LNK-005, LNK-006, LNK-007, LNK-008, LNK-009, LNK-010, LNK-011, LNK-012, LNK-013, LNK-014, LNK-015, LNK-016, LNK-017, LNK-018, LNK-019, LNK-020, LNK-021, LNK-022, LNK-023
- **Localization (13):** LOC-001, LOC-002, LOC-003, LOC-004, LOC-005, LOC-006, LOC-007, LOC-008, LOC-009, LOC-010, LOC-011, LOC-012, LOC-013
- **Navegação facetada e espaço de rastreamento (2):** FAC-001, FAC-002
- **Merchant listings (5):** MER-001, MER-002, MER-003, MER-004, MER-005
- **Other (8):** OTH-004, OTH-006, OTH-007, OTH-008, OTH-010, OTH-012, OTH-017, OTH-018
- **Política de devolução estruturada (5):** RET-001, RET-002, RET-003, RET-004, RET-005
- **Política de transporte estruturada (8):** SHP-001, SHP-002, SHP-003, SHP-004, SHP-005, SHP-006, SHP-007, SHP-008
- **Product snippets (5):** PRD-001, PRD-002, PRD-003, PRD-004, PRD-007
- **Programa de fidelização (3):** LOY-001, LOY-002, LOY-003
- **Redirects (9):** RED-001, RED-002, RED-003, RED-004, RED-005, RED-006, RED-007, RED-008, RED-009
- **Sitemaps (14):** SMP-001, SMP-002, SMP-003, SMP-004, SMP-005, SMP-006, SMP-007, SMP-008, SMP-009, SMP-010, SMP-011, SMP-012, SMP-013, SMP-015
- **Social tags (5):** SOC-001, SOC-002, SOC-003, SOC-004, SOC-005
- **Usability and performance (8):** UXP-001, UXP-002, UXP-003, UXP-004, UXP-005, UXP-006, UXP-012, UXP-013
- **Variantes de produto (6):** VAR-001, VAR-002, VAR-003, VAR-004, VAR-005, VAR-006
- **Vídeo na Pesquisa Google (11):** VID-001, VID-002, VID-004, VID-005, VID-006, VID-007, VID-008, VID-009, VID-010, VID-011, VID-012
- **Web Stories (5):** WST-001, WST-002, WST-003, WST-004, WST-005

### Detectores eficientes da classe A

| Família | Implementação |
|---|---|
| HTTP, páginas externas e redirects | Cliente HTTP com redirect manual, timeout, limites de bytes, headers e classificação exata por código HTTP. |
| CSS, JavaScript, imagens e vídeo | Inventário de recursos a partir de HTML e DOM, fetch por URL, MIME, bytes, dimensões, redirects, HTTPS e disponibilidade. |
| Metadados e diretivas | Parser HTML que conserva todas as ocorrências, não apenas o primeiro elemento; parser de `X-Robots-Tag` e diretivas com valores. |
| Canonical, hreflang e links | Grafo normalizado com status e canonical de cada destino, reciprocidade, idiomas, protocolos, incoming/outgoing e profundidade. |
| Sitemaps e robots | Parser conforme o formato, validação de XML, bytes, quantidade, escopo, URLs duplicadas, respostas e diretivas. |
| Dados estruturados | Registo explícito por tipo com propriedades obrigatórias, tipos, enums, formatos, relações, URLs e comparação entre HTML inicial e DOM. |
| Produto, transporte, devolução e variantes | Validadores próprios que percorrem objetos aninhados, enums, unidades, moeda, identificadores, país e relações entre variante/grupo. |
| Performance local | Lighthouse/DevTools em perfis fixos, inspeção de viewport, tap targets, compressão, peso e plugins; não confundir com dados de campo. |
| Acesso de crawlers e IA | Simulações controladas por user-agent, robots, headers, WAF e renderização; nunca considerar identificação por user-agent como autenticação. |

## Classe B — automatização com histórico

Estes 16 pontos são automáticos quando o auditor guardar snapshots normalizados e comparar observações equivalentes. O estado não pode ser concluído através de um único crawl.

- **GSA-010 — `data-nosnippet` aplicado de forma inválida ou instável:** guardar seletores, texto abrangido e DOM por versão; detetar desaparecimento ou mudança involuntária.
- **CNT-011 — H1 tag changed:** comparar H1 normalizado por canonical e template.
- **CNT-012 — Meta description changed:** comparar valor, ausência e origem de geração.
- **CNT-017 — Title tag changed:** comparar todos os `<title>` e o valor efetivo por URL.
- **CNT-018 — Word count changed:** comparar texto principal extraído com o mesmo método e excluir navegação/decoração.
- **IDX-013 — Canonical URL changed:** comparar canonical normalizada e cadeia/status do novo destino.
- **IDX-014 — Indexable page became non-indexable:** comparar robots HTML/HTTP, canonical, status e acessibilidade.
- **IDX-016 — Noindex page became indexable:** comparar as mesmas fontes e registar se a mudança foi intencional.
- **AIX-026 — Mudanças de preview, robots ou conteúdo não são revalidadas:** ligar eventos de deploy aos testes afetados e exigir novo snapshot.
- **MRC-002 — Feed sem cadência adequada à volatilidade:** medir atraso entre alteração da fonte comercial, feed e página; a regra de adequação deve ser configurada pelo negócio.
- **FUN-016 — Validar alterações e aprender com os resultados:** guardar baseline, anotação da mudança, janelas comparáveis e decisão.
- **OTH-009 — Robots.txt changed:** versionar conteúdo, hash, regras efetivas e impacto nas URLs conhecidas.
- **RED-010 — Redirect target changed:** comparar destino final e cadeia por URL de origem.
- **SMP-014 — No. of URLs in sitemap decreased:** comparar contagem por sitemap e listar URLs removidas.
- **SMP-016 — Pages added to sitemaps:** produzir diff de URLs adicionadas e respetivo estado.
- **SMP-017 — Pages removed from sitemaps:** produzir diff de URLs removidas e verificar canonical/indexabilidade.

O armazenamento pode ser um conjunto de ficheiros JSON comprimidos por auditoria. Para uma auditoria pontual não é necessária uma base de dados remota; basta conservar pelo menos o snapshot anterior com a mesma versão dos extratores.

## Classe C — automatização com fontes externas

Estes 39 pontos são automatizáveis, mas não através do crawler isolado. Sem a fonte indicada, devem ficar `Não verificável`.

- **CNT-014 — Page and SERP titles do not match:** recolher o title apresentado na SERP por consulta/URL e comparar com o HTML.
- **CNT-016 — SERP title changed:** guardar observações da SERP e comparar períodos equivalentes.
- **FEA-003 — Package Tracking tratado como integração aberta:** verificar a lista e documentação oficial vigente da funcionalidade.
- **FEA-004 — Funcionalidade obsoleta tratada como rich result atual:** sincronizar galeria e changelog oficiais, preservando data da fonte.
- **AIX-001 — Página importante não está indexada:** usar URL Inspection/GSC; `noindex` ausente não prova indexação.
- **AIX-018 — Factos comerciais estão desatualizados:** comparar site com catálogo/ERP/feed autorizado e timestamps.
- **AIX-023 — Site mede apenas rankings clássicos e não deteta citações em IA:** executar consultas de monitorização em fontes permitidas e guardar citações, respostas e limitações.
- **MRC-003 — Configurações comerciais com precedência inesperada:** ler Merchant Center/API e comparar precedência com schema e feed.
- **FUN-002 — Recolher a procura e o desempenho real do próprio site:** GSC Search Analytics e, quando autorizado, Analytics/conversões.
- **FUN-003 — Descobrir automaticamente concorrentes orgânicos:** dados SERP por mercado, idioma, dispositivo e cluster.
- **FUN-004 — Descobrir concorrentes quando o site tem poucos rankings:** SERPs construídas a partir de seeds comerciais e entidades.
- **FUN-005 — Obter o portfólio de keywords e páginas dos concorrentes:** fornecedor de rankings/keywords ou exportação autorizada.
- **FUN-014 — Detetar canibalização por consulta e intenção:** dados GSC query–page e clustering; revisão apenas nos casos semanticamente ambíguos.
- **FUN-015 — Monitorizar posições, concorrentes e Share of Voice:** snapshots SERP e pesos de procura configurados.
- **FUN-020 — Diagnosticar e reduzir index bloat por padrões de URL:** GSC, sitemaps, crawl, rotas e logs agrupados por template e parâmetros.
- **FUN-021 — Auditar presença local e Google Business Profile:** Business Profile API/exportação, site, avaliações e dados estruturados por localização.
- **FUN-022 — Cruzar Google Ads e Search Console para priorizar SEO:** termos pagos e consultas orgânicas alinhados por mercado, dispositivo e período.
- **MER-006 — Portes estruturados não correspondem ao checkout:** browser de teste ou API de checkout com destinos e carrinhos controlados.
- **MER-007 — Feed Merchant Center diverge do site:** Merchant Center/feed + página/JSON-LD + fonte de produtos.
- **OTH-001 — 3XX page receives organic traffic:** GSC por página cruzado com resposta HTTP.
- **OTH-002 — 403 page receives organic traffic:** GSC por página cruzado com resposta HTTP e URL Inspection.
- **OTH-003 — 4XX page receives organic traffic:** GSC por página cruzado com resposta HTTP.
- **OTH-005 — Noindex page receives organic traffic:** GSC por página cruzado com diretivas atuais e histórico.
- **OTH-011 — Structured data has Google rich results validation error:** Rich Results Test/URL Inspection ou exportação oficial aplicável; não substituir por mera validade JSON-LD.
- **OTH-013 — No. of referring domains dropped:** índice de backlinks com snapshots comparáveis.
- **OTH-014 — Non-canonical page receives organic traffic:** GSC por página + canonical observada e escolhida pelo Google quando disponível.
- **OTH-015 — Organic traffic dropped:** GSC/Analytics, períodos equivalentes e segmentação.
- **OTH-016 — Pages dropped from Top 10:** histórico de SERP ou fonte de rankings.
- **PRD-006 — Página de produto não indexada:** URL Inspection/GSC por canonical de produto.
- **SEC-001 — Search Console reporta um problema de segurança:** relatório Security Issues, categorias e amostras.
- **SEC-002 — URL injetado ou spam continua acessível depois da limpeza:** lista completa do incidente e respetivas respostas atuais.
- **SEC-003 — URL pirateado redireciona para uma página legítima sem equivalência:** URLs do incidente, cadeias e avaliação de equivalência definida pelo plano de recuperação.
- **SEC-005 — Revisão de segurança pedida no momento errado ou sem evidência completa:** estado e histórico de revisão no Search Console.
- **SEC-006 — Fontes internas continuam a publicar URLs do incidente:** padrões conhecidos cruzados com crawl, sitemaps, feeds, rotas e caches.
- **UXP-007 — Page stopped passing CWV requirements:** CrUX/GSC histórico, não apenas Lighthouse.
- **UXP-008 — Pages with poor CLS:** dados de campo CrUX/GSC; laboratório apenas para diagnóstico.
- **UXP-009 — Pages with poor FID:** histórico de campo quando o período ainda possuir FID; não inventar o valor em dados atuais que já usam INP.
- **UXP-010 — Pages with poor INP:** CrUX/GSC por origem ou URL quando houver amostra suficiente.
- **UXP-011 — Pages with poor LCP:** CrUX/GSC por origem ou URL quando houver amostra suficiente.

## Classe D — verificação híbrida

Nestes 72 pontos o script deve recolher factos, calcular sinais e ordenar candidatos. A aprovação ou reprovação final exige checklist semântica por LLM/pessoa. Um score ou limiar nunca deve converter automaticamente estes códigos em `Aprovado`.

- **GSA-001 — Título vago, duplicado ou com boilerplate excessivo**
- **GSA-002 — Keyword stuffing ou branding repetitivo no título**
- **GSA-003 — Título principal visual ambíguo**
- **GSA-004 — Título inexato, obsoleto ou no idioma errado**
- **GSA-005 — Meta description duplicada, genérica ou composta por palavras-chave**
- **GSA-012 — Estrutura interna não evidencia páginas candidatas a sitelinks**
- **GSA-014 — Título e landing page não correspondem às consultas reais do Search Console**
- **CNT-006 — Low word count**
- **CNT-015 — Pages have high AI content levels**
- **CNT-024 — Low word count**
- **CNT-030 — Página de categoria comercial não ajuda a selecionar produtos**
- **CNT-031 — Produtos ou variantes têm conteúdo praticamente idêntico**
- **CNT-032 — Pesquisas relevantes anteriores à compra não têm resposta adequada**
- **CNT-033 — Página de produto não fornece informação suficiente para decidir a compra**
- **PAY-003 — Paywall não fornece uma amostra útil**
- **EDS-006 — Breadcrumb reflete parâmetros em vez da hierarquia útil**
- **EDU-006 — `DiscussionForumPosting` aplicado a conteúdo inadequado**
- **EDU-010 — `QAPage` aplicado ao tipo de página errado**
- **SPC-004 — `MathSolver` aplicado a implementação inelegível**
- **BIZ-001 — `EmployerAggregateRating` usa fonte ou entidade inválida**
- **BIZ-003 — `Event` aplicado a página ou evento inelegível**
- **BIZ-007 — Título ou descrição de emprego inválidos**
- **BIZ-009 — Vaga remota mal classificada**
- **BIZ-012 — `Organization` sem identidade técnica suficiente**
- **BIZ-014 — `ProfilePage` aplicado a página sem uma entidade principal**
- **RCP-007 — Reviews não visíveis, falsas ou agregadas externamente**
- **RCP-008 — Rating self-serving tratado como oportunidade de estrelas**
- **SDG-002 — Dados estruturados não representam o conteúdo visível**
- **SDG-006 — Tipo demasiado genérico ou foco principal da página não marcado**
- **SDG-010 — Enriched result aplicado a página de listagem**
- **DAT-001 — Data de publicação ou atualização ausente ou pouco evidente**
- **DAT-004 — Datas concorrentes sem rótulo claro**
- **ECM-001 — Dados de produto aplicados a página incompatível**
- **ECM-003 — Imagem de produto inelegível ou insuficiente**
- **ECM-007 — Produto adulto sem sinalização explícita**
- **ECM-017 — Pros e contras aplicados em contexto inelegível**
- **FEA-001 — Lista Top Places não é independente ou genuína**
- **GIM-005 — Imagem principal ausente ou inadequada**
- **GIM-006 — Filename genérico ou keyword stuffing no `alt`**
- **GIM-007 — Imagem afastada do contexto relevante**
- **GIM-008 — Imagem insuficiente para o Discover**
- **GIM-009 — Preview enganador ou imagem Discover genérica**
- **IDN-005 — Site name genérico, enganador ou excessivamente longo**
- **IDN-006 — Site name validado na ferramenta errada**
- **AIX-010 — Conteúdo importante está numa imagem, canvas ou PDF não acessível**
- **AIX-011 — Estrutura semântica não deixa claro o que é resposta e o que é decoração**
- **AIX-016 — JSON-LD não corresponde ao texto visível**
- **AIX-017 — Produto sem identidade e atributos suficientes**
- **AIX-019 — Conteúdo genérico, reciclado ou criado apenas para variações de consulta**
- **AIX-020 — Página não demonstra quem responde e de onde vêm os factos**
- **AIX-021 — Links de apoio estão quebrados ou apontam para fontes irrelevantes**
- **AIX-022 — Localização e negócio local incompletos**
- **AIX-024 — Acesso autorizado é confundido com garantia de citação**
- **MRC-001 — Dependência exclusiva de uma fonte de produto**
- **FUN-001 — Configurar o contexto competitivo do projeto**
- **FUN-006 — Calcular Content Gap e fraquezas por intenção**
- **FUN-007 — Determinar intenção e formato exigido pela SERP**
- **FUN-008 — Comparar a página própria com páginas concorrentes vencedoras**
- **FUN-009 — Encontrar páginas e padrões que mais funcionam nos concorrentes**
- **FUN-011 — Encontrar oportunidades legítimas de referências externas**
- **FUN-012 — Priorizar oportunidades de ranking**
- **FUN-013 — Produzir um plano técnico de melhoria para uma página**
- **FUN-017 — Orquestrar a análise competitiva completa**
- **FUN-023 — Executar gate SEO de lançamento ou migração**
- **OTH-019 — Páginas importantes têm poucas referências externas independentes**
- **PRD-005 — Disponibilidade estruturada diverge do produto**
- **PRD-008 — Dados de produto inconsistentes entre idiomas ou regiões**
- **PRD-009 — Ciclo de vida de produto indisponível é incoerente**
- **SEC-004 — O vetor que permitiu a invasão não foi fechado**
- **VID-003 — Watch page não é indexável ou o vídeo não é o conteúdo principal**
- **WST-006 — Web Story demasiado textual ou com assets degradados**
- **WST-007 — Web Story excessivamente comercial**

### O que automatizar nos pontos híbridos

| Tipo de julgamento | Trabalho do script | Decisão da LLM/pessoa |
|---|---|---|
| Qualidade de títulos, descriptions e conteúdo | Duplicação, frequência de termos, idioma provável, entidades, similaridade, comprimento e conteúdo ausente. | Clareza, precisão, utilidade, intenção e naturalidade. |
| Adequação do tipo estruturado | Tipo de página, objetos presentes, elementos visíveis e relações. | Se a entidade e o contexto representam genuinamente o conteúdo. |
| Imagens e vídeo | Dimensões, formato, bytes, posição, alt, thumbnail e distância ao texto. | Representatividade, qualidade, caráter enganador ou comercial excessivo. |
| Reviews, ratings e dados comerciais | Origem técnica, correspondência, contagens e domínio controlador. | Genuinidade, independência, classificação adulta e validade comercial. |
| Autoridade e citação em IA | Autores, fontes, referências, factos, datas, links e identidade estruturada. | Ganho de informação, confiança, relevância das fontes e suficiência dos atributos. |
| Concorrência e oportunidades | Recolha, clustering, diferenças, métricas e candidatos. | Relevância para o negócio, intenção, prioridade e plano editorial/técnico. |

## Ordem de implementação

### Versão 1 — maior retorno com menor complexidade

Implementar primeiro a classe A, exceto renderização pesada de vídeo/Web Stories quando o projeto não possuir esses tipos. O mesmo crawl deve alimentar HTTP, metadados, links, sitemaps, robots, recursos, localization e dados estruturados. Isto cobre 293 pontos sem armazenamento remoto.

### Versão 2 — snapshots locais

Adicionar a classe B através de ficheiros por auditoria. Guardar somente dados normalizados e hashes relevantes, não HTML integral de todas as páginas, salvo como evidência seletiva.

### Versão 3 — dados oficiais gratuitos

Adicionar primeiro GSC e PageSpeed/CrUX. Merchant Center só é necessário para lojas que o utilizem. Estas fontes desbloqueiam grande parte da classe C sem exigir uma plataforma paga.

### Versão 4 — fontes potencialmente pagas

SERPs em escala, rankings concorrentes e backlinks não podem ser replicados com a mesma cobertura do Ahrefs sem uma base própria ou fornecedor. Tornar os adaptadores opcionais e permitir importações CSV para manter o auditor utilizável sem custos.

### Versão 5 — revisão por LLM

Entregar os 68 pacotes híbridos à LLM apenas depois dos coletores terminarem. Cada pacote deve conter o bloco integral do código, checklist, URLs, valores observados, screenshots/DOM quando necessário e decisão permitida. A LLM não deve repetir o crawl nem aprovar por ausência de um sinal genérico.

## Critério de conclusão da implementação

O auditor só pode afirmar que suporta um código quando:

1. O código possui registo explícito e detector/checklist próprio.
2. Todos os critérios atómicos do catálogo estão mapeados.
3. Existem fixtures válidas e mutações inválidas para cada ramo material.
4. A evidência contém valores observados, esperados, universo e versão.
5. O reconciliador confirma que os 420 códigos aparecem exatamente uma vez.
6. Códigos das classes B, C e D não são convertidos em A por conveniência ou ausência de dados.
