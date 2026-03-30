const { init, TASKS, renderOptions, updateCommand, copyCommand } = require('../app');

const DOM = `
  <select id="task-select">
    <option value="commit-amend">commit-amend</option>
    <option value="delete-branch-local">delete-branch-local</option>
  </select>
  <div id="options-container"></div>
  <span id="command-desc"></span>
  <textarea id="command-output"></textarea>
`;

describe('git-command-builder', () => {
  beforeEach(() => {
    document.body.innerHTML = DOM;
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test('init renders options', () => {
    init();
    expect(document.getElementById('command-desc').textContent).toBe(TASKS['commit-amend'].desc);
    expect(document.getElementById('options-container').innerHTML).toContain('field-msg');
  });

  test('renderOptions handles empty fields', () => {
    // Inject a dummy task with 0 fields
    TASKS['test-empty'] = { desc: 'empty', fields: [], generate: () => 'git empty' };
    const sel = document.getElementById('task-select');
    sel.innerHTML += '<option value="test-empty">Empty</option>';
    sel.value = 'test-empty';
    renderOptions();
    
    expect(document.getElementById('options-container').innerHTML).toContain('No extra options required');
  });

  test('updateCommand generates correct strings', () => {
    document.getElementById('task-select').value = 'delete-branch-local';
    renderOptions();
    
    // Default
    expect(document.getElementById('command-output').value).toBe('git branch -d <branch_name>');
    
    // Fill branch
    document.getElementById('field-branch').value = 'my-feat';
    updateCommand();
    expect(document.getElementById('command-output').value).toBe('git branch -d my-feat');
    
    // Checkbox
    document.getElementById('field-force').checked = true;
    updateCommand();
    expect(document.getElementById('command-output').value).toBe('git branch -D my-feat');
  });

  test('task generator functions return appropriate defaults', () => {
    expect(TASKS['commit-amend'].generate({})).toBe('git commit --amend');
    expect(TASKS['commit-amend'].generate({msg: "fix"})).toBe('git commit --amend -m "fix"');
    expect(TASKS['undo-commit'].generate({})).toBe('git reset HEAD~1');
    expect(TASKS['hard-reset'].generate()).toBe('git reset --hard HEAD');
    expect(TASKS['stash-save'].generate({untracked: true, msg: "hi"})).toBe('git stash push -u -m "hi"');
    expect(TASKS['stash-pop'].generate()).toBe('git stash pop');
    expect(TASKS['delete-branch-remote'].generate({remote: 'origin', branch: 'x'})).toBe('git push origin --delete x');
    expect(TASKS['new-branch'].generate({branch: 'x'})).toBe('git checkout -b x');
    expect(TASKS['rebase-interactive'].generate({count: 2})).toBe('git rebase -i HEAD~2');
    expect(TASKS['cherry-pick'].generate({no_commit: true, hash: '123'})).toBe('git cherry-pick -n 123');
    expect(TASKS['log-pretty'].generate({limit: 5})).toBe('git log --graph --oneline --decorate -n 5');
    expect(TASKS['rename-branch'].generate({name: 'x'})).toBe('git branch -m x');
  });

  test('copyCommand copies to clipboard', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue() }
    });
    window.alert = jest.fn();
    
    document.getElementById('command-output').value = 'test-cmd';
    copyCommand();
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test-cmd');
    await Promise.resolve(); // flush microtasks
    expect(window.alert).toHaveBeenCalledWith('Copied to clipboard!');
  });
});
