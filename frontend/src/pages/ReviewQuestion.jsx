import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiCall } from '../utils/api';
import { 
  CheckCircle2, 
  RotateCcw, 
  ChevronLeft, 
  Send, 
  HelpCircle,
  Settings2,
  AlertCircle,
  FileText
} from 'lucide-react';

const ReviewQuestion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const contest = location.state?.newContest || { title: 'Untitled Assessment', domain: 'General' };
  
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
    alert('Assessment successfully published!');
    navigate('/contests');
  };

  const handleReplaceQuestion = async (questionId) => {
    setReplacingId(questionId);
    try {
      const response = await apiCall(`/admin/replace-question/${questionId}`, { method: 'PUT' });
      if (response && response.success && response.data) {
        const q = response.data;
        const newQuestion = {
          id: q._id || questionId,
          text: q.questionText,
          options: q.options,
          correct: q.correctAnswer
        };
        setQuestions(prev => prev.map(q => q.id === questionId ? newQuestion : q));
      }
    } catch (error) {
      console.error("Question replacement failed:", error);
    } finally {
      setReplacingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading Questions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
             <Settings2 className="w-5 h-5 text-blue-600" />
             <span className="text-sm font-bold text-blue-600">Content Review</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Review Questions
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Verify questions for: <span className="text-slate-900 font-bold">{contest.title}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
              onClick={() => navigate(-1)}
              className="h-11 px-6 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all flex items-center gap-2 font-semibold text-sm shadow-sm"
           >
              <ChevronLeft className="w-4 h-4" />
              Back to Details
           </button>
           <button 
              onClick={handlePublish}
              className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl active:scale-95 transition-all shadow-sm flex items-center gap-2"
           >
              Publish Assessment
              <Send className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {questions.length > 0 ? (
          questions.map((q, index) => (
            <motion.div 
              key={q.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-3xl border border-slate-200 p-8 relative overflow-hidden shadow-sm"
            >
              <div className="flex flex-col md:flex-row gap-8 relative z-10">
                {/* Index Bubble */}
                <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-lg text-blue-600">
                   {index + 1}
                </div>

                <div className="flex-1 space-y-6">
                   <h3 className="text-xl font-bold text-slate-900 leading-snug">
                      {q.text}
                   </h3>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {q.options.map((opt, i) => {
                        const isCorrect = opt === q.correct;
                        return (
                          <div 
                            key={i} 
                            className={`flex items-center gap-4 px-6 py-4 rounded-2xl border-2 transition-all duration-300
                              ${isCorrect 
                                ? 'bg-emerald-50 border-emerald-500 shadow-sm' 
                                : 'bg-slate-50 border-slate-100'}`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0
                              ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-500'}`}>
                              {String.fromCharCode(65 + i)}
                            </div>
                            <span className={`text-sm font-medium ${isCorrect ? 'text-emerald-900' : 'text-slate-700'}`}>
                              {opt}
                            </span>
                            {isCorrect && (
                               <CheckCircle2 className="w-5 h-5 ml-auto text-emerald-500 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                   </div>

                   <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                         <FileText className="w-4 h-4 text-slate-400" />
                         <span className="text-xs font-semibold text-slate-500">Review carefully before publishing.</span>
                      </div>
                      <button 
                        onClick={() => handleReplaceQuestion(q.id)}
                        disabled={replacingId === q.id}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-100 active:scale-95 transition-all ${replacingId === q.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {replacingId === q.id ? (
                           <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                           <RotateCcw className="w-4 h-4 text-slate-500" />
                        )}
                        {replacingId === q.id ? 'Replacing...' : 'Replace Question'}
                      </button>
                   </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm">
             <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-slate-400" />
             </div>
             <p className="text-sm font-semibold text-slate-500">No questions available for review.</p>
          </div>
        )}
      </div>

      {/* Sticky Footer for convenience on mobile */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 lg:hidden w-[calc(100%-3rem)] max-w-sm">
          <button 
             onClick={handlePublish}
             className="w-full h-14 bg-blue-600 text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2"
          >
             Publish Assessment
             <Send className="w-5 h-5" />
          </button>
      </div>
    </div>
  );
};

export default ReviewQuestion;
