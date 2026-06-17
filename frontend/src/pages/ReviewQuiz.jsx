import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiCall } from '../utils/api';
import { 
  FileSearch, 
  Search, 
  Filter, 
  ArrowLeft, 
  ChevronRight, 
  Clock, 
  Target, 
  BrainCircuit, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Zap,
  Users,
  Layout,
  Layers,
  ArrowRight,
  X,
  FileText
} from 'lucide-react';

const ReviewQuiz = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDomain, setFilterDomain] = useState('All');
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [replacingQuestionId, setReplacingQuestionId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await apiCall("/admin/all-attempts");
      if (response && response.success) {
        const formatted = response.data.map(at => ({
          id: at._id,
          quizTitle: at.contestId?.contestTitle || 'Unknown Assessment',
          internName: at.internName,
          domain: at.domain || 'General',
          score: at.score,
          totalScore: at.totalQuestions || 0,
          date: at.endTime ? new Date(at.endTime).toLocaleDateString() : 'N/A',
          status: at.isSubmitted ? 'Reviewed' : 'Pending Review',
          originalData: at
        }));
        setSubmissions(formatted);
      }
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  const domains = ['All', 'DATA SCIENCE & ANALYTICS', 'HUMAN RESOURCES', 'APPLICATION DEVELOPMENT', 'SOCIAL MEDIA MANAGEMENT', 'GRAPHIC DESIGN', 'DIGITAL MARKETING', 'VIDEO EDITING', 'FULL STACK DEVELOPMENT', 'MERN STACK DEVELOPMENT', 'CONTENT WRITING', 'CONTENT CREATOR', 'UI/UX DESIGNING', 'FRONT-END DEVELOPER', 'BACK-END DEVELOPER'];

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = (sub.internName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (sub.quizTitle || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = filterDomain === 'All' || (sub.domain || '').trim().toUpperCase() === filterDomain.trim().toUpperCase();
    return matchesSearch && matchesDomain;
  });

  const handleReview = async (quiz) => {
    setSelectedQuiz(quiz);
    setLoadingDetails(true);
    try {
      const contestId = quiz.originalData.contestId._id;
      const qRes = await apiCall(`/admin/get-questions/${contestId}`);
      if (qRes && qRes.success) {
        const chosenAnswers = quiz.originalData.answers || [];
        const enrichedQuestions = qRes.data.map(q => {
          const attemptAns = chosenAnswers.find(a => a.questionId === q._id);
          return {
            id: q._id,
            text: q.questionText,
            type: "MCQ",
            options: q.options,
            correct: q.correctAnswer,
            selected: attemptAns ? attemptAns.selectedAnswer : 'NO_SELECTION'
          };
        });
        setQuestions(enrichedQuestions);
      }
    } catch (error) {
      alert("Error fetching detailed results.");
      setSelectedQuiz(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleReplaceQuestion = async (questionId) => {
    if (!window.confirm("CRITICAL: Replace this question with a newly generated one? This will reflect across the entire platform.")) return;
    
    setReplacingQuestionId(questionId);
    try {
      const response = await apiCall(`/admin/replace-question/${questionId}`, { method: 'PUT' });
      if (response && response.success) {
        const newQ = response.data;
        setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, text: newQ.questionText, options: newQ.options, correct: newQ.correctAnswer } : q));
        setToastMessage("Question replaced successfully.");
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (error) {
      alert("Replacement failed.");
    } finally {
      setReplacingQuestionId(null);
    }
  };

  if (loading && !selectedQuiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading Submissions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <AnimatePresence mode="wait">
        {selectedQuiz ? (
          <motion.div 
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-10"
          >
            {/* Detail Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                   <button 
                     onClick={() => setSelectedQuiz(null)}
                     className="p-2 bg-white hover:bg-slate-50 rounded-lg text-slate-500 transition-all border border-slate-200 shadow-sm"
                   >
                      <ArrowLeft className="w-4 h-4" />
                   </button>
                   <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-md">
                      Detailed Audit
                   </span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                  Review Submission
                </h1>
                <p className="text-slate-500 font-medium mt-2">
                  {selectedQuiz.quizTitle} <span className="text-slate-300 mx-2">|</span> {selectedQuiz.internName}
                </p>
              </div>

              <div className="flex items-center gap-4">
                 <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm text-center min-w-[120px]">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Final Score</p>
                    <span className="text-2xl font-bold text-slate-900">{selectedQuiz.score}</span>
                    <span className="text-xs text-slate-400 font-semibold ml-1">/ {selectedQuiz.totalScore}</span>
                 </div>
              </div>
            </div>

            {toastMessage && (
               <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between shadow-sm"
               >
                  <div className="flex items-center gap-3">
                     <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                     <p className="text-sm font-bold text-emerald-800">{toastMessage}</p>
                  </div>
                  <button onClick={() => setToastMessage(null)} className="p-1.5 hover:bg-emerald-100 rounded-lg transition-colors text-emerald-600"><X className="w-4 h-4" /></button>
               </motion.div>
            )}

            {loadingDetails ? (
              <div className="py-20 text-center">
                 <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                 <p className="text-sm font-semibold text-slate-500">Loading Assessment Data...</p>
              </div>
            ) : (
              <div className="space-y-6">
                 {questions.map((q, index) => {
                   const isCorrect = q.selected === q.correct;
                   return (
                     <motion.div 
                       key={q.id}
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: index * 0.05 }}
                       className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 relative overflow-hidden"
                     >
                       <div className="flex flex-col md:flex-row gap-8 relative z-10">
                          <div className="w-12 h-12 shrink-0 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Q</span>
                             <span className="text-lg font-bold text-slate-700 leading-none">{index + 1}</span>
                          </div>

                          <div className="flex-1 space-y-6">
                             <div className="flex justify-between items-start gap-4">
                                <h3 className="text-xl font-bold text-slate-900 leading-snug">{q.text}</h3>
                                <button 
                                  onClick={() => handleReplaceQuestion(q.id)}
                                  disabled={replacingQuestionId === q.id}
                                  className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-600 transition-all disabled:opacity-50"
                                >
                                  {replacingQuestionId === q.id ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                                  Replace
                                </button>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {q.options.map((opt, i) => {
                                  const isInternChoice = opt === q.selected;
                                  const isNodeCorrect = opt === q.correct;
                                  let bgClass = "bg-slate-50 border-slate-100";
                                  let textClass = "text-slate-700";
                                  let icon = null;
                                  let numClass = "bg-white border-slate-200 text-slate-500";

                                  if (isNodeCorrect) {
                                      bgClass = "bg-emerald-50 border-emerald-500";
                                      textClass = "text-emerald-900";
                                      icon = <CheckCircle2 className="w-5 h-5 ml-auto text-emerald-500" />;
                                      numClass = "bg-emerald-500 text-white";
                                  } else if (isInternChoice && !isNodeCorrect) {
                                      bgClass = "bg-red-50 border-red-500";
                                      textClass = "text-red-900";
                                      icon = <AlertCircle className="w-5 h-5 ml-auto text-red-500" />;
                                      numClass = "bg-red-500 text-white";
                                  }

                                  return (
                                    <div key={i} className={`flex items-center gap-4 px-6 py-4 rounded-2xl border-2 transition-all duration-300 ${bgClass}`}>
                                       <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${numClass}`}>
                                          {String.fromCharCode(65 + i)}
                                       </div>
                                       <span className={`text-sm font-semibold ${textClass}`}>{opt}</span>
                                       {icon}
                                    </div>
                                  );
                                })}
                             </div>

                             <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-6 items-center bg-slate-50 -mx-8 -mb-8 px-8 pb-8 rounded-b-3xl">
                                <div className="flex items-center gap-2 mt-4">
                                   <Target className="w-4 h-4 text-emerald-500" />
                                   <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Correct Answer:</span>
                                   <span className="text-sm font-bold text-emerald-600">{q.correct}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-4">
                                   <Zap className="w-4 h-4 text-blue-500" />
                                   <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Candidate Selected:</span>
                                   <span className={`text-sm font-bold ${isCorrect ? 'text-emerald-600' : 'text-red-600'}`}>{q.selected}</span>
                                </div>
                             </div>
                          </div>
                       </div>
                     </motion.div>
                   );
                 })}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* List Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                   <FileSearch className="w-5 h-5 text-blue-600" />
                   <span className="text-sm font-bold text-blue-600">Audit Logs</span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                  Review Submissions
                </h1>
                <p className="text-slate-500 font-medium mt-2">
                   Platform-wide submission audit and assessment history.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                 <div className="relative group w-full sm:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="Search candidates..."
                      className="w-full h-12 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 outline-none transition-all shadow-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
               <div className="flex items-center gap-2 mr-2 text-slate-400">
                  <Filter className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Filters</span>
               </div>
               
               <select
                  value={filterDomain}
                  onChange={(e) => setFilterDomain(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 outline-none focus:border-blue-500 transition-all cursor-pointer"
               >
                  {domains.map(d => <option key={d} value={d}>{d}</option>)}
               </select>

               <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total: {filteredSubmissions.length}</span>
               </div>
            </div>

            {/* List */}
            {filteredSubmissions.length > 0 ? (
               <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                 <div className="overflow-x-auto">
                   <table className="w-full text-left">
                     <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                           <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Assessment</th>
                           <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Domain</th>
                           <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Score</th>
                           <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                           <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {filteredSubmissions.map((sub, index) => (
                           <motion.tr 
                              key={sub.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.02 }}
                              className="group hover:bg-slate-50 transition-colors"
                           >
                              <td className="py-4 px-6">
                                 <div>
                                    <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                       {sub.quizTitle}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                       <div className="w-5 h-5 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                          {sub.internName.charAt(0)}
                                       </div>
                                       <span className="text-xs font-medium text-slate-500">{sub.internName}</span>
                                    </div>
                                 </div>
                              </td>
                              <td className="py-4 px-6">
                                 <span className="text-xs font-bold text-blue-600 uppercase tracking-wider px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-md">
                                    {sub.domain}
                                 </span>
                              </td>
                              <td className="py-4 px-6">
                                 <div className="flex items-baseline gap-1">
                                    <span className="text-base font-bold text-slate-900">{sub.score}</span>
                                    <span className="text-xs text-slate-400 font-semibold">/ {sub.totalScore}</span>
                                 </div>
                              </td>
                              <td className="py-4 px-6">
                                 <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider
                                    ${sub.status === 'Reviewed' ? 'text-emerald-600' : 'text-amber-500'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${sub.status === 'Reviewed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    {sub.status}
                                 </div>
                              </td>
                              <td className="py-4 px-6 text-right">
                                 <button 
                                    onClick={() => handleReview(sub)}
                                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 ml-auto"
                                 >
                                    <FileText className="w-3.5 h-3.5" />
                                    Review
                                 </button>
                              </td>
                           </motion.tr>
                        ))}
                     </tbody>
                   </table>
                 </div>
               </div>
            ) : (
               <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                     <Layers className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-500">No submissions found matching criteria.</p>
               </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReviewQuiz;
