/**
 * Video Compressor Core Logic using ffmpeg.wasm
 * Enhanced: drag-and-drop, quality presets, progress bar, error handling
 */

let videoFile = null;
let quality = 'medium';
let outputBlob = null;
let ffmpegInstance = null;

// --- Pure Logic (Testable) ---

/**
 * Map quality preset to CRF value (lower = better quality, larger file)
 * @param {string} q - 'high' | 'medium' | 'low'
 * @returns {string} CRF value as string
 */
function qualityToCRF(q) {
    if (q === 'high') return '23';
    if (q === 'low') return '34';
    return '28'; // medium default
}

/**
 * Format file size in human-readable form
 * @param {number} bytes
 * @returns {string}
 */
function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Calculate compression savings percentage
 * @param {number} originalSize
 * @param {number} compressedSize
 * @returns {number} percentage saved (0-100)
 */
function calcSavings(originalSize, compressedSize) {
    if (!originalSize || originalSize <= 0) return 0;
    return Math.max(0, Math.round(100 - (compressedSize / originalSize) * 100));
}

/**
 * Validate a file is a video
 * @param {File} file
 * @returns {boolean}
 */
function isVideoFile(file) {
    return !!(file && file.type && file.type.startsWith('video/'));
}

// --- DOM Logic ---

async function initFFmpeg() {
    if (ffmpegInstance) return ffmpegInstance;

    const statusEl = document.getElementById('processing-status');
    if (statusEl) { statusEl.textContent = 'Loading AI Engine... (This may take a minute)'; statusEl.classList.remove('hidden'); }

    try {
        // Dynamically import both libraries via ESM to avoid cross-origin Worker issues
        const importFn = new Function('url', 'return import(url)');
        
        const [ffmpegModule, utilModule] = await Promise.all([
            importFn('https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/esm/index.js'),
            importFn('https://unpkg.com/@ffmpeg/util@0.12.1/dist/esm/index.js')
        ]);

        const { FFmpeg } = ffmpegModule;
        const { toBlobURL, fetchFile } = utilModule;

        // Store fetchFile globally for use during compression
        window._ffmpegFetchFile = fetchFile;

        const ff = new FFmpeg();
        
        ff.on('log', ({ message }) => {
            const logEl = document.getElementById('ffmpeg-log');
            if (logEl) logEl.textContent = message;
        });
        
        ff.on('progress', ({ progress }) => {
            const pct = Math.min(100, Math.max(0, Math.round(progress * 100)));
            const bar = document.getElementById('progress-bar');
            const sEl = document.getElementById('processing-status');
            if (bar) bar.style.width = pct + '%';
            if (sEl) sEl.textContent = `Processing Video... ${pct}%`;
        });

        // Use toBlobURL for ALL artifacts to bypass cross-origin Worker restrictions
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
        const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');
        // The worker is already bundled in the ESM build — no separate workerURL needed
        
        await ff.load({ coreURL, wasmURL });
        
        if (statusEl) statusEl.classList.add('hidden');
        ffmpegInstance = ff;
        return ff;
    } catch (e) {
        console.error('FFmpeg init error:', e);
        if (statusEl) statusEl.classList.add('hidden');
        throw new Error('Could not load video processing engine. Please refresh and try again. (' + e.message + ')');
    }
}

function handleUpload(event) {
    const file = event?.target?.files?.[0] || event?.dataTransfer?.files?.[0];
    if (!isVideoFile(file)) {
        showError('Please upload a valid video file (MP4, WebM, MOV, etc.)');
        return;
    }
    setVideoFile(file);
}

function setVideoFile(file) {
    videoFile = file;
    const uploadArea = document.getElementById('upload-area');
    const compressUI = document.getElementById('compress-ui');
    const resultUI = document.getElementById('result-ui');
    
    if (uploadArea) uploadArea.classList.add('hidden');
    if (compressUI) compressUI.classList.remove('hidden');
    if (resultUI) resultUI.classList.add('hidden');
    
    // Set video preview
    const videoPreview = document.getElementById('video-preview');
    if (videoPreview) {
        videoPreview.src = URL.createObjectURL(file);
    }

    // Pre-load FFmpeg in background
    initFFmpeg().catch(err => console.warn('FFmpeg pre-load failed:', err.message));
}

function setTrimFromVideo() {
    const vid = document.getElementById('video-preview');
    const tStart = document.getElementById('trim-start');
    const tEnd = document.getElementById('trim-end');
    if (vid) {
        const curr = vid.currentTime.toFixed(1);
        if (!tStart.value) { tStart.value = curr; }
        else if (!tEnd.value) { tEnd.value = curr; }
        else { tStart.value = curr; tEnd.value = ''; }
    }
}

function setQuality(q) {
    quality = q;
    const levels = ['high', 'medium', 'low'];
    levels.forEach(lvl => {
        const id = lvl === 'high' ? 'btn-hq' : lvl === 'medium' ? 'btn-mq' : 'btn-lq';
        const btn = document.getElementById(id);
        if (btn) {
            btn.classList.toggle('active', lvl === q);
            btn.classList.toggle('btn-primary', lvl === q);
            btn.classList.toggle('btn-secondary', lvl !== q);
        }
    });
}

