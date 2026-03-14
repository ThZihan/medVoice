/**
 * MedVoice BD - Feed Module
 * Handles review feed loading, filtering, and pagination
 */

let currentPage = 1;
let currentFilter = 'all';
let currentTab = 'feed';
let isLoading = false;
let hasMore = true;

// Sample data (will be replaced with API calls)
const samplePosts = [
    {
        id: 1,
        author: "Tanvir H.",
        avatar: "TH",
        avatarColor: "#1A6B6B",
        doctor: "Dr. Farida Khanam",
        facility: "Square Hospital, Dhaka",
        specialty: "Cardiologist",
        rating: 4,
        time: "2h ago",
        text: "Visited last week with chest pain concerns. Dr. Khanam was incredibly thorough — she didn't rush the appointment at all, explained every test, and even followed up by phone the next day. Wait time was about 45 minutes which is acceptable for her popularity. The staff at the reception desk could be friendlier, but overall a genuinely reassuring experience.",
        likes: 34,
        comments: 12,
        helpful: 28,
        tags: ["Thorough", "Follow-up care", "Long wait"],
        aiSummary: "Positive experience. Strong doctor-patient communication. Minor issue with reception staff. Average wait time noted.",
        verified: false
    },
    {
        id: 2,
        author: "Nusrat J.",
        avatar: "NJ",
        avatarColor: "#5B4A8A",
        doctor: "Dr. Mahmudul Islam",
        facility: "Apollo Hospital, Dhaka",
        specialty: "Orthopedic Surgeon",
        rating: 2,
        time: "5h ago",
        text: "Disappointed with my experience. Appointment was for 4pm, saw the doctor at 6:45pm with zero update. The consultation itself felt rushed — under 8 minutes for a knee surgery follow-up. When I asked questions he seemed impatient. The facility itself is very clean and modern though.",
        likes: 67,
        comments: 31,
        helpful: 59,
        tags: ["Long wait", "Rushed", "Clean facility"],
        aiSummary: "Negative experience. Significant wait time issue. Rushed consultation. Facility quality praised.",
        verified: true
    },
    {
        id: 3,
        author: "Rakib A.",
        avatar: "RA",
        avatarColor: "#D4863A",
        doctor: "Ibn Sina Hospital",
        facility: "Dhanmondi, Dhaka",
        specialty: "Diagnostic Lab",
        rating: 5,
        time: "1d ago",
        text: "Best lab experience I've had in Dhaka. Reports came online within 4 hours. The phlebotomist was gentle (I have a real fear of needles and she noticed and was so kind about it). Online report portal worked perfectly. Will definitely return.",
        likes: 89,
        comments: 7,
        helpful: 82,
        tags: ["Fast results", "Gentle staff", "Online reports"],
        aiSummary: "Excellent experience. Fast report turnaround. Compassionate staff noted. Digital services praised.",
        verified: false
    }
];

/**
 * Initialize feed module
 */
function initFeedModule() {
    console.log('Feed module initialized');
    
    // Load initial feed
    loadFeed();
    
    // Set up filter buttons
    setupFilterButtons();
    
    // Set up load more button
    setupLoadMore();
    
    // Set up infinite scroll
    setupInfiniteScroll();
}

/**
 * Load feed with current filter and page
 */
async function loadFeed(tab = currentTab, filter = currentFilter, page = 1, append = false) {
    if (isLoading) return;
    
    isLoading = true;
    const feedContainer = document.getElementById('reviewFeed');
    
    if (!append) {
        if (typeof createSkeletonCard === 'function') {
            feedContainer.innerHTML = Array(3).fill(createSkeletonCard()).join('');
        } else {
            showLoading(feedContainer, 'Loading reviews...');
        }
    }
    
    try {
        // In production, this would be an API call
        // const response = await fetch(`/api/feed/?tab=${tab}&filter=${filter}&page=${page}`);
        // const data = await response.json();
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use sample data
        let posts = [...samplePosts];
        
        // Apply filter
        if (filter !== 'all') {
            posts = posts.filter(post => {
                const specialty = post.specialty.toLowerCase();
                const facility = post.facility.toLowerCase();
                return specialty.includes(filter) || facility.includes(filter);
            });
        }
        
        // Update state
        hasMore = posts.length > 0 && page < 3; // Simulate pagination
        
        // Render posts
        if (append) {
            posts.forEach(post => {
                const postElement = createPostCard(post);
                feedContainer.appendChild(postElement);
            });
        } else {
            feedContainer.innerHTML = '';
            posts.forEach(post => {
                const postElement = createPostCard(post);
                feedContainer.appendChild(postElement);
            });
        }
        
        // Update load more button visibility
        updateLoadMoreButton();
        
    } catch (error) {
        console.error('Error loading feed:', error);
        handleApiError(error, feedContainer);
    } finally {
        isLoading = false;
    }
}

