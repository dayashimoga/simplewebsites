const path = require('path');
const fs = require('fs');

describe('Video Compressor', () => {
    let app;
    let originalDocument;
    let originalWindow;
    let originalFunction;
    let mockFFmpegInstance;

    beforeEach(() => {
        // Mock DOM
        document.body.innerHTML = `
            <div id="processing-status" class="hidden"></div>
            <div id="ffmpeg-log"></div>
            <div id="progress-bar"></div>
            <div id="progress-wrap" class="hidden"></div>
            <div id="upload-area"></div>
            <div id="compress-ui" class="hidden"></div>
            <div id="result-ui" class="hidden"></div>
            <video id="video-preview"></video>
            <input id="trim-start" type="text" />
            <input id="trim-end" type="text" />
            
            <button id="btn-hq" class="btn-primary active"></button>
            <button id="btn-mq" class="btn-secondary"></button>
            <button id="btn-lq" class="btn-secondary"></button>
            
            <select id="video-format">
                <option value="mp4">MP4</option>
                <option value="gif">GIF</option>
                <option value="mp3">MP3</option>
            </select>
            <select id="video-resolution"><option value="original">Original</option><option value="1920">1080p</option></select>
            <select id="video-fps"><option value="original">Original</option><option value="30">30fps</option></select>
            <select id="video-audio"><option value="keep">Keep</option><option value="mute">Mute</option></select>
            <select id="video-rotation"><option value="none">None</option><option value="cw90">90 CW</option></select>
            
            <button id="do-compress-btn"></button>
            <div id="saved-space"></div>
            <div id="estimate-display"></div>
        `;

        // Mock createObjectURL
        global.URL.createObjectURL = jest.fn(() => 'blob:test');

        // Mock FFmpeg ESM Loader using Function intercept
        originalFunction = global.Function;
        class MockFFmpeg {
            constructor() {
                this.events = {};
                mockFFmpegInstance = this;
            }
            on(event, cb) { this.events[event] = cb; }
            async load(opts) {}
            async writeFile(name, data) {}
            async exec(args) {
                if (args.join(' ').includes('error')) throw new Error('Exec mock error');
                if (this.events['progress']) this.events['progress']({ progress: 1.0 });
                if (this.events['log']) this.events['log']({ message: 'mock log' });
            }
            async readFile(name) { return new Uint8Array([1, 2, 3]); }
        }

        global.Function = function(...args) {
            if (args.length === 2 && args[0] === 'url' && args[1].includes('import(')) {
                return async (url) => {
                    if (url.includes('ffmpeg/ffmpeg')) return { FFmpeg: MockFFmpeg };
                    if (url.includes('ffmpeg/util')) return { toBlobURL: async () => 'mock_url', fetchFile: async () => new Uint8Array([0]) };
                    throw new Error('Unknown url');
                };
            }
            return new originalFunction(...args);
        };

        app = require('../app');
        // Clear state
        app.setVideoFileInternal(null);
        app.setQualityInternal('medium');
        app.setOutputBlobInternal(null);
        app.resetFFmpeg();
        app.clearProcessingHistory();
    });

    afterEach(() => {
        global.Function = originalFunction;
        jest.restoreAllMocks();
    });

    describe('Pure Logic Functions', () => {
        test('qualityToCRF', () => {
            expect(app.qualityToCRF('high')).toBe('23');
            expect(app.qualityToCRF('low')).toBe('34');
            expect(app.qualityToCRF('medium')).toBe('28');
        });

        test('formatSize', () => {
            expect(app.formatSize(0)).toBe('0 B');
            expect(app.formatSize(500)).toBe('500 B');
            expect(app.formatSize(2048)).toBe('2.0 KB');
            expect(app.formatSize(2097152)).toBe('2.00 MB');
        });

        test('calcSavings', () => {
            expect(app.calcSavings(0, 0)).toBe(0);
            expect(app.calcSavings(100, 50)).toBe(50);
            expect(app.calcSavings(100, 110)).toBe(0); // Can't have negative savings
        });

        test('isVideoFile', () => {
            expect(app.isVideoFile({ type: 'video/mp4' })).toBe(true);
            expect(app.isVideoFile({ type: 'image/png' })).toBe(false);
            expect(app.isVideoFile(null)).toBe(false);
        });
        
        test('getVideoMetadata', () => {
            expect(app.getVideoMetadata(null)).toBeNull();
            const mockVid = { duration: 125, videoWidth: 1920, videoHeight: 1080, readyState: 4 };
            expect(app.getVideoMetadata(mockVid)).toEqual({
                duration: '2:05',
                durationSeconds: 125,
                width: 1920,
                height: 1080,
                readyState: 4
            });
            
            expect(app.getVideoMetadata({ duration: NaN })).toEqual(expect.objectContaining({ 
                duration: '0:00', // NaN || 0 resolves to 0 before isNaN is checked
                durationSeconds: 0 
            }));
        });
        
        test('estimateOutputSize', () => {
            expect(app.estimateOutputSize(0, 'high', 'original').estimatedSize).toBe(0);
            const r1 = app.estimateOutputSize(1000, 'high', 'original');
            expect(r1.reductionPct).toBe(30);
            
            const r2 = app.estimateOutputSize(1000, 'low', '1920'); // 0.25 * 0.9 = 0.225
            expect(r2.estimatedSize).toBe(225);
            expect(r2.reductionPct).toBe(78); // 100 - 22.5 = 77.5 ~ 78
            
            // unknown quality
            const r3 = app.estimateOutputSize(1000, 'unknown', 'unknown');
            expect(r3.estimatedSize).toBe(450); // defaults to medium 0.45
        });
        
        test('getOutputFilename', () => {
            expect(app.getOutputFilename('test.mov', 'high')).toMatch(/^test-hq-\d+.mp4$/);
            expect(app.getOutputFilename('data.mp4', 'low')).toMatch(/^data-lq-\d+.mp4$/);
            expect(app.getOutputFilename(null, 'medium')).toMatch(/^video-mq-\d+.mp4$/);
        });
        
        test('History Management', () => {
            app.addHistoryEntry(100, 50, 'high', 10);
            expect(app.getProcessingHistory().length).toBe(1);
            app.clearProcessingHistory();
            expect(app.getProcessingHistory().length).toBe(0);
            
            // test 50+ history limit array shifting
            for (let i = 0; i < 55; i++) app.addHistoryEntry(100, 50, 'low', 5);
            expect(app.getProcessingHistory().length).toBe(50);
        });
    });

    describe('DOM & UI Features', () => {
        test('setTrimFromVideo', () => {
            const vid = document.getElementById('video-preview');
            const start = document.getElementById('trim-start');
            const end = document.getElementById('trim-end');
            
            vid.currentTime = 5.24;
            app.setTrimFromVideo();
            expect(start.value).toBe('5.2');
            
            vid.currentTime = 10.5;
            app.setTrimFromVideo();
            expect(end.value).toBe('10.5');
            
            vid.currentTime = 12.0;
            app.setTrimFromVideo();
            expect(start.value).toBe('12.0');
            expect(end.value).toBe('');
            
            // Branch: no vid
            start.value = ''; end.value = '';
            document.getElementById('video-preview').remove();
            app.setTrimFromVideo();
            expect(start.value).toBe('');
        });
        
        test('setQuality UI toggles', () => {
            app.setQuality('low');
            expect(app.getState().quality).toBe('low');
            expect(document.getElementById('btn-hq').classList.contains('active')).toBe(false);
            expect(document.getElementById('btn-lq').classList.contains('active')).toBe(true);
            
            // branch missing button
            document.getElementById('btn-mq').remove();
            app.setQuality('high');
            expect(app.getState().quality).toBe('high');
        });
        
        test('setupDragDrop', () => {
            app.setupDragDrop();
            const area = document.getElementById('upload-area');
            
            area.dispatchEvent(new Event('dragover'));
            expect(area.classList.contains('drag-over')).toBe(true);
            
            area.dispatchEvent(new Event('dragleave'));
            expect(area.classList.contains('drag-over')).toBe(false);
            
            const dropEvent = new Event('drop');
            dropEvent.dataTransfer = { files: [new File([""], "test.mp4", { type: "video/mp4" })] };
            area.classList.add('drag-over');
            area.dispatchEvent(dropEvent);
            expect(area.classList.contains('drag-over')).toBe(false);
            expect(app.getState().videoFile).toBeDefined();
            
            // branch no dropzone
            area.remove();
            app.setupDragDrop();
        });
        
        test('setPlaybackSpeed', () => {
            app.setPlaybackSpeed(2.5);
            expect(document.getElementById('video-preview').playbackRate).toBe(2.5);
            app.setPlaybackSpeed(5); // capped at 4
            expect(document.getElementById('video-preview').playbackRate).toBe(4);
            
            document.getElementById('video-preview').remove();
            app.setPlaybackSpeed(1); // doesn't crash
        });
        
        test('updateEstimateDisplay', () => {
            app.updateEstimateDisplay(); // no video yet
            expect(document.getElementById('estimate-display').textContent).toBe('');
            
            app.setVideoFile(new File([''], 'test.mp4', { type: 'video/mp4' }));
            document.getElementById('btn-hq').classList.add('active');
            app.updateEstimateDisplay();
            expect(document.getElementById('estimate-display').textContent).toContain('~0 B');
            
            document.getElementById('estimate-display').remove();
            app.updateEstimateDisplay(); // doesn't crash
        });
        
        test('resetCompressor', () => {
            app.setVideoFileInternal({});
            app.setOutputBlobInternal({});
            app.resetCompressor();
            expect(app.getVideoFile()).toBeNull();
            expect(app.getOutputBlob()).toBeNull();
        });
    });

    describe('File Handling & Compression', () => {
        test('handleUpload triggers error on invalid', () => {
            app.handleUpload({});
            expect(document.getElementById('processing-status').textContent).toContain('❌');
        });
        
        test('setVideoFile missing DOM gracefully handles', () => {
            document.getElementById('upload-area').remove();
            document.getElementById('compress-ui').remove();
            document.getElementById('result-ui').remove();
            document.getElementById('video-preview').remove();
            app.setVideoFile(new File([''], 't.mp4', { type: 'video/mp4' }));
            expect(app.getVideoFile()).toBeTruthy();
        });
        
        test('initFFmpeg failure handles gracefully', async () => {
            global.Function = () => { throw new Error('Dyn import failed'); };
            await expect(app.initFFmpeg()).rejects.toThrow('Could not load video processing engine');
            expect(document.getElementById('processing-status').textContent).toContain('Engine Load Error');
            
            // Hit missing DOM
            document.getElementById('processing-status').remove();
            await expect(app.initFFmpeg()).rejects.toThrow();
        });

        test('executeCompression runs successfully (GIF)', async () => {
            app.setVideoFileInternal(new File(['test'], 'test.mp4', { type: 'video/mp4' }));
            document.getElementById('video-format').value = 'gif';
            document.getElementById('video-resolution').value = '640';
            
            await app.executeCompression();
            expect(app.getOutputBlob()).toBeTruthy();
            expect(app.getOutputBlob().type).toBe('image/gif');
            expect(document.getElementById('progress-bar').style.width).toBe('100%');
        });

        test('executeCompression runs successfully (MP3)', async () => {
            app.setVideoFileInternal(new File(['test'], 'test.mp4', { type: 'video/mp4' }));
            document.getElementById('video-format').value = 'mp3';
            app.setQuality('low');
            
            await app.executeCompression();
            expect(app.getOutputBlob().type).toBe('audio/mpeg');
        });

        test('executeCompression runs successfully (MP4 Full Args)', async () => {
            app.setVideoFileInternal({ name: 'test.mp4', size: 5000 });
            document.getElementById('video-format').value = 'mp4';
            document.getElementById('trim-start').value = '1.0';
            document.getElementById('trim-end').value = '5.0';
            document.getElementById('video-rotation').value = 'cw90';
            document.getElementById('video-fps').value = '30';
            document.getElementById('video-audio').value = 'mute';
            app.setQualityInternal('medium'); // crf 28
            
            await app.executeCompression();
            const blob = app.getOutputBlob();
            expect(blob).toBeTruthy();
            expect(blob.type).toBe('video/mp4');
            
            // Check that savings calculations run
            expect(document.getElementById('saved-space').innerHTML).toContain('Saved');
        });

        test('executeCompression handles execution error', async () => {
            app.setVideoFileInternal(new File(['test'], 'error.mp4', { type: 'video/mp4' }));
            // Put 'error' in resolution so it gets added to args list and picked up by our Mock
            document.getElementById('video-resolution').innerHTML = '<option value="error">error</option>';
            document.getElementById('video-resolution').value = 'error'; 
            await app.executeCompression();
            
            expect(document.getElementById('processing-status').textContent).toContain('❌ Processing failed: Exec mock error');
            expect(document.getElementById('do-compress-btn').disabled).toBe(false);
            
            // Also test branch without file
            app.setVideoFileInternal(null);
            await app.executeCompression(); // Does nothing
        });
        
        test('executeCompression gracefully skips missing DOM during errors', async () => {
            app.setVideoFileInternal(new File(['test'], 'error.mp4', { type: 'video/mp4' }));
            document.getElementById('video-format').value = 'error'; 
            document.getElementById('processing-status').remove();
            document.getElementById('do-compress-btn').remove();
            document.getElementById('progress-wrap').remove();
            document.getElementById('progress-bar').remove();
            
            await app.executeCompression();
        });

        test('downloadVideo', () => {
            app.downloadVideo(); // no blob, safe return
            
            app.setOutputBlobInternal(new Blob(['test'], { type: 'video/mp4' }));
            const clickMock = jest.fn();
            global.document.createElement = jest.fn(() => ({ click: clickMock }));
            
            app.downloadVideo();
            expect(clickMock).toHaveBeenCalled();
            expect(global.URL.createObjectURL).toHaveBeenCalled();
            
            // formats
            document.getElementById('video-format').value = 'gif';
            app.downloadVideo();
            
            // Missing select
            document.getElementById('video-format').remove();
            app.downloadVideo();
        });
        
        test('getters reachability', () => {
            expect(app.getFFmpeg()).toBe(null);
            expect(app.getQuality()).toBe('medium');
        });
        
        test('executeCompression branch for additional filters (high quality mp3, flips)', async () => {
            app.setVideoFileInternal({ name: 'test.mp4', size: 5000 });
            document.getElementById('video-format').value = 'mp3';
            app.setQualityInternal('high');
            await app.executeCompression();
            
            document.getElementById('video-format').value = 'mp4';
            document.getElementById('video-rotation').innerHTML = `
                <option value="ccw90">ccw90</option>
                <option value="180">180</option>
                <option value="hflip">hflip</option>
                <option value="vflip">vflip</option>
            `;
            const flips = ['ccw90', '180', 'hflip', 'vflip'];
            for (const f of flips) {
                document.getElementById('video-rotation').value = f;
                await app.executeCompression();
            }
            
            // Branch for gif with mute audio
            document.getElementById('video-format').value = 'gif';
            document.getElementById('video-audio').value = 'mute';
            document.getElementById('trim-start').value = '-1';
            document.getElementById('trim-end').value = '0';
            await app.executeCompression();
            
            // Branch for trim end < start
            document.getElementById('video-format').value = 'mp4';
            document.getElementById('trim-start').value = '10';
            document.getElementById('trim-end').value = '5';
            await app.executeCompression();
            
            // Branch for 0 savings
            app.setVideoFileInternal({ name: 'test.mp4', size: 3 });
            await app.executeCompression();

            // Branch for missing fetchFile
            const origFn = window._ffmpegFetchFile;
            window._ffmpegFetchFile = null;
            await app.executeCompression();
            window._ffmpegFetchFile = origFn;
        });
        
        test('DOMContentLoaded listener', () => {
            document.dispatchEvent(new Event('DOMContentLoaded'));
            // setupDragDrop runs automatically
        });
    });
    
    describe('Missing DOM Execution', () => {
        test('executeCompression with missing result UI and saved-space', async () => {
            app.setVideoFileInternal({ name: 'test.mp4', size: 5000 });
            document.getElementById('result-ui').remove();
            document.getElementById('saved-space').remove();
            await app.executeCompression();
        });
        test('resetCompressor with empty DOM', () => {
            document.body.innerHTML = '';
            app.resetCompressor();
        });
        test('downloadVideo with missing anchor support', () => {
            app.setOutputBlobInternal(new Blob(['test'], { type: 'video/mp4' }));
            document.body.innerHTML = ''; // no video-format
            app.downloadVideo();
        });
        test('setTrimFromVideo with empty DOM', () => {
            document.body.innerHTML = '';
            app.setTrimFromVideo();
        });
        test('setQuality UI toggles with empty DOM', () => {
            document.body.innerHTML = '';
            app.setQuality('low');
        });
        test('showError with empty DOM', () => {
            document.body.innerHTML = '';
            app.showError('err');
        });
        test('setupDragDrop with empty DOM', () => {
            document.body.innerHTML = '';
            app.setupDragDrop();
        });
    });
});
