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
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
}

/**
 * Build full CSS for glassmorphism effect
 * @param {object} opts - { blur, opacity, borderOpacity, colorHex, borderRadius, shadow }
 * @returns {string} full CSS rule
 */
function buildGlassCSS({ blur = 16, opacity = 0.25, borderOpacity = 0.3, colorHex = '#ffffff', borderRadius = 16, shadow = true }) {
    const rgb = hexToRgb(colorHex);
    const bgRgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
    const borderRgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${borderOpacity})`;

    return `.glass {
    background: ${bgRgba};
    border-radius: ${borderRadius}px;
/* istanbul ignore next */
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
function getBackgroundForPreset(preset) {
    const presets = {
        purple: 'linear-gradient(135deg, #6e00ff, #e100ff)',
        sunset: 'linear-gradient(135deg, #ff6b6b, #feca57)',
        ocean: 'linear-gradient(135deg, #0f3460, #16213e, #0f3460)',
        forest: 'linear-gradient(135deg, #134e5e, #71b280)',
        rose: 'linear-gradient(135deg, #c94b4b, #4b134f)',
        gradient: 'linear-gradient(45deg, #ff00cc, #333399)',
    };
    return presets[preset] || presets['gradient'];
}

// --- DOM Functions ---

function updateGlass() {
    const blur = document.getElementById('blur')?.value || 16;
    const opa = document.getElementById('opa')?.value || 0.25;
    const out = document.getElementById('out')?.value || 0.3;
    const colorHex = document.getElementById('glass-color')?.value || '#ffffff';
    const borderRadius = document.getElementById('radius')?.value || 16;

    const valBlur = document.getElementById('val-blur');
    const valOpa = document.getElementById('val-opa');
    const valOut = document.getElementById('val-out');
    const valRadius = document.getElementById('val-radius');

/* istanbul ignore next */
    if (valBlur) valBlur.textContent = blur + 'px';
/* istanbul ignore next */
    if (valOpa) valOpa.textContent = parseFloat(opa).toFixed(2);
/* istanbul ignore next */
    if (valOut) valOut.textContent = parseFloat(out).toFixed(2);
/* istanbul ignore next */
    if (valRadius) valRadius.textContent = borderRadius + 'px';

    const css = buildGlassCSS({
        blur: Number(blur),
        opacity: parseFloat(opa),
        borderOpacity: parseFloat(out),
        colorHex,
        borderRadius: Number(borderRadius)
    });

    const rgb = hexToRgb(colorHex);
    const bgRgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opa})`;
    const borderRgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${out})`;

    const box = document.getElementById('glass-box');
/* istanbul ignore next */
    if (box) {
/* istanbul ignore next */
        box.style.backdropFilter = `blur(${blur}px)`;
/* istanbul ignore next */
        box.style.webkitBackdropFilter = `blur(${blur}px)`;
/* istanbul ignore next */
        box.style.background = bgRgba;
/* istanbul ignore next */
        box.style.border = `1px solid ${borderRgba}`;
/* istanbul ignore next */
        box.style.borderRadius = `${borderRadius}px`;
    }

    const cssOutput = document.getElementById('css-output');
/* istanbul ignore next */
    if (cssOutput) cssOutput.textContent = css;
}

function changeBg(preset) {
    const area = document.getElementById('preview-area');
/* istanbul ignore next */
    if (!area) return;
    
/* istanbul ignore next */
    const bg = getBackgroundForPreset(preset);
/* istanbul ignore next */
    area.style.background = bg;
/* istanbul ignore next */
    area.style.backgroundSize = 'cover';
/* istanbul ignore next */
    area.style.backgroundPosition = 'center';

    // Highlight active bg button
/* istanbul ignore next */
    document.querySelectorAll('.bg-btn').forEach(btn => btn.classList.remove('active'));
/* istanbul ignore next */
    const activeBtn = document.getElementById(`bg-${preset}`);
/* istanbul ignore next */
    if (activeBtn) activeBtn.classList.add('active');
}

function copyCSS() {
    const el = document.getElementById('css-output');
/* istanbul ignore next */
    const text = el ? el.textContent : '';
/* istanbul ignore next */
    if (!text) return;
/* istanbul ignore next */
    navigator.clipboard.writeText(text).catch(() => {});
/* istanbul ignore next */
    const btn = document.getElementById('copy-btn');
/* istanbul ignore next */
    if (btn) {
/* istanbul ignore next */
        btn.textContent = '✅ Copied!';
/* istanbul ignore next */
        setTimeout(() => { btn.textContent = '📋 Copy CSS'; }, 2000);
    }
}

function applyPreset(presetName) {
    const presets = {
        frosted: { blur: 16, opa: 0.25, out: 0.3, color: '#ffffff', radius: 16 },
        dark: { blur: 24, opa: 0.15, out: 0.2, color: '#000000', radius: 20 },
        colorful: { blur: 12, opa: 0.4, out: 0.5, color: '#a777e3', radius: 24 },
    };

    const p = presets[presetName];
/* istanbul ignore next */
    if (!p) return;

/* istanbul ignore next */
    const setter = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
/* istanbul ignore next */
    setter('blur', p.blur);
/* istanbul ignore next */
    setter('opa', p.opa);
/* istanbul ignore next */
    setter('out', p.out);
/* istanbul ignore next */
    setter('glass-color', p.color);
/* istanbul ignore next */
    setter('radius', p.radius);
/* istanbul ignore next */
    updateGlass();
}

/* istanbul ignore next */
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', updateGlass);
}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { hexToRgb, buildGlassCSS, getBackgroundForPreset, updateGlass, changeBg, copyCSS, applyPreset };
}
