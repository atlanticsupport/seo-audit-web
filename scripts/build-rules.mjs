import { readFile, writeFile } from 'node:fs/promises';

const catalog = await readFile(new URL('../docs/seo-audit-catalogo-unificado.md', import.meta.url), 'utf8');
const matrix = await readFile(new URL('../docs/seo-automacao-406-pontos.md', import.meta.url), 'utf8');
const classA = matrix.slice(matrix.indexOf('## Classe A'), matrix.indexOf('## Classe B'));
const directCodes = new Set(classA.match(/\b[A-Z]{2,4}-\d{3}\b/g).filter(code => !code.startsWith('FUN-')));
const headings = [...catalog.matchAll(/^(## Categoria: (?<category>.+)|### (?<code>[A-Z]{2,4}-\d{3}) \/ (?<name>.+))$/gm)];
let category = '';
const rules = [];

for (let index = 0; index < headings.length; index++) {
  const heading = headings[index];
  if (heading.groups.category) {
    category = heading.groups.category.trim();
    continue;
  }
  if (!directCodes.has(heading.groups.code)) continue;

  const end = headings.find(item => item.index > heading.index)?.index ?? catalog.length;
  const block = catalog.slice(heading.index + heading[0].length, end);
  const details = block.match(/\*\*Detalhes do problema:\*\*\s*([\s\S]*?)\s*\*\*Solução:\*\*/)?.[1];
  const solution = block.match(/\*\*Solução:\*\*\s*([\s\S]*)/)?.[1];
  if (!details || !solution) throw new Error(`Bloco incompleto: ${heading.groups.code}`);
  rules.push({
    code: heading.groups.code,
    name: clean(heading.groups.name),
    category,
    details: clean(details),
    solution: clean(solution)
  });
}

if (rules.length !== 288) throw new Error(`Esperados 288 problemas diretos; encontrados ${rules.length}.`);

const output = `// Gerado a partir de docs/seo-audit-catalogo-unificado.md. Não editar.\nexport const RULES = ${JSON.stringify(rules, null, 2)};\n`;
await writeFile(new URL('../functions/_lib/rules.generated.js', import.meta.url), output);
await writeFile(new URL('../public/rules.json', import.meta.url), `${JSON.stringify(rules, null, 2)}\n`);

console.log(`${rules.length} regras diretas geradas.`);

function clean(value) {
  return value
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[`*_>#]/g, '')
    .replace(/^\s*[-+]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}
