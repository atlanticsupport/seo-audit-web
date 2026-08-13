const form = document.querySelector('#audit-form');
const input = document.querySelector('#url');
const button = form.querySelector('button');
const status = document.querySelector('#status');
const summary = document.querySelector('#summary');
const results = document.querySelector('#results');

const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();

function showStatus(message, error = false) {
  status.hidden = !message;
  status.textContent = message;
  status.classList.toggle('error', error);
}

function tooltip(rule) {
  const help = document.createElement('button');
  help.type = 'button';
  help.className = 'help';
  help.setAttribute('aria-label', `Detalhes de ${rule.name}`);
  help.textContent = '?';

  const tip = document.createElement('span');
  tip.className = 'tooltip';
  const detailTitle = document.createElement('strong');
  detailTitle.textContent = 'Detalhes';
  const detail = document.createElement('span');
  detail.textContent = clean(rule.details);
  const solutionTitle = document.createElement('strong');
  solutionTitle.textContent = 'Solução';
  const solution = document.createElement('span');
  solution.textContent = clean(rule.solution);
  tip.append(detailTitle, detail, solutionTitle, solution);
  help.append(tip);
  return help;
}

function render(data) {
  results.replaceChildren();
  const groups = new Map();
  for (const item of data.results) groups.set(item.category, [...(groups.get(item.category) ?? []), item]);

  for (const [category, rules] of groups) {
    const heading = document.createElement('h2');
    heading.className = 'category';
    heading.textContent = category;
    results.append(heading);

    for (const rule of rules) {
      const row = document.createElement('article');
      row.className = 'row';
      const name = document.createElement('div');
      name.className = 'name';
      const code = document.createElement('span');
      code.className = 'code';
      code.textContent = rule.code;
      name.append(code, document.createTextNode(rule.name));
      const indicator = document.createElement('span');
      indicator.className = `switch ${rule.ok ? 'pass' : 'fail'}`;
      indicator.setAttribute('role', 'img');
      indicator.setAttribute('aria-label', rule.ok ? 'Certo' : 'Problema encontrado');
      row.append(name, indicator, tooltip(rule));
      results.append(row);
    }
  }

  summary.hidden = false;
  summary.replaceChildren();
  const parts = [
    [`${data.summary.passed}`, ' certos'],
    [`${data.summary.failed}`, ' com problema'],
    [`${data.summary.checked}`, ' verificados'],
    [`${data.pagesScanned}`, ' páginas lidas'],
    [`${data.supportedDetectors}`, ' detetores disponíveis']
  ];
  for (const [value, label] of parts) {
    const item = document.createElement('span');
    const strong = document.createElement('strong');
    strong.textContent = value;
    item.append(strong, document.createTextNode(label));
    summary.append(item);
  }
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  button.disabled = true;
  results.replaceChildren();
  summary.hidden = true;
  showStatus('A recolher páginas, recursos e sinais técnicos…');

  try {
    const response = await fetch('/api/audit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url: input.value })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Não foi possível concluir a auditoria.');
    render(data);
    showStatus(`Auditoria concluída para ${data.url}.${data.sampled ? ` Site amplo: resultados limitados a ${data.limits.pages} páginas e aos recursos descobertos nessa amostra.` : ''}`);
  } catch (error) {
    showStatus(error instanceof Error ? error.message : 'Erro inesperado.', true);
  } finally {
    button.disabled = false;
  }
});