/**
 * Create skeleton card HTML string
 */
function createSkeletonCard() {
    return `
        <article class="post-card skeleton-card" aria-hidden="true" style="pointer-events: none;">
            <div class="post-header" style="opacity: 0.7;">
                <div class="skeleton-element" style="width: 40px; height: 40px; border-radius: 50%; animation: pulse-skel 1.5s infinite ease-in-out; background: var(--color-border);"></div>
                <div class="post-author" style="width: 100%;">
                    <div class="skeleton-element" style="width: 40%; height: 16px; border-radius: 4px; margin-bottom: 8px; animation: pulse-skel 1.5s infinite ease-in-out; background: var(--color-border);"></div>
                    <div class="skeleton-element" style="width: 60%; height: 12px; border-radius: 4px; margin-bottom: 8px; animation: pulse-skel 1.5s infinite ease-in-out 0.2s; background: var(--color-border);"></div>
                    <div class="skeleton-element" style="width: 30%; height: 14px; border-radius: 4px; animation: pulse-skel 1.5s infinite ease-in-out 0.4s; background: var(--color-border);"></div>
                </div>
            </div>
            <div style="margin-top: 24px;">
                <div class="skeleton-element" style="width: 100%; height: 14px; border-radius: 4px; margin-bottom: 8px; animation: pulse-skel 1.5s infinite ease-in-out 0.1s; background: var(--color-border);"></div>
                <div class="skeleton-element" style="width: 95%; height: 14px; border-radius: 4px; margin-bottom: 8px; animation: pulse-skel 1.5s infinite ease-in-out 0.3s; background: var(--color-border);"></div>
                <div class="skeleton-element" style="width: 80%; height: 14px; border-radius: 4px; animation: pulse-skel 1.5s infinite ease-in-out 0.5s; background: var(--color-border);"></div>
            </div>
            <div class="post-actions" style="margin-top: 24px; opacity: 0.7; display: flex; gap: 12px;">
                <div class="skeleton-element" style="width: 60px; height: 24px; border-radius: 12px; animation: pulse-skel 1.5s infinite ease-in-out 0.2s; background: var(--color-border);"></div>
                <div class="skeleton-element" style="width: 60px; height: 24px; border-radius: 12px; animation: pulse-skel 1.5s infinite ease-in-out 0.4s; background: var(--color-border);"></div>
                <div class="skeleton-element" style="width: 100px; height: 24px; border-radius: 12px; animation: pulse-skel 1.5s infinite ease-in-out 0.6s; background: var(--color-border);"></div>
            </div>
        </article>
    `;
}

/**
 * Create post card HTML element
 */
