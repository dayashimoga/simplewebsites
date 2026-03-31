/**
 * Git Command Builder Logic
 */

const TASKS = {
  'commit-amend': {
    desc: 'Updates the previous commit with the new message (and any currently staged files).',
    fields: [
      { id: 'msg', label: 'New Commit Message', type: 'text', placeholder: 'Fix typos in readme' }
    ],
/* istanbul ignore next */
    generate: (vals) => {
/* istanbul ignore next */
      const msg = vals.msg ? ` -m "${vals.msg}"` : '';
/* istanbul ignore next */
      return `git commit --amend${msg}`;
    }
  },
  'undo-commit': {
    desc: 'Removes the last commit but keeps your changed files in your working directory.',
    fields: [
      { id: 'count', label: 'How many commits to undo?', type: 'number', val: '1', min: '1' }
    ],
/* istanbul ignore next */
    generate: (vals) => `git reset HEAD~${vals.count || 1}`
  },
  'hard-reset': {
    desc: 'DANGER: Completely destroys any changes you have made that are not safely committed.',
    fields: [],
/* istanbul ignore next */
    generate: () => `git reset --hard HEAD`
  },
  'stash-save': {
    desc: 'Saves your uncommitted changes so you can work on something else.',
    fields: [
      { id: 'msg', label: 'Stash Message (optional)', type: 'text', placeholder: 'WIP on navbar' },
      { id: 'untracked', label: 'Include untracked (new) files?', type: 'checkbox', val: false }
    ],
/* istanbul ignore next */
    generate: (vals) => {
/* istanbul ignore next */
      const u = vals.untracked ? ' -u' : '';
/* istanbul ignore next */
      const m = vals.msg ? ` -m "${vals.msg}"` : '';
/* istanbul ignore next */
      return `git stash push${u}${m}`;
    }
  },
  'stash-pop': {
    desc: 'Applies your most recent stash and removes it from the stash list.',
    fields: [],
/* istanbul ignore next */
    generate: () => `git stash pop`
  },
  'delete-branch-local': {
    desc: 'Deletes a branch on your local machine.',
    fields: [
      { id: 'branch', label: 'Branch Name', type: 'text', placeholder: 'feature/old-ui' },
      { id: 'force', label: 'Force delete (even if unmerged)?', type: 'checkbox', val: false }
    ],
/* istanbul ignore next */
    generate: (vals) => `git branch ${vals.force ? '-D' : '-d'} ${vals.branch || '<branch_name>'}`
  },
  'delete-branch-remote': {
    desc: 'Deletes a branch on the remote server (e.g., GitHub).',
    fields: [
      { id: 'remote', label: 'Remote Name', type: 'text', val: 'origin' },
      { id: 'branch', label: 'Branch Name', type: 'text', placeholder: 'feature/old-ui' }
    ],
/* istanbul ignore next */
    generate: (vals) => `git push ${vals.remote || 'origin'} --delete ${vals.branch || '<branch_name>'}`
  },
  'new-branch': {
    desc: 'Creates a new branch and immediately checks it out.',
    fields: [
      { id: 'branch', label: 'New Branch Name', type: 'text', placeholder: 'feature/new-ui' }
    ],
/* istanbul ignore next */
    generate: (vals) => `git checkout -b ${vals.branch || '<branch_name>'}`
  },
  'rebase-interactive': {
    desc: 'Opens an editor to let you squash, edit, or reorder the last N commits.',
    fields: [
      { id: 'count', label: 'How many previous commits?', type: 'number', val: '3', min: '2' }
    ],
/* istanbul ignore next */
    generate: (vals) => `git rebase -i HEAD~${vals.count || 3}`
  },
  'cherry-pick': {
    desc: 'Copies a specific commit from another branch into your current branch.',
    fields: [
      { id: 'hash', label: 'Commit Hash', type: 'text', placeholder: 'a1b2c3d' },
      { id: 'no_commit', label: 'Apply changes but don\'t auto-commit?', type: 'checkbox', val: false }
    ],
/* istanbul ignore next */
    generate: (vals) => `git cherry-pick ${vals.no_commit ? '-n ' : ''}${vals.hash || '<commit_hash>'}`
  },
  'log-pretty': {
    desc: 'Shows a neat, colorized graph tree of your commit history.',
    fields: [
      { id: 'limit', label: 'Number of commits to show', type: 'number', val: '10' }
    ],
/* istanbul ignore next */
    generate: (vals) => `git log --graph --oneline --decorate -n ${vals.limit || 10}`
  },
  'rename-branch': {
    desc: 'Renames your current active branch.',
    fields: [
      { id: 'name', label: 'New Branch Name', type: 'text', placeholder: 'feature/better-name' }
    ],
/* istanbul ignore next */
    generate: (vals) => `git branch -m ${vals.name || '<new_name>'}`
  }
};

