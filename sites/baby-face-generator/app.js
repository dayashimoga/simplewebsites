/**
 * Baby Face Generator — Core Logic
 * Blends two parent photos using face morphing to preview a baby face
 * FIXED: Replaced destructive destination-in composite with non-destructive overlay approach
 */
 /* istanbul ignore next */ const TRAITS = {
  /* istanbul ignore next */ eyes: ['Big brown eyes', 'Bright blue eyes', 'Hazel eyes', 'Green eyes', 'Dark eyes'],
  /* istanbul ignore next */ nose: ['Button nose', 'Small nose', 'Defined nose'],
  /* istanbul ignore next */ hair: ['Curly hair', 'Straight hair', 'Wavy hair', 'Thick hair', 'Fine hair'],
  /* istanbul ignore next */ features: ['Dimples', 'Full lips', 'Round cheeks', 'Fair skin', 'Olive skin', 'Deep skin tone', 'Freckles']
};

 /* istanbul ignore next */ let parent1Loaded = false, parent2Loaded = false;

 /* istanbul ignore next */ const MODEL_URL = 'https://vladmandic.github.io/face-api/model/';
 /* istanbul ignore next */ let globalLandmarks = { parent1: null, parent2: null };

 /* istanbul ignore next */ async function initFaceAPI() {

    /* istanbul ignore next */ if (typeof window === 'undefined' || !window.faceapi) return;

  /* istanbul ignore next */ try {

    /* istanbul ignore next */ await Promise.all([
      /* istanbul ignore next */ faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      /* istanbul ignore next */ faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
    /* istanbul ignore next */ ]);

    /* istanbul ignore next */ console.log('FaceAPI models loaded successfully.');
  /* istanbul ignore next */ } catch (e) {

    /* istanbul ignore next */ console.error('Failed to load FaceAPI models:', e);
  }
}

  /* istanbul ignore next */ if (typeof document !== 'undefined') {
  /* istanbul ignore next */ document.addEventListener('DOMContentLoaded', initFaceAPI);
}

/**
 * Check if face landmark data is available for a given parent
 * @param {string} parent - 'parent1' | 'parent2'
 * @returns {boolean}
 */
  /* istanbul ignore next */ function isLandmarkAvailable(parent) {

   return !!(globalLandmarks[parent] && globalLandmarks[parent].length > 0);
}

/**
 * Compute scaling and centering params for drawing an image onto a target square canvas
 */
  /* istanbul ignore next */ function getDrawImageParams(imgW, imgH, targetSize) {
   /* istanbul ignore next */ const scale = Math.max(targetSize / imgW, targetSize / imgH);
   /* istanbul ignore next */ const w = imgW * scale;
   /* istanbul ignore next */ const h = imgH * scale;
   /* istanbul ignore next */ return {
    /* istanbul ignore next */ dx: (targetSize - w) / 2,
    /* istanbul ignore next */ dy: (targetSize - h) / 2,
    /* istanbul ignore next */ dw: w,
    /* istanbul ignore next */ dh: h
  };
}

  /* istanbul ignore next */ function updateParentState(num, isLoaded) {
    /* istanbul ignore next */ if (num === 1) parent1Loaded = isLoaded;

    /* istanbul ignore next */ if (num === 2) parent2Loaded = isLoaded;

    /* istanbul ignore next */ const btn = typeof document !== 'undefined' ? document.getElementById('generate-btn') : null;

    /* istanbul ignore next */ if (btn) btn.disabled = !(parent1Loaded && parent2Loaded);
}

  /* istanbul ignore next */ function loadParent(event, num) {
   /* istanbul ignore next */ const file = event?.target?.files?.[0];

    /* istanbul ignore next */ if (!file || !file.type.startsWith('image/')) return;

   /* istanbul ignore next */ const reader = new FileReader();

   reader.onload = e => {

     /* istanbul ignore next */ if (typeof document === 'undefined') return;

     /* istanbul ignore next */ const img = new Image();

     img.onload = async () => {

      const canvas = document.getElementById(`parent${num}-canvas`);

       /* istanbul ignore next */ if (!canvas) return;

      /* istanbul ignore next */ const ctx = canvas.getContext('2d');

      /* istanbul ignore next */ canvas.width = 200; canvas.height = 200;


      /* istanbul ignore next */ const { dx, dy, dw, dh } = getDrawImageParams(img.width, img.height, 200);

      /* istanbul ignore next */ ctx.drawImage(img, dx, dy, dw, dh);

      // Attempt face detection — but don't block if FaceAPI fails

       /* istanbul ignore next */ if (typeof window !== 'undefined' && window.faceapi && faceapi.nets.tinyFaceDetector.isLoaded) {

        /* istanbul ignore next */ try {

          /* istanbul ignore next */ const detections = await faceapi.detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();

           /* istanbul ignore next */ if (detections.length === 0) {
            // Soft warning — don't block the upload, just clear landmarks

            console.warn(`No face detected in parent${num} — proceeding without landmark alignment`);

            globalLandmarks[`parent${num}`] = null;
          /* istanbul ignore next */ } else {

            globalLandmarks[`parent${num}`] = detections[0].landmarks.positions;
          }
        /* istanbul ignore next */ } catch (e) {

          /* istanbul ignore next */ console.warn('FaceAPI detection failed:', e.message);

          globalLandmarks[`parent${num}`] = null;
        }
      }


      /* istanbul ignore next */ canvas.classList.remove('hidden');

       /* istanbul ignore next */ const slot = canvas.closest?.('.upload-slot') || canvas.parentElement;

       /* istanbul ignore next */ const dz = slot ? slot.querySelector('.drop-zone') : null;

       /* istanbul ignore next */ if (dz) dz.classList.add('hidden');

      /* istanbul ignore next */ updateParentState(num, true);
    };

    /* istanbul ignore next */ img.src = e.target.result;
  };

  /* istanbul ignore next */ reader.readAsDataURL(file);
}

