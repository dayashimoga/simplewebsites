// Polyfill roundRect for jest-canvas-mock
if (typeof CanvasRenderingContext2D !== 'undefined') {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        this.rect(x, y, w, h);
    };
}
