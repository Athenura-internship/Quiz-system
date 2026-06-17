import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../utils/api';
import { 
  Calendar, Clock, Timer, AlertCircle, Info, Layout, ArrowRight, Search, X, HelpCircle
} from 'lucide-react';

const UpcomingQuiz = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [now, setNow] = useState(new Date());
  const [selectedQuizForStart, setSelectedQuizForStart] = useState(null);
  const [upcomingQuizzes, setUpcomingQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
    
    fetchQuizzes();

    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchQuizzes = async () => {
    try {
      const [data, historyData] = await Promise.all([
        apiCall("/quiz/upcoming-quizzes"),
        apiCall("/quiz/history")
      ]);
      
      const attemptedIds = new Set((historyData.history || []).map(h => h.contestId?._id));

      const formattedQuizzes = data.data.map(quiz => ({
        id: quiz.contestId,
        title: quiz.contestTitle,
        description: quiz.description || "Standard domain assessment.",
        domain: quiz.domain,
        date: new Date(quiz.date).toISOString().split('T')[0],
        time: new Date(quiz.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        duration: `${quiz.duration} mins`,
        status: 'Upcoming',
        difficulty: quiz.duration > 45 ? 'Hard' : quiz.duration > 20 ? 'Medium' : 'Easy',
        questionCount: quiz.questionCount || 10,
        startTime: new Date(quiz.startTime),
        endTime: new Date(quiz.expiryDate),
        isAttempted: attemptedIds.has(quiz.contestId)
      }));
      setUpcomingQuizzes(formattedQuizzes);
    } catch (error) {
      console.error("Failed to fetch quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCountdown = (targetDate) => {
    const diff = targetDate - now;
    if (diff <= 0) return null;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredQuizzes = upcomingQuizzes.filter(quiz => 
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const recommendedQuizzes = upcomingQuizzes.filter(quiz => 
    user?.domain && (quiz.domain || '').trim().toUpperCase() === (user.domain || '').trim().toUpperCase()
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading Assessments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
             Active & Upcoming
          </h1>
          <p className="text-slate-500 font-medium mt-2">View and start your assigned assessments.</p>
        </div>
        
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-bold text-slate-700">{now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {recommendedQuizzes.length > 0 && (
         <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Recommended For You</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {recommendedQuizzes.slice(0, 2).map((quiz, idx) => {
                  const countdown = getCountdown(quiz.startTime);
                  const isTimeReached = countdown === null;
                  return (
                     <div key={`rec-${quiz.id}`} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-4">
                           <span className="px-3 py-1 rounded-md bg-blue-50 text-xs font-bold text-blue-600 border border-blue-100">
                               {quiz.domain}
                           </span>
                           <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-600">
                              {quiz.difficulty}
                           </span>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 mb-2 truncate">
                           {quiz.title}
                        </h3>
                        <p className="text-sm text-slate-500 mb-6 line-clamp-2">
                           {quiz.description}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                           <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
                              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {quiz.duration}</span>
                              <span className="flex items-center gap-1.5"><HelpCircle className="w-4 h-4" /> {quiz.questionCount} Q</span>
                           </div>
                           
                           {isTimeReached ? (
                             quiz.isAttempted ? (
                               <button
                                 disabled
                                 className="px-5 py-2 bg-slate-100 text-slate-500 font-semibold text-sm rounded-xl cursor-not-allowed flex items-center gap-2 shadow-sm"
                               >
                                  Attempted
                               </button>
                             ) : (
                               <button
                                 onClick={() => setSelectedQuizForStart(quiz)}
                                 className="px-5 py-2 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                               >
                                  Start
                                  <ArrowRight className="w-4 h-4" />
                               </button>
                             )
                           ) : (
                             <div className="flex items-center gap-2 text-amber-600 text-xs font-bold bg-amber-50 px-3 py-1.5 rounded-lg">
                                <Timer className="w-4 h-4" />
                                <span>{countdown}</span>
                             </div>
                           )}
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
         <h3 className="text-lg font-bold text-slate-900">All Assessments</h3>
         <div className="relative w-full sm:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search assessments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 shadow-sm"
            />
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {filteredQuizzes.length > 0 ? (
           filteredQuizzes.map((quiz, index) => {
             const countdown = getCountdown(quiz.startTime);
             const isTimeReached = countdown === null;

             return (
               <motion.div
                 key={quiz.id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: index * 0.05 }}
                 className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between h-[280px]"
               >
                 <div className="space-y-3">
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                         {quiz.domain}
                       </span>
                       <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {quiz.difficulty}
                       </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-2">
                      {quiz.title}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2">
                       {quiz.description}
                    </p>
                 </div>

                 <div className="pt-4 border-t border-slate-100 mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                       <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {quiz.duration}</span>
                       <span className="flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5" /> {quiz.questionCount} Q</span>
                    </div>

                    {isTimeReached ? (
                      quiz.isAttempted ? (
                        <button
                          disabled
                          className="px-4 py-1.5 bg-slate-100 text-slate-500 font-semibold text-xs rounded-lg cursor-not-allowed flex items-center gap-1"
                        >
                          Attempted
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedQuizForStart(quiz)}
                          className="px-4 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1"
                        >
                          Enter <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )
                    ) : (
                      <div className="flex items-center gap-1.5 text-amber-600 text-xs font-bold">
                         <Timer className="w-3.5 h-3.5" />
                         <span>{countdown}</span>
                      </div>
                    )}
                 </div>
               </motion.div>
             );
           })
         ) : (
           <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                 <AlertCircle className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-500">No active assessments found.</p>
           </div>
         )}
      </div>

      <AnimatePresence>
        {selectedQuizForStart && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedQuizForStart(null)}
               className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
             />
             
             <motion.div
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col"
             >
                <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-start justify-between">
                   <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        {selectedQuizForStart.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                         <span className="bg-white border border-slate-200 px-2 py-1 rounded">{selectedQuizForStart.duration}</span>
                         <span className="bg-white border border-slate-200 px-2 py-1 rounded">{selectedQuizForStart.domain}</span>
                      </div>
                   </div>
                   <button 
                      onClick={() => setSelectedQuizForStart(null)}
                      className="p-2 text-slate-400 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                   </button>
                </div>

                <div className="p-8 space-y-6">
                   <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Instructions</h4>
                   <div className="space-y-4">
                      {[
                        { icon: <Timer className="w-5 h-5 text-blue-500" />, text: "Time is continuous. The assessment will automatically submit when time is up." },
                        { icon: <AlertCircle className="w-5 h-5 text-amber-500" />, text: "Do not refresh the page or you will lose your progress." },
                        { icon: <Info className="w-5 h-5 text-slate-500" />, text: "Ensure you answer all questions before submitting." }
                      ].map((rule, idx) => (
                         <div key={idx} className="flex items-start gap-4">
                            <div className="shrink-0 mt-0.5">{rule.icon}</div>
                            <p className="text-sm text-slate-600">{rule.text}</p>
                         </div>
                      ))}
                   </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                   <button 
                     onClick={() => setSelectedQuizForStart(null)}
                     className="px-6 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
                   >
                     Cancel
                   </button>
                   <button 
                     onClick={() => {
                       const quizId = selectedQuizForStart.id;
                       setSelectedQuizForStart(null);
                       navigate(`/quiz/${quizId}`);
                     }}
                     className="px-6 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
                   >
                     Start Assessment
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UpcomingQuiz;