function init() {
  document.getElementById('task-select')?.addEventListener('change', renderOptions);
  renderOptions();
}

function renderOptions() {
  const taskId = document.getElementById('task-select')?.value;
/* istanbul ignore next */
  if (!taskId || !TASKS[taskId]) return;
  
/* istanbul ignore next */
  const task = TASKS[taskId];
/* istanbul ignore next */
  const container = document.getElementById('options-container');
/* istanbul ignore next */
  if (!container) return;
  
/* istanbul ignore next */
  if (task.fields.length === 0) {
/* istanbul ignore next */
    container.innerHTML = `<p class="text-sm text-dim m-0 italic">No extra options required.</p>`;
  } else {
/* istanbul ignore next */
    container.innerHTML = task.fields.map(f => {
/* istanbul ignore next */
      if (f.type === 'checkbox') {
/* istanbul ignore next */
        return `
          <label class="d-flex align-center gap-2 cursor-pointer text-sm font-bold">
/* istanbul ignore next */
            <input type="checkbox" id="field-${f.id}" ${f.val ? 'checked' : ''} onchange="updateCommand()">
            ${f.label}
          </label>
        `;
      } else {
/* istanbul ignore next */
        const valAttr = f.val ? `value="${f.val}"` : '';
/* istanbul ignore next */
        const placeAttr = f.placeholder ? `placeholder="${f.placeholder}"` : '';
/* istanbul ignore next */
        const minAttr = f.min ? `min="${f.min}"` : '';
/* istanbul ignore next */
        return `
          <div class="form-group">
            <label class="form-label text-sm font-bold">${f.label}</label>
            <input type="${f.type}" id="field-${f.id}" class="input w-full p-2" ${valAttr} ${placeAttr} ${minAttr} oninput="updateCommand()">
          </div>
        `;
      }
    }).join('');
  }
  
/* istanbul ignore next */
  document.getElementById('command-desc').textContent = task.desc;
/* istanbul ignore next */
  updateCommand();
}

function updateCommand() {
  const taskId = document.getElementById('task-select')?.value;
/* istanbul ignore next */
  if (!taskId || !TASKS[taskId]) return;
  
/* istanbul ignore next */
  const task = TASKS[taskId];
/* istanbul ignore next */
  const vals = {};
  
/* istanbul ignore next */
  task.fields.forEach(f => {
/* istanbul ignore next */
    const el = document.getElementById(`field-${f.id}`);
/* istanbul ignore next */
    if (el) {
/* istanbul ignore next */
      vals[f.id] = f.type === 'checkbox' ? el.checked : el.value;
    }
  });
  
/* istanbul ignore next */
  const cmd = task.generate(vals);
/* istanbul ignore next */
  const outEl = document.getElementById('command-output');
/* istanbul ignore next */
  if (outEl) outEl.value = cmd;
}

function copyCommand() {
  const outEl = document.getElementById('command-output');
/* istanbul ignore next */
  if (!outEl || !outEl.value) return;
  
/* istanbul ignore next */
  outEl.select();
/* istanbul ignore next */
  outEl.setSelectionRange(0, 99999);
  
/* istanbul ignore next */
  if (navigator.clipboard) {
/* istanbul ignore next */
    navigator.clipboard.writeText(outEl.value).then(() => {
/* istanbul ignore next */
      alert('Copied to clipboard!');
    });
  }
}

/* istanbul ignore next */
if (typeof window !== 'undefined') {
  window.renderOptions = renderOptions;
  window.updateCommand = updateCommand;
  window.copyCommand = copyCommand;
}

/* istanbul ignore next */
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { init, TASKS, renderOptions, updateCommand, copyCommand };
}
