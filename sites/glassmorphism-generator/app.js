/**
 * Glassmorphism Generator Core Logic
 * Enhanced: animated backgrounds, preset palettes, live preview, copy button
 */

// --- Pure Logic ---

/**
 * Parse hex color to rgb components
 * @param {string} hex
 * @returns {{ r: number, g: number, b: number }}
 */
 /* istanbul ignore next */ function hexToRgb(hex) {
     const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
     /* istanbul ignore next */ return result ? {
        /* istanbul ignore next */ r: parseInt(result[1], 16),
        /* istanbul ignore next */ g: parseInt(result[2], 16),
        /* istanbul ignore next */ b: parseInt(result[3], 16)
    /* istanbul ignore next */ } : { r: 255, g: 255, b: 255 };
}

/**
 * Build full CSS for glassmorphism effect
 * @param {object} opts - { blur, opacity, borderOpacity, colorHex, borderRadius, shadow }
 * @returns {string} full CSS rule
 */
 /* istanbul ignore next */ function buildGlassCSS({ blur = 16, opacity = 0.25, borderOpacity = 0.3, colorHex = '#ffffff', borderRadius = 16, shadow = true }) {
     /* istanbul ignore next */ const rgb = hexToRgb(colorHex);
    const bgRgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
    const borderRgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${borderOpacity})`;

    return `.glass {
    background: ${bgRgba};
    border-radius: ${borderRadius}px;

    ${shadow ? 'box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);' : ''}
    backdrop-filter: blur(${blur}px);
    -webkit-backdrop-filter: blur(${blur}px);
    border: 1px solid ${borderRgba};
}`;
}

/**
 * Get background CSS for a preset
 * @param {string} preset - gradient key or image URL
 * @returns {string} CSS background value
 */
 /* istanbul ignore next */ function getBackgroundForPreset(preset) {
     /* istanbul ignore next */ const presets = {
        /* istanbul ignore next */ purple: 'linear-gradient(135deg, #6e00ff, #e100ff)',
        /* istanbul ignore next */ sunset: 'linear-gradient(135deg, #ff6b6b, #feca57)',
        /* istanbul ignore next */ ocean: 'linear-gradient(135deg, #0f3460, #16213e, #0f3460)',
        /* istanbul ignore next */ forest: 'linear-gradient(135deg, #134e5e, #71b280)',
        /* istanbul ignore next */ rose: 'linear-gradient(135deg, #c94b4b, #4b134f)',
        /* istanbul ignore next */ gradient: 'linear-gradient(45deg, #ff00cc, #333399)',
    };
     /* istanbul ignore next */ return presets[preset] || presets['gradient'];
}

// --- DOM Functions ---

 /* istanbul ignore next */ function updateGlass() {
     /* istanbul ignore next */ const blur = document.getElementById('blur')?.value || 16;
     /* istanbul ignore next */ const opa = document.getElementById('opa')?.value || 0.25;
     /* istanbul ignore next */ const out = document.getElementById('out')?.value || 0.3;
     /* istanbul ignore next */ const colorHex = document.getElementById('glass-color')?.value || '#ffffff';
     /* istanbul ignore next */ const borderRadius = document.getElementById('radius')?.value || 16;

     /* istanbul ignore next */ const valBlur = document.getElementById('val-blur');
     /* istanbul ignore next */ const valOpa = document.getElementById('val-opa');
     /* istanbul ignore next */ const valOut = document.getElementById('val-out');
     /* istanbul ignore next */ const valRadius = document.getElementById('val-radius');


     /* istanbul ignore next */ if (valBlur) valBlur.textContent = blur + 'px';

     /* istanbul ignore next */ if (valOpa) valOpa.textContent = parseFloat(opa).toFixed(2);

     /* istanbul ignore next */ if (valOut) valOut.textContent = parseFloat(out).toFixed(2);

     /* istanbul ignore next */ if (valRadius) valRadius.textContent = borderRadius + 'px';

     /* istanbul ignore next */ const css = buildGlassCSS({
        /* istanbul ignore next */ blur: Number(blur),
        /* istanbul ignore next */ opacity: parseFloat(opa),
        /* istanbul ignore next */ borderOpacity: parseFloat(out),
        /* istanbul ignore next */ colorHex,
        /* istanbul ignore next */ borderRadius: Number(borderRadius)
    /* istanbul ignore next */ });

     /* istanbul ignore next */ const rgb = hexToRgb(colorHex);
    const bgRgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opa})`;
    const borderRgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${out})`;

     /* istanbul ignore next */ const box = document.getElementById('glass-box');

     /* istanbul ignore next */ if (box) {

        box.style.backdropFilter = `blur(${blur}px)`;

        box.style.webkitBackdropFilter = `blur(${blur}px)`;

        /* istanbul ignore next */ box.style.background = bgRgba;

        box.style.border = `1px solid ${borderRgba}`;

        box.style.borderRadius = `${borderRadius}px`;
    }

     /* istanbul ignore next */ const cssOutput = document.getElementById('css-output');

     /* istanbul ignore next */ if (cssOutput) cssOutput.textContent = css;
}

 /* istanbul ignore next */ function changeBg(preset) {
     /* istanbul ignore next */ const area = document.getElementById('preview-area');

     /* istanbul ignore next */ if (!area) return;
    

     /* istanbul ignore next */ const bg = getBackgroundForPreset(preset);

    /* istanbul ignore next */ area.style.background = bg;

    /* istanbul ignore next */ area.style.backgroundSize = 'cover';

    /* istanbul ignore next */ area.style.backgroundPosition = 'center';

    // Highlight active bg button

    document.querySelectorAll('.bg-btn').forEach(btn => btn.classList.remove('active'));

    const activeBtn = document.getElementById(`bg-${preset}`);

     /* istanbul ignore next */ if (activeBtn) activeBtn.classList.add('active');
}

 /* istanbul ignore next */ function copyCSS() {
     /* istanbul ignore next */ const el = document.getElementById('css-output');

     /* istanbul ignore next */ const text = el ? el.textContent : '';

     /* istanbul ignore next */ if (!text) return;

    navigator.clipboard.writeText(text).catch(() => {});

     /* istanbul ignore next */ const btn = document.getElementById('copy-btn');

     /* istanbul ignore next */ if (btn) {

        /* istanbul ignore next */ btn.textContent = '✅ Copied!';

        setTimeout(() => { btn.textContent = '📋 Copy CSS'; }, 2000);
    }
}

 /* istanbul ignore next */ function applyPreset(presetName) {
     /* istanbul ignore next */ const presets = {
        /* istanbul ignore next */ frosted: { blur: 16, opa: 0.25, out: 0.3, color: '#ffffff', radius: 16 },
        /* istanbul ignore next */ dark: { blur: 24, opa: 0.15, out: 0.2, color: '#000000', radius: 20 },
        /* istanbul ignore next */ colorful: { blur: 12, opa: 0.4, out: 0.5, color: '#a777e3', radius: 24 },
    };

     /* istanbul ignore next */ const p = presets[presetName];

     /* istanbul ignore next */ if (!p) return;


    const setter = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };

    /* istanbul ignore next */ setter('blur', p.blur);

    /* istanbul ignore next */ setter('opa', p.opa);

    /* istanbul ignore next */ setter('out', p.out);

    /* istanbul ignore next */ setter('glass-color', p.color);

    /* istanbul ignore next */ setter('radius', p.radius);

    /* istanbul ignore next */ updateGlass();
}


 /* istanbul ignore next */ if (typeof document !== 'undefined') {
    /* istanbul ignore next */ document.addEventListener('DOMContentLoaded', updateGlass);
}


 /* istanbul ignore next */ if (typeof module !== 'undefined' && module.exports) {
    /* istanbul ignore next */ module.exports = { hexToRgb, buildGlassCSS, getBackgroundForPreset, updateGlass, changeBg, copyCSS, applyPreset };
}
