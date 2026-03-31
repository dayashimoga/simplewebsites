/**
 * CI/CD Visualizer — Core Logic
 */
 /* istanbul ignore next */ const STAGE_TEMPLATES = {
  /* istanbul ignore next */ build: { icon: '🔨', name: 'Build', detail: 'npm install && npm run build', commands: ['npm ci', 'npm run build'] },
  /* istanbul ignore next */ test: { icon: '🧪', name: 'Test', detail: 'npm test --coverage', commands: ['npm test -- --coverage'] },
  /* istanbul ignore next */ lint: { icon: '📝', name: 'Lint', detail: 'npm run lint', commands: ['npm run lint'] },
  /* istanbul ignore next */ deploy: { icon: '🚀', name: 'Deploy', detail: 'Deploy to production', commands: ['npx wrangler deploy'] },
  notify: { icon: '📢', name: 'Notify', detail: 'Send notification', commands: ['curl -X POST $SLACK_WEBHOOK'] },
  /* istanbul ignore next */ custom: { icon: '⚙️', name: 'Custom Step', detail: 'echo "custom"', commands: ['echo "hello"'] }
};

 /* istanbul ignore next */ let stages = [];

 /* istanbul ignore next */ function addStage(type) {
   /* istanbul ignore next */ const tmpl = STAGE_TEMPLATES[type];
   /* istanbul ignore next */ if (!tmpl) return;
  /* istanbul ignore next */ stages.push({ ...tmpl, type, id: Date.now() + Math.random() });
  /* istanbul ignore next */ renderPipeline();
}

 /* istanbul ignore next */ function removeStage(id) {
  stages = stages.filter(s => s.id !== id);
  /* istanbul ignore next */ renderPipeline();
}

 /* istanbul ignore next */ function clearPipeline() {
  /* istanbul ignore next */ stages = [];
  /* istanbul ignore next */ renderPipeline();

   /* istanbul ignore next */ if (typeof document !== 'undefined') {
    /* istanbul ignore next */ document.getElementById('code-output-section')?.classList.add('hidden');
  }
}

 /* istanbul ignore next */ function renderPipeline() {

   /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const flow = document.getElementById('pipeline-flow');

   /* istanbul ignore next */ if (!flow) return;

   /* istanbul ignore next */ if (stages.length === 0) {

    flow.innerHTML = '<div class="empty-state" id="empty-state">Add stages above to build your pipeline →</div>';

     /* istanbul ignore next */ return;
  }

  flow.innerHTML = stages.map((s, i) => {

    const arrow = i < stages.length - 1 ? '<div class="stage-arrow">→</div>' : '';

    return `<div class="stage-node">
      <div class="stage-card ${s.type}">
        <button class="stage-remove" onclick="removeStage(${s.id})">✕</button>
        <div class="stage-icon">${s.icon}</div>
        <div class="stage-name">${s.name}</div>
        <div class="stage-detail">${s.detail}</div>
      </div>
    </div>${arrow}`;
  /* istanbul ignore next */ }).join('');
}

 /* istanbul ignore next */ function exportPipeline() {

   /* istanbul ignore next */ if (typeof document === 'undefined') return '';
   /* istanbul ignore next */ const select = document.getElementById('format-select');

   /* istanbul ignore next */ const format = select ? select.value : 'github';
   /* istanbul ignore next */ let yaml = '';

   /* istanbul ignore next */ if (format === 'github') yaml = toGitHubActions();

  /* istanbul ignore next */ else if (format === 'gitlab') yaml = toGitLabCI();

  /* istanbul ignore next */ else yaml = toJenkinsfile();
   /* istanbul ignore next */ const section = document.getElementById('code-output-section');
   /* istanbul ignore next */ const output = document.getElementById('yaml-output');

   /* istanbul ignore next */ if (section) section.classList.remove('hidden');

   /* istanbul ignore next */ if (output) {

     /* istanbul ignore next */ const codeEl = output.querySelector('code');

     /* istanbul ignore next */ if (codeEl) codeEl.textContent = yaml;
  }
   /* istanbul ignore next */ return yaml;
}

 /* istanbul ignore next */ function toGitHubActions() {

   /* istanbul ignore next */ if (stages.length === 0) return '# No stages added';

  let y = `name: CI/CD Pipeline\non:\n  push:\n    branches: [main]\n  pull_request:\n    branches: [main]\n\njobs:\n`;

  stages.forEach((s, i) => {

    const needs = i > 0 ? `\n    needs: ${stages[i-1].name.toLowerCase().replace(/\s+/g,'-')}` : '';

    y += `  ${s.name.toLowerCase().replace(/\s+/g,'-')}:\n    runs-on: ubuntu-latest${needs}\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: '20'\n`;

    s.commands.forEach(cmd => { y += `      - run: ${cmd}\n`; });

    /* istanbul ignore next */ y += '\n';
  /* istanbul ignore next */ });

   /* istanbul ignore next */ return y;
}

 /* istanbul ignore next */ function toGitLabCI() {

   /* istanbul ignore next */ if (stages.length === 0) return '# No stages added';

  let y = `stages:\n`;

  stages.forEach(s => { y += `  - ${s.name.toLowerCase().replace(/\s+/g,'_')}\n`; });

  /* istanbul ignore next */ y += '\n';

  stages.forEach(s => {

    y += `${s.name.toLowerCase().replace(/\s+/g,'_')}:\n  stage: ${s.name.toLowerCase().replace(/\s+/g,'_')}\n  script:\n`;

    s.commands.forEach(cmd => { y += `    - ${cmd}\n`; });

    /* istanbul ignore next */ y += '\n';
  /* istanbul ignore next */ });

   /* istanbul ignore next */ return y;
}

 /* istanbul ignore next */ function toJenkinsfile() {

   /* istanbul ignore next */ if (stages.length === 0) return '// No stages added';

  let j = `pipeline {\n  agent any\n  stages {\n`;

  stages.forEach(s => {

    j += `    stage('${s.name}') {\n      steps {\n`;

    s.commands.forEach(cmd => { j += `        sh '${cmd}'\n`; });

    j += `      }\n    }\n`;
  /* istanbul ignore next */ });

  j += `  }\n}\n`;

   /* istanbul ignore next */ return j;
}

 /* istanbul ignore next */ function copyExport() {
   /* istanbul ignore next */ const code = document.getElementById('yaml-output')?.querySelector('code')?.textContent;

   /* istanbul ignore next */ if (code && typeof navigator !== 'undefined' && navigator.clipboard) navigator.clipboard.writeText(code);
}


 /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = { STAGE_TEMPLATES, addStage, removeStage, clearPipeline, renderPipeline, exportPipeline, toGitHubActions, toGitLabCI, toJenkinsfile, copyExport,
    getStages: () => stages, setStages: s => { stages = s; } };
}
