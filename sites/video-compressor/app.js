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
        // Use UMD builds exclusively and toBlobURL for ALL scripts
        // This avoids cross-origin Worker construction errors
        const utilUrl = 'https://unpkg.com/@ffmpeg/util@0.12.1/dist/umd/index.js';
        
        // Load util first via script tag to get toBlobURL
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = utilUrl;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
        
        // Load FFmpeg UMD via script tag
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });

        const { FFmpeg } = FFmpegWASM || window.FFmpegWASM || {};
        const { toBlobURL, fetchFile } = FFmpegUtil || window.FFmpegUtil || {};

        if (!FFmpeg || !toBlobURL) {
            throw new Error('Failed to load FFmpeg libraries');
        }

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

        // Convert ALL core files to blob URLs (same-origin) to bypass Worker restrictions
        const coreBase = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        const ffmpegBase = 'https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd';

        const coreURL = await toBlobURL(`${coreBase}/ffmpeg-core.js`, 'text/javascript');
        const wasmURL = await toBlobURL(`${coreBase}/ffmpeg-core.wasm`, 'application/wasm');
        
        // classWorkerURL is REQUIRED for ffmpeg.wasm to work — must not be omitted
        let classWorkerURL;
        try {
            classWorkerURL = await toBlobURL(`${ffmpegBase}/814.ffmpeg.js`, 'text/javascript');
        } catch (we) {
            console.error('Failed to load ffmpeg worker chunk:', we);
            // Try alternative worker chunk name
            try {
                classWorkerURL = await toBlobURL(`${ffmpegBase}/ffmpeg-core.worker.js`, 'text/javascript');
            } catch (we2) {
                throw new Error('Could not load video processing worker. This may be due to browser security restrictions. Try using Chrome or Edge with the latest version.');
            }
        }

        await ff.load({
            coreURL,
            wasmURL,
            classWorkerURL
        });
        
        if (statusEl) statusEl.classList.add('hidden');
        ffmpegInstance = ff;
        return ff;
    } catch (e) {
        console.error('FFmpeg init error:', e);

        if (statusEl) {
            // User-friendly error message
            const isSecurityError = e.message.includes('Worker') || e.message.includes('cross-origin') || e.message.includes('SharedArrayBuffer');
            if (isSecurityError) {
                statusEl.innerHTML = '⚠️ Video processing requires <strong>Cross-Origin Isolation</strong> headers.<br>This feature works when deployed to Cloudflare Pages with proper COOP/COEP headers.<br><small>' + e.message + '</small>';
            } else {
                statusEl.textContent = 'Engine Load Error: ' + e.message;
            }
            statusEl.classList.remove('hidden');
        }
        throw new Error('Could not load video processing engine. ' + e.message);
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

        const formatSelect = document.getElementById('video-format')?.value || 'mp4';

        const isGif = formatSelect === 'gif';

        const isMp3 = formatSelect === 'mp3';

        const outExt = isGif ? 'gif' : isMp3 ? 'mp3' : 'mp4';

        const outputName = `output.${outExt}`;

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
        
        
        // Video Filter array

        let vFilters = [];
        

        if (resolution && resolution !== 'original') {

            vFilters.push(isGif ? `scale='min(${resolution},iw)':-1:flags=lanczos` : `scale='min(${resolution},iw)':-2`);
        }
        
        // Rotation & Flip

        const rot = document.getElementById('video-rotation')?.value;

        if (rot === 'cw90') vFilters.push('transpose=1');

        else if (rot === 'ccw90') vFilters.push('transpose=2');

        else if (rot === '180') vFilters.push('transpose=2,transpose=2');

        else if (rot === 'hflip') vFilters.push('hflip');

        else if (rot === 'vflip') vFilters.push('vflip');
        

        if (isGif) vFilters.push('split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse');
        

        if (vFilters.length > 0) {

            args.push('-vf', vFilters.join(','));
        }
        

        if (fps && fps !== 'original') {

            args.push('-r', fps.toString());
        }
        

        if (audio === 'mute' && !isMp3 && !isGif) {

            args.push('-an');
        }
        

        if (isGif) {

            args.push('-loop', '0');

        } else if (isMp3) {
            // Audio only

            args.push('-vn', '-acodec', 'libmp3lame', '-q:a', quality === 'high' ? '2' : quality === 'low' ? '6' : '4');
        } else {
            // Video encoding

            args.push('-vcodec', 'libx264', '-crf', crf, '-preset', 'ultrafast');

            args.push('-movflags', '+faststart');
        }


        args.push(outputName);


        if (statusEl) statusEl.textContent = 'Writing File...';

        await ff.writeFile(inputName, await fetchFile(videoFile));
        

        if (statusEl) statusEl.textContent = 'Executing AI Render...';

        await ff.exec(args);


        if (statusEl) statusEl.textContent = 'Finalizing Output...';

        const data = await ff.readFile(outputName);

        const mime = isGif ? 'image/gif' : isMp3 ? 'audio/mpeg' : 'video/mp4';

        outputBlob = new Blob([data.buffer], { type: mime });


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

     const formatSelect = document.getElementById('video-format')?.value || 'mp4';

     const ext = formatSelect === 'gif' ? 'gif' : formatSelect === 'mp3' ? 'mp3' : 'mp4';
    

     const link = document.createElement('a');

    link.href = URL.createObjectURL(outputBlob);

    link.download = `processed-video-${Date.now()}.${ext}`;

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

        duration: isNaN(dur) ? 'Unknown' : `${mins}:${secs.toString().padStart(2, '0')}`,

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

     if (resolution && resolution !== 'original' && resFactors[resolution]) {

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

     const suffix = quality === 'high' ? 'hq' : quality === 'low' ? 'lq' : 'mq';
    return `${base}-${suffix}-${Date.now()}.mp4`;
}

 let batchQueue = [];

/**
 * Display video metadata on file upload
 */
 function displayVideoMetadata() {
    if (typeof document === 'undefined') return;
    const vid = document.getElementById('video-preview');
    const metaEl = document.getElementById('video-metadata');
    const gridEl = document.getElementById('meta-grid');
    if (!vid || !metaEl || !gridEl) return;

    vid.addEventListener('loadedmetadata', () => {
        const meta = getVideoMetadata(vid);
        metaEl.classList.remove('hidden');
        gridEl.innerHTML = [
            { icon: '⏱️', label: 'Duration', value: meta.duration },
            { icon: '📐', label: 'Resolution', value: `${meta.width}×${meta.height}` },
            { icon: '📦', label: 'File Size', value: videoFile ? formatSize(videoFile.size) : '-' },
            { icon: '🎯', label: 'Type', value: videoFile ? videoFile.type : '-' },
        ].map(m => `<div class="bg-gray-800 p-2 rounded text-center"><div class="text-lg">${m.icon}</div><div class="text-xs text-gray-400">${m.label}</div><div class="text-sm font-bold text-white">${m.value}</div></div>`).join('');
        updateEstimateDisplay();
    }, { once: true });
}

/**
 * Show before/after comparison viewer
 */
 function showComparison() {
    if (typeof document === 'undefined') return;
    const compUI = document.getElementById('comparison-ui');
    if (!compUI) return;
    compUI.classList.toggle('hidden');
    if (!compUI.classList.contains('hidden')) {
        const origVid = document.getElementById('compare-original');
        const compVid = document.getElementById('compare-compressed');
        if (origVid && videoFile) origVid.src = URL.createObjectURL(videoFile);
        if (compVid && outputBlob) compVid.src = URL.createObjectURL(outputBlob);
    }
}

/**
 * Extract a thumbnail frame from the result video
 */
 function extractThumbnailFromResult() {
    if (typeof document === 'undefined' || !outputBlob) return;
    const vid = document.createElement('video');
    vid.src = URL.createObjectURL(outputBlob);
    vid.currentTime = 1;
    vid.addEventListener('seeked', () => {
        const canvas = document.createElement('canvas');
        canvas.width = vid.videoWidth; canvas.height = vid.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.drawImage(vid, 0, 0);
        canvas.toBlob(blob => {
            if (!blob) return;
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `thumbnail-${Date.now()}.png`;
            link.click();
        }, 'image/png');
    }, { once: true });
}

/**
 * Add files to batch queue
 */
 function addToBatch() {
    if (typeof document === 'undefined') return;
    const input = document.getElementById('batch-input');
    if (!input || !input.files) return;
    for (const f of input.files) {
        if (isVideoFile(f)) batchQueue.push(f);
    }
    renderBatchQueue();
    input.value = '';
}

 function renderBatchQueue() {
    if (typeof document === 'undefined') return;
    const el = document.getElementById('batch-queue');
    const btn = document.getElementById('batch-start');
    if (!el) return;
    if (batchQueue.length === 0) {
        el.textContent = 'Queue is empty';
        if (btn) btn.classList.add('hidden');
        return;
    }
    if (btn) btn.classList.remove('hidden');
    el.innerHTML = batchQueue.map((f, i) => `<div class="flex justify-between items-center py-1 border-b border-gray-800"><span>${f.name} (${formatSize(f.size)})</span><button class="text-red-400 text-xs" onclick="removeBatchItem(${i})">✕</button></div>`).join('');
}

 function removeBatchItem(index) {
    batchQueue.splice(index, 1);
    renderBatchQueue();
}

 async function processBatch() {
    if (batchQueue.length === 0) return;
    for (let i = 0; i < batchQueue.length; i++) {
        setVideoFile(batchQueue[i]);
        const statusEl = document.getElementById('processing-status');
        if (statusEl) statusEl.textContent = `Processing ${i + 1}/${batchQueue.length}: ${batchQueue[i].name}`;
        try { await executeCompression(); } catch(e) { console.error('Batch item failed:', e); }
    }
    batchQueue = [];
    renderBatchQueue();
}

/**
 * Render compression history from processingHistory
 */
 function renderCompressionHistory() {
    if (typeof document === 'undefined') return;
    const el = document.getElementById('history-log');
    if (!el) return;
    const history = getProcessingHistory();
    if (history.length === 0) { el.textContent = 'No compressions yet'; return; }
    el.innerHTML = '<table class="w-full text-left"><thead><tr><th class="py-1">Time</th><th>Original</th><th>Output</th><th>Saved</th></tr></thead><tbody>' +
        history.map(h => {
            const date = new Date(h.timestamp);
            return `<tr><td class="py-1">${date.toLocaleTimeString()}</td><td>${formatSize(h.originalSize)}</td><td>${formatSize(h.outputSize)}</td><td class="text-green-400">${h.savings}%</td></tr>`;
        }).join('') + '</tbody></table>';
}

/**
 * Build audio-related FFmpeg args
 */
 function buildAudioArgs() {
    if (typeof document === 'undefined') return [];
    const args = [];
    const volume = parseInt(document.getElementById('audio-volume')?.value || '100');
    const fade = document.getElementById('audio-fade')?.value || 'none';
    const audioFile = document.getElementById('audio-input')?.files?.[0];

    let aFilters = [];
    if (volume !== 100) aFilters.push(`volume=${volume / 100}`);
    if (fade === 'fadein' || fade === 'both') aFilters.push('afade=t=in:st=0:d=2');
    if (fade === 'fadeout' || fade === 'both') aFilters.push('afade=t=out:st=-2:d=2');
    if (aFilters.length > 0) args.push('-af', aFilters.join(','));

    return { args, hasAudioFile: !!audioFile, audioFile };
}

/**
 * Get batch queue for testing
 */
 function getBatchQueue() { return [...batchQueue]; }
 function clearBatchQueue() { batchQueue = []; }

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

     if (!videoFile) return;

     const quality = document.getElementById('btn-hq')?.classList.contains('active') ? 'high'

        : document.getElementById('btn-lq')?.classList.contains('active') ? 'low' : 'medium';

     const resolution = document.getElementById('video-resolution')?.value || 'original';

     const est = estimateOutputSize(videoFile.size, quality, resolution);

     const el = document.getElementById('estimate-display');

    if (el) el.textContent = `~${est.estimatedSizeFormatted} (${est.reductionPct}% smaller)`;
}


 if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        setupDragDrop();
        // Volume label update
        const volSlider = document.getElementById('audio-volume');
        if (volSlider) volSlider.addEventListener('input', (e) => {
            const label = document.getElementById('audio-vol-label');
            if (label) label.textContent = e.target.value + '%';
        });
    });
}


 if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        qualityToCRF, formatSize, calcSavings, isVideoFile,
        initFFmpeg, handleUpload, setVideoFile, setTrimFromVideo, setQuality,
        executeCompression, downloadVideo, resetCompressor, showError, setupDragDrop,
         // New features
        getVideoMetadata, estimateOutputSize, setPlaybackSpeed, getOutputFilename,
        addHistoryEntry, getProcessingHistory, clearProcessingHistory, updateEstimateDisplay,
        // Phase 3 features
        displayVideoMetadata, showComparison, extractThumbnailFromResult,
        addToBatch, renderBatchQueue, removeBatchItem, processBatch, renderCompressionHistory,
        buildAudioArgs, getBatchQueue, clearBatchQueue,
        getState: () => ({ videoFile, quality, outputBlob, isFFmpegLoaded: !!ffmpegInstance, processingHistory, batchQueue: [...batchQueue] }),
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

