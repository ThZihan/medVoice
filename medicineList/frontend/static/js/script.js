// ===================================
// MEDICINE LIST GENERATOR - JAVASCRIPT
// ===================================

// State Management
let medicines = [];
let medicineIdCounter = 0;
let selectedAutocompleteIndex = -1;
let currentAutocompleteResults = [];
let isDataLoaded = false;

// DOM Elements
const medicineForm = document.getElementById('medicineForm');
const medicineList = document.getElementById('medicineList');
const medicineCount = document.getElementById('medicineCount');
const clearFormBtn = document.getElementById('clearForm');
const clearAllBtn = document.getElementById('clearAll');
const generatePDFBtn = document.getElementById('generatePDF');

// Form Inputs
const inputs = {
    patientName: document.getElementById('patientName'),
    patientAge: document.getElementById('patientAge'),
    medicineName: document.getElementById('medicineName'),
    genericName: document.getElementById('genericName'),
    dose: document.getElementById('dose'),
    frequency: document.getElementById('frequency'),
    usedFor: document.getElementById('usedFor'),
    customRemarks: document.getElementById('customRemarks')
};

// Auto-complete Elements
const autocompleteDropdown = document.getElementById('autocompleteDropdown');

// Initialize - Execute immediately instead of waiting for DOMContentLoaded
// (DOMContentLoaded has already fired by the time this script loads)
async function initializeApp() {
    // Load data from backend first
    await loadFromBackend();
    
    // Then update UI with loaded data
    updateMedicineList();
    updateMedicineCount();
    setupAutocomplete();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeApp();
    });
} else {
    // DOM is already loaded, execute immediately
    initializeApp();
}

// Auto-complete Setup
function setupAutocomplete() {
    inputs.medicineName.addEventListener('input', handleAutocompleteInput);
    inputs.medicineName.addEventListener('keydown', handleAutocompleteKeydown);
    document.addEventListener('click', handleDocumentClick);
}

function handleAutocompleteInput(e) {
    const query = e.target.value.trim();
    
    if (query.length < 2) {
        hideAutocomplete();
        return;
    }
    
    currentAutocompleteResults = searchMedicine(query);
    
    if (currentAutocompleteResults.length > 0) {
        showAutocomplete(currentAutocompleteResults);
    } else {
        hideAutocomplete();
    }
}

function handleAutocompleteKeydown(e) {
    if (!autocompleteDropdown.classList.contains('active')) return;
    
    const items = autocompleteDropdown.querySelectorAll('.autocomplete-item');
    
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedAutocompleteIndex = Math.min(selectedAutocompleteIndex + 1, items.length - 1);
        updateAutocompleteSelection(items);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedAutocompleteIndex = Math.max(selectedAutocompleteIndex - 1, -1);
        updateAutocompleteSelection(items);
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedAutocompleteIndex >= 0 && items[selectedAutocompleteIndex]) {
            selectAutocompleteItem(currentAutocompleteResults[selectedAutocompleteIndex]);
        }
    } else if (e.key === 'Escape') {
        hideAutocomplete();
    }
}

function handleDocumentClick(e) {
    if (!e.target.closest('.autocomplete-container')) {
        hideAutocomplete();
    }
}

function showAutocomplete(results) {
    selectedAutocompleteIndex = -1;
    autocompleteDropdown.innerHTML = results.map((med, index) => `
        <div class="autocomplete-item" data-index="${index}">
            <div class="autocomplete-item-name">${escapeHtml(med.name)}</div>
            <div class="autocomplete-item-generic">${escapeHtml(med.genericName)}</div>
        </div>
    `).join('');
    
    autocompleteDropdown.querySelectorAll('.autocomplete-item').forEach((item, index) => {
        item.addEventListener('click', () => {
            selectAutocompleteItem(results[index]);
        });
    });
    
    autocompleteDropdown.classList.add('active');
}

function hideAutocomplete() {
    autocompleteDropdown.classList.remove('active');
    selectedAutocompleteIndex = -1;
    currentAutocompleteResults = [];
}