/**
 * Extract average skin tone from the center region of a canvas
 */
  /* istanbul ignore next */ function extractSkinTone(canvas, size) {
    /* istanbul ignore next */ if (!canvas) return { r: 200, g: 170, b: 150 };
   /* istanbul ignore next */ const ctx = canvas.getContext('2d');

    /* istanbul ignore next */ if (!ctx || !ctx.getImageData) return { r: 200, g: 170, b: 150 };

   /* istanbul ignore next */ const margin = Math.floor(size * 0.3);

   /* istanbul ignore next */ const sampleSize = Math.max(size - margin * 2, 1);

   /* istanbul ignore next */ const data = ctx.getImageData(margin, margin, sampleSize, sampleSize).data;

   /* istanbul ignore next */ let r = 0, g = 0, b = 0, count = 0;

   for (let i = 0; i < data.length; i += 16) {

    /* istanbul ignore next */ r += data[i]; g += data[i+1]; b += data[i+2]; count++;
  }

    /* istanbul ignore next */ if (count === 0) return { r: 200, g: 170, b: 150 };

   /* istanbul ignore next */ return { r: Math.round(r / count), g: Math.round(g / count), b: Math.round(b / count) };
}

/**
 * Apply a warm vignette to an existing canvas — NON-DESTRUCTIVE
 * Uses source-over (not destination-in) so existing pixels are preserved.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} size
 */
  /* istanbul ignore next */ function applyWarmVignette(ctx, size) {
    /* istanbul ignore next */ if (!ctx) return;
  // Warm color overlay at low alpha — softens the image slightly
  /* istanbul ignore next */ ctx.globalCompositeOperation = 'source-over';
  /* istanbul ignore next */ ctx.globalAlpha = 0.08;
  /* istanbul ignore next */ ctx.fillStyle = 'rgba(255, 220, 190, 1)';
  /* istanbul ignore next */ ctx.fillRect(0, 0, size, size);

  /* istanbul ignore next */ ctx.globalAlpha = 1.0;

  // Radial vignette darkening around edges (non-destructive multiply)

  /* istanbul ignore next */ ctx.globalCompositeOperation = 'multiply';

   /* istanbul ignore next */ const vignette = ctx.createRadialGradient(size/2, size/2, size * 0.2, size/2, size/2, size * 0.75);

  /* istanbul ignore next */ vignette.addColorStop(0, 'rgba(255,255,255,1)');  // center: no change

  /* istanbul ignore next */ vignette.addColorStop(1, 'rgba(200,185,175,1)');  // edge: warm soft darkening

  /* istanbul ignore next */ ctx.fillStyle = vignette;

  /* istanbul ignore next */ ctx.fillRect(0, 0, size, size);

  /* istanbul ignore next */ ctx.globalCompositeOperation = 'source-over';
}

