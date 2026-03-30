const { init, lcsDiff, computeDiff, triggerDiff, renderDiff } = require('../app');

const DOM = `
  <textarea id="text-old"></textarea>
  <textarea id="text-new"></textarea>
  <div id="diff-results" style="display:none"></div>
  <div id="diff-output"></div>
  <span id="count-add"></span>
  <span id="count-del"></span>
  <div>
    <input type="radio" name="diff-mode" value="line" id="mode-line" checked />
    <input type="radio" name="diff-mode" value="word" id="mode-word" />
  </div>
`;

describe('text-diff-checker', () => {
  beforeEach(() => {
    document.body.innerHTML = DOM;
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('init exists', () => {
    expect(() => init()).not.toThrow();
  });

  test('triggerDiff debounces computation', () => {
    document.getElementById('text-old').value = 'A';
    document.getElementById('text-new').value = 'B';
    
    triggerDiff();
    triggerDiff();
    triggerDiff();
    
    jest.advanceTimersByTime(200);
    expect(document.getElementById('diff-output').innerHTML).toBe(''); // Not yet
    
    jest.advanceTimersByTime(400); // 600 total
    expect(document.getElementById('diff-output').innerHTML).toContain('B');
  });

  test('lcsDiff computes standard differences', () => {
    const arrOld = ['A', 'B', 'C'];
    const arrNew = ['A', 'X', 'C'];
    const diff = lcsDiff(arrOld, arrNew);
    
    expect(diff.length).toBe(4);
    expect(diff[0]).toEqual({ type: 'equal', val: 'A' });
    expect(diff[1]).toEqual({ type: 'del', val: 'B' });
    expect(diff[2]).toEqual({ type: 'add', val: 'X' });
    expect(diff[3]).toEqual({ type: 'equal', val: 'C' });
  });

  test('computeDiff handles empty fields', () => {
    computeDiff();
    expect(document.getElementById('diff-results').style.display).toBe('none');
  });

  test('computeDiff processes lines mode', () => {
    document.getElementById('text-old').value = 'Hello\nWorld';
    document.getElementById('text-new').value = 'Hello\nThere';
    computeDiff();
    
    expect(document.getElementById('diff-output').innerHTML).toContain('diff-del');
    expect(document.getElementById('diff-output').innerHTML).toContain('diff-add');
    expect(document.getElementById('count-add').textContent).toBe('+ 1 addition');
    expect(document.getElementById('count-del').textContent).toBe('- 1 deletion');
  });

  test('computeDiff processes word mode', () => {
    document.getElementById('text-old').value = 'Hello world friend';
    document.getElementById('text-new').value = 'Hello big friend';
    
    document.getElementById('mode-line').checked = false;
    document.getElementById('mode-word').checked = true;
    
    computeDiff();
    
    expect(document.getElementById('diff-output').innerHTML).toContain('diff-del-word');
    expect(document.getElementById('diff-output').innerHTML).toContain('diff-add-word');
  });
});
