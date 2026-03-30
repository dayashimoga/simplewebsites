/**
 * @jest-environment jsdom
 */

const App = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <input id="item-input">
    <select id="cat-select"><option value="Food">Food</option></select>
    <div id="list"></div>
  `;
}

let setItemMock;
let getItemMock;

describe('Grocery List', () => {
  beforeAll(() => {
    setItemMock = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    getItemMock = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => null);
  });
  
  afterAll(() => {
    setItemMock.mockRestore();
    getItemMock.mockRestore();
  });

  beforeEach(() => {
    setupDOM();
    jest.resetModules();
    App.setItems([]);
    setItemMock.mockClear();
    getItemMock.mockClear();
  });

  test('addItem creates an item and saves', () => {
    App.addItem('Apples', 'Food');
    expect(App.getItems().length).toBe(1);
    expect(setItemMock).toHaveBeenCalled();
  });

  test('toggleItem flips done state', () => {
    App.setItems([{ id: 1, name: 'Milk', cat: 'Dairy', done: false }]);
    App.toggleItem(1);
    expect(App.getItems()[0].done).toBe(true);
  });

  test('removeItem deletes from items', () => {
    App.setItems([{ id: 1, name: 'Milk', cat: 'Dairy', done: false }]);
    App.removeItem(1);
    expect(App.getItems().length).toBe(0);
  });

  test('clearDone removes completed items', () => {
    App.setItems([
        { id: 1, name: 'A', done: true },
        { id: 2, name: 'B', done: false }
    ]);
    App.clearDone();
    expect(App.getItems().length).toBe(1);
    expect(App.getItems()[0].name).toBe('B');
  });
});