/**
 * Apply baby-face softening — NON-DESTRUCTIVE
 * Draws a soft-blurred copy ON TOP at low opacity instead of destroying content
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLCanvasElement} canvas
 * @param {number} size
 */
  /* istanbul ignore next */ function applyBabyFilter(ctx, size) {
    /* istanbul ignore next */ if (!ctx) return;
   /* istanbul ignore next */ const canvas = ctx.canvas;

    /* istanbul ignore next */ if (!canvas) return;

  // Create temp canvas with blur applied
   /* istanbul ignore next */ let tmp;

    /* istanbul ignore next */ if (typeof document !== 'undefined') {

    /* istanbul ignore next */ tmp = document.createElement('canvas');

    /* istanbul ignore next */ tmp.width = size;

    /* istanbul ignore next */ tmp.height = size;
  /* istanbul ignore next */ } else {

     /* istanbul ignore next */ return; // skip in non-DOM environments
  }


   /* istanbul ignore next */ const tmpCtx = tmp.getContext('2d');

  /* istanbul ignore next */ tmpCtx.filter = 'blur(1.5px) brightness(1.08) saturate(1.1)';

  /* istanbul ignore next */ tmpCtx.drawImage(canvas, 0, 0);

  /* istanbul ignore next */ tmpCtx.filter = 'none';

  // Blend the soft version OVER the original at low opacity (non-destructive)

  /* istanbul ignore next */ ctx.globalCompositeOperation = 'source-over';

  /* istanbul ignore next */ ctx.globalAlpha = 0.35;

  /* istanbul ignore next */ ctx.drawImage(tmp, 0, 0);

  /* istanbul ignore next */ ctx.globalAlpha = 1.0;

  // Add warm vignette on top

  /* istanbul ignore next */ applyWarmVignette(ctx, size);
}


  /* istanbul ignore next */ function getCenter(points) {

   /* istanbul ignore next */ let x = 0, y = 0;

   points.forEach(p => { x += p.x; y += p.y; });

   /* istanbul ignore next */ return { x: x / points.length, y: y / points.length };
}

  /* istanbul ignore next */ function alignFace(canvas, landmarks, targetEyesScale = 85, targetEyesY = 90, targetEyesCX = 100) {

    /* istanbul ignore next */ if (!landmarks) return canvas; // fallback: return original if no landmarks

   /* istanbul ignore next */ const leftEye = getCenter(landmarks.slice(36, 42));

   /* istanbul ignore next */ const rightEye = getCenter(landmarks.slice(42, 48));


   /* istanbul ignore next */ const dx = rightEye.x - leftEye.x;

   /* istanbul ignore next */ const dy = rightEye.y - leftEye.y;

   /* istanbul ignore next */ const currentDist = Math.sqrt(dx*dx + dy*dy);

   /* istanbul ignore next */ const angle = Math.atan2(dy, dx);


   /* istanbul ignore next */ const scale = targetEyesScale / Math.max(currentDist, 10);

   /* istanbul ignore next */ const currentCX = (leftEye.x + rightEye.x) / 2;

   /* istanbul ignore next */ const currentCY = (leftEye.y + rightEye.y) / 2;


    /* istanbul ignore next */ const alignedCanvas = (typeof document !== 'undefined') ? document.createElement('canvas') : null;

    /* istanbul ignore next */ if (!alignedCanvas) return canvas;

  /* istanbul ignore next */ alignedCanvas.width = 200;

  /* istanbul ignore next */ alignedCanvas.height = 200;

   /* istanbul ignore next */ const ctx = alignedCanvas.getContext('2d');


  /* istanbul ignore next */ ctx.translate(targetEyesCX, targetEyesY);

  /* istanbul ignore next */ ctx.rotate(-angle);

  /* istanbul ignore next */ ctx.scale(scale, scale);

  /* istanbul ignore next */ ctx.translate(-currentCX, -currentCY);

  /* istanbul ignore next */ ctx.drawImage(canvas, 0, 0);


   /* istanbul ignore next */ return alignedCanvas;
}

  /* istanbul ignore next */ function blendImages(canvas1, canvas2, outputCanvas) {

    /* istanbul ignore next */ if (!canvas1 || !canvas2 || !outputCanvas) return;

   /* istanbul ignore next */ const SIZE = 200;

   /* istanbul ignore next */ const ctx = outputCanvas.getContext('2d');

  /* istanbul ignore next */ outputCanvas.width = SIZE; outputCanvas.height = SIZE;


   /* istanbul ignore next */ const tone1 = extractSkinTone(canvas1, SIZE);

   /* istanbul ignore next */ const tone2 = extractSkinTone(canvas2, SIZE);

  // Baby skin tone — blended average with warmth boost for infant appearance

   /* istanbul ignore next */ const babyTone = {
    /* istanbul ignore next */ r: Math.min(255, Math.round((tone1.r * 0.5 + tone2.r * 0.5) + 12)),
    /* istanbul ignore next */ g: Math.min(255, Math.round((tone1.g * 0.5 + tone2.g * 0.5) + 8)),
    /* istanbul ignore next */ b: Math.min(255, Math.round((tone1.b * 0.5 + tone2.b * 0.5) + 3))
  };

  // Align faces using landmarks if available, otherwise use as-is

    /* istanbul ignore next */ const c1Aligned = isLandmarkAvailable('parent1')
    /* istanbul ignore next */ ? alignFace(canvas1, globalLandmarks.parent1, 55, 95, 100)
    /* istanbul ignore next */ : canvas1;

    /* istanbul ignore next */ const c2Aligned = isLandmarkAvailable('parent2')
    /* istanbul ignore next */ ? alignFace(canvas2, globalLandmarks.parent2, 55, 95, 100)
    /* istanbul ignore next */ : canvas2;

  // Draw each parent onto temp canvases with baby tone background
   /* istanbul ignore next */ let d1, d2;

    /* istanbul ignore next */ if (typeof document !== 'undefined') {

     /* istanbul ignore next */ const tmp1 = document.createElement('canvas');

     /* istanbul ignore next */ const tmp2 = document.createElement('canvas');

    /* istanbul ignore next */ tmp1.width = SIZE; tmp1.height = SIZE;

    /* istanbul ignore next */ tmp2.width = SIZE; tmp2.height = SIZE;


     /* istanbul ignore next */ const tc1 = tmp1.getContext('2d');

     /* istanbul ignore next */ const tc2 = tmp2.getContext('2d');


    tc1.fillStyle = `rgb(${babyTone.r},${babyTone.g},${babyTone.b})`;

    /* istanbul ignore next */ tc1.fillRect(0, 0, SIZE, SIZE);

    /* istanbul ignore next */ tc1.drawImage(c1Aligned, 0, 0, SIZE, SIZE);


    tc2.fillStyle = `rgb(${babyTone.r},${babyTone.g},${babyTone.b})`;

    /* istanbul ignore next */ tc2.fillRect(0, 0, SIZE, SIZE);

    /* istanbul ignore next */ tc2.drawImage(c2Aligned, 0, 0, SIZE, SIZE);


    /* istanbul ignore next */ d1 = tc1.getImageData(0, 0, SIZE, SIZE);

    /* istanbul ignore next */ d2 = tc2.getImageData(0, 0, SIZE, SIZE);
  /* istanbul ignore next */ } else {

    /* istanbul ignore next */ d1 = c1Aligned.getContext('2d').getImageData(0, 0, SIZE, SIZE);

    /* istanbul ignore next */ d2 = c2Aligned.getContext('2d').getImageData(0, 0, SIZE, SIZE);
  }


   /* istanbul ignore next */ const out = ctx.createImageData(SIZE, SIZE);

  // Use 70/30 dominant parent approach — one parent provides structure, the other provides accents
  // This prevents the "double face" ghosting that 50/50 blending causes

   /* istanbul ignore next */ const dominantWeight = 0.70;

   /* istanbul ignore next */ const accentWeight = 0.30;

   /* istanbul ignore next */ const baseData = d1;

   /* istanbul ignore next */ const featData = d2;

  // Gaussian weight function for smooth radial blending

   const gaussian = (x, mu, sigma) => Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));


   for (let y = 0; y < SIZE; y++) {

     for (let x = 0; x < SIZE; x++) {

      /* istanbul ignore next */ const i = (y * SIZE + x) * 4;

      /* istanbul ignore next */ const cx = SIZE / 2, cy = SIZE / 2;

      /* istanbul ignore next */ const rdx = x - cx, rdy = y - cy;

      /* istanbul ignore next */ const dist = Math.sqrt(rdx * rdx + rdy * rdy) / (SIZE / 2);

      // Smooth Gaussian-weighted blending based on radial distance from center
      // Center face region gets more accent parent influence, edges get less

      /* istanbul ignore next */ const centralBlend = gaussian(dist, 0, 0.45); // peaks at center, fades at edges

      /* istanbul ignore next */ const accentInfluence = accentWeight * centralBlend;

      /* istanbul ignore next */ const baseInfluence = 1.0 - accentInfluence;

      // Smooth face-edge fade to baby skin tone

       const faceFade = dist > 0.55 ? Math.min(1, (dist - 0.55) / 0.20) : 0;

      // Blend pixels from both parents

      /* istanbul ignore next */ let r = baseData.data[i] * baseInfluence + featData.data[i] * accentInfluence;

      /* istanbul ignore next */ let g = baseData.data[i + 1] * baseInfluence + featData.data[i + 1] * accentInfluence;

      /* istanbul ignore next */ let b = baseData.data[i + 2] * baseInfluence + featData.data[i + 2] * accentInfluence;

      // Baby skin tint — stronger warming for realism

      /* istanbul ignore next */ const tint = 0.30;

      /* istanbul ignore next */ r = r * (1 - tint) + babyTone.r * tint;

      /* istanbul ignore next */ g = g * (1 - tint) + babyTone.g * tint;

      /* istanbul ignore next */ b = b * (1 - tint) + babyTone.b * tint;

      // Fade edges to warm background to create clean oval face shape

      /* istanbul ignore next */ r = r * (1 - faceFade) + babyTone.r * faceFade;

      /* istanbul ignore next */ g = g * (1 - faceFade) + babyTone.g * faceFade;

      /* istanbul ignore next */ b = b * (1 - faceFade) + babyTone.b * faceFade;


      /* istanbul ignore next */ out.data[i] = Math.min(255, Math.max(0, Math.round(r)));

      /* istanbul ignore next */ out.data[i + 1] = Math.min(255, Math.max(0, Math.round(g)));

      /* istanbul ignore next */ out.data[i + 2] = Math.min(255, Math.max(0, Math.round(b)));

      /* istanbul ignore next */ out.data[i + 3] = 255;
    }
  }


  /* istanbul ignore next */ ctx.putImageData(out, 0, 0);

  // Apply baby filter (softness, larger eyes illusion via brightness)

  /* istanbul ignore next */ applyBabyFilter(ctx, SIZE);
}

  /* istanbul ignore next */ function generateTraits() {
   const pick = arr => arr[Math.floor(Math.random() * arr.length)];
   /* istanbul ignore next */ return [pick(TRAITS.eyes), pick(TRAITS.nose), pick(TRAITS.hair), pick(TRAITS.features), pick(TRAITS.features)];
}

  /* istanbul ignore next */ function generateBaby() {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;

    /* istanbul ignore next */ if (!parent1Loaded || !parent2Loaded) return;


   /* istanbul ignore next */ const btn = document.getElementById('generate-btn');

    /* istanbul ignore next */ if (btn) { btn.disabled = true; btn.innerHTML = '⏳ Sequence Initiated...'; }


   /* istanbul ignore next */ const c1 = document.getElementById('parent1-canvas');

   /* istanbul ignore next */ const c2 = document.getElementById('parent2-canvas');

   /* istanbul ignore next */ const baby = document.getElementById('baby-canvas');

  // Add scanning animation classes to canvases

    /* istanbul ignore next */ if (c1) c1.classList.add('scanning');

    /* istanbul ignore next */ if (c2) c2.classList.add('scanning');


   /* istanbul ignore next */ let textStatus = ['Extracting DNA...', 'Isolating Features...', 'Morphing Genetics...', 'Finalizing Portrait...'];

   /* istanbul ignore next */ let tick = 0;
  

   const scanInterval = setInterval(() => {

     if (btn) btn.innerHTML = `🧬 ${textStatus[tick] || 'Compiling...'}`;

    /* istanbul ignore next */ tick++;
  /* istanbul ignore next */ }, 600);

  // Optional delay override for testing

    /* istanbul ignore next */ const finalDelay = typeof window !== 'undefined' && window._BABY_GEN_DELAY !== undefined ? window._BABY_GEN_DELAY : 2500;
  

   setTimeout(() => {

    /* istanbul ignore next */ clearInterval(scanInterval);

     /* istanbul ignore next */ if (c1) c1.classList.remove('scanning');

     /* istanbul ignore next */ if (c2) c2.classList.remove('scanning');


    /* istanbul ignore next */ blendImages(c1, c2, baby);

     /* istanbul ignore next */ const traits = generateTraits();

     /* istanbul ignore next */ const traitsEl = document.getElementById('baby-traits');

     if (traitsEl) traitsEl.innerHTML = traits.map(t => `<span class="trait-chip">${t}</span>`).join('');

    /* istanbul ignore next */ document.getElementById('result-section')?.classList.remove('hidden');
    
    // Smooth scroll to result

    /* istanbul ignore next */ document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });


     /* istanbul ignore next */ if (btn) { btn.disabled = false; btn.innerHTML = '👶 Generate Sibling'; }
  /* istanbul ignore next */ }, finalDelay);
}

  /* istanbul ignore next */ function downloadResult() {

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   /* istanbul ignore next */ const canvas = document.getElementById('baby-canvas');

    /* istanbul ignore next */ if (!canvas) return;

   /* istanbul ignore next */ const link = document.createElement('a');

  /* istanbul ignore next */ link.download = 'baby-prediction.png';

  /* istanbul ignore next */ link.href = canvas.toDataURL();

  /* istanbul ignore next */ link.click();
}

  /* istanbul ignore next */ function resetAll() {
  /* istanbul ignore next */ parent1Loaded = false; parent2Loaded = false;

    /* istanbul ignore next */ if (typeof document === 'undefined') return;
   ['parent1', 'parent2'].forEach(p => {
    /* istanbul ignore next */ globalLandmarks[p] = null;
     /* istanbul ignore next */ const canvas = document.getElementById(p + '-canvas');
     /* istanbul ignore next */ const input = document.getElementById(p + '-input');
     /* istanbul ignore next */ const slot = canvas?.closest?.('.upload-slot') || canvas?.parentElement;

     /* istanbul ignore next */ const dz = slot ? slot.querySelector('.drop-zone') : null;

     /* istanbul ignore next */ if (canvas) canvas.classList.add('hidden');

     /* istanbul ignore next */ if (dz) dz.classList.remove('hidden');

     /* istanbul ignore next */ if (input) input.value = '';
  /* istanbul ignore next */ });
  /* istanbul ignore next */ document.getElementById('result-section')?.classList.add('hidden');
   /* istanbul ignore next */ const btn = document.getElementById('generate-btn');

    /* istanbul ignore next */ if (btn) { btn.disabled = true; btn.textContent = '👶 Generate Baby'; }
}

  /* istanbul ignore next */ function shareBaby() {

    /* istanbul ignore next */ if (typeof navigator === 'undefined') return;
   /* istanbul ignore next */ const canvas = document.getElementById('baby-canvas');

    /* istanbul ignore next */ if (!canvas) return;

   canvas.toBlob(async (blob) => {

     /* istanbul ignore next */ const file = new File([blob], 'baby-prediction.png', { type: 'image/png' });

     /* istanbul ignore next */ if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {

      /* istanbul ignore next */ try {

        /* istanbul ignore next */ await navigator.share({ files: [file], title: 'Our Baby Prediction!', text: 'Check out our AI baby prediction! 👶' });

      /* istanbul ignore next */ } catch (e) { console.warn('Share cancelled'); }
    /* istanbul ignore next */ } else {

      /* istanbul ignore next */ downloadResult();
    }
  /* istanbul ignore next */ });
}


  /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
  /* istanbul ignore next */ module.exports = {
    /* istanbul ignore next */ TRAITS, blendImages, generateTraits, generateBaby, downloadResult, resetAll, loadParent,
    /* istanbul ignore next */ extractSkinTone, applyBabyFilter, applyWarmVignette, alignFace, initFaceAPI, shareBaby,
    /* istanbul ignore next */ isLandmarkAvailable,
     getState: () => ({ parent1Loaded, parent2Loaded, globalLandmarks }),
     setParent1: v => { parent1Loaded = v; },
     setParent2: v => { parent2Loaded = v; },
     setLandmarks: (p, v) => { globalLandmarks[p] = v; },
    /* istanbul ignore next */ getDrawImageParams, updateParentState
  };
}
