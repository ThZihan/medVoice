// ===================================
// COLOR PREFERENCES MODULE
// ===================================

// State
let currentColorPreferences = {
    palette_type: 'default',
    base_colors: {
        morning: '#72CB92',
        noon: '#D79E63',
        night: '#7DA7D7'
    },
    combined_colors: {
        morning_noon: '#84cc16',
        morning_night: '#06b6d4',
        noon_night: '#8b5cf6',
        all_day: '#6366f1'
    },
    custom_flags: {
        morning_noon: false,
        morning_night: false,
        noon_night: false,
        all_day: false
    }
};

// DOM Elements
const colorModal = document.getElementById('colorModal');
const colorModalOverlay = document.getElementById('colorModalOverlay');
const colorForm = document.getElementById('colorForm');
const colorPickerBtn = document.getElementById('colorPickerBtn');

// Color inputs
const colorInputs = {
    morning: document.getElementById('morningColor'),
    noon: document.getElementById('noonColor'),
    night: document.getElementById('nightColor'),
    morning_noon: document.getElementById('morningNoonColor'),
    morning_night: document.getElementById('morningNightColor'),
    noon_night: document.getElementById('noonNightColor'),
    all_day: document.getElementById('allDayColor')
};

// Color text inputs
const colorTextInputs = {
    morning: document.getElementById('morningColorText'),
    noon: document.getElementById('noonColorText'),
    night: document.getElementById('nightColorText'),
    morning_noon: document.getElementById('morningNoonColorText'),
    morning_night: document.getElementById('morningNightColorText'),
    noon_night: document.getElementById('noonNightColorText'),
    all_day: document.getElementById('allDayColorText')
};

// Custom toggles
const customToggles = {
    morning_noon: document.getElementById('customMorningNoon'),
    morning_night: document.getElementById('customMorningNight'),
    noon_night: document.getElementById('customNoonNight'),
    all_day: document.getElementById('customAllDay')
};

// Palette radio buttons
const paletteRadios = document.querySelectorAll('input[name="palette"]');

// Initialize color preferences
async function initializeColorPreferences() {
    try {
        // Load user's color preferences from backend
        const response = await fetch('/api/colors/preferences/', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            currentColorPreferences = data;
            applyColorsToUI();
        } else {
            console.error('Failed to load color preferences');
        }
    } catch (error) {
        console.error('Error loading color preferences:', error);
    }
}

// Apply colors to CSS variables
function applyColorsToUI() {
    const root = document.documentElement;
    
    // Apply base colors
    root.style.setProperty('--timing-morning', currentColorPreferences.base_colors.morning);
    root.style.setProperty('--timing-noon', currentColorPreferences.base_colors.noon);
    root.style.setProperty('--timing-night', currentColorPreferences.base_colors.night);
    
    // Apply combined colors
    root.style.setProperty('--timing-morn-noon', currentColorPreferences.combined_colors.morning_noon);
    root.style.setProperty('--timing-morn-night', currentColorPreferences.combined_colors.morning_night);
    root.style.setProperty('--timing-noon-night', currentColorPreferences.combined_colors.noon_night);
    root.style.setProperty('--timing-all-day', currentColorPreferences.combined_colors.all_day);
}

// Get current color preferences (for use by other modules)
function getCurrentColorPreferences() {
    return currentColorPreferences;
}

// Open color modal
function openColorModal() {
    colorModal.classList.add('active');
    colorModalOverlay.classList.add('active');
    colorModal.setAttribute('aria-hidden', 'false');
    
    // Populate form with current preferences
    populateColorForm();
    
    // Select appropriate palette radio
    const paletteRadio = document.querySelector(`input[name="palette"][value="${currentColorPreferences.palette_type}"]`);
    if (paletteRadio) {
        paletteRadio.checked = true;
    }
}

// Close color modal
function closeColorModal() {
    colorModal.classList.remove('active');
    colorModalOverlay.classList.remove('active');
    colorModal.setAttribute('aria-hidden', 'true');
}

