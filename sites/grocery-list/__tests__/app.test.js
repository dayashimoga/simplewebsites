/**
 * @jest-environment jsdom
 */
const { addItem, toggleItem, removeItem, clearDone, getItems, setItems } = require('../app');
describe('Grocery List', () => {
  beforeEach(() => { document.body.innerHTML = '<input id="item-input"><select id="cat-select"><option>Produce</option></select><div id="list"></div>'; setItems([]); });
  test('addItem adds item', () => { addItem('Milk', 'Dairy'); expect(getItems().length).toBe(1); expect(getItems()[0].name).toBe('Milk'); });
  test('toggleItem marks done', () => { addItem('Bread', 'Bakery'); const id = getItems()[0].id; toggleItem(id); expect(getItems()[0].done).toBe(true); });
  test('removeItem removes', () => { addItem('Eggs'); const id = getItems()[0].id; removeItem(id); expect(getItems().length).toBe(0); });
  test('clearDone removes checked', () => { addItem('A'); addItem('B'); const id = getItems()[0].id; toggleItem(id); clearDone(); expect(getItems().length).toBe(1); });
});
