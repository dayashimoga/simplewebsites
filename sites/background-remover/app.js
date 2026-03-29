/**
 * Background Remover & Editor Logic
 * Uses @imgly/background-removal (WASM) + Cropper.js for editing
 */

let cropper = null;
let currentBgColor = 'transparent';
let processedImageUrl = null;

function handleUpload(event) {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    
    document.getElementById('upload-area')?.classList.add('hidden');
    document.getElementById('results')?.classList.remove('hidden');
    document.getElementById('processing-view').style.display = 'block';
    document.getElementById('editor-container').style.display = 'none';
    document.getElementById('action-buttons').style.display = 'none';
    
    const status = document.getElementById('processing-status');
    if (status) {
        status.textContent = '⏳ Loading AI model (this may take 30-60s on first use)...';
        status.style.color = '';
    }
    
    // Show original image preview while processing
    const previewImg = document.getElementById('bg-canvas');
    previewImg.src = URL.createObjectURL(file);
    
    processBackgroundRemoval(file);
}

async function processBackgroundRemoval(file) {
    const status = document.getElementById('processing-status');
    
    try {
        if (status) status.textContent = '⏳ Fetching AI models... (this may take up to a minute on first run)';
        
        let removeBgFunc;
        try {
            const imglyModule = (typeof window !== 'undefined' && window._TEST_IMGLY_) 
                ? window._TEST_IMGLY_ 
                : await import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.4.3/+esm');
            
            removeBgFunc = imglyModule.removeBackground || imglyModule.default;
            if (!removeBgFunc) throw new Error('No default export found');
        } catch (mErr) {
            throw new Error('Failed to load AI model logic. Please check your internet connection or adblocker.');
        }

        if (status) status.textContent = '⏳ Removing background... (processing on your device)';
        
        // Pass the File (Blob) directly
        const resultBlob = await removeBgFunc(file);
        processedImageUrl = URL.createObjectURL(resultBlob);
        
        // Transition to editor
        document.getElementById('processing-view').style.display = 'none';
        document.getElementById('editor-container').style.display = 'block';
        document.getElementById('action-buttons').style.display = 'flex';
        
        const rImg = document.getElementById('bg-canvas');
        rImg.src = processedImageUrl;
        
        // Initialize Cropper once image loads
        rImg.onload = () => {
            if (typeof Cropper !== 'undefined') {
                if (cropper) cropper.destroy();
                cropper = new Cropper(rImg, {
                    viewMode: 1,
                    dragMode: 'move',
                    background: false,
                    autoCropArea: 1,
                    responsive: true
                });
            }
        };
    } catch (e) {
        console.error('BG Removal Error:', e);
        if (status) {
            status.textContent = '❌ Error: ' + (e.message || 'Background removal failed.');
            status.style.color = 'var(--color-error, #ef4444)';
        }
        // Show a retry button
        document.getElementById('action-buttons').style.display = 'flex';
    }
}

// Editor Tools
function rotateImage(degree) {
    if (cropper) cropper.rotate(degree);
}

function updateBgColor() {
    const color = document.getElementById('bg-color')?.value || '#000000';
    currentBgColor = color;
    const wrapBox = document.querySelector('.cropper-wrap-box');
    if (wrapBox) {
        wrapBox.style.backgroundColor = color;
        wrapBox.style.backgroundImage = 'none';
    }
}

function clearBgColor() {
    currentBgColor = 'transparent';
    const wrapBox = document.querySelector('.cropper-wrap-box');
    if (wrapBox) {
        wrapBox.style.backgroundColor = 'transparent';
        wrapBox.style.backgroundImage = '';
    }
}

function downloadImage() {
    if (!cropper) {
        // Fallback: download the processed image directly if cropper isn't available
        if (processedImageUrl) {
            const link = document.createElement('a');
            link.href = processedImageUrl;
            link.download = `bg-removed-${Date.now()}.png`;
            link.click();
        }
        return;
    }
    
    const format = document.getElementById('download-format')?.value || 'image/png';
    const btn = document.getElementById('download-btn');
    const ogText = btn ? btn.textContent : '';
    if (btn) { btn.textContent = '⏳ Processing...'; btn.disabled = true; }
    
    setTimeout(() => {
        const fillColor = currentBgColor === 'transparent' ? 'transparent' : currentBgColor;
        
        const canvas = cropper.getCroppedCanvas({
            fillColor: fillColor,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });
        
        canvas.toBlob((blob) => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            const ext = format === 'image/jpeg' ? 'jpg' : format.split('/')[1];
            link.download = `edited-image-${Date.now()}.${ext}`;
            link.click();
            
            if (btn) { btn.textContent = ogText; btn.disabled = false; }
        }, format, 0.95);
    }, 100);
}

function resetApp() {
    location.reload(); 
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { handleUpload, resetApp, processBackgroundRemoval, rotateImage, updateBgColor, clearBgColor, downloadImage };
}
