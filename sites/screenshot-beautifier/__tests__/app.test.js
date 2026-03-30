/**
 * @jest-environment jsdom
 */
const { roundRect } = require('../app');
describe('Screenshot Beautifier', () => {
  test('roundRect draws path without error', () => {
    const ctx = { beginPath: jest.fn(), moveTo: jest.fn(), lineTo: jest.fn(), quadraticCurveTo: jest.fn(), closePath: jest.fn() };
    expect(() => roundRect(ctx, 10, 10, 100, 100, 8)).not.toThrow();
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.closePath).toHaveBeenCalled();
    expect(ctx.quadraticCurveTo).toHaveBeenCalledTimes(4);
  });
});