function updateAutocompleteSelection(items) {
    items.forEach((item, index) => {
        if (index === selectedAutocompleteIndex) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
}

function selectAutocompleteItem(med) {
    inputs.medicineName.value = med.name;
    inputs.genericName.value = med.genericName;
    inputs.usedFor.value = med.usedFor;
    if (med.dose) {
        inputs.dose.value = med.dose;
    }
    hideAutocomplete();
    inputs.dose.focus();
}

// Event Listeners
medicineForm.addEventListener('submit', handleFormSubmit);
clearFormBtn.addEventListener('click', clearForm);
clearAllBtn.addEventListener('click', handleClearAll);
generatePDFBtn.addEventListener('click', generatePDF);

// Edit form event listener
const editMedicineForm = document.getElementById('editMedicineForm');
if (editMedicineForm) {
    editMedicineForm.addEventListener('submit', handleEditFormSubmit);
}

// Form Submission Handler
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const timingCheckboxes = document.querySelectorAll('input[name="timing"]:checked');
    const timing = Array.from(timingCheckboxes).map(cb => cb.value);
    
    const foodTimingRadio = document.querySelector('input[name="foodTiming"]:checked');
    const foodTiming = foodTimingRadio ? foodTimingRadio.value : '';
    
    const remarksCheckboxes = document.querySelectorAll('input[name="remarks"]:checked');
    const remarks = Array.from(remarksCheckboxes).map(cb => cb.value);
    
    if (inputs.customRemarks.value.trim()) {
        remarks.push(inputs.customRemarks.value.trim());
    }
    
    if (timing.length === 0) {
        showNotification('Please select at least one time (Morning/Noon/Night)', 'error');
        return;
    }
    
    // Convert timing array to schedule string (e.g., "1-0-0" for morning only)
    let morning = '0';
    let noon = '0';
    let night = '0';
    
    if (timing.includes('morning')) morning = '1';
    if (timing.includes('noon')) noon = '1';
    if (timing.includes('night')) night = '1';
    
    const schedule = `${morning}-${noon}-${night}`;
    
    // Prepare medicine data for backend
    const medicineData = {
        medicine_name: inputs.medicineName.value.trim(),
        generic_name: inputs.genericName.value.trim(),
        dose: inputs.dose.value.trim(),
        instructions: remarks.join(', '),
        cycle: inputs.frequency.value,
        schedule: schedule,
        with_food: foodTiming,
        indication: inputs.usedFor.value.trim()
    };
    
    // Save to backend
    const result = await saveToBackend(medicineData);
    
    if (result.success) {
        // Add to local state with backend-assigned ID
        const medicine = {
            id: result.medicine.id,
            medicineName: result.medicine.medicine_name,
            genericName: result.medicine.generic_name,
            dose: result.medicine.dose,
            timing: timing,
            frequency: inputs.frequency.value,
            foodTiming: foodTiming,
            usedFor: inputs.usedFor.value.trim(),
            remarks: remarks,
            createdAt: new Date().toISOString()
        };
        
        medicines.push(medicine);
        updateMedicineList();
        updateMedicineCount();
        
        // Clear form (preserve patient name and age)
        const patientName = inputs.patientName.value;
        const patientAge = inputs.patientAge.value;
        inputs.medicineName.value = '';
        inputs.genericName.value = '';
        inputs.dose.value = '';
        inputs.usedFor.value = '';
        inputs.customRemarks.value = '';
        medicineForm.reset();
        inputs.patientName.value = patientName;
        inputs.patientAge.value = patientAge;
        
        inputs.medicineName.focus();
        
        showNotification('Medicine added!', 'success');
    } else {
        // Check if it's an authentication error
        if (result.message && result.message.includes('Not authenticated')) {
            showNotification('Session expired. Please login again.', 'error');
            // Delay redirect to give user time to see the error message
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } else {
            showNotification(result.message || 'Failed to add medicine', 'error');
        }
    }
}

// Clear Form
function clearForm() {
    medicineForm.reset();
    inputs.medicineName.focus();
    hideAutocomplete();
}

// Handle Clear All
async function handleClearAll() {
    if (medicines.length === 0) {
        showNotification('No medicines to clear', 'info');
        return;
    }
    
    if (confirm('Clear all medicines?')) {
        // Delete all medicines from backend
        const deletePromises = medicines.map(med => deleteFromBackend(med.id));
        await Promise.all(deletePromises);
        
        medicines = [];
        updateMedicineList();
        updateMedicineCount();
        showNotification('All cleared', 'info');
    }
}

// Delete Medicine
async function deleteMedicine(id) {
    const result = await deleteFromBackend(id);
    
    if (result.success) {
        medicines = medicines.filter(med => med.id !== id);
        updateMedicineList();
        updateMedicineCount();
        showNotification('Medicine removed', 'info');
    } else {
        showNotification(result.message || 'Failed to delete medicine', 'error');
    }
}

// Edit Medicine
async function editMedicine(id) {
    // Find the medicine in the local array
    const medicine = medicines.find(med => med.id === id);
    
    if (!medicine) {
        showNotification('Medicine not found', 'error');
        return;
    }
    
    // Populate the edit form with medicine data
    document.getElementById('editMedicineId').value = medicine.id;
    document.getElementById('editMedicineName').value = medicine.medicineName;
    document.getElementById('editGenericName').value = medicine.genericName || '';
    document.getElementById('editDose').value = medicine.dose;
    document.getElementById('editFrequency').value = medicine.frequency;
    document.getElementById('editUsedFor').value = medicine.usedFor || '';
    
    // Set timing checkboxes
    const timingCheckboxes = document.querySelectorAll('input[name="editTiming"]');
    timingCheckboxes.forEach(checkbox => {
        checkbox.checked = medicine.timing.includes(checkbox.value);
    });
    
    // Set food timing radio
    const foodTimingRadios = document.querySelectorAll('input[name="editFoodTiming"]');
    foodTimingRadios.forEach(radio => {
        radio.checked = radio.value === medicine.foodTiming;
    });
    
    // Set remarks checkboxes
    const remarksCheckboxes = document.querySelectorAll('input[name="editRemarks"]');
    remarksCheckboxes.forEach(checkbox => {
        checkbox.checked = medicine.remarks.includes(checkbox.value);
    });
    
    // Set custom remarks (filter out predefined remarks)
    const predefinedRemarks = ['Complete full course', 'Not to lie down for 1 hour', 'Take with plenty of water'];
    const customRemarks = medicine.remarks.filter(r => !predefinedRemarks.includes(r));
    document.getElementById('editCustomRemarks').value = customRemarks.join(', ');
    
    // Show the modal
    document.getElementById('editModal').style.display = 'flex';
}

// Close Edit Modal
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    document.getElementById('editMedicineForm').reset();
}

// Handle Edit Form Submission
async function handleEditFormSubmit(e) {
    e.preventDefault();
    
    const medicineId = parseInt(document.getElementById('editMedicineId').value);
    
    const timingCheckboxes = document.querySelectorAll('input[name="editTiming"]:checked');
    const timing = Array.from(timingCheckboxes).map(cb => cb.value);
    
    const foodTimingRadio = document.querySelector('input[name="editFoodTiming"]:checked');
    const foodTiming = foodTimingRadio ? foodTimingRadio.value : '';
    
    const remarksCheckboxes = document.querySelectorAll('input[name="editRemarks"]:checked');
    const remarks = Array.from(remarksCheckboxes).map(cb => cb.value);
    
    if (document.getElementById('editCustomRemarks').value.trim()) {
        remarks.push(document.getElementById('editCustomRemarks').value.trim());
    }
    
    if (timing.length === 0) {
        showNotification('Please select at least one time (Morning/Noon/Night)', 'error');
        return;
    }
    
    // Convert timing array to schedule string (e.g., "1-0-0" for morning only)
    let morning = '0';
    let noon = '0';
    let night = '0';
    
    if (timing.includes('morning')) morning = '1';
    if (timing.includes('noon')) noon = '1';
    if (timing.includes('night')) night = '1';
    
    const schedule = `${morning}-${noon}-${night}`;
    
    // Prepare medicine data for backend
    const medicineData = {
        medicine_name: document.getElementById('editMedicineName').value.trim(),
        generic_name: document.getElementById('editGenericName').value.trim(),
        dose: document.getElementById('editDose').value.trim(),
        instructions: remarks.join(', '),
        cycle: document.getElementById('editFrequency').value,
        schedule: schedule,
        with_food: foodTiming,
        indication: document.getElementById('editUsedFor').value.trim()
    };
    
    // Update medicine in backend
    const result = await updateMedicineInBackend(medicineId, medicineData);
    
    if (result.success) {
        // Update the medicine in local state
        const medicineIndex = medicines.findIndex(med => med.id === medicineId);
        if (medicineIndex !== -1) {
            medicines[medicineIndex] = {
                id: medicineId,
                medicineName: result.medicine.medicine_name,
                genericName: result.medicine.generic_name,
                dose: result.medicine.dose,
                timing: timing,
                frequency: document.getElementById('editFrequency').value,
                foodTiming: foodTiming,
                usedFor: document.getElementById('editUsedFor').value.trim(),
                remarks: remarks,
                createdAt: medicines[medicineIndex].createdAt
            };
        }
        
        updateMedicineList();
        closeEditModal();
        showNotification('Medicine updated successfully!', 'success');
    } else {
        if (result.message && result.message.includes('Not authenticated')) {
            showNotification('Session expired. Please login again.', 'error');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } else {
            showNotification(result.message || 'Failed to update medicine', 'error');
        }
    }
}

