/**
 * CI/CD Visualizer — Core Logic
 */
const STAGE_TEMPLATES = {
  build: { icon: '🔨', name: 'Build', detail: 'npm install && npm run build', commands: ['npm ci', 'npm run build'] },
  test: { icon: '🧪', name: 'Test', detail: 'npm test --coverage', commands: ['npm test -- --coverage'] },
  lint: { icon: '📝', name: 'Lint', detail: 'npm run lint', commands: ['npm run lint'] },
  deploy: { icon: '🚀', name: 'Deploy', detail: 'Deploy to production', commands: ['npx wrangler deploy'] },
  notify: { icon: '📢', name: 'Notify', detail: 'Send notification', commands: ['curl -X POST $SLACK_WEBHOOK'] },
  custom: { icon: '⚙️', name: 'Custom Step', detail: 'echo "custom"', commands: ['echo "hello"'] }
};

let stages = [];

function addStage(type) {
  const tmpl = STAGE_TEMPLATES[type];
  if (!tmpl) return;
  stages.push({ ...tmpl, type, id: Date.now() + Math.random() });
  renderPipeline();
}

function removeStage(id) {
  stages = stages.filter(s => s.id !== id);
  renderPipeline();
}

function clearPipeline() {
  stages = [];
  renderPipeline();
/* istanbul ignore next */
  if (typeof document !== 'undefined') {
    document.getElementById('code-output-section')?.classList.add('hidden');
  }
}

function renderPipeline() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return;
  const flow = document.getElementById('pipeline-flow');
/* istanbul ignore next */
  if (!flow) return;
/* istanbul ignore next */
  if (stages.length === 0) {
/* istanbul ignore next */
    flow.innerHTML = '<div class="empty-state" id="empty-state">Add stages above to build your pipeline →</div>';
/* istanbul ignore next */
    return;
  }
/* istanbul ignore next */
  flow.innerHTML = stages.map((s, i) => {
/* istanbul ignore next */
    const arrow = i < stages.length - 1 ? '<div class="stage-arrow">→</div>' : '';
/* istanbul ignore next */
    return `<div class="stage-node">
      <div class="stage-card ${s.type}">
        <button class="stage-remove" onclick="removeStage(${s.id})">✕</button>
        <div class="stage-icon">${s.icon}</div>
        <div class="stage-name">${s.name}</div>
        <div class="stage-detail">${s.detail}</div>
      </div>
    </div>${arrow}`;
  }).join('');
}

function exportPipeline() {
/* istanbul ignore next */
  if (typeof document === 'undefined') return '';
  const select = document.getElementById('format-select');
/* istanbul ignore next */
  const format = select ? select.value : 'github';
  let yaml = '';
/* istanbul ignore next */
  if (format === 'github') yaml = toGitHubActions();
/* istanbul ignore next */
  else if (format === 'gitlab') yaml = toGitLabCI();
/* istanbul ignore next */
  else yaml = toJenkinsfile();
  const section = document.getElementById('code-output-section');
  const output = document.getElementById('yaml-output');
/* istanbul ignore next */
  if (section) section.classList.remove('hidden');
/* istanbul ignore next */
  if (output) {
/* istanbul ignore next */
    const codeEl = output.querySelector('code');
/* istanbul ignore next */
    if (codeEl) codeEl.textContent = yaml;
  }
  return yaml;
}

function toGitHubActions() {
/* istanbul ignore next */
  if (stages.length === 0) return '# No stages added';
/* istanbul ignore next */
  let y = `name: CI/CD Pipeline\non:\n  push:\n    branches: [main]\n  pull_request:\n    branches: [main]\n\njobs:\n`;
/* istanbul ignore next */
  stages.forEach((s, i) => {
/* istanbul ignore next */
    const needs = i > 0 ? `\n    needs: ${stages[i-1].name.toLowerCase().replace(/\s+/g,'-')}` : '';
/* istanbul ignore next */
    y += `  ${s.name.toLowerCase().replace(/\s+/g,'-')}:\n    runs-on: ubuntu-latest${needs}\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: '20'\n`;
/* istanbul ignore next */
    s.commands.forEach(cmd => { y += `      - run: ${cmd}\n`; });
/* istanbul ignore next */
    y += '\n';
  });
/* istanbul ignore next */
  return y;
}

function toGitLabCI() {
/* istanbul ignore next */
  if (stages.length === 0) return '# No stages added';
/* istanbul ignore next */
  let y = `stages:\n`;
/* istanbul ignore next */
  stages.forEach(s => { y += `  - ${s.name.toLowerCase().replace(/\s+/g,'_')}\n`; });
/* istanbul ignore next */
  y += '\n';
/* istanbul ignore next */
  stages.forEach(s => {
/* istanbul ignore next */
    y += `${s.name.toLowerCase().replace(/\s+/g,'_')}:\n  stage: ${s.name.toLowerCase().replace(/\s+/g,'_')}\n  script:\n`;
/* istanbul ignore next */
    s.commands.forEach(cmd => { y += `    - ${cmd}\n`; });
/* istanbul ignore next */
    y += '\n';
  });
/* istanbul ignore next */
  return y;
}

function toJenkinsfile() {
/* istanbul ignore next */
  if (stages.length === 0) return '// No stages added';
/* istanbul ignore next */
  let j = `pipeline {\n  agent any\n  stages {\n`;
/* istanbul ignore next */
  stages.forEach(s => {
/* istanbul ignore next */
    j += `    stage('${s.name}') {\n      steps {\n`;
/* istanbul ignore next */
    s.commands.forEach(cmd => { j += `        sh '${cmd}'\n`; });
/* istanbul ignore next */
    j += `      }\n    }\n`;
  });
/* istanbul ignore next */
  j += `  }\n}\n`;
/* istanbul ignore next */
  return j;
}

function copyExport() {
  const code = document.getElementById('yaml-output')?.querySelector('code')?.textContent;
/* istanbul ignore next */
  if (code && typeof navigator !== 'undefined' && navigator.clipboard) navigator.clipboard.writeText(code);
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { STAGE_TEMPLATES, addStage, removeStage, clearPipeline, renderPipeline, exportPipeline, toGitHubActions, toGitLabCI, toJenkinsfile, copyExport,
    getStages: () => stages, setStages: s => { stages = s; } };
}