function createPostCard(post) {
    const card = document.createElement('article');
    card.className = 'post-card';
    card.setAttribute('data-post-id', post.id);
    card.setAttribute('role', 'article');
    
    card.innerHTML = `
        <div class="post-header">
            ${generateAvatar(post.avatar, post.avatarColor, 'md')}
            <div class="post-author">
                <div>
                    <span class="post-author-name">${escapeHtml(post.author)}</span>
                    <span class="post-time">${escapeHtml(post.time)}</span>
                </div>
                <div class="post-rating">
                    ${generateStarRating(post.rating)}
                </div>
                <div class="post-doctor">${escapeHtml(post.doctor)}</div>
                <div class="post-meta">
                    ${escapeHtml(post.facility)} · ${escapeHtml(post.specialty)}
                    ${post.verified ? ' · ' + generateVerifiedBadge() : ''}
                </div>
            </div>
        </div>
        <p class="post-content">${escapeHtml(post.text)}</p>
        <div class="post-tags">
            ${post.tags.map(tag => generateTag(tag)).join('')}
        </div>
        <div class="post-ai-summary" id="ai-summary-${post.id}" style="display: none;">
            <div class="post-ai-summary-header">
                <svg class="icon icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                    <circle cx="12" cy="5" r="2"></circle>
                    <path d="M12 7v4"></path>
                    <line x1="8" y1="16" x2="8" y2="16"></line>
                    <line x1="16" y1="16" x2="16" y2="16"></line>
                </svg>
                <span class="post-ai-summary-title">AI Summary</span>
            </div>
            <p class="post-ai-summary-content">${escapeHtml(post.aiSummary)}</p>
        </div>
        <div class="post-actions">
            <button class="engagement-btn" data-action="like" data-post-id="${post.id}" aria-label="Like review">
                <svg class="icon icon-md" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span>${formatNumber(post.likes)}</span>
            </button>
            <button class="engagement-btn" data-action="comment" data-post-id="${post.id}" aria-label="Comment on review">
                <svg class="icon icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8-8v.5z"></path>
                </svg>
                <span>${formatNumber(post.comments)}</span>
            </button>
            <button class="engagement-btn" data-action="helpful" data-post-id="${post.id}" aria-label="Mark review as helpful">
                <svg class="icon icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                </svg>
                <span>Helpful (${formatNumber(post.helpful)})</span>
            </button>
            <button class="btn btn-outline btn-sm" data-action="ai-summary" data-post-id="${post.id}" aria-label="Show AI summary">
                ✨ AI Summary
            </button>
        </div>
    `;
    
    // Set up event listeners for this post
    setupPostEventListeners(card, post);
    
    return card;
}

/**
 * Set up event listeners for post card
 */
function setupPostEventListeners(card, post) {
    // Like button
    const likeBtn = card.querySelector('[data-action="like"]');
    if (likeBtn) {
        likeBtn.addEventListener('click', () => {
            likeBtn.classList.toggle('active');
            const countSpan = likeBtn.querySelector('span');
            const currentCount = parseInt(countSpan.textContent.replace(/,/g, ''));
            const newCount = likeBtn.classList.contains('active') ? currentCount + 1 : currentCount - 1;
            countSpan.textContent = formatNumber(newCount);
        });
    }
    
    // AI Summary toggle
    const aiSummaryBtn = card.querySelector('[data-action="ai-summary"]');
    const aiSummary = card.querySelector('.post-ai-summary');
    if (aiSummaryBtn && aiSummary) {
        aiSummaryBtn.addEventListener('click', () => {
            const isHidden = aiSummary.style.display === 'none';
            aiSummary.style.display = isHidden ? 'block' : 'none';
            aiSummaryBtn.textContent = isHidden ? 'Hide AI Summary' : '✨ AI Summary';
        });
    }
}

/**
 * Set up filter buttons
 */
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filter = e.target.dataset.filter;
            handleFilterChange(filter);
        });
    });
}

/**
 * Handle filter change
 */
function handleFilterChange(filter) {
    currentFilter = filter;
    currentPage = 1;
    
    // Update active state
    document.querySelectorAll('.filter-btn').forEach(btn => {
        const isActive = btn.dataset.filter === filter;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive);
    });
    
    // Reload feed
    loadFeed(currentTab, filter, currentPage, false);
}

/**
 * Set up load more button
 */
function setupLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            if (!isLoading && hasMore) {
                currentPage++;
                loadFeed(currentTab, currentFilter, currentPage, true);
            }
        });
    }
}

/**
 * Update load more button visibility
 */
function updateLoadMoreButton() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        if (hasMore) {
            loadMoreBtn.style.display = 'inline-flex';
            loadMoreBtn.disabled = false;
            loadMoreBtn.textContent = 'Load more experiences';
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }
}

/**
 * Set up infinite scroll
 */
function setupInfiniteScroll() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isLoading && hasMore) {
                currentPage++;
                loadFeed(currentTab, currentFilter, currentPage, true);
            }
        });
    }, {
        root: null,
        rootMargin: '200px',
        threshold: 0.1
    });
    
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        observer.observe(loadMoreBtn);
    }
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initFeedModule,
        loadFeed,
        createPostCard,
        handleFilterChange
    };
}
