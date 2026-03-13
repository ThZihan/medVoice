/**
 * MedVoice BD - Main Application
 * Initializes all modules and sets up global event listeners
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('MedVoice BD - Initializing application...');
    
    // Initialize all modules
    initHeader();
    initAISearch();
    initWriteReview();
    initFeed();
    
    // Set up global event listeners
    setupGlobalListeners();
    
    // Check URL for query parameters
    handleUrlParams();
    
    console.log('MedVoice BD - Application initialized');
});

/**
 * Initialize header functionality
 */
function initHeader() {
    // Navigation tabs
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            handleTabChange(tabName);
        });
    });
    
    // Header action buttons
    const aiSearchBtn = document.getElementById('aiSearchBtn');
    const shareExperienceBtn = document.getElementById('shareExperienceBtn');
    
    if (aiSearchBtn) {
        aiSearchBtn.addEventListener('click', () => {
            openModal('aiSearchModal');
        });
    }
    
    if (shareExperienceBtn) {
        shareExperienceBtn.addEventListener('click', () => {
            openModal('writeReviewModal');
        });
    }
}

/**
 * Handle tab change
 */
function handleTabChange(tabName) {
    // Update active state
    document.querySelectorAll('.nav-tab').forEach(tab => {
        const isActive = tab.dataset.tab === tabName;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive);
    });
    
    // Update URL without page reload
    setQueryParam('tab', tabName);
    
    // Reload feed with new tab
    if (typeof loadFeed === 'function') {
        loadFeed(tabName);
    }
}

/**
 * Handle logout
 */
function handleLogout(event) {
    event.preventDefault();
    
    // Show confirmation dialog
    if (confirm('Are you sure you want to logout?')) {
        // Clear any stored user data
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        
        // Redirect to logout endpoint
        window.location.href = event.target.href;
    }
}

/**
 * Set up global event listeners
 */
function setupGlobalListeners() {
    // Close modals on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', () => {
            closeAllModals();
        });
    });
    
    // Close modals on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
    
    // Handle browser back/forward
    window.addEventListener('popstate', () => {
        handleUrlParams();
    });
    
    // Write Review CTA click
    const writeReviewCta = document.getElementById('writeReviewCta');
    if (writeReviewCta) {
        writeReviewCta.addEventListener('click', () => {
            openModal('writeReviewModal');
        });
        
        // Handle keyboard activation
        writeReviewCta.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal('writeReviewModal');
            }
        });
    }
    
    // AI Banner button click
    const aiSearchBannerBtn = document.getElementById('aiSearchBannerBtn');
    if (aiSearchBannerBtn) {
        aiSearchBannerBtn.addEventListener('click', () => {
            openModal('aiSearchModal');
        });
    }
}

/**
 * Handle URL parameters on page load
 */
function handleUrlParams() {
    const tabParam = getQueryParam('tab');
    if (tabParam) {
        handleTabChange(tabParam);
    }
    
    const searchParam = getQueryParam('search');
    if (searchParam) {
        // Open AI search modal with query
        openModal('aiSearchModal');
        const searchInput = document.getElementById('aiSearchInput');
        if (searchInput) {
            searchInput.value = searchParam;
            // Trigger search
            const searchBtn = document.getElementById('aiSearchSubmit');
            if (searchBtn) {
                searchBtn.click();
            }
        }
    }
}

/**
 * Initialize AI Search module
 */
function initAISearch() {
    // This function will be defined in ai-search.js
    if (typeof initAISearchModule === 'function') {
        initAISearchModule();
    }
}

/**
 * Initialize Write Review module
 */
function initWriteReview() {
    // This function will be defined in write-review.js
    if (typeof initWriteReviewModule === 'function') {
        initWriteReviewModule();
    }
}

/**
 * Initialize Feed module
 */
function initFeed() {
    // This function will be defined in feed.js
    if (typeof initFeedModule === 'function') {
        initFeedModule();
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    
    document.body.appendChild(toast);
    
    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

/**
 * Handle offline status
 */
window.addEventListener('online', () => {
    showToast('You are back online', 'success');
});

window.addEventListener('offline', () => {
    showToast('You are offline. Some features may not work.', 'warning');
});

/**
 * Service Worker Registration (for future PWA support)
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initHeader,
        handleTabChange,
        setupGlobalListeners,
        handleUrlParams,
        initAISearch,
        initWriteReview,
        initFeed,
        showToast
    };
}