// Get timing string
function getTimingString(timing) {
    let morning = '0';
    let noon = '0';
    let night = '0';
    
    if (timing.includes('morning')) morning = '1';
    if (timing.includes('noon')) noon = '1';
    if (timing.includes('night')) night = '1';
    
    return `${morning}-${noon}-${night}`;
}

// Get timing class for color coding
function getTimingClass(timing) {
    const classes = [];
    const hasMorning = timing.includes('morning');
    const hasNoon = timing.includes('noon');
    const hasNight = timing.includes('night');
    
    if (hasMorning) classes.push('timing-morning');
    if (hasNoon) classes.push('timing-noon');
    if (hasNight) classes.push('timing-night');
    
    if (hasMorning && hasNoon && hasNight) return 'timing-all';
    
    if (hasNight && !hasMorning && !hasNoon) return 'timing-night';
    if (hasMorning && hasNoon && !hasNight) return 'timing-morning-noon';
    if (hasMorning && !hasNoon && hasNight) return 'timing-mixed';
    if (!hasMorning && hasNoon && hasNight) return 'timing-mixed';
    
    return classes.join(' ');
}

// Get timing priority for sorting
// Hierarchy: 1-0-0 > 1-1-0 > 1-1-1 > 0-1-0 > 0-1-1 > 0-0-1
function getTimingPriority(timing) {
    const hasMorning = timing.includes('morning');
    const hasNoon = timing.includes('noon');
    const hasNight = timing.includes('night');
    
    if (hasMorning && !hasNoon && !hasNight) return 1;  // 1-0-0 (Morning only)
    if (hasMorning && hasNoon && !hasNight) return 2;    // 1-1-0 (Morning + Noon)
    if (hasMorning && hasNoon && hasNight) return 3;     // 1-1-1 (Morning + Noon + Night)
    if (!hasMorning && hasNoon && !hasNight) return 4;  // 0-1-0 (Noon only)
    if (!hasMorning && hasNoon && hasNight) return 5;    // 0-1-1 (Noon + Night)
    if (!hasMorning && !hasNoon && hasNight) return 6;  // 0-0-1 (Night only)
    return 7;
}

// ===================================
// SUB-GROUPING SYSTEM
// ===================================

// Helper function to convert hex to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Get timing colors from current color preferences
function getTimingColors() {
    // Try to get colors from color preferences module
    if (typeof getCurrentColorPreferences === 'function') {
        const prefs = getCurrentColorPreferences();
        return {
            morning: hexToRgb(prefs.base_colors.morning) || { r: 134, g: 239, b: 172 },
            noon: hexToRgb(prefs.base_colors.noon) || { r: 253, g: 186, b: 116 },
            night: hexToRgb(prefs.base_colors.night) || { r: 147, g: 197, b: 253 }
        };
    }
    
    // Fallback to default colors
    return {
        morning: { r: 134, g: 239, b: 172 },  // Green
        noon: { r: 253, g: 186, b: 116 },      // Orange
        night: { r: 147, g: 197, b: 253 }      // Blue
    };
}

// Get light base shades from current color preferences
function getLightBaseShades() {
    // Try to get colors from color preferences module
    if (typeof getCurrentColorPreferences === 'function') {
        const prefs = getCurrentColorPreferences();
        return {
            morning: lightenColor(prefs.base_colors.morning, 0.85),
            noon: lightenColor(prefs.base_colors.noon, 0.85),
            night: lightenColor(prefs.base_colors.night, 0.85)
        };
    }
    
    // Fallback to default colors
    return {
        morning: '#e1eed9',
        noon: '#fae3d4',
        night: '#deeaf6'
    };
}

// Helper function to lighten a hex color
function lightenColor(hex, factor) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    
    const r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * factor));
    const g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * factor));
    const b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * factor));
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Blend RGB colors based on active timing slots
function blendTimingColors(timing) {
    const hasMorning = timing.includes('morning');
    const hasNoon = timing.includes('noon');
    const hasNight = timing.includes('night');
    
    // Get current timing colors
    const TIMING_COLORS = getTimingColors();
    
    // Count how many timing options are selected
    const timingCount = (hasMorning ? 1 : 0) + (hasNoon ? 1 : 0) + (hasNight ? 1 : 0);
    
    // If only one timing selected, return the base color
    if (timingCount === 1) {
        if (hasMorning) return TIMING_COLORS.morning;
        if (hasNoon) return TIMING_COLORS.noon;
        if (hasNight) return TIMING_COLORS.night;
    }
    
    // Blend colors for mixed timing
    let totalR = 0, totalG = 0, totalB = 0;
    
    if (hasMorning) {
        totalR += TIMING_COLORS.morning.r;
        totalG += TIMING_COLORS.morning.g;
        totalB += TIMING_COLORS.morning.b;
    }
    if (hasNoon) {
        totalR += TIMING_COLORS.noon.r;
        totalG += TIMING_COLORS.noon.g;
        totalB += TIMING_COLORS.noon.b;
    }
    if (hasNight) {
        totalR += TIMING_COLORS.night.r;
        totalG += TIMING_COLORS.night.g;
        totalB += TIMING_COLORS.night.b;
    }
    
    // Calculate average
    return {
        r: Math.round(totalR / timingCount),
        g: Math.round(totalG / timingCount),
        b: Math.round(totalB / timingCount)
    };
}

// Convert RGB object to hex color string
function rgbToHex(rgb) {
    return `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`;
}

// Get the timing family for CSS class assignment (for backward compatibility)
function getTimingFamily(timing) {
    const hasMorning = timing.includes('morning');
    const hasNoon = timing.includes('noon');
    const hasNight = timing.includes('night');
    
    // Count how many timing options are selected
    const timingCount = (hasMorning ? 1 : 0) + (hasNoon ? 1 : 0) + (hasNight ? 1 : 0);
    
    // Return family based on timing selection
    if (timingCount === 1) {
        if (hasMorning) return 'morning';
        if (hasNoon) return 'noon';
        if (hasNight) return 'night';
    }
    
    // Mixed timing (2 or 3 options selected)
    return 'mixed';
}

