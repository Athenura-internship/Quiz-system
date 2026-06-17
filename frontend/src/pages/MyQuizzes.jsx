import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiCall } from '../utils/api';
import { 
  History, ChevronRight, CheckCircle2, XCircle, FileText,
  Search, Printer, X, Clock, Target
} from 'lucide-react';

const MyQuizzes = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await apiCall("/quiz/history");
      if (data.success) {
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (score) => {
    if (score >= 90) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 75) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 55) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const filteredHistory = history.filter(item => {
    const title = item.contestId?.contestTitle || "Assessment";
    const domain = item.domain || "General";
    return title.toLowerCase().includes(searchTerm.toLowerCase()) || 
           domain.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handlePrintResult = (item) => {
    const scorePct = Math.round((item.score / item.totalQuestions) * 100);
    const printWindow = window.open('', '_blank');
    const content = `
      <html>
        <head>
          <title>Result Transcript - ${item.contestId?.contestTitle}</title>
          <style>
            body { font-family: 'Inter', sans-serif; background-color: #ffffff; padding: 50px; color: #0f172a; }
            .badge { display: inline-block; padding: 6px 12px; font-size: 12px; font-weight: 600; border-radius: 6px; background: #f1f5f9; color: #475569; }
            .header { border-bottom: 2px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 45px; }
            .title { font-size: 28px; font-weight: 800; margin: 10px 0; }
            .score-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px; margin-bottom: 40px; display: grid; grid-template-cols: repeat(4, 1fr); gap: 20px; }
            .metric { text-align: center; }
            .metric-val { font-size: 24px; font-weight: 800; margin: 0 0 5px 0; color: #2563eb; }
            .metric-lbl { font-size: 12px; font-weight: 600; color: #64748b; }
            .answers-list { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-top: 40px; }
            .answer-row { display: flex; justify-content: space-between; padding: 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
            .answer-row:last-child { border: none; }
            .correct { color: #10b981; font-weight: 600; }
            .incorrect { color: #ef4444; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="header">
            <span class="badge">${item.domain || 'General'}</span>
            <h1 class="title">${item.contestId?.contestTitle || 'Assessment Module'}</h1>
            <p><strong>Attempt Date:</strong> ${new Date(item.createdAt).toLocaleString()}</p>
          </div>
          <div class="score-card">
            <div class="metric"><p class="metric-val">${scorePct}%</p><p class="metric-lbl">Score</p></div>
            <div class="metric"><p class="metric-val">${item.score}</p><p class="metric-lbl">Correct</p></div>
            <div class="metric"><p class="metric-val">${item.totalQuestions}</p><p class="metric-lbl">Total Questions</p></div>
            <div class="metric"><p class="metric-val">${Math.floor(item.timeTaken / 60)}m ${item.timeTaken % 60}s</p><p class="metric-lbl">Duration</p></div>
          </div>
          <h3>Question Breakdown</h3>
          <div class="answers-list">
             ${(item.answers || []).map((ans, idx) => `
                <div class="answer-row">
                   <div>
                     <p style="margin: 0 0 4px 0; font-weight: 600;">Q${idx + 1}: ${ans.questionId?.questionText || `Question ${idx + 1}`}</p>
                     <p style="margin: 0; color: #64748b;">Answer: ${ans.selectedAnswer || 'Skipped'}</p>
                   </div>
                   <span class="${ans.isCorrect ? 'correct' : 'incorrect'}">${ans.isCorrect ? 'Correct' : 'Incorrect'}</span>
                </div>
             `).join('')}
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading History...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
             Evaluation History
          </h1>
          <p className="text-slate-500 font-medium mt-2">Review your past assessments and results.</p>
        </div>

        <div className="relative group w-full lg:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search assessments..."
            className="w-full h-12 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
         {filteredHistory.length > 0 ? (
           filteredHistory.map((item, index) => {
             const scorePct = Math.round((item.score / item.totalQuestions) * 100);
             return (
               <motion.div
                 key={item._id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: index * 0.03 }}
                 className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition-shadow"
               >
                 <div className="flex items-center gap-6 flex-1 w-full">
                   <div className={`w-20 h-20 shrink-0 rounded-2xl border flex flex-col items-center justify-center ${getPerformanceColor(scorePct)}`}>
                       <span className="text-2xl font-bold leading-none">{item.score}</span>
                       <span className="text-[10px] font-semibold uppercase tracking-wider mt-1 opacity-80">/ {item.totalQuestions}</span>
                   </div>

                   <div className="flex-1 min-w-0">
                     <span className="px-2 py-1 rounded bg-slate-100 text-xs font-semibold text-slate-600 mb-2 inline-block">
                       {item.domain || "Assessment"}
                     </span>
                     <h3 className="text-lg font-bold text-slate-900 truncate">
                       {item.contestId?.contestTitle || "Assessment Module"}
                     </h3>
                     <div className="flex items-center gap-4 mt-2 text-xs font-medium text-slate-500">
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(item.createdAt).toLocaleDateString()}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span>{Math.floor(item.timeTaken / 60)}m {item.timeTaken % 60}s</span>
                     </div>
                   </div>
                 </div>

                 <div className="flex items-center gap-3 w-full md:w-auto">
                    <button 
                      onClick={() => handlePrintResult(item)}
                      className="h-12 w-12 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 transition-colors shrink-0"
                    >
                       <Printer className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedResult(item)}
                      className="flex-1 md:w-32 h-12 bg-white border border-slate-200 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      View Details
                    </button>
                 </div>
               </motion.div>
             );
           })
         ) : (
           <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                 <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-500">No past assessments found.</p>
           </div>
         )}
      </div>

      <AnimatePresence>
        {selectedResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedResult(null)}
               className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
             />
             
             <motion.div
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]"
             >
                <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                   <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">
                        {selectedResult.contestId?.contestTitle || "Assessment"}
                      </h3>
                      <p className="text-sm font-medium text-slate-500">Detailed result breakdown</p>
                   </div>
                   <button 
                      onClick={() => setSelectedResult(null)}
                      className="p-2 text-slate-400 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                   </button>
                </div>

                <div className="p-8 overflow-y-auto space-y-8 flex-1">
                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: "Accuracy", val: `${Math.round((selectedResult.score / selectedResult.totalQuestions) * 100)}%` },
                        { label: "Correct", val: selectedResult.score },
                        { label: "Incorrect", val: selectedResult.totalQuestions - selectedResult.score },
                        { label: "Duration", val: `${Math.floor(selectedResult.timeTaken / 60)}m ${selectedResult.timeTaken % 60}s` },
                      ].map((stat, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                           <p className="text-xl font-bold text-slate-900 mb-1">{stat.val}</p>
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                        </div>
                      ))}
                   </div>

                   <div className="space-y-3">
                      <h4 className="text-sm font-bold text-slate-900 mb-4">Question Breakdown</h4>
                      {(selectedResult.answers || []).map((ans, idx) => (
                         <div key={idx} className="p-4 rounded-xl border border-slate-100 flex items-center justify-between gap-4">
                             <div className="flex items-start gap-4 flex-1 pr-4">
                                <div className="w-8 h-8 shrink-0 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600 mt-1">
                                   {idx + 1}
                                </div>
                                <div>
                                   <p className="text-sm font-semibold text-slate-900 mb-1">
                                      {ans.questionId?.questionText || `Question ${idx + 1}`}
                                   </p>
                                   <p className="text-xs font-medium text-slate-500">
                                      <span className="font-semibold text-slate-700">Your Answer:</span> {ans.selectedAnswer || 'Skipped'}
                                   </p>
                                </div>
                             </div>
                            {ans.isCorrect ? (
                               <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-50 text-emerald-600">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span className="text-[10px] font-bold uppercase tracking-wider">Correct</span>
                               </div>
                            ) : (
                               <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-50 text-red-600">
                                  <XCircle className="w-4 h-4" />
                                  <span className="text-[10px] font-bold uppercase tracking-wider">Incorrect</span>
                               </div>
                            )}
                         </div>
                      ))}
                   </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                   <button 
                     onClick={() => handlePrintResult(selectedResult)}
                     className="px-6 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
                   >
                      <Printer className="w-4 h-4" />
                      Print
                   </button>
                   <button 
                     onClick={() => setSelectedResult(null)}
                     className="px-6 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 transition-colors"
                   >
                      Close
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyQuizzes;
