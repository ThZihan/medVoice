# MedVoice Homepage Redesign Plan

## Project Overview

MedVoice BD is a healthcare review and social platform for Bangladesh that enables patients to share, explore, and analyze their healthcare experiences. The platform uses AI-assisted content creation (GLM-4 + Gemini API) to lower barriers to entry through multiple review submission methods.

## Design System Analysis

### Color Palette (from sample/medvoice-platform.jsx)

| Role | Color | Hex | Usage |
|-------|--------|------|
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

### Typography

| Element | Font | Weight | Usage |
|---------|--------|--------|
| Display Headings | Playfair Display (serif) | 700 | Page titles, section headers, doctor names |
| Body Text | DM Sans (sans-serif) | 400-700 | Content, labels, buttons |
| Accent Text | DM Sans (sans-serif) | 700 | Uppercase labels, emphasis |
| Small Text | DM Sans (sans-serif) | 400-600 | Metadata, timestamps, descriptions |

### Design Principles

1. **Warm, Trusting Aesthetic** - Cream background creates a healthcare-appropriate, calming feel
2. **Card-Based Layout** - Rounded corners (16px radius) with subtle shadows
3. **Mobile-First** - Responsive design prioritizing mobile experience
4. **Clear Visual Hierarchy** - Bold headings, muted secondary text
5. **Smooth Interactions** - 0.15s transitions on hover states
6. **AI-Forward Branding** - proper icons for AI features throughout
7. **Accessibility** - Touch-friendly targets, clear contrast ratios
8. **Bangladesh Context** - Phone-based login, WhatsApp integration prominent

## Homepage Sections & Features

### 1. Header Section

**Purpose:** Navigation, branding, user actions

**Components:**
- Logo/Brand: "MedVoice" with "BD" badge (amber, uppercase, small)
- Navigation Tabs: Feed, Trending, Nearby, Following
- Action Buttons:
  - "AI Search" - Opens RAG-powered search modal
  - "+ Share Experience" - Opens review creation modal

**Design:**
- Sticky header with subtle shadow
- Teal underline on active tab
- Rounded pill-shaped buttons (22px radius)

### 2. AI Feature Banner

**Purpose:** Highlight AI capabilities and encourage engagement

**Components:**
- Gradient background: Teal to blue gradient
- Icon: 🔍 (magnifying glass)
- Headline: "Ask AI about any doctor or hospital"
- Description: "Based on real community reviews — get AI-analyzed insights on wait times, doctor behavior, facility quality, and overall satisfaction."
- CTA Button: "Try AI Search" (white, teal text)

**Design:**
- Rounded corners (16px)
- Decorative circles for visual interest
- White text on gradient

### 3. Write Review CTA

**Purpose:** Encourage review submission with multiple AI-assisted options

**Components:**
- Avatar placeholder: "?" in muted gray circle
- Placeholder text: "Share a doctor or hospital experience..."
- Feature badges:
  - "✨ AI Polish" - Magic wand formatter
  - "🎤 Voice" - Voice-to-review
  - "💬 Guide Me" - AI Interviewer

**Design:**
- Dashed border (1.5px)
- Hover: Teal border color
- Rounded corners (14px)
- Flex layout with gap

### 4. Review Feed

**Purpose:** Display community experiences with filtering options

**Components:**
- Filter Button: "Filter by: All | Doctors | Hospitals | Clinics | Labs"
- Post Cards with:
  - User avatar (initials, colored background)
  - Author name + timestamp
  - Star rating (amber stars)
  - Doctor name (Playfair Display, teal)
  - Facility + specialty (muted)
  - Review text (DM Sans, line-height 1.7)
  - Tags (colored by sentiment: positive=green, negative=red, neutral=gray)
  - AI Summary toggle button
  - AI Summary box (gradient background, teal header)
  - Engagement: Like, Comment, Helpful buttons
  - Verified Patient badge (if OCR verified)

**Design:**
- Card: Off-white background, 1px border, 16px radius, subtle shadow
- Hover: TranslateY(-2px)
- Tags: Pill-shaped (20px radius), colored backgrounds
- AI Summary: Gradient background, bordered box

### 5. Load More

**Purpose:** Pagination for infinite scroll

**Components:**
- Button: "Load more experiences"
- Style: Outlined pill button, muted text

## AI Feature Integration Points

### 1. AI Search Modal (RAG)

**Trigger:** Header "AI Search" button or Banner CTA