// Populate color form with current preferences
function populateColorForm() {
    // Base colors
    colorInputs.morning.value = currentColorPreferences.base_colors.morning;
    colorTextInputs.morning.value = currentColorPreferences.base_colors.morning;
    
    colorInputs.noon.value = currentColorPreferences.base_colors.noon;
    colorTextInputs.noon.value = currentColorPreferences.base_colors.noon;
    
    colorInputs.night.value = currentColorPreferences.base_colors.night;
    colorTextInputs.night.value = currentColorPreferences.base_colors.night;
    
    // Combined colors
    colorInputs.morning_noon.value = currentColorPreferences.combined_colors.morning_noon;
    colorTextInputs.morning_noon.value = currentColorPreferences.combined_colors.morning_noon;
    
    colorInputs.morning_night.value = currentColorPreferences.combined_colors.morning_night;
    colorTextInputs.morning_night.value = currentColorPreferences.combined_colors.morning_night;
    
    colorInputs.noon_night.value = currentColorPreferences.combined_colors.noon_night;
    colorTextInputs.noon_night.value = currentColorPreferences.combined_colors.noon_night;
    
    colorInputs.all_day.value = currentColorPreferences.combined_colors.all_day;
    colorTextInputs.all_day.value = currentColorPreferences.combined_colors.all_day;
    
    // Custom toggles
    customToggles.morning_noon.checked = currentColorPreferences.custom_flags.morning_noon;
    customToggles.morning_night.checked = currentColorPreferences.custom_flags.morning_night;
    customToggles.noon_night.checked = currentColorPreferences.custom_flags.noon_night;
    customToggles.all_day.checked = currentColorPreferences.custom_flags.all_day;
    
    // Enable/disable combined color inputs based on custom flags
    updateCombinedColorInputs();
}

// Calculate combined colors from base colors
function calculateCombinedColors() {
    const morning = hexToRgb(colorInputs.morning.value);
    const noon = hexToRgb(colorInputs.noon.value);
    const night = hexToRgb(colorInputs.night.value);
    
    // Morning + Noon
    const morning_noon = mixColors(morning, noon);
    
    // Morning + Night
    const morning_night = mixColors(morning, night);
    
    // Noon + Night
    const noon_night = mixColors(noon, night);
    
    // All Day (equal mix of all three)
    const all_day = {
        r: Math.round((morning.r + noon.r + night.r) / 3),
        g: Math.round((morning.g + noon.g + night.g) / 3),
        b: Math.round((morning.b + noon.b + night.b) / 3)
    };
    
    return {
        morning_noon: rgbToHex(morning_noon),
        morning_night: rgbToHex(morning_night),
        noon_night: rgbToHex(noon_night),
        all_day: rgbToHex(all_day)
    };
}

