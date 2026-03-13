/**
 * MedVoice BD - Write Review Module
 * Handles all review creation modes (Polish, Guide, Voice, WhatsApp)
 */

let currentMode = null;
let currentStep = 0;
let answers = [];
let isProcessing = false;

// AI Q&A steps
const qaSteps = [
    { q: "Which doctor or facility are you reviewing?", placeholder: "e.g. Dr. Rahman at BIRDEM Hospital..." },
    { q: "What did you visit for? (condition or service)", placeholder: "e.g. diabetes checkup, blood test, surgery..." },
    { q: "How was the wait time and appointment scheduling?", placeholder: "e.g. waited 30 mins, easy to book online..." },
    { q: "How would you describe the doctor's behavior and communication?", placeholder: "e.g. very attentive, explained clearly..." },
    { q: "Anything about the facility, staff, or cost worth mentioning?", placeholder: "e.g. clean, staff helpful, expensive..." },
    { q: "Would you recommend this doctor/facility? Why?", placeholder: "e.g. yes, because..." }
];

/**
 * Initialize write review module
 */
function initWriteReviewModule() {
    console.log('Write Review module initialized');
    
    // Set up mode cards
    setupModeCards();
    
    // Set up close button
    const closeBtn = document.getElementById('writeReviewClose');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            closeModal('writeReviewModal');
            resetWriteReview();
        });
    }
}

/**
 * Set up mode selection cards
 */
function setupModeCards() {
    const modeCards = document.querySelectorAll('.mode-card');
    modeCards.forEach(card => {
        card.addEventListener('click', () => {
            const mode = card.dataset.mode;
            selectMode(mode);
        });
        
        // Handle keyboard activation
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const mode = card.dataset.mode;
                selectMode(mode);
            }
        });
    });
}

/**
 * Select a review mode
 */
function selectMode(mode) {
    currentMode = mode;
    
    // Hide mode selection
    const modeSelection = document.getElementById('modeSelection');
    if (modeSelection) {
        modeSelection.style.display = 'none';
    }
    
    // Update modal title
    const modalTitle = document.getElementById('writeReviewModalTitle');
    if (modalTitle) {
        const modeNames = {
            'polish': '✨ Polish My Review',
            'guide': '💬 Guide Me',
            'voice': '🎤 Voice Review',
            'whatsapp': '📱 WhatsApp Mode'
        };
        modalTitle.textContent = modeNames[mode] || 'Share Your Experience';
    }
    
    // Show mode content
    const modeContent = document.getElementById('modeContent');
    if (modeContent) {
        modeContent.style.display = 'block';
        
        switch (mode) {
            case 'polish':
                showPolishMode();
                break;
            case 'guide':
                showGuideMode();
                break;
            case 'voice':
                showVoiceMode();
                break;
            case 'whatsapp':
                showWhatsAppMode();
                break;
        }
    }
}

/**
 * Show Polish mode
 */
function showPolishMode() {
    const modeContent = document.getElementById('modeContent');
    modeContent.innerHTML = `
        <p class="mode-description">
            Write whatever comes to mind — messy, casual, incomplete. Our AI will restructure it into a polished, reader-ready review.
        </p>
        <textarea class="textarea" id="polishInput" placeholder="e.g. dr rahman good but wait too long, his clinic clean, nurse rude, overall ok i guess, would go again maybe..."></textarea>
        <button class="btn btn-primary" id="polishBtn" disabled>✨ AI Polish</button>
        <div id="polishedResult" style="display: none;"></div>
    `;
    
    // Set up polish button
    const polishInput = document.getElementById('polishInput');
    const polishBtn = document.getElementById('polishBtn');
    
    if (polishInput && polishBtn) {
        polishInput.addEventListener('input', () => {
            polishBtn.disabled = !polishInput.value.trim();
        });
        
        polishBtn.addEventListener('click', handlePolish);
    }
}

/**
 * Handle polish action
 */
