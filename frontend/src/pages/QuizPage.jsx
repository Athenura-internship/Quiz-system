import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiCall } from "../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Timer, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Send,
  Flag,
  BookOpen,
  ShieldAlert,
  ArrowLeft
} from "lucide-react";

const LABELS = ["A", "B", "C", "D"];

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getResultMsg(pct) {
  if (pct >= 90) return { msg: "Outstanding Performance! Excellent work.", color: "text-emerald-600" };
  if (pct >= 75) return { msg: "Great job! You showed strong understanding.", color: "text-blue-600" };
  if (pct >= 55) return { msg: "Good effort! Review the topics to improve.", color: "text-amber-600" };
  return { msg: "Needs improvement. Keep practicing!", color: "text-red-600" };
}

// ── Submit Confirmation Modal ──────────────────────────────────────────────────
function SubmitModal({ answers, totalQuestions, marked, onConfirm, onCancel }) {
  const attempted = answers.filter((a) => a !== null).length;
  const notAttempted = totalQuestions - attempted;
  const markedCount = marked.filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 relative overflow-hidden"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <Send className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            Submit Assessment?
          </h3>
          <p className="text-sm text-slate-500 font-medium">Please review your progress before final submission.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
            <div className="text-xl font-bold text-blue-600">{attempted}</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Answered</div>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
            <div className="text-xl font-bold text-red-500">{notAttempted}</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Unanswered</div>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
            <div className="text-xl font-bold text-amber-500">{markedCount}</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Flagged</div>
          </div>
        </div>

        {notAttempted > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 font-medium leading-tight">
              You have {notAttempted} unanswered questions. They will be marked as incorrect if you submit now.
            </p>
          </div>
        )}

        <div className="flex gap-4 mt-8">
          <button
            onClick={onCancel}
            className="flex-1 h-12 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-12 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
          >
            Submit
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Security Warning Modal ───────────────────────────────────────────────────
function SecurityModal({ warnings, maxWarnings, onDismiss }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center border border-red-100"
      >
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-3">
          Security Warning
        </h3>
        <p className="text-slate-600 text-sm font-medium leading-relaxed mb-6">
          Switching tabs or exiting fullscreen is not allowed. Violation <span className="font-bold text-red-600">[{warnings}/{maxWarnings}]</span> recorded.
        </p>
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-8">
          <p className="text-xs text-red-700 font-bold uppercase tracking-wider">
            {warnings >= maxWarnings ? "CRITICAL: Final violation. Auto-submit imminent." : "Stay on this page to prevent auto-submission."}
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="w-full h-12 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all shadow-md"
        >
          Acknowledge
        </button>
      </motion.div>
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
      setError(err.message || "Failed to start assessment. Please try again.");
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
          console.warn("Fullscreen request denied by system policy", err);
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
    
    const submissionAnswers = questions.map((q, i) => ({
      questionId: q._id,
      selectedAnswer: answers[i] !== null ? questions[i].options[answers[i]] : null
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
      <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
      <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">Loading Assessment...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 border border-red-100">
        <ShieldAlert className="w-10 h-10 text-red-500" />
      </div>
      <h2 className="text-3xl font-bold text-slate-900 mb-3">Connection Error</h2>
      <p className="text-slate-600 max-w-sm mb-10 font-medium">{error}</p>
      <button 
        onClick={() => navigate('/upcoming')} 
        className="px-8 py-3 bg-white border border-slate-300 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-all shadow-sm"
      >
        Go Back
      </button>
    </div>
  );

  const answeredCount = answers.filter((a) => a !== null).length;
  const notAnsweredCount = TOTAL - answeredCount;
  const markedCount = marked.filter(Boolean).length;
  const progressPct = Math.round(((current + 1) / TOTAL) * 100);

  const correctCount = scoreData ? scoreData.score : 0;
  const wrongCount = TOTAL - correctCount - (TOTAL - answeredCount);
  const scorePct = TOTAL > 0 ? Math.round((correctCount / TOTAL) * 100) : 0;
  const resultMsg = getResultMsg(scorePct);

  const timerColorClass =
    timeLeft <= 60 ? "text-red-500"
    : timeLeft <= 180 ? "text-amber-500"
    : "text-blue-600";

  const getDotClass = (i) => {
    if (i === current) return "border-blue-600 bg-blue-50 text-blue-700 shadow-sm";
    if (marked[i]) return "border-amber-400 bg-amber-50 text-amber-600";
    if (answers[i] !== null) return "border-emerald-500 bg-emerald-50 text-emerald-600";
    if (i < current) return "border-slate-300 bg-white text-slate-400";
    return "border-slate-200 bg-white text-slate-400";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden font-sans">

      <AnimatePresence>
        {showModal && (
          <SubmitModal
            answers={answers}
            totalQuestions={TOTAL}
            marked={marked}
            onConfirm={confirmSubmit}
            onCancel={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSecurityModal && (
          <SecurityModal
            warnings={warnings}
            maxWarnings={MAX_WARNINGS}
            onDismiss={() => setShowSecurityModal(false)}
          />
        )}
      </AnimatePresence>

      {/* ── HEADER ── */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 py-3 px-4 md:px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">
              {contestDetails?.title || "Assessment"}
            </h1>
            <p className="text-xs font-semibold text-slate-500 mt-0.5 hidden sm:block">
              {user?.name} <span className="mx-1">•</span> ID: {user?.uniqueId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200">
             <span className="w-2 h-2 bg-blue-500 rounded-full" />
             <span className="text-xs font-bold text-slate-600 uppercase">{contestDetails?.domain}</span>
          </div>
          <div className={`flex items-center gap-2 font-mono text-xl font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 ${timerColorClass}`}>
            <Timer className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* ── PROGRESS BAR ── */}
      <div className="h-1.5 w-full bg-slate-200">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          className="h-full bg-blue-500" 
        />
      </div>

      {/* ── BODY ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-4 gap-8">

        {!submitted ? (
          <>
            {/* Sidebar Navigation */}
            <div className="order-2 lg:order-1 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                 <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 text-center">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Answered</p>
                        <p className="text-xl font-bold text-emerald-700">{answeredCount}</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 text-center">
                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Flagged</p>
                        <p className="text-xl font-bold text-amber-700">{markedCount}</p>
                    </div>
                 </div>

                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Question Map</p>
                 <div className="grid grid-cols-5 gap-2">
                    {questions.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => goTo(i)}
                        className={`aspect-square rounded-lg border-2 text-xs font-bold transition-all hover:scale-105 active:scale-95 ${getDotClass(i)}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hidden lg:block">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Legend</p>
                  <div className="space-y-3">
                    {[
                      { color: "bg-blue-500", label: "Current Focus" },
                      { color: "bg-emerald-500", label: "Answered" },
                      { color: "bg-amber-400", label: "Flagged" },
                      { color: "bg-slate-300", label: "Unanswered" },
                    ].map((l) => (
                      <div key={l.label} className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                        <span className={`w-3 h-3 rounded-full ${l.color}`}></span>
                        {l.label}
                      </div>
                    ))}
                  </div>
              </div>
            </div>

            {/* Question Area */}
            <div className="order-1 lg:order-2 lg:col-span-3">
              <motion.div 
                key={current}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm min-h-[400px] flex flex-col"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div className="flex items-center">
                    <span className="px-4 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold tracking-wide">
                      Question {current + 1} of {TOTAL}
                    </span>
                  </div>
                  <button
                    onClick={toggleMark}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide border transition-all
                      ${marked[current]
                        ? "bg-amber-50 border-amber-200 text-amber-700"
                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                      }`}
                  >
                    <Flag className={`w-4 h-4 ${marked[current] ? 'fill-current' : ''}`} />
                    {marked[current] ? "Flagged" : "Flag for Review"}
                  </button>
                </div>

                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-relaxed mb-8">
                    {questions[current]?.questionText}
                  </h2>

                  <div className="space-y-3">
                    {questions[current]?.options.map((opt, i) => {
                      const isSelected = answers[current] === i;
                      return (
                        <button
                          key={i}
                          onClick={() => selectAnswer(i)}
                          className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl border-2 text-left transition-all duration-200
                            ${isSelected
                              ? "border-blue-500 bg-blue-50"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                            }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-all
                            ${isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                            {LABELS[i]}
                          </div>
                          <span className={`text-sm sm:text-base font-semibold ${isSelected ? "text-blue-900" : "text-slate-700"}`}>
                            {opt}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 mt-12 pt-8 border-t border-slate-100">
                  <button
                    onClick={() => goTo(current - 1)}
                    disabled={current === 0}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-700 font-bold text-sm border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                  </button>

                  <div>
                    {current === TOTAL - 1 ? (
                      <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
                      >
                        Submit Assessment
                        <Send className="w-4 h-4 ml-1" />
                      </button>
                    ) : (
                      <button
                        onClick={() => goTo(current + 1)}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all shadow-sm"
                      >
                        Next
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        ) : (
          /* Result View */
          <div className="lg:col-span-4 max-w-3xl mx-auto w-full pt-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-16 text-center shadow-sm relative overflow-hidden"
            >
              
              <div className="relative z-10">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                   {scorePct >= 75 ? (
                      <Trophy className="w-10 h-10 text-emerald-500" />
                   ) : (
                      <BookOpen className="w-10 h-10 text-blue-500" />
                   )}
                </div>
                
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Assessment Completed</h2>
                
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-6xl sm:text-7xl font-bold text-slate-900 tracking-tight leading-none">{correctCount}</span>
                  <span className="text-xl font-bold text-slate-400">/ {TOTAL}</span>
                </div>
                
                <p className={`text-base font-bold mb-10 ${resultMsg.color}`}>
                  {resultMsg.msg}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
                  {[
                    { label: "Score", val: `${scorePct}%`, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
                    { label: "Incorrect", val: wrongCount, color: "text-red-500", bg: "bg-red-50 border-red-100" },
                    { label: "Unanswered", val: TOTAL - answeredCount, color: "text-amber-500", bg: "bg-amber-50 border-amber-100" },
                    { label: "Time Taken", val: `${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`, color: "text-slate-700", bg: "bg-slate-50 border-slate-200" },
                  ].map((s) => (
                    <div key={s.label} className={`rounded-2xl p-4 border ${s.bg}`}>
                      <div className={`text-xl font-bold mb-1 ${s.color}`}>{s.val}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => navigate('/intern')}
                    className="h-12 px-8 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 transition-all shadow-sm"
                  >
                    Return to Dashboard
                  </button>
                  <button
                    onClick={() => navigate('/my-quizzes')}
                    className="h-12 px-8 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                  >
                    View History
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}