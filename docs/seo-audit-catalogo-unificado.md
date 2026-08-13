# Instruções operacionais para a LLM — auditoria SEO integral

## Natureza deste ficheiro

Este ficheiro é simultaneamente:

1. Uma especificação executável de auditoria SEO.
2. Um catálogo de problemas técnicos, critérios de deteção e soluções.
3. Um conjunto de funções operacionais para recolher informação, investigar oportunidades e produzir planos de melhoria.

A LLM deve usar todo o conteúdo deste ficheiro como lista de controlo normativa. Não deve tratá-lo apenas como material de referência, resumir algumas secções ou selecionar os problemas mais conhecidos. O objetivo é executar uma auditoria única, extensiva, reproduzível e baseada em evidências sobre o projeto fornecido pelo utilizador.

As informações adicionais enviadas juntamente com este ficheiro identificam o projeto e podem restringir ou ampliar o âmbito. Quando houver conflito, instruções explícitas do utilizador prevalecem. Isso não autoriza a omissão silenciosa de pontos do catálogo: qualquer exclusão deve continuar registada e justificada na matriz de cobertura.

## Objetivo obrigatório

Analisar o código-fonte, a aplicação executável e o site publicado; descobrir todas as páginas úteis acessíveis; avaliar individualmente todos os problemas e funções presentes neste documento; apresentar evidência concreta; corrigir o código quando isso tiver sido expressamente autorizado; repetir os testes afetados; e entregar uma matriz que demonstre que nenhum ponto foi ignorado.

Uma auditoria não está concluída apenas porque foram encontrados alguns problemas importantes. Só está concluída quando todos os códigos do documento tiverem um estado explícito, todas as limitações forem declaradas e a contagem da matriz corresponder à contagem de códigos existentes no ficheiro.

## Informações de entrada

A LLM deve extrair da mensagem do utilizador, do repositório e do site tudo o que estiver disponível:

- Nome do projeto.
- Caminho ou repositório do código-fonte.
- URL de produção e, quando aplicável, URL de staging.
- Domínio canonical esperado.
- Framework, runtime, sistema de publicação e alojamento.
- Países, idiomas e público-alvo.
- Tipo de aplicação e tipos de página: institucional, SaaS, e-commerce, produto, categoria, artigo, documentação ou outros.
- Objetivos comerciais, produtos ou serviços prioritários e conversões relevantes.
- Concorrentes conhecidos, quando fornecidos.
- Acesso opcional ao Google Search Console, Analytics, Merchant Center, feeds ou exportações.
- Restrições de crawling, autenticação ou ambientes que não podem ser alterados.
- Modo solicitado: `auditoria` ou `auditoria_e_correcao`.

Se uma informação não tiver sido fornecida, a LLM deve tentar obtê-la por inspeção segura. Deve perguntar apenas quando a resposta alterar materialmente o âmbito ou exigir uma autorização que não possa ser inferida. Na ausência de indicação sobre o modo, usar `auditoria`: inspecionar e reportar não autoriza alterações no código, deploy, dados ou serviços externos.

## Mensagem inicial e acesso opcional ao Search Console

No início da execução, a LLM deve confirmar numa mensagem curta o domínio, o repositório e o modo identificados. Quando os dados do Search Console puderem melhorar a auditoria, deve incluir imediatamente:

