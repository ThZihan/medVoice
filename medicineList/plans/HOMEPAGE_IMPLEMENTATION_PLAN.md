# MedVoice Homepage Implementation Plan

## Executive Summary

This document outlines the complete implementation strategy for the MedVoice BD homepage redesign. The homepage serves as the primary entry point for users to discover healthcare experiences, share their own reviews, and access AI-powered insights.

**Design Philosophy**: Warm, trusting aesthetic with healthcare-appropriate calming feel, Bangladesh-first approach, AI-forward but not overwhelming.

---

## 1. Homepage Content Strategy

### 1.1 Core Value Proposition

The homepage must communicate three key messages immediately:

1. **Trust & Community** - Real patient experiences, verified reviews, community-driven insights
2. **AI-Powered Discovery** - Natural language search, intelligent summaries, personalized recommendations
3. **Easy Contribution** - Multiple AI-assisted ways to share experiences (polish, voice, guided Q&A, WhatsApp)

### 1.2 Target Audience

- **Primary**: Patients in Bangladesh seeking doctor/hospital information
- **Secondary**: Healthcare providers monitoring their reputation
- **Tertiary**: Researchers and public health analysts (future)

### 1.3 Key User Journeys

1. **Discovery Journey**: User arrives → Browses feed → Reads reviews → Makes healthcare decision
2. **Search Journey**: User arrives → Uses AI search → Gets synthesized insights → Reads cited reviews
3. **Contribution Journey**: User arrives → Clicks share experience → Chooses AI mode → Submits review

---

## 2. Homepage Features & Components

### 2.1 Header Section (Sticky)

**Purpose**: Navigation, branding, user actions

**Components**:
- Logo: "MedVoice" with "BD" badge (amber, uppercase, small)
- Navigation Tabs: Feed, Trending, Nearby, Following
- Action Buttons:
  - "AI Search" - Opens RAG-powered search modal
  - "+ Share Experience" - Opens review creation modal

**Design Specs**:
- Sticky positioning with subtle shadow
- Teal underline on active tab (2.5px)
- Rounded pill-shaped buttons (22px radius)
- Hover: 0.15s transitions

**Technical Implementation**:
- HTML5 `<header>` with `position: sticky; top: 0; z-index: 50;`
- CSS transitions for smooth interactions
- JavaScript for modal triggers and tab switching

### 2.2 AI Feature Banner

**Purpose**: Highlight AI capabilities and encourage engagement

