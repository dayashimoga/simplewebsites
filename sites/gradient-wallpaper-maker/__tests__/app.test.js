/**
 * @jest-environment jsdom
 */
const { getGradient } = require('../app');
describe('Gradient Wallpaper Maker', () => {
  beforeEach(() => { document.body.innerHTML = '<div id="app"></div>'; });
  test('getGradient returns linear gradient', () => { const r = getGradient('#ff0000','#00ff00','#0000ff',45,'linear'); expect(r).toContain('linear-gradient'); expect(r).toContain('45deg'); });
  test('getGradient returns radial gradient', () => { const r = getGradient('#ff0000','#00ff00','#0000ff',0,'radial'); expect(r).toContain('radial-gradient'); });
});
