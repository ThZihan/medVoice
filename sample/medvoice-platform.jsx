import { useState, useRef, useEffect } from "react";

const COLORS = {
  bg: "#F5F0E8",
  card: "#FFFDF8",
  teal: "#1A6B6B",
  tealLight: "#2A9090",
  amber: "#D4863A",
  amberLight: "#F0A855",
  text: "#1C1C1C",
  muted: "#6B6560",
  border: "#E2DAD0",
  red: "#C0392B",
  green: "#2E7D4F",
  purple: "#5B4A8A",
};

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
  },
];

const aiQASteps = [
  { q: "Which doctor or facility are you reviewing?", placeholder: "e.g. Dr. Rahman at BIRDEM Hospital..." },
  { q: "What did you visit for? (condition or service)", placeholder: "e.g. diabetes checkup, blood test, surgery..." },
  { q: "How was the wait time and appointment scheduling?", placeholder: "e.g. waited 30 mins, easy to book online..." },
  { q: "How would you describe the doctor's behavior and communication?", placeholder: "e.g. very attentive, explained clearly..." },
  { q: "Anything about the facility, staff, or cost worth mentioning?", placeholder: "e.g. clean, staff helpful, expensive..." },
  { q: "Would you recommend this doctor/facility? Why?", placeholder: "e.g. yes, because..." },
];

function StarRating({ rating, size = 16 }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ fontSize: size, color: s <= rating ? COLORS.amber : "#D5CCC0" }}>★</span>
      ))}
    </div>
  );
}

function Avatar({ initials, color, size = 40 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color, display: "flex", alignItems: "center",
      justifyContent: "center", color: "#fff",
      fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
      fontSize: size * 0.35, flexShrink: 0,
    }}>{initials}</div>
  );
}

function Tag({ label, sentiment }) {
  const colors = {
    positive: { bg: "#E8F5EE", text: COLORS.green },
    negative: { bg: "#FDECEA", text: COLORS.red },
    neutral: { bg: "#F0EDE8", text: COLORS.muted },
  };
  const col = sentiment === "positive" ? colors.positive : sentiment === "negative" ? colors.negative : colors.neutral;
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 20,
      background: col.bg, color: col.text,
      fontSize: 11, fontWeight: 600,
      fontFamily: "'DM Sans', sans-serif",
    }}>{label}</span>
  );
}