// Generate a unique group key based on Schedule (Timing), With Food, and Instructions
function getGroupKey(med) {
    // Sort remarks to ensure consistent grouping regardless of order
    const sortedRemarks = [...med.remarks].sort().join('|');
    // Sort timing to ensure consistent grouping regardless of order
    const sortedTiming = [...med.timing].sort().join('|');
    return `${sortedTiming}|${med.foodTiming}|${sortedRemarks}`;
}

// Count parameter variations from the fixed baseline
// Baseline: Instructions "Complete full course", Cycle "Daily", With Food "Before FOOD"
function countParameterVariations(med) {
    let variations = 0;
    
    // Baseline parameters
    const baselineInstructions = "Complete full course";
    const baselineCycle = "Daily";
    const baselineFood = "Before FOOD";
    
    // Check if instructions (remarks) differ from baseline
    const hasCompleteFullCourse = med.remarks.includes(baselineInstructions);
    const remarksMatchBaseline = hasCompleteFullCourse && med.remarks.length === 1;
    if (!remarksMatchBaseline) variations++;
    
    // Check if cycle (frequency) differs from baseline
    if (med.frequency !== baselineCycle) variations++;
    
    // Check if food timing differs from baseline
    if (med.foodTiming !== baselineFood) variations++;
    
    return variations;
}

// Check if a color is one of the lighter base shades
function isLightBaseShade(hexColor) {
    const normalizedHex = hexColor.toLowerCase();
    return normalizedHex === LIGHT_BASE_SHADES.morning.toLowerCase() ||
           normalizedHex === LIGHT_BASE_SHADES.noon.toLowerCase() ||
           normalizedHex === LIGHT_BASE_SHADES.night.toLowerCase();
}

// Determine text color based on background shade
function getTextColorForBackground(backgroundColor) {
    // Always use black text for medicine list items
    return '#000000';
}

// Get group parameters from all medicines
function getGroupParameters(medicines) {
    const frequencyCount = {};
    const foodTimingCount = {};
    let hasRemarksCount = { true: 0, false: 0 };
    
    medicines.forEach(med => {
        frequencyCount[med.frequency] = (frequencyCount[med.frequency] || 0) + 1;
        foodTimingCount[med.foodTiming] = (foodTimingCount[med.foodTiming] || 0) + 1;
        hasRemarksCount[med.remarks.length > 0 ? true : false]++;
    });
    
    // Find most common values
    const mostCommonFrequency = Object.keys(frequencyCount).reduce((a, b) =>
        frequencyCount[a] > frequencyCount[b] ? a : b
    );
    
    const mostCommonFoodTiming = Object.keys(foodTimingCount).reduce((a, b) =>
        foodTimingCount[a] > foodTimingCount[b] ? a : b
    );
    
    const mostCommonHasRemarks = hasRemarksCount.true >= hasRemarksCount.false ? true : false;
    
    return { mostCommonFrequency, mostCommonFoodTiming, mostCommonHasRemarks };
}

// Get subgroup color based on timing and variation level (dynamic color blending)
function getSubgroupColor(med) {
    // Get the blended base color from timing
    const baseColor = blendTimingColors(med.timing);
    const variations = countParameterVariations(med);
    
    // Get light base shades from current color preferences
    const LIGHT_BASE_SHADES = getLightBaseShades();
    
    // If 0 variations (baseline), use the lighter base shades
    if (variations === 0) {
        const hasMorning = med.timing.includes('morning');
        const hasNoon = med.timing.includes('noon');
        const hasNight = med.timing.includes('night');
        
        const timingCount = (hasMorning ? 1 : 0) + (hasNoon ? 1 : 0) + (hasNight ? 1 : 0);
        
        if (timingCount === 1) {
            if (hasMorning) return LIGHT_BASE_SHADES.morning;
            if (hasNoon) return LIGHT_BASE_SHADES.noon;
            if (hasNight) return LIGHT_BASE_SHADES.night;
        }
        
        // For mixed timing with 0 variations, blend the light base shades
        let totalR = 0, totalG = 0, totalB = 0;
        
        if (hasMorning) {
            totalR += parseInt(LIGHT_BASE_SHADES.morning.slice(1, 3), 16);
            totalG += parseInt(LIGHT_BASE_SHADES.morning.slice(3, 5), 16);
            totalB += parseInt(LIGHT_BASE_SHADES.morning.slice(5, 7), 16);
        }
        if (hasNoon) {
            totalR += parseInt(LIGHT_BASE_SHADES.noon.slice(1, 3), 16);
            totalG += parseInt(LIGHT_BASE_SHADES.noon.slice(3, 5), 16);
            totalB += parseInt(LIGHT_BASE_SHADES.noon.slice(5, 7), 16);
        }
        if (hasNight) {
            totalR += parseInt(LIGHT_BASE_SHADES.night.slice(1, 3), 16);
            totalG += parseInt(LIGHT_BASE_SHADES.night.slice(3, 5), 16);
            totalB += parseInt(LIGHT_BASE_SHADES.night.slice(5, 7), 16);
        }
        
        return rgbToHex({
            r: Math.round(totalR / timingCount),
            g: Math.round(totalG / timingCount),
            b: Math.round(totalB / timingCount)
        });
    }
    
    // Darken the color based on variation level
    // Each variation level makes the color 15% darker
    // 1 variation = 15% darker
    // 2 variations = 30% darker
    // 3 variations = 45% darker (darkest)
    const darkenFactor = 1 - (variations * 0.15);
    
    const darkenedColor = {
        r: Math.round(baseColor.r * darkenFactor),
        g: Math.round(baseColor.g * darkenFactor),
        b: Math.round(baseColor.b * darkenFactor)
    };
    
    return rgbToHex(darkenedColor);
}

// Group medicines by their parameters and assign colors
function groupMedicinesAndAssignColors(medicines) {
    const groups = {};
    
    // Group medicines by their group key
    medicines.forEach(med => {
        const groupKey = getGroupKey(med);
        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(med);
    });
    
    // Get group parameters for each group (for backward compatibility)
    const groupParamsMap = {};
    Object.keys(groups).forEach(groupKey => {
        groupParamsMap[groupKey] = getGroupParameters(groups[groupKey]);
    });
    
    // Assign colors to each medicine based on fixed baseline
        medicines.forEach(med => {
            med.subgroupColor = getSubgroupColor(med);
            med.subgroupFamily = getTimingFamily(med.timing);
            med.variationLevel = countParameterVariations(med);
            med.textColor = getTextColorForBackground(med.subgroupColor);
        });
    
    return medicines;
}