// Helper function to convert hex to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Helper function to convert RGB to hex
function rgbToHex(rgb) {
    return '#' + [rgb.r, rgb.g, rgb.b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

// Helper function to mix two colors
function mixColors(color1, color2, ratio = 0.5) {
    return {
        r: Math.round(color1.r * ratio + color2.r * (1 - ratio)),
        g: Math.round(color1.g * ratio + color2.g * (1 - ratio)),
        b: Math.round(color1.b * ratio + color2.b * (1 - ratio))
    };
}

// Update combined color inputs when base colors change
function updateCombinedColors() {
    const combined = calculateCombinedColors();
    
    // Only update if not custom
    if (!customToggles.morning_noon.checked) {
        colorInputs.morning_noon.value = combined.morning_noon;
        colorTextInputs.morning_noon.value = combined.morning_noon;
    }
    
    if (!customToggles.morning_night.checked) {
        colorInputs.morning_night.value = combined.morning_night;
        colorTextInputs.morning_night.value = combined.morning_night;
    }
    
    if (!customToggles.noon_night.checked) {
        colorInputs.noon_night.value = combined.noon_night;
        colorTextInputs.noon_night.value = combined.noon_night;
    }
    
    if (!customToggles.all_day.checked) {
        colorInputs.all_day.value = combined.all_day;
        colorTextInputs.all_day.value = combined.all_day;
    }
}

// Enable/disable combined color inputs based on custom flags
function updateCombinedColorInputs() {
    const combinedInputs = [
        { input: colorInputs.morning_noon, text: colorTextInputs.morning_noon, toggle: customToggles.morning_noon },
        { input: colorInputs.morning_night, text: colorTextInputs.morning_night, toggle: customToggles.morning_night },
        { input: colorInputs.noon_night, text: colorTextInputs.noon_night, toggle: customToggles.noon_night },
        { input: colorInputs.all_day, text: colorTextInputs.all_day, toggle: customToggles.all_day }
    ];
    
    combinedInputs.forEach(({ input, text, toggle }) => {
        if (toggle.checked) {
            input.disabled = false;
            text.disabled = false;
            input.style.opacity = '1';
            text.style.opacity = '1';
        } else {
            input.disabled = true;
            text.disabled = true;
            input.style.opacity = '0.5';
            text.style.opacity = '0.5';
        }
    });
}

// Save color preferences
async function saveColorPreferences() {
    try {
        const selectedPalette = document.querySelector('input[name="palette"]:checked').value;
        
        const payload = {
            palette_type: selectedPalette,
            base_colors: {
                morning: colorInputs.morning.value,
                noon: colorInputs.noon.value,
                night: colorInputs.night.value
            }
        };
        
        // Only include combined colors if they are custom
        if (customToggles.morning_noon.checked || customToggles.morning_night.checked || 
            customToggles.noon_night.checked || customToggles.all_day.checked) {
            payload.combined_colors = {};
            
            if (customToggles.morning_noon.checked) {
                payload.combined_colors.morning_noon = colorInputs.morning_noon.value;
            }
            if (customToggles.morning_night.checked) {
                payload.combined_colors.morning_night = colorInputs.morning_night.value;
            }
            if (customToggles.noon_night.checked) {
                payload.combined_colors.noon_night = colorInputs.noon_night.value;
            }
            if (customToggles.all_day.checked) {
                payload.combined_colors.all_day = colorInputs.all_day.value;
            }
        }
        
        const response = await fetch('/api/colors/preferences/save/', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken()
            },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Reload color preferences
            await initializeColorPreferences();
            
            // Close modal
            closeColorModal();
            
            // Show success message
            showNotification('Color preferences saved successfully!', 'success');
            
            // Update medicine list with new colors
            if (typeof updateMedicineList === 'function') {
                updateMedicineList();
            }
        } else {
            const error = await response.json();
            showNotification(error.message || 'Failed to save color preferences', 'error');
        }
    } catch (error) {
        console.error('Error saving color preferences:', error);
        showNotification('Error saving color preferences', 'error');
    }
}

// Get CSRF token
function getCsrfToken() {
    const csrfToken = document.querySelector('meta[name="csrf-token"]');
    return csrfToken ? csrfToken.getAttribute('content') : '';
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Event Listeners
if (colorPickerBtn) {
    colorPickerBtn.addEventListener('click', openColorModal);
}

if (colorModalOverlay) {
    colorModalOverlay.addEventListener('click', closeColorModal);
}

// Base color change events
Object.keys(colorInputs).forEach(key => {
    if (['morning', 'noon', 'night'].includes(key)) {
        colorInputs[key].addEventListener('input', (e) => {
            colorTextInputs[key].value = e.target.value;
            
            // Select custom palette when user changes base colors
            const customRadio = document.querySelector('input[name="palette"][value="custom"]');
            if (customRadio) {
                customRadio.checked = true;
            }
            
            // Recalculate combined colors
            updateCombinedColors();
        });
        
        colorTextInputs[key].addEventListener('input', (e) => {
            const value = e.target.value;
            if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                colorInputs[key].value = value;
                
                // Select custom palette when user changes base colors
                const customRadio = document.querySelector('input[name="palette"][value="custom"]');
                if (customRadio) {
                    customRadio.checked = true;
                }
                
                // Recalculate combined colors
                updateCombinedColors();
            }
        });
    } else {
        // Combined color change events
        colorInputs[key].addEventListener('input', (e) => {
            colorTextInputs[key].value = e.target.value;
            
            // Select custom palette and enable custom toggle
            const customRadio = document.querySelector('input[name="palette"][value="custom"]');
            if (customRadio) {
                customRadio.checked = true;
            }
            
            // Enable custom toggle
            customToggles[key].checked = true;
            updateCombinedColorInputs();
        });
        
        colorTextInputs[key].addEventListener('input', (e) => {
            const value = e.target.value;
            if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                colorInputs[key].value = value;
                
                // Select custom palette and enable custom toggle
                const customRadio = document.querySelector('input[name="palette"][value="custom"]');
                if (customRadio) {
                    customRadio.checked = true;
                }
                
                // Enable custom toggle
                customToggles[key].checked = true;
                updateCombinedColorInputs();
            }
        });
    }
});

