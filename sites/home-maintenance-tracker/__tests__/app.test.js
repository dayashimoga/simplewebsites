/**
 * @jest-environment jsdom
 */
const { PRESET_TASKS, addTask, markDone, removeTask, getStatus, getTasks, setTasks } = require('../app');
describe('Home Maintenance Tracker', () => {
  beforeEach(() => { document.body.innerHTML = '<input id="task-input"><select id="freq-select"><option value="90">Quarterly</option></select><div id="tasks"></div><div id="presets"></div>'; setTasks([]); });
  test('PRESET_TASKS has entries', () => { expect(PRESET_TASKS.length).toBeGreaterThan(5); });
  test('addTask adds task', () => { addTask('Clean gutters', 180); expect(getTasks().length).toBe(1); });
  test('markDone updates lastDone', () => { addTask('Test', 90); markDone(getTasks()[0].id); expect(getTasks()[0].lastDone).toBeDefined(); });
  test('getStatus returns overdue for never done', () => { expect(getStatus({ lastDone: null, freqDays: 90 }).cls).toBe('overdue'); });
  test('getStatus returns good for recent', () => { expect(getStatus({ lastDone: new Date().toISOString().slice(0,10), freqDays: 90 }).cls).toBe('good'); });
  test('removeTask removes', () => { addTask('X', 30); removeTask(getTasks()[0].id); expect(getTasks().length).toBe(0); });
});