// Sort medicines by schedule
function sortMedicines() {
    medicines.sort((a, b) => {
        const priorityA = getTimingPriority(a.timing);
        const priorityB = getTimingPriority(b.timing);
        
        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }
        
        // If timing is the same, sort by food timing: BEFORE FOOD comes before AFTER FOOD
        const foodPriorityA = getFoodTimingPriority(a.foodTiming);
        const foodPriorityB = getFoodTimingPriority(b.foodTiming);
        
        if (foodPriorityA !== foodPriorityB) {
            return foodPriorityA - foodPriorityB;
        }
        
        // If food timing is also the same, sort by medicine name
        return a.medicineName.localeCompare(b.medicineName);
    });
}

// Get food timing priority for sorting
// BEFORE FOOD should come before AFTER FOOD
function getFoodTimingPriority(foodTiming) {
    const normalizedFoodTiming = foodTiming ? foodTiming.toUpperCase().trim() : '';
    
    if (normalizedFoodTiming === 'BEFORE FOOD' || normalizedFoodTiming === 'BEFORE') {
        return 1; // BEFORE FOOD gets higher priority
    } else if (normalizedFoodTiming === 'AFTER FOOD' || normalizedFoodTiming === 'AFTER') {
        return 2; // AFTER FOOD gets lower priority
    } else {
        return 3; // Other values come last
    }
}

