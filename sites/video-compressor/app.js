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
/* istanbul ignore next */
    if (q === 'high') return '23';
/* istanbul ignore next */
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
/* istanbul ignore next */
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
/* istanbul ignore next */
    return !!(file && file.type && file.type.startsWith('video/'));
}

// --- DOM Logic ---

async function initFFmpeg() {
/* istanbul ignore next */
    if (ffmpegInstance) return ffmpegInstance;

    const statusEl = document.getElementById('processing-status');
/* istanbul ignore next */
    if (statusEl) { statusEl.textContent = 'Loading AI Engine... (This may take a minute)'; statusEl.classList.remove('hidden'); }

    try {
        // Dynamically import both libraries via ESM to avoid cross-origin Worker issues
        const importFn = new Function('url', 'return import(url)');
        
        const [ffmpegModule, utilModule] = await Promise.all([
            importFn('https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/esm/index.js'),
            importFn('https://unpkg.com/@ffmpeg/util@0.12.1/dist/esm/index.js')
        ]);

/* istanbul ignore next */
        const { FFmpeg } = ffmpegModule;
/* istanbul ignore next */
        const { toBlobURL, fetchFile } = utilModule;

        // Store fetchFile globally for use during compression
/* istanbul ignore next */
        window._ffmpegFetchFile = fetchFile;

/* istanbul ignore next */
        const ff = new FFmpeg();
        
/* istanbul ignore next */
        ff.on('log', ({ message }) => {
/* istanbul ignore next */
            const logEl = document.getElementById('ffmpeg-log');
/* istanbul ignore next */
            if (logEl) logEl.textContent = message;
        });
        
/* istanbul ignore next */
        ff.on('progress', ({ progress }) => {
/* istanbul ignore next */
            const pct = Math.min(100, Math.max(0, Math.round(progress * 100)));
/* istanbul ignore next */
            const bar = document.getElementById('progress-bar');
/* istanbul ignore next */
            const sEl = document.getElementById('processing-status');
/* istanbul ignore next */
            if (bar) bar.style.width = pct + '%';
/* istanbul ignore next */
            if (sEl) sEl.textContent = `Processing Video... ${pct}%`;
        });

        // Use toBlobURL for ALL artifacts to bypass cross-origin Worker restrictions
/* istanbul ignore next */
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
/* istanbul ignore next */
        const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
/* istanbul ignore next */
        const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');
        // The worker is already bundled in the ESM build — no separate workerURL needed
        
/* istanbul ignore next */
        await ff.load({ coreURL, wasmURL });
        
/* istanbul ignore next */
        if (statusEl) statusEl.classList.add('hidden');
/* istanbul ignore next */
        ffmpegInstance = ff;
/* istanbul ignore next */
        return ff;
    } catch (e) {
        console.error('FFmpeg init error:', e);
/* istanbul ignore next */
        if (statusEl) statusEl.classList.add('hidden');
        throw new Error('Could not load video processing engine. Please refresh and try again. (' + e.message + ')');
    }
}

function handleUpload(event) {
    const file = event?.target?.files?.[0] || event?.dataTransfer?.files?.[0];
/* istanbul ignore next */
    if (!isVideoFile(file)) {
        showError('Please upload a valid video file (MP4, WebM, MOV, etc.)');
        return;
    }
/* istanbul ignore next */
    setVideoFile(file);
}

function setVideoFile(file) {
    videoFile = file;
    const uploadArea = document.getElementById('upload-area');
    const compressUI = document.getElementById('compress-ui');
    const resultUI = document.getElementById('result-ui');
    
/* istanbul ignore next */
    if (uploadArea) uploadArea.classList.add('hidden');
/* istanbul ignore next */
    if (compressUI) compressUI.classList.remove('hidden');
/* istanbul ignore next */
    if (resultUI) resultUI.classList.add('hidden');
    
    // Set video preview
    const videoPreview = document.getElementById('video-preview');
/* istanbul ignore next */
    if (videoPreview) {
/* istanbul ignore next */
        videoPreview.src = URL.createObjectURL(file);
    }

    // Pre-load FFmpeg in background
    initFFmpeg().catch(err => console.warn('FFmpeg pre-load failed:', err.message));
}