function PostCard({ post }) {
  const [liked, setLiked] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const tagSentiment = (tag) => {
    const neg = ["Long wait", "Rushed", "Expensive", "Rude"];
    const pos = ["Thorough", "Follow-up care", "Fast results", "Gentle staff", "Online reports", "Clean facility"];
    if (neg.includes(tag)) return "negative";
    if (pos.includes(tag)) return "positive";
    return "neutral";
  };
  return (
    <div style={{
      background: COLORS.card, border: `1px solid ${COLORS.border}`,
      borderRadius: 16, padding: 24, marginBottom: 16,
      boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      transition: "transform 0.15s", cursor: "default",
    }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <Avatar initials={post.avatar} color={post.avatarColor} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <span style={{ fontWeight: 700, fontFamily: "'DM Sans', sans-serif", color: COLORS.text }}>{post.author}</span>
              <span style={{ color: COLORS.muted, fontSize: 12, marginLeft: 8, fontFamily: "'DM Sans', sans-serif" }}>{post.time}</span>
            </div>
            <StarRating rating={post.rating} />
          </div>
          <div style={{ marginTop: 4 }}>
            <span style={{ fontWeight: 700, color: COLORS.teal, fontFamily: "'Playfair Display', serif", fontSize: 15 }}>{post.doctor}</span>
            <span style={{ color: COLORS.muted, fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}> · {post.facility} · {post.specialty}</span>
          </div>
        </div>
      </div>
      <p style={{ marginTop: 14, lineHeight: 1.7, color: COLORS.text, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>{post.text}</p>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
        {post.tags.map(t => <Tag key={t} label={t} sentiment={tagSentiment(t)} />)}
      </div>
      {showAI && (
        <div style={{
          marginTop: 14, padding: 14, borderRadius: 12,
          background: "linear-gradient(135deg, #E8F5F5, #EEF0FF)",
          border: `1px solid #C5DFE0`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 16 }}>🤖</span>
            <span style={{ fontWeight: 700, fontSize: 12, color: COLORS.teal, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.05em" }}>AI Summary</span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: COLORS.text, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>{post.aiSummary}</p>
        </div>
      )}
      <div style={{ display: "flex", gap: 16, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${COLORS.border}` }}>
        <button onClick={() => setLiked(!liked)} style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 5,
          color: liked ? COLORS.amber : COLORS.muted,
          fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
        }}>
          <span>{liked ? "♥" : "♡"}</span> {post.likes + (liked ? 1 : 0)}
        </button>
        <button style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 5,
          color: COLORS.muted, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
        }}>
          💬 {post.comments}
        </button>
        <button style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 5,
          color: COLORS.green, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
        }}>
          👍 Helpful ({post.helpful})
        </button>
        <button onClick={() => setShowAI(!showAI)} style={{
          marginLeft: "auto", background: showAI ? COLORS.teal : "none",
          border: `1px solid ${COLORS.teal}`, borderRadius: 20, padding: "4px 12px",
          cursor: "pointer", color: showAI ? "#fff" : COLORS.teal,
          fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
        }}>✨ AI Summary</button>
      </div>
    </div>
  );
}

function AISearchPanel({ onClose }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const mockResults = {
    "dr khanam": {
      name: "Dr. Farida Khanam",
      facility: "Square Hospital",
      overall: 4.2,
      totalReviews: 47,
      summary: "Based on 47 community reviews, Dr. Khanam is highly regarded for her thorough consultations and excellent follow-up care. Most patients appreciate her patience and detailed explanations. The main concern raised is the average wait time of 40–60 minutes. 89% of reviewers say they would return.",
      pros: ["Thorough consultations", "Patient and communicative", "Reliable follow-up"],
      cons: ["Long wait times", "Appointment scheduling can be difficult"],
      sentiment: 84,
    },
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      const key = query.toLowerCase().replace(/\s+/g, " ").trim();
      const found = Object.entries(mockResults).find(([k]) => key.includes(k));
      setResult(found ? found[1] : {
        name: query,
        summary: `We found limited community data for "${query}" yet. Be the first to share your experience and help others make informed decisions!`,
        noData: true,
      });
      setLoading(false);
    }, 1400);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, padding: 20,
    }}>
      <div style={{
        background: COLORS.card, borderRadius: 20, padding: 32,
        width: "100%", maxWidth: 560, maxHeight: "80vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: "'Playfair Display', serif", color: COLORS.teal, fontSize: 22 }}>
              ✨ AI-Powered Search
            </h2>
            <p style={{ margin: "4px 0 0", color: COLORS.muted, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
              Ask anything about a doctor, hospital, or service
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: COLORS.muted }}>×</button>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder='Try: "Dr Khanam Square Hospital" or "best cardiologist Dhaka"'
            style={{
              flex: 1, padding: "12px 16px", borderRadius: 12,
              border: `1.5px solid ${COLORS.border}`, fontFamily: "'DM Sans', sans-serif",
              fontSize: 14, background: COLORS.bg, color: COLORS.text,
              outline: "none",
            }}
          />
          <button onClick={handleSearch} style={{
            background: COLORS.teal, color: "#fff", border: "none",
            borderRadius: 12, padding: "12px 20px", cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14,
          }}>Search</button>
        </div>
        {loading && (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 32, animation: "spin 1s linear infinite" }}>🔍</div>
            <p style={{ color: COLORS.muted, fontFamily: "'DM Sans', sans-serif", marginTop: 12 }}>Analyzing community feedback...</p>
          </div>
        )}
        {result && !result.noData && (
          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontFamily: "'Playfair Display', serif", color: COLORS.text, fontSize: 18 }}>{result.name}</h3>
                <span style={{ color: COLORS.muted, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>{result.facility} · {result.totalReviews} reviews</span>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.amber, fontFamily: "'DM Sans', sans-serif" }}>{result.overall}</div>
                <StarRating rating={Math.round(result.overall)} size={14} />
              </div>
            </div>
            <div style={{ background: "#E8F5EE", borderRadius: 12, padding: 14, marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 12, color: COLORS.green, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.05em" }}>Community Sentiment</span>
                <span style={{ fontWeight: 800, color: COLORS.green, fontFamily: "'DM Sans', sans-serif" }}>{result.sentiment}% Positive</span>
              </div>
              <div style={{ height: 8, background: "#C5E0CE", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${result.sentiment}%`, height: "100%", background: COLORS.green, borderRadius: 4 }} />
              </div>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: COLORS.text, fontFamily: "'DM Sans', sans-serif", marginBottom: 14 }}>{result.summary}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ background: "#E8F5EE", borderRadius: 10, padding: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: COLORS.green, marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>👍 What people love</div>
                {result.pros.map(p => <div key={p} style={{ fontSize: 12, color: COLORS.text, fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>• {p}</div>)}
              </div>
              <div style={{ background: "#FDECEA", borderRadius: 10, padding: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: COLORS.red, marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>⚠️ Common concerns</div>
                {result.cons.map(p => <div key={p} style={{ fontSize: 12, color: COLORS.text, fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>• {p}</div>)}
              </div>
            </div>
          </div>
        )}
        {result?.noData && (
          <div style={{ marginTop: 20, textAlign: "center", padding: 20 }}>
            <div style={{ fontSize: 40 }}>🔎</div>
            <p style={{ color: COLORS.muted, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>{result.summary}</p>
            <button style={{
              background: COLORS.teal, color: "#fff", border: "none",
              borderRadius: 12, padding: "10px 20px", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
            }}>+ Write First Review</button>
          </div>
        )}
      </div>
    </div>
  );
}

function WriteReviewPanel({ onClose }) {
  const [mode, setMode] = useState(null); // null | 'polish' | 'qa' | 'voice' | 'whatsapp'
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(Array(aiQASteps.length).fill(""));
  const [rawReview, setRawReview] = useState("");
  const [polished, setPolished] = useState("");
  const [qaResult, setQAResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const timerRef = useRef(null);

  const mockPolished = `During my recent visit to [Facility], I had a consultation with [Doctor Name] regarding [condition]. Overall, the experience was [positive/mixed/disappointing].

The appointment scheduling process was [easy/challenging], and my actual wait time was approximately [X minutes]. Upon meeting the doctor, I found their communication style to be [thorough/rushed/professional], and they [did/did not] adequately address my concerns.

The facility itself was [clean and well-maintained/average/below expectations], and the supporting staff were [helpful/professional/could improve].

I would [strongly recommend / recommend with reservations / not recommend] this doctor or facility to others seeking similar care. My primary reasons are: [key reasons].`;

  const mockQAResult = `Based on your responses, here is your structured review:

I recently visited [facility] to see [doctor] for a [condition]. Getting an appointment was [scheduling experience], and I waited approximately [wait time] before being seen.

Dr. [Name]'s approach was [communication description]. They [listened/didn't rush/explained thoroughly] and I left feeling [informed/reassured/disappointed]. [Any specific positive or negative doctor notes].

The facility was [facility notes], and the staff [staff notes]. In terms of cost, [cost notes].

Overall, I [would/would not] recommend this doctor/facility. [Final recommendation reasoning]. My rating reflects [rating justification].`;

  const startRecording = () => {
    setRecording(true);
    setRecordingSeconds(0);
    timerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
  };

  const stopRecording = () => {
    setRecording(false);
    clearInterval(timerRef.current);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPolished("🎤 Voice transcription complete! Your spoken experience has been converted into a structured review. [In the real app, your voice would be transcribed and organized by AI into a full professional review covering wait time, doctor behavior, facility quality, and your recommendation.]");
    }, 2000);
  };

  const handlePolish = () => {
    setLoading(true);
    setTimeout(() => { setPolished(mockPolished); setLoading(false); }, 1800);
  };

  const handleQAComplete = () => {
    setLoading(true);
    setTimeout(() => { setQAResult(mockQAResult); setLoading(false); }, 1800);
  };

  const modes = [
    { key: "polish", icon: "✨", label: "Polish My Review", desc: "Paste your rough notes — AI organizes them into a reader-ready review" },
    { key: "qa", icon: "💬", label: "Guide Me", desc: "AI asks you questions and writes the review from your answers" },
    { key: "voice", icon: "🎤", label: "Voice Review", desc: "Talk about your experience — AI transcribes and structures it for you" },
    { key: "whatsapp", icon: "📱", label: "WhatsApp Mode", desc: "Chat with our AI assistant on WhatsApp and we publish your review" },
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, padding: 20,
    }}>
      <div style={{
        background: COLORS.card, borderRadius: 20, padding: 28,
        width: "100%", maxWidth: 560, maxHeight: "88vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontFamily: "'Playfair Display', serif", color: COLORS.teal, fontSize: 22 }}>
            {mode ? modes.find(m => m.key === mode)?.icon + " " + modes.find(m => m.key === mode)?.label : "Share Your Experience"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: COLORS.muted }}>×</button>
        </div>

        {!mode && (
          <div>
            <p style={{ color: COLORS.muted, fontFamily: "'DM Sans', sans-serif", fontSize: 14, marginBottom: 20 }}>
              Choose how you'd like to share — our AI handles the hard part.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {modes.map(m => (
                <button key={m.key} onClick={() => setMode(m.key)} style={{
                  background: COLORS.bg, border: `1.5px solid ${COLORS.border}`,
                  borderRadius: 14, padding: 16, cursor: "pointer", textAlign: "left",
                  transition: "all 0.15s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.teal; e.currentTarget.style.background = "#EEF8F8"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.background = COLORS.bg; }}
                >
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{m.icon}</div>
                  <div style={{ fontWeight: 700, fontFamily: "'DM Sans', sans-serif", color: COLORS.text, fontSize: 14, marginBottom: 4 }}>{m.label}</div>
                  <div style={{ color: COLORS.muted, fontSize: 12, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>{m.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {mode === "polish" && (
          <div>
            <p style={{ color: COLORS.muted, fontFamily: "'DM Sans', sans-serif", fontSize: 13, marginBottom: 14 }}>
              Write whatever comes to mind — messy, casual, incomplete. Our AI will restructure it into a polished, reader-ready review.
            </p>
            <textarea
              value={rawReview}
              onChange={e => setRawReview(e.target.value)}
              placeholder="e.g. dr rahman good but wait too long, his clinic clean, nurse rude, overall ok i guess, would go again maybe..."
              style={{
                width: "100%", height: 120, padding: 14, borderRadius: 12,
                border: `1.5px solid ${COLORS.border}`, fontFamily: "'DM Sans', sans-serif",
                fontSize: 13, resize: "vertical", background: COLORS.bg,
                color: COLORS.text, boxSizing: "border-box",
              }}
            />
            {!polished && (
              <button onClick={handlePolish} disabled={!rawReview.trim() || loading} style={{
                marginTop: 12, background: COLORS.teal, color: "#fff", border: "none",
                borderRadius: 12, padding: "11px 22px", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14,
                opacity: rawReview.trim() ? 1 : 0.5,
              }}>{loading ? "Polishing..." : "✨ AI Polish"}</button>
            )}
            {polished && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: COLORS.teal, fontFamily: "'DM Sans', sans-serif", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>✅ AI Polished Review</div>
                <div style={{ background: "#EEF8F8", borderRadius: 12, padding: 14, fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: COLORS.text, lineHeight: 1.7, whiteSpace: "pre-line" }}>{polished}</div>
                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                  <button style={{ background: COLORS.teal, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>Publish Review</button>
                  <button onClick={() => setPolished("")} style={{ background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", color: COLORS.muted }}>Re-polish</button>
                </div>
              </div>
            )}
          </div>
        )}

        {mode === "qa" && !qaResult && (
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
              {aiQASteps.map((_, i) => (
                <div key={i} style={{
                  flex: 1, height: 4, borderRadius: 2,
                  background: i <= step ? COLORS.teal : COLORS.border,
                  transition: "background 0.3s",
                }} />
              ))}
            </div>
            <p style={{ fontWeight: 700, fontFamily: "'DM Sans', sans-serif", color: COLORS.text, fontSize: 15, marginBottom: 10 }}>
              {step + 1}. {aiQASteps[step].q}
            </p>
            <textarea
              key={step}
              value={answers[step]}
              onChange={e => { const a = [...answers]; a[step] = e.target.value; setAnswers(a); }}
              placeholder={aiQASteps[step].placeholder}
              style={{
                width: "100%", height: 90, padding: 12, borderRadius: 12,
                border: `1.5px solid ${COLORS.border}`, fontFamily: "'DM Sans', sans-serif",
                fontSize: 13, resize: "none", background: COLORS.bg, color: COLORS.text, boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)} style={{
                  background: "none", border: `1px solid ${COLORS.border}`,
                  borderRadius: 10, padding: "10px 16px", cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", color: COLORS.muted,
                }}>← Back</button>
              )}
              {step < aiQASteps.length - 1 ? (
                <button onClick={() => setStep(s => s + 1)} disabled={!answers[step].trim()} style={{
                  background: COLORS.teal, color: "#fff", border: "none",
                  borderRadius: 10, padding: "10px 20px", cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                  opacity: answers[step].trim() ? 1 : 0.5,
                }}>Next →</button>
              ) : (
                <button onClick={handleQAComplete} disabled={loading} style={{
                  background: COLORS.amber, color: "#fff", border: "none",
                  borderRadius: 10, padding: "10px 20px", cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                }}>{loading ? "Writing..." : "✨ Generate Review"}</button>
              )}
            </div>
          </div>
        )}

        {mode === "qa" && qaResult && (
          <div>
            <div style={{ background: "#EEF8F8", borderRadius: 12, padding: 14, fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: COLORS.text, lineHeight: 1.7, whiteSpace: "pre-line" }}>{qaResult}</div>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button style={{ background: COLORS.teal, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>Publish Review</button>
              <button onClick={() => { setQAResult(""); setStep(0); }} style={{ background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", color: COLORS.muted }}>Start over</button>
            </div>
          </div>
        )}

        {mode === "voice" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            {!polished ? (
              <>
                <p style={{ color: COLORS.muted, fontFamily: "'DM Sans', sans-serif", fontSize: 13, marginBottom: 24 }}>
                  Tap to record. Just talk naturally about your experience — no structure needed. Our AI will handle the rest.
                </p>
                {!recording ? (
                  <button onClick={startRecording} style={{
                    width: 90, height: 90, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.tealLight})`,
                    border: "none", cursor: "pointer", fontSize: 36,
                    boxShadow: "0 8px 24px rgba(26,107,107,0.3)",
                  }}>🎤</button>
                ) : (
                  <div>
                    <div style={{ position: "relative", display: "inline-block" }}>
                      <button onClick={stopRecording} style={{
                        width: 90, height: 90, borderRadius: "50%",
                        background: COLORS.red, border: "none", cursor: "pointer", fontSize: 36,
                        boxShadow: `0 0 0 ${8 + (recordingSeconds % 3) * 4}px rgba(192,57,43,0.15)`,
                        transition: "box-shadow 0.5s",
                      }}>⏹</button>
                    </div>
                    <p style={{ color: COLORS.red, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", marginTop: 14 }}>
                      Recording... {Math.floor(recordingSeconds / 60)}:{String(recordingSeconds % 60).padStart(2, "0")}
                    </p>
                    <p style={{ color: COLORS.muted, fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>Tap to stop</p>
                  </div>
                )}
                {loading && <p style={{ color: COLORS.muted, fontFamily: "'DM Sans', sans-serif", marginTop: 20 }}>🔄 Transcribing & organizing your review...</p>}
              </>
            ) : (
              <div style={{ textAlign: "left" }}>
                <div style={{ background: "#EEF8F8", borderRadius: 12, padding: 14, fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: COLORS.text, lineHeight: 1.7 }}>{polished}</div>
                <button style={{ marginTop: 14, background: COLORS.teal, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>Publish Review</button>
              </div>
            )}
          </div>
        )}

        {mode === "whatsapp" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>📱</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: COLORS.text }}>Share via WhatsApp</h3>
            <p style={{ color: COLORS.muted, fontFamily: "'DM Sans', sans-serif", fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
              Message our AI assistant on WhatsApp. Just tell it about your experience in any language, any format. It will ask follow-up questions and post the final review on your behalf with your approval.
            </p>
            <div style={{ background: "#E8F5E9", borderRadius: 14, padding: 16, marginBottom: 20, textAlign: "left" }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#1B5E20", fontFamily: "'DM Sans', sans-serif", marginBottom: 8 }}>Example conversation:</div>
              {[
                { from: "user", text: "Amar doctor er experience share korte chai" },
                { from: "ai", text: "অবশ্যই! আপনি কোন ডাক্তার বা হাসপাতালের অভিজ্ঞতা শেয়ার করতে চান?" },
                { from: "user", text: "Dr. Rahman, square hospital" },
                { from: "ai", text: "Great! আপনার ওয়েটিং টাইম কেমন ছিল?" },
              ].map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.from === "user" ? "flex-end" : "flex-start", marginBottom: 6 }}>
                  <div style={{
                    background: msg.from === "user" ? "#DCF8C6" : "#fff",
                    borderRadius: 10, padding: "6px 10px",
                    fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                    maxWidth: "75%", color: COLORS.text,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  }}>{msg.text}</div>
                </div>
              ))}
            </div>
            <a href="#" style={{
              display: "inline-block", background: "#25D366", color: "#fff",
              border: "none", borderRadius: 12, padding: "12px 24px",
              fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14,
              textDecoration: "none",
            }}>Open WhatsApp Assistant</a>
          </div>
        )}

        {mode && <button onClick={() => { setMode(null); setPolished(""); setQAResult(""); setStep(0); setAnswers(Array(aiQASteps.length).fill("")); setRecording(false); setRecordingSeconds(0); }} style={{
          marginTop: 16, background: "none", border: "none", cursor: "pointer",
          color: COLORS.muted, fontFamily: "'DM Sans', sans-serif", fontSize: 13,
          display: "block",
        }}>← Back to options</button>}
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("feed");
  const [showSearch, setShowSearch] = useState(false);
  const [showWrite, setShowWrite] = useState(false);

  const tabs = ["feed", "trending", "nearby", "following"];

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{
        background: COLORS.card, borderBottom: `1px solid ${COLORS.border}`,
        position: "sticky", top: 0, zIndex: 50,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0" }}>
            <div>
              <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 22, color: COLORS.teal }}>MedVoice</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.amber, marginLeft: 4, verticalAlign: "super", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.08em" }}>BD</span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowSearch(true)} style={{
                background: COLORS.bg, border: `1.5px solid ${COLORS.border}`,
                borderRadius: 22, padding: "8px 16px", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                color: COLORS.teal, display: "flex", alignItems: "center", gap: 6,
              }}>✨ AI Search</button>
              <button onClick={() => setShowWrite(true)} style={{
                background: COLORS.teal, color: "#fff", border: "none",
                borderRadius: 22, padding: "8px 18px", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700,
              }}>+ Share Experience</button>
            </div>
          </div>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, borderTop: `1px solid ${COLORS.border}` }}>
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: "11px 18px", background: "none", border: "none",
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                fontWeight: tab === t ? 700 : 500, fontSize: 13,
                color: tab === t ? COLORS.teal : COLORS.muted,
                borderBottom: tab === t ? `2.5px solid ${COLORS.teal}` : "2.5px solid transparent",
                textTransform: "capitalize", transition: "all 0.15s",
              }}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Feed */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 20px" }}>
        {/* AI Banner */}
        <div style={{
          background: `linear-gradient(135deg, ${COLORS.teal} 0%, #2A8080 60%, #3A6B9A 100%)`,
          borderRadius: 16, padding: 20, marginBottom: 24, color: "#fff",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", right: -20, top: -20, width: 120, height: 120, background: "rgba(255,255,255,0.06)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", right: 30, bottom: -30, width: 80, height: 80, background: "rgba(255,255,255,0.05)", borderRadius: "50%" }} />
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>
            🔍 Ask AI about any doctor or hospital
          </div>
          <p style={{ margin: "0 0 14px", fontSize: 13, opacity: 0.85, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
            Based on real community reviews — get AI-analyzed insights on wait times, doctor behavior, facility quality, and overall satisfaction.
          </p>
          <button onClick={() => setShowSearch(true)} style={{
            background: "#fff", color: COLORS.teal, border: "none",
            borderRadius: 10, padding: "8px 18px", cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13,
          }}>Try AI Search</button>
        </div>

        {/* Write Review CTA */}
        <div onClick={() => setShowWrite(true)} style={{
          background: COLORS.card, border: `1.5px dashed ${COLORS.border}`,
          borderRadius: 14, padding: "14px 18px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
          transition: "border-color 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.teal}
          onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}
        >
          <Avatar initials="?" color={COLORS.muted} size={38} />
          <span style={{ color: COLORS.muted, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
            Share a doctor or hospital experience...
          </span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {["✨ AI Polish", "🎤 Voice", "💬 Guide Me"].map(opt => (
              <span key={opt} style={{
                fontSize: 11, fontWeight: 600, color: COLORS.teal,
                background: "#EEF8F8", padding: "3px 8px", borderRadius: 8,
                fontFamily: "'DM Sans', sans-serif",
              }}>{opt}</span>
            ))}
          </div>
        </div>

        {/* Posts */}
        {samplePosts.map(post => <PostCard key={post.id} post={post} />)}

        {/* Load more */}
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <button style={{
            background: "none", border: `1.5px solid ${COLORS.border}`,
            borderRadius: 22, padding: "10px 28px", cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: COLORS.muted,
          }}>Load more experiences</button>
        </div>
      </div>

      {showSearch && <AISearchPanel onClose={() => setShowSearch(false)} />}
      {showWrite && <WriteReviewPanel onClose={() => setShowWrite(false)} />}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        textarea:focus, input:focus { outline: 2px solid #1A6B6B !important; border-color: transparent !important; }
      `}</style>
    </div>
  );
}
