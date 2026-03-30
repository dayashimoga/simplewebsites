/**
 * @jest-environment jsdom
 */
const { 
  qualityToCRF, formatSize, calcSavings, isVideoFile,
  initFFmpeg, handleUpload, setVideoFile, setQuality, setTrimFromVideo,
  executeCompression, downloadVideo, resetCompressor,
  getState, setVideoFileInternal, setQualityInternal, setOutputBlobInternal
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <div id="upload-area"></div>
    <div id="compress-ui" class="hidden"></div>
    <div id="result-ui" class="hidden"></div>
    <video id="video-preview"></video>
    <div id="processing-status" class="hidden"></div>
    <div id="progress-wrap" class="hidden"></div>
    <div id="progress-bar" style="width:0%"></div>
    <div id="ffmpeg-log"></div>
    <input id="trim-start">
    <input id="trim-end">
    <select id="video-resolution"><option value="original">Original</option></select>
    <select id="video-fps"><option value="original">Original</option></select>
    <select id="video-audio"><option value="auto">Auto</option><option value="mute">Mute</option></select>
    <button id="do-compress-btn"></button>
    <button id="btn-hq"></button>
    <button id="btn-mq"></button>
    <button id="btn-lq"></button>
    <div id="result-stats"></div>
    <div id="saved-space"></div>
  `;
}

// Mock URL
global.URL.createObjectURL = jest.fn(() => 'blob:url');
global.URL.revokeObjectURL = jest.fn();

// We can mock global.Function to intercept the dynamic imports in initFFmpeg
global.Function = class {
  constructor() {
    return function() {
      return Promise.resolve({
        FFmpeg: class {
          constructor() { this.handlers = {}; }
          on(event, cb) { this.handlers[event] = cb; }
          load() { return Promise.resolve(); }
          writeFile() { return Promise.resolve(); }
          exec() { 
            if(this.handlers.log) this.handlers.log({ message: 'test' });
            if(this.handlers.progress) this.handlers.progress({ progress: 0.5 });
            return Promise.resolve(); 
          }
          readFile() { return Promise.resolve(new Uint8Array([1, 2, 3])); }
        },
        toBlobURL: jest.fn(() => Promise.resolve('blob:url')),
        fetchFile: jest.fn(() => Promise.resolve(new Uint8Array([4, 5, 6])))
      });
    };
  }
};

describe('Video Compressor', () => {
  beforeEach(() => {
    setupDOM();
    setVideoFileInternal(null);
    setQualityInternal('medium');
    setOutputBlobInternal(null);
    jest.clearAllMocks();
    document.addEventListener = jest.fn();
  });

  test('qualityToCRF returns correct values', () => {
    expect(qualityToCRF('high')).toBe('23');
    expect(qualityToCRF('low')).toBe('34');
    expect(qualityToCRF('medium')).toBe('28');
    expect(qualityToCRF('foo')).toBe('28');
  });

  test('formatSize formats correctly', () => {
    expect(formatSize(0)).toBe('0 B');
    expect(formatSize(1023)).toBe('1023 B');
    expect(formatSize(1024)).toBe('1.0 KB');
    expect(formatSize(1048576)).toBe('1.00 MB');
  });

  test('calcSavings calculates percentage', () => {
    expect(calcSavings(100, 40)).toBe(60);
    expect(calcSavings(0, 40)).toBe(0);
    expect(calcSavings(100, 150)).toBe(0);
  });

  test('isVideoFile validates correctly', () => {
    expect(isVideoFile({ type: 'video/mp4' })).toBe(true);
    expect(isVideoFile({ type: 'image/jpeg' })).toBe(false);
    expect(isVideoFile(null)).toBe(false);
  });

  test('setVideoFile updates UI and preview', () => {
    const file = new File([''], 'test.mp4', { type: 'video/mp4' });
    setVideoFile(file);
    expect(getState().videoFile).toBe(file);
    expect(document.getElementById('upload-area').classList.contains('hidden')).toBe(true);
    expect(document.getElementById('compress-ui').classList.contains('hidden')).toBe(false);
  });

  test('setQuality updates buttons', () => {
    setQuality('high');
    expect(getState().quality).toBe('high');
    expect(document.getElementById('btn-hq').classList.contains('active')).toBe(true);
  });

  test('setTrimFromVideo populates trim inputs', () => {
    const vid = document.getElementById('video-preview');
    Object.defineProperty(vid, 'currentTime', { value: 2.5, configurable: true, writable: true });
    
    setTrimFromVideo();
    expect(document.getElementById('trim-start').value).toBe('2.5');
    
    Object.defineProperty(vid, 'currentTime', { value: 6.0, configurable: true, writable: true });
    setTrimFromVideo();
    expect(document.getElementById('trim-end').value).toBe('6.0');
    
    Object.defineProperty(vid, 'currentTime', { value: 6.0, configurable: true, writable: true });
    setTrimFromVideo();
    expect(document.getElementById('trim-start').value).toBe('6.0');
    expect(document.getElementById('trim-end').value).toBe('');
  });

  test('handleUpload handles invalid and valid files', () => {
    const invalidFile = new File([''], 'test.txt', { type: 'text/plain' });
    handleUpload({ target: { files: [invalidFile] } });
    expect(document.getElementById('processing-status').textContent).toContain('valid video');
    
    const validFile = new File([''], 'test.mp4', { type: 'video/mp4' });
    handleUpload({ dataTransfer: { files: [validFile] } });
    expect(getState().videoFile).toBe(validFile);
  });

  test('resetCompressor resets state and DOM', () => {
    resetCompressor();
    expect(getState().videoFile).toBeNull();
    expect(document.getElementById('upload-area').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('compress-ui').classList.contains('hidden')).toBe(true);
  });

  test('downloadVideo triggers download', () => {
    const blob = new Blob(['123'], { type: 'video/mp4' });
    setOutputBlobInternal(blob);
    global.document.createElement = jest.fn(() => ({ click: jest.fn() }));
    downloadVideo();
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(blob);
  });

  test('downloadVideo does nothing if outputBlob is null', () => {
    global.document.createElement = jest.fn();
    downloadVideo();
    expect(global.document.createElement).not.toHaveBeenCalled();
  });

  test('executeCompression runs successfully', async () => {
    const file = new File(['123'], 'test.mp4', { type: 'video/mp4' });
    setVideoFileInternal(file);
    
    await executeCompression();
    
    expect(document.getElementById('processing-status').classList.contains('hidden')).toBe(true);
    expect(getState().outputBlob).not.toBeNull();
    const htmlText = document.getElementById('saved-space').innerHTML;
    expect(htmlText.includes('Saved') || htmlText.includes('Processed Successfully')).toBe(true);
  });

  test('executeCompression uses trim parameters', async () => {
    const file = new File(['123'], 'vid.mp4', { type: 'video/mp4' });
    setVideoFileInternal(file);
    document.getElementById('trim-start').value = '1';
    document.getElementById('trim-end').value = '5';
    document.getElementById('video-resolution').value = '720';
    document.getElementById('video-fps').value = '30';
    document.getElementById('video-audio').value = 'mute';
    
    await executeCompression();
    
    expect(getState().outputBlob).not.toBeNull();
  });
  
  test('executeCompression catches errors', async () => {
    setVideoFileInternal(new File([], 'x.mp4', { type: 'video/mp4' }));
    // Intentionally break window._ffmpegFetchFile to trigger error
    Object.defineProperty(window, '_ffmpegFetchFile', { value: null, writable: true });
    
    await executeCompression();
    
    expect(document.getElementById('processing-status').textContent).toContain('Processing failed');
  });
});