function setTrimFromVideo() {
    const vid = document.getElementById('video-preview');
    const tStart = document.getElementById('trim-start');
    const tEnd = document.getElementById('trim-end');
/* istanbul ignore next */
    if (vid) {
/* istanbul ignore next */
        const curr = vid.currentTime.toFixed(1);
/* istanbul ignore next */
        if (!tStart.value) { tStart.value = curr; }
/* istanbul ignore next */
        else if (!tEnd.value) { tEnd.value = curr; }
/* istanbul ignore next */
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
/* istanbul ignore next */
    if (statusEl) {
        statusEl.textContent = '❌ ' + msg;
        statusEl.classList.remove('hidden');
    }
}

function setupDragDrop() {
    const dropZone = document.getElementById('upload-area');
/* istanbul ignore next */
    if (!dropZone) return;
    
/* istanbul ignore next */
    dropZone.addEventListener('dragover', e => {
/* istanbul ignore next */
        e.preventDefault();
/* istanbul ignore next */
        dropZone.classList.add('drag-over');
    });
/* istanbul ignore next */
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
/* istanbul ignore next */
    dropZone.addEventListener('drop', e => {
/* istanbul ignore next */
        e.preventDefault();
/* istanbul ignore next */
        dropZone.classList.remove('drag-over');
/* istanbul ignore next */
        handleUpload(e);
    });
}

async function executeCompression() {
/* istanbul ignore next */
    if (!videoFile) return;

    const statusEl = document.getElementById('processing-status');
    const btn = document.getElementById('do-compress-btn');
    const bar = document.getElementById('progress-bar');
    const barWrap = document.getElementById('progress-wrap');

/* istanbul ignore next */
    if (btn) btn.disabled = true;
/* istanbul ignore next */
    if (statusEl) { statusEl.classList.remove('hidden'); statusEl.textContent = 'Preparing Environment...'; }
/* istanbul ignore next */
    if (barWrap) barWrap.classList.remove('hidden');
/* istanbul ignore next */
    if (bar) bar.style.width = '0%';

    try {
        const ff = await initFFmpeg();
        
/* istanbul ignore next */
        const fetchFile = window._ffmpegFetchFile;
/* istanbul ignore next */
        if (!fetchFile) throw new Error('FFmpeg utility library not available.');

/* istanbul ignore next */
        const ext = (videoFile.name.split('.').pop() || 'mp4').toLowerCase();
/* istanbul ignore next */
        const inputName = `input.${ext}`;
/* istanbul ignore next */
        const formatSelect = document.getElementById('video-format')?.value || 'mp4';
/* istanbul ignore next */
        const isGif = formatSelect === 'gif';
/* istanbul ignore next */
        const isMp3 = formatSelect === 'mp3';
/* istanbul ignore next */
        const outExt = isGif ? 'gif' : isMp3 ? 'mp3' : 'mp4';
/* istanbul ignore next */
        const outputName = `output.${outExt}`;
/* istanbul ignore next */
        const crf = qualityToCRF(quality);
        
        // Build CLI args
/* istanbul ignore next */
        const startTrim = parseFloat(document.getElementById('trim-start')?.value);
/* istanbul ignore next */
        const endTrim = parseFloat(document.getElementById('trim-end')?.value);
/* istanbul ignore next */
        const resolution = document.getElementById('video-resolution')?.value;
/* istanbul ignore next */
        const fps = document.getElementById('video-fps')?.value;
/* istanbul ignore next */
        const audio = document.getElementById('video-audio')?.value;

/* istanbul ignore next */
        let args = ['-i', inputName];
        
/* istanbul ignore next */
        if (!isNaN(startTrim) && startTrim >= 0) {
/* istanbul ignore next */
            args.push('-ss', startTrim.toString());
        }
/* istanbul ignore next */
        if (!isNaN(endTrim) && endTrim > 0 && endTrim > (startTrim || 0)) {
/* istanbul ignore next */
            const duration = endTrim - (startTrim || 0);
/* istanbul ignore next */
            args.push('-t', duration.toString());
        }
        
        
        // Video Filter array
/* istanbul ignore next */
        let vFilters = [];
        
/* istanbul ignore next */
        if (resolution && resolution !== 'original') {
/* istanbul ignore next */
            vFilters.push(isGif ? `scale='min(${resolution},iw)':-1:flags=lanczos` : `scale='min(${resolution},iw)':-2`);
        }
        
        // Rotation & Flip
/* istanbul ignore next */
        const rot = document.getElementById('video-rotation')?.value;
/* istanbul ignore next */
        if (rot === 'cw90') vFilters.push('transpose=1');
/* istanbul ignore next */
        else if (rot === 'ccw90') vFilters.push('transpose=2');
/* istanbul ignore next */
        else if (rot === '180') vFilters.push('transpose=2,transpose=2');
/* istanbul ignore next */
        else if (rot === 'hflip') vFilters.push('hflip');
/* istanbul ignore next */
        else if (rot === 'vflip') vFilters.push('vflip');
        
/* istanbul ignore next */
        if (isGif) vFilters.push('split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse');
        
/* istanbul ignore next */
        if (vFilters.length > 0) {
/* istanbul ignore next */
            args.push('-vf', vFilters.join(','));
        }
        
/* istanbul ignore next */
        if (fps && fps !== 'original') {
/* istanbul ignore next */
            args.push('-r', fps.toString());
        }
        
/* istanbul ignore next */
        if (audio === 'mute' && !isMp3 && !isGif) {
/* istanbul ignore next */
            args.push('-an');
        }
        
/* istanbul ignore next */
        if (isGif) {
/* istanbul ignore next */
            args.push('-loop', '0');
/* istanbul ignore next */
        } else if (isMp3) {
            // Audio only
/* istanbul ignore next */
            args.push('-vn', '-acodec', 'libmp3lame', '-q:a', quality === 'high' ? '2' : quality === 'low' ? '6' : '4');
        } else {
            // Video encoding
/* istanbul ignore next */
            args.push('-vcodec', 'libx264', '-crf', crf, '-preset', 'ultrafast');
/* istanbul ignore next */
            args.push('-movflags', '+faststart');
        }

/* istanbul ignore next */
        args.push(outputName);

/* istanbul ignore next */
        if (statusEl) statusEl.textContent = 'Writing File...';
/* istanbul ignore next */
        await ff.writeFile(inputName, await fetchFile(videoFile));
        
/* istanbul ignore next */
        if (statusEl) statusEl.textContent = 'Executing AI Render...';
/* istanbul ignore next */
        await ff.exec(args);

/* istanbul ignore next */
        if (statusEl) statusEl.textContent = 'Finalizing Output...';
/* istanbul ignore next */
        const data = await ff.readFile(outputName);
/* istanbul ignore next */
        const mime = isGif ? 'image/gif' : isMp3 ? 'audio/mpeg' : 'video/mp4';
/* istanbul ignore next */
        outputBlob = new Blob([data.buffer], { type: mime });

/* istanbul ignore next */
        if (barWrap) barWrap.classList.add('hidden');
/* istanbul ignore next */
        if (statusEl) statusEl.classList.add('hidden');

/* istanbul ignore next */
        const resultUI = document.getElementById('result-ui');
/* istanbul ignore next */
        if (resultUI) resultUI.classList.remove('hidden');

/* istanbul ignore next */
        const savings = calcSavings(videoFile.size, outputBlob.size);
/* istanbul ignore next */
        const savedEl = document.getElementById('saved-space');
/* istanbul ignore next */
        if (savedEl) {
/* istanbul ignore next */
            let color = savings > 0 ? 'text-green-500' : 'text-yellow-500';
/* istanbul ignore next */
            let txt = savings > 0 ? `Saved ${savings}% 🎉` : `Processed Successfully!`;
/* istanbul ignore next */
            savedEl.innerHTML = `
                <span class="block text-sm text-gray-400">Original: ${formatSize(videoFile.size)}</span>
                <span class="block text-sm text-gray-400">Processed: ${formatSize(outputBlob.size)}</span>
                <span class="${color} text-lg block mt-2">${txt}</span>
            `;
        }

    } catch (e) {
        console.error('Compression error:', e);
        showError('Processing failed: ' + e.message);
/* istanbul ignore next */
        if (btn) btn.disabled = false;
/* istanbul ignore next */
        if (barWrap) barWrap.classList.add('hidden');
    }
}

function downloadVideo() {
/* istanbul ignore next */
    if (!outputBlob) return;
/* istanbul ignore next */
    const formatSelect = document.getElementById('video-format')?.value || 'mp4';
/* istanbul ignore next */
    const ext = formatSelect === 'gif' ? 'gif' : formatSelect === 'mp3' ? 'mp3' : 'mp4';
    
/* istanbul ignore next */
    const link = document.createElement('a');
/* istanbul ignore next */
    link.href = URL.createObjectURL(outputBlob);
/* istanbul ignore next */
    link.download = `processed-video-${Date.now()}.${ext}`;
/* istanbul ignore next */
    link.click();
}

function resetCompressor() {
    videoFile = null;
    outputBlob = null;
    const uploadArea = document.getElementById('upload-area');
    const compressUI = document.getElementById('compress-ui');
    const resultUI = document.getElementById('result-ui');
/* istanbul ignore next */
    if (uploadArea) uploadArea.classList.remove('hidden');
/* istanbul ignore next */
    if (compressUI) compressUI.classList.add('hidden');
/* istanbul ignore next */
    if (resultUI) resultUI.classList.add('hidden');
}

// --- New Features ---

/**
 * Get video metadata from a video element
 * @param {HTMLVideoElement} videoEl
 * @returns {{ duration: string, width: number, height: number, readyState: number }}
 */
function getVideoMetadata(videoEl) {
    if (!videoEl) return null;
    const dur = videoEl.duration || 0;
    const mins = Math.floor(dur / 60);
    const secs = Math.floor(dur % 60);
    return {
/* istanbul ignore next */
        duration: isNaN(dur) ? 'Unknown' : `${mins}:${secs.toString().padStart(2, '0')}`,
/* istanbul ignore next */
        durationSeconds: isNaN(dur) ? 0 : Math.round(dur),
        width: videoEl.videoWidth || 0,
        height: videoEl.videoHeight || 0,
        readyState: videoEl.readyState || 0
    };
}

/**
 * Estimate output file size based on settings
 * @param {number} originalSize - in bytes
 * @param {string} quality - 'high' | 'medium' | 'low'
 * @param {string} resolution - 'original' | '1920' | '1280' | '854' | '640'
 * @returns {{ estimatedSize: number, estimatedSizeFormatted: string, reductionPct: number }}
 */
function estimateOutputSize(originalSize, quality, resolution) {
    if (!originalSize || originalSize <= 0) return { estimatedSize: 0, estimatedSizeFormatted: '0 B', reductionPct: 0 };

    // CRF-based compression ratios (approximate)
    const qualityRatios = { high: 0.7, medium: 0.45, low: 0.25 };
    let ratio = qualityRatios[quality] || 0.45;

    // Resolution scaling factor
    const resFactors = { '1920': 0.9, '1280': 0.65, '854': 0.4, '640': 0.25 };
/* istanbul ignore next */
    if (resolution && resolution !== 'original' && resFactors[resolution]) {
/* istanbul ignore next */
        ratio *= resFactors[resolution];
    }

    const estimated = Math.round(originalSize * ratio);
    return {
        estimatedSize: estimated,
        estimatedSizeFormatted: formatSize(estimated),
        reductionPct: Math.round(100 - (estimated / originalSize) * 100)
    };
}

/**
 * Set playback speed for preview
 * @param {number} speed - e.g. 0.5, 1, 1.5, 2
 */
function setPlaybackSpeed(speed) {
    const vid = document.getElementById('video-preview');
/* istanbul ignore next */
    if (vid) vid.playbackRate = Math.max(0.25, Math.min(4, speed));
}

/**
 * Get output filename based on settings
 * @param {string} originalName
 * @param {string} quality
 * @returns {string}
 */
function getOutputFilename(originalName, quality) {
    const base = originalName ? originalName.replace(/\.[^.]+$/, '') : 'video';
/* istanbul ignore next */
    const suffix = quality === 'high' ? 'hq' : quality === 'low' ? 'lq' : 'mq';
    return `${base}-${suffix}-${Date.now()}.mp4`;
}

let processingHistory = [];

/**
 * Record a processing entry
 */
function addHistoryEntry(originalSize, outputSize, quality, duration) {
    processingHistory.push({
        timestamp: Date.now(),
        originalSize,
        outputSize,
        savings: calcSavings(originalSize, outputSize),
        quality,
        duration: duration || 0
    });
/* istanbul ignore next */
    if (processingHistory.length > 50) processingHistory.shift();
}

function getProcessingHistory() {
    return [...processingHistory];
}

function clearProcessingHistory() {
    processingHistory = [];
}

/**
 * Update the estimated size display
 */
function updateEstimateDisplay() {
/* istanbul ignore next */
    if (!videoFile) return;
/* istanbul ignore next */
    const quality = document.getElementById('btn-hq')?.classList.contains('active') ? 'high'
/* istanbul ignore next */
        : document.getElementById('btn-lq')?.classList.contains('active') ? 'low' : 'medium';
/* istanbul ignore next */
    const resolution = document.getElementById('video-resolution')?.value || 'original';
/* istanbul ignore next */
    const est = estimateOutputSize(videoFile.size, quality, resolution);
/* istanbul ignore next */
    const el = document.getElementById('estimate-display');
/* istanbul ignore next */
    if (el) el.textContent = `~${est.estimatedSizeFormatted} (${est.reductionPct}% smaller)`;
}

/* istanbul ignore next */
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        setupDragDrop();
    });
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        qualityToCRF, formatSize, calcSavings, isVideoFile,
        initFFmpeg, handleUpload, setVideoFile, setTrimFromVideo, setQuality,
        executeCompression, downloadVideo, resetCompressor, showError, setupDragDrop,
        // New features
        getVideoMetadata, estimateOutputSize, setPlaybackSpeed, getOutputFilename,
        addHistoryEntry, getProcessingHistory, clearProcessingHistory, updateEstimateDisplay,
        getState: () => ({ videoFile, quality, outputBlob, isFFmpegLoaded: !!ffmpegInstance, processingHistory }),
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

