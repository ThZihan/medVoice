/**
 * MedVoice BD - Utility Functions
 * Common utility functions used across the application
 */

// Debounce function to limit function calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function to limit function calls
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Format timestamp to relative time
function formatTimeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };
    
    for (const [unit, seconds] of Object.entries(intervals)) {
        const interval = Math.floor(diffInSeconds / seconds);
        if (interval >= 1) {
            return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
        }
    }
    
    return 'Just now';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Generate star rating HTML
function generateStarRating(rating, size = 'md') {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars.push('<span class="star star-empty">★</span>');
        } else {
            stars.push('<span class="star star-empty">★</span>');
        }
    }
    return `<div class="star-rating">${stars.join('')}</div>`;
}

// Determine tag sentiment
function getTagSentiment(tag) {
    const negativeTags = ['Long wait', 'Rushed', 'Expensive', 'Rude', 'Unclean', 'Poor communication'];
    const positiveTags = ['Thorough', 'Follow-up care', 'Fast results', 'Gentle staff', 'Online reports', 'Clean facility', 'Patient', 'Professional', 'Helpful'];
    
    if (negativeTags.some(neg => tag.toLowerCase().includes(neg.toLowerCase()))) {
        return 'negative';
    }
    if (positiveTags.some(pos => tag.toLowerCase().includes(pos.toLowerCase()))) {
        return 'positive';
    }
    return 'neutral';
}

// Generate tag HTML
function generateTag(tag) {
    const sentiment = getTagSentiment(tag);
    return `<span class="tag tag-${sentiment}">${escapeHtml(tag)}</span>`;
}

// Generate avatar HTML
function generateAvatar(initials, color, size = 'md') {
    return `<div class="avatar avatar-${size}" style="background: ${color}">${escapeHtml(initials)}</div>`;
}

// Generate verified badge HTML
function generateVerifiedBadge() {
    return `<span class="verified-badge">
        <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
        Verified Patient
    </span>`;
}

// Show loading state
function showLoading(container, message = 'Loading...') {
    container.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner">🔍</div>
            <p class="loading-text">${escapeHtml(message)}</p>
        </div>
    `;
}

// Show empty state
function showEmptyState(container, message, icon = '🔎') {
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">${icon}</div>
            <p class="empty-state-text">${escapeHtml(message)}</p>
        </div>
    `;
}

// Close all modals
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = '';
}

// Open modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus first focusable element
        const focusableElement = modal.querySelector('input, button, [tabindex]:not([tabindex="-1"])');
        if (focusableElement) {
            focusableElement.focus();
        }
    }
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Fetch with timeout
async function fetchWithTimeout(url, options = {}, timeout = 10000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

// Handle API errors
function handleApiError(error, container) {
    console.error('API Error:', error);
    
    if (error.name === 'AbortError') {
        showEmptyState(container, 'Request timed out. Please try again.', '⏱️');
    } else if (error.message && error.message.includes('Failed to fetch')) {
        showEmptyState(container, 'Network error. Please check your connection.', '🌐');
    } else {
        showEmptyState(container, 'An error occurred. Please try again later.', '❌');
    }
}

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Truncate text
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Get query parameter from URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Set query parameter in URL
function setQueryParam(param, value) {
    const url = new URL(window.location);
    url.searchParams.set(param, value);
    window.history.pushState({}, '', url);
}

// Remove query parameter from URL
function removeQueryParam(param) {
    const url = new URL(window.location);
    url.searchParams.delete(param);
    window.history.pushState({}, '', url);
}

// Copy text to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Failed to copy:', error);
        return false;
    }
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Smooth scroll to element
function scrollToElement(element, offset = 0) {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
    });
}

// Local storage helpers
const storage = {
    get(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    },
    
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },
    
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
};

// Event delegation helper
function delegateEvent(parent, selector, eventType, handler) {
    parent.addEventListener(eventType, (event) => {
        const target = event.target.closest(selector);
        if (target && parent.contains(target)) {
            handler.call(target, event);
        }
    });
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        debounce,
        throttle,
        formatTimeAgo,
        escapeHtml,
        generateStarRating,
        getTagSentiment,
        generateTag,
        generateAvatar,
        generateVerifiedBadge,
        showLoading,
        showEmptyState,
        closeAllModals,
        openModal,
        closeModal,
        fetchWithTimeout,
        handleApiError,
        formatNumber,
        truncateText,
        getQueryParam,
        setQueryParam,
        removeQueryParam,
        copyToClipboard,
        isInViewport,
        scrollToElement,
        storage,
        delegateEvent
    };
}