> O acesso ao Search Console é opcional, mas permite confirmar consultas, impressões, cliques, sitemaps e o estado que o Google atribui às URLs. Para ligar temporariamente em modo de leitura, abre [Autorizar acesso ao Google Search Console](https://seo-gsc-oauth.support-e04.workers.dev/oauth/start), escolhe a conta que gere o domínio e diz-me quando aparecer “Search Console ligado”. Entretanto, continuo a auditoria técnica que não depende do GSC.

A LLM não deve esperar inativa pela autorização. Deve executar em paralelo todo o trabalho que não dependa do GSC. Nunca deve pedir palavra-passe, client secret, código OAuth, access token ou refresh token. O procedimento completo encontra-se em `FUN-019`.

## Regras invioláveis de cobertura

1. Ler este ficheiro integralmente até ao fim antes de declarar o plano de auditoria definitivo. Se a ferramenta de leitura truncar ou paginar o conteúdo, continuar a leitura até EOF.
2. Extrair programaticamente todos os títulos no formato `### CÓDIGO / Nome`, detetar códigos duplicados e estabelecer o total esperado antes de avaliar resultados.
3. Criar uma linha na matriz para cada código. É proibido omitir códigos por parecerem irrelevantes, repetitivos, simples, difíceis, não suportados pela ferramenta ou referentes a um tipo de página ausente.
4. Avaliar aplicabilidade antes de executar o teste. Um ponto pode não se aplicar, mas deve aparecer como `Não aplicável` com uma justificação factual específica.
5. Usar `Não verificável` quando faltarem dados, acesso, histórico, ferramentas ou condições de observação. Ausência de evidência nunca significa `Aprovado`.
6. Usar `Aprovado` apenas depois de executar uma verificação adequada e conservar evidência suficiente para reproduzi-la.
7. Usar `Problema encontrado` apenas com evidência concreta. Não apresentar como facto uma hipótese baseada apenas em correlação, posição média, CTR, ferramenta externa ou comportamento de um concorrente.
8. Distinguir problemas únicos das suas ocorrências. Um código ocupa uma linha de cobertura, mas deve listar ou anexar todas as URLs, componentes ou ficheiros afetados, não apenas um exemplo conveniente.
9. Não limitar silenciosamente a auditoria a uma amostra. Se o volume obrigar a amostragem, explicar o método, o universo, o tamanho, os tipos de página cobertos e as URLs não testadas; os pontos afetados ficam `Não verificável integralmente`, nunca aprovados para todo o site.
10. Não interromper toda a auditoria porque uma integração falhou. Registar a limitação, executar métodos alternativos seguros e continuar os restantes módulos.
11. Não substituir critérios técnicos do documento por recomendações vagas como “melhorar o SEO”, “criar conteúdo de qualidade” ou “otimizar a página”. Cada diagnóstico e solução deve indicar o elemento, valor atual, valor esperado e ação concreta.
12. Não inventar métricas, volumes, posições, backlinks, erros GSC, resultados de testes ou comportamentos do Google. Identificar estimativas e hipóteses como tal.
13. Quando uma referência normativa tiver mudado, verificar a documentação oficial atual, registar a divergência e aplicar a regra vigente. Não eliminar o código da matriz.
14. Se o contexto disponível se aproximar do limite, guardar resultados intermédios em ficheiros e continuar por lotes. Limitação de contexto não é motivo para reduzir a cobertura.

## Protocolo anti-skip e contra aprovações falsas

Criar uma linha por código não demonstra que o código foi realmente verificado. A LLM deve distinguir obrigatoriamente:

- `cobertura_documental`: o código existe na matriz;
- `cobertura_de_execucao`: foi executado um método que implementa todos os critérios técnicos do código;
- `cobertura_de_evidencia`: o resultado pode ser reproduzido a partir dos dados guardados;
- `cobertura_de_revalidacao`: quando houve correção, o mesmo critério voltou a ser executado depois da alteração.

É proibido apresentar `406/406`, `100%` ou expressão equivalente como prova de auditoria validada quando isso significa apenas que foram criadas linhas na matriz. O relatório deve apresentar separadamente os quatro tipos de cobertura.

### Registo obrigatório de testes por código

Antes de classificar qualquer código, criar `seo-audit-registo-de-testes.csv` ou `seo-audit-registo-de-testes.json` com uma entrada explícita para cada código e os seguintes campos:

| Campo | Conteúdo obrigatório |
|---|---|
| `codigo` | Código exato do catálogo. |
| `detalhes_hash` | Hash do bloco completo `Detalhes do problema` usado para construir o teste. |
| `criterios_atomicos` | Lista de todas as condições técnicas, exceções, limiares, escopos e comparações exigidas pelo bloco. |
| `metodo` | `automatico_dedicado`, `manual_estruturado`, `fonte_externa`, `nao_aplicavel` ou `nao_verificavel`. |
| `detector_id` | Identificador estável do teste específico; vazio apenas quando o método não for automático. |
| `dados_necessarios` | HTML, DOM, cabeçalhos, histórico, GSC, feed, SERP, código, logs ou outra fonte concreta. |
| `universo` | Todas as URLs, templates, ficheiros, consultas ou entidades às quais o teste será aplicado. |
| `evidencia_produzida` | Campos e artefactos que permitem reproduzir a conclusão. |
| `teste_positivo` | Fixture ou caso conhecido que o detector deve aprovar. |
| `teste_negativo` | Fixture ou mutação conhecida que o detector deve reprovar. |
| `estado_do_teste` | Implementado, executado, bloqueado ou não aplicável. |

O nome abreviado do código serve apenas para identificação. O método deve ser derivado do bloco completo `Detalhes do problema`, das condições técnicas presentes em `Solução` e das referências normativas aplicáveis.

### Proibição de classificadores genéricos

1. É proibido escolher o detector por correspondência de palavras no nome, categoria ou prefixo do código, incluindo expressões como `title`, `canonical`, `sitemap`, `product`, `schema`, `image`, `redirect`, `noindex` ou equivalentes.
2. É proibido classificar categorias ou prefixos completos como `Não aplicável` sem avaliar cada código e provar a ausência da respetiva superfície no projeto.
3. É proibido usar um fallback que devolva `Aprovado` apenas porque uma lista genérica de ocorrências está vazia.
4. Um detector pode ser partilhado por vários códigos somente quando o registo demonstra que implementa separadamente todos os critérios atómicos de cada código. Partilhar a mesma recolha de dados é permitido; partilhar uma conclusão incompleta não é.
5. Se não existir um detector que cubra integralmente o critério, o código deve ficar `Não verificável` ou ser executado por revisão manual estruturada. Nunca deve ser aprovado por aproximação.
6. Um crawl atual não pode aprovar critérios que exijam histórico, mudança temporal, SERP, indexação real, dados de campo, feed comercial, comportamento de utilizadores ou fonte externa ausente.

Exemplos de classificações inválidas que devem ser bloqueadas:

- `Multiple title tags` aprovado porque foi lido apenas o primeiro `<title>`.
- `Title too long`, `Title too short`, `SERP title changed` e `Page and SERP titles do not match` aprovados pelo mesmo teste de presença ou comprimento.
- Um limiar do detector diferente do limiar operacional indicado neste documento sem registar e justificar a divergência.
- `Sitemap has syntax error`, `Sitemap larger than 50MB`, `URLs decreased` e `Indexable page not in sitemap` aprovados pelo mesmo teste de pertença ao sitemap.
- `Product snippet sem propriedades mínimas` aprovado apenas porque existe `@type: Product`.
- Preço, moeda, disponibilidade, transporte ou devoluções aprovados sem validar tipo, formato, valor, completude e correspondência com o conteúdo visível e a fonte comercial.
- `Página de produto não indexada` aprovada porque não existe `noindex`; indexabilidade técnica não prova indexação no Google.

### Definição rigorosa de verificado

Um código só pode receber `Aprovado` quando satisfaz todas as condições do método aplicável:

**Método automático dedicado:**

1. Todos os critérios atómicos foram convertidos em condições executáveis.
2. O detector foi executado sobre todo o universo aplicável, sem amostra silenciosa.
3. Existe pelo menos um teste positivo e um teste negativo que exercitam o detector; quando há várias condições ou ramos, existem fixtures para cada ramo material.
4. A fixture negativa falha pelo motivo e código esperados. Um teste que apenas confirma que o programa termina não valida o detector.
5. A evidência por entidade inclui os valores observados, valores esperados, fonte, instante e versão do detector.
6. Ausência de ocorrências só resulta em aprovação depois de estes requisitos estarem cumpridos.

**Método manual estruturado:**

1. Existe uma checklist derivada dos critérios atómicos, não uma conclusão livre ou genérica.
2. Cada condição tem resposta, evidência e entidade analisada.
3. Se apenas uma amostra puder ser revista, a linha deve indicar `Não verificável integralmente` para o universo total e descrever a amostragem.
4. Conteúdo, intenção, utilidade, confiança, correspondência visual e qualidade editorial não podem ser aprovados exclusivamente por contagem de palavras, presença de elementos ou ausência de erros sintáticos.

**Fonte externa:**

1. Registar serviço, propriedade, consulta, filtros, intervalo temporal e instante de recolha.
2. Guardar a resposta necessária ou exportação sanitizada.
3. Sem a fonte exigida, usar `Não verificável`; não inferir dados do Google através do HTML atual.

**Não aplicável:**

1. Justificar individualmente o código.
2. Demonstrar onde foi procurada a superfície: rotas, templates, conteúdo, JSON-LD, feeds, configuração e URLs descobertas.
3. A ausência de um tipo no HTML inicial não é suficiente quando esse tipo pode aparecer após JavaScript, autenticação, geografia ou noutro template.

### Evidência mínima reproduzível

O baseline não pode guardar apenas URL, status e redirects quando aprova critérios de conteúdo ou marcação. Deve conservar, conforme aplicável e sem segredos:

- URL pedida, URL final, origem de descoberta, status, cadeia de redirects, cabeçalhos relevantes e tempos;
- HTML inicial ou hash acompanhado dos campos extraídos;
- DOM renderizado ou hash e diferenças relevantes face ao HTML inicial;
- contagem e valores de `<title>`, meta descriptions, headings, canonicals, robots, hreflang e diretivas HTTP;
- links internos com origem, destino, texto, rel, status e canonical do destino;
- imagens, atributos, dimensões, formato, status e relação com o conteúdo;
- cada objeto JSON-LD completo ou sanitizado, respetivo tipo, propriedades, erros e correspondência com valores visíveis;
- sitemaps brutos ou hash, tamanho em bytes, número de URLs, formato, escopo, duplicados, histórico quando exigido e resposta HTTP;
- resultados de ferramentas externas com fonte, data e parâmetros;
- ficheiro, linha, template ou componente responsável quando a evidência vier do código.

Cada linha `Aprovado` deve referenciar um `evidence_id` que exista no diretório de evidências. Frases genéricas como “crawl executado sem ocorrências” não são evidência suficiente sem o detector, critérios cobertos, universo e valores observados.

### Testes de mutação e controlo do auditor

O auditor também deve ser auditado:

1. Para cada detector automático, criar uma versão válida e mutações mínimas que introduzam cada defeito material: remover, duplicar, alterar formato, exceder limiar, divergir conteúdo visível, criar redirect, bloquear recurso ou modificar histórico, conforme o critério.
2. Confirmar que a versão válida passa e que cada mutação falha no código correto. Se uma mutação relevante passar, todos os códigos dependentes do detector ficam `Não verificável` até o detector ser corrigido.
3. Executar um teste de integridade que compare catálogo, registo de testes, matriz e ocorrências. Os conjuntos de códigos devem coincidir exatamente.
4. Executar um teste de independência semântica: códigos com critérios diferentes não podem ser considerados verificados apenas porque apontam para o mesmo array, booleano ou regex.
5. Rever manualmente todos os detectores P0/P1 e uma amostra dos P2, comparando o resultado com HTML, DOM ou fonte original. Registar divergências como defeitos do auditor.
6. Versionar o catálogo, o detector e as evidências. Uma alteração do bloco `Detalhes do problema` invalida a aprovação anterior até o teste ser revisto.

### Reconciliação de contradições

Antes do relatório final, executar regras de consistência:

- Toda métrica não nula que representa um defeito deve gerar ocorrências ligadas a pelo menos um código ou uma justificação explícita de falso positivo.
- `zero problemas confirmados` é incompatível com contadores de erros, avisos não revistos, testes falhados ou ocorrências sem classificação.
- O total do ficheiro de ocorrências deve corresponder à soma das ocorrências declaradas na matriz.
- Um código histórico não pode estar aprovado sem duas observações comparáveis e identificadas.
- Um código dependente da SERP, GSC, Merchant Center, Analytics ou dados de campo não pode estar aprovado sem a fonte respetiva.
- Um código corrigido deve conservar o estado inicial, a alteração, o resultado anterior e a revalidação posterior.
- Falhas nos próprios testes do auditor impedem a declaração de auditoria integralmente validada, mesmo que o crawl termine com sucesso.

Qualquer contradição deve fazer o processo terminar com `auditoria_incompleta`, nunca ser ocultada no resumo.

## Universo obrigatório de análise

A descoberta de URLs deve formar a união deduplicada de, quando disponíveis:

- Sitemaps e índices de sitemap, incluindo imagens, vídeos, notícias e idiomas.
- Links internos encontrados desde a homepage e páginas de navegação.
- Rotas declaradas no código, CMS, catálogo, base de produtos ou manifestos de build.
- URLs canónicas, hreflang, redirects e paginação encontrados durante o crawl.
- Landing pages presentes no Search Console, Analytics, Merchant Center ou feeds.
- URLs fornecidas pelo utilizador.

Separar URLs de produção, staging, preview, parâmetros, filtros, pesquisa interna, autenticação e recursos. Não misturar hosts ou ambientes nos resultados. Registar a origem de descoberta de cada URL e identificar páginas órfãs quando uma fonte externa ou sitemap revelar URLs sem ligações internas.

A análise deve combinar:

- Código-fonte e configuração.
- HTML inicial recebido sem JavaScript.
- DOM renderizado quando a aplicação depender de JavaScript.
- Cabeçalhos, códigos HTTP, redirects e recursos de rede.
- Conteúdo visível e relações entre páginas.
- Dados estruturados e a sua correspondência com o conteúdo visível.
- Comportamento mobile e desempenho laboratorial; dados de campo apenas quando existirem.
- Dados próprios do Google e plataformas comerciais, quando autorizados.

Em sites grandes, automatizar verificações determinísticas sobre todas as URLs e usar inspeção manual representativa por template apenas nos critérios que exigem julgamento humano. Uma validação de template não substitui a verificação automática de valores variáveis de todas as páginas.

## Sequência de execução

### Fase 1 — Preparação

1. Ler o documento completo e inventariar todos os códigos.
2. Extrair, para cada código, o bloco completo de detalhes, solução, referências, escopo, exceções e limiares; calcular `detalhes_hash`.
3. Criar o registo de testes por código e recusar qualquer mapeamento baseado apenas no nome, categoria ou prefixo.
4. Inspecionar a estrutura do projeto e reutilizar scripts, configurações e ferramentas existentes somente depois de confirmar que implementam os critérios completos.
5. Registar o commit, build, ambiente, domínio, versão do catálogo, versão dos detectores e instante analisados.
6. Definir o universo de URLs e as limitações conhecidas.
7. Criar a matriz de cobertura vazia antes dos testes.

### Fase 2 — Descoberta e baseline

1. Confirmar que o site analisado corresponde ao código fornecido.
2. Mapear tipos de página, templates, idiomas, canonicals e fluxos principais.
3. Fazer crawl com concorrência e frequência seguras, respeitando limites do servidor e sem executar ações destrutivas.
4. Recolher baseline de indexabilidade, conteúdo, links, dados estruturados, performance e, quando disponível, GSC.
5. Guardar as evidências brutas necessárias sem recolher dados pessoais ou segredos desnecessários.

### Fase 3 — Execução integral do catálogo

1. Percorrer os códigos por categoria, sem saltos.
2. Ler novamente o bloco integral do código no momento da execução e confirmar que o `detalhes_hash` coincide com o registo de testes.
3. Enumerar os critérios atómicos e demonstrar qual condição, consulta ou passo manual verifica cada um.
4. Executar as fixtures positiva e negativa antes de aceitar resultados do detector no site real.
5. Aplicar o critério descrito em `Detalhes do problema` e as condições técnicas relevantes de `Solução`; não usar apenas o nome abreviado do código.
6. Avaliar todas as ocorrências e preencher imediatamente a respetiva linha da matriz com `detector_id`, `evidence_id`, universo e critérios testados.
7. Relacionar problemas que tenham uma causa comum, mantendo cada código individualmente contabilizado e sem reutilizar indevidamente o estado.
8. Executar cada `FUN-*` aplicável ao objetivo da auditoria. Para funções que exigem acompanhamento futuro, produzir o baseline, o plano executável e marcar claramente o que só poderá ser validado depois; não fingir que decorreu um período de medição.

### Fase 4 — Validação e priorização

1. Confirmar cada problema por um segundo sinal independente quando for razoável: código e página publicada, HTML e DOM, crawl e GSC, ou teste estruturado e conteúdo visível.
2. Eliminar falsos positivos causados por autenticação, geografia, personalização, manutenção temporária ou ferramenta bloqueada.
3. Identificar a causa raiz e todos os locais que a partilham. Evitar propor correções repetidas quando uma alteração no template, gerador ou componente comum resolve todas as ocorrências.
4. Atribuir prioridade:
   - `P0`: impede crawling, indexação, funcionamento, segurança ou integridade de dados críticos.
   - `P1`: afeta materialmente descoberta, elegibilidade, relevância, experiência ou um conjunto importante de páginas.
   - `P2`: melhoria válida de qualidade, completude ou eficiência com impacto inferior ou dependente de contexto.
5. Separar factos observados, impacto provável, hipótese causal e recomendação. Não prometer posições, tráfego ou rich results.

### Fase 5 — Correção, somente quando autorizada

No modo `auditoria_e_correcao`:

1. Preservar alterações existentes do utilizador e modificar o menor número possível de ficheiros.
2. Corrigir a causa raiz no ponto partilhado, reutilizando capacidades existentes do projeto.
3. Não alterar conteúdo editorial, catálogo, preços, redirects, canonicals, produção ou serviços externos quando a escolha depender de decisão comercial não fornecida.
4. Não fazer deploy, publicar, eliminar dados ou pedir validação externa sem autorização correspondente.
5. Registar, por código, os ficheiros e linhas alterados.
6. Reexecutar todos os testes diretamente afetados e uma verificação de regressão proporcional ao risco.

No modo `auditoria`, fornecer patches ou instruções técnicas apenas quando forem úteis, sem modificar o projeto.

### Fase 6 — Reconciliação final

Antes de concluir:

1. Reextrair todos os códigos deste ficheiro.
2. Comparar o conjunto esperado com a matriz e corrigir qualquer código ausente, duplicado ou com estado inválido.
3. Confirmar que cada aprovação contém método e evidência; cada problema contém ocorrência e solução; cada `Não aplicável` contém motivo; e cada `Não verificável` contém o dado necessário.
4. Distinguir estado inicial de estado após correção. Um problema corrigido não deve desaparecer do relatório: manter `Encontrado → Corrigido e revalidado`.
5. Enumerar páginas ou testes que falharam, foram truncados ou ficaram fora do alcance.
6. Executar a reconciliação de contradições entre métricas, matriz, ocorrências, registo de testes e evidências.
7. Calcular e publicar separadamente `cobertura_documental`, `cobertura_de_execucao`, `cobertura_de_evidencia` e `cobertura_de_revalidacao`.
8. Só declarar `auditoria_validada` quando a cobertura documental for 100%, não existir aprovação sem teste específico, todas as evidências referenciadas existirem e todas as regras de consistência passarem. Quando existirem códigos `Não verificável`, declarar exatamente a cobertura atingida, sem os converter em aprovação.

## Estados e formato obrigatório da matriz

Usar exatamente um destes estados iniciais para cada código:

- `Aprovado`.
- `Problema encontrado`.
- `Não aplicável`.
- `Não verificável`.

Quando houver correções autorizadas, adicionar um estado de resolução separado:

- `Não corrigido`.
- `Corrigido e revalidado`.
- `Correção parcial`.
- `Depende do utilizador`.
- `Depende de terceiro ou de recrawling`.

Cada linha deve conter:

| Campo | Conteúdo obrigatório |
|---|---|
| `codigo` | Identificador exato deste documento. |
| `categoria_nome` | Categoria e nome exatos. |
| `detalhes_hash` | Hash do bloco normativo efetivamente testado. |
| `aplicabilidade` | Razão factual pela qual se aplica ou não. |
| `metodo` | Automático dedicado, manual estruturado, fonte externa, não aplicável ou não verificável. |
| `detector_id` | Teste específico responsável pela conclusão. |
| `criterios_testados` | Todas as condições atómicas cobertas, sem as substituir pelo nome do código. |
| `dados_necessarios` | Fontes exigidas para concluir o estado. |
| `universo_testado` | Quantidade e referência de todas as entidades avaliadas. |
| `estado_inicial` | Um dos quatro estados permitidos. |
| `evidence_id` | Referência existente e única para a evidência reproduzível. |
| `evidencia` | Valores observados e esperados, método, URL, resposta ou excerto mínimo necessário. |
| `ocorrencias` | Total e referência para a lista completa de URLs/ficheiros afetados. |
| `localizacao` | URL, ficheiro e linha, seletor, template ou endpoint. |
| `prioridade` | P0, P1 ou P2 quando existir problema. |
| `impacto` | Consequência técnica concreta, sem garantia de ranking. |
| `solucao` | Alteração específica e respetivo critério de aceitação. |
| `resolucao` | Estado posterior, quando houver correção. |
| `revalidacao` | Teste executado e respetivo resultado. |
| `teste_positivo` | Resultado da fixture que deve passar. |
| `teste_negativo` | Resultado das mutações que devem falhar. |
| `confianca` | Alta, média ou baixa, acompanhada da limitação relevante. |

Listas extensas de ocorrências devem ser entregues num anexo CSV ou JSON para não truncar o relatório principal. O relatório deve ligar cada resumo ao anexo correspondente.

## Entregáveis obrigatórios

1. `seo-audit-relatorio.md` — resumo executivo, âmbito, método, resultados, causas raiz, prioridades, limitações e conclusão.
2. `seo-audit-matriz.csv` ou `seo-audit-matriz.json` — uma entrada por código, sem omissões.
3. `seo-audit-ocorrencias.csv` ou `seo-audit-ocorrencias.json` — todas as ocorrências por URL, ficheiro ou elemento.
4. `seo-audit-registo-de-testes.csv` ou `seo-audit-registo-de-testes.json` — método e critérios técnicos de cada código.
5. `seo-audit-testes-dos-detectores.json` — fixtures, mutações, resultado esperado, resultado observado e códigos dependentes.
6. `seo-audit-evidencias/` — evidências necessárias para reproduzir cada conclusão, indexadas por `evidence_id` e sem segredos.
7. `seo-audit-reconciliacao.json` — totais, conjuntos ausentes/duplicados, aprovações sem teste, evidências em falta e contradições.
8. Quando autorizado, alterações no código e relatório antes/depois com testes de revalidação.

O resumo executivo deve começar pelos resultados mais importantes, mas não substitui a matriz integral. Recomendações devem ser ordenadas por causa raiz, prioridade, benefício esperado, esforço e dependências. Distinguir claramente:

- Problemas confirmados.
- Problemas corrigidos e revalidados.
- Decisões ou dados que o utilizador precisa fornecer.
- Dependências externas.
- Melhorias recomendadas sem defeito técnico confirmado.
- Pontos que só podem ser medidos depois de indexação, tráfego ou passagem de tempo.

## Proibições explícitas

- Não produzir apenas uma pontuação global de SEO.
- Não declarar que “está tudo bem” com base numa homepage ou numa pequena amostra.
- Não omitir códigos sem os registar.
- Não declarar um código verificado apenas porque ele possui uma linha na matriz.
- Não atribuir detectores através de regex, palavras do nome, categoria ou prefixo do código.
- Não aprovar vários critérios semanticamente diferentes através de um único sinal genérico vazio.
- Não aprovar um critério sem `detector_id` executado ou checklist manual integral.
- Não aprovar um detector automático sem fixture positiva e mutação negativa eficaz.
- Não usar evidência genérica repetida como substituto dos valores observados por código e entidade.
- Não ignorar métricas não nulas, avisos ou testes falhados só porque não foram associados corretamente a um código.
- Não copiar recomendações do documento sem verificar o projeto.
- Não confundir validade de schema.org com elegibilidade para resultados Google.
- Não confundir presença no sitemap com indexação.
- Não confundir IndexNow com garantia de crawling, indexação ou ranking.
- Não confundir dados laboratoriais com Core Web Vitals reais de utilizadores.
- Não confundir correlação de CTR, tráfego ou posição com causalidade.
- Não copiar conteúdo, design ou ativos protegidos de concorrentes.
- Não expor credenciais, tokens, dados pessoais ou endpoints privados nos entregáveis.
- Não executar alterações fora do âmbito só para aumentar uma pontuação.

## Condição final de aceitação

A entrega é aceite apenas quando:

- Todos os códigos extraídos deste ficheiro aparecem exatamente uma vez na matriz de cobertura.
- Todos os códigos aparecem exatamente uma vez no registo de testes e o seu `detalhes_hash` corresponde à versão auditada do catálogo.
- Todas as URLs descobertas estão contabilizadas como analisadas, excluídas justificadamente ou não verificadas.
- Cada código `Aprovado` possui método específico, critérios atómicos cobertos, `detector_id` ou checklist manual, universo testado, `evidence_id` existente e evidência reproduzível.
- Cada detector automático possui fixtures positivas e negativas que provam que o defeito seria detetado; executar o programa sem falhar não conta como teste do critério.
- O número de `aprovados_sem_teste_especifico`, `evidencias_em_falta`, `codigos_sem_registo`, `ocorrencias_sem_codigo` e `contradicoes` é zero.
- Toda métrica não nula foi convertida em ocorrência, revisão ou falso positivo justificado.
- Todos os problemas confirmados possuem evidência, localização, prioridade, solução e critério de aceitação.
- Todas as correções realizadas foram revalidadas e conservam o estado anterior no histórico.
- Todas as limitações e fontes de dados ausentes estão declaradas.
- O relatório não contém promessas de ranking nem conclusões que excedam a evidência recolhida.

Se qualquer condição falhar, a LLM deve declarar a auditoria `incompleta`, indicar exatamente o que falta e continuar o trabalho sempre que ainda exista uma ação segura e autorizada.

---

# Catálogo unificado de problemas de SEO

## Categoria: Internal pages

### HTTP-001 / 404 page

**Detalhes do problema:**

404 – Not Found is one of the most common 4xx errors and indicates that the requested URL does not exist.

404 URLs on your website damage the user experience, as people cannot access the page or file via a link they click. Besides, internal links to 404 URLs create unnecessary "dead ends" for the search engine crawlers and can waste your crawl budget.

**Solução:**

Review the list of 404 URLs on your website. You should review the internal outgoing links to all the 404 pages reported and either remove these links or replace them with relevant links to live pages.

Alternatively, you can set the appropriate 301 redirects. It is especially important for the 404 pages with a decent number of external backlinks.

### HTTP-002 / 4XX page

**Detalhes do problema:**

4xx HTTP status codes indicate that the requested page or resource cannot be accessed. 401 - Unauthorized, 403 - Forbidden, 408 - Request Timeout, and 404 - Not Found are the most common "Client Errors".

4xx URLs damage the user experience on your website as people cannot access the page or file via a link they click. Besides, internal links to 4xx URLs create unnecessary "dead ends" for the search engine crawlers and can waste your crawl budget.

Pages of your website that changed their response code to 4xx will be removed from Google's index.

**Solução:**

Review the list of 4xx URLs. You should review the internal outgoing links to all the 4xx pages reported and either remove these links or replace them with relevant links to live pages.

Alternatively, you can set the appropriate 301 redirects. It is especially important when for moved or deleted pages on your website.

This will provide smooth crawlability for your website and guarantee good user experience.

The HTTP 429 (Too Many Requests) response code may indicate that the crawling speed set in the crawl settings for your project is too high for a web server. Reduce it in the crawl settings and run a project re-crawl.

### HTTP-003 / 500 page

**Detalhes do problema:**

URLs that return the 500 HTTP status code (Internal Server Error).

This code indicates a potential problem with your web server.

These URLs can be accessed neither by your website visitors nor by the search engines crawlers. Crawlers will be forced to abandon the request while people will most likely leave your website.

**Solução:**

Review the list of URLs that return 500 HTTP status code.

Try to reproduce the server error reported by Site Audit for these URLs in your browser. You should also check the error logs for your server. If this is an ongoing problem and a lot of internal pages return 5xx code, you need to check with your hosting provider or with your web developers.

You should also note that this can be a temporary issue, e.g., when the crawl took place during some maintenance on your website's server.

### HTTP-004 / 5XX page

**Detalhes do problema:**

URLs that return one of the 5xx HTTP status codes (Server Error).

URLs return 5xx status codes when the server is not able to fulfill the request.

These URLs can be accessed neither by your website visitors nor by the search engines crawlers. Crawlers will be forced to abandon the request while people will most likely leave your website.

**Solução:**

Review the list of 5xx URLs.

Try to reproduce the server error reported by the Site Audit for these URLs in your browser. You should also check the error logs for your server. If this is an ongoing problem and a lot of internal pages return 5xx code, you need to check with your hosting provider or with your web developers. Your server may be overloaded or misconfigured.

You should also note that this can be a temporary issue, e.g. when the crawl took place during some maintenance on your website's server.

### HTTP-005 / Timed out

**Detalhes do problema:**

Response from the server was not received on time when requesting a page or resource.

This may damage your website crawlability (and thus indexability) and have a negative impact on the user experience.

**Solução:**

Review the list of URLs that timed out.

Try to reproduce the server error reported by Site Audit for these URLs in your browser. You should also check the error logs for your server. If this is an ongoing problem, you need to check with your hosting provider or with your web developers. Your server may be overloaded, misconfigured, or very slow.

You should also note that this can be a temporary issue, e.g. when the crawl took place during some maintenance on your website's server.

### HTTP-006 / HTTPS/HTTP mixed content

**Detalhes do problema:**

[Mixed content](https://developers.google.com/web/fundamentals/security/prevent-mixed-content/what-is-mixed-content) occurs when initial HTML is loaded over a secure HTTPS connection, but resource files (images, CSS, or JS) are loaded over an insecure HTTP connection.

A warning about this will be shown in modern browsers to inform users about the insecure resources on a page.

Mixed content degrades the security and user experience of your HTTPS site.

**Solução:**

Make sure all the resources on your web pages are loaded over a secure HTTPS connection.

If the resource is available over HTTPS, you can simply link to its HTTPS version. Otherwise, you should:

- Include the resource from a different host, if one is available.

- Download and host the content on your site directly, if you are legally allowed to do so.

- Exclude the resource from your site altogether.

## Categoria: Indexability

### IDX-001 / Canonical points to 4XX

**Detalhes do problema:**

Website pages that have a canonical link pointing to a 4xx URL.

4xx HTTP status codes indicate that the page or resource cannot be accessed.

Only valid live URLs should be specified as canonicals. When the search engine crawler is not able to access the specified canonical page, this instruction will be ignored, and wrong (non-canonical) page version can be indexed.

**Solução:**

Review the list of pages with canonical links pointing to a 4xx URL.

Replace the canonical URLs that return the 4xx status code with the links to the valid 200 (OK) page versions you want to be indexed in search results.

### IDX-002 / Canonical points to 5XX

**Detalhes do problema:**

Website pages that have a canonical link pointing to a 5xx (Server Error) URL.

Only valid live URLs should be specified as canonicals. Otherwise, this instruction will be ignored by the search engines, and wrong (non-canonical) page version can be indexed.

**Solução:**

5xx errors indicate a problem with your web server. You need to check with your hosting provider or with your web developers because your server may be overloaded or misconfigured.

You should also note that this can be a temporary issue, e.g. when the crawl took place during some maintenance on your website's server.

If erroneous URL was specified as canonical, replace it with the link to the valid 200 page version you want to be indexed in search results.

### IDX-003 / Canonical points to redirect

**Detalhes do problema:**

Similar or duplicate pages of a website must specify the canonical page to instruct search engines to show the most authoritative (canonical) version of the page in search results.

A redirecting URL specified as canonical can be misinterpreted by the search engines; such conflicting instruction can be ignored. As a result, wrong (non-canonical) page version can be indexed.

**Solução:**

Review the list of pages with canonical links pointing to a redirecting URL.

Replace the redirecting canonical links with the direct links to the valid 200 (OK) page versions that you want to be indexed in search results.

### IDX-004 / Page size exceeds Googlebot's 2 MB crawl limit

**Detalhes do problema:**

Googlebot only crawls the first 2 MB of an HTML page's uncompressed content. Any content beyond this limit is silently discarded and won't be considered for indexing. This means important text, links, or structured data placed further down in oversized pages may never be seen by Google. [See Google's documentation](https://developers.google.com/search/docs/crawling-indexing/googlebot#how-googlebot-accesses-your-site)

**Solução:**

Reduce the HTML file size below 2 MB. Common approaches include removing inline data such as base64-encoded images, large embedded SVGs, or bulky JSON blocks. If the page contains CSS or JavaScript written directly in the HTML, move them to separate external files. Also look for excessive or duplicated markup in the page source.

### IDX-005 / Noindex page

**Detalhes do problema:**

Pages with a 'noindex' meta tag.

A 'noindex' meta tag is used on a page to prevent it from search indexing. See Google's guidelines on this tag [here](https://support.google.com/webmasters/answer/93710?hl=en).

**Solução:**

Only use this tag on the pages you don't want to appear in search results.

Please take notice that for the noindex meta tag to be effective, the page must not be blocked by the robots.txt file. Otherwise, the search crawlers will not be able to see it.

If you want a page to be indexed by search engines, you should remove this tag.

### IDX-006 / Noindex in HTML and HTTP header

**Detalhes do problema:**

Pages where a 'noindex' directive is specified in the meta tag and in the HTTP response header (X-Robots tag).

**Solução:**

It is enough to implement a 'noindex' either in the HTML meta tag or in the HTTP header.

### IDX-007 / Nofollow in HTML and HTTP header

**Detalhes do problema:**

Pages where a 'nofollow' directive is specified in both the meta tag and in the HTTP response header (X-Robots tag).

**Solução:**

It is enough to implement a 'nofollow' either in the HTML meta tag or in the HTTP header.

### IDX-008 / Nofollow page

**Detalhes do problema:**

Pages with a 'nofollow' meta tag.

A 'nofollow' meta tag is used on a page to instruct search engine crawlers not to follow the links on it.

**Solução:**

Only use this tag on the pages you don't want search crawlers to follow links on.

Otherwise, you should remove this tag.

### IDX-009 / Non-canonical page specified as canonical one

**Detalhes do problema:**

Pages specified as canonical ones have a 'rel=canonical' link to a different page.

This creates a so-called "canonical chain" where page A links to Page B that links to page C from their 'rel=canonical' elements.

**Solução:**

Although Google affirm they can follow canonical chains, it is strongly recommended to avoid them.

Canonical chains may confuse search engine crawlers; misconfigured 'rel=canonical' will be ignored.

Point to a single canonical page where possible to ensure optimal canonicalization results.

### IDX-010 / Noindex follow page

**Detalhes do problema:**

Pages that have a 'noindex' but don't have a 'nofollow' tag in the HTML code or in the HTTP response header.

These pages will not be shown in search engines' results. But since they don't have a 'nofollow' tag, all links on them are supposed to be followed by search engine bots and pass "link juice".

However, in one of the recent Google Webmasters videos, Google's John Mueller explained that Google will understand a long-term 'noindex' (without a 'nofollow') as a 'noindex, nofollow'.

**Solução:**

Check this report for the 'noindex' pages you expect to pass link value to the other pages on your website.

And if you want to make sure search engine bots won't follow the links on a 'noindex' page, add a 'nofollow' as a meta tag or as an HTTP response header.

### IDX-011 / Canonical from HTTP to HTTPS

**Detalhes do problema:**

HTTP pages on your website with the canonical link pointing to an HTTPS page.

Similar or duplicate pages of your website must have a 'rel=canonical' attribute to instruct search engines to show the most authoritative (canonical) version of the page in search results. See [recommendations from Google](https://support.google.com/webmasters/answer/139066?hl=en).

**Solução:**

HTTPS is one of the ranking signals for Google. It is recommended to adopt HTTPS across your website.

Keep in mind that Google prefers HTTPS pages over equivalent HTTP pages as canonical.

### IDX-012 / Canonical from HTTPS to HTTP

**Detalhes do problema:**

HTTPS pages on your website with the canonical link pointing to an HTTP page.

Similar or duplicate pages of your website must have a 'rel=canonical' attribute to instruct search engines to show the most authoritative (canonical) version of the page in search results. See [recommendations from Google](https://support.google.com/webmasters/answer/139066?hl=en).

**Solução:**

HTTPS is one of the ranking signals for Google. Make sure the canonical URLs on your website point to HTTPS pages.

Keep in mind that Google prefers HTTPS pages over equivalent HTTP pages as canonical.

### IDX-013 / Canonical URL changed

**Detalhes do problema:**

This is a notice that the "rel=canonical" tag has changed on some pages.

A canonical tag defines the main version for duplicate and similar pages. It tells search engines which version of a page they should index and rank. In other words, if you change a canonical tag incorrectly, it can affect your rankings and cause search engines to crawl duplicate content, wasting your crawl budget.

**Solução:**

Review affected pages and ensure that the changes are intentional.

### IDX-014 / Indexable page became non-indexable

**Detalhes do problema:**

This is a notice that some indexable pages have become non-indexable.

This can occur due to various reasons, such as a non-200 status code, changes in the "rel=canonical" tag, or the addition of the "noindex" directive.

**Solução:**

Review affected pages and ensure the changes are intentional, and that these pages are not supposed to be indexed by search engines.

### IDX-015 / Noindex and nofollow page

**Detalhes do problema:**

Pages with both 'noindex' and 'nofollow' directives.

A 'noindex' directive instructs search engine crawlers not show a page in search results. A 'nofollow' directive instructs search engine crawlers not to follow the links on a page.

**Solução:**

Only use these directives if you don't want your pages to be indexed in search results and links on them followed by search engine crawlers.

### IDX-016 / Noindex page became indexable

**Detalhes do problema:**

This is a notice that the "noindex" directive has been removed from some pages and they have become indexable.

**Solução:**

Review affected pages and ensure that they should indeed be indexed by search engines.

## Categoria: Links

### LNK-001 / Canonical URL has no incoming internal links

**Detalhes do problema:**

Escopo: páginas indexáveis.

Similar or duplicate pages of a website must specify the canonical URL to instruct search engines to show the most authoritative (canonical) version of the page in search results.

In case the URL has no incoming internal links, there’s no way for people to reach it while browsing your website.

**Solução:**

Check your website navigation and [link architecture](https://webmasters.googleblog.com/2008/10/importance-of-link-architecture.html) to make sure all canonical pages are easily accessible.

You should always internally link directly to the canonical URL where possible.

### LNK-002 / HTTPS page has internal links to HTTP

**Detalhes do problema:**

Escopo: páginas indexáveis.

HTTPS pages linking to HTTP pages on your website.

If an internal link on your website brings people to an HTTP URL, modern browsers will show a warning about a non-secure page. This can damage your overall website authority and user experience.

**Solução:**

Identify every internal outlink whose scheme is `http://`.

Edit the links on the affected pages so that they point to HTTPS versions. Make sure you link to HTTPS pages where possible.

### LNK-003 / Orphan page (has no incoming internal links)

**Detalhes do problema:**

Escopo: páginas indexáveis.

Orphan pages of a website have no incoming internal links.

Search engine crawlers can only discover such pages from the sitemap file or from external backlinks. Website visitors won't be able to get to this page from any other page on your website.

**Solução:**

Check your website navigation and [link architecture](https://webmasters.googleblog.com/2008/10/importance-of-link-architecture.html) to make sure all relevant pages are easily accessible.

### LNK-004 / Page has links to broken page

**Detalhes do problema:**

Escopo: páginas indexáveis.

Pages on your website that link to internal or external URLs returning 404 or 410 HTTP response codes. Broken links on your website damage your visitors' browsing experience as people cannot access the page or file via a link they click. Besides, broken links create unnecessary "dead ends" for the search engine crawlers and can waste your crawl budget.

**Solução:**

Remove the broken links from the affected pages or replace them with links to other relevant live pages.

Additionally, you can set redirects for the deleted or moved pages, which is especially relevant for the pages with external backlinks.

### LNK-005 / Page has no outgoing links

**Detalhes do problema:**

Escopo: páginas indexáveis.

If a page has no outgoing links, it is a "dead end" for both website visitors and search engine crawlers.

**Solução:**

Check your website navigation and link architecture to make sure your website has no "dead ends".

### LNK-006 / Page has links to redirect

**Detalhes do problema:**

Escopo: páginas indexáveis.

For redirecting URLs on your website, this is not a problem, although we recommend linking to the destination page directly.

However, a redirect on an external page you link to requires your attention.

**Solução:**

It is generally recommended to replace links to redirecting URLs on your website with direct links.

This is especially important when linking to external pages. You should manually review the external redirecting URLs linked from your site to make sure that the destination URL has relevant content.

### LNK-007 / Page has nofollow incoming internal links only

**Detalhes do problema:**

Escopo: páginas indexáveis.

Search engine bots won't be able to reach (and thus index) the pages via nofollowed links.

Besides, no link equity (e.g. PageRank) will be passed to the linked pages via nofollowed links.

**Solução:**

You should only "nofollow" links to the specific pages you don't want to be ranked on Google.

If you expect the page to rank high on Google, it should have a good number of relevant "followed" internal links from other pages on your website.

### LNK-008 / Redirected page has no incoming internal links

**Detalhes do problema:**

Escopo: páginas indexáveis.

The destination page of the redirect has no incoming internal links.

In this case, there is no way your website visitors can access it from your website apart from a redirected URL.

**Solução:**

Where possible, edit the links on the referring pages so that they point to the destination pages directly.

### LNK-009 / HTTP page has internal links to HTTPS

**Detalhes do problema:**

Escopo: páginas indexáveis.

HTTP pages linking to HTTPS pages on your website.

**Solução:**

HTTPS is one of the ranking signals for Google. It is recommended to adopt HTTPS across your website.

### LNK-010 / Page has nofollow and dofollow incoming internal links

**Detalhes do problema:**

Escopo: páginas indexáveis.

A mixture of followed and nofollowed links to a page could be a mistake. An indexable page could get more "link juice" if all internal links to it were followed; followed links to the pages you don't want to be crawled and indexed simply waste the "link equity".

**Solução:**

If there's no specific need, ensure that the reported URLs only get one type of incoming links: either followed or nofollowed.

### LNK-011 / Page has nofollow outgoing internal links

**Detalhes do problema:**

Escopo: páginas indexáveis.

Pages linking to internal page or pages of your website via a "nofollow" link.

Search engine crawlers will not follow (crawl) the "nofollow" links on your website and PageRank won't be passed.

**Solução:**

If there's no specific need, you should not use "nofollow" for internal links within your website.

See [Google's recommendations on "nofollow" links](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links).

### LNK-012 / Page has only one dofollow incoming internal link

**Detalhes do problema:**

Escopo: páginas indexáveis.

A página recebe apenas um link interno rastreável sem `nofollow`. Uma única origem cria um caminho de descoberta frágil e pode não comunicar adequadamente a importância, a hierarquia e o contexto temático da URL. Devem ser considerados o número de páginas de origem, a relevância dessas páginas, a posição dos links e o texto das âncoras; links repetidos na navegação não substituem ligações contextuais relevantes.

**Solução:**

Criar links HTML rastreáveis (`<a href>`) a partir de páginas indexáveis relacionadas. Ligar categorias a subcategorias e produtos, produtos às categorias e alternativas pertinentes, e guias às páginas comerciais que ajudam a escolher. Usar âncoras descritivas, apontar diretamente para a URL canonical e garantir que as páginas prioritárias não dependem apenas do sitemap, da pesquisa interna, do footer ou de JavaScript.

### LNK-013 / HTTPS page has internal links to HTTP

**Detalhes do problema:**

Escopo: páginas não indexáveis.

HTTPS pages linking to HTTP pages on your website.

If an internal link on your website brings people to an HTTP URL, modern browsers will show a warning about a non-secure page. This can damage your overall website authority and user experience.

**Solução:**

Identify every internal outlink whose scheme is `http://`.

Edit the links on the affected pages so that they point to HTTPS versions. Make sure you link to HTTPS pages where possible.

### LNK-014 / Orphan page (has no incoming internal links)

**Detalhes do problema:**

Escopo: páginas não indexáveis.

Orphan pages of a website have no incoming internal links.

Search engine crawlers can only discover such pages from the sitemap file or from external backlinks. Website visitors won't be able to get to this page from any other page on your website.

**Solução:**

Check your website navigation and [link architecture](https://webmasters.googleblog.com/2008/10/importance-of-link-architecture.html) to make sure all relevant pages are easily accessible.

### LNK-015 / Page has links to broken page

**Detalhes do problema:**

Escopo: páginas não indexáveis.

Pages on your website that link to internal or external URLs returning 404 or 410 HTTP response codes. Broken links on your website damage your visitors' browsing experience as people cannot access the page or file via a link they click. Besides, broken links create unnecessary "dead ends" for the search engine crawlers and can waste your crawl budget.

**Solução:**

Remove the broken links from the affected pages or replace them with links to other relevant live pages.

Additionally, you can set redirects for the deleted or moved pages, which is especially relevant for the pages with external backlinks.

### LNK-016 / Page has no outgoing links

**Detalhes do problema:**

Escopo: páginas não indexáveis.

If a page has no outgoing links, it is a "dead end" for both website visitors and search engine crawlers.

**Solução:**

Check your website navigation and link architecture to make sure your website has no "dead ends".

### LNK-017 / Page has only one dofollow incoming internal link

**Detalhes do problema:**

Escopo: páginas não indexáveis.

Pages that only have one "dofollow" internal link.

The number of internal links pointing to a page is a signal to search engines about the relative importance of that page.

Besides, their anchor text helps search engines to understand the context better.

**Solução:**

Make sure the most important pages on your website have at least a few internal "dofollow" links.

[Ahrefs' guide to internal links for SEO](https://ahrefs.com/blog/internal-links-for-seo/).

### LNK-018 / HTTP page has internal links to HTTPS

**Detalhes do problema:**

Escopo: páginas não indexáveis.

HTTP pages linking to HTTPS pages on your website.

**Solução:**

HTTPS is one of the ranking signals for Google. It is recommended to adopt HTTPS across your website.

### LNK-019 / Page has links to redirect

**Detalhes do problema:**

Escopo: páginas não indexáveis.

For redirecting URLs on your website, this is not a problem, although we recommend linking to the destination page directly.

However, a redirect on an external page you link to requires your attention.

**Solução:**

It is generally recommended to replace links to redirecting URLs on your website with direct links.

This is especially important when linking to external pages. You should manually review the external redirecting URLs linked from your site to make sure that the destination URL has relevant content.

### LNK-020 / Page has nofollow and dofollow incoming internal links

**Detalhes do problema:**

Escopo: páginas não indexáveis.

A mixture of followed and nofollowed links to a page is most likely a mistake. An indexable page could get more "link juice" if all internal links to it were followed; followed links to the pages you don't want to be crawled and indexed simply waste the "link equity".

**Solução:**

Ensure that the reported URLs only get one type of incoming links: either followed or nofollowed.

### LNK-021 / Page has nofollow incoming internal links only

**Detalhes do problema:**

Escopo: páginas não indexáveis.

Search engine bots won't be able to reach (and thus index) the pages via nofollowed links.

Besides, no link equity (e.g. PageRank) will be passed to the linked pages via nofollowed links.

**Solução:**

You should only "nofollow" links to the specific pages you don't want to be ranked on Google.

If you expect the page to rank high on Google, it should have a good number of relevant "followed" internal links from other pages on your website.

### LNK-022 / Page has nofollow outgoing internal links

**Detalhes do problema:**

Escopo: páginas não indexáveis.

Pages linking to internal page or pages of your website via a "nofollow" link.

Search engine crawlers will not follow (crawl) the "nofollow" links on your website and PageRank won't be passed.

**Solução:**

If there's no specific need, you should not use "nofollow" for internal links within your website.

See [Google's recommendations on "nofollow" links](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links).

### LNK-023 / Redirected page has no incoming internal links

**Detalhes do problema:**

Escopo: páginas não indexáveis.

The destination page of the redirect has no incoming internal links.

In this case, there is no way your website visitors can access it from your website apart from a redirected URL.

**Solução:**

Where possible, edit the links on the referring pages so that they point to the destination pages directly.

## Categoria: Redirects

### RED-001 / Broken redirect

**Detalhes do problema:**

Redirects that point to a page returning one of the 4xx or 5xx HTTP response codes.

These URLs can be accessed neither by your website visitors nor by the search engines crawlers. Crawlers will be forced to abandon the request while people will most likely leave your website.

**Solução:**

Identify every internal page that links to the redirecting URL.

For 4xx HTTP status codes of the destination URLs, replace the links to redirecting URLs on these pages with direct links to relevant live pages or remove these links.

For 5xx codes, you need to check with your hosting provider or with your web developer. Your server may be overloaded or misconfigured.

### RED-002 / Redirect chain too long

**Detalhes do problema:**

Redirect chain is a series of redirects between the initial URL and the destination URL. Google follows only 5 redirect hops in a session – if there are more,
their crawler will typically resume where they left off but the longer the chain the less likely they are to consolidate signals to the final destination.
Besides, chaining redirects may inflict damage on the user experience, slowing down the page loading speeds.

**Solução:**

Identify every internal page that links to the first URL in the chain and replace the link with the final destination URL.

### RED-003 / Redirect loop

**Detalhes do problema:**

Redirect loop happens when a URL redirects to itself or when a redirect chain redirects to one of the URLs within the chain. This creates an infinite loop of redirects.

Redirect loop will typically result in "Too Many Redirects" error in the user's browser and will be a "trap" for search engine crawlers.

**Solução:**

If the URL is not supposed to redirect, change its HTTP response code to 200.

For URLs that must be redirected, correct the final destination URL of the single redirect or redirect chain to the valid 200 page.

You can also On those pages, we recommend replacing outgoing links to redirecting URLs with direct links to valid 200 pages.


### RED-004 / 3XX redirect

**Detalhes do problema:**

Even though Google announced that any redirection method is good and will pass PageRank, Googlebot is not the only visitor of your website.

Redirects always require caution. They may hurt your website performance, especially for mobile users, or confuse website visitors.

**Solução:**

It is recommended to replace the links to the internal redirected URLs on your website with the direct links to the destination pages where possible.

### RED-005 / 302 redirect

**Detalhes do problema:**

Internal URLs that redirect to another URL with 302 HTTP status code (temporary redirect).

Both 302 and 301 redirects pass PageRank as announced by Google.

However, 302 redirect is a temporary one by definition and should not be used where the redirection is permanent.

**Solução:**

For every affected URL, use HTTP 301 or 308 when the move is permanent; keep HTTP 302 only when the redirect is genuinely temporary.

### RED-006 / HTTPS to HTTP redirect

**Detalhes do problema:**

URLs using the secure (HTTPS) protocol that redirect to the insecure one (HTTP).

You should take notice that HTTPS is one of the [ranking signals](https://webmasters.googleblog.com/2014/08/https-as-ranking-signal.html) for Google.

The HTTP protocol does not provide the integrity and confidentiality of data between your visitors and your site.

**Solução:**

It is not recommended to redirect HTTPS (secure) URLs to HTTP (not secure) ones.

Make sure the destination page in a redirect from HTTPS URL uses HTTPS protocol as well.

### RED-007 / HTTP to HTTPS redirect

**Detalhes do problema:**

URLs using HTTP protocol that redirect to HTTPS.

**Solução:**

It is recommended to use direct links to HTTPS versions of the pages on your website to avoid unnecessary redirects.

### RED-008 / Redirect chain

**Detalhes do problema:**

Although chaining redirects of 5 hops or less are acceptable, they may inflict damage on the user experience, slowing down the page loading speeds.
Besides, redirect chains complicate your website's internal linking for the search engine crawlers.

**Solução:**

Identify every internal page that links to the first URL in the chain and, where possible, replace the link with the final destination URL.

### RED-009 / Meta refresh redirect

**Detalhes do problema:**

Pages on your website that have a meta tag in their `<head>` section that sends visitors to a different URL after a certain time.

Google understands this client-side redirect. However, Google needs to parse the page first to see the destination URL, which can take some time. Besides, meta refresh redirects may confuse your visitors or raise concerns about your website's security.

**Solução:**

Review the list of pages with the meta refresh redirect.

Unless this redirection method is specifically necessary on your pages, it is recommended to use a server-side 301 redirect instead.

### RED-010 / Redirect target changed

**Detalhes do problema:**

This is a notice that some redirects on your site have changed their final destination. Now when requesting them, users and bots are forwarded to a new URL, which may affect user experience and your rankings.

**Solução:**

Review affected redirects and ensure that the changes are intentional.

## Categoria: Content

### CNT-001 / Multiple meta description tags

**Detalhes do problema:**

Escopo: páginas indexáveis.

Pages that have more than one meta description tag.

A meta description tag is generally used to inform the search engine with a short, informative summary of what your page is about. High-quality descriptions can sometimes be displayed in Google's search results as search snippets, helping you get higher click-through rates from SERPs.

Multiple meta descriptions can confuse the search engines as they only expect one meta description tag per page.

**Solução:**

Inspect every affected page and identify which template or component emits each meta description.

Pick the most informative and quality meta description for each page and remove the extra ones.

### CNT-002 / Multiple title tags

**Detalhes do problema:**

Escopo: páginas indexáveis.

Pages with more than one `<title>` tag.

Although multiple title tags probably wouldn't cause problems for Google today, this is always a confusion because only one title will be picked to be displayed in the search results and in the browser's tab.

Besides, multiple title tags are a relic of old black-hat SEO and won't add authority to your pages.

**Solução:**

You might need help from your developer to understand why your pages have more than one title tag.

Pick only one unique descriptive title for each page and make the necessary edits to the page code.

### CNT-003 / Title tag missing or empty

**Detalhes do problema:**

Escopo: páginas indexáveis.

Pages with an empty or missing `<title>` tag.

The HTML `<title>` tag is a crucial component of on-page SEO.

Page title will be displayed in search results and it will show up as a name of a browser's tab for those who visit your web page.

**Solução:**

Inspect every affected page and the template responsible for its `<head>`.

Add a concise title perfectly describing your page content, with your targeted keyword in mind, to every web page.

### CNT-004 / Meta description too short

**Detalhes do problema:**

Escopo: páginas indexáveis.

Google sometimes uses `<meta>` tag content to generate snippets, if they think they give users a more accurate description than can be taken directly from the page content.

Besides, Facebook, for example, will use `<meta>` tag content for link preview if the page has no 'og:description' tag.

A short meta description may not summarize the content of your page in the best possible way.

**Solução:**

Use 110–160 characters as the auditor's operational heuristic. Google does not define a fixed character limit and may truncate or generate a different snippet according to the query and available width.

[Google's recommendations on good descriptions](https://support.google.com/webmasters/answer/35624?hl=en)

### CNT-005 / H1 tag missing or empty

**Detalhes do problema:**

Escopo: páginas indexáveis.

`<h1>` tag is the top level heading of the page. Although it is not as crucial as your page title, an `<h1>` heading is a strong component of your on-page SEO. It helps search engines better understand the content on your page and its overall topic.

**Solução:**

Each page should have its unique `<h1>` heading.

It is recommended to use only one `<h1>` tag per page.

### CNT-006 / Low word count

**Detalhes do problema:**

Escopo: páginas indexáveis.

Pages where the word count is less than 50.

Pages with low word count are not likely to give good coverage of the topic for the search engines.

**Solução:**

Although you don’t always need to make your content very long, pages with little to no text might be hard for search engines to understand.

Make sure your word count is enough to cover a specific topic or to describe other content types on your page.

### CNT-007 / Meta description tag missing or empty

**Detalhes do problema:**

Escopo: páginas indexáveis.

Pages that have an empty or missing meta description tag.

Without a meta description, you're missing the opportunity to present the summary of your page content to the search engines. High-quality descriptions can sometimes be displayed in Google's search results as search snippets.

**Solução:**

You should provide a unique meta description for each indexable page on your website to help search engines and people quickly understand what your page is about.

### CNT-008 / Meta description too long

**Detalhes do problema:**

Escopo: páginas indexáveis.

Google sometimes uses `<meta>` tag content to generate snippets, if they think they give users a more accurate description than can be taken directly from the page content.

Besides, Facebook, for example, will use `<meta>` tag content for link preview if the page has no 'og:description' tag.

If Google decides to use the page meta description as a snippet, a long one can be truncated.

**Solução:**

Use 110–160 characters as the auditor's operational heuristic. Google does not define a fixed character limit and may truncate or generate a different snippet according to the query and available width.

[Google's recommendations on good descriptions](https://support.google.com/webmasters/answer/35624?hl=en)

### CNT-009 / Title too long

**Detalhes do problema:**

Escopo: páginas indexáveis.

O `<title>` excede a heurística operacional do auditor e pode ser truncado quando aparece nos resultados de pesquisa. O Google não define um limite fixo de caracteres ou píxeis. Referência: [recomendações do Google para títulos](https://support.google.com/webmasters/answer/35624?hl=en).

**Solução:**

Sinalizar, como heurística do auditor, títulos com mais de 60 caracteres ou largura renderizada superior a 600 px. Manter como referência operacional 50–60 caracteres e no máximo 600 px; encurtar preservando o assunto e os termos distintivos. Não tratar estes números como requisito do Google.

### CNT-010 / Title too short

**Detalhes do problema:**

Escopo: páginas indexáveis.

A short title may not describe the content of your page in the best possible way.

Google may even generate an improved title from anchors, on-page text, or other sources for its SERP.

See Google's [recommendations on good titles](https://support.google.com/webmasters/answer/35624?hl=en).

**Solução:**

Use 50–70 characters and at most 600 rendered pixels as the auditor's operational heuristic, not as a Google requirement. Google has no fixed title length limit and may rewrite or truncate the title according to the result context.

Review all the pages reported and consider writing longer titles.

### CNT-011 / H1 tag changed

**Detalhes do problema:**

Escopo: páginas indexáveis.

This is a notice that the H1 tag has changed on some pages. H1 tags help search engines better understand the content on a website. Changing them may affect the ranking of your pages.

**Solução:**

Review affected pages and ensure that the changes are intentional.

### CNT-012 / Meta description changed

**Detalhes do problema:**

Escopo: páginas indexáveis.

This is a notice that the meta description has changed on some pages. This may affect how your pages appear in search results and social media link previews.

**Solução:**

Review affected pages and ensure that the changes are intentional.

### CNT-013 / Multiple H1 tags

**Detalhes do problema:**

Escopo: páginas indexáveis.

Pages that have more than one `<h1>` tag.

It is possible to have multiple `<h1>` tags on your pages.

John Mueller of Google mentioned that you could use as many `<h1>` tags on a page as you need, hinting that Google is smart enough to puzzle out your headers.

**Solução:**

To avoid any possible confusion for search engines, you should consider keeping the recommended header hierarchy on all of your pages and use only one `<h1>` tag on a page.

### CNT-014 / Page and SERP titles do not match

**Detalhes do problema:**

Escopo: páginas indexáveis.

Google doesn't always use the HTML title tag found on your page in SERP. If your title is too long, stuffed with keywords, or too generic,
they will try to figure out more readable and accessible version that describes the page's content better.

**Solução:**

Review all the pages reported and for the ones with issues in the SERP title, try rewriting the page titles so that Google will trust it and start using it.

See Google's [recommendations on good titles](https://developers.google.com/search/docs/advanced/appearance/good-titles-snippets).

### CNT-015 / Pages have high AI content levels

**Detalhes do problema:**

Escopo: páginas indexáveis.

This notice highlights new pages or existing ones where the AI-generated content has recently reached a high level.
While search engines don't penalize AI content just for being AI, they do prioritize helpful, original information. A high AI score often suggests the content may be too generic or lacks the unique expertise needed to rank well.

**Solução:**

- **Check the page type:** For help guides or technical specs, AI content is fine as long as it’s accurate. For blog posts and articles, human editing is recommended.

- **Add unique value:** Include your own data, personal experiences, or expert opinions that an AI cannot create. This makes the page more helpful for readers.

- **Review recent updates:** If an existing page was flagged, check if the recent changes added real value or just made the page longer with AI text.

- **Ensure "information gain":** Make sure your content offers a fresh perspective or better information than what is already available in search results.

### CNT-016 / SERP title changed

**Detalhes do problema:**

Escopo: páginas indexáveis.

This is a notice that Google has modified the titles of some of your pages in the search results.

**Solução:**

Review affected pages. If you believe some of the new SERP titles are sub-optimal or misleading, try rewriting the page titles so that Google will trust it and start using it.

See Google's [recommendations on good titles](https://developers.google.com/search/docs/appearance/title-link).

### CNT-017 / Title tag changed

**Detalhes do problema:**

Escopo: páginas indexáveis.

This is a notice that the title tag has changed on some pages. This may affect how your pages appear in search results and social media link previews.

**Solução:**

Review affected pages and ensure that the changes are intentional.

### CNT-018 / Word count changed

**Detalhes do problema:**

Escopo: páginas indexáveis.

This is a notice that the word count in the content of some pages has changed by at least 20%. This may indicate that the content on these pages has been substantially rewritten or that the content has been modified by mistake.

**Solução:**

Review affected pages and ensure that the changes are intentional.

### CNT-019 / Meta description tag missing or empty

**Detalhes do problema:**

Escopo: páginas não indexáveis.

Pages that have an empty or missing meta description tag.

Without a meta description, you're missing the opportunity to present the summary of your page content to the search engines. High-quality descriptions can sometimes be displayed in Google's search results as search snippets.

**Solução:**

You should provide a unique meta description for each indexable page on your website to help search engines and people quickly understand what your page is about.

### CNT-020 / Multiple meta description tags

**Detalhes do problema:**

Escopo: páginas não indexáveis.

Pages that have more than one meta description tag.

A meta description tag is generally used to inform the search engine with a short, informative summary of what your page is about. High-quality descriptions can sometimes be displayed in Google's search results as search snippets, helping you get higher click-through rates from SERPs.

Multiple meta descriptions can confuse the search engines as they only expect one meta description tag per page.

**Solução:**

Inspect every affected page and identify which template or component emits each meta description.

Pick the most informative and quality meta description for each page and remove the extra ones.

### CNT-021 / Multiple title tags

**Detalhes do problema:**

Escopo: páginas não indexáveis.

Pages with more than one `<title>` tag.

Although multiple title tags probably wouldn't cause problems for Google today, this is always a confusion because only one title will be picked to be displayed in the search results and in the browser's tab.

Besides, multiple title tags are a relic of old black-hat SEO and won't add authority to your pages.

**Solução:**

You might need help from your developer to understand why your pages have more than one title tag.

Pick only one unique descriptive title for each page and make the necessary edits to the page code.

### CNT-022 / Title tag missing or empty

**Detalhes do problema:**

Escopo: páginas não indexáveis.

Pages with an empty or missing `<title>` tag.

The HTML `<title>` tag is a crucial component of on-page SEO.

Page title will be displayed in search results and it will show up as a name of a browser's tab for those who visit your web page.

**Solução:**

Inspect every affected page and the template responsible for its `<head>`.

Add a concise title perfectly describing your page content, with your targeted keyword in mind, to every web page.

### CNT-023 / H1 tag missing or empty

**Detalhes do problema:**

Escopo: páginas não indexáveis.

`<h1>` tag is the top level heading of the page. Although it is not as crucial as your page title, an `<h1>` heading is a strong component of your on-page SEO. It helps search engines better understand the content on your page and its overall topic.

**Solução:**

Each page should have its unique `<h1>` heading.

It is recommended to use only one `<h1>` tag per page.

### CNT-024 / Low word count

**Detalhes do problema:**

Escopo: páginas não indexáveis.

Pages where the word count is less than 50.

Pages with low word count are not likely to give good coverage of the topic for the search engines.

**Solução:**

Although there's no need to make your content very long, studies show that longer content (700 and more words) tends to rank better on Google.

Make sure your word count is enough to cover a specific topic or to describe other content types on your page.

### CNT-025 / Meta description too long

**Detalhes do problema:**

Escopo: páginas não indexáveis.

Google sometimes uses `<meta>` tag content to generate snippets, if they think they give users a more accurate description than can be taken directly from the page content.

Besides, Facebook, for example, will use `<meta>` tag content for link preview if the page has no 'og:description' tag.

If Google decides to use the page meta description as a snippet, a long one can be truncated.

**Solução:**

Use 110–160 characters as the auditor's operational heuristic. Google does not define a fixed character limit and may truncate or generate a different snippet according to the query and available width.

[Google's recommendations on good descriptions](https://support.google.com/webmasters/answer/35624?hl=en)

### CNT-026 / Meta description too short

**Detalhes do problema:**

Escopo: páginas não indexáveis.

Google sometimes uses `<meta>` tag content to generate snippets, if they think they give users a more accurate description than can be taken directly from the page content.

Besides, Facebook, for example, will use `<meta>` tag content for link preview if the page has no 'og:description' tag.

A short meta description may not summarize the content of your page in the best possible way.

**Solução:**

Use 110–160 characters as the auditor's operational heuristic. Google does not define a fixed character limit and may truncate or generate a different snippet according to the query and available width.

[Google's recommendations on good descriptions](https://support.google.com/webmasters/answer/35624?hl=en)

### CNT-027 / Multiple H1 tags

**Detalhes do problema:**

Escopo: páginas não indexáveis.

Pages that have more than one `<h1>` tag.

It is possible to have multiple `<h1>` tags on your pages.

John Mueller of Google mentioned that you could use as many `<h1>` tags on a page as you need, hinting that Google is smart enough to puzzle out your headers.

**Solução:**

To avoid any possible confusion for search engines, you should consider keeping the recommended header hierarchy on all of your pages and use only one `<h1>` tag on a page.

### CNT-028 / Title too long

**Detalhes do problema:**

Escopo: páginas não indexáveis.

O `<title>` excede a heurística operacional do auditor e pode ser truncado quando aparece nos resultados de pesquisa. O Google não define um limite fixo de caracteres ou píxeis. Referência: [recomendações do Google para títulos](https://support.google.com/webmasters/answer/35624?hl=en).

**Solução:**

Sinalizar, como heurística do auditor, títulos com mais de 60 caracteres ou largura renderizada superior a 600 px. Manter como referência operacional 50–60 caracteres e no máximo 600 px; encurtar preservando o assunto e os termos distintivos. Não tratar estes números como requisito do Google.

### CNT-029 / Title too short

**Detalhes do problema:**

Escopo: páginas não indexáveis.

A short title may not describe the content of your page in the best possible way.

Google may even generate an improved title from anchors, on-page text, or other sources for its SERP.

See Google's [recommendations on good titles](https://support.google.com/webmasters/answer/35624?hl=en).

**Solução:**

Use 50–70 characters and at most 600 rendered pixels as the auditor's operational heuristic, not as a Google requirement. Google has no fixed title length limit and may rewrite or truncate the title according to the result context.

Review all the pages reported and consider writing longer titles.

### CNT-030 / Página de categoria comercial não ajuda a selecionar produtos

**Detalhes do problema:**

Escopo: categorias e subcategorias indexáveis. Depois de excluir navegação, footer e texto comum do template, o conteúdo principal limita-se a uma grelha de produtos ou a uma introdução genérica reutilizada. A página não explica a família de produtos, aplicações, critérios de escolha, diferenças entre opções, atributos relevantes, compatibilidade, medidas, materiais ou limitações aplicáveis. A contagem de palavras isolada não determina este problema; a deteção deve avaliar se a página satisfaz a intenção comercial específica e acrescenta informação diferente das fichas individuais.

**Solução:**

Adicionar conteúdo original e factual que permita escolher dentro da categoria: definição e finalidade, critérios de seleção, comparação de atributos, aplicações, compatibilidades, limitações e respostas às dúvidas de compra recorrentes. Usar dados reais de produtos, atendimento e consultas de pesquisa; manter a informação visível no HTML, organizar com headings e tabelas quando forem úteis e criar links contextuais para subcategorias, produtos e guias relacionados. Não preencher a página com texto genérico nem criar categorias apenas para variações de palavras-chave. [Referência oficial](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).

### CNT-031 / Produtos ou variantes têm conteúdo praticamente idêntico

**Detalhes do problema:**

Escopo: páginas indexáveis de produto. Após remover navegação, footer, políticas comuns e outros elementos do template, duas ou mais URLs mantêm o mesmo título, descrição, especificações, imagens ou argumentos de compra, alterando apenas o nome, SKU, cor ou outra variável. A deteção deve comparar campos estruturados e conteúdo principal através de hashes exatos e similaridade textual, agrupando URLs por produto, variante e intenção. Isto pode tornar ambíguo qual URL responde à pesquisa e deixa cada página sem valor próprio suficiente.

**Solução:**

Agrupar no mesmo `ProductGroup` as variantes que pertencem realmente ao mesmo produto e disponibilizar uma URL rastreável por variante quando necessário. Para produtos distintos, publicar descrição, especificações, medidas, materiais, compatibilidades, aplicações, limitações, imagens e informação comercial específicas e verificáveis. Definir uma intenção distinta por URL, ligar alternativas relacionadas e consolidar ou canonicalizar apenas duplicados reais; não usar `rel=canonical` para esconder páginas que deveriam possuir conteúdo próprio. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/product-variants).

### CNT-032 / Pesquisas relevantes anteriores à compra não têm resposta adequada

**Detalhes do problema:**

Consultas do Search Console sobre escolha, comparação, diferenças, medidas, materiais, compatibilidade, instalação, utilização ou manutenção apresentam impressões, mas não existe uma página indexável que responda diretamente à intenção. Em alternativa, a consulta conduz à homepage, a uma categoria genérica ou a um produto que não contém a resposta. A análise deve agrupar consultas semanticamente por país, idioma e dispositivo, associá-las às landing pages e distinguir uma lacuna temática de simples variações lexicais da mesma necessidade.

**Solução:**

Decidir se cada grupo de intenção deve ser respondido numa categoria, ficha de produto ou guia independente. Expandir uma página existente quando a intenção for a mesma; criar uma nova apenas quando houver uma necessidade distinta. Incluir critérios de decisão, comparações verificáveis, exemplos, limitações, experiência própria, imagens ou dados úteis e uma resposta direta à pergunta. Ligar os guias às categorias e produtos pertinentes e criar ligações de retorno; não gerar uma página quase igual para cada palavra-chave. [Referência oficial](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).

## Categoria: Social tags

### SOC-001 / Open Graph tags incomplete

**Detalhes do problema:**

Pages with one or more of the required Open Graph tags missing.

The four required Open Graph tags for every page are `og:title`, `og:type`, `og:image`, and `og:url`.

**Solução:**

Make sure your pages have all required OG tags if you want them to look good in social feeds when shared.

Please note that the URLs inside OG tags must be absolute and utilize the http:// or https:// protocols.

You can find more information on the Open Graph protocol [here](http://ogp.me/).

### SOC-002 / Open Graph URL not matching canonical

**Detalhes do problema:**

Pages where the URL specified in `og:url` Open Graph tag and in `rel=canonical` tag is mismatched.

Open Graph tags instruct social networks like Facebook, Pinterest, and LinkedIn what information to display whenever a URL to your page is shared.

When Open Graph URL does not match the canonical one, a non-canonical version of a page will be shared on social networks.

**Solução:**

Make sure the URL specified in `og:url` matches the URL of the canonical page unless you have a specific intent.

Please note that URLs inside OG tags must be absolute and utilize the http:// or https:// protocols.

### SOC-003 / X (Twitter) card incomplete

**Detalhes do problema:**

Pages with one or more of the basic X (Twitter) card tags missing.

X card instructs X what information (title, description, image, etc.) to display whenever a URL to your page is shared.

Basic X cards include `twitter:card`, `twitter:site`, `twitter:title`, `twitter:description`, and `twitter:image`.

If some of these tags are missing, X will pull data from relevant Open Graph tags.

**Solução:**

Make sure your pages have the all basic X cards if you want them to look good in the X feed when shared.

Please note that URLs inside X cards must be absolute and utilize the http:// or https:// protocols.

You can find more information about X cards [here](https://developer.twitter.com/en/docs/tweets/optimize-with-cards/guides/getting-started).

### SOC-004 / Open Graph tags missing

**Detalhes do problema:**

Pages with no Open Graph tags.

Open Graph tags instruct social networks like Facebook, Pinterest, and LinkedIn what information (title, description, image, etc.) to display whenever a URL to your page is shared.

**Solução:**

Make sure your pages have Open Graph tags if you want them to look good in social feeds when shared.

Please note that URLs inside OG tags must be absolute and utilize the http:// or https:// protocols.

You can find more information on the Open Graph protocol [here](http://ogp.me/).

### SOC-005 / X (Twitter) card missing

**Detalhes do problema:**

Pages with no X (Twitter) card tags.

X card instructs X what information (title, description, image, etc.) to display whenever a URL to your page is shared.

If X cards are missing, X will pull data from relevant Open Graph tags.

**Solução:**

If you want your pages to look good in X feed when shared, you should implement the X card tags available.

Please note that URLs inside X cards must be absolute and utilize the http:// or https:// protocols.

You can find more information about X cards [here](https://developer.twitter.com/en/docs/tweets/optimize-with-cards/guides/getting-started).

## Categoria: Duplicates

### DUP-001 / Duplicate pages without canonical

**Detalhes do problema:**

Pages with duplicate or very similar content that don't specify their canonical version.

Although Google asserts that they can automatically choose the best version of the content to show in their search results, it won't necessarily be page version you want to be indexed. That is why similar or duplicate pages of your website must have a "rel=canonical" attribute to instruct search engines to show the most authoritative (canonical) version of the page in search results.

**Solução:**

Group affected pages by identical or near-identical content and select the preferred URL for each group.

For every page in the group of duplicates, you should pick one canonical version that you want to be indexed in search results. Add its URL to the "rel=canonical" labeling on each page with duplicated content, including the canonical page itself.


## Categoria: Localization

### LOC-001 / Hreflang to non-canonical

**Detalhes do problema:**

Pages that link to a non-canonical URL from their hreflang annotations.

Linking to a non-canonical version of a page from hreflang annotations can mislead search engines.

Rel="alternate" hreflang="x" will instruct search engines to show the translated (localized) version of a page while rel=canonical attribute will flag that this is not the authoritative (canonical) version.

**Solução:**

Inspect every affected page and its hreflang targets.

You should modify their hreflang annotations so that they point to canonical pages.

If you found that the page linked from hreflang annotations got a non-canonical status unintentionally, remove its rel-canonical element or edit it to become a self-canonical.

### LOC-002 / Hreflang and HTML lang mismatch

**Detalhes do problema:**

Pages with different language codes declared in HTML language attribute and in hreflang annotation for the URL.

Although Google might not be using the HTML lang attribute today, other search engines and browsers do.

**Solução:**

Inspect every affected page and compare its `hreflang` value with `html lang` and the actual page language.

Make necessary edits so that the same language code is used in both HTML lang attribute and hreflang annotations for the URL.


### LOC-003 / Hreflang annotation invalid

**Detalhes do problema:**

Pages with hreflang annotations where language (or language-locale) code is not valid.

Hreflang helps search engines to point users to the most appropriate version of your page, depending on users' language and region.

Invalid hreflang annotations will be ignored. Consequently, search engines may "overlook" alternate versions of your page and will not be able to point users to the most appropriate version of your page by language or region.

**Solução:**

Validate every `hreflang` language or language-region code against the supported ISO syntax.

Make necessary changes to these pages so that they use valid language (or language-location) code format in their hreflang annotations. Language annotations must be specified in [ISO 639-1 format](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes); locale annotations in [ISO 3166-1 Alpha 2 format](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2).


### LOC-004 / Hreflang to redirect or broken page

**Detalhes do problema:**

Pages that have a broken URL in their hreflang annotations.

If hreflang URL does not point to a valid live page, hreflang annotations may be ignored or not interpreted correctly. Consequently, search engines may "overlook" alternate versions of your page and will not be able to point users to the most appropriate version of your page by language or region.

**Solução:**

Resolve every URL declared in `hreflang` and record whether it returns 3xx, 4xx, 5xx, or 200.

You should edit the hreflang annotations on the affected pages so that they point to live pages only.

### LOC-005 / HTML lang attribute invalid

**Detalhes do problema:**

Pages with invalid HTML language attribute.

Although Google might not be using the HTML lang attribute today, other search engines and programs, such as screen readers, do to understand the language of the page.

**Solução:**

Make necessary changes to the HTML lang attribute on the reported pages that they use valid language (or language-location) code format.

Language annotations must conform to [ISO 639-1 format](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes); locale annotations (optional) must conform to [ISO 3166-1 Alpha 2 format](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2).

### LOC-006 / Missing reciprocal hreflang (no return-tag)

**Detalhes do problema:**

Confirmation (return) links are missing for the pages declared in hreflang annotations.

If page A links to page B in hreflang annotations, page B must link to page A in return. If this is not the case for all pages that use hreflang annotations, those annotations may be ignored or misinterpreted correctly.

This issue can also be triggered by misused "x-default" hreflang. Whenever the optional "x-default" hreflang value is used, all pages of the hreflang group must reference the same "default" page.

**Solução:**

To fix the issue, make sure all the page versions translated or targeted to users in a certain region have the same set of hreflang annotations which includes URLs to all the page versions. This will always provide return links between the alternate pages.

### LOC-007 / More than one page for same language in hreflang

**Detalhes do problema:**

Pages that reference more than one page for the same language (or language-location) in their hreflang annotations.

Announcing different pages for the same language (or language-location) in hreflang annotations can confuse search engines.

Erroneous hreflang annotations will be ignored by the search engines.

**Solução:**

Make the necessary edits to the hreflang annotations on these pages so that only one page is referenced for one language.

### LOC-008 / Page referenced for more than one language in hreflang

**Detalhes do problema:**

Pages that were referenced for more than one language in hreflang annotations.

This gives contradictory instructions to search engines as of which version of a page to show based on user's language preferences.

**Solução:**

Inspect every URL mapped to multiple language codes and determine the single language or locale it actually represents.

Pick only one language per page version and make necessary edits to hreflang annotations.

One language version of a page must always be referenced for one language only. It can, however, be referenced for multiple locations with the same language, e.g. en-us, en-gb, etc.

### LOC-009 / Self-reference hreflang annotation missing

**Detalhes do problema:**

It's a good practice for each language version of a page to list itself in addition to all other language versions.
While it is not a strict requirement for Google, hreflang annotations without the self-referencing link may be ignored
or misinterpreted by other search engines.

**Solução:**

Inspect every hreflang group and verify that each page includes a self-referencing annotation.

Make the necessary changes, so that each of these pages has a self-referencing hreflang annotation.

For example, a Spanish version of your page must have rel="alternate" hreflang="es" annotation with a link to itself.

### LOC-010 / Hreflang defined but HTML lang missing

**Detalhes do problema:**

Pages where the hreflang annotations are defined, but the HTML language tag is missing.

Although Google might not be using the HTML lang attribute today, other search engines and browsers do.

**Solução:**

Make sure your pages have the language (or language and country) code declared in the HTML lang attribute.

Note that the language code must conform to [ISO 639-1 format](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).

### LOC-011 / HTML lang attribute missing

**Detalhes do problema:**

Pages where the `<html lang="">` language attribute is missing.

Although Google might not be using the HTML lang attribute today, other search engines and browsers do.

**Solução:**

Make sure your pages have language (or language and country) code declared in the HTML lang attribute.

Note that the language code must conform to [ISO 639-1 format](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).

### LOC-012 / Not all pages from hreflang group were crawled

**Detalhes do problema:**

Some pages linked-to from hreflang annotations were not crawled for a certain reason.

**Solução:**

Please check the "no-crawl" reason reported for these pages.

This does not necessarily indicate a problem on your website. A URL from hreflang annotations could be out of the scope of a crawl or the crawl could be interrupted.

### LOC-013 / X-default hreflang annotation missing

**Detalhes do problema:**

Pages with no `x-default` hreflang annotation.

A set of hreflang annotations on the multiple versions of your page translated or targeted to users in a certain region should include an `x-default` hreflang attribute.

`x-default` will be used for any other language (or language and location) not specified in a set of hreflang annotations.

**Solução:**

Make sure each page on your website has an `x-default` hreflang attribute that points to a page not specific to one language or region.

See Google's guidelines on hreflang implementation [here](https://support.google.com/webmasters/answer/189077?hl=en).

## Categoria: Usability and performance

### UXP-001 / Slow page

**Detalhes do problema:**

Pages on your website where HTML code took a long time to load.

The loading speed of a web page is one of the ranking signals for Google.

Besides, page speed affects user experience on your website. Very often visitors won't wait long for the page to load and will "bounce".

**Solução:**

Page's HTML code loads slowly when it is not optimized or when the web server is slow.

Make sure the HTML code is optimized on all of your pages. If this issue persists, consider moving your website to a faster server.

### UXP-002 / Content is not sized correctly

**Detalhes do problema:**

The content of your page is not sized correctly for the viewport. When your page's content width is smaller or larger than the viewport width, it may not render correctly on mobile screens.

Detect this issue with a Lighthouse mobile audit using the PageSpeed Insights API.

**Solução:**

Make sure that the page uses relative width and position values for CSS elements, and make sure images can scale as well. See Google's [Responsive Web Design Basics](https://web.dev/articles/responsive-web-design-basics) for an overview of how to create a mobile-friendly page.

### UXP-003 / Document uses plugins

**Detalhes do problema:**

The page includes plugins, such as Java or Flash, that are not supported by most mobile browsers. Also, search engines can't index content that relies on browser plugins.

Detect this issue with a Lighthouse mobile audit using the PageSpeed Insights API.

**Solução:**

Redesign your page using modern, broadly-supported web technologies, such as HTML5. [Learn more about avoiding plugins](https://developer.chrome.com/docs/lighthouse/seo/plugins/).

### UXP-004 / Font size too small

**Detalhes do problema:**

The page doesn't use legible font sizes. Font sizes less than 12px are too small to be legible and require mobile visitors to “pinch to zoom” in order to read.

Detect this issue with a Lighthouse mobile audit using the PageSpeed Insights API.

**Solução:**

Specify a viewport for your web pages and set all your font sizes to scale properly within the viewport, so the text will be visible on a device screen. [Read more about best practices for font size](https://web.dev/font-size/).

### UXP-005 / HTML file size too large

**Detalhes do problema:**

Pages on your website with a large-sized HTML code.

Although HTML code is pure text, it may slow down your pages, when its size is excessively large.

**Solução:**

Review all the pages reported and consider optimizing their HTML code.

Above all, you should check that your website uses text compression like GZIP.

### UXP-006 / Not compressed

**Detalhes do problema:**

Pages that do not use text compression.

To reduce the size of data transferred from the web server to the user's browser, compression should be used for text-based assets: CSS, JavaScript, and HTML.

**Solução:**

All browsers today support GZIP compression, so make sure your server is configured to enable GZIP.

Other widely supported compression algorithms are Brotli and deflate.

### UXP-007 / Page stopped passing CWV requirements

**Detalhes do problema:**

CWV metrics on some pages have declined and moved into the "Poor" category, while previously they passed the requirements.
This may indicate recent technical changes that have impacted their performance.

**Solução:**

Compare the affected URLs with the previous scan and identify regressions in LCP, INP, and CLS. Apply the correction defined by the failing metric and verify the result with CrUX field data when available.

### UXP-008 / Pages with poor CLS

**Detalhes do problema:**

Cumulative Layout Shift measures how elements move around or how stable the page layout is. It can be annoying if you try to click something on a page that shifts and you end up clicking on something you didn’t intend to.

The range is 0-1, where 0 is stable and 1 means a lot of shifting. A CLS score higher than 0.25 is considered poor.

This score comes from the Chrome User Experience Report which looks at real user data.

**Solução:**

To resolve the problem, check the most common causes of a poor CLS:

- Images without dimensions

- Ads, embeds, and iframes without dimensions

- Injecting content with JavaScript

- Applying fonts or styles late in the load


### UXP-009 / Pages with poor FID

**Detalhes do problema:**

First Input Delay is the time from when a user interacts with your page until the page can respond. You can also think of it as responsiveness. It can be frustrating trying to click something and nothing happening on the page.

A FID longer than 300 ms is considered poor.

This score comes from the Chrome User Experience Report which looks at real user data.

**Solução:**

The cause of FID is long JavaScript tasks running in the main thread. While a task is running, a page can’t respond to user input. The longer the task, the longer the delay experienced by the user.

To fix the problem you need to break up long tasks and defer any JavaScript that isn’t needed until later. The breaks between tasks are the opportunities that the page has to switch to the user input task and respond to what they wanted to do.


### UXP-010 / Pages with poor INP

**Detalhes do problema:**

Interaction to Next Paint measures the latency of all interactions a user has made with the page. It corresponds to the waiting time which all user interactions were below. You can also think of it as responsiveness. It can be frustrating trying to click something and nothing happening on the page.

A low INP means the page was consistently able to respond quickly to all of user interactions. An INP longer than 500 ms is considered poor.

This score comes from the Chrome User Experience Report which looks at real user data.

INP will replace FID as a part of Core Web Vitals in March 2024. [Learn more](https://developers.google.com/search/blog/2023/05/introducing-inp)

**Solução:**

The cause of INP is long JavaScript tasks running in the main thread. While a task is running, a page can’t respond to user input. The longer the task, the longer the delay experienced by the user.

To fix the problem you need to break up long tasks and defer any JavaScript that isn’t needed until later. The breaks between tasks are the opportunities that the page has to switch to the user input task and respond to what they wanted to do. [Learn more](https://web.dev/optimize-inp/)

### UXP-011 / Pages with poor LCP

**Detalhes do problema:**

Largest Contentful Paint measures visual loading performance. LCP is the single largest visible element loaded in the viewport. It is usually going to be a featured image or maybe the H1.

If the largest content element becomes visible in more than 4 seconds, an LCP is considered poor.

This score comes from the Chrome User Experience Report which looks at real user data.

**Solução:**

To solve the problem you need to load the largest content element faster than you currently do. The most common causes of a poor LCP are:

- Slow server response times

- JavaScript and CSS blocking rendering of the page

- Slow resource load times


### UXP-012 / Tap targets too small or too close together

**Detalhes do problema:**

Interactive elements like buttons and links should be large enough (48x48px), or have enough space around them, to be easy enough to tap without overlapping onto other elements.

Detect this issue with a Lighthouse mobile audit using the PageSpeed Insights API.

**Solução:**

Make sure that your touch targets are not closer together than an average fingertip width, or that your fingertip can't span multiple link targets. Read more in [Accessible Tap Targets](https://web.dev/accessible-tap-targets/).

### UXP-013 / Viewport not set

**Detalhes do problema:**

The page does not have a `<meta name="viewport">` tag with `width` or `initial-scale`. Many search engines rank pages based on how mobile-friendly they are. Without a viewport meta tag, mobile devices render pages at typical desktop screen widths and then scale the pages down, making them difficult to read.

Detect this issue with a Lighthouse mobile audit using the PageSpeed Insights API.

**Solução:**

Because visitors to your site use a variety of devices with varying screen sizes—from large desktop monitors, to tablets and small smartphones—your pages should specify a viewport using the `meta viewport` tag. Read how to correctly [set the viewport](https://web.dev/responsive-web-design-basics/#viewport).

## Categoria: Images

### IMG-001 / Image file size too large

**Detalhes do problema:**

Images with large file size.

Images often account for most of the page size and thus can be the main reason for slow pages on your website.

**Solução:**

Generally, image size and quality are positively associated with its file size.

Resize each image to its maximum rendered dimensions, compress it with an appropriate quality setting, use WebP or AVIF when supported, and preserve only the resolution required by responsive variants.

### IMG-002 / Image broken

**Detalhes do problema:**

Some images on your website cannot be displayed.

Broken images on your pages will negatively affect the user experience, while search engines will not be able to index these images in their search results.

**Solução:**

Review all the broken images reported and replace, fix or remove links to these images on your pages.

### IMG-003 / Page has broken image

**Detalhes do problema:**

Some pages link to image URLs that return a 4xx or 5xx HTTP status code.

Broken images will not be displayed on your pages.

**Solução:**

Most likely, the image file had been moved, renamed, or deleted but the link to it was not modified.

Review the pages that have a broken link to the image and update or remove it.

For 5xx HTTP status codes (server errors), you might need to address your web developer or hosting provider.

### IMG-004 / HTTPS page links to HTTP image

**Detalhes do problema:**

This issue is an instance of [mixed content](https://developers.google.com/web/fundamentals/security/prevent-mixed-content/what-is-mixed-content) that occurs when HTML pages load over a secure HTTPS connection but link to resources (images, CSS, or JS) over an insecure HTTP connection.

Mixed content degrades the security and user experience of your HTTPS site.

Some browsers block insecure resource requests by default. If your page depends on these insecure resources, then your page might not work properly when they get blocked.

**Solução:**

For your own domain, serve all content as HTTPS and fix your links. Often, the HTTPS version of the content already exists and this just requires adding an "s" to links - http:// to https://.

For images hosted on other domains, use the site's HTTPS version if available. If HTTPS is not available, you can try contacting the domain and asking them if they can make the content available via HTTPS.

### IMG-005 / Image redirects

**Detalhes do problema:**

Some image URLs on your website redirect to another URL.

This forces web browsers and search engine crawlers to make an additional HTTP request in order to reach the destination URL. On a vast scale, this can increase page loading times for your website.

**Solução:**

Review the pages that have a link to the redirecting URL and replace this link with the direct link to the destination image file.

If you decide to keep the links to redirecting URLs that do not belong to your website, make sure that the destination image files are relevant images.

### IMG-006 / Missing alt text

**Detalhes do problema:**

The alt attribute is used to describe your image. Search engines will use it to understand the content of your image files. Also, this text will be shown on your page if the image cannot be displayed.

**Solução:**

Make sure each of your images has a concise and descriptive alt text.

[See Google's guidelines on images](https://support.google.com/webmasters/answer/114016?hl=en).

### IMG-007 / Page has redirected image

**Detalhes do problema:**

Some pages on your website link to image files via a redirect.

This forces web browsers and search engine crawlers to make an additional HTTP request in order to reach the destination image URL. On a vast scale, this can increase page loading times for your website.

**Solução:**

Review the pages that have a link to the redirecting URL and replace this link with the direct link to the destination image file.

If you decide to keep the links to redirecting URLs that do not belong to your website, make sure that the destination image files are relevant images.

## Categoria: JavaScript

### JSC-001 / JavaScript broken

**Detalhes do problema:**

JavaScript files that cannot be loaded.

Broken JS files will negatively impact user experience on your pages. Besides, they can lower your pages' authority in the eyes on the search engines. Google, for example, is able to understand and render JS files.

**Solução:**

Review all the JavaScript files reported and make sure they are loaded properly.

### JSC-002 / Page has broken JavaScript

**Detalhes do problema:**

Some pages link to JavaScript URLs that return a 4xx or 5xx HTTP status code.

Broken JS files will not be rendered on your pages.

**Solução:**

Most likely, the JS file had been moved, renamed, or deleted but the link to it was not modified.

Review the pages that have a broken link to the JS file and update or remove it.

For 5xx HTTP status codes (server errors), you might need to address your web developer or hosting provider.

### JSC-003 / HTTPS page links to HTTP JavaScript

**Detalhes do problema:**

This issue is an instance of [mixed content](https://developers.google.com/web/fundamentals/security/prevent-mixed-content/what-is-mixed-content) that occurs when HTML pages load over a secure HTTPS connection but link to resources (images, CSS, or JS) over an insecure HTTP connection.

Mixed content degrades the security and user experience of your HTTPS site.

Some browsers block insecure resource requests by default. If your page depends on these insecure resources, then your page might not work properly when they get blocked.

**Solução:**

For your own domain, serve all content as HTTPS and fix your links. Often, the HTTPS version of the content already exists and this just requires adding an "s" to links - http:// to https://.

For JS files hosted on other domains, use the site's HTTPS version if available. If HTTPS is not available, you can try contacting the domain and asking them if they can make the content available via HTTPS.

### JSC-004 / JavaScript redirects

**Detalhes do problema:**

Some JavaScript files' URLs linked from your website redirect to another URL.

This forces web browsers and search engine crawlers to make an additional HTTP request in order to reach the destination URL. On a vast scale, this can increase page loading times for your website.

**Solução:**

Review the pages that have a link to the redirecting URL and replace this link with the direct link to the destination JS file.

If you decide to keep the links to redirecting URLs that do not belong to your website, make sure that the destination JS files are relevant.

### JSC-005 / Page has redirected JavaScript

**Detalhes do problema:**

Some pages on your website link to JavaScript files via a redirect.

This forces web browsers and search engine crawlers to make an additional HTTP request in order to reach the destination JS file URL. On a vast scale, this can increase page loading times for your website.

**Solução:**

Review the pages that have a link to the redirecting URL and replace this link with the direct link to the destination JS file.

If you decide to keep links to redirecting URLs that do not belong to your website, make sure that the destination files are relevant.

## Categoria: CSS

### CSS-001 / CSS broken

**Detalhes do problema:**

CSS files that cannot be loaded while loading the page content.

CSS files are plain-text files used for formatting content on web pages. If a CSS file cannot be accessed, the content on your web page will not be rendered properly, damaging the user experience on your website.

**Solução:**

Review all the CSS files reported and make sure they are loaded properly. [Learn more](http://help.ahrefs.com/en/articles/2759921-css-broken-warning-in-site-audit)

### CSS-002 / CSS file size too large

**Detalhes do problema:**

CSS files on your website that are larger than 15 kB.

Although CSS files consist of text only, they may slow down your pages when their size is too big.

**Solução:**

Review all the CSS files reported and consider optimizing their code.

### CSS-003 / CSS redirects

**Detalhes do problema:**

Some CSS files' URLs on your website redirect to another URL.

This forces web browsers and search engine crawlers to make an additional HTTP request in order to reach the destination URL. On a vast scale, this can increase page loading times for your website.

**Solução:**

Identify every page that references the redirecting CSS URL and replace its `href` with the final CSS URL.

If you decide to keep the links to redirecting URLs that do not belong to your website, make sure that the destination CSS files are relevant.

### CSS-004 / HTTPS page links to HTTP CSS

**Detalhes do problema:**

This issue is an instance of [mixed content](https://developers.google.com/web/fundamentals/security/prevent-mixed-content/what-is-mixed-content) that occurs when HTML pages load over a secure HTTPS connection but link to resources (images, CSS, or JS) over an insecure HTTP connection.

Mixed content degrades the security and user experience of your HTTPS site.

Some browsers block insecure resource requests by default. If your page depends on these insecure resources, then your page might not work properly when they get blocked.

**Solução:**

For your own domain, serve all content as HTTPS and fix your links. Often, the HTTPS version of the content already exists and this just requires adding an "s" to links - http:// to https://.

For CSS files hosted on other domains, use the site's HTTPS version if available. If HTTPS is not available, you can try contacting the domain and asking them if they can make the content available via HTTPS.

### CSS-005 / Page has broken CSS

**Detalhes do problema:**

Some pages link to CSS URLs that return a 4xx or 5xx HTTP status code.

Broken CSS files will not apply the necessary styles to your pages.

**Solução:**

Most likely, the CSS file had been moved, renamed, or deleted but the link to it was not modified.

Review the pages that have a broken link to the CSS file and update or remove it.

For 5xx HTTP status codes (server errors), you might need to address your web developer or hosting provider.

### CSS-006 / Page has redirected CSS

**Detalhes do problema:**

Some pages on your website link to CSS files via a redirect.

This forces web browsers and search engine crawlers to make an additional HTTP request in order to reach the destination CSS file URL. On a vast scale, this can increase page loading times for your website.

**Solução:**

Review the pages that have a link to the redirecting URL and replace this link with the direct link to the destination CSS file.

If you decide to keep the links to redirecting URLs that do not belong to your website, make sure that the destination CSS files are relevant.

## Categoria: Sitemaps

### SMP-001 / 3XX redirect in sitemap

**Detalhes do problema:**

URLs included in sitemap file that redirect.

Sitemap must list all the pages you want search engines to crawl and index.

Redirecting URLs in sitemaps can result in indexability issues on your website.

**Solução:**

Replace the redirecting URLs in the sitemaps with the destination URL. If the destination URL is already listed, simply remove the URL that redirects to it from the sitemap file.

### SMP-002 / 4XX page in sitemap

**Detalhes do problema:**

4xx pages in the sitemap send a confusing signal to search engines, asking them to crawl and index “dead” or forbidden pages. This can result in indexability issues on your website.

**Solução:**

You should remove the 4xx URLs from your sitemaps.

Make sure your sitemaps only include live URLs that return the 200 (OK) response code.


### SMP-003 / 5XX page in sitemap

**Detalhes do problema:**

Pages in sitemap returning one of the 5xx HTTP status codes (Server Error).

5xx URLs in sitemaps cannot be accessed by crawlers. This can result in search engines ignoring your sitemaps. In this case, you might end up with some indexability issues on your website.

**Solução:**

Make sure your sitemap is up-to-date and does not include any dead pages.

### SMP-004 / Noindex page in sitemap

**Detalhes do problema:**

Pages with a `noindex` meta tag included in sitemap.

Sitemap must list all the pages you want search engines to crawl and index, while a `noindex` meta tag instructs search engine bots not to index a page.

Such a combination is contradictory.

**Solução:**

You should either remove these pages from the sitemap or delete the `noindex` tag from the page, depending on your intent.

### SMP-005 / Non-canonical page in sitemap

**Detalhes do problema:**

Non-canonical pages listed in the sitemap.

The URLs flagged have a canonical element that points to a different URL. The problem is that URLs listed in the sitemap are also a canonicalization signal. With conflicting signals like this, either the URL specified in the sitemap or the one in the canonical element may be indexed.

**Solução:**

Only include canonical URLs in your sitemaps. This should be the URLs that you want indexed.

### SMP-006 / Page from sitemap timed out

**Detalhes do problema:**

URLs in the sitemap file did not get the response from the server on time.

Sitemaps must only list accessible pages.

**Solução:**

Make sure your sitemaps only includes live accessible pages.

The timeout error can be caused by server issues. You might need help from your web developer or hosting provider to find the root of this problem.

### SMP-007 / Sitemap has syntax error

**Detalhes do problema:**

We were unable to parse source code of your sitemap due to a syntax error.

**Solução:**

Check your sitemap and make sure that special characters in its listed URLs are properly escaped.

### SMP-008 / Sitemap is not accessible

**Detalhes do problema:**

The crawler cannot access the sitemap because the server returns a blocking HTTP status or fails to complete the request.

**Solução:**

Confirm that the sitemap exists, returns HTTP 200, and is accessible to the crawler through the firewall, WAF, and server permissions.

### SMP-009 / Sitemap larger than 50MB

**Detalhes do problema:**

The size of an uncompressed sitemap should not exceed 50 MB. Otherwise, it will be ignored by search engines.

**Solução:**

Split your sitemap into multiple smaller sitemaps. To make it easier to manage multiple sitemaps, we recommend creating a sitemap index file.

### SMP-010 / Sitemap with over 50K URLs

**Detalhes do problema:**

A sitemap must have no more than 50,000 URLs. Otherwise, it will be ignored by search engines.

**Solução:**

Split your sitemap into multiple smaller sitemaps. To make it easier to manage multiple sitemaps, we recommend creating a sitemap index file.

### SMP-011 / Sitemap in the wrong format

**Detalhes do problema:**

Your sitemap has unsupported format, encoding or content type.

The auditor accepts XML sitemaps. Flag RSS, mRSS, Atom or text formats, invalid encoding, and an incorrect HTTP `Content-Type` response.

**Solução:**

Ensure that the sitemap is UTF-8 encoded, returns the "application/xml" or "text/xml" content-type HTTP header, and that it has the correct namespace and syntax of the XML header attribute.

### SMP-012 / Sitemap includes URLs out of its scope

**Detalhes do problema:**

Your sitemap includes URLs that do not match with the sitemap location.

All URLs listed in a sitemap must use the same protocol and belong to the same domain as the sitemap, unless you have all sites verified in GSC or you referenced a sitemap from an external location in your robots.txt. [Learn more](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap#cross-submit).

For example, if your sitemap is located at https://www.example.com/sitemap.xml, it can't include URLs from https://blog.example.com, or if your sitemap file located at https://example.com/catalog/sitemap.xml, it can't include URLs starting with https://example.com/product/.

**Solução:**

Ensure that all URLs in your sitemap belong to the same domain and path as the sitemap. You may also consider placing your sitemap at the root folder of your web server.

If you use a sitemap from an external location, be sure to include a link to it in your robots.txt file. However, all URLs in the external sitemap must be from the same site as the robots.txt file.

### SMP-013 / Indexable page not in sitemap

**Detalhes do problema:**

Sitemaps help search engines to crawl and index your site. If a page is important in your website, and you want it to be easily discoverable by search engines, we recommend including it in your sitemap.

**Solução:**

Review the list of pages found. If there's relevant pages with unique and valuable content, include them in a sitemap.

### SMP-014 / No. of URLs in sitemap decreased

**Detalhes do problema:**

This is a notice that the number of URLs referenced in some sitemaps has dropped by at least 20%.
This may indicate that you're changing the structure of your sitemaps or that those URLs were removed by mistake.

**Solução:**

Review affected sitemaps and ensure that the changes are intentional.

### SMP-015 / Page in multiple sitemaps

**Detalhes do problema:**

For search engines to crawl and index a page, it needs to be included in a single sitemap.
If a page appears in more than one sitemap, it's not necessarily a problem, but may indicate a bug with the sitemaps setup on your website.

**Solução:**

Check your sitemaps, and if duplicate pages got there by accident, include such pages in only one sitemap.

### SMP-016 / Pages added to sitemaps

**Detalhes do problema:**

This is a notice that some pages that were not previously included in sitemaps have been added there.

**Solução:**

Review affected pages and ensure that the changes are intentional.

### SMP-017 / Pages removed from sitemaps

**Detalhes do problema:**

This is a notice that we no longer found some pages in sitemaps that used to be there before.

Sitemaps help search engines to crawl and index your site. Removing pages from sitemaps may affect their discoverability by search engines.

**Solução:**

Review affected pages and ensure that the changes are intentional.

## Categoria: External pages

### EXT-001 / External 3XX redirect

**Detalhes do problema:**

Some external URLs linked from your site redirect to another URL.

A redirect on an external page could be set up after you had added a link to it from your website. Thus your link might point to a different page now.

**Solução:**

You should manually review the external redirecting URLs linked from your website to make sure the end page has relevant content.

Redirects always require caution. It is recommended to avoid redirects and use direct links to the destination pages where possible.

### EXT-002 / External 4XX

**Detalhes do problema:**

Some external URLs your website links to result in a 4xx HTTP response code. They may harm the user experience for the visitors of your website.

**Solução:**

Review all the pages reported and remove or replace links to them on your website.

Make sure your website has links to live pages only.

### EXT-003 / External 5XX

**Detalhes do problema:**

Some external URLs your website links to result in a 5xx HTTP response code (Server Error).

This may harm the user experience for the visitors of your website.

**Solução:**

Review all the pages reported and remove or replace links to them on your website.

Make sure your website has links to live pages only.

### EXT-004 / External time out

**Detalhes do problema:**

Some external URLs your website links to point to a page that took too long to get the response from the server.

External links on your page resulting in a time-out may harm the user experience for the visitors of your website.

**Solução:**

Review all the pages reported and remove or replace links to them on your website.

Make sure your website has links to live pages only.

## Categoria: Other

### OTH-001 / 3XX page receives organic traffic

**Detalhes do problema:**

URLs that redirect show up in search results.

This can happen when you set up a redirect on your website but search engines have not noticed it yet.

Before search engines re-crawl the redirecting URL, they will be showing it in search results.

**Solução:**

If the redirect is intentional, update internal links, canonical tags, sitemaps, hreflang, and external references to the final URL, then request a recrawl through URL Inspection. If it is not intentional, restore a 200 response.

### OTH-002 / 403 page receives organic traffic

**Detalhes do problema:**

Pages that return the "403 – Forbidden" HTTP response code but show up in search results.

403 (Forbidden) HTTP response code indicates that the crawler was not permitted to access the resource during the crawl. Given that the page receives organic traffic, it might have changed its status to 403 not so long ago.

URLs that return 403 response codes will be removed from Google's index upon a re-crawl.

**Solução:**

If the page should remain indexed, remove the unintended access restriction for verified search crawlers and return HTTP 200. If removal is intended, allow the crawler to observe the final indexing directive and request a recrawl through URL Inspection.

### OTH-003 / 4XX page receives organic traffic

**Detalhes do problema:**

URLs that return one of the 4xx HTTP codes show up in search results.

This can happen when you deleted or moved pages without setting up redirects while search engines have not yet removed them from their index.

Before search engines re-crawl the URL, they will be showing its indexed version in search results.

**Solução:**

Restore HTTP 200 when the error is unintended. For a permanently removed page with a relevant replacement, return 301 to that replacement; otherwise keep 404/410 and remove internal links, canonical references, hreflang, and sitemap entries. Request a recrawl through URL Inspection.

### OTH-004 / Double slash in URL

**Detalhes do problema:**

URLs that contain a double slash (after the domain part).

Most servers are set up to ignore a double slash in the URL path. However, such URLs may be confusing for search engines as they will be interpreted as stand-alone URLs, which can result in duplicate content issues.

**Solução:**

Normalize every affected URL by removing duplicate slashes from the path while preserving the `://` scheme separator.

After that, you can check the internal backlinks to the URLs with a double slash and point them to the corrected URL. This will prevent some unnecessary redirects on your website.


### OTH-005 / Noindex page receives organic traffic

**Detalhes do problema:**

Pages with `noindex` directive that show up in search results.

A `noindex` directive is used to prevent a page from search indexing.

If a noindexed page receives organic search traffic, search engines are not following this directive for some reason.

**Solução:**

Confirm that Googlebot can crawl the page and read the `noindex` directive in both HTML and `X-Robots-Tag`. If deindexing is intended, request a recrawl through URL Inspection. If the page should rank, remove every `noindex` source.

### OTH-006 / Robots.txt has syntax error

**Detalhes do problema:**

The crawler cannot parse `robots.txt` because it contains a syntax error. The auditor must treat access as disallowed until the file is valid.

**Solução:**

You can use [Google's robots.txt tester tool](https://support.google.com/webmasters/answer/6062598) to check your robots.txt for errors.

### OTH-007 / Robots.txt has too many redirects or redirect loop

**Detalhes do problema:**

The request to `/robots.txt` enters a redirect loop or exceeds the configured redirect-hop limit. The auditor must treat the domain as disallowed until the file is reachable.

**Solução:**

If the robots.txt URL is not supposed to redirect, change its HTTP response code to 200. For a URL that must be redirected, correct its final destination to a valid 200 URL.

Confirm that the crawler user-agent and verified crawler IP ranges are not blocked by the server or WAF.

### OTH-008 / Robots.txt is not accessible

**Detalhes do problema:**

The crawler cannot access `/robots.txt` because the server returns a blocking status or fails to complete the request. The auditor must treat the domain as disallowed until access is restored.

The likely causes are firewall, WAF, bot-protection, authentication, DNS, timeout, or server configuration.

**Solução:**

Check that you do not have a firewall or plugin blocking bots; and if you do, to whitelist our *AhrefsSiteAudit* user-agent on that system.

Allow the verified crawler IP ranges when the security layer requires an IP allowlist.

### OTH-009 / Robots.txt changed

**Detalhes do problema:**

We detected a change in your robots.txt file.

A robots.txt file tells search engines what content they are allowed to crawl on your website. Unintentional changes to this file can negatively impact ranking positions, overall indexability of your website, and visibility of new content to search engines.

**Solução:**

Review the changes and make sure they are intentional and nothing was disallowed or allowed by mistake.


### OTH-010 / Pages to submit to IndexNow

**Detalhes do problema:**

IndexNow is a free protocol that enables website owners to inform search engines about the latest content updates, additions, or removals on their sites. By notifying search engines about these changes, you can ensure that they are aware of the updates instantly, rather than waiting for their bots to crawl and discover the changes themselves.

This issue automatically selects pages that we recommend to submit to IndexNow. It includes:

- Indexable pages with content changes

- New indexable pages that were previously non-indexable or missing from the site

- Pages that have been removed or redirected

**Solução:**

Submit newly created, materially updated, removed, or redirected URLs through IndexNow. Record the submitted URL, submission time, HTTP response, and retry status. Do not submit unchanged URLs.

### OTH-011 / Structured data has Google rich results validation error

**Detalhes do problema:**

Structured data is a standardized way to provide information about a web page. It helps search engines to understand your content and better represent it in the search results.

Google uses structured data to show your content in a richer appearance in SERPs. Some pages of your site have structured data that does not follow the [Google guidelines](https://developers.google.com/search/docs/appearance/structured-data/search-gallery).

**Solução:**

Validate each affected URL with Google's Rich Results Test. Correct the reported type, required property, value format, or nesting error in the JSON-LD, Microdata, or RDFa. Confirm that every structured value matches visible page content.

### OTH-012 / More than three parameters in URL

**Detalhes do problema:**

URLs that have more than three URL parameters.

A URL should contain three or fewer query string parameters.

A link with more than 3 query string parameters may be unclear for search engines.

**Solução:**

Review the URLs reported and make sure they don't have more than three query strings.

### OTH-013 / No. of referring domains dropped

**Detalhes do problema:**

This is a notice that the number of referring domains linking to some pages has dropped by at least 20%.

**Solução:**

Compare referring domains between scans and inspect lost links, redirects, removals, and changes to the linking pages for every drop of at least 20%.

### OTH-014 / Non-canonical page receives organic traffic

**Detalhes do problema:**

Non-canonical pages show up in search results.

Similar or duplicate pages of your website must have a `rel=canonical` attribute to instruct search engines to show the most authoritative (canonical) version of the page in search results.

**Solução:**

Check if your `rel=canonical` attributes are set-up correctly for the reported pages.

### OTH-015 / Organic traffic dropped

**Detalhes do problema:**

This is a notice that the organic traffic to some pages has dropped by at least 20%.

**Solução:**

Compare organic traffic, impressions, clicks, CTR, average position, indexability, content changes, and technical incidents for every drop of at least 20%.

### OTH-016 / Pages dropped from Top 10

**Detalhes do problema:**

This is a notice about pages that have dropped out of top 10 organic search results for certain keywords.

**Solução:**

Compare the affected queries and URLs between scans; inspect content, search intent, competitors, backlinks, internal links, canonicalization, and indexability.

### OTH-017 / Robots.txt rules disallow to crawl

**Detalhes do problema:**

The configured audit crawler user-agent is disallowed from crawling the entire domain by `robots.txt`.

**Solução:**

If the block is intentional, record the domain as unavailable for auditing. Otherwise, remove the domain-wide `Disallow` rule for the configured crawler user-agent.

You can add the following lines into the robots.txt file on your server to allow crawling:

```
User-agent: SeoAuditBot
Allow: /
```

### OTH-018 / Structured data has schema.org validation error

**Detalhes do problema:**

Structured data is a standardized way to provide information about a web page. It helps search engines to understand your content and better represent it in the search results.

Structured data needs to conform to the [schema.org](https://schema.org/) markup format. Some pages on your site have structured data that does not meet the schema vocabulary and guidelines.

**Solução:**

Validate each affected item against the current Schema.org vocabulary. Correct unsupported properties, invalid types, value formats, and nesting in JSON-LD, Microdata, or RDFa.

### OTH-019 / Páginas importantes têm poucas referências externas independentes

**Detalhes do problema:**

Páginas comerciais ou editoriais prioritárias recebem poucas ou nenhumas ligações de domínios externos independentes, ou dependem de links sitewide, redes do mesmo proprietário, diretórios sem relevância, redirects, links pagos ou fontes de baixa qualidade. A deteção deve contar domínios de referência únicos para as URLs canonical, separar links `follow`, `nofollow`, `ugc` e `sponsored`, verificar o destino final e comparar páginas que disputam a mesma intenção, país e idioma. Não existe um número universal mínimo de backlinks; deve ser sinalizada uma lacuna persistente de relevância e autoridade, não apenas uma contagem baixa.

**Solução:**

Obter referências editoriais legítimas publicando recursos que mereçam citação, como estudos, dados próprios, ferramentas, comparações técnicas, casos reais, fotografias ou guias especializados. Procurar menções relevantes de clientes, fornecedores, fabricantes, distribuidores, associações profissionais e imprensa; recuperar menções sem link e backlinks quebrados; apontar para a URL canonical e preservar links válidos com redirects quando uma página muda. Não comprar links, usar PBN, automatizar comentários ou executar trocas em escala. Marcar publicidade e colocações pagas com `rel="sponsored"` e UGC com `rel="ugc"`. [Referência oficial](https://developers.google.com/search/docs/essentials/spam-policies#link-spam).

## Categoria: Indexação e citação em sistemas de IA

### AIX-001 / Página importante não está indexada

**Detalhes do problema:**

Uma página que está fora do índice do Google não pode servir de fonte numa resposta de pesquisa do Google. O mesmo princípio aplica-se a páginas inacessíveis aos crawlers de outros motores: sem conteúdo rastreável, não há base para uma citação.

**Solução:**

Confirmar no URL Inspection `Indexing allowed`, `Crawl allowed`, resposta HTTP 200, canonical correta, ausência de login e inclusão no sitemap. Corrigir a causa antes de pedir indexação; não submeter repetidamente URLs que continuam bloqueadas.

### AIX-002 / `robots.txt` bloqueia o Googlebot

**Detalhes do problema:**

O Google usa o rastreamento normal do Googlebot para alimentar o índice que suporta as funcionalidades de IA. Bloquear a página, a pasta de conteúdo ou os recursos necessários no `robots.txt` impede a descoberta ou a leitura.

**Solução:**

Permitir o Googlebot nas áreas públicas, manter áreas administrativas e APIs privadas bloqueadas, publicar o sitemap no `robots.txt` e testar a URL com o URL Inspection.

### AIX-003 / `OAI-SearchBot` é bloqueado

**Detalhes do problema:**

O bloqueio no `robots.txt`, CDN, WAF, firewall ou rate limit pode impedir a descoberta do conteúdo público para experiências de pesquisa da OpenAI. `OAI-AdsBot` é relevante para validação de landing pages de anúncios; não o confundir com o crawler de pesquisa.

**Solução:**

Se a intenção for permitir descoberta no ChatGPT Search, permitir `OAI-SearchBot` para os caminhos públicos e confirmar nos logs que recebe HTTP 200. Validar também regras de WAF, desafios JavaScript, CAPTCHA, autenticação e respostas 429/403. O allowlist deve combinar user-agent com os mecanismos oficiais de verificação/IP, nunca confiar apenas no texto do user-agent.

### AIX-004 / `PerplexityBot` ou `Perplexity-User` não conseguem chegar ao conteúdo

**Detalhes do problema:**

`PerplexityBot` é usado para descobrir e ligar sites nos resultados da Perplexity. O acesso iniciado por uma pergunta de utilizador usa `Perplexity-User` e pode seguir um caminho de segurança diferente.

**Solução:**

Permitir `PerplexityBot` nas áreas públicas e configurar o WAF com user-agent e as gamas IP publicadas pela Perplexity. Monitorizar ambos os agentes, atualizar as gamas IP automaticamente e não abrir endpoints privados.

### AIX-005 / WAF, CAPTCHA ou desafio anti-bot interrompe o rastreamento

**Detalhes do problema:**

Um crawler pode receber uma página de desafio em vez do conteúdo, mesmo quando o browser humano vê a página normalmente. Um 403, 429, redirect para login ou HTML de challenge torna a página inutilizável como fonte.

**Solução:**

Criar uma exceção de leitura limitada aos caminhos públicos, com verificação do crawler, origem/IP e método `GET`. Manter bloqueados `POST`, endpoints de escrita, áreas autenticadas e dados pessoais. Guardar no log user-agent, IP verificado, status, regra acionada e tempo de resposta.

### AIX-006 / A página tem `noindex`

**Detalhes do problema:**

`noindex` remove a página dos resultados de pesquisa e, consequentemente, da elegibilidade para funcionalidades de IA baseadas nesse índice. É comum a diretiva ser herdada por template, ambiente de staging ou regra aplicada a toda uma categoria.

**Solução:**

Remover `noindex` apenas de páginas públicas que devem ser encontradas. Confirmar o HTML final e o header HTTP; não basta alterar o template se o CDN continuar a enviar `X-Robots-Tag: noindex`.

### AIX-007 / `nosnippet`, `max-snippet: 0` ou `data-nosnippet` esconde o conteúdo útil

**Detalhes do problema:**

Estes controlos limitam o texto que pode ser mostrado como preview. Se forem aplicados ao preço, características, respostas, definições ou conclusões que queremos que sejam citados, o sistema pode não ter um excerto utilizável.

**Solução:**

Rever `meta[name=robots]`, `X-Robots-Tag` e todos os elementos `data-nosnippet`. Remover restrições apenas dos trechos públicos que devem aparecer; preservar `nosnippet` em dados sensíveis. Depois, pedir novo rastreamento e verificar o HTML recebido pelo crawler.

### AIX-008 / `X-Robots-Tag` contradiz o HTML

**Detalhes do problema:**

A aplicação pode mostrar `index,follow` no HTML, enquanto o servidor, CDN ou storage envia `X-Robots-Tag: noindex` ou `nosnippet`. O header vence na decisão do crawler e é difícil de detetar olhando apenas para a página no browser.

**Solução:**

Testar todas as variantes HTTP (domínio, idioma, trailing slash, parâmetros e redirects) e comparar headers. Centralizar a política de robots no servidor/CDN e incluir um teste automático que falhe quando HTML e headers se contradizem.

### AIX-009 / Conteúdo principal só aparece depois de JavaScript

**Detalhes do problema:**

Renderização JavaScript pode funcionar, mas é mais frágil: depende do crawler conseguir executar os scripts, carregar APIs e não ser bloqueado por cookies, geolocalização ou autenticação. Se o HTML inicial tiver apenas um spinner, o conteúdo fica difícil de descobrir e validar.

**Solução:**

Entregar no HTML inicial o título, resumo, factos, preço, disponibilidade, headings e links principais (SSR/SSG ou renderização no servidor). Usar JavaScript para interação, filtros e carrinho, não para esconder toda a informação indexável. Comparar HTML bruto e DOM renderizado.

### AIX-010 / Conteúdo importante está numa imagem, canvas ou PDF não acessível

**Detalhes do problema:**

Texto dentro de uma imagem, canvas ou screenshot não oferece a mesma clareza semântica que texto HTML. Um PDF pode ser indexável, mas não substitui uma página HTML quando a resposta precisa de contexto, links e atualização frequente.

**Solução:**

Repetir os factos relevantes em HTML semântico, com `alt` descritivo nas imagens e links para o documento original quando necessário. Para produtos, disponibilizar nome, medidas, material, preço, condições e disponibilidade como texto visível.

### AIX-011 / Estrutura semântica não deixa claro o que é resposta e o que é decoração

**Detalhes do problema:**

Um DOM com apenas `div`, headings fora de ordem, menus misturados com o conteúdo e blocos sem rótulos dificulta a extração de entidades e relações. Não é necessário HTML perfeito, mas a estrutura deve ser legível para pessoas e tecnologias assistivas.

**Solução:**

Usar um único `h1` coerente, `h2`/`h3` para secções, `main`, `article`, `nav`, listas e tabelas quando apropriado. Colocar a resposta/facto no mesmo bloco que o heading que o introduz e manter a navegação separada do conteúdo principal.

### AIX-012 / Canonical aponta para outra página ou existe cadeia de redirects

**Detalhes do problema:**

A URL que o crawler visita pode declarar canonical para uma versão diferente, redirecionar várias vezes ou ser uma variante não preferida. Isso dilui sinais e pode fazer o sistema escolher outra página como fonte.

**Solução:**

Para cada página importante, usar uma canonical absoluta que devolva HTTP 200, apontando para a versão final. Atualizar links internos e sitemap para essa mesma URL e reduzir redirects a um salto quando possível.

### AIX-013 / Sitemap não contém as páginas públicas importantes

**Detalhes do problema:**

Sitemap não garante indexação, mas ajuda a descobrir páginas novas e alteradas. URLs 3xx, 4xx, 5xx, `noindex`, não canonical ou variantes de idioma erradas enviam sinais contraditórios.

**Solução:**

Gerar sitemaps separados quando necessário, com apenas URLs públicas, canónicas, indexáveis e HTTP 200. Atualizar `lastmod` quando houver alteração real e submeter o índice no Search Console; validar também os sitemaps de produtos e idiomas.

### AIX-014 / Página é órfã ou tem pouca descoberta interna

**Detalhes do problema:**

Uma página apenas no sitemap, sem links contextuais, é mais difícil de encontrar e de relacionar com o restante site. Isto é crítico para produtos, guias e páginas de comparação que deveriam responder a perguntas específicas.

**Solução:**

Adicionar links HTML normais a partir de categorias, guias, breadcrumbs, páginas relacionadas e navegação. Usar âncoras descritivas e ligar diretamente à canonical, sem depender de eventos JavaScript ou de pesquisa interna.

### AIX-015 / Duplicação entre idiomas, parâmetros e variantes

**Detalhes do problema:**

Muitas URLs com o mesmo conteúdo podem competir entre si, desperdiçar rastreamento e produzir respostas com idioma, preço ou disponibilidade errados. Tradução automática sem `hreflang` consistente agrava a ambiguidade.

**Solução:**

Definir uma URL canonical por variante, usar `hreflang` recíproco para PT/ES, alinhar `lang` do HTML e manter parâmetros de filtros fora do índice quando não criam conteúdo único. Cada idioma deve ter texto realmente correspondente e dados comerciais corretos.

### AIX-016 / JSON-LD não corresponde ao texto visível

**Detalhes do problema:**

Schema.org não é um passe especial para IA. Contudo, dados estruturados inconsistentes podem introduzir entidades, preços, avaliações, marcas ou disponibilidade que a página não confirma.

**Solução:**

Gerar JSON-LD a partir da mesma fonte de dados que alimenta a interface. Validar `Product`, `Offer`, `Organization`, `Article` e `BreadcrumbList`, remover propriedades inventadas e garantir que URLs, nomes, imagens, preços e datas coincidem com o conteúdo visível.

### AIX-017 / Produto sem identidade e atributos suficientes

**Detalhes do problema:**

Uma página com “produto” no título, mas sem SKU, marca, categoria, medidas, material, finalidade, preço ou disponibilidade claros, oferece pouco contexto para responder a comparações e perguntas de compra.

**Solução:**

Criar um bloco textual estável com nome, resumo, especificações, usos, limitações, preço/moeda, stock, entrega e devoluções. Usar `Product`/`Offer` apenas com valores reais e ligar o produto às categorias e páginas relacionadas.

### AIX-018 / Factos comerciais estão desatualizados

**Detalhes do problema:**

Preço, stock, prazos, portes ou política de devolução antigos podem ser recuperados por um crawler e gerar uma resposta incorreta. A indexação demora e não acompanha cada alteração em tempo real.

**Solução:**

Atualizar HTML, JSON-LD, feed Merchant Center e sitemaps no mesmo deploy. Exibir `dateModified` quando fizer sentido, manter histórico de alterações e retirar rapidamente páginas de produtos descontinuados ou redirecioná-las para substitutos relevantes.

### AIX-019 / Conteúdo genérico, reciclado ou criado apenas para variações de consulta

**Detalhes do problema:**

Criar dezenas de páginas quase iguais para cada pergunta, cidade ou combinação de palavras-chave aumenta volume, mas não acrescenta evidência ou experiência. O Google recomenda conteúdo útil, original e feito para pessoas; não há requisito de “texto para IA”, `llms.txt` ou comprimento/chunking específico.

**Solução:**

Consolidar páginas semelhantes e acrescentar experiência própria, exemplos, dados, testes, fotografias, limitações e decisões editoriais. Usar IA como apoio de produção com revisão humana, fact-checking e autoria clara; eliminar páginas sem valor único.

### AIX-020 / Página não demonstra quem responde e de onde vêm os factos

**Detalhes do problema:**

Sistemas de resposta procuram sinais de confiança, sobretudo em temas comerciais, técnicos ou sensíveis. Um texto anónimo, sem empresa, autor, método, fonte ou data, é menos verificável.

**Solução:**

Mostrar autor ou entidade responsável, página “Sobre”, contacto, política editorial quando aplicável, data de publicação/atualização, fontes externas relevantes e experiência própria. Não criar testemunhos, menções ou citações falsas para parecer mais citado.

### AIX-021 / Links de apoio estão quebrados ou apontam para fontes irrelevantes

**Detalhes do problema:**

Links internos/externos quebrados dificultam a confirmação do contexto e degradam a experiência depois da citação. Redirects, páginas 404 e fontes que mudaram de assunto também reduzem a utilidade da resposta.

**Solução:**

Executar o crawler de links, substituir destinos mortos por fontes equivalentes e ligar diretamente à URL final. Para afirmações importantes, citar a fonte primária e indicar a data ou versão dos dados.

### AIX-022 / Localização e negócio local incompletos

**Detalhes do problema:**

Para perguntas locais, dados contraditórios entre site, Google Business Profile, Merchant Center, morada, telefone, horários e áreas servidas dificultam a associação da entidade correta.

**Solução:**

Uniformizar nome, endereço, telefone, horários, áreas de entrega e políticas em todas as fontes. Usar `Organization`/`LocalBusiness` quando apropriado e manter o Business Profile e Merchant Center atualizados.

### AIX-023 / Site mede apenas rankings clássicos e não deteta citações em IA

**Detalhes do problema:**

A presença em AI Overviews/AI Mode aparece no tráfego geral “Web” do Search Console; não se deve esperar uma métrica interna de “posição GEO” de ferramentas de terceiros. Cliques e conversões podem vir de consultas que não aparecem como uma keyword tradicional.

**Solução:**

Acompanhar Search Console, Analytics, logs e conversões por landing page. Registar consultas de teste manual sem as tratar como garantia, comparar períodos após alterações e desconfiar de ferramentas que prometem acesso a métricas internas do Google ou dos modelos.

### AIX-024 / Acesso autorizado é confundido com garantia de citação

**Detalhes do problema:**

Permitir rastreamento, estar indexado e ter conteúdo excelente apenas torna a página elegível. A seleção depende da consulta, idioma, localização, concorrência, qualidade, frescura e do modelo; resultados podem variar entre AI Overviews, AI Mode, ChatGPT e Perplexity.

**Solução:**

Tratar “aparecer em pesquisas AI” como objetivo probabilístico. Corrigir primeiro os bloqueios técnicos, depois melhorar conteúdo e entidade, medir tráfego e conversões e nunca comprar links, avaliações, menções ou promessas de posição garantida.

### AIX-025 / Regra de segurança permite qualquer pedido que imita um bot

**Detalhes do problema:**

Autorizar todo o tráfego com `User-Agent: Googlebot`, `OAI-SearchBot` ou `PerplexityBot` abre espaço para spoofing e pode expor áreas privadas. O user-agent é apenas um sinal.

**Solução:**

Separar allowlist por crawler e caminho público, validar IP/origem segundo a documentação atual de cada fornecedor, limitar métodos a `GET/HEAD`, aplicar rate limits razoáveis e manter logs/alertas. Rever automaticamente as listas de IP, pois podem mudar.

### AIX-026 / Mudanças de preview, robots ou conteúdo não são revalidadas

**Detalhes do problema:**

Depois de uma correção, o crawler pode continuar a usar uma versão antiga durante algum tempo. Uma captura local não prova o que o Googlebot ou outro crawler recebeu.

**Solução:**

Repetir URL Inspection, Rich Results Test e pedidos HTTP com os user-agents relevantes. Comparar status, canonical, robots, `X-Robots-Tag`, HTML e JSON-LD antes/depois; só fechar o problema após novo crawl e evidência nos logs.

### AIX-027 / `Google-Extended` é confundido com o controlo de indexação do Google Search

**Detalhes do problema:**

`Google-Extended` é um controlo separado para limitar usos em determinados sistemas de IA da Google. Não é um requisito para AI Overviews/AI Mode e não substitui `Googlebot`, `noindex` ou as diretivas de preview. Bloqueá-lo ou permiti-lo não garante nem impede, por si só, a presença nos resultados de pesquisa.

**Solução:**

Decidir a política de `Google-Extended` separadamente da política de rastreamento do Google Search. Para aparecer em pesquisa, manter a página tecnicamente elegível para o Googlebot; para limitar usos específicos fora da pesquisa, aplicar a diretiva documentada sem bloquear acidentalmente o conteúdo público.

## Categoria: Product snippets

### PRD-001 / Product snippet sem propriedades mínimas

**Detalhes do problema:**

O objeto `Product` não contém `name` ou não contém pelo menos uma das propriedades `offers`, `review` ou `aggregateRating`. Sem estes dados, o item não é elegível para Product snippets.

**Solução:**

Adicionar `name` e pelo menos uma propriedade válida entre `offers`, `review` e `aggregateRating`. Validar o JSON-LD no Rich Results Test e confirmar que os valores aparecem no conteúdo visível.

### PRD-002 / `aggregateRating` ausente

**Detalhes do problema:**

A propriedade `aggregateRating` está ausente. A ausência não bloqueia o rich result quando existe uma `Offer` válida; é uma recomendação, não um erro.

**Solução:**

Adicionar `aggregateRating` somente quando existirem avaliações reais, visíveis e verificáveis, com `ratingValue` e `reviewCount` coerentes. Não gerar classificações artificiais.

### PRD-003 / `review` ausente

**Detalhes do problema:**

A propriedade `review` está ausente. O produto pode continuar elegível quando contém uma `Offer` válida.

**Solução:**

Adicionar `review` apenas para avaliações reais apresentadas na página, incluindo autor válido e `reviewRating`. Manter o aviso se não existirem avaliações legítimas.

### PRD-004 / Preço ou moeda da oferta inválidos

**Detalhes do problema:**

A `Offer` não contém preço ativo maior que zero para Merchant listings, usa formato inválido ou não associa `priceCurrency` em código ISO 4217.

**Solução:**

Gerar `price` e `priceCurrency` a partir da mesma fonte usada na interface. Usar ponto decimal, sem símbolo monetário, e atualizar ou remover `priceValidUntil` expirado.

### PRD-005 / Disponibilidade estruturada diverge do produto

**Detalhes do problema:**

O valor `offers.availability` não corresponde ao stock ou estado de compra visível na página.

**Solução:**

Atualizar HTML, JSON-LD e feed Merchant Center na mesma operação. Usar uma enumeração Schema.org suportada, como `InStock`, `OutOfStock`, `PreOrder` ou `Discontinued`.

### PRD-006 / Página de produto não indexada

**Detalhes do problema:**

A página de produto não está indexada ou aparece como rastreada/detetada sem indexação. Dados estruturados válidos não substituem os requisitos de rastreamento, canonicalização, conteúdo e indexação.

**Solução:**

Confirmar HTTP 200, canonical própria, ausência de `noindex`, conteúdo único, links internos e presença no sitemap do idioma. Corrigir a causa e só depois pedir nova indexação.

### PRD-007 / JSON-LD do produto disponível apenas após JavaScript

**Detalhes do problema:**

O objeto `Product` ou os seus valores só são inseridos após execução no cliente, tornando a recolha menos previsível e podendo atrasar atualizações de preço e stock.

**Solução:**

Emitir o JSON-LD completo no HTML inicial por SSR/SSG, usando os mesmos dados do produto renderizado. Comparar o HTML bruto com o DOM final.

### PRD-008 / Dados de produto inconsistentes entre idiomas ou regiões

**Detalhes do problema:**

As versões linguísticas ou regionais declaram URL, nome, moeda, preço, stock, portes ou política diferentes sem correspondência comercial real.

**Solução:**

Gerar cada versão a partir da mesma entidade de produto, adaptar apenas conteúdo e mercados aplicáveis, manter canonical própria e configurar `hreflang` recíproco.

## Categoria: Merchant listings

### MER-001 / `handlingTime` ausente

**Detalhes do problema:**

Existe `transitTime`, mas falta `shippingDetails.deliveryTime.handlingTime`, que representa o intervalo entre a receção da encomenda e a saída do armazém.

**Solução:**

Adicionar `handlingTime` como `QuantitativeValue`, com `minValue`, `maxValue` inteiros não negativos e `unitCode` igual a `DAY` ou `d`. Usar prazos reais.

### MER-002 / `shippingDetails` ausente

**Detalhes do problema:**

A `Offer` não fornece uma política de envio específica nem referencia uma política global.

**Solução:**

Definir política global de envio em `Organization` ou Merchant Center. Para exceções por produto, adicionar `Offer.shippingDetails` com destino, preço e prazo completos.

### MER-003 / `shippingDetails` incompleto

**Detalhes do problema:**

`OfferShippingDetails` existe, mas falta `shippingDestination.addressCountry`, `shippingRate` ou `deliveryTime`; a moeda dos portes pode divergir da moeda da oferta.

**Solução:**

Adicionar país ISO 3166-1 alpha-2, custo com moeda igual à `Offer`, e `deliveryTime` com `handlingTime` e `transitTime`. Criar uma entrada por combinação real de destino e modalidade.

### MER-004 / `hasMerchantReturnPolicy` ausente

**Detalhes do problema:**

A `Offer` não fornece uma política de devolução específica nem uma referência inequívoca para a política global.

**Solução:**

Definir a política global em `Organization` ou Merchant Center. Usar `Offer.hasMerchantReturnPolicy` apenas para uma exceção do produto ou para referenciar a política global por `@id`.

### MER-005 / Política de devolução incompleta

**Detalhes do problema:**

`MerchantReturnPolicy` não contém `applicableCountry` e `returnPolicyCategory`, ou omite `merchantReturnDays` quando a categoria define uma janela finita.

**Solução:**

Adicionar país ISO de duas letras, categoria válida e número real de dias quando aplicável. Declarar `returnMethod` e `returnFees` de acordo com a política visível.

### MER-006 / Portes estruturados não correspondem ao checkout

**Detalhes do problema:**

Destino, preço ou prazo declarados no JSON-LD diferem dos valores apresentados ao cliente no produto ou checkout.

**Solução:**

Gerar dados estruturados e checkout a partir da mesma configuração comercial. Testar amostras por país, idioma e modalidade de envio após cada alteração.

### MER-007 / Feed Merchant Center diverge do site

**Detalhes do problema:**

Preço, stock, identificador, URL, portes ou devoluções no feed não coincidem com o HTML e o JSON-LD da página.

**Solução:**

Escolher uma fonte de dados única, sincronizar feed, página e JSON-LD no mesmo ciclo de atualização e monitorizar rejeições ou avisos no Merchant Center.

## Categoria: Apresentação nos resultados do Google

### GSA-001 / Título vago, duplicado ou com boilerplate excessivo

**Detalhes do problema:**

O `<title>` não identifica o conteúdo específico da página, é igual ao de outras URLs ou difere apenas numa variável enquanto repete uma sequência extensa comum. O Google pode criar o title link a partir do título visual, `<h1>`, `og:title`, texto proeminente e âncoras internas ou externas quando os sinais são pouco descritivos ou inconsistentes. [Referência oficial](https://developers.google.com/search/docs/appearance/title-link).

**Solução:**

Gerar um título conciso, descritivo e distinto para cada URL. Manter apenas boilerplate aplicável à página e um identificador de marca curto no início ou fim, separado por hífen, dois-pontos ou barra vertical.

### GSA-002 / Keyword stuffing ou branding repetitivo no título

**Detalhes do problema:**

O `<title>` repete palavras, sinónimos, variações de consulta ou uma descrição extensa da marca. A repetição não ajuda a distinguir a página, pode ser interpretada como spam e aumenta a probabilidade de o Google reescrever o title link. [Referência oficial](https://developers.google.com/search/docs/appearance/title-link).

**Solução:**

Manter apenas os termos necessários para descrever naturalmente o conteúdo. Reduzir o branding ao nome curto e consistente do site.

### GSA-003 / Título principal visual ambíguo

**Detalhes do problema:**

Existem vários títulos grandes com peso visual semelhante ou não existe um título principal claramente dominante. O Google considera `<title>`, headings, texto grande ou proeminente e outras fontes; perante ambiguidade, pode escolher um texto diferente do pretendido. [Referência oficial](https://developers.google.com/search/docs/appearance/title-link).

**Solução:**

Usar um único título visual dominante, de preferência o primeiro `<h1>` visível, e reduzir a proeminência dos restantes headings. Alinhar `<title>`, `<h1>`, `og:title` e assunto principal.

### GSA-004 / Título inexato, obsoleto ou no idioma errado

**Detalhes do problema:**

O `<title>` descreve uma entidade, data, versão, estado ou idioma diferente do conteúdo principal. Títulos inexatos, desatualizados ou escritos noutro idioma ou sistema de escrita podem ser substituídos pelo Google. [Referência oficial](https://developers.google.com/search/docs/appearance/title-link).

**Solução:**

Atualizar o `<title>` sempre que os atributos principais mudarem e usar o mesmo idioma e sistema de escrita do conteúdo dominante. Gerar o título e o conteúdo a partir da mesma fonte de dados.

### GSA-005 / Meta description duplicada, genérica ou composta por palavras-chave

**Detalhes do problema:**

A `meta[name="description"]` é repetida entre páginas, não resume a URL ou consiste principalmente numa lista de termos. O Google pode ignorá-la e gerar o snippet a partir do conteúdo visível. [Referência oficial](https://developers.google.com/search/docs/appearance/snippet).

**Solução:**

Criar uma descrição humana e específica para cada página. Em páginas baseadas em dados, incluir atributos factuais relevantes, como autor, data, preço, fabricante, localização ou horário, sem keyword stuffing.

### GSA-006 / `nosnippet` aplicado involuntariamente

**Detalhes do problema:**

O robots meta ou `X-Robots-Tag` contém `nosnippet`. A diretiva remove o snippet textual e a pré-visualização de vídeo em Web Search, Images, Discover, AI Overviews e AI Mode; também impede o conteúdo de ser usado como entrada direta nestas funcionalidades de IA. [Referência oficial](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag).

**Solução:**

Remover `nosnippet` das páginas destinadas a fornecer previews ou conteúdo à Pesquisa. Mantê-lo apenas quando a exclusão total de snippets for uma decisão explícita.

### GSA-007 / `max-snippet` inválido ou demasiado restritivo

**Detalhes do problema:**

`max-snippet` contém valor inválido, `0` ou um limite inferior ao necessário. `0` equivale a `nosnippet`, `-1` não impõe limite e valores positivos definem o máximo de caracteres; a regra também limita o texto diretamente utilizável em AI Overviews e AI Mode. [Referência oficial](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag).

**Solução:**

Omitir a diretiva ou usar `max-snippet:-1` quando não existe limitação editorial. Usar um inteiro positivo apenas quando houver uma política concreta e testar o impacto nos snippets.

### GSA-008 / `max-image-preview` restringe imagens grandes

**Detalhes do problema:**

A página usa `max-image-preview:none` ou `standard` apesar de depender de miniaturas grandes. Os valores válidos são `none`, `standard` e `large`; `large` permite uma imagem até à largura do viewport. [Referência oficial](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag).

**Solução:**

Definir `max-image-preview:large` quando forem desejadas imagens grandes, especialmente para conteúdo elegível ao Discover.

### GSA-009 / `max-video-preview` restringe a pré-visualização

**Detalhes do problema:**

`max-video-preview` é inválido, `0` ou inferior à duração desejada. O valor representa segundos; `0` permite no máximo uma imagem estática e `-1` não impõe limite. [Referência oficial](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag).

**Solução:**

Usar um número de segundos adequado ou `max-video-preview:-1` quando forem desejadas pré-visualizações em movimento sem limite definido pelo site.

### GSA-010 / `data-nosnippet` aplicado de forma inválida ou instável

**Detalhes do problema:**

O atributo é usado fora de `span`, `div` ou `section`, o elemento não é fechado corretamente ou JavaScript altera o atributo depois de o nó existir. O atributo é booleano: `data-nosnippet="false"` continua a bloquear o conteúdo. Uma tag não fechada pode excluir do snippet todo o texto seguinte. [Referência oficial](https://developers.google.com/search/docs/appearance/snippet).

**Solução:**

Aplicar o atributo apenas aos elementos suportados, fechar e validar o HTML e entregá-lo no HTML inicial ou no momento em que o nó é criado.

### GSA-011 / Deep link para a passagem relevante é bloqueado

**Detalhes do problema:**

O conteúdo-alvo está oculto numa tab ou accordion, JavaScript força o scroll para o topo ou remove o fragmento `#...` através da History API. Isto pode impedir que um resultado abra diretamente na passagem relevante. [Referência oficial](https://developers.google.com/search/docs/appearance/snippet).

**Solução:**

Tornar o conteúdo-alvo imediatamente acessível, abrir automaticamente o componente que o contém e preservar o fragmento e a posição de scroll no carregamento.

### GSA-012 / Estrutura interna não evidencia páginas candidatas a sitelinks

**Detalhes do problema:**

Páginas importantes estão órfãs, demasiado profundas ou ligadas apenas a partir de páginas irrelevantes; os links usam âncoras genéricas e os títulos/headings são vagos ou repetidos. Os sitelinks são selecionados automaticamente a partir da estrutura e dos sinais do site. [Referência oficial](https://developers.google.com/search/docs/appearance/sitelinks).

**Solução:**

Criar uma hierarquia lógica, ligar páginas importantes a partir de páginas relacionadas e usar âncoras, títulos e headings curtos, informativos e distintos. Não existe controlo manual de sitelinks; usar `noindex` apenas se a própria página não dever aparecer.

### GSA-013 / Tradução automática desativada involuntariamente

**Detalhes do problema:**

O robots meta ou `X-Robots-Tag` contém `notranslate`, impedindo a tradução do title link, snippet e página nas funcionalidades de tradução do Google. [Referência oficial](https://developers.google.com/search/docs/appearance/translated-results).

**Solução:**

Remover `notranslate` quando o conteúdo puder aparecer em resultados traduzidos. Mantê-lo apenas por decisão editorial ou jurídica explícita.

### GSA-014 / Título e landing page não correspondem às consultas reais do Search Console

**Detalhes do problema:**

Uma URL recebe impressões para consultas relevantes, mas o `<title>`, H1, introdução e conteúdo principal não exprimem a intenção dominante ou prometem uma resposta diferente da oferecida. A deteção deve cruzar `query`, `page`, `country`, `device` e período no relatório de desempenho, segmentar pesquisas de marca e não-marca e sinalizar pares consulta–URL com volume material, posição média competitiva e CTR abaixo da referência de páginas equivalentes. CTR ou posição média isoladas não provam o problema, e parte das consultas pode ser omitida pelo Search Console por privacidade.

**Solução:**

Agrupar as consultas reais por intenção e atribuir uma intenção principal a cada URL canonical. Ajustar `<title>`, H1, introdução, headings e conteúdo para descrever com precisão essa intenção e a resposta existente, mantendo texto natural e sem repetir variações de palavras-chave. Quando intenções realmente diferentes competirem na mesma página, consolidar as sobrepostas ou criar landing pages distintas com conteúdo próprio e links internos adequados. Medir novamente após o rastreamento e indexação, comparando períodos equivalentes por país e dispositivo. [Referências oficiais: title links](https://developers.google.com/search/docs/appearance/title-link) e [relatório de desempenho](https://support.google.com/webmasters/answer/7576553).

## Categoria: Identidade visual e nome do site

### IDN-001 / Favicon não declarado na homepage

**Detalhes do problema:**

A homepage do domínio ou subdomínio não contém `<link rel="icon" href="...">` nem outro `rel` suportado: `icon`, `shortcut icon`, `apple-touch-icon` ou `apple-touch-icon-precomposed`. O Google suporta um favicon por hostname, não por subdiretório. [Referência oficial](https://developers.google.com/search/docs/appearance/favicon-in-search).

**Solução:**

Declarar o favicon no `<head>` da homepage raiz de cada hostname. O `href` pode ser absoluto, relativo ou apontar para uma CDN.

### IDN-002 / Favicon bloqueado, instável ou com dimensão inválida

**Detalhes do problema:**

Googlebot não consegue rastrear a homepage, Googlebot-Image não obtém o ficheiro, o URL expira ou muda, ou a imagem não é quadrada e mede menos de 8×8 px. O mínimo é 8×8 px e o Google recomenda mais de 48×48 px. [Referência oficial](https://developers.google.com/search/docs/appearance/favicon-in-search).

**Solução:**

Publicar uma imagem 1:1, preferencialmente superior a 48×48 px, num URL estável; remover bloqueios de robots, autenticação e firewall da homepage e do ficheiro.

### IDN-003 / `WebSite` ausente ou fora da homepage raiz

**Detalhes do problema:**

Não existe um nó `WebSite` na homepage do domínio ou subdomínio, ou este só existe numa subpasta. Site names são suportados ao nível de domínio e subdomínio, não de subdiretório. [Referência oficial](https://developers.google.com/search/docs/appearance/site-names).

**Solução:**

Adicionar um único nó `WebSite` na homepage raiz com `name` e `url`; `url` deve ser o URL canónico da homepage.

### IDN-004 / Múltiplos nós `WebSite` ou sinais de nome inconsistentes

**Detalhes do problema:**

A homepage contém nós `WebSite` concorrentes, duplicados da homepage publicam dados diferentes, ou `WebSite.name`, `og:site_name`, `<title>`, headings e texto principal apresentam nomes incompatíveis. [Referência oficial](https://developers.google.com/search/docs/appearance/site-names).

**Solução:**

Consolidar as propriedades num único nó e publicar os mesmos dados em duplicados HTTP/HTTPS e www/non-www. Usar o mesmo nome em todas as fontes.

### IDN-005 / Site name genérico, enganador ou excessivamente longo

**Detalhes do problema:**

O nome não identifica a entidade, é uma categoria ou consulta genérica, contém descritores desnecessários ou diverge do nome reconhecido publicamente. Não existe limite fixo, mas nomes longos podem ser truncados e nomes genéricos são menos propensos a ser escolhidos. [Referência oficial](https://developers.google.com/search/docs/appearance/site-names).

**Solução:**

Usar um nome conciso, único, reconhecido e não enganador. Quando exista acrónimo ou designação curta pública, adicionar `alternateName`; numa lista, colocar a alternativa preferida primeiro.

### IDN-006 / Site name validado na ferramenta errada

**Detalhes do problema:**

A implementação é considerada válida apenas por passar no Rich Results Test, mas site names não são suportados nesse teste. [Referência oficial](https://developers.google.com/search/docs/appearance/site-names).

**Solução:**

Validar a sintaxe com o Schema Markup Validator e confirmar acessibilidade, canonical e HTML renderizado através da URL Inspection.

## Categoria: Datas editoriais

### DAT-001 / Data de publicação ou atualização ausente ou pouco evidente

**Detalhes do problema:**

Uma página datada não apresenta a data de publicação ou de atualização de forma visível e proeminente. Sem um sinal claro, o Google pode inferir uma data incorreta a partir de outros elementos. [Referência oficial](https://developers.google.com/search/docs/appearance/publication-dates).

**Solução:**

Mostrar a data junto ao conteúdo e identificá-la claramente como “Publicado” ou “Atualizado”.

### DAT-002 / Datas estruturadas ausentes ou divergentes

**Detalhes do problema:**

`Article`, `BlogPosting`, `NewsArticle`, `VideoObject` ou outro subtipo de `CreativeWork` omite `datePublished`/`dateModified`, ou os valores não coincidem com a página visível. [Referência oficial](https://developers.google.com/search/docs/appearance/publication-dates).

**Solução:**

Adicionar as propriedades aplicáveis e gerar valores visíveis e estruturados da mesma fonte, sem inventar datas.

### DAT-003 / Timestamp, timezone ou significado da data incorretos

**Detalhes do problema:**

O timestamp inclui hora sem offset correto, ignora horário de verão, está no futuro ou representa o evento narrado em vez da publicação ou alteração significativa da página. [Referência oficial](https://developers.google.com/search/docs/appearance/publication-dates).

**Solução:**

Usar ISO 8601 com offset correto quando a hora for declarada. Reservar `datePublished` e `dateModified` às datas editoriais reais e representar acontecimentos com `Event`.

### DAT-004 / Datas concorrentes sem rótulo claro

**Detalhes do problema:**

Existem várias datas com igual proeminência e sem identificação, permitindo que o Google selecione uma data secundária. [Referência oficial](https://developers.google.com/search/docs/appearance/publication-dates).

**Solução:**

Remover datas irrelevantes, reduzir a sua proeminência e identificar explicitamente as datas de publicação e atualização.

## Categoria: Google Images e Discover

### GIM-001 / Imagem indexável implementada apenas em CSS

**Detalhes do problema:**

Uma imagem importante existe apenas em `background-image` ou outra propriedade CSS. O Google Images descobre imagens em `src` de `<img>` e não indexa imagens CSS como conteúdo da página. [Referência oficial](https://developers.google.com/search/docs/appearance/google-images).

**Solução:**

Inserir a imagem num elemento `<img src>`; manter CSS apenas para apresentação.

### GIM-002 / Imagem responsiva sem fallback `src`

**Detalhes do problema:**

O elemento `<img>` usa apenas `srcset`, ou `<picture>` não contém um `<img src>` de fallback. [Referência oficial](https://developers.google.com/search/docs/appearance/google-images).

**Solução:**

Fornecer sempre `<img src>`, incluindo dentro de `<picture>`, e usar `srcset`/`source` como melhoria responsiva.

### GIM-003 / Formato ou URL de imagem inadequados

**Detalhes do problema:**

O recurso não usa BMP, GIF, JPEG, PNG, WebP, SVG ou AVIF, a extensão não corresponde ao tipo real, ou o mesmo ficheiro é servido por vários URLs variáveis. [Referência oficial](https://developers.google.com/search/docs/appearance/google-images).

**Solução:**

Converter para formato suportado, alinhar extensão e MIME e reutilizar um URL canónico, estável e persistente para o mesmo recurso.

### GIM-004 / Imagens importantes não são descobertas

**Detalhes do problema:**

Imagens são carregadas por mecanismos não rastreáveis e não aparecem no HTML nem num image sitemap. Quando o sitemap aponta para uma CDN não verificada, os erros de rastreamento dessa propriedade podem passar despercebidos. [Referência oficial](https://developers.google.com/search/docs/appearance/google-images).

**Solução:**

Usar `<img src>`, incluir imagens difíceis de descobrir num image sitemap e verificar o domínio da CDN no Search Console.

### GIM-005 / Imagem principal ausente ou inadequada

**Detalhes do problema:**

A página possui várias imagens mas não identifica a principal, ou declara um logótipo, imagem genérica, text-heavy, de baixa resolução, proporção extrema ou não representativa. [Referência oficial](https://developers.google.com/search/docs/appearance/google-images).

**Solução:**

Especificar uma imagem relevante e de alta resolução através de `primaryImageOfPage`, `image` associado a `mainEntity`/`mainEntityOfPage` ou `og:image`.

### GIM-006 / Filename genérico ou keyword stuffing no `alt`

**Detalhes do problema:**

O ficheiro tem nome genérico ou o `alt` repete palavras-chave, variações e termos comerciais sem descrever naturalmente a imagem. A ausência de `alt` já é tratada no controlo geral de imagens. [Referência oficial](https://developers.google.com/search/docs/appearance/google-images).

**Solução:**

Usar filename curto e descritivo e reescrever o `alt` de forma contextual, específica e natural.

### GIM-007 / Imagem afastada do contexto relevante

**Detalhes do problema:**

A imagem está distante do texto ou legenda que a explica, ou aparece numa página cujo assunto não corresponde ao conteúdo visual. [Referência oficial](https://developers.google.com/search/docs/appearance/google-images).

**Solução:**

Colocar a imagem junto de texto e legenda semanticamente relacionados.

### GIM-008 / Imagem insuficiente para o Discover

**Detalhes do problema:**

A imagem principal tem menos de 1200 px de largura, não supera 300.000 píxeis totais ou não funciona bem em paisagem. O Google recomenda pelo menos 1200 px de largura, mais de 300.000 píxeis totais e enquadramento 16:9; o recorte pode ser automático. [Referência oficial](https://developers.google.com/search/docs/appearance/google-discover).

**Solução:**

Fornecer uma imagem relevante, de alta resolução e bem enquadrada em 16:9, preservando os elementos principais após recorte.

### GIM-009 / Preview enganador ou imagem Discover genérica

**Detalhes do problema:**

O título, snippet ou imagem exagera, omite informação essencial ou não corresponde ao conteúdo; `og:image` ou a imagem estruturada é um logótipo, é genérica ou contém demasiado texto. [Referência oficial](https://developers.google.com/search/docs/appearance/google-discover).

**Solução:**

Alinhar título, snippet e imagem com a essência real da página e selecionar uma imagem específica e predominantemente visual.

## Categoria: Vídeo na Pesquisa Google

### VID-001 / Vídeo não incorporado num elemento reconhecido

**Detalhes do problema:**

O vídeo não aparece no HTML renderizado através de `<video>`, `<embed>`, `<iframe>` ou `<object>`, ou depende de um fragmento `#...` para ser descoberto. [Referência oficial](https://developers.google.com/search/docs/appearance/video).

**Solução:**

Usar um elemento reconhecido e disponibilizar a página e o recurso em URLs HTTP(S) completos e rastreáveis.

### VID-002 / Vídeo depende de interação ou desaparece quando a API falha

**Detalhes do problema:**

O player só é criado após clique, swipe, escrita ou outra ação; quando JavaScript ou Media Source API falha, nenhum container permanece no DOM renderizado. [Referência oficial](https://developers.google.com/search/docs/appearance/video).

**Solução:**

Renderizar o container e os metadados sem exigir interação e mantê-los no DOM mesmo quando a origem multimédia falhar.

### VID-003 / Watch page não é indexável ou o vídeo não é o conteúdo principal

**Detalhes do problema:**

A página dedicada contém `noindex`, canonical para outra URL, bloqueio de crawl ou autenticação não declarada; ou o vídeo é secundário num artigo, produto, review ou lista. Para resultados de vídeo, Video mode, Key Moments e Live Badge, o objetivo principal da página deve ser visualizar um único vídeo. [Referência oficial](https://developers.google.com/search/docs/appearance/video).

**Solução:**

Criar uma watch page rastreável e indexável por vídeo, tornar o player o conteúdo principal e implementar dados de paywall quando o acesso exigir subscrição.

### VID-004 / Watch pages sem título e descrição exclusivos

**Detalhes do problema:**

Várias páginas de vídeo partilham `<title>` ou meta description, ou os valores não descrevem o vídeo específico. [Referência oficial](https://developers.google.com/search/docs/appearance/video).

**Solução:**

Criar título e descrição exclusivos e coerentes para cada watch page.

### VID-005 / Formato ou URL do vídeo não suportados

**Detalhes do problema:**

O ficheiro usa Data URL, formato não suportado ou URL temporário. Os formatos suportados incluem 3GP, 3G2, ASF, AVI, DivX, M2V, M3U, M3U8, M4V, MKV, MOV, MP4, MPEG, OGV, QVT, RAM, RM, VOB, WebM, WMV e XAP. [Referência oficial](https://developers.google.com/search/docs/appearance/video).

**Solução:**

Publicar o vídeo num formato suportado e num URL HTTP(S) único, estável e persistente.

### VID-006 / Google não consegue obter os bytes do vídeo

**Detalhes do problema:**

O ficheiro ou stream M3U8 é bloqueado por robots, autenticação, firewall ou limitação de capacidade. O acesso aos bytes é necessário para previews e Key Moments. [Referência oficial](https://developers.google.com/search/docs/appearance/video).

**Solução:**

Permitir acesso ao Googlebot e fornecer `VideoObject.contentUrl` para um ficheiro suportado sempre que possível.

### VID-007 / Thumbnail de vídeo inválida

**Detalhes do problema:**

A thumbnail está ausente, mede menos de 60×30 px, é bloqueada, usa formato não suportado ou é excessivamente transparente. São suportados BMP, GIF, JPEG, PNG, WebP, SVG e AVIF; pelo menos 80% dos píxeis devem ter alpha superior a 250. [Referência oficial](https://developers.google.com/search/docs/appearance/video).

**Solução:**

Publicar uma thumbnail rastreável, estável, maior que o mínimo e maioritariamente opaca.

### VID-008 / Thumbnail ou metadados contraditórios entre fontes

**Detalhes do problema:**

`poster`, `video:thumbnail_loc`, `thumbnailUrl` e `og:video:image` apontam para imagens diferentes, ou `name` e `description` divergem entre JSON-LD, sitemap, OGP e página visível. [Referência oficial](https://developers.google.com/search/docs/appearance/video).

**Solução:**

Usar o mesmo URL de thumbnail e valores únicos por vídeo em todas as fontes, gerados a partir do mesmo registo.

### VID-009 / URL do player ou ficheiro no campo errado

**Detalhes do problema:**

A URL do player foi usada em `contentUrl`, ou a URL dos bytes foi usada em `embedUrl`. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/video).

**Solução:**

Usar `embedUrl`/`video:player_loc` para o player e `contentUrl`/`video:content_loc` para o ficheiro real.

### VID-010 / Key Moments mal implementados

**Detalhes do problema:**

Um vídeo com capítulos não usa `Clip`/`SeekToAction`, ou os objetos não contêm offsets e deep links corretos. Em `Clip`, cada segmento precisa de `name`, `startOffset` e `url`; em `SeekToAction`, o target precisa do placeholder `{seek_to_second_number}` e `startOffset-input` deve ser `required name=seek_to_second_number`. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/video#clip-seektoaction-guidelines).

**Solução:**

Implementar um dos métodos numa watch page onde o vídeo seja reproduzível e o ficheiro esteja acessível. Usar inícios únicos e URLs que abram no segundo indicado.

### VID-011 / Livestream sem `BroadcastEvent`

**Detalhes do problema:**

Uma transmissão em direto não contém `BroadcastEvent` com `isLiveBroadcast:true`, `startDate` e, após terminar, `endDate`. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/video#broadcast-event).

**Solução:**

Aninhar `BroadcastEvent` no `VideoObject`, usar datas ISO 8601 e atualizar o estado ao iniciar, terminar ou alterar a transmissão.

### VID-012 / Data de expiração ou restrição geográfica inválida

**Detalhes do problema:**

`expires`/`video:expiration_date` contém uma data passada para conteúdo ainda disponível, ou existem várias `video:restriction`, códigos de país inválidos ou `relationship` ausente. A restrição aceita uma tag, códigos ISO 3166-1 separados por espaços e `relationship="allow"` ou `"deny"`. [Referência oficial](https://developers.google.com/search/docs/appearance/video).

**Solução:**

Corrigir ou omitir a expiração quando o vídeo não expira. Consolidar a restrição numa única regra válida ou usar `regionsAllowed`/`ineligibleRegion`.

## Categoria: Dados estruturados — regras gerais

### SDG-001 / Vocabulário ou formato de dados estruturados não suportado

**Detalhes do problema:**

O markup usa `data-vocabulary.org`, tipo/propriedade não suportado pelo guia aplicável ou formato diferente de JSON-LD, Microdata e RDFa. `data-vocabulary.org` não é elegível para rich results; o Google recomenda JSON-LD por facilidade de manutenção. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data).

**Solução:**

Migrar para `schema.org` num formato suportado e usar a documentação específica do Google Search Central como referência normativa de elegibilidade.

### SDG-002 / Dados estruturados não representam o conteúdo visível

**Detalhes do problema:**

Entidades ou propriedades não existem na página, estão ocultas, descrevem outra URL ou contradizem preço, data, autor, classificação, disponibilidade ou texto visível. Violações podem impedir o rich result ou provocar ação manual. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).

**Solução:**

Gerar markup e interface da mesma fonte de dados e remover valores ocultos, inventados, irrelevantes ou enganosos.

### SDG-003 / Objeto sem propriedades obrigatórias

**Detalhes do problema:**

Um objeto de rich result omite uma propriedade marcada como Required ou contém valor, tipo ou formato inválido. A ausência de qualquer requisito bloqueia a elegibilidade do objeto; propriedades recomendadas em falta não bloqueiam, mas reduzem a informação disponível. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data).

**Solução:**

Validar objeto a objeto no Rich Results Test e preencher todos os campos obrigatórios, incluindo os de objetos aninhados. Adicionar propriedades recomendadas apenas quando completas, exatas e aplicáveis.

### SDG-004 / Página ou recurso estruturado inacessível ao Google

**Detalhes do problema:**

A URL com markup, imagem, vídeo ou recurso referenciado é bloqueada por `robots.txt`, `noindex`, autenticação, WAF, erro HTTP ou outra regra de acesso. Markup válido não compensa inacessibilidade. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).

**Solução:**

Permitir rastreamento e renderização de páginas e recursos elegíveis, devolver `200` e confirmar o HTML renderizado e os recursos na URL Inspection.

### SDG-005 / Dados estruturados ausentes em duplicados da página

**Detalhes do problema:**

Apenas a canonical contém markup, enquanto duplicados do mesmo conteúdo omitem ou contradizem os dados estruturados. O Google recomenda a mesma marcação em todos os duplicados. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).

**Solução:**

Publicar os mesmos objetos e valores em todas as versões duplicadas e manter os sinais de canonicalização alinhados.

### SDG-006 / Tipo demasiado genérico ou foco principal da página não marcado

**Detalhes do problema:**

O markup usa um tipo genérico quando existe subtipo aplicável, ou marca apenas elementos secundários e omite o tipo que representa o foco principal da página. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).

**Solução:**

Usar o tipo mais específico suportado e incluir o objeto principal da página; adicionar objetos secundários apenas quando descrevem conteúdo visível.

### SDG-007 / Objetos relacionados não estão ligados

**Detalhes do problema:**

Objetos que representam o mesmo assunto são declarados separadamente sem nesting nem `@id`, impedindo o Google de saber, por exemplo, que um vídeo ou review pertence à entidade principal. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).

**Solução:**

Aninhar objetos sob a entidade principal ou ligar blocos separados com o mesmo `@id`; evitar criar entidades concorrentes para o mesmo item.

### SDG-008 / Itens estruturados visíveis estão incompletos

**Detalhes do problema:**

A página exibe vários itens, comentários ou avaliações, mas o markup descreve apenas uma parte seletiva. Isto pode ser enganador quando o rich result sugere cobertura completa. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).

**Solução:**

Marcar todos os itens visíveis aplicáveis e manter contagens e agregações consistentes com o conjunto completo.

### SDG-009 / Dados estruturados gerados por JavaScript divergem da página

**Detalhes do problema:**

JSON-LD criado por JavaScript ou Google Tag Manager duplica dados manualmente e não acompanha alterações do conteúdo, ou não existe no DOM renderizado. Em produtos com preço e disponibilidade voláteis, a geração dinâmica pode tornar os crawls de Shopping menos frequentes e menos fiáveis. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/generate-structured-data-with-javascript).

**Solução:**

Extrair os valores da mesma fonte que renderiza a página, preferir HTML inicial ou server-side rendering para dados comerciais voláteis e testar o URL publicado no Rich Results Test e na URL Inspection.

### SDG-010 / Enriched result aplicado a página de listagem

**Detalhes do problema:**

`JobPosting`, `Recipe` ou `Event` destinado a enriched search é aplicado a uma página de categoria ou listagem em vez da leaf page que descreve um único item. Enriched search exige leaf pages e pode excluir um site quando grande parte não cumpre as políticas. [Referência oficial](https://developers.google.com/search/docs/appearance/enriched-search-results).

**Solução:**

Aplicar o objeto completo na página de detalhe de cada item e usar estruturas de lista apenas nos tipos e modelos de carousel documentados.

## Categoria: Dados estruturados — conteúdo editorial e navegação

### EDS-001 / `Article` sem propriedades editoriais úteis

**Detalhes do problema:**

`Article`, `NewsArticle` ou `BlogPosting` omite `author`, `author.name`, `headline`, `image`, `datePublished` ou `dateModified`. Atualmente o Google não define propriedades obrigatórias para Article, mas estes campos melhoram o entendimento de título, autoria, imagem e datas. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/article).

**Solução:**

Preencher as propriedades aplicáveis com valores coincidentes com a página e datas ISO 8601 com fuso horário quando a hora for declarada.

### EDS-002 / Autores de `Article` agregados ou mal tipados

**Detalhes do problema:**

Vários autores são concatenados num único `author.name`, `Person`/`Organization` é usado incorretamente, o nome contém cargo, prefixo ou texto editorial, ou autores visíveis estão ausentes. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/article#author-bp).

**Solução:**

Criar um objeto por autor, usar o tipo correto, manter `author.name` apenas com o nome e ligar `author.url`/`sameAs` a um perfil canónico.

### EDS-003 / Imagem editorial de `Article` inadequada

**Detalhes do problema:**

`image` está ausente, bloqueada, não é representativa ou tem baixa resolução. O Google recomenda imagens rastreáveis e indexáveis com pelo menos 50.000 píxeis e versões 16:9, 4:3 e 1:1. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/article).

**Solução:**

Fornecer URLs estáveis das três proporções e garantir relevância, formato suportado e acesso pelo Googlebot-Image.

### EDS-004 / Canonical incorreto em artigo paginado

**Detalhes do problema:**

As partes 2 e seguintes canonicalizam para a página 1 sem existir uma página view-all equivalente. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/article#technical-guidelines).

**Solução:**

Canonicalizar cada parte para si própria ou canonicalizar todas as partes para uma página view-all que contém o artigo completo.

### EDS-005 / `BreadcrumbList` incompleto ou desordenado

**Detalhes do problema:**

O objeto tem menos de dois `ListItem`, omite `itemListElement`, usa `position` não inteiro, duplicado ou não ordenado a partir de 1, ou omite `name`/`item` onde são necessários. O último item pode omitir `item`, sendo assumido o URL atual. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb).

**Solução:**

Emitir pelo menos dois itens ordenados, com nomes visíveis e URLs absolutas válidas; manter o markup coerente com o breadcrumb apresentado.

### EDS-006 / Breadcrumb reflete parâmetros em vez da hierarquia útil

**Detalhes do problema:**

O trilho replica segmentos técnicos, IDs, filtros ou parâmetros e não corresponde ao caminho semântico típico do utilizador. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb#guidelines).

**Solução:**

Mapear categorias semânticas estáveis. A raiz e a página atual podem ser omitidas quando não acrescentam uma etapa útil.

### EDS-007 / `ItemList` de carousel inválido

**Detalhes do problema:**

A lista tem menos de dois `itemListElement`, mistura tipos, não inclui todos os itens visíveis ou usa posições ausentes, duplicadas ou fora de ordem. O carousel normal suporta `Course`, `Movie`, `Recipe` e `Restaurant`, com itens homogéneos. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/carousel).

**Solução:**

Incluir todos os itens visíveis do mesmo tipo, na ordem apresentada, com posições consecutivas a partir de 1.

### EDS-008 / URLs de carousel incompatíveis com o modelo da página

**Detalhes do problema:**

Numa summary page, os itens apontam para URLs repetidas ou fora do domínio; numa all-in-one page, apontam para outra página ou não usam âncoras junto do conteúdo. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/carousel#structured-data-type-definitions).

**Solução:**

Em summary pages, usar URLs canónicas únicas no mesmo domínio. Em all-in-one pages, usar o URL atual com fragmentos que abram no item correspondente.

### EDS-009 / Carousel beta sem estrutura mínima de summary page

**Detalhes do problema:**

O `ItemList` beta contém menos de três entidades, não está numa página de resumo/categoria, não liga a páginas de detalhe autónomas no mesmo domínio ou omite itens visíveis. Para scroll infinito, devem ser marcados pelo menos os itens inicialmente carregados. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/carousels-beta).

**Solução:**

Marcar na summary page pelo menos três `LocalBusiness`, `Product` ou `Event`, cada um com `position`, `name`, `image` e URL canónica de detalhe; incluir todos os itens carregados na página ou viewport inicial.

## Categoria: Dados estruturados — cursos, datasets e comunidades

### EDU-001 / Course list sem quantidade ou estrutura mínima

**Detalhes do problema:**

A página contém menos de três cursos ou não usa `ItemList`/carousel numa summary ou all-in-one page. O conteúdo deve ser curricular, ter resultado educativo, instrutores e alunos. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/course).

**Solução:**

Marcar apenas cursos elegíveis e publicar pelo menos três objetos `Course` no modelo de lista adequado.

### EDU-002 / `Course` sem campos válidos

**Detalhes do problema:**

`name` ou `description` está ausente, `provider` não representa a organização real ou o título contém preço, desconto ou promoção. `name` e `description` são obrigatórios; a descrição tem limite de apresentação de 60 caracteres. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/course#structured-data-type-definitions).

**Solução:**

Usar nome factual, descrição concisa e `Organization` real como `provider`; manter URLs canónicas e posições válidas no `ItemList`.

### EDU-003 / `Dataset` sem nome ou descrição válida

**Detalhes do problema:**

`Dataset` omite `name`, usa o mesmo nome para conjuntos distintos ou tem `description` com menos de 50 ou mais de 5.000 caracteres. O Dataset Search usa apenas os primeiros 5.000 caracteres das propriedades textuais. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/dataset).

**Solução:**

Usar nome distintivo e descrição factual entre 50 e 5.000 caracteres.

### EDU-004 / Distribuição de dataset sem URL de download

**Detalhes do problema:**

`DataDownload`/`distribution` existe mas `distribution.contentUrl` está ausente ou não aponta para um download; objetos aninhados em `hasPart`/`isPartOf` não cumprem os requisitos de `Dataset`. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/dataset#data-download).

**Solução:**

Fornecer URL funcional do ficheiro, `encodingFormat` aplicável e `name`/`description` completos em cada subdataset.

### EDU-005 / Dataset sem proveniência ou licença

**Detalhes do problema:**

Faltam `identifier`, `license`, `creator`/`publisher` e `sameAs` quando esses dados existem. `citation` identifica publicações relacionadas, não substitui a proveniência do dataset. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/dataset).

**Solução:**

Adicionar DOI ou identificador estável, licença canónica, criador/editor e `sameAs`; reservar `citation` para artigos associados.

### EDU-006 / `DiscussionForumPosting` aplicado a conteúdo inadequado

**Detalhes do problema:**

O tipo descreve artigo editorial, publicação do proprietário ou avaliação de produto. Este tipo destina-se a conteúdo gerado por utilizadores; uma pergunta com respostas usa `QAPage`. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/discussion-forum#content-guidelines).

**Solução:**

Usar `Article`, `Review` ou `QAPage` conforme o conteúdo e reservar `DiscussionForumPosting`/`SocialMediaPosting` para UGC.

### EDU-007 / Publicação ou comentário sem campos obrigatórios

**Detalhes do problema:**

O post ou comentário omite `author` e `author.name`, `datePublished` ISO 8601 ou pelo menos um de `text`, `image` e `video`. A exceção é um post representado noutra página através de URL externa. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/discussion-forum#structured-data-type-definitions).

**Solução:**

Marcar autor, data e conteúdo completo em cada nó e preservar a hierarquia de `comments`.

### EDU-008 / Metadados da discussão incoerentes

**Detalhes do problema:**

O URL do post não aponta à primeira página da thread, `commentCount`/`interactionStatistic` divergem do conteúdo ou texto gerado por IA omite `digitalSourceType`. A ausência de `digitalSourceType` é interpretada como conteúdo humano. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/discussion-forum).

**Solução:**

Usar a primeira página como URL da thread, corrigir contagens e declarar `TrainedAlgorithmicMediaDigitalSource` para LLM ou `AlgorithmicMediaDigitalSource` para automação simples.

### EDU-009 / Education Q&A fora do modelo de flashcards

**Detalhes do problema:**

O markup não está na leaf page, as perguntas não são visíveis ou educativas, falta um par pergunta/resposta, ou `eduQuestionType` difere de `Flashcard`. `Quiz.hasPart` deve conter uma ou mais `Question`; cada uma precisa de `acceptedAnswer`, `eduQuestionType: Flashcard` e `text`; `Answer` precisa de `text`. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/education-qa).

**Solução:**

Marcar flashcards visíveis na página mais detalhada. Usar `QAPage` para uma única pergunta com respostas submetidas por utilizadores.

### EDU-010 / `QAPage` aplicado ao tipo de página errado

**Detalhes do problema:**

A página contém várias perguntas, FAQ, artigo, how-to ou respostas exclusivamente editoriais. `QAPage` destina-se a uma única pergunta em que utilizadores podem submeter respostas. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/qapage#content-guidelines).

**Solução:**

Usar um único `QAPage` e `Question` apenas no modelo elegível; remover o tipo das restantes páginas.

### EDU-011 / `QAPage` sem propriedades mínimas

**Detalhes do problema:**

Falta `mainEntity: Question`, `answerCount`, `Question.text` ou `acceptedAnswer`/`suggestedAnswer` quando existem respostas; `Answer.text` não contém a resposta completa. Perguntas com `answerCount:0` não são elegíveis. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/qapage#structured-data-type-definitions).

**Solução:**

Marcar pergunta e respostas integrais, separar `Answer` de `Comment` e garantir que `answerCount` corresponde ao total de respostas.

## Categoria: Dados estruturados — negócios, eventos e emprego

### BIZ-001 / `EmployerAggregateRating` usa fonte ou entidade inválida

**Detalhes do problema:**

A classificação não é alojada no site, utilizadores não podem publicar ratings, o valor não é visível, representa categoria/lista ou não deriva de avaliações reais de uma organização específica. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/employer-rating).

**Solução:**

Marcar apenas ratings UGC reais, visíveis e alojados no site para uma `Organization` específica.

### BIZ-002 / `EmployerAggregateRating` sem propriedades mínimas

**Detalhes do problema:**

O objeto omite `itemReviewed: Organization`, `ratingValue` ou ambos `ratingCount` e `reviewCount`. A escala predefinida é 1–5; noutra escala, `bestRating` e `worstRating` são necessários. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/employer-rating#structured-data-type-definitions).

**Solução:**

Completar o objeto e calcular notas e contagens a partir das avaliações efetivamente publicadas.

### BIZ-003 / `Event` aplicado a página ou evento inelegível

**Detalhes do problema:**

A URL não é a leaf page de um único evento, o evento não é publicamente reservável, é apenas virtual, representa horário comercial/cupão/promoção, ou agrupa sessões com bilhetes independentes. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/event#guidelines).

**Solução:**

Publicar uma URL e objeto `Event` por ocorrência física reservável e separar performances com bilhetes próprios.

### BIZ-004 / `Event` sem propriedades obrigatórias

**Detalhes do problema:**

O objeto omite `name`, `startDate`, `location: Place`, `location.name` ou `location.address: PostalAddress` detalhado. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/event#structured-data-type-definitions).

**Solução:**

Completar nome, data ISO 8601 e local físico; garantir correspondência integral com a página visível.

### BIZ-005 / Datas, estado ou oferta do evento incompletos

**Detalhes do problema:**

A hora não tem offset, evento multiday omite `endDate`, reagendamento/cancelamento não atualiza `eventStatus` e `previousStartDate`, ou a oferta omite `url`, `price`, `priceCurrency`, `availability` ou `validFrom` aplicáveis. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/event#date-time-guidelines).

**Solução:**

Usar ISO 8601 com offset, não inventar `00:00` quando a hora é desconhecida, e atualizar estado, datas e ofertas em simultâneo com a página.

### BIZ-006 / `JobPosting` sem campos obrigatórios

**Detalhes do problema:**

Falta `datePosted`, `description`, `hiringOrganization`, `title` ou `jobLocation` físico com `addressCountry`. Para emprego integralmente remoto, `jobLocation` pode ser omitido apenas com `jobLocationType: TELECOMMUTE` e `applicantLocationRequirements` com pelo menos um país. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/job-posting#structured-data-type-definitions).

**Solução:**

Completar todos os campos segundo a modalidade real e fornecer endereço ou países elegíveis conforme aplicável.

### BIZ-007 / Título ou descrição de emprego inválidos

**Detalhes do problema:**

`description` não contém responsabilidades, qualificações, competências, horário, educação e experiência, ou não usa HTML; `title` inclui código, local, data, salário, empresa ou promoção. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/job-posting).

**Solução:**

Publicar a descrição integral com `p`, `ul`, `li` e quebras suportadas e usar em `title` apenas o nome conciso do cargo.

### BIZ-008 / Vaga expirada continua marcada

**Detalhes do problema:**

`validThrough` já passou ou a vaga foi preenchida/fechada mas a página continua indexável com `JobPosting`. `validThrough` é obrigatório quando existe uma data de expiração. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/job-posting#expired-job-postings).

**Solução:**

Remover o markup, devolver 404/410 ou atualizar `validThrough` apenas se a vaga for realmente reaberta; retirar vagas preenchidas antes da expiração.

### BIZ-009 / Vaga remota mal classificada

**Detalhes do problema:**

`TELECOMMUTE` é usado numa vaga híbrida ou ocasional, a descrição não afirma trabalho 100% remoto ou faltam países elegíveis. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/job-posting#work-from-home).

**Solução:**

Reservar `TELECOMMUTE` ao remoto integral e definir `applicantLocationRequirements`; usar `jobLocation` quando existe opção física.

### BIZ-010 / `LocalBusiness` sem propriedades mínimas

**Detalhes do problema:**

O objeto omite `name` ou `address: PostalAddress` correspondente a uma localização física. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/local-business#structured-data-type-definitions).

**Solução:**

Usar o subtipo mais específico aplicável e fornecer o endereço completo segundo o formato do país.

### BIZ-011 / Localização, horário ou contacto malformados

**Detalhes do problema:**

`geo` tem menos de cinco casas decimais, o telefone omite indicativo, `opens`/`closes` não usam `hh:mm:ss`, `priceRange` tem 100 ou mais caracteres ou `url` não identifica a localização. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/local-business).

**Solução:**

Completar `geo`, `telephone` e `openingHoursSpecification`. Para 24 horas usar `00:00–23:59`; para fechado usar `00:00–00:00`; usar `validFrom`/`validThrough` em horários sazonais.

### BIZ-012 / `Organization` sem identidade técnica suficiente

**Detalhes do problema:**

Embora não existam propriedades obrigatórias, faltam `name`/`alternateName`, `url`, `logo`, presença real (`address`/`telephone`) ou `sameAs` e identificadores aplicáveis. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/organization).

**Solução:**

Centralizar um objeto `Organization` numa página institucional e preencher apenas dados públicos, verificáveis e consistentes; negócios físicos devem também cumprir `LocalBusiness`.

### BIZ-013 / Logo de `Organization` inadequado

**Detalhes do problema:**

O logo mede menos de 112×112 px, está bloqueado, não é indexável, usa formato não suportado ou `ImageObject` omite `contentUrl`/`url`. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/organization#structured-data-type-definitions).

**Solução:**

Fornecer um logo representativo com pelo menos 112×112 px, num formato suportado, URL estável e acesso pelo Googlebot-Image.

### BIZ-014 / `ProfilePage` aplicado a página sem uma entidade principal

**Detalhes do problema:**

A página não se concentra numa única `Person` ou `Organization` afiliada ao site, como acontece numa homepage de loja ou review externo. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/profile-page#content-guidelines).

**Solução:**

Aplicar `ProfilePage` apenas a perfis individuais ou organizacionais reais e afiliados.

### BIZ-015 / `ProfilePage` sem propriedades mínimas

**Detalhes do problema:**

Falta `mainEntity: Person`/`Organization`, ou a entidade não contém `name` nem `alternateName`. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/profile-page#structured-data-type-definitions).

**Solução:**

Aninhar a entidade principal com o tipo correto e pelo menos uma identificação válida.

## Categoria: Dados estruturados — imagens, aplicações e conteúdo especializado

### SPC-001 / `ImageObject` sem metadados mínimos

**Detalhes do problema:**

O objeto omite `contentUrl` e não contém pelo menos uma propriedade de autoria ou direitos entre `creator`, `creditText`, `copyrightNotice` e `license`. `url` ainda é suportado, mas `contentUrl` identifica a imagem com maior precisão. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/image-license-metadata).

**Solução:**

Marcar cada ocorrência da imagem com `contentUrl` e metadados verdadeiros de autoria, crédito ou direitos.

### SPC-002 / Imagem não é elegível ao badge Licensable

**Detalhes do problema:**

`ImageObject` não contém `license`. Quando IPTC e structured data divergem, o Google usa os dados estruturados. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/image-license-metadata#structured-data).

**Solução:**

Adicionar o URL da licença e, quando existir, `acquireLicensePage`; sincronizar os valores com os metadados incorporados.

### SPC-003 / `Movie` sem nome ou poster válido

**Detalhes do problema:**

O objeto em carousel omite `name` ou `image`, ou a imagem está bloqueada, não é representativa, usa formato inadequado ou tem proporção muito distante de 6:9. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/movie).

**Solução:**

Fornecer nome exato e poster rastreável de alta resolução em JPG, PNG ou GIF, com proporção 6:9; completar `dateCreated`, `director` e ratings reais quando existirem.

### SPC-004 / `MathSolver` aplicado a implementação inelegível

**Detalhes do problema:**

O markup não está na homepage, o solver exige login/paywall, a solução inicial e o passo a passo não são acessíveis ou o tipo de problema declarado não é resolvido com exatidão. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/math-solvers#guidelines).

**Solução:**

Colocar o objeto na homepage e disponibilizar sem barreira uma solução inicial e walkthrough corretos.

### SPC-005 / `MathSolver` sem propriedades mínimas

**Detalhes do problema:**

Falta `potentialAction: SolveMathAction`, `mathExpression-input`, `potentialAction.eduQuestionType`, `LearningResource.learningResourceType: Math Solver` ou `HowTo.assesses` complementar. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/math-solvers#structured-data-type-definitions).

**Solução:**

Preencher os tipos e valores exatos e declarar apenas os tipos de problema suportados pela ferramenta.

### SPC-006 / `SoftwareApplication` sem propriedades mínimas

**Detalhes do problema:**

O objeto omite `name`, `offers.price` ou ambos `aggregateRating` e `review`. Aplicações gratuitas devem declarar preço `0`; se o preço for superior a zero, `priceCurrency` é recomendado. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/software-app#structured-data-type-definitions).

**Solução:**

Completar nome, oferta e pelo menos uma avaliação genuína; adicionar moeda quando aplicável.

### SPC-007 / Subtipo ou categoria de aplicação inválidos

**Detalhes do problema:**

`applicationCategory` está fora da lista suportada ou o objeto usa apenas `VideoGame`, que não é por si só um tipo de aplicação elegível. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/software-app).

**Solução:**

Usar categoria suportada, adicionar `operatingSystem` e co-tipar `VideoGame` com `MobileApplication`, `WebApplication` ou outro subtipo aplicável.

### SPC-008 / `SpeakableSpecification` com seletor inválido

**Detalhes do problema:**

O objeto não contém `cssSelector` nem `xPath`, usa ambos em simultâneo ou aponta para conteúdo inexistente/confuso. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/speakable#structured-data-type-definitions).

**Solução:**

Usar exatamente um método e selecionar headlines ou resumos concisos presentes na página.

### SPC-009 / `Speakable` fora do conteúdo ou mercado suportado

**Detalhes do problema:**

O conteúdo não é notícia em inglês para utilizadores nos EUA com Google Home em inglês, ou as secções excedem aproximadamente 20–30 segundos e incluem datelines, captions ou atribuições. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/speakable).

**Solução:**

Implementar apenas no público elegível e marcar dois ou três pontos-chave concisos por secção.

## Categoria: Dados estruturados — receitas e avaliações

### RCP-001 / `Recipe` sem nome ou imagem válida

**Detalhes do problema:**

O objeto omite `name` ou `image`, ou a imagem está bloqueada, não é representativa ou usa formato não suportado. O Google recomenda imagens rastreáveis com pelo menos 50.000 píxeis nas proporções 16:9, 4:3 e 1:1. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/recipe#structured-data-type-definitions).

**Solução:**

Fornecer o nome do prato e imagens finais, relevantes, indexáveis e em formatos suportados.

### RCP-002 / Instruções ou tempos da receita malformados

**Detalhes do problema:**

Os tempos não usam duração ISO 8601, `totalTime` não corresponde a `prepTime + cookTime`, `recipeInstructions` contém rótulos em vez da ação ou `HowToSection` agrupa receitas alternativas. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/recipe).

**Solução:**

Usar durações ISO 8601, texto estritamente instrucional e `HowToSection` apenas para agrupar passos da mesma receita; representar alternativas como objetos `Recipe` separados.

### RCP-003 / Nutrição declarada sem rendimento

**Detalhes do problema:**

`nutrition` apresenta valores por porção mas `recipeYield` está ausente. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/recipe#recipe-properties).

**Solução:**

Adicionar `recipeYield` com o número de porções e manter os valores nutricionais coerentes com esse rendimento.

### RCP-004 / `ItemList` de receitas incompleto

**Detalhes do problema:**

`itemListElement` omite `ListItem.position` ou `ListItem.url`, ou contém URLs repetidas/não canónicas. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/recipe#itemlist).

**Solução:**

Criar um `ListItem` por receita, com posição ordinal e URL canónica única.

### RCP-005 / `Review` sem propriedades mínimas

**Detalhes do problema:**

O objeto omite `author`, `reviewRating.ratingValue`, nome do item ou `itemReviewed` quando é standalone; `author.name` tem 100 ou mais caracteres ou não é um nome válido. A escala predefinida é 1–5. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/review-snippet#review-properties).

**Solução:**

Aninhar a review no item ou definir `itemReviewed` suportado, usar autor real com menos de 100 caracteres e declarar `bestRating`/`worstRating` quando a escala não for 1–5.

### RCP-006 / `AggregateRating` sem propriedades mínimas

**Detalhes do problema:**

O objeto omite `ratingValue`, ambos `ratingCount` e `reviewCount`, o nome do item ou `itemReviewed` quando standalone. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/review-snippet#aggregated-rating-properties).

**Solução:**

Fornecer média real, pelo menos uma contagem e entidade avaliada; num objeto aninhado, garantir que o parent contém `name`.

### RCP-007 / Reviews não visíveis, falsas ou agregadas externamente

**Detalhes do problema:**

O texto ou nota não está imediatamente visível, descreve categoria/lista, foi copiado de outro site, é falso ou resulta de incentivo não divulgado. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/review-snippet#guidelines).

**Solução:**

Marcar apenas avaliações genuínas, alojadas e visíveis do item específico; quando existirem várias reviews, manter `aggregateRating` consistente.

### RCP-008 / Rating self-serving tratado como oportunidade de estrelas

**Detalhes do problema:**

`LocalBusiness` ou `Organization` publica na própria página avaliações sobre si, inclusive através de widget de terceiros. O Google não mostra estrelas de review snippet nestes casos, embora a presença do markup verdadeiro não seja por si só ação manual. [Referência oficial](https://developers.google.com/search/blog/2019/09/making-review-rich-results-more-helpful).

**Solução:**

Não tratar esta marcação como oportunidade de estrelas; mantê-la apenas quando tiver utilidade semântica e representar dados reais.

## Categoria: Conteúdo pago e amostragem

### PAY-001 / Conteúdo pago não identificado

**Detalhes do problema:**

Uma página `CreativeWork` indexável contém paywall ou exige registo mas não declara `isAccessibleForFree:false`. São suportados `CreativeWork`, `Article`, `NewsArticle`, `Blog`, `Comment`, `Course`, `HowTo`, `Message`, `Review` e `WebPage`. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/paywalled-content).

**Solução:**

Definir `isAccessibleForFree:false` no objeto principal e identificar as secções pagas.

### PAY-002 / Secções pagas mal referenciadas

**Detalhes do problema:**

`hasPart` está aninhado, `cssSelector` não é uma classe `.nome`, a classe não existe no HTML, `@type` difere de `WebPageElement` ou `hasPart.isAccessibleForFree` não é `false`. Apenas JSON-LD e Microdata são aceites para este caso. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/paywalled-content#guidelines).

**Solução:**

Criar um `WebPageElement` não aninhado por secção, com seletor de classe exato e `isAccessibleForFree:false`.

### PAY-003 / Paywall não fornece uma amostra útil

**Detalhes do problema:**

O conteúdo fica integralmente bloqueado ou a amostragem diária é demasiado agressiva. A orientação do Google para publishers recomenda metering mensal; como ponto de partida experimental para notícias diárias, 10 artigos por utilizador/mês, com intervalo típico de 6–10, e um lead-in visível. [Referência oficial](https://developers.google.com/search/docs/appearance/flexible-sampling).

**Solução:**

Implementar metering mensal e mostrar as primeiras frases do artigo. Medir tráfego, conversão e frequência de paywall antes de reduzir a amostra; estes números são orientação experimental, não requisito de elegibilidade.

## Categoria: Web Stories

### WST-001 / Web Story AMP inválida

**Detalhes do problema:**

A Web Story falha no Web Stories Google Test Tool, URL Inspection ou AMP Linter e, por isso, não cumpre as especificações AMP obrigatórias. [Referência oficial](https://developers.google.com/search/docs/appearance/enable-web-stories).

**Solução:**

Corrigir todos os erros AMP e repetir os testes no URL publicado.

### WST-002 / Metadados obrigatórios da Web Story ausentes

**Detalhes do problema:**

Falta pelo menos um dos campos obrigatórios: `publisher-logo-src`, `poster-portrait-src`, `title` ou `publisher`. [Referência oficial](https://developers.google.com/search/docs/appearance/enable-web-stories).

**Solução:**

Preencher os quatro campos em cada Story e verificar o preview na ferramenta de teste.

### WST-003 / Web Story sem canonical autorreferente

**Detalhes do problema:**

Não existe `rel="canonical"` ou aponta para outra URL. Cada Web Story deve ser canónica para si própria. [Referência oficial](https://developers.google.com/search/docs/appearance/enable-web-stories).

**Solução:**

Adicionar canonical absoluto para o próprio URL e configurar versões linguísticas quando existirem.

### WST-004 / Web Story não descobrível ou não indexável

**Detalhes do problema:**

A URL não recebe links internos, não está no sitemap, é bloqueada por `robots.txt` ou contém `noindex`. [Referência oficial](https://developers.google.com/search/docs/appearance/enable-web-stories).

**Solução:**

Integrar a Story na arquitetura do site, incluí-la no sitemap e remover bloqueios incompatíveis com indexação.

### WST-005 / Título, poster ou logo da Web Story fora das especificações

**Detalhes do problema:**

O título tem 90 ou mais caracteres, o poster mede menos de 640×853 px ou não usa proporção 3:4, ou o logo mede menos de 96×96 px ou não usa proporção 1:1. O Google recomenda título descritivo com menos de 70 caracteres. [Referência oficial](https://developers.google.com/search/docs/appearance/web-stories-creation-best-practices).

**Solução:**

Manter o título abaixo de 90 caracteres, preferencialmente abaixo de 70, usar poster 3:4 com pelo menos 640×853 px e logo quadrado com pelo menos 96×96 px.

### WST-006 / Web Story demasiado textual ou com assets degradados

**Detalhes do problema:**

A maioria das páginas contém mais de 180 caracteres, imagens/vídeos estão esticados ou pixelizados, falta narrativa entre páginas ou a Story exige clique externo para informação essencial. [Referência oficial](https://developers.google.com/search/docs/appearance/web-stories-content-policy).

**Solução:**

Reduzir texto, usar assets de alta qualidade, criar uma narrativa completa e manter dentro da Story toda a informação essencial.

### WST-007 / Web Story excessivamente comercial

**Detalhes do problema:**

O único objetivo é anunciar um produto ou serviço, ou links de afiliado dominam o conteúdo. Isto viola a política específica das Web Stories. [Referência oficial](https://developers.google.com/search/docs/appearance/web-stories-content-policy).

**Solução:**

Criar conteúdo editorial completo e limitar afiliados a uma parte minoritária; seguir as Story Ad Guidelines para publicidade.

## Categoria: Funcionalidades Google especializadas

### FEA-001 / Lista Top Places não é independente ou genuína

**Detalhes do problema:**

Uma lista de locais físicos é patrocinada, gerada por frases templated a partir de métricas ou contém linguagem ofensiva. Só listas genuínas, independentes e curadas pelo publisher são elegíveis. [Referência oficial](https://developers.google.com/search/docs/appearance/top-places-list).

**Solução:**

Publicar seleção editorial independente, explicar os critérios e remover patrocínio, automatização textual e conteúdo ofensivo.

### FEA-002 / Preferred Sources tratado como recurso de subdiretório

**Detalhes do problema:**

Uma publicação tenta usar a funcionalidade Preferred Sources para um subdiretório. Apenas sites ao nível de domínio e subdomínio são elegíveis; a seleção depende do utilizador e não existe marcação técnica para garanti-la. [Referência oficial](https://developers.google.com/search/docs/appearance/preferred-sources).

**Solução:**

Usar o hostname elegível e, quando a publicação aparecer na ferramenta, fornecer o deeplink `https://google.com/preferences/source?q=DOMINIO` ou um botão para o utilizador escolher a fonte.

### FEA-003 / Package Tracking tratado como integração aberta

**Detalhes do problema:**

A implementação é planeada como oportunidade atual apesar de o programa Early Adopters já não aceitar novos parceiros. Para integrações existentes, a API deve responder em média em até 700 ms e o percentil 95 não pode exceder 1.000 ms. [Referência oficial](https://developers.google.com/search/docs/appearance/package-tracking).

**Solução:**

Não apresentar a funcionalidade como oportunidade disponível a novos sites. Em integrações já aceites, devolver `CurrentStatus` com data/hora e erros, manter alta disponibilidade e nunca enviar dados pessoais ou localização do remetente/destinatário.

### FEA-004 / Funcionalidade obsoleta tratada como rich result atual

**Detalhes do problema:**

A auditoria recomenda `FAQPage` ou `PracticeProblem` como oportunidade atual da Pesquisa, ou promete `ClaimReview` como rich result. FAQ rich results deixaram de aparecer em 7 de maio de 2026, Practice Problem foi removido em janeiro de 2026 e ClaimReview está em retirada da Pesquisa, permanecendo no Fact Check Explorer. [Referências oficiais](https://developers.google.com/search/updates#removing-faq-rich-result), [Practice Problem](https://developers.google.com/search/updates#removing-practice-problems), [ClaimReview](https://developers.google.com/search/docs/appearance/structured-data/factcheck).

**Solução:**

Retirar estes tipos do catálogo de oportunidades atuais. Não é necessário remover markup válido usado por outros consumidores; rotular `ClaimReview` apenas como integração limitada ao Fact Check Explorer.

## Categoria: E-commerce — produto e oferta

### ECM-001 / Dados de produto aplicados a página incompatível

**Detalhes do problema:**

Existe `Product` ou `ProductGroup` numa categoria, pesquisa interna, lista de produtos ou página que não representa um produto específico nem variantes do mesmo produto. Merchant listings exigem uma página centrada num único produto ou num conjunto de variantes do mesmo produto. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing).

**Solução:**

Aplicar `Product` apenas em páginas de detalhe. Para listas elegíveis, usar `ItemList` e manter cada produto numa página de detalhe distinta.

### ECM-002 / Merchant listing sem propriedades obrigatórias

**Detalhes do problema:**

Um `Product` diretamente comprável omite `name`, `image` ou `offers`, ou `offers` não é `Offer`. Merchant listings não suportam `AggregateOffer`. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing).

**Solução:**

Adicionar nome, pelo menos uma imagem válida e um `Offer` completo a cada produto diretamente comprável.

### ECM-003 / Imagem de produto inelegível ou insuficiente

**Detalhes do problema:**

`Product.image` está ausente, bloqueada, não indexável, usa formato não suportado, não representa o produto ou tem resolução baixa. O Google recomenda várias imagens com pelo menos 50.000 píxeis (`largura × altura`) nas proporções 1:1, 4:3 e 16:9. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing).

**Solução:**

Fornecer URLs estáveis e indexáveis para imagens representativas e versões de alta resolução nas proporções recomendadas.

### ECM-004 / Várias moedas servidas pelo mesmo URL

**Detalhes do problema:**

O preço e a moeda mudam por localização, sessão, cookie ou parâmetro não rastreável sem existir um URL distinto por moeda. Isto dificulta a associação estável entre URL, preço e moeda. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing).

**Solução:**

Criar URLs rastreáveis e consistentes por moeda e alinhar em cada URL o conteúdo visível, dados estruturados e feed.

### ECM-005 / Identificador comercial ausente ou inválido

**Detalhes do problema:**

O produto omite o identificador aplicável ou contém GTIN em URL/não numérico, ISBN inadequado, MPN inconsistente ou SKU com espaços Unicode. Deve ser usado o GTIN mais específico entre `gtin8`, `gtin12`, `gtin13` e `gtin14`; `isbn` aplica-se a `Book`, preferencialmente ISBN-13. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing).

**Solução:**

Publicar identificadores reais atribuídos ao produto, usar o GTIN numérico correto, tipar livros como `Book` e `Product` e normalizar o SKU sem whitespace Unicode, preferencialmente ASCII.

### ECM-006 / Categoria de produto malformada

**Detalhes do problema:**

`category` excede 750 caracteres, ou `CategoryCode` para Google Product Category omite `inCodeSet`/`codeValue`. Caminhos de categoria usam `>` como separador e cada segmento deve conter pelo menos uma letra. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing).

**Solução:**

Reduzir categorias personalizadas e representar a taxonomia Google com `CategoryCode`, `inCodeSet` apontado à taxonomia oficial e ID ou caminho válido em `codeValue`.

### ECM-007 / Produto adulto sem sinalização explícita

**Detalhes do problema:**

Um produto com conteúdo sexual não declara `hasAdultConsideration`. O valor atualmente suportado é `https://schema.org/SexualContentConsideration`. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing).

**Solução:**

Adicionar `hasAdultConsideration` com o valor suportado aos produtos aplicáveis.

### ECM-008 / Condição ou disponibilidade usa valor não suportado

**Detalhes do problema:**

`availability` ou `itemCondition` usa texto livre ou enumeração não suportada. `availability` suporta `BackOrder`, `Discontinued`, `InStock`, `InStoreOnly`, `LimitedAvailability`, `OnlineOnly`, `OutOfStock`, `PreOrder`, `PreSale` e `SoldOut`; `itemCondition` suporta `NewCondition`, `RefurbishedCondition` e `UsedCondition`. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing).

**Solução:**

Usar URLs completas das enumerações Schema.org suportadas e sincronizar o valor com o estado visível, feed e checkout.

### ECM-009 / Preço promocional ou riscado mal modelado

**Detalhes do problema:**

O preço anterior não usa `UnitPriceSpecification` com `priceType: https://schema.org/StrikethroughPrice`, o preço promocional é marcado como riscado ou falta o preço atual em `Offer`. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing).

**Solução:**

Separar o preço atual do anterior. Manter o preço ativo em `Offer.price` ou especificação ativa sem `priceType` e usar `validFrom`/`validThrough` ISO 8601 quando a promoção tem período definido.

### ECM-010 / Preço unitário incompleto

**Detalhes do problema:**

Existe `referenceQuantity` sem `QuantitativeValue.value` ou `unitCode`. A quantidade-base pode ser indicada por `valueReference`. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing).

**Solução:**

Completar quantidade e unidade UN/CEFACT ou nome de unidade aceite e garantir correspondência com o preço unitário visível.

### ECM-011 / Preço de membro conflitante ou incompleto

**Detalhes do problema:**

Existe preço exclusivo de membro sem preço regular, sem `validForMemberTier`, ou com `priceType` e `validForMemberTier` na mesma `UnitPriceSpecification`. Nesse último caso, o Google ignora a especificação. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing).

**Solução:**

Publicar separadamente o preço normal e o preço do nível de fidelização, referenciando o `MemberProgramTier` correto.

### ECM-012 / Pontos ganhos com formato inválido

**Detalhes do problema:**

`membershipPointsEarned` contém valor decimal ou não numérico, ou não está associado a `validForMemberTier`. O valor tem de ser inteiro e só é interpretado em conjunto com o nível aplicável. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing).

**Solução:**

Usar um inteiro não negativo e associar a especificação ao `MemberProgramTier` correspondente.

### ECM-013 / Tamanho ou audiência não normalizados

**Detalhes do problema:**

`sizeGroup`, `sizeSystem`, género ou idade usa texto livre. `sizeGroup` aceita no máximo dois valores entre Regular, Petite, Plus, Tall, Big e Maternity; `sizeSystem` suporta AU, BR, CN, DE, Europe, FR, IT, JP, MX, UK e US. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing).

**Solução:**

Normalizar tamanho, sistema e audiência através de `SizeSpecification` e `PeopleAudience` com os valores suportados.

### ECM-014 / Certificação de produto incompleta ou não suportada

**Detalhes do problema:**

`hasCertification` usa emissor ou tipo não suportado, ou omite identificação, classificação e escala aplicáveis. Podem ser apresentadas até dez certificações; certificações energéticas europeias exigem identificação EPREL ou rating válido e limites quando aplicáveis. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing).

**Solução:**

Usar emissores e certificações suportados e preencher identificação, classificação, `bestRating` e `worstRating` exigidos pelo caso.

### ECM-015 / Modelo 3D de produto incompatível

**Detalhes do problema:**

Existem vários `subjectOf`, falta `3DModel.encoding.contentUrl` ou o ficheiro não é `.gltf`/`.glb`. É suportado no máximo um `3DModel` por produto. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing).

**Solução:**

Manter um único modelo e publicar um ficheiro glTF rastreável através de `encoding.contentUrl`.

### ECM-016 / `AggregateOffer` utilizado para variantes

**Detalhes do problema:**

`AggregateOffer` agrega tamanhos, cores ou outras variantes. Este tipo representa o mesmo produto vendido por vários comerciantes e exige `lowPrice` e `priceCurrency`; `highPrice` e `offerCount` são recomendados. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/product-snippet).

**Solução:**

Modelar variantes com `ProductGroup` e objetos `Product` individuais. Reservar `AggregateOffer` às ofertas do mesmo produto por vários vendedores.

### ECM-017 / Pros e contras aplicados em contexto inelegível

**Detalhes do problema:**

`positiveNotes` ou `negativeNotes` aparece numa página comercial de produto, avaliação de cliente ou conteúdo não editorial. O recurso é suportado apenas em análises editoriais e requer pelo menos duas afirmações no total; cada item usa `ListItem.name`. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/product-snippet).

**Solução:**

Restringir o markup a análises editoriais e publicar pelo menos dois pontos concretos positivos ou negativos; usar `position` para preservar a ordem.

## Categoria: Variantes de produto

### VAR-001 / Variante sem identificador único

**Detalhes do problema:**

Duas ou mais variantes não têm `sku`/GTIN exclusivo ou partilham o mesmo identificador. Cada variante deve possuir identidade própria e cumprir os requisitos normais de `Product`. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/product-variants).

**Solução:**

Atribuir SKU ou GTIN exclusivo, real e válido a cada variante.

### VAR-002 / Identificador do grupo ausente ou divergente

**Detalhes do problema:**

Falta `ProductGroup.productGroupID` e `Product.inProductGroupWithID`, ou ambos existem com valores diferentes. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/product-variants).

**Solução:**

Definir um ID estável de grupo e reutilizá-lo de forma idêntica no `ProductGroup` e em todas as variantes.

### VAR-003 / Variante sem URL diretamente selecionável

**Detalhes do problema:**

Não existe URL rastreável que abra diretamente a variante correta ou o carregamento não atualiza imagem, preço, stock e seleção de compra. Parâmetros de query são aceites quando rastreáveis. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/product-variants).

**Solução:**

Criar um URL estável por variante e garantir que a resposta apresenta imediatamente os dados e a seleção dessa variante.

### VAR-004 / Canonical incorreta em variantes de página única

**Detalhes do problema:**

Uma implementação de página única canonicaliza para uma variante pré-selecionada ou define `ProductGroup.url` com seletores. O URL-base canonical deve ser neutro. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/product-variants).

**Solução:**

Canonicalizar para o URL-base sem variante e usar os URLs de variantes apenas para pré-seleção rastreável.

### VAR-005 / Página de variante sem markup autónomo

**Detalhes do problema:**

Numa implementação multipágina, cada página contém dados parciais ou depende de outra URL para definir o grupo. Cada página deve conter markup completo e autónomo. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/product-variants).

**Solução:**

Incluir em cada página `ProductGroup`, propriedades comuns e todos os campos obrigatórios da variante carregada; variantes remotas podem ser ligadas por `url`.

### VAR-006 / `variesBy` usa propriedade não suportada

**Detalhes do problema:**

`variesBy` contém texto livre, URL parcial ou propriedade fora de `color`, `size`, `suggestedAge`, `suggestedGender`, `material` e `pattern`. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/product-variants).

**Solução:**

Declarar apenas dimensões suportadas através das URLs Schema.org completas e colocar o valor específico em cada `Product`.

## Categoria: Programa de fidelização

### LOY-001 / Programa de fidelização incompleto

**Detalhes do problema:**

`Organization.hasMemberProgram` omite `name`, `description` ou pelo menos um `MemberProgramTier`. O URL de adesão é opcional e limitado a um. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/loyalty-program).

**Solução:**

Publicar o programa numa página institucional ou de políticas e completar todos os níveis disponíveis.

### LOY-002 / Nível de fidelização sem benefício válido

**Detalhes do problema:**

`MemberProgramTier` não contém `name` ou `hasTierBenefit`, ou declara `LoyaltyPoints` sem `membershipPointsEarned`. Cada nível precisa de pelo menos um benefício entre `LoyaltyPoints` e `LoyaltyPrice`. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/loyalty-program).

**Solução:**

Definir benefícios verificáveis por nível e preencher requisitos, taxas, URL e pontos quando aplicáveis.

### LOY-003 / Benefício comercial não ligado ao nível

**Detalhes do problema:**

Preço, pontos ou transporte de membro não referencia o `MemberProgramTier` através de `validForMemberTier`. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/loyalty-program).

**Solução:**

Atribuir `@id` estável a cada nível e referenciá-lo nas especificações de preço, pontos e transporte.

## Categoria: Política de transporte estruturada

### SHP-001 / Política global de transporte sem condições

**Detalhes do problema:**

`Organization.hasShippingService` existe sem `shippingConditions`. Cada `ShippingService` precisa de condições; quando várias correspondem, o Google escolhe o menor custo e, em empate, o menor prazo. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/shipping-policy).

**Solução:**

Adicionar uma ou mais `ShippingConditions` completas e atribuir nome único a cada serviço.

### SHP-002 / Transporte aplicado mundialmente por omissão

**Detalhes do problema:**

`ShippingConditions` omite `shippingDestination` apesar de o serviço não estar disponível em todo o mundo. Sem destino, as condições são interpretadas como globais. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/shipping-policy).

**Solução:**

Definir explicitamente países e regiões para todos os serviços com cobertura limitada.

### SHP-003 / Região de transporte malformada

**Detalhes do problema:**

O país não usa ISO 3166-1 alpha-2, a região não usa código válido, códigos postais são usados fora de AU/CA/US ou região e código postal aparecem no mesmo `DefinedRegion`. `addressRegion` suporta códigos ISO 3166-2 de dois ou três caracteres apenas para EUA, Austrália e Japão. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/shipping-policy).

**Solução:**

Normalizar destinos e usar objetos `DefinedRegion` separados para regras regionais e postais.

### SHP-004 / Prazo de processamento ou trânsito inválido

**Detalhes do problema:**

Durações possuem decimais/valores negativos, faltam limites, a unidade não é `DAY`/`d` ou `cutoffTime` omite timezone. Intervalos usam `minValue` e `maxValue`; valores exatos usam `value`. Pedidos após o cutoff acrescentam um dia de processamento. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/shipping-policy).

**Solução:**

Normalizar dias úteis, cutoff, processamento e trânsito em `ServicePeriod` e `QuantitativeValue`, com inteiros não negativos e offset correto.

### SHP-005 / Custo de transporte inválido

**Detalhes do problema:**

Falta moeda ISO 4217, o valor inclui símbolo monetário, `value` e `maxValue` são usados em simultâneo ou transporte gratuito não usa zero. Percentagens de encomenda/peso são frações entre 0 e 1. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/shipping-policy).

**Solução:**

Corrigir `MonetaryAmount`/`ShippingRateSettings`, usar apenas um tipo de valor e alinhar a moeda com a oferta.

### SHP-006 / Exclusão de transporte contém preço ou prazo

**Detalhes do problema:**

`doesNotShip:true` aparece juntamente com `shippingRate` ou `transitTime`, embora uma exclusão não deva definir custo nem prazo. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/shipping-policy).

**Solução:**

Remover custo e trânsito da exclusão e criar condições separadas para destinos servidos.

### SHP-007 / Benefício de transporte sem opção regular

**Detalhes do problema:**

Existe um serviço limitado por `validForMemberTier`, mas não existe serviço equivalente para clientes não membros. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/shipping-policy).

**Solução:**

Publicar separadamente o serviço regular e o benefício do nível de fidelização.

### SHP-008 / Múltiplas opções de transporte combinadas num só objeto

**Detalhes do problema:**

Um único `OfferShippingDetails` combina vários prazos ou preços. Cada objeto suporta apenas um `deliveryTime` e um `shippingRate`; modalidades, prazos ou preços diferentes exigem objetos separados. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing).

**Solução:**

Criar um `OfferShippingDetails` completo por combinação real de destino, modalidade, prazo e preço.

## Categoria: Política de devolução estruturada

### RET-001 / Política por link ou países fora da configuração suportada

**Detalhes do problema:**

`MerchantReturnPolicy` usa `merchantReturnLink` juntamente com uma configuração parcial incompatível, ou declara mais de 50 países ou códigos fora de ISO 3166-1 alpha-2. A configuração mínima geral de categoria e janela já é tratada no controlo Merchant correspondente. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/return-policy).

**Solução:**

Usar uma das configurações suportadas de forma coerente: política por `merchantReturnLink`, ou política estruturada por países e categoria, com no máximo 50 códigos alpha-2.

### RET-002 / Taxa de devolução incompatível com a categoria

**Detalhes do problema:**

`FreeReturn` ou `ReturnFeesCustomerResponsibility` contém montante, ou `ReturnShippingFees` não contém `returnShippingFeesAmount` não nulo. Apenas `ReturnShippingFees` aceita e exige esse valor. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/return-policy).

**Solução:**

Remover ou adicionar o custo conforme a categoria e usar moeda ISO 4217.

### RET-003 / Método, condição ou reembolso usa texto livre

**Detalhes do problema:**

A política não usa as enumerações suportadas para devolução por correio/loja/quiosque, estado novo/usado/recondicionado/danificado, troca/reembolso/crédito em loja ou origem da etiqueta. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/return-policy).

**Solução:**

Substituir texto livre pelas enumerações Schema.org suportadas e declarar regras distintas para defeito e arrependimento quando aplicável.

### RET-004 / Exceção sazonal incompleta

**Detalhes do problema:**

`returnPolicySeasonalOverride` omite `returnPolicyCategory`, uma janela finita omite `merchantReturnDays` ou `startDate`/`endDate` não usam Date/DateTime ISO 8601. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/return-policy).

**Solução:**

Completar categoria, janela e datas da exceção.

### RET-005 / Política aplicada no nível errado

**Detalhes do problema:**

Uma exceção de produto substitui indevidamente a política global em `Organization`, ou a regra geral é repetida em todas as ofertas. A política da oferta prevalece sobre a organizacional. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/return-policy).

**Solução:**

Centralizar a regra geral em `Organization.hasMerchantReturnPolicy` e manter em `Offer` apenas diferenças reais.

## Categoria: Alojamentos de férias

### VAC-001 / `VacationRental` sem propriedades mínimas

**Detalhes do problema:**

Falta `containsPlace: Accommodation`, `occupancy: QuantitativeValue` com `value` inteiro, `identifier` estável, `name`, latitude/longitude com pelo menos cinco casas decimais ou `image` com no mínimo oito fotografias. Deve existir pelo menos uma imagem de quarto, casa de banho e área comum. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/vacation-rental#structured-data-type-definitions).

**Solução:**

Completar todos os campos e manter o mesmo `identifier` entre idiomas e alterações do anúncio.

### VAC-002 / Localização ou características malformadas

**Detalhes do problema:**

O endereço omite país ISO 3166-1 alpha-2 ou morada física; `floorSize` usa unidade fora de FTK, SQFT, MTK e SQM; `amenityFeature` traduz nomes/valores que devem seguir a enumeração oficial em inglês. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/vacation-rental).

**Solução:**

Fornecer endereço completo, unidade suportada e nomes/valores de amenities conforme a documentação.

### VAC-003 / Review de alojamento sem data

**Detalhes do problema:**

Uma `Review` associada ao alojamento omite `datePublished`, além de algum requisito geral de Review. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/vacation-rental#vacation-rental-properties).

**Solução:**

Adicionar data ISO 8601 e manter a avaliação genuína, alojada e visível.

## Categoria: `VideoObject`

### VDO-001 / `VideoObject` sem propriedades mínimas

**Detalhes do problema:**

O objeto omite `name` único, `thumbnailUrl` válido ou `uploadDate` ISO 8601. O timezone é recomendado quando a hora é declarada. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/video#video-object).

**Solução:**

Preencher os três campos, sincronizá-los com a watch page e usar offset correto no timestamp.

### VDO-002 / Acesso ou descrição de `VideoObject` insuficientes

**Detalhes do problema:**

Faltam `contentUrl` e `embedUrl`, os URLs apontam à watch page em vez de bytes/player, `description` é duplicada ou `duration` não usa ISO 8601. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/video#video-object).

**Solução:**

Preferir `contentUrl` para os bytes, usar `embedUrl` para o player, criar descrição única e declarar duração ISO 8601.

## Categoria: Integração Merchant Center

### MRC-001 / Dependência exclusiva de uma fonte de produto

**Detalhes do problema:**

Os produtos são publicados apenas em structured data ou apenas no Merchant Center. O Google recomenda usar ambos; o Merchant Center é necessário para presença no separador Shopping. [Referência oficial](https://developers.google.com/search/docs/specialty/ecommerce/share-your-product-data-with-google).

**Solução:**

Manter dados estruturados na página e feed/Content API com identificadores, preços, stock e URLs equivalentes.

### MRC-002 / Feed sem cadência adequada à volatilidade

**Detalhes do problema:**

Preço e stock mudam rapidamente, mas o feed depende apenas de rastreio automático ou intervalos longos. O rastreio pode bastar para catálogos pequenos e estáveis; catálogos grandes ou voláteis precisam de feeds agendados ou Content API. [Referência oficial](https://developers.google.com/search/docs/specialty/ecommerce/share-your-product-data-with-google).

**Solução:**

Escolher a frequência e o método de atualização com base na dimensão e volatilidade do catálogo.

### MRC-003 / Configurações comerciais com precedência inesperada

**Detalhes do problema:**

Transporte, devoluções, fidelização ou dados do produto existem em várias superfícies com valores diferentes. Feed/Content API e definições do Merchant Center podem prevalecer sobre structured data; regras do produto prevalecem sobre regras organizacionais. [Referência oficial](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing).

**Solução:**

Definir uma fonte principal, eliminar duplicações contraditórias e usar overrides de produto apenas para exceções reais.

# Funções

Esta secção define funções operacionais que uma LLM ou um MCP pode executar para descobrir concorrentes orgânicos, recolher as pesquisas que funcionam para eles, comparar páginas, priorizar oportunidades e produzir planos de melhoria verificáveis. As funções não substituem os problemas anteriores: usam o catálogo como biblioteca de diagnósticos durante a análise.

## Contrato obrigatório de execução

1. Separar sempre dados próprios, dados externos estimados e inferências:
   - <code>first_party</code>: Search Console, Analytics, Merchant Center, base de produtos e crawler do próprio site.
   - <code>estimated_external</code>: posições, volume, tráfego e backlinks provenientes de Ahrefs, Semrush ou fornecedor SERP licenciado.
   - <code>observed_public</code>: HTML e recursos públicos recolhidos diretamente das páginas analisadas.
   - <code>inference</code>: explicação provável produzida pela LLM. Nunca apresentar uma inferência como fator de ranking confirmado.
2. Guardar em cada registo <code>source</code>, <code>retrieved_at</code>, país, idioma, dispositivo, motor de pesquisa e âmbito analisado: domínio, subdomínio, subpasta ou URL exata.
3. Não executar pesquisas automatizadas diretamente no Google. Usar uma API licenciada de SERPs ou uma exportação autorizada. O Google inclui scraping de resultados para rank tracking nas suas políticas sobre tráfego automatizado.
4. Rastrear apenas páginas públicas, respeitar <code>robots.txt</code>, limites de frequência, autenticação e termos aplicáveis. Não contornar CAPTCHA, paywall, login ou bloqueios.
5. Não copiar texto, imagens, avaliações, dados proprietários ou identidade visual dos concorrentes. Extrair padrões, atributos, estruturas e funcionalidades; produzir conteúdo original com dados verificáveis do próprio projeto.
6. Não recomendar compra de links, PBN, comentários automáticos, doorway pages, keyword stuffing, avaliações falsas ou conteúdo criado em escala sem valor próprio.
7. Uma técnica observada num concorrente só pode originar uma ação quando:
   - aparece em páginas que satisfazem a mesma intenção;
   - é útil para o utilizador e aplicável ao negócio;
   - não contradiz as políticas do Google;
   - existe evidência concreta da lacuna no projeto;
   - a implementação pode ser validada.
8. Nenhuma função pode prometer posição, tráfego ou prazo. A saída deve indicar <code>confidence</code>, limitações e dados em falta.

Referências gerais: [Google — conteúdo útil e centrado nas pessoas](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [Google — políticas de spam](https://developers.google.com/search/docs/essentials/spam-policies), [Ahrefs — Organic Keywords e Top Pages](https://help.ahrefs.com/en/articles/735472-how-do-i-find-out-what-keywords-a-website-is-ranking-for), [Semrush — Organic Rankings](https://www.semrush.com/kb/20-organic-rankings) e [DataForSEO Labs — visão geral dos endpoints Google](https://docs.dataforseo.com/v3/dataforseo_labs-google-overview/).

## Estrutura mínima de dados

O executor deve manter, pelo menos, estas entidades:

- <code>project</code>: domínio canonical, propriedade GSC, países, idiomas, dispositivos, termos de marca, tipos de página, produtos/serviços prioritários, conversões e domínios excluídos.
- <code>keyword_observation</code>: consulta, cluster, intenção, país, idioma, dispositivo, volume estimado, impressões e cliques próprios, URL própria, posição própria, domínio/URL concorrente, posição concorrente, funcionalidades da SERP, fonte e data.
- <code>competitor</code>: domínio, tipo, mercados, tópicos comuns, keywords partilhadas, visibilidade ponderada, páginas relevantes, referências externas e confiança.
- <code>page_snapshot</code>: URL, status, canonical, indexabilidade, title, H1, headings, texto principal normalizado, entidades, atributos, schema, links, imagens, preço/stock quando aplicável, data e hash.
- <code>opportunity</code>: intenção, query cluster, URL-alvo, concorrentes, evidências, lacunas, prioridade, esforço, ação recomendada, critérios de aceitação e estado.
- <code>measurement</code>: baseline, data da alteração, períodos comparáveis, métricas GSC/Analytics, ranking estimado, share of voice e decisão.

### FUN-001 / Configurar o contexto competitivo do projeto

**Informação a obter:** o âmbito exato no qual concorrentes e oportunidades devem ser avaliados.

**Entradas:**

- Domínio ou subpasta do projeto e propriedade correspondente do Search Console.
- Países, idiomas e dispositivos onde o negócio pode realmente vender ou servir.
- Categorias, produtos, serviços e conversões com valor comercial.
- Termos de marca, marcas de terceiros vendidas legitimamente e termos a excluir.

**Plano de execução:**

1. Resolver redirecionamentos da homepage, host preferido, HTTPS e canonical principal.
2. Definir separadamente o âmbito de domínio, subdomínio, subpasta e URL. Não comparar uma loja inteira com apenas o blog de um concorrente.
3. Rastrear sitemap e navegação do projeto e classificar URLs como homepage, categoria, subcategoria, produto, guia, comparação, institucional ou suporte.
4. Extrair a taxonomia real de categorias e atributos de produto; não gerar a estratégia apenas a partir de palavras encontradas no texto.
5. Registar mercados válidos no formato país–idioma–dispositivo. Um concorrente de outro mercado pode servir de referência editorial, mas não deve receber a mesma pontuação comercial.
6. Atribuir a cada categoria ou produto um <code>business_value</code> de 0 a 3 definido pelo proprietário: 0 sem valor, 1 indireto, 2 relevante, 3 diretamente associado a receita ou lead.
7. Criar listas separadas de concorrentes comerciais conhecidos, marketplaces, fabricantes, publicações, fóruns e domínios irrelevantes. Estas listas são sementes, não o resultado final.

**Saída obrigatória:**

- Objeto <code>project_context</code> com âmbito, mercados, taxonomia, conversões, brand terms, exclusões e data.
- Lista de URLs prioritárias e respetivo tipo.
- Lista de dados em falta que impedem uma análise fiável.

**Validação:** rejeitar a execução se não existir pelo menos um mercado, uma oferta real e um âmbito canonical inequívoco.

### FUN-002 / Recolher a procura e o desempenho real do próprio site

**Informação a obter:** consultas, landing pages, impressões, cliques, CTR e posição que pertencem realmente ao projeto.

**Fontes:** Search Analytics API com OAuth <code>webmasters.readonly</code>; para sites grandes, exportação diária do Search Console para BigQuery; Analytics apenas para comportamento e conversão depois do clique.

**Plano de execução:**

1. Recolher dados finalizados para 28 e 90 dias e os períodos anteriores equivalentes. Acrescentar comparação anual quando existir histórico comparável.
2. Consultar separadamente:
   - <code>query + page</code>;
   - <code>query + page + country</code>;
   - <code>query + page + device</code>;
   - <code>page + date</code>;
   - <code>query + date</code> para clusters prioritários.
3. Na API, usar <code>rowLimit=25000</code> e paginar com <code>startRow</code> até receber zero linhas. Não assumir que isto devolve todas as consultas: a API retorna as linhas principais e está sujeita a limites.
4. Para propriedades afetadas pelo limite diário de dados, preferir BigQuery. A exportação em massa contém os dados de desempenho disponíveis exceto consultas anonimizadas e não está sujeita ao limite diário de linhas da API.
5. Calcular <code>CTR = clicks / impressions</code>. Calcular posição agregada ponderando pela impressão; nunca tirar a média simples de médias de posição.
6. Segmentar marca e não-marca, país, dispositivo, idioma e tipo de pesquisa. Não comparar CTR mobile de marca com CTR desktop não-marca.
7. Juntar por URL canonical com tipo de página, indexabilidade, conversões e receita/leads quando disponíveis.
8. Guardar diferenças entre totais e linhas de query como limitação de privacidade, não como erro.

**Saída obrigatória:**

- Tabela <code>gsc_query_page</code> com métricas atuais, anteriores e variações.
- Tabela <code>gsc_page_daily</code>.
- Clusters com procura comprovada, páginas nas posições 4–20, CTR inferior à referência interna e consultas sem landing page adequada.

**Validação:** clicks, impressions e CTR devem reconciliar dentro das limitações de agregação; dados incompletos devem ser rotulados e nunca misturados com dados finalizados.

**Referências:** [Search Analytics API](https://developers.google.com/webmaster-tools/v1/searchanalytics/query), [limites e filtragem dos dados](https://developers.google.com/search/blog/2022/10/performance-data-deep-dive), [API versus BigQuery](https://support.google.com/webmasters/answer/12919192) e [exportação em massa](https://support.google.com/webmasters/answer/12918484).

### FUN-003 / Descobrir automaticamente concorrentes orgânicos

**Informação a obter:** os domínios que disputam as mesmas SERPs e intenções, mesmo que não sejam concorrentes comerciais conhecidos.

**Fontes externas possíveis:** Ahrefs Organic Competitors, Semrush Organic Rankings Competitors ou um fornecedor licenciado com operação equivalente a <code>competitors_domain</code>. Uma implementação direta pode usar [DataForSEO Competitors Domain](https://docs.dataforseo.com/v3/dataforseo_labs-google-competitors_domain-live/).

**Plano de execução:**

1. Executar a descoberta por cada mercado país–idioma e, quando relevante, por mobile e desktop.
2. Obter candidatos que partilham resultados orgânicos com o domínio:
   - primeira passagem limitada ao Top 10, equivalente ao modelo descrito pelo Ahrefs;
   - segunda passagem até ao Top 20 para aumentar cobertura, equivalente ao modelo descrito pelo Semrush;
   - manter os dois valores separados.
3. Para cada consulta partilhada, calcular <code>rank_weight = 1 / log2(position + 1)</code> para posições 1–20 e zero depois da posição 20.
4. Calcular <code>query_weight = log(1 + volume_or_own_impressions) × business_relevance</code>. Usar impressões GSC quando existirem; usar volume externo apenas como estimativa.
5. Calcular:
   - <code>weighted_overlap = sum(query_weight × rank_weight_competitor) / sum(query_weight)</code>;
   - <code>shared_top10_ratio = shared_top10_keywords / target_ranked_keywords_in_scope</code>;
   - <code>commercial_similarity</code> entre 0 e 1 a partir da sobreposição de categorias, produtos e intenção;
   - <code>market_match</code> entre 0 e 1.
6. Produzir <code>competitor_score = 100 × (0.45 × weighted_overlap + 0.25 × shared_top10_ratio + 0.20 × commercial_similarity + 0.10 × market_match)</code>.
7. Classificar cada candidato como:
   - concorrente comercial direto;
   - concorrente orgânico editorial;
   - marketplace/agregador;
   - fabricante ou fornecedor;
   - fórum/rede social;
   - domínio genérico ou irrelevante.
8. Não remover automaticamente marketplaces, publicações ou fóruns: podem revelar o formato de resultado preferido. Excluí-los apenas da lista de concorrentes comerciais.
9. Inspecionar manualmente ou por LLM as cinco páginas mais visíveis de cada candidato antes de confirmar a classificação.

**Saída obrigatória:**

- Top 20 concorrentes orgânicos por mercado, com score, tipo, keywords comuns, distribuição de posições e páginas comuns.
- Top 3–5 concorrentes diretos para Content Gap.
- Lista separada de concorrentes SERP não comerciais que influenciam o formato dos resultados.

**Validação:** um domínio não pode ser confirmado apenas porque partilha muitas keywords; deve existir sobreposição temática e de intenção. Guardar a fórmula e os valores que justificam o score.

**Referências:** [Ahrefs — concorrentes por keywords partilhadas no Top 10](https://ahrefs.com/blog/keyword-competitive-analysis/), [Semrush — concorrentes por keywords comuns no Top 20](https://www.semrush.com/kb/844-discover-competitors) e [Semrush — Competition Level](https://www.semrush.com/kb/496-organic-rankings-competitors-report).

### FUN-004 / Descobrir concorrentes quando o site tem poucos rankings

**Informação a obter:** concorrentes prováveis quando não existe sobreposição suficiente para FUN-003.

**Plano de execução:**

1. Criar seeds a partir de categorias, nomes e atributos dos produtos, pesquisa interna, perguntas de clientes e consultas GSC existentes.
2. Remover termos puramente de marca, duplicados, variantes ortográficas equivalentes e pesquisas que não correspondem a uma oferta real.
3. Selecionar entre 50 e 200 consultas representativas, distribuídas por intenção e valor comercial; não escolher apenas termos de grande volume.
4. Pedir a um fornecedor SERP a lista de domínios que aparece nessas consultas no mercado correto. O endpoint [DataForSEO SERP Competitors](https://docs.dataforseo.com/v3/dataforseo_labs-google-serp_competitors-live/) aceita uma lista de keywords e devolve rankings, visibilidade e tráfego estimado.
5. Aplicar a ponderação e classificação de FUN-003, usando a cobertura das seeds como denominador.
6. Confirmar se os candidatos vendem, explicam ou comparam a mesma classe de oferta.
7. Guardar <code>discovery_mode=seed_serp</code> e baixar a confiança relativamente a concorrentes descobertos por rankings reais do projeto.

**Saída obrigatória:** concorrentes por cluster de seeds, cobertura das seeds, tipo de domínio e confiança.

**Validação:** cada cluster comercial deve conter várias seeds independentes. Um domínio presente numa única consulta não deve ser tratado como concorrente estrutural.

**Referência:** [Ahrefs — Traffic Share para descobrir concorrentes a partir de uma lista de keywords](https://help.ahrefs.com/en/articles/2073915-how-can-i-find-new-competitor-websites-using-the-traffic-share-reports).

### FUN-005 / Obter o portfólio de keywords e páginas dos concorrentes

**Informação a obter:** consultas, posições e landing pages estimadas que geram visibilidade a cada concorrente.

**Plano de execução:**

1. Para cada concorrente confirmado, definir o mesmo âmbito utilizado no projeto: domínio, subdomínio, subpasta ou URL.
2. Recolher keywords orgânicas no Top 100 por país e idioma. Uma implementação direta pode usar [DataForSEO Ranked Keywords](https://docs.dataforseo.com/v3/dataforseo_labs-google-ranked_keywords-live/); exports equivalentes podem vir do Ahrefs Organic Keywords ou Semrush Positions.
3. Recolher também páginas agregadas por visibilidade e keywords através de operação equivalente a [Relevant Pages](https://docs.dataforseo.com/v3/dataforseo_labs-google-relevant_pages-live/).
4. Guardar para cada linha: keyword, posição, URL, title conhecido, volume, tráfego estimado, CPC, intenção estimada, funcionalidades da SERP, backlinks da página, país, idioma, dispositivo, data e fonte.
5. Separar keywords de marca do concorrente:
   - excluir navegação pura e suporte da marca;
   - conservar comparações legítimas, pesquisas de categoria e termos onde várias marcas aparecem, desde que sejam relevantes e juridicamente seguros.
6. Normalizar URLs, resolver redirects e agrupar parâmetros ou variantes que apontam para a mesma canonical.
7. Agrupar keywords semanticamente, mas conservar a keyword original. Sinónimos só devem ser consolidados quando a SERP e a intenção forem equivalentes.
8. Não apresentar tráfego ou volume externo como analytics real do concorrente; são estimativas.

**Saída obrigatória:**

- <code>competitor_keyword_portfolio</code>.
- <code>competitor_top_pages</code>.
- Distribuição por intenção, tipo de página, posição e tópico.

**Validação:** rejeitar linhas de mercado errado, páginas removidas e keywords cuja landing page já não responde com 200 ou deixou de ser indexável.

**Referências:** [Ahrefs — Organic Keywords e Top Pages](https://help.ahrefs.com/en/articles/735472-how-do-i-find-out-what-keywords-a-website-is-ranking-for) e [Semrush — Positions, Pages e Competitors](https://www.semrush.com/kb/20-organic-rankings).

### FUN-006 / Calcular Content Gap e fraquezas por intenção

**Informação a obter:** pesquisas onde concorrentes têm visibilidade e o projeto está ausente ou abaixo deles.

**Entradas:** keywords próprias de FUN-002 e fornecedor externo, portfólios de FUN-005, concorrentes confirmados e contexto de FUN-001.

**Plano de execução:**

1. Criar conjuntos por mercado e usar as definições:
   - <code>missing</code>: todos os concorrentes selecionados têm ranking e o projeto não aparece no Top 100;
   - <code>untapped</code>: pelo menos um concorrente tem ranking e o projeto não aparece;
   - <code>weak</code>: o projeto aparece, mas abaixo de todos os concorrentes selecionados;
   - <code>shared</code>: todos aparecem;
   - <code>strong</code>: o projeto está acima de todos;
   - <code>unique</code>: apenas o projeto aparece.
2. Exigir pelo menos um concorrente no Top 20 para transformar <code>missing</code> ou <code>untapped</code> numa oportunidade ativa.
3. Usar interseção de domínios quando necessário. O endpoint [Domain Intersection](https://docs.dataforseo.com/v3/dataforseo_labs-google-domain_intersection-live/) devolve keywords partilhadas, posições e métricas estimadas.
4. Remover:
   - termos de marca concorrente sem aplicação legítima;
   - produtos ou serviços não oferecidos;
   - países e idiomas fora do âmbito;
   - intenção que o modelo de negócio não consegue satisfazer;
   - duplicados semânticos.
5. Associar cada cluster a uma destas causas:
   - não existe página;
   - existe página adequada, mas tem pouca visibilidade;
   - a URL posicionada é do tipo errado;
   - várias URLs próprias competem;
   - página correta tem problema técnico ou conteúdo insuficiente.
6. Para cada cluster, guardar posições dos concorrentes, respetivas URLs e o tipo de resultado dominante; não gerar uma recomendação antes de FUN-007.

**Saída obrigatória:** tabela de gaps por cluster, classe, mercado, URL própria, URLs concorrentes, procura, valor comercial e causa provável.

**Validação:** uma keyword presente num concorrente não é automaticamente uma oportunidade. A saída deve explicar a relevância para a oferta e o utilizador.

**Referências:** [Ahrefs Content Gap](https://help.ahrefs.com/en/articles/9025740-how-to-use-content-gap-to-find-keyword-ideas-from-competitor-websites) e [Semrush Keyword Gap e definições das interseções](https://www.semrush.com/kb/28-keyword-gap).

### FUN-007 / Determinar intenção e formato exigido pela SERP

**Informação a obter:** o tipo de página e a resposta que os resultados atuais sugerem para cada cluster.

**Plano de execução:**

1. Recolher uma SERP atual por keyword representativa, país, idioma e dispositivo através de fornecedor autorizado.
2. Registar os dez primeiros resultados orgânicos, funcionalidades SERP, Shopping, local pack, vídeos, imagens, fóruns, snippets e AI Overview quando o fornecedor os disponibilizar.
3. Classificar cada resultado como produto, categoria, comparação, guia, lista, ferramenta, vídeo, fórum, homepage ou página local.
4. Considerar formato dominante quando pelo menos 6 dos 10 resultados orgânicos pertencem ao mesmo tipo. Caso contrário, marcar <code>mixed_serp=true</code> e conservar os dois ou três formatos principais.
5. Inferir intenção informacional, comercial, transacional, navegacional ou local a partir da necessidade expressa e dos resultados; guardar confiança e evidência.
6. Comparar a página própria com o formato dominante:
   - produto contra categoria;
   - categoria contra guia;
   - guia contra comparação;
   - página nacional contra intenção local.
7. Medir estabilidade com pelo menos duas observações separadas antes de criar uma nova página para uma SERP volátil.
8. Não forçar uma keyword para uma página incompatível apenas porque o volume é elevado.

**Saída obrigatória:** <code>serp_intent_profile</code> com formato dominante, intenção, funcionalidades, concorrentes, estabilidade e recomendação de tipo de página.

**Validação:** incluir URLs e data da SERP que sustentam a classificação. Marcar como hipótese quando não existir consenso.

### FUN-008 / Comparar a página própria com páginas concorrentes vencedoras

**Informação a obter:** diferenças concretas e corrigíveis entre uma landing page própria e três a cinco resultados que satisfazem a mesma intenção.

**Plano de execução:**

1. Confirmar através de FUN-007 que todas as páginas comparadas respondem à mesma intenção.
2. Rastrear HTML público e, quando necessário, renderizar JavaScript sem contornar bloqueios.
3. Extrair de cada página:
   - status, canonical, robots, hreflang e data;
   - title, H1, headings, introdução e secções;
   - tipo de página, entidades, produtos e atributos;
   - texto principal normalizado e tópicos cobertos;
   - tabelas, comparações, calculadoras, filtros e navegação;
   - imagens, vídeo, alt text e sinais de conteúdo próprio;
   - autor, organização, fontes, método e datas;
   - dados estruturados e correspondência com conteúdo visível;
   - links internos, breadcrumbs e páginas relacionadas;
   - preço, stock, entrega, devoluções, avaliações e identificadores quando aplicável.
4. Criar uma matriz com estados <code>missing</code>, <code>inferior</code>, <code>equivalent</code>, <code>stronger</code> e <code>not_applicable</code>.
5. Para conteúdo, comparar cobertura de entidades e decisões do utilizador, não apenas contagem de palavras.
6. Para cada diferença, registar:
   - evidência no projeto;
   - padrão observado nos concorrentes;
   - utilidade para o utilizador;
   - problema do catálogo associado;
   - risco e esforço de implementação.
7. Rotular padrões competitivos como correlação observada. Não afirmar que uma secção, schema ou número de palavras causou a posição.
8. Não reproduzir frases, imagens ou organização editorial exclusiva. Transformar o padrão numa especificação original baseada em dados e experiência do próprio negócio.

**Saída obrigatória:** matriz page-vs-page e lista de diferenças acionáveis com evidência, prioridade preliminar e códigos do catálogo.

**Validação:** excluir qualquer recomendação que não melhore a resposta, seja tecnicamente falsa ou apenas aumente volume de texto.

### FUN-009 / Encontrar páginas e padrões que mais funcionam nos concorrentes

**Informação a obter:** tópicos, tipos de página e formatos que repetidamente geram visibilidade aos concorrentes.

**Plano de execução:**

1. Ordenar as páginas de cada concorrente por tráfego orgânico estimado, número de keywords no Top 3/10/20 e domínios de referência.
2. Guardar histórico suficiente para distinguir página estável, crescimento recente, queda e evento isolado.
3. Agrupar páginas por tópico, intenção e formato; uma URL pode pertencer a um tópico principal e vários atributos secundários.
4. Procurar padrões presentes em pelo menos dois concorrentes relevantes:
   - categorias que concentram várias keywords comerciais;
   - guias que atraem procura anterior à compra;
   - comparações ou ferramentas com referências externas;
   - fichas de produto com dados técnicos completos;
   - hubs que distribuem links para páginas comerciais.
5. Calcular <code>pattern_strength</code> a partir de número de concorrentes, estabilidade, visibilidade, relevância comercial e qualidade das páginas.
6. Para cada padrão, escolher:
   - melhorar página existente;
   - consolidar páginas próprias;
   - criar página apenas se existir intenção distinta;
   - ignorar por falta de relevância ou capacidade.
7. Não usar volume ou tráfego estimado isoladamente; verificar SERP, intenção e capacidade real de produzir uma resposta melhor.

**Saída obrigatória:** relatório <code>winning_patterns</code> com páginas de evidência, padrão, oportunidade, tipo de ação e confiança.

**Referências:** [Ahrefs — páginas e tráfego estimado de sites que não controla](https://help.ahrefs.com/en/articles/944144-how-can-i-check-organic-search-traffic-of-sites-i-don-t-own) e [DataForSEO Relevant Pages](https://docs.dataforseo.com/v3/dataforseo_labs-google-relevant_pages-live/).

### FUN-010 / Comparar arquitetura, descoberta e links internos

**Informação a obter:** como concorrentes tornam categorias, produtos e guias importantes fáceis de encontrar e relacionar.

**Plano de execução:**

1. Rastrear o projeto e os concorrentes confirmados a partir de homepage, sitemaps e páginas prioritárias.
2. Construir um grafo com URLs canonical indexáveis como nós e links HTML rastreáveis como arestas.
3. Medir por tipo de página:
   - profundidade mínima a partir da homepage;
   - número de páginas internas de origem;
   - anchors distintos e contexto;
   - ligação categoria → subcategoria → produto;
   - ligações guia → categoria/produto;
   - breadcrumbs, relacionados e hubs;
   - páginas órfãs ou dependentes de pesquisa interna.
4. Comparar medianas por tipo de página, não o total bruto de links entre sites de tamanhos diferentes.
5. Identificar técnicas úteis, como hubs por aplicação, filtros com landing pages reais, ligações de guias para produtos e promoção de categorias prioritárias.
6. Gerar alterações próprias no formato <code>source_url → target_url → anchor_purpose</code>.
7. Usar <code>&lt;a href&gt;</code> com destino real e anchor descritiva. Não criar links ocultos, repetir keywords artificialmente ou usar <code>nofollow</code> para esculpir importância interna.

**Saída obrigatória:** gaps de arquitetura e lista exata de ligações a adicionar, remover ou corrigir, com origem, destino, motivo e prioridade.

**Validação:** toda URL prioritária deve ser alcançável por links normais e a recomendação deve ajudar navegação real, não apenas métricas internas.

**Referências:** [Google — arquitetura de e-commerce](https://developers.google.com/search/docs/specialty/ecommerce/help-google-understand-your-ecommerce-site-structure) e [Google — links rastreáveis e anchors](https://developers.google.com/search/docs/crawling-indexing/links-crawlable).

### FUN-011 / Encontrar oportunidades legítimas de referências externas

**Informação a obter:** domínios e páginas que referenciam concorrentes relevantes, mas não o projeto.

**Fontes:** Ahrefs Link Intersect, Semrush Backlink Gap ou fornecedor licenciado. Uma implementação direta pode usar [DataForSEO Backlinks API](https://docs.dataforseo.com/v3/backlinks-overview/) e [Page Intersection](https://docs.dataforseo.com/v3/backlinks-page_intersection-live/).

**Plano de execução:**

1. Usar três a cinco concorrentes diretos e executar interseção de domínios e páginas, excluindo o domínio do projeto.
2. Distinguir links para domínio, subpasta e página equivalente. Uma oportunidade para um guia não é automaticamente adequada para uma ficha de produto.
3. Recolher domínio/página de origem, URL de destino, anchor, contexto, atributo, primeira/última deteção, tráfego estimado, topical relevance e quantos concorrentes são referenciados.
4. Excluir ou reduzir prioridade de:
   - links pagos sem qualificação;
   - diretórios sem relevância;
   - comentários, perfis e UGC manipuláveis;
   - redes do mesmo proprietário;
   - páginas sem tráfego, removidas ou marcadas como spam;
   - links sitewide sem contexto editorial.
5. Normalizar componentes entre 0 e 1 e calcular <code>link_opportunity = 100 × (0.35 × topical_relevance + 0.25 × competitor_intersection + 0.20 × source_quality + 0.10 × source_traffic + 0.10 × acquisition_fit)</code>.
6. Verificar manualmente as melhores fontes e identificar por que o link existe:
   - citação de dado ou estudo;
   - ferramenta ou recurso;
   - associação, fabricante ou fornecedor;
   - caso de cliente;
   - comparação editorial;
   - notícia;
   - substituição de recurso quebrado;
   - menção de marca sem link.
7. Criar primeiro um recurso próprio que mereça a referência. Contactar apenas fontes realmente relacionadas e explicar o valor específico; não automatizar outreach em massa.
8. Se existir compensação, usar <code>rel=sponsored</code> ou <code>nofollow</code>. Não contar esse link como referência editorial conquistada.

**Saída obrigatória:** lista de oportunidades verificadas, motivo provável, recurso próprio necessário, contacto apenas quando público, risco, esforço e ação.

**Validação:** nenhuma oportunidade pode ser aprovada apenas por DR, Domain Rank ou autoridade de ferramenta; estas não são métricas do Google.

**Referências:** [Ahrefs Link Intersect](https://help.ahrefs.com/en/articles/816374-how-to-use-link-intersect-to-find-backlink-ideas-from-competitor-websites), [Semrush Backlink Gap](https://www.semrush.com/kb/773-backlink-gap) e [Google — link spam](https://developers.google.com/search/docs/essentials/spam-policies#link-spam).

### FUN-012 / Priorizar oportunidades de ranking

**Informação a obter:** quais ações devem ser executadas primeiro com base em valor, procura, possibilidade e evidência.

**Plano de execução:**

1. Normalizar todos os componentes para 0–1 dentro do mesmo mercado e tipo de intenção.
2. Definir:
   - <code>business_fit</code>: valor 0–3 de FUN-001 dividido por 3;
   - <code>demand</code>: combinação normalizada de impressões GSC e logaritmo do volume estimado;
   - <code>conversion_fit</code>: conversão observada de páginas/cluster equivalentes ou valor definido pelo negócio;
   - <code>current_traction</code>: impressões, posição e crescimento já observados no projeto;
   - <code>attainability</code>: 0.35 intenção/formato, 0.25 proximidade da posição, 0.20 capacidade de fechar a lacuna de página e 0.20 inverso da lacuna de referências;
   - <code>confidence</code>: cobertura, atualidade, estabilidade da SERP e concordância entre fontes, limitado entre 0.4 e 1.
3. Calcular <code>priority = round(100 × confidence × (0.30 × business_fit + 0.20 × demand + 0.20 × attainability + 0.15 × current_traction + 0.15 × conversion_fit))</code>.
4. Aplicar bloqueios antes do score:
   - oferta ou mercado inexistente;
   - intenção incompatível;
   - página não indexável sem correção prevista;
   - ação dependente de conteúdo falso, link spam ou cópia;
   - ausência de evidência.
5. Classificar:
   - <code>quick_win</code>: página correta, indexável, posição 4–20 e procura material para o projeto;
   - <code>improve_existing</code>: intenção correta, mas conteúdo, arquitetura ou apresentação inferiores;
   - <code>consolidate</code>: duplicação ou canibalização;
   - <code>create</code>: intenção distinta sem página adequada;
   - <code>authority_long_term</code>: resposta competitiva, mas diferença externa significativa;
   - <code>ignore</code>: pouco valor ou inadequação.
6. Não utilizar KD, DR, volume ou número de palavras como decisão isolada.

**Saída obrigatória:** backlog ordenado com score, componentes, classe, URL, cluster, evidências, dependências, esforço e confiança.

**Validação:** recalcular a prioridade quando mercado, conversão, SERP ou posição mudar; preservar os valores anteriores para auditoria.

### FUN-013 / Produzir um plano técnico de melhoria para uma página

**Informação a obter:** alterações específicas necessárias para competir por um cluster sem copiar o concorrente.

**Entradas:** oportunidade aprovada, página própria, FUN-007, FUN-008, FUN-010, FUN-011 e problemas aplicáveis do catálogo.

**Plano de execução:**

1. Selecionar uma decisão:
   - melhorar a URL existente;
   - consolidar e redirecionar;
   - separar intenções;
   - criar uma URL nova;
   - não alterar.
2. Produzir um diagnóstico que responda:
   - qual é a intenção e a página esperada;
   - que URL própria compete atualmente;
   - quais concorrentes e páginas sustentam a análise;
   - em que aspetos o projeto já é superior;
   - quais lacunas são técnicas, editoriais, comerciais, arquiteturais ou externas.
3. Converter padrões úteis dos concorrentes em requisitos próprios. Exemplos permitidos:
   - página de categoria com critérios de seleção e comparação;
   - ficha com atributos, compatibilidade, medidas, stock, entrega e devolução reais;
   - guia com método, exemplos, limitações e dados próprios;
   - tabelas ou ferramentas calculadas com dados do projeto;
   - imagens originais;
   - breadcrumbs e links contextuais;
   - structured data que reproduz o conteúdo visível.
4. Para cada alteração, definir:
   - ficheiro/template/componente ou campo de conteúdo afetado;
   - conteúdo/dado necessário e respetiva fonte;
   - problema do catálogo que resolve;
   - dependência;
   - risco;
   - critério de aceitação testável.
5. Ordenar o plano:
   - P0: indexação, canonical, resposta HTTP, renderização, dados comerciais falsos ou bloqueios;
   - P1: intenção, conteúdo principal, identidade do produto/categoria e arquitetura;
   - P2: apresentação, enriquecimento visual, dados recomendados e aquisição de referências.
6. Não recomendar adicionar todas as secções vistas nos concorrentes. Implementar apenas o que responde melhor à necessidade e pode ser mantido atualizado.
7. Gerar conteúdo final apenas com factos fornecidos ou fontes aprovadas. Marcar campos em falta como <code>requires_business_input</code>; nunca inventar características, clientes, avaliações, testes ou resultados.

**Saída obrigatória:**

- Resumo da oportunidade.
- Evidências com URL e data.
- Lista <code>keep</code>, <code>change</code>, <code>create</code>, <code>remove</code>.
- Tarefas P0/P1/P2.
- Critérios de aceitação técnicos e editoriais.
- Métricas de baseline e plano de medição.

**Validação:** outra LLM deve conseguir executar o plano sem voltar a visitar os concorrentes e sem adivinhar dados do negócio.

### FUN-014 / Detetar canibalização por consulta e intenção

**Informação a obter:** clusters para os quais várias URLs próprias alternam ou dividem sinais sem uma finalidade distinta.

**Plano de execução:**

1. Agrupar dados GSC por query cluster, URL e semana.
2. Sinalizar apenas quando duas ou mais URLs:
   - respondem à mesma intenção;
   - recebem impressões relevantes no mesmo mercado;
   - alternam como URL principal ou dividem cliques durante várias observações;
   - possuem conteúdo substancialmente sobreposto.
3. Não classificar como canibalização páginas diferentes que aparecem para intenções diferentes da mesma palavra.
4. Comparar a arquitetura concorrente apenas para perceber se a SERP favorece categoria, produto ou guia; não replicar a sua estrutura automaticamente.
5. Escolher:
   - consolidar conteúdo e aplicar 301;
   - manter ambas e diferenciar intenção, title, H1 e links;
   - corrigir canonical/hreflang;
   - alterar links internos para evidenciar a página principal;
   - não agir quando as URLs ocupam resultados complementares.

**Saída obrigatória:** cluster, URLs envolvidas, evidência temporal, intenção, decisão, redirects/links a alterar e riscos.

**Validação:** confirmar status, canonical e conteúdo antes de propor redirect; nunca eliminar uma URL com conversões, backlinks ou intenção própria sem plano de preservação.

### FUN-015 / Monitorizar posições, concorrentes e Share of Voice

**Informação a obter:** evolução do projeto e dos concorrentes para um conjunto estável de oportunidades.

**Plano de execução:**

1. Selecionar um conjunto representativo de keywords aprovadas, etiquetadas por cluster, intenção, categoria e mercado.
2. Recolher SERPs por fornecedor autorizado na mesma localização, idioma e dispositivo, diariamente para termos críticos ou semanalmente para os restantes.
3. Guardar posição orgânica, URL, funcionalidades SERP, concorrentes visíveis e data. Não misturar desktop, mobile ou países.
4. Estimar cliques por keyword com <code>estimated_clicks = search_volume × CTR_curve(position, device, SERP_features)</code>.
5. Calcular <code>share_of_voice = estimated_clicks_target / estimated_clicks_all_results</code> para o conjunto rastreado. Tratar SoV como estimativa dependente da lista e da curva de CTR.
6. Comparar com cliques e impressões reais do GSC; diferenças são esperadas porque o concorrente e o volume são estimados.
7. Criar alertas para:
   - entrada/saída do Top 3, 10 ou 20;
   - mudança da URL posicionada;
   - novo concorrente recorrente;
   - perda de SERP feature;
   - crescimento ou queda de SoV;
   - alteração de title, canonical ou status da própria página.
8. Exigir duas observações consecutivas para alertas não críticos, reduzindo ruído de SERP.

**Saída obrigatória:** histórico de posição, landing URL, concorrentes, SoV por cluster e alertas explicados.

**Validação:** o relatório deve mostrar a lista de keywords que compõe o SoV; alterar a lista cria uma nova série, não uma continuação silenciosa.

**Referências:** [Ahrefs — concorrentes no Rank Tracker](https://help.ahrefs.com/en/articles/1329389-how-to-add-and-manage-competitor-websites-to-your-projects) e [Ahrefs — cálculo do Share of Voice](https://help.ahrefs.com/pt/articles/2072381-o-que-e-share-of-voice-sov-e-como-ele-e-calculado).

### FUN-016 / Validar alterações e aprender com os resultados

**Informação a obter:** se uma implementação foi publicada corretamente e se os sinais observados melhoraram.

**Plano de execução:**

1. Antes da alteração, guardar:
   - URL e hash da página;
   - data;
   - queries/cluster;
   - indexabilidade e problemas do catálogo;
   - impressões, clicks, CTR, posição, conversões e SoV;
   - concorrentes e SERP;
   - eventos externos conhecidos.
2. Depois do deploy, validar imediatamente HTTP, canonical, robots, HTML renderizado, links, schema, sitemap e conteúdo visível.
3. Registar a data em <code>change_annotation</code>. Não atribuir resultados anteriores à alteração.
4. Comparar janelas de 28 dias com o período anterior equivalente; para baixa procura ou sazonalidade, usar 56/84 dias e comparação anual quando disponível.
5. Segmentar por query cluster, página, país e dispositivo. Não usar apenas tráfego total do domínio.
6. Verificar atualizações do Google, sazonalidade, alterações de procura, migrações, stock e campanhas que possam explicar o resultado.
7. Quando possível, comparar com páginas ou clusters semelhantes não alterados; não tratar a correlação temporal como causalidade certa.
8. Classificar o resultado:
   - <code>validated_technical</code>: implementação correta, ainda sem dados suficientes;
   - <code>positive</code>: melhoria consistente nas métricas-alvo;
   - <code>neutral</code>: sem mudança material;
   - <code>negative</code>: queda consistente associada;
   - <code>confounded</code>: fatores externos impedem conclusão.
9. Manter, refinar ou reverter apenas com base em evidência e risco. Reversões devem preservar dados, redirects e compatibilidade.

**Saída obrigatória:** relatório antes/depois, limitações, decisão e próximo teste.

**Referências:** [Google — investigar quedas de tráfego](https://developers.google.com/search/docs/monitor-debug/debugging-search-traffic-drops) e [Google — combinar Search Console e Analytics](https://developers.google.com/search/docs/monitor-debug/google-analytics-search-console).

### FUN-017 / Orquestrar a análise competitiva completa

**Informação a obter:** um backlog final, executável e continuamente atualizado.

**Sequência obrigatória:**

1. Executar FUN-001 para fixar âmbito e valor comercial.
2. Executar FUN-002 para obter procura e desempenho próprios.
3. Executar FUN-003; se a cobertura for insuficiente, completar com FUN-004.
4. Confirmar três a cinco concorrentes diretos e conservar concorrentes SERP relevantes numa lista separada.
5. Executar FUN-005 e FUN-006 para construir portfólios e gaps.
6. Para cada cluster candidato, executar FUN-007 antes de decidir o tipo de página.
7. Para oportunidades relevantes, executar FUN-008, FUN-009 e FUN-010.
8. Executar FUN-011 apenas para páginas e recursos que já tenham valor citável ou cujo plano inclua criá-lo.
9. Executar FUN-012 e selecionar um lote pequeno que a equipa consiga implementar e medir; não aprovar milhares de keywords em simultâneo.
10. Executar FUN-013 para cada oportunidade aprovada e FUN-014 quando existirem várias URLs próprias.
11. Integrar FUN-018 no pipeline de publicação para notificar URLs criadas, alteradas, movidas ou eliminadas logo depois de ficarem disponíveis em produção.
12. Depois da implementação, iniciar FUN-015 e FUN-016.

**Saída obrigatória — formato do backlog final:**

- <code>opportunity_id</code>.
- Mercado, cluster, intenção e tipo de página esperado.
- URL própria atual ou nova URL proposta.
- Concorrentes e URLs de evidência.
- Classe: quick win, improve, consolidate, create, authority ou ignore.
- Diagnóstico factual.
- Hipóteses separadas.
- Problemas do catálogo associados.
- Mudanças P0/P1/P2.
- Dados que o negócio precisa fornecer.
- Critérios de aceitação.
- Priority score e respetivos componentes.
- Esforço: pequeno, médio ou grande, acompanhado de dependências concretas.
- Confidence e limitações.
- Métricas de baseline, data de publicação e estado.

**Estados permitidos:**

<code>discovered → validated → approved → implementing → deployed → measuring → positive | neutral | negative | confounded | rejected</code>.

**Definição de concluído:** a oportunidade só termina quando a alteração está validada tecnicamente, existe baseline, decorreu uma janela de medição apropriada e foi registada uma decisão. Publicar conteúdo ou alterar código não é, por si só, conclusão.

**Princípio final:** utilizar concorrentes para descobrir necessidades, padrões e níveis de qualidade já demonstrados nas SERPs; não assumir que tudo o que fazem é correto, não copiar os seus ativos e não implementar uma técnica sem evidência, utilidade e forma de medição.

### FUN-018 / Implementar IndexNow em qualquer infraestrutura de publicação

**Prioridade de implementação:** crítica e transversal. Deve fazer parte do mecanismo de publicação, independentemente de o projeto usar Cloudflare, Vercel, outro CDN, alojamento tradicional, CMS ou servidor próprio. Esta prioridade refere-se à distribuição rápida de alterações; IndexNow não é um fator de ranking e não substitui qualidade, indexabilidade, sitemaps ou links internos.

**Informação a obter:** quais URLs mudaram realmente, quando ficaram acessíveis em produção, que evento ocorreu e se os motores participantes receberam a notificação.

**Objetivos:**

- Notificar rapidamente criação, alteração relevante, mudança e eliminação de URLs.
- Reduzir o intervalo entre uma alteração real e a sua descoberta pelos motores participantes.
- Evitar submissões indiscriminadas, repetidas, prematuras ou de URLs que não deveriam ser indexadas.
- Manter uma implementação única e portátil entre fornecedores de infraestrutura.

**Participação e limites:**

- Usar [IndexNow.org](https://www.indexnow.org/) como documentação normativa e <code>https://api.indexnow.org/indexnow</code> como endpoint global.
- A lista oficial de participantes deve ser lida de <code>https://www.indexnow.org/searchengines.json</code> e guardada com data. Não assumir que Google ou qualquer outro motor participa sem constar dessa lista.
- Uma submissão apenas notifica uma alteração. Resposta 200 ou 202 não garante crawling, indexação, rich result, posição ou tráfego.
- Não usar <code>indexnow.com</code> como dependência: é um serviço de terceiros e não é necessário para implementar o protocolo.

**Arquitetura obrigatória independente da plataforma:**

1. Criar um produtor de eventos junto da fonte que conhece a alteração: CMS, base de produtos, painel editorial, pipeline de importação ou processo de deploy.
2. Representar cada evento com:
   - <code>event_id</code>;
   - <code>event_type</code>: create, update, move, delete ou deindex;
   - URL anterior e URL atual;
   - canonical esperada;
   - hash do conteúdo anterior e atual;
   - campos alterados;
   - ambiente;
   - data do evento;
   - origem.
3. Enviar eventos para uma fila ou tabela durável. Não depender de uma chamada externa durante a transação que grava o produto ou conteúdo.
4. Processar apenas depois de a versão de produção estar disponível. Antes do envio, pedir a URL e validar status, canonical, robots, conteúdo visível e host.
5. Deduplicar por <code>canonical + event_type + content_hash</code>. Uma nova alteração cria novo evento; retries da mesma alteração conservam o mesmo <code>event_id</code>.
6. Agrupar URLs do mesmo host em lotes até 10.000, embora lotes pequenos sejam preferíveis para reduzir atraso e facilitar retries.
7. Enviar um POST JSON ao endpoint oficial com <code>host</code>, <code>key</code>, <code>keyLocation</code> quando necessário e <code>urlList</code>.
8. Guardar payload normalizado, endpoint, data, código HTTP, número de tentativas, próxima tentativa e resultado final.
9. Aplicar retries:
   - 200: recebido; concluir a submissão.
   - 202: recebido e validação da chave pendente; concluir a chamada e verificar integração.
   - 400: corrigir o formato; não repetir o mesmo payload.
   - 403: validar chave e ficheiro de verificação.
   - 422: corrigir host, URL, chave ou âmbito.
   - 429: respeitar throttling e repetir com backoff exponencial e jitter.
   - 5xx ou timeout: repetir com backoff limitado.
10. Limitar tentativas e mover falhas permanentes para uma fila de revisão. Nunca executar retry infinito.

**Chave e verificação:**

1. Gerar uma chave própria com 8–128 caracteres aceites pelo protocolo.
2. Preferir o ficheiro UTF-8 na raiz do host: <code>https://host/chave.txt</code>, contendo apenas a chave.
3. Usar <code>keyLocation</code> apenas quando o ficheiro não estiver na raiz; nesse caso, só URLs dentro do âmbito dessa localização podem ser submetidas.
4. Validar que o ficheiro devolve 200, sem redirect, HTML, autenticação, WAF ou transformação.
5. A chave é verificável através de um ficheiro público, mas o endpoint interno que recebe eventos de publicação deve exigir autenticação. Segredos de CMS, CI/CD e webhooks nunca devem aparecer no cliente ou repositório.
6. Permitir rotação da chave sem perder eventos pendentes e conservar histórico de qual chave assinou cada lote.

**Matriz obrigatória de eventos:**

- Página, produto, categoria ou guia novo e indexável: validar produção e enviar a canonical.
- Alteração substancial de conteúdo, title, dados técnicos ou oferta: enviar depois da publicação.
- Mudança real de preço, moeda, stock, disponibilidade, entrega ou devolução: enviar e garantir que HTML, JSON-LD e feed comercial foram atualizados no mesmo ciclo.
- Produto ou conteúdo eliminado: publicar 404/410 e enviar a URL antiga.
- URL movida: publicar 301, enviar URL antiga e nova e atualizar links internos, sitemap e canonical.
- URL que passa de indexável para <code>noindex</code>: publicar a diretiva e enviar como alteração de desindexação.
- URL que remove <code>noindex</code>: validar que é canonical, pública e útil antes de enviar.
- Alteração só de CSS, analytics, scripts sem efeito no conteúdo, build id ou asset hash: não enviar.
- Preview, staging e domínio de deploy temporário: nunca enviar.
- Carrinho, checkout, conta, pesquisa interna, filtros sem landing própria, parâmetros de tracking e URLs duplicadas: nunca enviar.
- URL sem alteração de hash nem campos relevantes: não enviar novamente.

**Adaptação Cloudflare:**

1. Verificar se Crawler Hints está disponível e ativado no domínio. O recurso usa sinais de cache para detetar alterações prováveis e suporta IndexNow.
2. Registar <code>adapter=cloudflare_crawler_hints</code> e evitar uma segunda submissão genérica das mesmas URLs.
3. Para sinais que precisam de precisão de negócio, como preço, stock, 404/410 e mudança de URL, o produtor de eventos pode usar envio direto. Deve consultar o log de deduplicação para não repetir uma notificação já emitida.
4. Não assumir que um cache MISS equivale sempre a alteração editorial. A fonte de produtos continua a ser a autoridade para eventos comerciais.

**Adaptação Vercel:**

1. Implementar o produtor no CMS, base de dados ou processo que conhece as URLs alteradas.
2. Enviar os eventos para uma Vercel Function, serviço externo ou fila durável autenticada.
3. Para sites estáticos, conservar durante o build um manifesto das canonical URLs criadas, alteradas, movidas e eliminadas.
4. Processar o manifesto apenas depois de o deployment de produção estar pronto. Um webhook de deployment pode servir de gatilho, mas não identifica sozinho que páginas mudaram.
5. Excluir deployments Preview e URLs temporárias <code>vercel.app</code>; usar apenas o domínio canonical de produção.
6. Verificar a assinatura dos webhooks Vercel quando forem usados e manter o segredo fora do código.
7. Deploy Hooks servem para iniciar um deployment por evento externo; não devem ser confundidos com submissão IndexNow nem usados como inventário de URLs alteradas.

**Adaptação a outros hosts e CMS:**

1. Usar integração nativa ou plugin apenas se permitir logs, filtros de canonical, deduplicação e envio no momento certo.
2. Num servidor próprio, executar o consumidor da fila depois da transação de publicação ou como job assíncrono.
3. Em CI/CD, gerar o manifesto por comparação entre a versão publicada anterior e a nova e submetê-lo somente depois do health check de produção.
4. Em e-commerce externo, usar webhooks de produto/stock/preço e resolver o identificador interno para a canonical pública.
5. A interface do adaptador deve ser estável: <code>publishChangedUrls(events)</code>. Trocar Cloudflare, Vercel ou outro host não deve alterar as regras de seleção de URLs.

**Saída obrigatória:**

- <code>indexnow_config</code>: host, key location, adaptador, endpoint, ambientes permitidos e estado.
- <code>indexnow_event_log</code>: evento, URL, canonical, hash, motivo, origem e data.
- <code>indexnow_submission_log</code>: lote, payload hash, resposta, tentativas e estado.
- Métricas: eventos recebidos, deduplicados, rejeitados, enviados, aceites e falhados; atraso entre publicação e submissão; distribuição por tipo de evento.
- Alertas para chave inacessível, excesso de 403/422/429, fila atrasada, submissões de staging e divergência entre URL enviada e canonical.

**Validação de implementação:**

1. Publicar uma URL de teste indexável e confirmar ficheiro da chave, evento, lote e resposta 200/202.
2. Atualizar a mesma URL sem mudança relevante e confirmar deduplicação.
3. Alterar conteúdo relevante e confirmar nova submissão.
4. Mover uma URL e confirmar 301, submissão da antiga e nova, sitemap e links.
5. Eliminar uma URL e confirmar 404/410 e notificação.
6. Simular 400, 403, 422, 429 e timeout para testar classificação e retries.
7. Confirmar no Bing Webmaster Tools a receção de amostras e acompanhar crawling/indexação separadamente da submissão.

**Critério de conclusão:** a função está concluída quando qualquer publicação relevante gera, em produção, um evento deduplicado e auditável; o endpoint oficial recebe o lote; falhas são recuperáveis; staging e URLs inválidas são bloqueados; e a troca de Cloudflare por Vercel ou outro host exige apenas mudar o adaptador.

**Referências:** [IndexNow — protocolo e lote até 10.000 URLs](https://www.indexnow.org/documentation), [IndexNow — momentos recomendados para notificar](https://www.indexnow.org/faq), [participantes atuais](https://www.indexnow.org/searchengines.json), [Bing Webmaster Tools — IndexNow](https://www.bing.com/webmasters/help/indexnow-0z209wby), [Cloudflare Crawler Hints](https://developers.cloudflare.com/cache/advanced-configuration/crawler-hints/), [Vercel Webhooks](https://vercel.com/docs/webhooks) e [Vercel Deploy Hooks](https://vercel.com/docs/deploy-hooks).

### FUN-019 / Autorizar temporariamente o Google Search Console no início de uma auditoria

**Finalidade:** permitir que uma LLM obtenha dados reais de desempenho, propriedades, sitemaps e inspeção de URLs durante uma auditoria única. A autorização é opcional: a recusa ou indisponibilidade do Search Console nunca deve impedir a auditoria técnica do código e do site.

**Endpoint de início configurado:** [Autorizar acesso de leitura ao Google Search Console](https://seo-gsc-oauth.support-e04.workers.dev/oauth/start).

**Comportamento obrigatório da LLM:**

1. No início da auditoria, depois de confirmar o domínio e antes de iniciar consultas dependentes do Search Console, apresentar ao utilizador o endpoint de início configurado como link clicável.
2. Explicar numa frase que a ligação é opcional, solicita apenas leitura e serve para consultar dados que não podem ser inferidos do código ou de um crawl externo.
3. Não construir nem enviar diretamente uma URL de `accounts.google.com`. A LLM deve enviar apenas o endpoint `/oauth/start`; o Worker gera um `state` aleatório com validade curta, constrói o pedido Google e efetua o redirecionamento.
4. Pedir ao utilizador para abrir o link, escolher a conta Google que tem acesso à propriedade e concluir o consentimento. Nunca pedir palavra-passe, código de autorização, access token, refresh token, client secret ou captura contendo esses valores.
5. Continuar trabalho que não dependa do GSC enquanto o utilizador autoriza. Depois da confirmação, verificar a ligação através do endpoint de estado protegido e selecionar a propriedade cujo domínio canonical corresponde ao projeto; não escolher uma propriedade apenas por semelhança textual.
6. Usar os dados GSC somente para os módulos aplicáveis: consultas, páginas, países, dispositivos, impressões, cliques, CTR, posição média, sitemaps e URL Inspection. Não afirmar que a API fornece todos os relatórios agregados da interface, ações manuais, segurança, Core Web Vitals ou todos os detalhes de Product snippets e Merchant listings.
7. Se a autorização for recusada, expirar ou falhar, prosseguir com a auditoria e classificar apenas as verificações exclusivamente dependentes do GSC como `Não verificável — acesso GSC não fornecido`. Não classificar a ausência de dados como aprovação nem como erro do site.

**Funcionamento entre computadores:**

- O fluxo funciona em qualquer computador ou dispositivo com navegador e acesso ao Google porque o callback e o armazenamento dos tokens pertencem ao Worker remoto, não ao computador onde a auditoria foi iniciada.
- O callback autorizado no cliente Google deve corresponder exatamente a `https://seo-gsc-oauth.support-e04.workers.dev/oauth/callback`. Alterar computador, navegador ou rede não exige outro callback.
- A conta Google escolhida precisa de ter permissão na propriedade Search Console. Se a aplicação OAuth externa estiver em estado `Testing`, a conta também precisa de constar na lista de utilizadores de teste.
- A implementação atual conserva uma ligação Google de cada vez. Uma nova autorização substitui a ligação anterior; não deve ser apresentada como sistema multiutilizador ou multitenant.
- Numa aplicação OAuth externa em `Testing`, o refresh token normalmente expira em sete dias quando são pedidos scopes além de identidade básica. Isto é suficiente para uma auditoria pontual; se necessário, repetir `/oauth/start` numa auditoria posterior.

**Âmbito e segurança obrigatórios:**

- Pedir exclusivamente `https://www.googleapis.com/auth/webmasters.readonly`. Não pedir `webmasters` com escrita para uma auditoria.
- Manter `GOOGLE_CLIENT_SECRET`, chave de cifragem e chave de acesso aos relatórios apenas como secrets do servidor. O client secret e os tokens nunca podem entrar nesta documentação, no repositório, numa mensagem da LLM ou num parâmetro de URL.
- Guardar access e refresh tokens cifrados no servidor. Enviar tokens às APIs Google apenas no cabeçalho `Authorization: Bearer`; nunca em query strings.
- Proteger `/oauth/status`, `/gsc/investigate` e qualquer endpoint que devolva propriedades ou dados com autenticação própria ou Cloudflare Access. O link `/oauth/start` pode ser partilhado com o utilizador autorizado, mas não deve conceder acesso direto aos relatórios.
- Validar `state` uma única vez e com expiração curta antes de trocar o código. O `redirect_uri` usado na autorização e na troca do código deve ser idêntico ao callback registado.
- Não incluir segredos num link enviado pela LLM. Quando o endpoint de relatórios exigir uma chave, a LLM só pode usá-la através de um secret do ambiente e num cabeçalho; se não existir um canal seguro, pedir exportações do GSC.
- No fim da auditoria, informar que o utilizador pode revogar a autorização na página de ligações da Conta Google. A revogação não elimina relatórios já exportados, que devem seguir a política de retenção da auditoria.

**Mensagem inicial esperada da LLM:**

> O acesso ao Search Console é opcional, mas permite confirmar consultas, impressões, cliques, sitemaps e o estado que o Google atribui às URLs. Para ligar temporariamente em modo de leitura, abre [Autorizar acesso ao Google Search Console](https://seo-gsc-oauth.support-e04.workers.dev/oauth/start), escolhe a conta que gere o domínio e diz-me quando aparecer “Search Console ligado”. Entretanto, continuo a auditoria técnica que não depende do GSC.

**Critério de conclusão:** a autorização está concluída quando o callback validou o `state`, o Worker trocou o código sem expor tokens, a API listou a propriedade esperada e a LLM confirmou que essa propriedade corresponde ao domínio auditado. A auditoria continua sem GSC quando qualquer uma destas condições não puder ser satisfeita.

**Referências:** [Google — OAuth 2.0 para aplicações web](https://developers.google.com/identity/protocols/oauth2/web-server), [Google — expiração e revogação de refresh tokens](https://developers.google.com/identity/protocols/oauth2), [Google Search Console API — autorização e scope de leitura](https://developers.google.com/webmaster-tools/v1/how-tos/authorizing) e [Google Search Console API — limites funcionais](https://developers.google.com/webmaster-tools/v1/api_reference_index).
