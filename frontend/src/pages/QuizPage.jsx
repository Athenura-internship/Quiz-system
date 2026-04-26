import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiCall } from "../utils/api";

const LABELS = ["A", "B", "C", "D"];

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getResultMsg(pct) {
  if (pct >= 90) return { msg: "Outstanding! You're a star! 🌟", color: "text-sky-600" };
  if (pct >= 75) return { msg: "Excellent work! Keep it up! 🎉", color: "text-green-600" };
  if (pct >= 55) return { msg: "Good job! A little more practice! 👍", color: "text-amber-600" };
  return { msg: "Keep practicing, you can do it! 💪", color: "text-red-500" };
}

// ── Submit Confirmation Modal ──────────────────────────────────────────────────
function SubmitModal({ answers, totalQuestions, marked, onConfirm, onCancel }) {
  const attempted = answers.filter((a) => a !== null).length;
  const notAttempted = totalQuestions - attempted;
  const markedCount = marked.filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl border border-sky-100 shadow-2xl w-full max-w-sm p-6">
        <div className="text-center mb-5">
          <div className="w-14 h-14 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 4L4 9v7c0 6.4 4.3 12.4 10 14 5.7-1.6 10-7.6 10-14V9L14 4z" stroke="#0EA5E9" strokeWidth="1.8"/>
              <path d="M9.5 14l3 3L18.5 11" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="text-lg font-bold text-sky-900" style={{ fontFamily: "'Outfit',sans-serif" }}>
            Submit Quiz?
          </h3>
          <p className="text-xs text-slate-500 mt-1">Please review before final submission</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{attempted}</div>
            <div className="text-[10px] text-green-700 font-semibold mt-0.5">Attempted</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-red-500">{notAttempted}</div>
            <div className="text-[10px] text-red-600 font-semibold mt-0.5">Not Attempted</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-purple-600">{markedCount}</div>
            <div className="text-[10px] text-purple-700 font-semibold mt-0.5">Marked</div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-slate-50 rounded-xl p-3 mb-5 space-y-1.5">
          <p className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Question Status</p>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="w-5 h-5 rounded-md bg-green-500 flex-shrink-0 block"></span>
            Answered — {attempted} questions
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="w-5 h-5 rounded-md bg-red-400 flex-shrink-0 block"></span>
            Not Answered — {notAttempted} questions
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="w-5 h-5 rounded-md bg-purple-400 flex-shrink-0 block"></span>
            Marked for Review — {markedCount} questions
          </div>
        </div>

        {notAttempted > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-4 text-xs text-amber-700 font-medium">
            ⚠ You have {notAttempted} unanswered question{notAttempted > 1 ? "s" : ""}. They will be marked wrong.
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 h-10 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-10 rounded-xl bg-sky-500 text-white text-sm font-bold hover:bg-sky-600 transition-all"
          >
            Submit Now
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Security Warning Modal ───────────────────────────────────────────────────
function SecurityModal({ warnings, maxWarnings, onDismiss }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl border-2 border-red-100 shadow-2xl w-full max-w-sm p-8 text-center animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2" style={{ fontFamily: "'Outfit',sans-serif" }}>
          Security Alert!
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-6">
          Tab switching or leaving the quiz window is strictly prohibited. This is your <span className="font-bold text-red-600">warning {warnings} of {maxWarnings}</span>.
        </p>
        <div className="bg-red-50 rounded-2xl p-4 mb-8">
          <p className="text-xs text-red-700 font-bold uppercase tracking-wider">
            {warnings >= maxWarnings ? "Last warning! Next violation will auto-submit." : "Please stay on this page to continue."}
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="w-full h-12 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-lg"
        >
          I Understand
        </button>
      </div>
    </div>
  );
}

// ── Main QuizPage ──────────────────────────────────────────────────────────────
export default function QuizPage() {
  const navigate = useNavigate();
  const { id: contestId } = useParams();
  
  const [current, setCurrent] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [contestDetails, setContestDetails] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [marked, setMarked] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  
  const [warnings, setWarnings] = useState(0);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const MAX_WARNINGS = 3;

  const startTimeRef = useRef(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
    fetchQuiz();
  }, [contestId]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await apiCall("/quiz/start-quiz", {
        method: "POST",
        body: JSON.stringify({ contestId })
      });

      if (response.success) {
        const { contestDetails, questions } = response.data;
        setContestDetails(contestDetails);
        setQuestions(questions);
        setAnswers(new Array(questions.length).fill(null));
        setMarked(new Array(questions.length).fill(false));
        setTimeLeft(contestDetails.duration * 60);
        startTimeRef.current = Date.now();
      }
    } catch (err) {
      setError(err.message || "Failed to load quiz.");
    } finally {
      setLoading(false);
    }
  };

  // ── Timer ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (submitted || !timeLeft) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { 
          clearInterval(interval); 
          confirmSubmit(); 
          return 0; 
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [submitted, timeLeft]);

  // ── Security Listeners ────────────────────────────────────────────────────────
  useEffect(() => {
    if (submitted || loading) return;

    const handleViolation = () => {
      setWarnings(prev => {
        const next = prev + 1;
        if (next >= MAX_WARNINGS) {
          confirmSubmit();
          return next;
        }
        setShowSecurityModal(true);
        return next;
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") handleViolation();
    };

    const handleBlur = () => handleViolation();

    const preventDefault = (e) => e.preventDefault();

    const handleKeydown = (e) => {
      // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+C, Ctrl+V, Ctrl+S
      const isDevTools = e.keyCode === 123 || (e.ctrlKey && e.shiftKey && [73, 74, 67].includes(e.keyCode));
      const isCopyPaste = e.ctrlKey && [85, 67, 86, 83].includes(e.keyCode);
      
      if (isDevTools || isCopyPaste) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("contextmenu", preventDefault);
    document.addEventListener("copy", preventDefault);
    document.addEventListener("paste", preventDefault);
    document.addEventListener("keydown", handleKeydown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("contextmenu", preventDefault);
      document.removeEventListener("copy", preventDefault);
      document.removeEventListener("paste", preventDefault);
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [submitted, loading]);

  // ── Fullscreen Enforcement ───────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && !submitted && questions.length > 0) {
      const enterFS = async () => {
        try {
          if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
          }
        } catch (err) {
          console.warn("Fullscreen request failed", err);
        }
      };
      enterFS();
    }
    
    const handleFSChange = () => {
      if (!document.fullscreenElement && !submitted && !loading) {
        setWarnings(prev => {
          const next = prev + 1;
          if (next >= MAX_WARNINGS) {
            confirmSubmit();
            return next;
          }
          setShowSecurityModal(true);
          return next;
        });
      }
    };

    document.addEventListener("fullscreenchange", handleFSChange);
    return () => document.removeEventListener("fullscreenchange", handleFSChange);
  }, [loading, submitted, questions.length]);

  // ── Select answer ────────────────────────────────────────────────────────────
  const selectAnswer = (optIndex) => {
    if (submitted) return;
    const updated = [...answers];
    updated[current] = optIndex;
    setAnswers(updated);
  };

  // ── Toggle mark for review ───────────────────────────────────────────────────
  const toggleMark = () => {
    if (submitted) return;
    const updated = [...marked];
    updated[current] = !updated[current];
    setMarked(updated);
  };

  // ── Navigate ─────────────────────────────────────────────────────────────────
  const goTo = (index) => {
    if (index < 0 || index >= questions.length) return;
    setCurrent(index);
  };

  // ── Confirm submit ───────────────────────────────────────────────────────────
  const confirmSubmit = async () => {
    if (submitted) return;
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
    setTimeTaken(elapsed);
    
    // Map answers to the format expected by backend
    const submissionAnswers = questions.map((q, i) => ({
      questionId: q._id,
      selectedAnswer: answers[i]
    }));

    try {
      const response = await apiCall("/quiz/submit-quiz", {
        method: "POST",
        body: JSON.stringify({
          contestId: contestId,
          domain: contestDetails.domain,
          answers: submissionAnswers,
          timeTaken: elapsed
        })
      });

      if (response.success) {
        setScoreData({
          score: response.score,
          total: response.total
        });
        setSubmitted(true);
        setShowModal(false);
        setShowSecurityModal(false);
        // Exit Fullscreen on completion
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
      }
    } catch (err) {
      alert("Submission failed: " + err.message);
    }
  };

  const TOTAL = questions.length;
  
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Initializing Secure Quiz Session...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="text-6xl mb-6">🚫</div>
      <h2 className="text-2xl font-black text-slate-800 mb-2">Access Denied</h2>
      <p className="text-slate-500 max-w-md mb-8">{error}</p>
      <button onClick={() => navigate('/upcoming')} className="px-8 py-3 bg-sky-500 text-white font-bold rounded-xl shadow-lg hover:bg-sky-600 transition-all">
        Back to Upcoming Quizzes
      </button>
    </div>
  );

  // ── Stats ────────────────────────────────────────────────────────────────────
  const answeredCount = answers.filter((a) => a !== null).length;
  const notAnsweredCount = TOTAL - answeredCount;
  const markedCount = marked.filter(Boolean).length;
  const progressPct = Math.round(((current + 1) / TOTAL) * 100);
  const isLastQuestionAnswered = answers[TOTAL - 1] !== null;

  // ── Result ───────────────────────────────────────────────────────────────────
  const correctCount = scoreData ? scoreData.score : 0;
  const wrongCount = TOTAL - correctCount - (TOTAL - answeredCount);
  const scorePct = TOTAL > 0 ? Math.round((correctCount / TOTAL) * 100) : 0;
  const resultMsg = getResultMsg(scorePct);

  // ── Timer color ──────────────────────────────────────────────────────────────
  const timerClass =
    timeLeft <= 60 ? "bg-red-100 text-red-700 animate-pulse"
    : timeLeft <= 180 ? "bg-amber-100 text-amber-700"
    : "bg-white text-sky-700";

  // ── Dot color logic ──────────────────────────────────────────────────────────
  const getDotClass = (i) => {
    if (i === current) return "bg-sky-500 border-sky-500 text-white";
    if (marked[i]) return "bg-purple-400 border-purple-400 text-white";
    if (answers[i] !== null) return "bg-green-500 border-green-500 text-white";
    if (i < current) return "bg-red-400 border-red-400 text-white";
    return "bg-white border-sky-200 text-slate-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-slate-50">

      {showModal && (
        <SubmitModal
          answers={answers}
          totalQuestions={TOTAL}
          marked={marked}
          onConfirm={confirmSubmit}
          onCancel={() => setShowModal(false)}
        />
      )}

      {showSecurityModal && (
        <SecurityModal
          warnings={warnings}
          maxWarnings={MAX_WARNINGS}
          onDismiss={() => setShowSecurityModal(false)}
        />
      )}

      {/* ── HEADER ── */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-3"
        style={{ background: "linear-gradient(135deg, #0EA5E9, #38BDF8)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/25 border border-white/40 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
              <path d="M11 2L4 6.5v5c0 4.6 3.1 8.9 7 10 3.9-1.1 7-5.4 7-10v-5L11 2z" fill="white" />
              <path d="M8 11l2.2 2.2L14 8.5" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-sm text-white" style={{ fontFamily: "'Outfit',sans-serif" }}>
              Athen<span className="text-sky-100">ura</span> Quiz
            </span>
            <p className="text-[10px] text-white/70 hidden sm:block">{user?.name} · {user?.uniqueId}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:block bg-white/20 border border-white/35 rounded-full px-3 py-0.5 text-xs font-semibold text-white">
            {contestDetails?.domain}
          </span>
          <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${timerClass}`}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M7 4.5V7l1.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* ── PROGRESS BAR ── */}
      <div className="h-1.5 bg-sky-200">
        <div className="h-full bg-sky-500 transition-all duration-500" style={{ width: `${progressPct}%` }} />
      </div>

      {/* ── BODY ── */}
      <div className="max-w-3xl mx-auto px-3 sm:px-5 py-4">

        {!submitted ? (
          <>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { label: "Total", val: TOTAL, color: "text-sky-900" },
                { label: "Answered", val: answeredCount, color: "text-green-600" },
                { label: "Not Answered", val: notAnsweredCount, color: "text-red-500" },
                { label: "Marked", val: markedCount, color: "text-purple-600" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl border border-sky-100 p-2 text-center">
                  <div className={`text-lg sm:text-xl font-bold ${s.color}`}>{s.val}</div>
                  <div className="text-[9px] sm:text-[10px] text-slate-500 font-medium mt-0.5 leading-tight">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {[
                { color: "bg-sky-500", label: "Current" },
                { color: "bg-green-500", label: "Answered" },
                { color: "bg-red-400", label: "Not Answered" },
                { color: "bg-purple-400", label: "Marked" },
                { color: "bg-white border border-sky-200", label: "Not Visited" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5 text-[10px] text-slate-600 font-medium">
                  <span className={`w-3.5 h-3.5 rounded-sm ${l.color} flex-shrink-0`}></span>
                  {l.label}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`w-7 h-7 rounded-md border-[1.5px] text-[10px] font-bold transition-all ${getDotClass(i)}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-3xl border border-sky-100/50 shadow-sm p-6 sm:p-8 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-sky-500 text-white text-xs font-bold px-3 py-1 rounded-lg">
                  Q {current + 1} / {TOTAL}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMark}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all
                      ${marked[current]
                        ? "bg-purple-100 border-purple-300 text-purple-700"
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:border-purple-300 hover:text-purple-600"
                      }`}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 1l1.5 3H11L8.5 6l1 3L6 7.5 2.5 9l1-3L1 4h3.5L6 1z"
                        stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"
                        fill={marked[current] ? "currentColor" : "none"} />
                    </svg>
                    {marked[current] ? "Marked" : "Mark for Review"}
                  </button>
                </div>
              </div>

              <p className="text-sm sm:text-base font-semibold text-sky-900 leading-relaxed mb-5">
                {questions[current]?.questionText}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {questions[current]?.options.map((opt, i) => {
                  const isSelected = answers[current] === i;
                  return (
                    <button
                      key={i}
                      onClick={() => selectAnswer(i)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border-[1.5px] text-left text-sm font-medium transition-all
                        ${isSelected
                          ? "border-sky-400 bg-sky-50 text-sky-800"
                          : "border-slate-200 bg-slate-50 text-sky-900 hover:border-sky-400 hover:bg-sky-50"
                        }`}
                    >
                      <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold flex-shrink-0
                        ${isSelected ? "border-sky-500 bg-sky-500 text-white" : "border-slate-300 text-slate-400"}`}>
                        {LABELS[i]}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => goTo(current - 1)}
                disabled={current === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-100 text-sky-700 text-sm font-bold disabled:opacity-40 hover:bg-sky-200 transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Prev
              </button>

              {current === TOTAL - 1 && (
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-900 text-white text-sm font-bold hover:bg-sky-800 transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Submit Quiz
                </button>
              )}

              {current < TOTAL - 1 ? (
                <button
                  onClick={() => goTo(current + 1)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 text-white text-sm font-bold hover:bg-sky-600 transition-all"
                >
                  Next
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              ) : (
                <div className="w-20" />
              )}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-sky-100 p-6 sm:p-8 text-center">
            <div className="text-5xl mb-3">
              {scorePct >= 75 ? "🏆" : scorePct >= 55 ? "👍" : "💪"}
            </div>
            <div className="text-6xl font-bold text-sky-500 leading-none mb-1" style={{ fontFamily: "'Outfit',sans-serif" }}>
              {correctCount}
            </div>
            <div className="text-base text-slate-500 mb-3">out of {TOTAL}</div>
            <div className={`text-base font-bold mb-1 ${resultMsg.color}`}>{resultMsg.msg}</div>
            <div className="text-xs text-slate-400 mb-6">Score: {scorePct}% · Results saved to leaderboard</div>

            <div className="grid grid-cols-4 gap-2 mb-6">
              {[
                { label: "Correct", val: correctCount, color: "text-green-600", bg: "bg-green-50 border-green-100" },
                { label: "Wrong", val: wrongCount, color: "text-red-500", bg: "bg-red-50 border-red-100" },
                { label: "Skipped", val: TOTAL - answeredCount, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
                { label: "Spent", val: `${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`, color: "text-sky-600", bg: "bg-sky-50 border-sky-100" },
              ].map((s) => (
                <div key={s.label} className={`rounded-xl p-3 border ${s.bg}`}>
                  <div className={`text-xl font-bold ${s.color}`}>{s.val}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/intern')}
              className="mt-5 w-full h-11 bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm rounded-xl transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}