async function handlePolish() {
    if (isProcessing) return;
    
    const polishInput = document.getElementById('polishInput');
    const text = polishInput.value.trim();
    
    if (!text) return;
    
    isProcessing = true;
    const polishBtn = document.getElementById('polishBtn');
    polishBtn.disabled = true;
    polishBtn.textContent = 'Polishing...';
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1800));
        
        // Mock polished result
        const polishedText = `During my recent visit to [Facility], I had a consultation with [Doctor Name] regarding [condition]. Overall, the experience was ${text.includes('good') ? 'positive' : text.includes('bad') ? 'disappointing' : 'mixed'}.

The appointment scheduling process was easy, and my actual wait time was approximately 30 minutes. Upon meeting the doctor, I found their communication style to be thorough and they adequately addressed my concerns.

The facility itself was clean and well-maintained, and the supporting staff were professional.

I would recommend this doctor or facility to others seeking similar care. My primary reasons are: quality of care and professional staff.`;
        
        // Display polished result
        const polishedResult = document.getElementById('polishedResult');
        polishedResult.style.display = 'block';
        polishedResult.innerHTML = `
            <div class="polished-header">
                <span class="badge badge-success">✅ AI Polished Review</span>
            </div>
            <div class="polished-content">${escapeHtml(polishedText)}</div>
            <div class="polished-actions">
                <button class="btn btn-primary">Publish Review</button>
                <button class="btn btn-outline" id="repolishBtn">Re-polish</button>
            </div>
        `;
        
        // Set up re-polish button
        const repolishBtn = document.getElementById('repolishBtn');
        if (repolishBtn) {
            repolishBtn.addEventListener('click', () => {
                polishedResult.style.display = 'none';
                polishBtn.textContent = '✨ AI Polish';
                polishBtn.disabled = false;
            });
        }
        
    } catch (error) {
        console.error('Polish error:', error);
        showToast('Failed to polish review. Please try again.', 'error');
    } finally {
        isProcessing = false;
    }
}

/**
 * Show Guide mode
 */
function showGuideMode() {
    const modeContent = document.getElementById('modeContent');
    modeContent.innerHTML = `
        <div class="qa-progress">
            ${qaSteps.map((_, i) => `
                <div class="qa-step" data-step="${i}" style="flex: 1; height: 4px; border-radius: 2px; background: ${i <= currentStep ? 'var(--color-teal)' : 'var(--color-border)'}; transition: background 0.3s;"></div>
            `).join('')}
        </div>
        <div class="qa-question">
            <p class="qa-question-text">${currentStep + 1}. ${escapeHtml(qaSteps[currentStep].q)}</p>
            <textarea class="textarea" id="qaInput" placeholder="${escapeHtml(qaSteps[currentStep].placeholder)}"></textarea>
        </div>
        <div class="qa-actions">
            ${currentStep > 0 ? '<button class="btn btn-outline" id="qaBackBtn">← Back</button>' : ''}
            ${currentStep < qaSteps.length - 1 
                ? '<button class="btn btn-primary" id="qaNextBtn" disabled>Next →</button>'
                : '<button class="btn btn-amber" id="qaGenerateBtn" disabled>✨ Generate Review</button>'
            }
        </div>
        <div id="qaResult" style="display: none;"></div>
    `;
    
    // Set up QA input and buttons
    setupQAButtons();
}

/**
 * Set up QA buttons
 */
function setupQAButtons() {
    const qaInput = document.getElementById('qaInput');
    const nextBtn = document.getElementById('qaNextBtn');
    const backBtn = document.getElementById('qaBackBtn');
    const generateBtn = document.getElementById('qaGenerateBtn');
    
    if (qaInput) {
        qaInput.addEventListener('input', () => {
            if (nextBtn) nextBtn.disabled = !qaInput.value.trim();
            if (generateBtn) generateBtn.disabled = !qaInput.value.trim();
        });
        
        qaInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && qaInput.value.trim()) {
                if (currentStep < qaSteps.length - 1) {
                    handleQANext();
                } else {
                    handleQAGenerate();
                }
            }
        });
    }
    
    if (backBtn) {
        backBtn.addEventListener('click', handleQABack);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', handleQANext);
    }
    
    if (generateBtn) {
        generateBtn.addEventListener('click', handleQAGenerate);
    }
}

/**
 * Handle QA next
 */
function handleQANext() {
    const qaInput = document.getElementById('qaInput');
    if (qaInput && qaInput.value.trim()) {
        answers[currentStep] = qaInput.value.trim();
        currentStep++;
        showGuideMode();
    }
}

/**
 * Handle QA back
 */
function handleQABack() {
    if (currentStep > 0) {
        currentStep--;
        showGuideMode();
    }
}

/**
 * Handle QA generate
 */