**Components**:
- Gradient background: Teal (#1A6B6B) to blue (#3A6B9A) gradient
- Icon: Magnifying glass (SVG, not emoji)
- Headline: "Ask AI about any doctor or hospital"
- Description: "Based on real community reviews — get AI-analyzed insights on wait times, doctor behavior, facility quality, and overall satisfaction."
- CTA Button: "Try AI Search" (white background, teal text)

**Design Specs**:
- Rounded corners (16px)
- Decorative circles for visual interest (semi-transparent white)
- White text on gradient
- Box shadow for depth

**Technical Implementation**:
- CSS `linear-gradient(135deg, #1A6B6B 0%, #2A8080 60%, #3A6B9A 100%)`
- SVG icon from Lucide or Material Symbols
- JavaScript click handler to open AI Search modal

### 2.3 Write Review CTA

**Purpose**: Encourage review submission with multiple AI-assisted options

**Components**:
- Avatar placeholder: "?" in muted gray circle
- Placeholder text: "Share a doctor or hospital experience..."
- Feature badges (pill-shaped):
  - "AI Polish" - Magic wand formatter
  - "Voice" - Voice-to-review
  - "Guide Me" - AI Interviewer

**Design Specs**:
- Dashed border (1.5px, color: #E2DAD0)
- Hover: Teal border color
- Rounded corners (14px)
- Flex layout with 12px gap
- Cursor pointer with transition

**Technical Implementation**:
- CSS `border: 1.5px dashed #E2DAD0;`
- JavaScript click handler to open Write Review modal
- Badge colors: Light teal background (#EEF8F8), teal text

### 2.4 Review Feed

**Purpose**: Display community experiences with filtering options

**Components**:

#### Filter Bar
- Filter Button: "Filter by: All | Doctors | Hospitals | Clinics | Labs"
- Horizontal scroll on mobile
- Active state: Teal underline

#### Post Cards
Each card contains:
- User avatar (initials, colored background)
- Author name + timestamp
- Star rating (amber stars, 1-5)
- Doctor name (Playfair Display, teal)
- Facility + specialty (muted text)
- Review text (DM Sans, line-height 1.7)
- Tags (colored by sentiment):
  - Positive: Green background (#E8F5EE), green text (#2E7D4F)
  - Negative: Red background (#FDECEA), red text (#C0392B)
  - Neutral: Gray background (#F0EDE8), gray text (#6B6560)
- AI Summary toggle button
- AI Summary box (gradient background, teal header)
- Engagement buttons:
  - Like (heart icon)
  - Comment (bubble icon)
  - Helpful (thumbs up icon)
- Verified Patient badge (if OCR verified)

**Design Specs**:
- Card: Off-white background (#FFFDF8), 1px border (#E2DAD0), 16px radius, subtle shadow
- Hover: TranslateY(-2px) with 0.15s transition
- Tags: Pill-shaped (20px radius), colored backgrounds
- AI Summary: Gradient background, bordered box

**Technical Implementation**:
- CSS Grid/Flexbox for layout
- JavaScript for dynamic rendering from API
- Intersection Observer for infinite scroll
- State management for likes/comments

### 2.5 Load More / Infinite Scroll

**Purpose**: Pagination for content discovery

**Components**:
- Button: "Load more experiences" (outlined pill button)
- Or: Automatic infinite scroll with loading spinner

**Design Specs**:
- Outlined button with muted text
- Loading state: Spinner animation
- Centered alignment

**Technical Implementation**:
- Intersection Observer API for scroll detection
- Fetch API for paginated data
- Loading state management

---

## 3. AI Feature Integration Points

### 3.1 AI Search Modal (RAG)

**Trigger**: Header "AI Search" button or Banner CTA

**Flow**:
1. User enters natural language query
2. System queries pgvector for semantic similarity
3. GLM-4 synthesizes response with citations
4. Display results with:
   - Doctor/hospital name
   - Overall rating (large amber number + stars)
   - Community sentiment percentage (green progress bar)
   - AI-generated summary
   - Pros/Cons lists (green/red backgrounds)
   - Cited reviews

**Components**:
- Modal with backdrop blur
- Search input with placeholder
- Loading state with spinning icon
- Result display:
  - Header: Name, facility, total reviews
  - Rating: Large number + star display
  - Sentiment: Progress bar with percentage
  - Summary: AI-generated text
  - Pros/Cons: Two-column grid
  - Citations: Linked review references
- "No data" state with "Write First Review" CTA

**Design Specs**:
- Modal: 20px radius, backdrop blur
- Teal header with sparkle icon
- Loading: Spinning magnifying glass
- Result cards: Structured layout with clear hierarchy

**Technical Implementation**:
- HTML `<dialog>` or custom modal overlay
- JavaScript for search API calls
- Loading states with timeout handling
- Error handling for API failures
- Responsive design for mobile/tablet/desktop

### 3.2 Write Review Modal

**Trigger**: Header "+ Share Experience" button or Write Review CTA

**Modes**:

#### Mode 1: Polish My Review
- Textarea for rough notes
- "AI Polish" button
- Display polished result with edit option
- Publish button

#### Mode 2: Guide Me (AI Interviewer)
- 6-step guided Q&A flow
- Progress bar (teal fill)
- Questions:
  1. Which doctor or facility are you reviewing?
  2. What did you visit for? (condition or service)
  3. How was the wait time and appointment scheduling?
  4. How would you describe the doctor's behavior and communication?
  5. Anything about the facility, staff, or cost worth mentioning?
  6. Would you recommend this doctor/facility? Why?
- "Generate Review" button
- Display structured result
- Publish button

#### Mode 3: Voice Review
- Large circular record button (90px)
- Recording timer display (MM:SS format)
- Pulsing animation while recording
- "Transcribing..." loading state
- Display transcript
- Publish button

#### Mode 4: WhatsApp Mode
- WhatsApp icon (large)
- Instructions
- Example conversation (Bengali/English)
- "Open WhatsApp Assistant" button (green #25D366)

**Design Specs**:
- Modal: 20px radius, backdrop blur
- Mode selection grid (2x2)
- Hover effects on mode cards
- Teal primary buttons
- Amber accent for final action
- Progress bar for Q&A mode

**Technical Implementation**:
- Mode selection state management
- Web Audio API for voice capture
- Fetch API for AI polish/guide endpoints
- WhatsApp deep linking
- Form validation
- Error handling

---

## 4. Design System

### 4.1 Color Palette

| Role | Color | Hex | Usage |
|-------|--------|------|------|
| Background | Cream | `#F5F0E8` | Page background, warm base |
| Card Surface | Off-White | `#FFFDF8` | Card backgrounds, content areas |
| Primary Teal | Teal | `#1A6B6B` | Primary actions, headings, accents |
| Teal Light | Light Teal | `#2A9090` | Hover states, secondary actions |
| Accent Amber | Amber | `#D4863A` | Emphasis, ratings, highlights |
| Amber Light | Light Amber | `#F0A855` | Amber hover states |
| Text Primary | Dark Gray | `#1C1C1C` | Headlines, primary text |
| Text Muted | Medium Gray | `#6B6560` | Secondary text, descriptions |
| Border | Light Beige | `#E2DAD0` | Card borders, dividers |
| Success Green | Green | `#2E7D4F` | Positive indicators, pros |
| Error Red | Red | `#C0392B` | Negative indicators, cons |
| Accent Purple | Purple | `#5B4A8A` | Special highlights, tags |

### 4.2 Typography

| Element | Font | Weight | Size | Usage |
|---------|--------|--------|------|------|
| Display Headings | Playfair Display | 700 | 22-28px | Page titles, section headers, doctor names |
| Body Text | DM Sans | 400-700 | 14-16px | Content, labels, buttons |
| Accent Text | DM Sans | 700 | 11-13px | Uppercase labels, emphasis |
| Small Text | DM Sans | 400-600 | 11-12px | Metadata, timestamps, descriptions |

**Font Loading**:
```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### 4.3 Spacing System

| Scale | Value | Usage |
|-------|-------|-------|
| xs | 4px | Micro spacing, icon gaps |
| sm | 8px | Small gaps, padding tight |
| md | 12px | Default gaps, padding |
| lg | 16px | Card padding, section spacing |
| xl | 24px | Section margins, modal padding |
| 2xl | 32px | Large sections, modal headers |

### 4.4 Border Radius

| Scale | Value | Usage |
|-------|-------|-------|
| sm | 8px | Small buttons, tags |
| md | 12px | Input fields, buttons |
| lg | 14px | Cards, CTA box |
| xl | 16px | Post cards, banners |
| 2xl | 20px | Modals |
| pill | 22px | Header buttons |

### 4.5 Shadows

| Scale | Value | Usage |
|-------|-------|-------|
| sm | `0 2px 12px rgba(0,0,0,0.04)` | Card hover |
| md | `0 4px 20px rgba(0,0,0,0.08)` | Modal |
| lg | `0 20px 60px rgba(0,0,0,0.2)` | Modal backdrop |

### 4.6 Transitions

| Property | Duration | Easing | Usage |
|----------|----------|--------|-------|
| fast | 0.15s | ease | Hover states |
| medium | 0.3s | ease | Modal open/close |
| slow | 0.5s | ease | Progress bars |

---

## 5. Responsive Layout Strategy

### 5.1 Mobile (< 768px)

**Layout**:
- Single column layout
- Stacked navigation tabs
- Full-width cards
- Bottom sheet modals (slide up from bottom)
- Touch targets minimum 44px

**Adjustments**:
- Header: Logo on left, actions stacked on right
- AI Banner: Reduced padding, stacked text
- Feed: Full-width cards, reduced padding
- Modals: Full-screen or bottom sheet
- Filter bar: Horizontal scroll

### 5.2 Tablet (768px - 1024px)

**Layout**:
- Two-column feature grid
- Optimized card widths
- Centered modals (max-width: 560px)
- Balanced spacing

**Adjustments**:
- Header: Horizontal layout
- AI Banner: Balanced text and CTA
- Feed: Cards with side margins
- Modals: Centered with max-width

### 5.3 Desktop (> 1024px)

**Layout**:
- Max-width container (680px)
- Three-column feature grid
- Centered modals (max-width: 560px)
- Hover states more prominent

**Adjustments**:
- Header: Centered with max-width
- AI Banner: Optimal spacing
- Feed: Cards with generous margins
- Modals: Centered with backdrop blur

---

## 6. Technical Implementation

### 6.1 File Structure

```
medicineList/frontend/
├── templates/
│   ├── base.html              # Base template with head, fonts, common CSS
│   ├── home.html               # Homepage template
│   └── components/
│       ├── header.html         # Header component
│       ├── ai_banner.html      # AI feature banner
│       ├── write_review_cta.html  # Write review CTA
│       ├── post_card.html      # Individual post card
│       ├── ai_search_modal.html    # AI search modal
│       └── write_review_modal.html  # Write review modal
├── static/
│   ├── css/
│   │   ├── variables.css       # CSS variables (colors, fonts, spacing)
│   │   ├── reset.css           # CSS reset
│   │   ├── typography.css      # Typography styles
│   │   ├── components.css     # Component styles
│   │   ├── layout.css          # Layout styles
│   │   └── responsive.css      # Media queries
│   ├── js/
│   │   ├── app.js              # Main app initialization
│   │   ├── feed.js             # Feed functionality
│   │   ├── ai-search.js        # AI search modal logic
│   │   ├── write-review.js     # Write review modal logic
│   │   └── utils.js            # Utility functions
│   └── images/
│       └── icons/              # SVG icons
```

### 6.2 HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MedVoice BD - Healthcare Reviews & AI Insights</title>
    <meta name="description" content="Discover real healthcare experiences in Bangladesh. AI-powered doctor and hospital reviews from verified patients.">
    
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- CSS -->
    <link rel="stylesheet" href="{% static 'css/variables.css' %}">
    <link rel="stylesheet" href="{% static 'css/reset.css' %}">
    <link rel="stylesheet" href="{% static 'css/typography.css' %}">
    <link rel="stylesheet" href="{% static 'css/components.css' %}">
    <link rel="stylesheet" href="{% static 'css/layout.css' %}">
    <link rel="stylesheet" href="{% static 'css/responsive.css' %}">
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="header-container">
            <div class="logo">
                <span class="logo-text">MedVoice</span>
                <span class="logo-badge">BD</span>
            </div>
            <nav class="nav-tabs">
                <button class="nav-tab active" data-tab="feed">Feed</button>
                <button class="nav-tab" data-tab="trending">Trending</button>
                <button class="nav-tab" data-tab="nearby">Nearby</button>
                <button class="nav-tab" data-tab="following">Following</button>
            </nav>
            <div class="header-actions">
                <button class="btn btn-outline btn-ai-search" id="aiSearchBtn">
                    <svg class="icon" viewBox="0 0 24 24"><!-- magnifying glass --></svg>
                    AI Search
                </button>
                <button class="btn btn-primary" id="shareExperienceBtn">
                    + Share Experience
                </button>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
        <div class="container">
            <!-- AI Banner -->
            <section class="ai-banner">
                <div class="ai-banner-content">
                    <div class="ai-banner-icon">
                        <svg class="icon" viewBox="0 0 24 24"><!-- magnifying glass --></svg>
                    </div>
                    <div class="ai-banner-text">
                        <h2 class="ai-banner-title">Ask AI about any doctor or hospital</h2>
                        <p class="ai-banner-description">
                            Based on real community reviews — get AI-analyzed insights on wait times, 
                            doctor behavior, facility quality, and overall satisfaction.
                        </p>
                    </div>
                    <button class="btn btn-white" id="aiSearchBannerBtn">Try AI Search</button>
                </div>
                <div class="ai-banner-decoration circle-1"></div>
                <div class="ai-banner-decoration circle-2"></div>
            </section>

            <!-- Write Review CTA -->
            <section class="write-review-cta" id="writeReviewCta">
                <div class="avatar avatar-placeholder">?</div>
                <span class="write-review-placeholder">Share a doctor or hospital experience...</span>
                <div class="feature-badges">
                    <span class="badge badge-teal">AI Polish</span>
                    <span class="badge badge-teal">Voice</span>
                    <span class="badge badge-teal">Guide Me</span>
                </div>
            </section>

            <!-- Filter Bar -->
            <div class="filter-bar">
                <button class="filter-btn active" data-filter="all">All</button>
                <button class="filter-btn" data-filter="doctors">Doctors</button>
                <button class="filter-btn" data-filter="hospitals">Hospitals</button>
                <button class="filter-btn" data-filter="clinics">Clinics</button>
                <button class="filter-btn" data-filter="labs">Labs</button>
            </div>

            <!-- Review Feed -->
            <section class="review-feed" id="reviewFeed">
                <!-- Posts will be dynamically loaded here -->
            </section>

            <!-- Load More -->
            <div class="load-more">
                <button class="btn btn-outline btn-load-more" id="loadMoreBtn">
                    Load more experiences
                </button>
            </div>
        </div>
    </main>

    <!-- AI Search Modal -->
    <div class="modal" id="aiSearchModal">
        <div class="modal-backdrop"></div>
        <div class="modal-content modal-ai-search">
            <div class="modal-header">
                <div>
                    <h2 class="modal-title">
                        <svg class="icon" viewBox="0 0 24 24"><!-- sparkle --></svg>
                        AI-Powered Search
                    </h2>
                    <p class="modal-subtitle">Ask anything about a doctor, hospital, or service</p>
                </div>
                <button class="modal-close" id="aiSearchClose">&times;</button>
            </div>
            <div class="modal-body">
                <div class="search-input-group">
                    <input type="text" class="search-input" id="aiSearchInput" 
                           placeholder='Try: "Dr Khanam Square Hospital" or "best cardiologist Dhaka"'>
                    <button class="btn btn-primary" id="aiSearchSubmit">Search</button>
                </div>
                <div class="search-results" id="searchResults">
                    <!-- Results will be dynamically loaded here -->
                </div>
            </div>
        </div>
    </div>

    <!-- Write Review Modal -->
    <div class="modal" id="writeReviewModal">
        <div class="modal-backdrop"></div>
        <div class="modal-content modal-write-review">
            <div class="modal-header">
                <h2 class="modal-title" id="writeReviewTitle">Share Your Experience</h2>
                <button class="modal-close" id="writeReviewClose">&times;</button>
            </div>
            <div class="modal-body">
                <!-- Mode Selection -->
                <div class="mode-selection" id="modeSelection">
                    <p class="mode-description">Choose how you'd like to share — our AI handles the hard part.</p>
                    <div class="mode-grid">
                        <button class="mode-card" data-mode="polish">
                            <div class="mode-icon">
                                <svg class="icon" viewBox="0 0 24 24"><!-- sparkle --></svg>
                            </div>
                            <h3 class="mode-title">Polish My Review</h3>
                            <p class="mode-description">Paste your rough notes — AI organizes them into a reader-ready review</p>
                        </button>
                        <button class="mode-card" data-mode="guide">
                            <div class="mode-icon">
                                <svg class="icon" viewBox="0 0 24 24"><!-- chat --></svg>
                            </div>
                            <h3 class="mode-title">Guide Me</h3>
                            <p class="mode-description">AI asks you questions and writes the review from your answers</p>
                        </button>
                        <button class="mode-card" data-mode="voice">
                            <div class="mode-icon">
                                <svg class="icon" viewBox="0 0 24 24"><!-- microphone --></svg>
                            </div>
                            <h3 class="mode-title">Voice Review</h3>
                            <p class="mode-description">Talk about your experience — AI transcribes and structures it for you</p>
                        </button>
                        <button class="mode-card" data-mode="whatsapp">
                            <div class="mode-icon">
                                <svg class="icon" viewBox="0 0 24 24"><!-- phone --></svg>
                            </div>
                            <h3 class="mode-title">WhatsApp Mode</h3>
                            <p class="mode-description">Chat with our AI assistant on WhatsApp and we publish your review</p>
                        </button>
                    </div>
                </div>

                <!-- Mode Content (dynamically shown/hidden) -->
                <div class="mode-content" id="modeContent">
                    <!-- Content will be dynamically loaded based on selected mode -->
                </div>
            </div>
        </div>
    </div>

    <!-- JavaScript -->
    <script src="{% static 'js/utils.js' %}"></script>
    <script src="{% static 'js/ai-search.js' %}"></script>
    <script src="{% static 'js/write-review.js' %}"></script>
    <script src="{% static 'js/feed.js' %}"></script>
    <script src="{% static 'js/app.js' %}"></script>
</body>
</html>
```

### 6.3 CSS Implementation

**variables.css**:
```css
:root {
    /* Colors */
    --color-bg: #F5F0E8;
    --color-card: #FFFDF8;
    --color-teal: #1A6B6B;
    --color-teal-light: #2A9090;
    --color-amber: #D4863A;
    --color-amber-light: #F0A855;
    --color-text: #1C1C1C;
    --color-muted: #6B6560;
    --color-border: #E2DAD0;
    --color-green: #2E7D4F;
    --color-red: #C0392B;
    --color-purple: #5B4A8A;
    
    /* Spacing */
    --space-xs: 4px;
    --space-sm: 8px;
    --space-md: 12px;
    --space-lg: 16px;
    --space-xl: 24px;
    --space-2xl: 32px;
    
    /* Border Radius */
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 14px;
    --radius-xl: 16px;
    --radius-2xl: 20px;
    --radius-pill: 22px;
    
    /* Shadows */
    --shadow-sm: 0 2px 12px rgba(0,0,0,0.04);
    --shadow-md: 0 4px 20px rgba(0,0,0,0.08);
    --shadow-lg: 0 20px 60px rgba(0,0,0,0.2);
    
    /* Transitions */
    --transition-fast: 0.15s ease;
    --transition-medium: 0.3s ease;
    --transition-slow: 0.5s ease;
    
    /* Typography */
    --font-display: 'Playfair Display', serif;
    --font-body: 'DM Sans', sans-serif;
}
```

### 6.4 JavaScript Implementation

**app.js**:
```javascript
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    initHeader();
    initAISearch();
    initWriteReview();
    initFeed();
    
    // Set up global event listeners
    setupGlobalListeners();
});

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
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = '';
}
```

---

## 7. API Integration

### 7.1 Required Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/feed/` | Get review feed with filters |
| GET | `/api/feed/?page=2` | Paginated feed |
| GET | `/api/search/rag/` | RAG-powered search |
| POST | `/api/reviews/ai-polish/` | Magic wand formatter |
| POST | `/api/reviews/ai-guide/` | Guided Q&A |
| POST | `/api/reviews/voice-transcribe/` | Voice-to-review |
| POST | `/api/reviews/publish/` | Publish review |
| GET | `/api/auth/profile/` | User profile |
| POST | `/api/reviews/like/` | Like review |
| POST | `/api/reviews/helpful/` | Mark review as helpful |

### 7.2 API Response Formats

**Feed Response**:
```json
{
    "results": [
        {
            "id": 1,
            "author": "Tanvir H.",
            "avatar": "TH",
            "avatar_color": "#1A6B6B",
            "doctor": "Dr. Farida Khanam",
            "facility": "Square Hospital, Dhaka",
            "specialty": "Cardiologist",
            "rating": 4,
            "time": "2h ago",
            "text": "Visited last week with chest pain concerns...",
            "likes": 34,
            "comments": 12,
            "helpful": 28,
            "tags": ["Thorough", "Follow-up care", "Long wait"],
            "ai_summary": "Positive experience. Strong doctor-patient communication...",
            "verified": false
        }
    ],
    "next": "/api/feed/?page=2",
    "count": 127
}
```

**AI Search Response**:
```json
{
    "name": "Dr. Farida Khanam",
    "facility": "Square Hospital",
    "overall": 4.2,
    "total_reviews": 47,
    "summary": "Based on 47 community reviews, Dr. Khanam is highly regarded...",
    "pros": ["Thorough consultations", "Patient and communicative", "Reliable follow-up"],
    "cons": ["Long wait times", "Appointment scheduling can be difficult"],
    "sentiment": 84,
    "citations": [
        {"review_id": 123, "snippet": "...thorough consultations..."},
        {"review_id": 456, "snippet": "...patient and communicative..."}
    ]
}
```

---

## 8. Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Set up design system CSS variables
- [ ] Implement header with navigation
- [ ] Create AI feature banner
- [ ] Build write review CTA section
- [ ] Set up modal infrastructure (HTML/CSS)
- [ ] Set up base template structure

### Phase 2: Review Feed (Week 2)
- [ ] Implement post card component
- [ ] Add star rating component
- [ ] Create tag system with sentiment colors
- [ ] Build filter functionality
- [ ] Implement load more pagination
- [ ] Connect to feed API
- [ ] Add loading states

### Phase 3: AI Features (Week 3)
- [ ] Build AI Search modal UI
- [ ] Implement Polish Review mode UI
- [ ] Implement Guide Me mode with Q&A flow UI
- [ ] Implement Voice Review mode with Web Audio API UI
- [ ] Build WhatsApp Mode interface
- [ ] Connect to AI APIs
- [ ] Add error handling

### Phase 4: Integration (Week 4)
- [ ] Connect all modals to backend APIs
- [ ] Implement authentication state
- [ ] Add error handling and loading states
- [ ] Test responsive behavior
- [ ] Accessibility audit (ARIA labels, keyboard navigation)
- [ ] Performance optimization
- [ ] Browser testing

---

## 9. Security & Privacy

### 9.1 Data Protection
- No email storage (phone-based auth only)
- OCR images deleted after verification
- Voice audio deleted after transcription
- Reviews remain on account deletion (anonymized)

### 9.2 AI Safety
- Defensive prompt engineering for all AI calls
- Pre-publish moderation for personal attacks and medical misinformation
- Reviews structured around service metrics, not medical diagnoses

### 9.3 Frontend Security
- XSS prevention (escape user input)
- CSRF tokens for form submissions
- Content Security Policy headers
- Secure cookie attributes

---

## 10. Success Metrics

### 10.1 Engagement
- Time spent on page
- Scroll depth
- Click-through rate on AI features

### 10.2 Conversion
- Review submission rate
- AI feature usage (polish, guide, voice, WhatsApp)
- Search query volume

### 10.3 Retention
- Return visitor rate
- Bookmarked doctors/facilities
- Following count

### 10.4 Search Success
- RAG query satisfaction
- Result relevance
- Cited review click-through

### 10.5 Accessibility
- WCAG compliance
- Keyboard navigation
- Screen reader compatibility

---

## 11. Browser Support

### 11.1 Target Browsers
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

### 11.2 Feature Requirements
- ES6+ JavaScript
- CSS Grid and Flexbox
- Web Audio API (for voice recording)
- Fetch API
- Intersection Observer API

---

## 12. Performance Optimization

### 12.1 Loading Performance
- Lazy load images
- Minify CSS/JS
- Use WebP images
- Implement code splitting (if needed)

### 12.2 Runtime Performance
- Debounce scroll events
- Use requestAnimationFrame for animations
- Optimize DOM manipulations
- Implement virtual scrolling for long lists

### 12.3 Caching Strategy
- Cache API responses (TTL: 5 minutes)
- Cache static assets (long-term)
- Use service workers for offline support (future)

---

## 13. Accessibility

### 13.1 ARIA Labels
- All interactive elements have proper ARIA labels
- Modal dialogs have `role="dialog"` and `aria-modal="true"`
- Live regions for dynamic content updates

### 13.2 Keyboard Navigation
- All interactive elements are keyboard accessible
- Visible focus indicators
- Logical tab order

### 13.3 Screen Reader Support
- Semantic HTML5 elements
- Alt text for images
- Proper heading hierarchy

### 13.4 Color Contrast
- WCAG AA compliant contrast ratios
- Not dependent on color alone for meaning

---

## 14. Testing Strategy

### 14.1 Unit Testing
- JavaScript utility functions
- Component rendering
- API response handling

### 14.2 Integration Testing
- API integration
- Modal interactions
- Feed loading and pagination

### 14.3 End-to-End Testing
- User journeys (search, write review, filter feed)
- Cross-browser testing
- Mobile responsiveness

### 14.4 Accessibility Testing
- Screen reader testing
- Keyboard navigation testing
- Color contrast validation

---

## 15. Launch Checklist

### 15.1 Pre-Launch
- [ ] All features implemented and tested
- [ ] API endpoints documented
- [ ] Error handling complete
- [ ] Loading states implemented
- [ ] Responsive design verified
- [ ] Accessibility audit passed
- [ ] Performance optimization complete
- [ ] Browser compatibility verified

### 15.2 Launch Day
- [ ] Deploy to production
- [ ] Monitor error logs
- [ ] Check API response times
- [ ] Verify AI features working
- [ ] Test user authentication flow

### 15.3 Post-Launch
- [ ] Monitor user engagement metrics
- [ ] Collect user feedback
- [ ] Track AI feature usage
- [ ] Analyze search query patterns
- [ ] Plan iterative improvements

---

## 16. Future Enhancements

### 16.1 Phase 2 Enhancements
- Entity pages for doctors/hospitals
- Advanced filtering (location, specialty, rating)
- User profiles with review history
- Following/following system

### 16.2 Phase 3 Enhancements
- Personalized recommendations
- Trending topics
- Notification system
- Email digest (optional)

### 16.3 Phase 4 Enhancements
- Advanced analytics dashboard
- Export data features
- Integration with other platforms
- Multi-language support (full Bengali)

---

## Conclusion

This implementation plan provides a comprehensive roadmap for building the MedVoice BD homepage. The design prioritizes trust, warmth, and AI-powered discovery while maintaining a Bangladesh-first approach. The modular architecture allows for iterative development and easy maintenance.

The homepage will serve as the foundation for the entire MedVoice platform, providing users with immediate access to community-driven healthcare insights and multiple pathways for contributing their own experiences.

---

**Document Version**: 1.0
**Last Updated**: 2025-03-12
**Author**: MedVoice Development Team