function showError(msg) {
    const statusEl = document.getElementById('processing-status');
    if (statusEl) {
        statusEl.textContent = '❌ ' + msg;
        statusEl.classList.remove('hidden');
    }
}

function setupDragDrop() {
    const dropZone = document.getElementById('upload-area');
    if (!dropZone) return;
    
    dropZone.addEventListener('dragover', e => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', e => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        handleUpload(e);
    });
}

async function executeCompression() {
    if (!videoFile) return;

    const statusEl = document.getElementById('processing-status');
    const btn = document.getElementById('do-compress-btn');
    const bar = document.getElementById('progress-bar');
    const barWrap = document.getElementById('progress-wrap');

    if (btn) btn.disabled = true;
    if (statusEl) { statusEl.classList.remove('hidden'); statusEl.textContent = 'Preparing Environment...'; }
    if (barWrap) barWrap.classList.remove('hidden');
    if (bar) bar.style.width = '0%';

    try {
        const ff = await initFFmpeg();
        
        const fetchFile = window._ffmpegFetchFile;
        if (!fetchFile) throw new Error('FFmpeg utility library not available.');

        const ext = (videoFile.name.split('.').pop() || 'mp4').toLowerCase();
        const inputName = `input.${ext}`;
        const outputName = 'output.mp4';
        const crf = qualityToCRF(quality);
        
        // Build CLI args
        const startTrim = parseFloat(document.getElementById('trim-start')?.value);
        const endTrim = parseFloat(document.getElementById('trim-end')?.value);
        const resolution = document.getElementById('video-resolution')?.value;
        const fps = document.getElementById('video-fps')?.value;
        const audio = document.getElementById('video-audio')?.value;

        let args = ['-i', inputName];
        
        if (!isNaN(startTrim) && startTrim >= 0) {
            args.push('-ss', startTrim.toString());
        }
        if (!isNaN(endTrim) && endTrim > 0 && endTrim > (startTrim || 0)) {
            const duration = endTrim - (startTrim || 0);
            args.push('-t', duration.toString());
        }
        
        args.push('-vcodec', 'libx264', '-crf', crf, '-preset', 'ultrafast');
        
        if (resolution && resolution !== 'original') {
            args.push('-vf', `scale='min(${resolution},iw)':-2`);
        }
        
        if (fps && fps !== 'original') {
            args.push('-r', fps.toString());
        }
        
        if (audio === 'mute') {
            args.push('-an');
        }
        
        args.push('-movflags', '+faststart', outputName);

        if (statusEl) statusEl.textContent = 'Writing File...';
        await ff.writeFile(inputName, await fetchFile(videoFile));
        
        if (statusEl) statusEl.textContent = 'Executing AI Render...';
        await ff.exec(args);

        if (statusEl) statusEl.textContent = 'Finalizing Output...';
        const data = await ff.readFile(outputName);
        outputBlob = new Blob([data.buffer], { type: 'video/mp4' });

        if (barWrap) barWrap.classList.add('hidden');
        if (statusEl) statusEl.classList.add('hidden');

        const resultUI = document.getElementById('result-ui');
        if (resultUI) resultUI.classList.remove('hidden');

        const savings = calcSavings(videoFile.size, outputBlob.size);
        const savedEl = document.getElementById('saved-space');
        if (savedEl) {
            let color = savings > 0 ? 'text-green-500' : 'text-yellow-500';
            let txt = savings > 0 ? `Saved ${savings}% 🎉` : `Processed Successfully!`;
            savedEl.innerHTML = `
                <span class="block text-sm text-gray-400">Original: ${formatSize(videoFile.size)}</span>
                <span class="block text-sm text-gray-400">Processed: ${formatSize(outputBlob.size)}</span>
                <span class="${color} text-lg block mt-2">${txt}</span>
            `;
        }

    } catch (e) {
        console.error('Compression error:', e);
        showError('Processing failed: ' + e.message);
        if (btn) btn.disabled = false;
        if (barWrap) barWrap.classList.add('hidden');
    }
}

function downloadVideo() {
    if (!outputBlob) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(outputBlob);
    link.download = `compressed-video-${Date.now()}.mp4`;
    link.click();
}

function resetCompressor() {
    videoFile = null;
    outputBlob = null;
    const uploadArea = document.getElementById('upload-area');
    const compressUI = document.getElementById('compress-ui');
    const resultUI = document.getElementById('result-ui');
    if (uploadArea) uploadArea.classList.remove('hidden');
    if (compressUI) compressUI.classList.add('hidden');
    if (resultUI) resultUI.classList.add('hidden');
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        setupDragDrop();
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        qualityToCRF, formatSize, calcSavings, isVideoFile,
        initFFmpeg, handleUpload, setVideoFile, setTrimFromVideo, setQuality,
        executeCompression, downloadVideo, resetCompressor,
        getState: () => ({ videoFile, quality, outputBlob, isFFmpegLoaded: !!ffmpegInstance }),
        setVideoFileInternal: f => { videoFile = f; },
        setQualityInternal: q => { quality = q; },
        setOutputBlobInternal: b => { outputBlob = b; },
        // For testing
        resetFFmpeg: () => { ffmpegInstance = null; },
        getFFmpeg: () => ffmpegInstance,
        getVideoFile: () => videoFile,
        getQuality: () => quality,
        getOutputBlob: () => outputBlob
    };
}