async function handleQAGenerate() {
    if (isProcessing) return;
    
    const qaInput = document.getElementById('qaInput');
    if (qaInput && qaInput.value.trim()) {
        answers[currentStep] = qaInput.value.trim();
    }
    
    isProcessing = true;
    const generateBtn = document.getElementById('qaGenerateBtn');
    if (generateBtn) {
        generateBtn.disabled = true;
        generateBtn.textContent = 'Writing...';
    }
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1800));
        
        // Mock generated review
        const generatedReview = `Based on your responses, here is your structured review:

I recently visited ${answers[0] || '[facility]'} to see ${answers[0] || '[doctor]'} for a ${answers[1] || '[condition]'}. Getting an appointment was ${answers[2] || 'easy'}, and I waited approximately 30 minutes before being seen.

Dr. ${answers[0]?.split('at')[0]?.trim() || '[Name]'}'s approach was ${answers[3] || 'professional'}. They ${answers[3]?.toLowerCase().includes('attentive') ? 'listened carefully' : 'addressed my concerns'} and I left feeling informed. ${answers[3] || ''}

The facility was ${answers[4] || 'clean'}, and the staff ${answers[4] || 'were helpful'}. In terms of cost, ${answers[4] || 'it was reasonable'}.

Overall, I would recommend this doctor/facility. ${answers[5] || 'The quality of care was good.'} My rating reflects the positive experience overall.`;
        
        // Display result
        const qaResult = document.getElementById('qaResult');
        qaResult.style.display = 'block';
        qaResult.innerHTML = `
            <div class="qa-result-content">${escapeHtml(generatedReview)}</div>
            <div class="qa-result-actions">
                <button class="btn btn-primary">Publish Review</button>
                <button class="btn btn-outline" id="qaRestartBtn">Start over</button>
            </div>
        `;
        
        // Set up restart button
        const restartBtn = document.getElementById('qaRestartBtn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                currentStep = 0;
                answers = [];
                showGuideMode();
            });
        }
        
    } catch (error) {
        console.error('QA generate error:', error);
        showToast('Failed to generate review. Please try again.', 'error');
    } finally {
        isProcessing = false;
    }
}

/**
 * Show Voice mode
 */
function showVoiceMode() {
    const modeContent = document.getElementById('modeContent');
    modeContent.innerHTML = `
        <div class="voice-container">
            <p class="mode-description">
                Tap to record. Just talk naturally about your experience — no structure needed. Our AI will handle the rest.
            </p>
            <div class="voice-recorder">
                <button class="voice-record-btn" id="voiceRecordBtn">
                    <svg class="icon icon-xl" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        <line x1="12" y1="19" x2="12" y2="23"></line>
                        <line x1="8" y1="23" x2="16" y2="23"></line>
                    </svg>
                </button>
                <div class="voice-timer" id="voiceTimer" style="display: none;">00:00</div>
            </div>
            <p class="voice-status" id="voiceStatus"></p>
        </div>
        <div id="voiceResult" style="display: none;"></div>
    `;
    
    // Set up voice recording
    setupVoiceRecording();
}

/**
 * Set up voice recording
 */
function setupVoiceRecording() {
    const recordBtn = document.getElementById('voiceRecordBtn');
    const timerDisplay = document.getElementById('voiceTimer');
    const statusDisplay = document.getElementById('voiceStatus');
    
    if (recordBtn) {
        recordBtn.addEventListener('click', () => {
            // In production, this would use Web Audio API
            // For now, simulate recording
            simulateVoiceRecording(recordBtn, timerDisplay, statusDisplay);
        });
    }
}

/**
 * Simulate voice recording
 */
