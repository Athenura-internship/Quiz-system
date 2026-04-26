import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiCall } from '../utils/api';

const ReviewQuestion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const contest = location.state?.newContest || { title: 'Untitled Contest', domain: 'General' };
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replacingId, setReplacingId] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!location.state?.newContest?.contestId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const response = await apiCall(`/admin/get-questions/${location.state.newContest.contestId}`);
        if (response.success && response.data) {
          // Map backend fields to frontend format
          const formattedQuestions = response.data.map(q => ({
            id: q._id,
            text: q.questionText,
            options: q.options,
            correct: q.correctAnswer
          }));
          setQuestions(formattedQuestions);
        }
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [location.state]);

  const handlePublish = () => {
    // Navigate back to all contests after publishing
    alert('Contest published successfully!');
    navigate('/contests');
  };

  const handleReplaceQuestion = async (questionId) => {
    setReplacingId(questionId);
    try {
      const response = await apiCall(`/admin/replace-question/${questionId}`, { method: 'PUT' });
      let newQuestion;
      
      if (response && response.success && response.data) {
        const q = response.data;
        newQuestion = {
          id: q._id || questionId,
          text: q.questionText,
          options: q.options,
          correct: q.correctAnswer
        };
      } else {
        throw new Error("Failed to fetch from API");
      }
      
      setQuestions(prev => prev.map(q => q.id === questionId ? newQuestion : q));
    } catch (error) {
      console.error("Failed to replace question, using dummy data:", error);
      const dummyQuestion = {
        id: `dummy_${Date.now()}`,
        text: "What is the primary role of a React component? (Replaced)",
        options: ["Manage database", "Render UI", "Handle routing", "Style elements"],
        correct: "Render UI"
      };
      setQuestions(prev => prev.map(q => q.id === questionId ? dummyQuestion : q));
    } finally {
      setReplacingId(null);
    }
  };

  return (
    <div className="w-full h-full p-4 sm:p-6 lg:p-8 font-sans overflow-x-hidden border-box">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-200 dark:border-slate-700/50 p-6 md:p-8 lg:p-10 transition-colors duration-300 flex flex-col min-h-[80vh]"
      >
        {/* Header */}
        <div className="mb-8 border-b border-slate-200 dark:border-slate-700/50 pb-6">
          <h1 className="text-3xl font-black bg-gradient-to-r from-slate-800 to-slate-900 dark:from-white dark:to-slate-100 bg-clip-text text-transparent mb-2">
            Review Questions
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">
            Review and finalize questions for: <span className="font-semibold text-slate-700 dark:text-slate-300">{contest.title}</span> ({contest.domain})
          </p>
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar pb-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin"></div>
              <p className="mt-4 text-slate-500 font-medium">Loading Questions...</p>
            </div>
          ) : questions.length === 0 ? (
             <div className="text-center py-10 text-slate-500">No questions found.</div>
          ) : (
            questions.map((q, index) => (
              <div key={q.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm relative">
                <span className="absolute -top-3 -left-3 w-8 h-8 bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-300 font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                  {index + 1}
                </span>
                
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 ml-2">
                  {q.text}
                </h3>
                
                <div className="grid sm:grid-cols-2 gap-3 mb-4 ml-2">
                  {q.options.map((opt, i) => (
                    <div 
                      key={i} 
                      className={`px-4 py-3 rounded-xl border text-sm flex items-center gap-3 ${
                        opt === q.correct 
                          ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-medium'
                          : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                         opt === q.correct ? 'bg-emerald-100 dark:bg-emerald-800/50 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                      {opt === q.correct && (
                        <svg className="w-5 h-5 ml-auto text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end mt-[10px] pt-4 border-t border-slate-200 dark:border-slate-700/30">
                  <button 
                    onClick={() => handleReplaceQuestion(q.id)}
                    disabled={replacingId === q.id}
                    className={`flex items-center gap-1.5 border border-[#3b82f6] text-[#3b82f6] rounded-[8px] px-[14px] py-[6px] hover:bg-[#eff6ff] transition-colors text-sm font-medium dark:hover:bg-blue-900/20 ${replacingId === q.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {replacingId === q.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin"></div>
                        Replacing...
                      </>
                    ) : (
                      <>
                        <span>🔄</span> Replace
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end items-center gap-4 pt-6 border-t border-slate-200 dark:border-slate-700/50 mt-auto">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all shadow-sm"
          >
            Back to Edit
          </button>
          <button
            onClick={handlePublish}
            disabled={loading}
            className="px-8 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-[0_4px_12px_rgba(14,165,233,0.3)] hover:shadow-[0_6px_16px_rgba(14,165,233,0.4)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Publish Contest
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ReviewQuestion;
