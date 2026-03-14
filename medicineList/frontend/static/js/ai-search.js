/**
 * MedVoice BD - AI Search Module
 * Handles RAG-powered search functionality
 */

let isSearching = false;

// Sample search results (will be replaced with API calls)
const sampleSearchResults = {
    "dr khanam": {
        name: "Dr. Farida Khanam",
        facility: "Square Hospital",
        overall: 4.2,
        totalReviews: 47,
        summary: "Based on 47 community reviews, Dr. Khanam is highly regarded for her thorough consultations and excellent follow-up care. Most patients appreciate her patience and detailed explanations. The main concern raised is the average wait time of 40–60 minutes. 89% of reviewers say they would return.",
        pros: ["Thorough consultations", "Patient and communicative", "Reliable follow-up"],
        cons: ["Long wait times", "Appointment scheduling can be difficult"],
        sentiment: 84
    },
    "dr rahman": {
        name: "Dr. Rahman",
        facility: "BIRDEM Hospital",
        overall: 3.8,
        totalReviews: 32,
        summary: "Dr. Rahman receives mixed reviews. Patients praise his diagnostic accuracy and treatment effectiveness. However, many report long waiting times and rushed consultations. The facility at BIRDEM is well-regarded for its modern equipment.",
        pros: ["Accurate diagnosis", "Effective treatment", "Modern facility"],
        cons: ["Long waiting times", "Rushed consultations", "Limited availability"],
        sentiment: 72
    }
};

/**
 * Initialize AI search module
 */
function initAISearchModule() {
    console.log('AI Search module initialized');
    
    // Set up search input
    const searchInput = document.getElementById('aiSearchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
    
    // Set up search button
    const searchBtn = document.getElementById('aiSearchSubmit');
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
    
    // Set up close button
    const closeBtn = document.getElementById('aiSearchClose');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            closeModal('aiSearchModal');
        });
    }
}

/**
 * Handle search
 */
async function handleSearch() {
    if (isSearching) return;
    
    const searchInput = document.getElementById('aiSearchInput');
    const query = searchInput.value.trim();
    
    if (!query) {
        showToast('Please enter a search query', 'warning');
        return;
    }
    
    isSearching = true;
    const resultsContainer = document.getElementById('searchResults');
    
    // Show loading state
    showLoading(resultsContainer, 'Analyzing community feedback...');
    
    try {
        // In production, this would be an API call
        // const response = await fetch('/api/search/rag/', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ query })
        // });
        // const data = await response.json();
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1400));
        
        // Find matching result
        const key = Object.keys(sampleSearchResults).find(k => 
            query.toLowerCase().includes(k) || k.includes(query.toLowerCase())
        );
        
        if (key) {
            const result = sampleSearchResults[key];
            displaySearchResult(result);
        } else {
            displayNoResults(query);
        }
        
    } catch (error) {
        console.error('Search error:', error);
        handleApiError(error, resultsContainer);
    } finally {
        isSearching = false;
    }
}

/**
 * Display search result
 */
function displaySearchResult(result) {
    const resultsContainer = document.getElementById('searchResults');
    
    resultsContainer.innerHTML = `
        <div class="search-result">
            <div class="search-result-header">
                <div>
                    <h3 class="search-result-name">${escapeHtml(result.name)}</h3>
                    <p class="search-result-facility">${escapeHtml(result.facility)} · ${result.totalReviews} reviews</p>
                </div>
                <div class="search-result-rating">
                    <div class="rating-number">${result.overall}</div>
                    ${generateStarRating(Math.round(result.overall))}
                </div>
            </div>
            
            <div class="search-result-sentiment">
                <div class="sentiment-header">
                    <span class="sentiment-label">Community Sentiment</span>
                    <span class="sentiment-percentage">${result.sentiment}% Positive</span>
                </div>
                <div class="progress">
                    <div class="progress-bar progress-bar-success" style="width: ${result.sentiment}%"></div>
                </div>
            </div>
            
            <p class="search-result-summary">${escapeHtml(result.summary)}</p>
            
            <div class="search-result-pros-cons">
                <div class="pros-section">
                    <div class="pros-cons-title">👍 What people love</div>
                    ${result.pros.map(pro => `<div class="pros-cons-item">• ${escapeHtml(pro)}</div>`).join('')}
                </div>
                <div class="cons-section">
                    <div class="pros-cons-title">⚠️ Common concerns</div>
                    ${result.cons.map(con => `<div class="pros-cons-item">• ${escapeHtml(con)}</div>`).join('')}
                </div>
            </div>
        </div>
    `;
}

/**
 * Display no results
 */
function displayNoResults(query) {
    const resultsContainer = document.getElementById('searchResults');
    
    showEmptyState(
        resultsContainer,
        `We found limited community data for "${escapeHtml(query)}" yet. Be the first to share your experience and help others make informed decisions!`,
        '🔎'
    );
    
    // Add "Write First Review" button
    const emptyState = resultsContainer.querySelector('.empty-state');
    if (emptyState) {
        const button = document.createElement('button');
        button.className = 'btn btn-primary';
        button.style.marginTop = 'var(--space-lg)';
        button.textContent = '+ Write First Review';
        button.addEventListener('click', () => {
            closeModal('aiSearchModal');
            openModal('writeReviewModal');
        });
        emptyState.appendChild(button);
    }
}

/**
 * Clear search results
 */
function clearSearchResults() {
    const resultsContainer = document.getElementById('searchResults');
    if (resultsContainer) {
        resultsContainer.innerHTML = '';
    }
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initAISearchModule,
        handleSearch,
        displaySearchResult,
        displayNoResults,
        clearSearchResults
    };
}