function simulateVoiceRecording(recordBtn, timerDisplay, statusDisplay) {
    let isRecording = false;
    let seconds = 0;
    let timerInterval;
    
    recordBtn.addEventListener('click', () => {
        if (!isRecording) {
            // Start recording
            isRecording = true;
            seconds = 0;
            recordBtn.classList.add('recording');
            recordBtn.innerHTML = `
                <svg class="icon icon-xl" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
            `;
            timerDisplay.style.display = 'block';
            statusDisplay.textContent = 'Recording...';
            statusDisplay.style.color = 'var(--color-error)';
            
            timerInterval = setInterval(() => {
                seconds++;
                const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
                const secs = (seconds % 60).toString().padStart(2, '0');
                timerDisplay.textContent = `${mins}:${secs}`;
            }, 1000);
            
        } else {
            // Stop recording
            isRecording = false;
            clearInterval(timerInterval);
            recordBtn.classList.remove('recording');
            recordBtn.innerHTML = `
                <svg class="icon icon-xl" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
            `;
            statusDisplay.textContent = 'Transcribing...';
            statusDisplay.style.color = 'var(--color-text-muted)';
            
            // Simulate transcription
            setTimeout(() => {
                const voiceResult = document.getElementById('voiceResult');
                voiceResult.style.display = 'block';
                voiceResult.innerHTML = `
                    <div class="voice-transcript">
                        <div class="transcript-header">
                            <span class="badge badge-success">🎤 Voice Transcription Complete</span>
                        </div>
                        <div class="transcript-content">
                            I visited Dr. Rahman at BIRDEM Hospital last week for a diabetes checkup. The wait time was about 45 minutes, which was longer than expected. However, Dr. Rahman was very thorough and explained everything clearly. The facility was clean and the staff were helpful. Overall, I would recommend him to others.
                        </div>
                        <button class="btn btn-primary">Publish Review</button>
                    </div>
                `;
                statusDisplay.textContent = '';
                timerDisplay.style.display = 'none';
            }, 2000);
        }
    });
}

/**
 * Show WhatsApp mode
 */
function showWhatsAppMode() {
    const modeContent = document.getElementById('modeContent');
    modeContent.innerHTML = `
        <div class="whatsapp-container">
            <div class="whatsapp-icon">
                <svg class="icon" viewBox="0 0 24 24" fill="currentColor" style="width: 60px; height: 60px;">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.297.297-.297.297-.297.149-.198.297-.297.446-.496.198-.298.496-.596.596-.894.099-.298.099-.596 0-.894-.198-.298-.297-.596-.496-.894-.596-.297.099-.596.149-.894.149-.297 0-.596.05-.894.149-.298.099-.596.297-.894.596.298-.297.496-.596.596-.894.099-.298.099-.596 0-.894-.198-.298-.297-.596-.496-.894-.596z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.05 16.5c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5 4.5 2 4.5 4.5-2 4.5-4.5 4.5z"/>
                </svg>
            </div>
            <h3 class="whatsapp-title">Share via WhatsApp</h3>
            <p class="mode-description">
                Message our AI assistant on WhatsApp. Just tell it about your experience in any language, any format. It will ask follow-up questions and post the final review on your behalf with your approval.
            </p>
            <div class="whatsapp-example">
                <div class="example-header">Example conversation:</div>
                ${[
                    { from: 'user', text: 'Amar doctor er experience share korte chai' },
                    { from: 'ai', text: 'অবশ্যই! আপনি কোন ডাক্তার বা হাসপাতালের অভিজ্ঞতা শেয়ার করতে চান?' },
                    { from: 'user', text: 'Dr. Rahman, square hospital' },
                    { from: 'ai', text: 'Great! আপনার ওয়েটিং টাইম কেমন ছিল?' }
                ].map(msg => `
                    <div class="example-message example-message-${msg.from}">
                        ${escapeHtml(msg.text)}
                    </div>
                `).join('')}
            </div>
            <a href="https://wa.me/?text=Hi%2C%20I%20want%20to%20share%20a%20healthcare%20experience" 
               class="btn btn-whatsapp" 
               target="_blank" 
               rel="noopener noreferrer">
                Open WhatsApp Assistant
            </a>
        </div>
    `;
}

/**
 * Reset write review state
 */
function resetWriteReview() {
    currentMode = null;
    currentStep = 0;
    answers = [];
    isProcessing = false;
    
    // Reset modal title
    const modalTitle = document.getElementById('writeReviewModalTitle');
    if (modalTitle) {
        modalTitle.textContent = 'Share Your Experience';
    }
    
    // Show mode selection
    const modeSelection = document.getElementById('modeSelection');
    if (modeSelection) {
        modeSelection.style.display = 'flex';
    }
    
    // Hide mode content
    const modeContent = document.getElementById('modeContent');
    if (modeContent) {
        modeContent.style.display = 'none';
        modeContent.innerHTML = '';
    }
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initWriteReviewModule,
        selectMode,
        showPolishMode,
        showGuideMode,
        showVoiceMode,
        showWhatsAppMode,
        resetWriteReview
    };
}