// Update Medicine List UI
function updateMedicineList() {
    if (medicines.length === 0) {
        medicineList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💊</div>
                <p>No medicines yet</p>
                <p style="font-size: 0.875rem; color: var(--text-light); margin-top: 0.5rem;">Add medicines using the form</p>
            </div>
        `;
        return;
    }
    
    sortMedicines();
    
    // Apply sub-grouping colors
    groupMedicinesAndAssignColors(medicines);
    
    medicineList.innerHTML = medicines.map((med, index) => `
        <div class="medicine-item ${getTimingClass(med.timing)}" data-id="${med.id}" style="animation-delay: ${index * 0.05}s; --subgroup-color: ${med.subgroupColor}; border-left-color: ${med.subgroupColor}; background-color: ${med.subgroupColor}; color: #000000;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
                <div>
                    <div class="medicine-name" style="color: #000000;">${escapeHtml(med.medicineName)}</div>
                    ${med.genericName ? `<div class="medicine-generic" style="color: #000000;">${escapeHtml(med.genericName)}</div>` : ''}
                </div>
                <div style="display: flex; gap: 0.25rem;">
                    <button onclick="editMedicine(${med.id})" style="background: transparent; border: none; color: #000000; cursor: pointer; padding: 0.25rem; border-radius: 4px; transition: all 0.2s ease; font-size: 1rem;" onmouseover="this.style.background='rgba(255,255,255,0.3)'; this.style.color='#000000'" onmouseout="this.style.background='transparent'; this.style.color='#000000'" title="Edit medicine">✎</button>
                    <button onclick="deleteMedicine(${med.id})" style="background: transparent; border: none; color: #000000; cursor: pointer; padding: 0.25rem; border-radius: 4px; transition: all 0.2s ease; font-size: 1.125rem;" onmouseover="this.style.background='rgba(255,255,255,0.3)'; this.style.color='#000000'" onmouseout="this.style.background='transparent'; this.style.color='#000000'" title="Delete medicine">×</button>
                </div>
            </div>
            
            <div class="medicine-details">
                ${med.dose ? `
                <div class="medicine-detail">
                    <strong style="color: #000000;">Dosage</strong>
                    <span style="color: #000000;">${escapeHtml(med.dose)}</span>
                    <span class="subgroup-indicator" style="background: #000000;"></span>
                </div>
                ` : ''}
                <div class="medicine-detail">
                    <strong style="color: #000000;">Schedule</strong>
                    <span style="color: #000000;">${getTimingString(med.timing)}</span>
                    <span class="subgroup-indicator" style="background: #000000;"></span>
                </div>
                <div class="medicine-detail">
                    <strong style="color: #000000;">Frequency</strong>
                    <span style="color: #000000;">${escapeHtml(med.frequency)}</span>
                    <span class="subgroup-indicator" style="background: #000000;"></span>
                </div>
                <div class="medicine-detail">
                    <strong style="color: #000000;">With Food</strong>
                    <span style="color: #000000;">${escapeHtml(med.foodTiming)}</span>
                    <span class="subgroup-indicator" style="background: #000000;"></span>
                </div>
                ${med.usedFor ? `
                    <div class="medicine-detail">
                        <strong style="color: #000000;">Used For</strong>
                        <span style="color: #000000;">${escapeHtml(med.usedFor)}</span>
                        <span class="subgroup-indicator" style="background: #000000;"></span>
                    </div>
                ` : ''}
            </div>
            
            ${med.remarks.length > 0 ? `
                <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid rgba(0,0,0,0.1); font-size: 0.875rem; color: #000000;">
                    <strong style="display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.25rem; font-weight: 700; color: #000000;">Instructions</strong>
                    ${escapeHtml(med.remarks.join(', '))}
                </div>
            ` : ''}
        </div>
    `).join('');
    
    // Check for scroll overflow and update scroll indicator
    updateScrollIndicator();
}

// Update scroll indicator visibility based on scroll state
function updateScrollIndicator() {
    const wrapper = medicineList.closest('.medicine-list-wrapper');
    if (!wrapper) return;
    
    // Check if there's overflow content
    const hasOverflow = medicineList.scrollHeight > medicineList.clientHeight;
    
    if (hasOverflow) {
        wrapper.classList.add('has-overflow');
    } else {
        wrapper.classList.remove('has-overflow');
        wrapper.classList.remove('at-bottom');
        return;
    }
    
    // Check if scrolled to bottom
    const isAtBottom = medicineList.scrollTop + medicineList.clientHeight >= medicineList.scrollHeight - 10;
    
    if (isAtBottom) {
        wrapper.classList.add('at-bottom');
    } else {
        wrapper.classList.remove('at-bottom');
    }
    
    // Position scroll indicator at bottom of visible area
    const scrollIndicator = wrapper.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        const wrapperHeight = wrapper.clientHeight;
        scrollIndicator.style.top = (wrapperHeight - scrollIndicator.offsetHeight) + 'px';
    }
}

// Add scroll event listener to medicine list
medicineList.addEventListener('scroll', updateScrollIndicator);

// Update Medicine Count
function updateMedicineCount() {
    const count = medicines.length;
    medicineCount.textContent = count;
}

// Generate PDF
async function generatePDF() {
    // Prevent PDF generation if user is not authenticated or data not loaded
    if (!isDataLoaded) {
        showNotification('Please wait for data to load', 'error');
        return;
    }
    
    if (medicines.length === 0) {
        showNotification('Add medicine first', 'error');
        return;
    }
    
    try {
        showNotification('Generating PDF...', 'info');
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 10;
        const contentWidth = pageWidth - (margin * 2);
        
        const headerColor = [255, 249, 196];
        const textColor = [26, 26, 26];
        const lightColor = [107, 114, 128];
        
        // Get current timing colors for PDF
        const TIMING_COLORS_PDF = getTimingColors();
        const LIGHT_BASE_SHADES_PDF = getLightBaseShades();
        
        // Helper function to blend timing colors for PDF
        function blendTimingColorsForPDF(timing) {
            const hasMorning = timing.includes('morning');
            const hasNoon = timing.includes('noon');
            const hasNight = timing.includes('night');
            
            const timingCount = (hasMorning ? 1 : 0) + (hasNoon ? 1 : 0) + (hasNight ? 1 : 0);
            
            if (timingCount === 1) {
                if (hasMorning) return TIMING_COLORS_PDF.morning;
                if (hasNoon) return TIMING_COLORS_PDF.noon;
                if (hasNight) return TIMING_COLORS_PDF.night;
            }
            
            let totalR = 0, totalG = 0, totalB = 0;
            
            if (hasMorning) {
                totalR += TIMING_COLORS_PDF.morning.r;
                totalG += TIMING_COLORS_PDF.morning.g;
                totalB += TIMING_COLORS_PDF.morning.b;
            }
            if (hasNoon) {
                totalR += TIMING_COLORS_PDF.noon.r;
                totalG += TIMING_COLORS_PDF.noon.g;
                totalB += TIMING_COLORS_PDF.noon.b;
            }
            if (hasNight) {
                totalR += TIMING_COLORS_PDF.night.r;
                totalG += TIMING_COLORS_PDF.night.g;
                totalB += TIMING_COLORS_PDF.night.b;
            }
            
            return {
                r: Math.round(totalR / timingCount),
                g: Math.round(totalG / timingCount),
                b: Math.round(totalB / timingCount)
            };
        }
        
        // Helper function to convert hex color string to RGB array for PDF
        function hexToRgbArray(hex) {
            const rgb = hexToRgb(hex);
            return [rgb.r, rgb.g, rgb.b];
        }
        
        function getRowColor(med) {
            // Use same sub-grouping logic as UI
            // Count variations from fixed baseline
            const variations = countParameterVariations(med);
            
            // Get the blended base color from timing
            const baseColor = blendTimingColorsForPDF(med.timing);
            
            // If 0 variations (baseline), use the lighter base shades
            if (variations === 0) {
                const hasMorning = med.timing.includes('morning');
                const hasNoon = med.timing.includes('noon');
                const hasNight = med.timing.includes('night');
                
                const timingCount = (hasMorning ? 1 : 0) + (hasNoon ? 1 : 0) + (hasNight ? 1 : 0);
                
                if (timingCount === 1) {
                    if (hasMorning) return hexToRgbArray(LIGHT_BASE_SHADES_PDF.morning);
                    if (hasNoon) return hexToRgbArray(LIGHT_BASE_SHADES_PDF.noon);
                    if (hasNight) return hexToRgbArray(LIGHT_BASE_SHADES_PDF.night);
                }
                
                // For mixed timing with 0 variations, blend the light base shades
                let totalR = 0, totalG = 0, totalB = 0;
                
                if (hasMorning) {
                    const rgb = hexToRgb(LIGHT_BASE_SHADES_PDF.morning);
                    totalR += rgb.r; totalG += rgb.g; totalB += rgb.b;
                }
                if (hasNoon) {
                    const rgb = hexToRgb(LIGHT_BASE_SHADES_PDF.noon);
                    totalR += rgb.r; totalG += rgb.g; totalB += rgb.b;
                }
                if (hasNight) {
                    const rgb = hexToRgb(LIGHT_BASE_SHADES_PDF.night);
                    totalR += rgb.r; totalG += rgb.g; totalB += rgb.b;
                }
                
                return [
                    Math.round(totalR / timingCount),
                    Math.round(totalG / timingCount),
                    Math.round(totalB / timingCount)
                ];
            }
            
            // Darken the color based on variation level
            // Each variation level makes the color 15% darker
            const darkenFactor = 1 - (variations * 0.15);
            
            const darkenedColor = {
                r: Math.round(baseColor.r * darkenFactor),
                g: Math.round(baseColor.g * darkenFactor),
                b: Math.round(baseColor.b * darkenFactor)
            };
            
            return [darkenedColor.r, darkenedColor.g, darkenedColor.b];
        }
        
        function getTextColorForPDF(fillColor) {
            // If background is one of the lighter base shades, use black text
            // Morning: #e1eed9 (225, 238, 217)
            // Noon: #fae3d4 (250, 227, 212)
            // Night: #deeaf6 (222, 234, 246)
            const r = fillColor[0];
            const g = fillColor[1];
            const b = fillColor[2];
            
            if ((r === 225 && g === 238 && b === 217) || // Morning light
                (r === 250 && g === 227 && b === 212) || // Noon light
                (r === 222 && g === 234 && b === 246)) { // Night light
                return [0, 0, 0]; // Black text
            }
            return [255, 255, 255]; // White text
        }
        
        doc.setFillColor(...headerColor);
        doc.rect(0, 0, pageWidth, 30, 'F');
        
        doc.setTextColor(...textColor);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        const patientName = inputs.patientName.value.trim() || 'Patient Name';
        const patientAge = inputs.patientAge.value.trim() || '';
        
        if (patientAge) {
            // Combine name and age on same line with smaller font for age
            const nameWidth = doc.getTextWidth(patientName);
            doc.text(patientName, margin, 15);
            doc.setFontSize(12);
            doc.text(` (${patientAge} yrs)`, margin + nameWidth + 2, 15);
            doc.setFontSize(18); // Reset font size
        } else {
            doc.text(patientName, margin, 15);
        }
        
        const date = new Date();
        const dateStr = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(...lightColor);
        doc.text(`Date: ${dateStr}`, pageWidth - margin, 15, { align: 'right' });
        
        sortMedicines();
        
        // Get unique timing combinations from medicines
        function getUniqueTimingCombinations(medicines) {
            const combinations = new Map();
            medicines.forEach(med => {
                const timingStr = getTimingString(med.timing);
                if (!combinations.has(timingStr)) {
                    combinations.set(timingStr, {
                        timing: med.timing,
                        color: getRowColor(med)
                    });
                }
            });
            return Array.from(combinations.entries()).map(([key, value]) => ({
                key,
                timing: value.timing,
                color: value.color
            }));
        }
        
        // Get timing label from timing array
        function getTimingLabel(timing) {
            const labels = [];
            if (timing.includes('morning')) labels.push('Morning');
            if (timing.includes('noon')) labels.push('Noon');
            if (timing.includes('night')) labels.push('Night');
            return labels.join(' + ');
        }
        
        // Render dynamic schedule legend as single horizontal line with zero gap
        const uniqueTimings = getUniqueTimingCombinations(medicines);
        if (uniqueTimings.length > 0) {
            const legendY = 20;
            let currentX = margin;
            const colorBoxSize = 6;
            const spacing = 3;
            
            uniqueTimings.forEach((item, index) => {
                const label = getTimingLabel(item.timing);
                doc.setFillColor(...item.color);
                doc.rect(currentX, legendY - 3, colorBoxSize, 4, 'F');
                currentX += colorBoxSize + spacing;
                
                doc.setTextColor(...textColor);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                doc.text(label, currentX, legendY);
                
                const textWidth = doc.getTextWidth(label);
                currentX += textWidth + spacing * 2;
            });
        }
        
        const tableData = medicines.map((med, index) => {
            const timingStr = getTimingString(med.timing);
            const remarksStr = med.remarks.length > 0 ? med.remarks.join(', ') : '';
            
            return [
                index + 1,
                med.medicineName,
                med.genericName || '-',
                med.dose,
                remarksStr,
                med.frequency,
                timingStr,
                med.foodTiming,
                med.usedFor || '-'
            ];
        });
        
        doc.autoTable({
            startY: 30,
            head: [['#', 'Medicine Name', 'Generic Name', 'Dose', 'Instructions', 'Cycle', 'Schedule', 'With Food', 'Indication']],
            body: tableData,
            theme: 'grid',
            styles: {
                fontSize: 10,
                cellPadding: 3,
                textColor: [0, 0, 0],
                lineColor: [200, 200, 200],
                lineWidth: 0.5,
                overflow: 'linebreak',
                overflowLineBreak: 'auto',
                fontStyle: 'normal',
                halign: 'center'
            },
            headStyles: {
                fillColor: headerColor,
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                fontSize: 11,
                halign: 'center'
            },
            columnStyles: {
                4: { cellWidth: 45 }, // Instructions column (index 4)
                3: { cellWidth: 15 }
            },
            margin: { top: 30, right: 0, bottom: margin, left: 0 },
            didParseCell: function(data) {
                if (data.section === 'body') {
                    const med = medicines[data.row.index];
                    data.cell.styles.fillColor = getRowColor(med);
                    // Always use black text for all table data
                    data.cell.styles.textColor = [0, 0, 0];
                }
            },
            didDrawPage: function(data) {
                const pageNumber = doc.internal.getNumberOfPages();
                doc.setFontSize(9);
                doc.setTextColor(...lightColor);
                doc.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
            }
        });
        
        const finalY = doc.lastAutoTable.finalY + 8;
        if (finalY < pageHeight - 30) {
            doc.setFillColor(...headerColor);
            doc.rect(margin, finalY, contentWidth, 8, 'F');
            
            doc.setTextColor(...textColor);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text('IMPORTANT:', margin + 5, finalY + 5);
            
            doc.setFont('helvetica', 'normal');
            doc.text('Consult healthcare provider before changing medication.', margin + 30, finalY + 5);
        }
        
        const filename = `Medicine_List_${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}.pdf`;
        
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        showPDFPreview(pdfUrl, filename);
        
        showNotification('PDF generated!', 'success');
        
    } catch (error) {
        console.error('PDF Error:', error);
        showNotification('PDF generation failed', 'error');
    }
}

// Show PDF Preview Modal
function showPDFPreview(pdfUrl, filename) {
    const existingModal = document.getElementById('pdfPreviewModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'pdfPreviewModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 2rem;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        max-width: 95%;
        max-height: 95%;
        width: 95%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    `;
    
    const modalHeader = document.createElement('div');
    modalHeader.style.cssText = `
        padding: 2rem;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    
    const modalTitle = document.createElement('h2');
    modalTitle.textContent = 'PDF Preview';
    modalTitle.style.cssText = `
        margin: 0;
        font-size: 1.5rem;
        font-weight: 700;
        color: #1a1a2e;
    `;
    
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.cssText = `
        background: transparent;
        border: none;
        font-size: 2rem;
        color: #6b7280;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    `;
    closeButton.onclick = () => {
        URL.revokeObjectURL(pdfUrl);
        modal.remove();
    };
    
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);
    
    const modalBody = document.createElement('div');
    modalBody.style.cssText = `
        padding: 0;
        overflow: auto;
        flex: 1;
    `;
    
    const iframe = document.createElement('iframe');
    iframe.style.cssText = `
        width: 100%;
        height: calc(95vh - 120px);
        border: none;
    `;
    iframe.src = pdfUrl;
    
    modalBody.appendChild(iframe);
    
    const modalFooter = document.createElement('div');
    modalFooter.style.cssText = `
        padding: 2rem;
        border-top: 1px solid #e5e7eb;
        display: flex;
        justify-content: center;
        gap: 1.5rem;
    `;
    
    const downloadButton = document.createElement('button');
    downloadButton.textContent = 'Download PDF';
    downloadButton.style.cssText = `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 10px;
        padding: 1rem 2rem;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    `;
    downloadButton.onmouseover = () => {
        downloadButton.style.transform = 'translateY(-2px)';
        downloadButton.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
    };
    downloadButton.onmouseout = () => {
        downloadButton.style.transform = 'translateY(0)';
        downloadButton.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
    };
    downloadButton.onclick = () => {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = filename;
        link.click();
    };
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Close';
    cancelButton.style.cssText = `
        background: rgba(255, 255, 255, 0.9);
        color: #1a1a2e;
        border: 1px solid rgba(102, 126, 234, 0.3);
        border-radius: 10px;
        padding: 1rem 2rem;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    `;
    cancelButton.onmouseover = () => {
        cancelButton.style.background = 'rgba(255, 255, 255, 1)';
        cancelButton.style.borderColor = '#667eea';
    };
    cancelButton.onmouseout = () => {
        cancelButton.style.background = 'rgba(255, 255, 255, 0.9)';
        cancelButton.style.borderColor = 'rgba(102, 126, 234, 0.3)';
    };
    cancelButton.onclick = () => {
        URL.revokeObjectURL(pdfUrl);
        modal.remove();
    };
    
    modalFooter.appendChild(downloadButton);
    modalFooter.appendChild(cancelButton);
    
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalContent.appendChild(modalFooter);
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// ===================================
// BACKEND API FUNCTIONS
// ===================================

// Helper function to get CSRF token from cookies
function getCSRFToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrftoken') {
            return decodeURIComponent(value);
        }
    }
    return null;
}

