import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { apiCall } from '../utils/api';
import { 
  Trophy, 
  ArrowLeft, 
  Users, 
  Clock, 
  Star, 
  Layout, 
  Zap, 
  Award,
  ChevronRight,
  TrendingUp,
  Target,
  AlertCircle
} from 'lucide-react';

const QuizLeaderboard = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [quizData, setQuizData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const response = await apiCall(`/leaderboard/contest/${id}`);
        if (response && response.success) {
          setQuizData(response.data);
        }
      } catch (err) {
        setError("Failed to fetch leaderboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading Leaderboard...</p>
      </div>
    );
  }

  if (error || !quizData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-red-200 shadow-sm max-w-lg mx-auto mt-10">
        <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
        <p className="text-base font-bold text-slate-900 mb-8">{error || "Leaderboard data not found."}</p>
        <button onClick={() => navigate(-1)} className="px-8 py-3 bg-white border border-slate-300 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-all shadow-sm">Go Back</button>
      </div>
    );
  }

  const participants = quizData.participants || [];
  const topThree = participants.slice(0, 3);
  const others = participants.slice(3);

  // Podium order for visual balance: [Silver (2), Gold (1), Bronze (3)]
  const podiumLayout = [
    { rank: 2, data: topThree[1], color: 'from-slate-100 to-slate-200', text: 'text-slate-600', height: 'h-48 md:h-56', icon: '🥈' },
    { rank: 1, data: topThree[0], color: 'from-amber-100 to-amber-200', text: 'text-amber-700', height: 'h-64 md:h-72', icon: '👑' },
    { rank: 3, data: topThree[2], color: 'from-orange-100 to-orange-200', text: 'text-orange-700', height: 'h-40 md:h-44', icon: '🥉' }
  ].filter(p => p.data);

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      {/* Header Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-3">
             <button 
               onClick={() => navigate(-1)}
               className="p-2 bg-white hover:bg-slate-50 rounded-lg text-slate-500 transition-all border border-slate-200 shadow-sm"
             >
                <ArrowLeft className="w-4 h-4" />
             </button>
             <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-md">
                {quizData.domain} STANDINGS
             </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Assessment Leaderboard
          </h1>
          <h2 className="text-base font-semibold text-slate-500 mt-2">{quizData.title}</h2>
        </div>
        
        <div className="flex items-center gap-4 px-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
           <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Enrolled</p>
              <div className="flex items-center justify-end gap-2 text-slate-900">
                 <Users className="w-5 h-5 text-blue-500" />
                 <span className="text-2xl font-bold">{participants.length}</span>
              </div>
           </div>
        </div>
      </div>

      {/* Podium Display */}
      <div className="flex flex-col items-center pt-16">
         <div className="flex items-end justify-center gap-4 sm:gap-8 w-full max-w-4xl px-4">
            {podiumLayout.map((p, i) => (
              <motion.div
                key={p.rank}
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: i * 0.15, type: 'spring', damping: 20 }}
                className={`flex flex-col items-center relative ${p.rank === 1 ? 'z-10' : 'z-0'}`}
              >
                 {/* Badge Label */}
                 <div className={`absolute -top-12 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm mb-4 whitespace-nowrap border
                    ${p.rank === 1 ? 'bg-amber-100 text-amber-800 border-amber-200' : 
                      p.rank === 2 ? 'bg-slate-100 text-slate-700 border-slate-200' : 
                      'bg-orange-100 text-orange-800 border-orange-200'}`}
                 >
                    {p.rank === 1 ? "1st Place" : p.rank === 2 ? "2nd Place" : "3rd Place"}
                 </div>

                 {/* Avatar Sphere */}
                 <div className={`w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 flex items-center justify-center relative shadow-md mb-4 bg-white
                    ${p.rank === 1 ? 'border-amber-400' : 
                      p.rank === 2 ? 'border-slate-300' : 
                      'border-orange-400'}`}
                 >
                    <span className={`text-4xl sm:text-5xl font-bold select-none
                      ${p.rank === 1 ? 'text-amber-500' : 
                        p.rank === 2 ? 'text-slate-500' : 
                        'text-orange-500'}`}
                    >
                      {p.data.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="absolute top-0 right-0 sm:-top-2 sm:-right-2 text-xl sm:text-2xl drop-shadow-md">{p.icon}</div>
                 </div>

                 {/* Info Plate */}
                 <div className="text-center mb-4 h-12">
                    <p className="font-bold text-slate-900 text-lg tracking-tight truncate max-w-[120px] sm:max-w-[160px]">{p.data.name}</p>
                    <p className="text-[10px] font-semibold text-slate-500 mt-1 truncate max-w-[100px] sm:max-w-[140px]">{p.data.uniqueId}</p>
                 </div>

                 {/* The Pillar */}
                 <div className={`w-28 sm:w-40 rounded-t-3xl flex flex-col items-center justify-start pt-8 shadow-sm relative overflow-hidden group
                    ${p.height} bg-gradient-to-b ${p.color} border-t border-x ${
                      p.rank === 1 ? 'border-amber-300' : 
                      p.rank === 2 ? 'border-slate-300' : 
                      'border-orange-300'
                    }`}
                 >
                    <span className={`text-5xl sm:text-7xl font-bold opacity-30 select-none leading-none ${p.text}`}>{p.rank}</span>
                    <div className="mt-auto pb-6 text-center relative z-10 w-full">
                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${p.text}`}>Score</p>
                        <p className={`text-2xl sm:text-3xl font-bold leading-none ${p.text}`}>{p.data.score}</p>
                    </div>
                 </div>
              </motion.div>
            ))}
         </div>
      </div>

      {/* Others List */}
      {others.length > 0 && (
        <div className="max-w-4xl mx-auto space-y-6">
           <div className="flex items-center gap-4 px-4 sm:px-8">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Other Participants</span>
              <div className="flex-1 h-px bg-slate-200" />
           </div>
           
           <div className="space-y-3">
              {others.map((intern, idx) => (
                <motion.div
                  key={intern.rank || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + (idx * 0.05) }}
                  className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow"
                >
                   <div className="w-10 h-10 shrink-0 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-slate-500 text-sm">
                     #{idx + 4}
                   </div>
                   <div className="flex-1 min-w-0">
                     <h4 className="font-bold text-slate-900 truncate">{intern.name}</h4>
                     <p className="text-xs font-medium text-slate-500 mt-1">ID: {intern.uniqueId}</p>
                   </div>
                   <div className="flex items-center gap-8">
                      <div className="hidden sm:block text-right">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Time Taken</p>
                         <div className="flex items-center justify-end gap-1.5 text-slate-600 font-medium text-sm">
                            <Clock className="w-4 h-4" />
                            {intern.timeTaken}s
                         </div>
                      </div>
                      <div className="min-w-[80px] text-right">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Score</p>
                         <p className="text-xl font-bold text-slate-900 tracking-tight">{intern.score}</p>
                      </div>
                   </div>
                </motion.div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default QuizLeaderboard;