**Flow:**
1. User enters natural language query
2. System queries pgvector for semantic similarity
3. GLM-4 synthesizes response with citations
4. Display:
   - Doctor/hospital name
   - Overall rating (large amber number + stars)
   - Community sentiment percentage (green progress bar)
   - AI-generated summary
   - Pros/Cons lists (green/red backgrounds)
   - Cited reviews

**Design:**
- Modal with backdrop blur
- Rounded corners (20px)
- Teal header with sparkle icon
- Loading state with spinning magnifying glass
- "No data" state with "Write First Review" CTA

### 2. Write Review Modal

**Trigger:** Header "+ Share Experience" button or Write Review CTA

**Modes:**
1. **Polish My Review**
   - Textarea for rough notes
   - "AI Polish" button
   - Display polished result with edit option
   - Publish button

2. **💬 Guide Me**
   - 6-step guided Q&A flow
   - Progress bar (teal fill)
   - Questions: Doctor/facility, condition, wait time, behavior, facility, recommendation
   - "Generate Review" button
   - Display structured result
   - Publish button

3. **🎤 Voice Review**
   - Large circular record button (90px)
   - Recording timer display
   - Pulsing animation while recording
   - "Transcribing..." loading state
   - Display transcript
   - Publish button

4. **📱 WhatsApp Mode**
   - WhatsApp icon (large)
   - Instructions
   - Example conversation (Bengali/English)
   - "Open WhatsApp Assistant" button (green)

**Design:**
- Modal with backdrop blur
- Rounded corners (20px)
- Mode selection grid (2x2)
- Hover effects on mode cards
- Teal primary buttons
- Amber accent for final action

## Responsive Layout Strategy

### Mobile (< 768px)
- Single column layout
- Stacked navigation tabs
- Full-width cards
- Bottom sheet modals
- Touch targets minimum 44px

### Tablet (768px - 1024px)
- Two-column feature grid
- Optimized card widths
- Centered modals

### Desktop (> 1024px)
- Max-width container (680px)
- Three-column feature grid
- Centered modals with max-width (560px)
- Hover states more prominent

## Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Set up design system CSS variables
- [ ] Implement header with navigation
- [ ] Create AI feature banner
- [ ] Build write review CTA section
- [ ] Set up modal infrastructure

### Phase 2: Review Feed (Week 2)
- [ ] Implement post card component
- [ ] Add star rating component
- [ ] Create tag system with sentiment colors
- [ ] Build filter functionality
- [ ] Implement load more pagination

### Phase 3: AI Features (Week 3)
- [ ] Build AI Search modal
- [ ] Implement Polish Review mode
- [ ] Implement Guide Me mode with Q&A flow
- [ ] Implement Voice Review mode with Web Audio API
- [ ] Build WhatsApp Mode interface

### Phase 4: Integration (Week 4)
- [ ] Connect to Django backend APIs
- [ ] Implement authentication state
- [ ] Add error handling and loading states
- [ ] Test responsive behavior
- [ ] Accessibility audit

## Technical Considerations

### Frontend Stack
- Vanilla JavaScript (as per documentation)
- Django templates for server-rendering
- Web Audio API for voice capture
- Fetch API for async AI calls

### API Endpoints Needed
- `GET /api/feed/` - Get review feed with filters
- `POST /api/reviews/ai-polish/` - Magic wand formatter
- `POST /api/reviews/ai-guide/` - Guided Q&A
- `POST /api/reviews/voice-transcribe/` - Voice-to-review
- `POST /api/search/rag/` - RAG-powered search
- `POST /api/reviews/publish/` - Publish review
- `POST /api/auth/login/` - OTP login
- `GET /api/auth/profile/` - User profile

### Security & Privacy
- No email storage (phone-based auth only)
- OCR images deleted after verification
- Voice audio deleted after transcription
- Reviews remain on account deletion (anonymized)
- Defensive prompt engineering for all AI calls

## Success Metrics

1. **Engagement:** Time spent on page, scroll depth
2. **Conversion:** Review submission rate, AI feature usage
3. **Retention:** Return visitor rate, bookmarked doctors
4. **Search Success:** RAG query satisfaction, result relevance
5. **Accessibility:** WCAG compliance, keyboard navigation

## Notes

- Design prioritizes trust and warmth over tech-forward aesthetic
- AI features are prominent but not overwhelming
- Bangladesh-specific: Phone login, WhatsApp integration, Bengali support
- Legal safety: Reviews structured around service metrics, not medical diagnoses
- Verified badge builds trust in community content