// Load patient profile from backend
async function loadPatientProfile() {
    try {
        const response = await fetch(`${API_BASE_URL}/patient/profile/`, {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                inputs.patientName.value = data.name || '';
                inputs.patientAge.value = data.age || '';
            }
        }
    } catch (error) {
        console.error('Error loading patient profile:', error);
    }
}

// Save patient profile to backend
async function savePatientProfile() {
    const name = inputs.patientName.value.trim();
    const age = parseInt(inputs.patientAge.value);
    
    if (!name || isNaN(age)) {
        return;
    }
    
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Add CSRF token if available
        const csrfToken = getCSRFToken();
        if (csrfToken) {
            headers['X-CSRFToken'] = csrfToken;
        }
        
        const response = await fetch(`${API_BASE_URL}/patient/profile/update/`, {
            method: 'POST',
            headers: headers,
            credentials: 'include',
            body: JSON.stringify({ name, age })
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                console.log('Patient profile saved:', data);
            }
        }
    } catch (error) {
        console.error('Error saving patient profile:', error);
    }
}

// Load medicines from backend
async function loadFromBackend() {
    if (isDataLoaded) return; // Prevent duplicate loads
    
    try {
        // Load patient profile first
        await loadPatientProfile();
        
        const response = await fetch(`${API_BASE_URL}/medicines/`, {
            method: 'GET',
            credentials: 'include'
        });
        
        // Handle authentication errors - redirect to login if not authenticated
        if (response.status === 401 || response.status === 403) {
            console.error('User not authenticated');
            window.location.href = '/';
            return;
        }
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.success && data.medicines) {
                // Clear existing medicines array to prevent data from previous sessions
                medicines = [];
                
                // Convert backend format to frontend format
                medicines = data.medicines.map(med => {
                    // Parse schedule string back to timing array
                    const scheduleParts = med.schedule.split('-');
                    const timing = [];
                    if (scheduleParts[0] === '1') timing.push('morning');
                    if (scheduleParts[1] === '1') timing.push('noon');
                    if (scheduleParts[2] === '1') timing.push('night');
                    
                    return {
                        id: med.id,
                        medicineName: med.medicine_name,
                        genericName: med.generic_name,
                        dose: med.dose,
                        timing: timing,
                        frequency: med.cycle,
                        foodTiming: med.with_food,
                        usedFor: med.indication,
                        remarks: med.instructions ? med.instructions.split(', ') : [],
                        createdAt: new Date().toISOString()
                    };
                });
                
                isDataLoaded = true;
            }
        } else {
            console.error('Failed to load medicines from backend');
            showNotification('Failed to load medicines', 'error');
        }
    } catch (error) {
        console.error('Error loading medicines:', error);
        showNotification('Error loading medicines', 'error');
    }
}

