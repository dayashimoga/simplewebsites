/**
 * @jest-environment jsdom
 */
const { addHabit, removeHabit, toggleToday, calcStreak, getHabits, setHabits } = require('../app');
describe('Habit Tracker', () => {
  beforeEach(() => { document.body.innerHTML = '<input id="habit-input"><div id="habits"></div><div id="heatmap"></div>'; setHabits([]); });
  test('addHabit adds habit', () => { addHabit('Exercise'); expect(getHabits().length).toBe(1); expect(getHabits()[0].name).toBe('Exercise'); });
  test('removeHabit removes', () => { addHabit('Test'); const id = getHabits()[0].id; removeHabit(id); expect(getHabits().length).toBe(0); });
  test('toggleToday marks done', () => { addHabit('Run'); const id = getHabits()[0].id; toggleToday(id); const today = new Date().toISOString().slice(0,10); expect(getHabits()[0].log[today]).toBe(true); });
  test('calcStreak counts consecutive days', () => { const today = new Date().toISOString().slice(0,10); expect(calcStreak({ [today]: true })).toBe(1); expect(calcStreak({})).toBe(0); });
});