// Custom toggle events
Object.keys(customToggles).forEach(key => {
    customToggles[key].addEventListener('change', (e) => {
        updateCombinedColorInputs();
        
        // Select custom palette when user enables custom toggle
        if (e.target.checked) {
            const customRadio = document.querySelector('input[name="palette"][value="custom"]');
            if (customRadio) {
                customRadio.checked = true;
            }
        }
    });
});

// Palette radio change events
paletteRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        const paletteType = e.target.value;
        
        if (paletteType === 'default') {
            applyPalette('default');
        } else if (paletteType === 'vibrant') {
            applyPalette('vibrant');
        }
        // 'custom' doesn't change anything, just reflects current state
    });
});

// Apply preset palette
function applyPalette(paletteType) {
    const palettes = {
        default: {
            morning: '#72CB92',
            noon: '#D79E63',
            night: '#7DA7D7',
            morning_noon: '#A5B57A',
            morning_night: '#78B9B5',
            noon_night: '#AAA39D',
            all_day: '#97B099'
        },
        vibrant: {
            morning: '#00c853',
            noon: '#ffeb3b',
            night: '#ff1744',
            morning_noon: '#64dd17',
            morning_night: '#00e676',
            noon_night: '#ff9100',
            all_day: '#ff6d00'
        }
    };
    
    const palette = palettes[paletteType];
    if (!palette) return;
    
    // Update base colors
    colorInputs.morning.value = palette.morning;
    colorTextInputs.morning.value = palette.morning;
    
    colorInputs.noon.value = palette.noon;
    colorTextInputs.noon.value = palette.noon;
    
    colorInputs.night.value = palette.night;
    colorTextInputs.night.value = palette.night;
    
    // Update combined colors
    colorInputs.morning_noon.value = palette.morning_noon;
    colorTextInputs.morning_noon.value = palette.morning_noon;
    
    colorInputs.morning_night.value = palette.morning_night;
    colorTextInputs.morning_night.value = palette.morning_night;
    
    colorInputs.noon_night.value = palette.noon_night;
    colorTextInputs.noon_night.value = palette.noon_night;
    
    colorInputs.all_day.value = palette.all_day;
    colorTextInputs.all_day.value = palette.all_day;
    
    // Uncheck all custom toggles
    Object.keys(customToggles).forEach(key => {
        customToggles[key].checked = false;
    });
    
    // Update combined color inputs
    updateCombinedColorInputs();
}

// Form submit event
if (colorForm) {
    colorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveColorPreferences();
    });
}

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeColorPreferences);
} else {
    initializeColorPreferences();
}

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && colorModal.classList.contains('active')) {
        closeColorModal();
    }
});