// Save medicine to backend
async function saveToBackend(medicineData) {
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Add CSRF token if available
        const csrfToken = getCSRFToken();
        if (csrfToken) {
            headers['X-CSRFToken'] = csrfToken;
        }
        
        const response = await fetch(`${API_BASE_URL}/medicines/add/`, {
            method: 'POST',
            headers: headers,
            credentials: 'include',
            body: JSON.stringify(medicineData)
        });
        
        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
            console.error('User not authenticated or CSRF error');
            const data = await response.json();
            return { success: false, message: data.message || 'Not authenticated' };
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error saving medicine:', error);
        return { success: false, message: 'Network error' };
    }
}

// Delete medicine from backend
async function deleteFromBackend(medicineId) {
    try {
        const headers = {};
        
        // Add CSRF token if available
        const csrfToken = getCSRFToken();
        if (csrfToken) {
            headers['X-CSRFToken'] = csrfToken;
        }
        
        const response = await fetch(`${API_BASE_URL}/medicines/${medicineId}/delete/`, {
            method: 'DELETE',
            headers: headers,
            credentials: 'include'
        });
        
        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
            console.error('User not authenticated');
            const data = await response.json();
            return { success: false, message: data.message || 'Not authenticated' };
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error deleting medicine:', error);
        return { success: false, message: 'Network error' };
    }
}

// Update medicine in backend
async function updateMedicineInBackend(medicineId, medicineData) {
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Add CSRF token if available
        const csrfToken = getCSRFToken();
        if (csrfToken) {
            headers['X-CSRFToken'] = csrfToken;
        }
        
        const response = await fetch(`${API_BASE_URL}/medicines/${medicineId}/update/`, {
            method: 'PUT',
            headers: headers,
            credentials: 'include',
            body: JSON.stringify(medicineData)
        });
        
        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
            console.error('User not authenticated or CSRF error');
            const data = await response.json();
            return { success: false, message: data.message || 'Not authenticated' };
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating medicine:', error);
        return { success: false, message: 'Network error' };
    }
}

// ===================================
// PATIENT PROFILE AUTO-SAVE
// ===================================

// Save patient profile when name or age changes
inputs.patientName.addEventListener('change', savePatientProfile);
inputs.patientAge.addEventListener('change', savePatientProfile);

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Notification System
function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-icon">${getNotificationIcon(type)}</span>
        <span class="notification-message">${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 0.75rem 1.25rem;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        z-index: 10000;
        animation: slideInRight 0.25s ease-out;
        font-family: 'Segoe UI', -apple-system, sans-serif;
        font-size: 0.875rem;
        font-weight: 500;
        border-left: 3px solid ${getNotificationColor(type)};
    `;
    
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { opacity: 0; transform: translateX(30px); }
                to { opacity: 1; transform: translateX(0); }
            }
            @keyframes slideOutRight {
                from { opacity: 1; transform: translateX(0); }
                to { opacity: 0; transform: translateX(30px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.25s ease-out forwards';
        setTimeout(() => notification.remove(), 250);
    }, 2500);
}

function getNotificationIcon(type) {
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ'
    };
    return icons[type] || icons.info;
}

function getNotificationColor(type) {
    const colors = {
        success: '#22c55e',
        error: '#dc2626',
        info: '#22c55e'
    };
    return colors[type] || colors.info;
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT') {
            medicineForm.dispatchEvent(new Event('submit'));
        }
    }
    
    if (e.key === 'Escape' && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT')) {
        clearForm();
    }
});
