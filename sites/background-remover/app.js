/**
 * Background Remover & Editor Logic using img.ly & Cropper.js
 */

let cropper = null;
let currentBgColor = 'transparent';

function handleUpload(event) {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    
    document.getElementById('upload-area')?.classList.add('hidden');
    document.getElementById('results')?.classList.remove('hidden');
    document.getElementById('processing-view').style.display = 'block';
    
    const uiBox = document.getElementById('bg-canvas');
    uiBox.src = URL.createObjectURL(file); // preview original while loading
    
    // Begin AI processing
    processBackgroundRemoval(file);
}

async function processBackgroundRemoval(file) {
    const status = document.getElementById('processing-status');
    const imgObj = new Image();
    
    imgObj.onload = async () => {
        try {
            if (typeof imglyRemoveBackground !== 'function') {
                throw new Error("imglyRemoveBackground not loaded. Please ensure scripts are not blocked.");
            }
            
            const resultBlob = await imglyRemoveBackground(imgObj);
            const url = URL.createObjectURL(resultBlob);
            
            document.getElementById('processing-view').style.display = 'none';
            document.getElementById('editor-container').style.display = 'block';
            document.getElementById('action-buttons').style.display = 'flex';
            
            const rImg = document.getElementById('bg-canvas');
            rImg.src = url;
            
            // Wait for image render before cropping
            rImg.onload = () => {
                if (cropper) cropper.destroy();
                cropper = new Cropper(rImg, {
                    viewMode: 1,
                    dragMode: 'move',
                    background: false, // Make crop box transparent, we use css for checkerboard
                    autoCropArea: 1,
                    responsive: true
                });
            };
        } catch (e) {
            console.error("BG Removal Error:", e);
            if (status) {
                status.textContent = "❌ Error: Background removal failed.";
                status.style.color = "var(--error)";
            }
        }
    };
    imgObj.src = URL.createObjectURL(file);
}

// Editor Tools
function rotateImage(degree) {
    if (cropper) {
        cropper.rotate(degree);
    }
}

function updateBgColor() {
    const color = document.getElementById('bg-color').value;
    currentBgColor = color;
    document.querySelector('.cropper-wrap-box').style.backgroundColor = color;
}

function clearBgColor() {
    currentBgColor = 'transparent';
    document.querySelector('.cropper-wrap-box').style.backgroundColor = 'transparent';
    document.querySelector('.cropper-wrap-box').style.backgroundImage = 'linear-gradient(45deg, var(--color-border) 25%, transparent 25%), linear-gradient(-45deg, var(--color-border) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--color-border) 75%), linear-gradient(-45deg, transparent 75%, var(--color-border) 75%)';
}

function downloadImage() {
    if (!cropper) return;
    
    const format = document.getElementById('download-format').value;
    const btn = document.getElementById('download-btn');
    const ogText = btn.textContent;
    btn.textContent = '⏳ Processing...';
    btn.disabled = true;
    
    setTimeout(() => {
        const isTransparent = currentBgColor === 'transparent';
        const exportColor = isTransparent ? 'transparent' : currentBgColor;
        
        const canvas = cropper.getCroppedCanvas({
            fillColor: exportColor,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });
        
        canvas.toBlob((blob) => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            const ext = format === 'image/jpeg' ? 'jpg' : format.split('/')[1];
            link.download = `edited-image-${Date.now()}.${ext}`;
            link.click();
            
            btn.textContent = ogText;
            btn.disabled = false;
        }, format, 0.95);
    }, 100);
}

function resetApp() {
    location.reload(); 
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { handleUpload, resetApp, processBackgroundRemoval, rotateImage, updateBgColor, clearBgColor, downloadImage };
}
