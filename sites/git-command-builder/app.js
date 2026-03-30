/**
 * Git Command Builder Logic
 */

const TASKS = {
  'commit-amend': {
    desc: 'Updates the previous commit with the new message (and any currently staged files).',
    fields: [
      { id: 'msg', label: 'New Commit Message', type: 'text', placeholder: 'Fix typos in readme' }
    ],
    generate: (vals) => {
      const msg = vals.msg ? ` -m "${vals.msg}"` : '';
      return `git commit --amend${msg}`;
    }
  },
  'undo-commit': {
    desc: 'Removes the last commit but keeps your changed files in your working directory.',
    fields: [
      { id: 'count', label: 'How many commits to undo?', type: 'number', val: '1', min: '1' }
    ],
    generate: (vals) => `git reset HEAD~${vals.count || 1}`
  },
  'hard-reset': {
    desc: 'DANGER: Completely destroys any changes you have made that are not safely committed.',
    fields: [],
    generate: () => `git reset --hard HEAD`
  },
  'stash-save': {
    desc: 'Saves your uncommitted changes so you can work on something else.',
    fields: [
      { id: 'msg', label: 'Stash Message (optional)', type: 'text', placeholder: 'WIP on navbar' },
      { id: 'untracked', label: 'Include untracked (new) files?', type: 'checkbox', val: false }
    ],
    generate: (vals) => {
      const u = vals.untracked ? ' -u' : '';
      const m = vals.msg ? ` -m "${vals.msg}"` : '';
      return `git stash push${u}${m}`;
    }
  },
  'stash-pop': {
    desc: 'Applies your most recent stash and removes it from the stash list.',
    fields: [],
    generate: () => `git stash pop`
  },
  'delete-branch-local': {
    desc: 'Deletes a branch on your local machine.',
    fields: [
      { id: 'branch', label: 'Branch Name', type: 'text', placeholder: 'feature/old-ui' },
      { id: 'force', label: 'Force delete (even if unmerged)?', type: 'checkbox', val: false }
    ],
    generate: (vals) => `git branch ${vals.force ? '-D' : '-d'} ${vals.branch || '<branch_name>'}`
  },
  'delete-branch-remote': {
    desc: 'Deletes a branch on the remote server (e.g., GitHub).',
    fields: [
      { id: 'remote', label: 'Remote Name', type: 'text', val: 'origin' },
      { id: 'branch', label: 'Branch Name', type: 'text', placeholder: 'feature/old-ui' }
    ],
    generate: (vals) => `git push ${vals.remote || 'origin'} --delete ${vals.branch || '<branch_name>'}`
  },
  'new-branch': {
    desc: 'Creates a new branch and immediately checks it out.',
    fields: [
      { id: 'branch', label: 'New Branch Name', type: 'text', placeholder: 'feature/new-ui' }
    ],
    generate: (vals) => `git checkout -b ${vals.branch || '<branch_name>'}`
  },
  'rebase-interactive': {
    desc: 'Opens an editor to let you squash, edit, or reorder the last N commits.',
    fields: [
      { id: 'count', label: 'How many previous commits?', type: 'number', val: '3', min: '2' }
    ],
    generate: (vals) => `git rebase -i HEAD~${vals.count || 3}`
  },
  'cherry-pick': {
    desc: 'Copies a specific commit from another branch into your current branch.',
    fields: [
      { id: 'hash', label: 'Commit Hash', type: 'text', placeholder: 'a1b2c3d' },
      { id: 'no_commit', label: 'Apply changes but don\'t auto-commit?', type: 'checkbox', val: false }
    ],
    generate: (vals) => `git cherry-pick ${vals.no_commit ? '-n ' : ''}${vals.hash || '<commit_hash>'}`
  },
  'log-pretty': {
    desc: 'Shows a neat, colorized graph tree of your commit history.',
    fields: [
      { id: 'limit', label: 'Number of commits to show', type: 'number', val: '10' }
    ],
    generate: (vals) => `git log --graph --oneline --decorate -n ${vals.limit || 10}`
  },
  'rename-branch': {
    desc: 'Renames your current active branch.',
    fields: [
      { id: 'name', label: 'New Branch Name', type: 'text', placeholder: 'feature/better-name' }
    ],
    generate: (vals) => `git branch -m ${vals.name || '<new_name>'}`
  }
};

function init() {
  document.getElementById('task-select')?.addEventListener('change', renderOptions);
  renderOptions();
}

function renderOptions() {
  const taskId = document.getElementById('task-select')?.value;
  if (!taskId || !TASKS[taskId]) return;
  
  const task = TASKS[taskId];
  const container = document.getElementById('options-container');
  if (!container) return;
  
  if (task.fields.length === 0) {
    container.innerHTML = `<p class="text-sm text-dim m-0 italic">No extra options required.</p>`;
  } else {
    container.innerHTML = task.fields.map(f => {
      if (f.type === 'checkbox') {
        return `
          <label class="d-flex align-center gap-2 cursor-pointer text-sm font-bold">
            <input type="checkbox" id="field-${f.id}" ${f.val ? 'checked' : ''} onchange="updateCommand()">
            ${f.label}
          </label>
        `;
      } else {
        const valAttr = f.val ? `value="${f.val}"` : '';
        const placeAttr = f.placeholder ? `placeholder="${f.placeholder}"` : '';
        const minAttr = f.min ? `min="${f.min}"` : '';
        return `
          <div class="form-group">
            <label class="form-label text-sm font-bold">${f.label}</label>
            <input type="${f.type}" id="field-${f.id}" class="input w-full p-2" ${valAttr} ${placeAttr} ${minAttr} oninput="updateCommand()">
          </div>
        `;
      }
    }).join('');
  }
  
  document.getElementById('command-desc').textContent = task.desc;
  updateCommand();
}

function updateCommand() {
  const taskId = document.getElementById('task-select')?.value;
  if (!taskId || !TASKS[taskId]) return;
  
  const task = TASKS[taskId];
  const vals = {};
  
  task.fields.forEach(f => {
    const el = document.getElementById(`field-${f.id}`);
    if (el) {
      vals[f.id] = f.type === 'checkbox' ? el.checked : el.value;
    }
  });
  
  const cmd = task.generate(vals);
  const outEl = document.getElementById('command-output');
  if (outEl) outEl.value = cmd;
}

function copyCommand() {
  const outEl = document.getElementById('command-output');
  if (!outEl || !outEl.value) return;
  
  outEl.select();
  outEl.setSelectionRange(0, 99999);
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(outEl.value).then(() => {
      alert('Copied to clipboard!');
    });
  }
}

if (typeof window !== 'undefined') {
  window.renderOptions = renderOptions;
  window.updateCommand = updateCommand;
  window.copyCommand = copyCommand;
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { init, TASKS, renderOptions, updateCommand, copyCommand };
}
