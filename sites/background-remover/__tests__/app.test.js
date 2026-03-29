const { handleUpload, resetApp, rotateImage, updateBgColor, clearBgColor, downloadImage, processBackgroundRemoval, applyFilters } = require('../app');

beforeEach(() => {
    document.body.innerHTML = `
        <div id="upload-area"></div>
        <div id="results" class="hidden"></div>
        <div id="processing-view" style="display:none">
            <div id="processing-status"></div>
        </div>
        <div id="editor-container" style="display:none"></div>
        <div id="action-buttons" style="display:none">
            <button id="download-btn">Download</button>
        </div>
        <img id="bg-canvas" />
        <input type="color" id="bg-color" value="#000000" />
        <select id="download-format"><option value="image/png">PNG</option></select>
    `;
    global.URL.createObjectURL = jest.fn().mockReturnValue('blob:test');
    global._TEST_IMGLY_ = { 
        removeBackground: jest.fn().mockResolvedValue(new Blob([''], { type: 'image/png' }))
    };
    
    global.Image = class {
        constructor() { this.onload = null; this.src = ''; }
        set src(v) { this._src = v; if (v) setTimeout(() => { if (this.onload) this.onload(); }, 5); }
    };
    
    global.Cropper = class {
        constructor(el, opts) { this.rotateArgs = []; }
        rotate(d) { this.rotateArgs.push(d); }
        getCroppedCanvas() {
            return { toBlob: (cb) => cb(new Blob([''], { type: 'image/png' })) };
        }
        destroy() {}
    };
    
    document.querySelector = jest.fn((sel) => {
        if (sel === '.cropper-wrap-box') return { style: {} };
        if (sel === '.cropper-canvas img') return document.getElementById('crop-img');
        return document.getElementById(sel.replace('#', '')) || { style: {} };
    });
});

describe('Background Remover', () => {
    test('handleUpload shows processing state and calls processBackgroundRemoval', () => {
        const file = new File(['data'], 'test.png', { type: 'image/png' });
        handleUpload({ target: { files: [file] } });
        
        // Upload area should be hidden
        expect(document.getElementById('upload-area').classList.contains('hidden')).toBe(true);
        // Results section should be visible
        expect(document.getElementById('results').classList.contains('hidden')).toBe(false);
        // Processing view should be visible
        expect(document.getElementById('processing-view').style.display).toBe('block');
    });

    test('processBackgroundRemoval succeeds and shows editor', async () => {
        const file = new File(['data'], 'test.png', { type: 'image/png' });
        await processBackgroundRemoval(file);
        
        await new Promise(r => setTimeout(r, 60));
        expect(global._TEST_IMGLY_.removeBackground).toHaveBeenCalledWith(file, { publicPath: "https://static.imgly.com/@imgly/background-removal-data/1.4.3/dist/" });
        expect(document.getElementById('editor-container').style.display).toBe('block');
        expect(document.getElementById('action-buttons').style.display).toBe('flex');
    });

    test('processBackgroundRemoval handles error', async () => {
        global._TEST_IMGLY_.removeBackground.mockRejectedValue(new Error('Test failure'));
        const file = new File(['data'], 'test.png', { type: 'image/png' });
        await processBackgroundRemoval(file);
        
        await new Promise(r => setTimeout(r, 30));
        expect(document.getElementById('processing-status').textContent).toContain('Error');
    });

    test('processBackgroundRemoval handles missing library', async () => {
        delete global._TEST_IMGLY_;
        const file = new File(['data'], 'test.png', { type: 'image/png' });
        await processBackgroundRemoval(file);
        
        await new Promise(r => setTimeout(r, 60));
        expect(document.getElementById('processing-status').textContent).toContain('adblocker');
    });

    test('rotateImage does not throw when cropper is null', () => {
        expect(() => rotateImage(90)).not.toThrow();
    });

    test('updateBgColor and clearBgColor work', () => {
        updateBgColor();
        expect(document.querySelector).toHaveBeenCalledWith('.cropper-wrap-box');
        
        clearBgColor();
        expect(document.querySelector).toHaveBeenCalledWith('.cropper-wrap-box');
    });

    test('downloadImage fallback when no cropper', () => {
        // No cropper initialized, should not throw
        expect(() => downloadImage()).not.toThrow();
    });

    test('handleUpload ignores non-image files', () => {
        const file = new File(['data'], 'test.txt', { type: 'text/plain' });
        handleUpload({ target: { files: [file] } });
        expect(document.getElementById('upload-area').classList.contains('hidden')).toBe(false);
    });
    
    test('downloadImage with full cropper + format flow', async () => {
        const file = new File(['data'], 'test.png', { type: 'image/png' });
        await processBackgroundRemoval(file);
        await new Promise(r => setTimeout(r, 30));
        
        const bgCanvas = document.getElementById('bg-canvas');
        if (bgCanvas && bgCanvas.onload) bgCanvas.onload();
        
        document.getElementById('download-format').innerHTML = '<option value="image/jpeg" selected>JPG</option>';
        downloadImage();
        await new Promise(r => setTimeout(r, 200));
        expect(document.getElementById('download-btn').disabled).toBe(false);
    });
    
    test('resetApp reloads the page', () => {
        delete window.location;
        window.location = { reload: jest.fn() };
        resetApp();
        expect(window.location.reload).toHaveBeenCalled();
    });

    test('applyFilters calculates correct filter string and updates DOM', () => {
        document.body.innerHTML += `
            <input type="range" id="filter-bright" max="200" value="120">
            <input type="range" id="filter-contrast" max="200" value="90">
            <input type="range" id="filter-saturate" max="200" value="150">
            <span id="val-bright"></span>
            <span id="val-contrast"></span>
            <span id="val-saturate"></span>
            <div class="cropper-canvas"><img id="crop-img"></div>
        `;
        const filterStr = applyFilters();
        expect(filterStr).toBe('brightness(120%) contrast(90%) saturate(150%)');
        expect(document.getElementById('val-bright').textContent).toBe('120%');
        const img = document.querySelector('.cropper-canvas img');
        expect(img.style.filter).toBe('brightness(120%) contrast(90%) saturate(150%)');
    });
});
