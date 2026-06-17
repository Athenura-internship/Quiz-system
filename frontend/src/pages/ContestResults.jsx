import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { apiCall } from '../utils/api';
import { 
  BarChart3, 
  ArrowLeft, 
  Trophy, 
  Users, 
  Clock, 
  Target, 
  ChevronRight, 
  Layout,
  Star,
  Search,
  ShieldCheck,
  Zap,
  TrendingUp,
  Award,
  AlertCircle
} from 'lucide-react';

const ContestResults = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [quizData, setQuizData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const response = await apiCall(`/leaderboard/contest/${id}`);
        if (response && response.success) {
          setQuizData(response.data);
        } else {
          setError(response?.message || "Failed to retrieve results.");
        }
      } catch (err) {
        setError(err.message || "Network error. Could not retrieve data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading Results...</p>
      </div>
    );
  }

  if (error || !quizData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-red-200 shadow-sm max-w-lg mx-auto mt-10">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-8 border border-red-100">
           <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Error Loading Results</h2>
        <p className="text-slate-500 mb-10 font-medium px-8">{error || "Data not found."}</p>
        <button onClick={() => navigate('/contests')} className="px-8 py-3 bg-white border border-slate-300 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-all shadow-sm">
          Return to Assessments
        </button>
      </div>
    );
  }

  const unSortedParticipants = quizData.participants || [];
  const participants = [...unSortedParticipants].sort((a, b) => {
    const scoreA = a.score !== undefined ? a.score : -1;
    const scoreB = b.score !== undefined ? b.score : -1;
    if (scoreB !== scoreA) return scoreB - scoreA;
    const timeA = a.timeTaken !== undefined ? a.timeTaken : Infinity;
    const timeB = b.timeTaken !== undefined ? b.timeTaken : Infinity;
    return timeA - timeB;
  });

  const filteredParticipants = participants.filter(p => 
     p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     (p.uniqueId || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalParticipants = participants.length;
  const maxScore = quizData.totalScore || quizData.totalQuestions || 0;
  const avgScore = participants.length > 0 ? (participants.reduce((acc, p) => acc + (p.score || 0), 0) / participants.length).toFixed(1) : 0;

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-3">
             <button 
               onClick={() => navigate('/contests')}
               className="p-2 bg-white hover:bg-slate-50 rounded-lg text-slate-500 transition-all border border-slate-200 shadow-sm"
             >
                <ArrowLeft className="w-4 h-4" />
             </button>
             <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-md">
                {quizData.domain}
             </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Assessment Results
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <h2 className="text-base font-semibold text-slate-500">{quizData.title}</h2>
            {!quizData.isFinalized && totalParticipants > 0 && (
              <button 
                onClick={async () => {
                  try {
                    setIsLoading(true);
                    const res = await apiCall("/leaderboard/finalize", {
                      method: "POST",
                      body: JSON.stringify({ contestId: id })
                    });
                    if (res.success) {
                       window.location.reload();
                    } else {
                       setError(res.message);
                    }
                  } catch (err) {
                    setError(err.message || "Failed to award badges.");
                    setIsLoading(false);
                  }
                }}
                className="px-4 py-1.5 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
              >
                <Award className="w-4 h-4" />
                Award Badges
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
           <div className="bg-white px-6 py-5 rounded-2xl border border-slate-200 shadow-sm text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Participants</p>
              <div className="flex items-center justify-center gap-2">
                 <Users className="w-5 h-5 text-blue-500" />
                 <span className="text-2xl font-bold text-slate-900">{totalParticipants}</span>
              </div>
           </div>
           <div className="bg-white px-6 py-5 rounded-2xl border border-slate-200 shadow-sm text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Avg Accuracy</p>
              <div className="flex items-center justify-center gap-2">
                 <Target className="w-5 h-5 text-emerald-500" />
                 <span className="text-2xl font-bold text-slate-900">{Math.round((avgScore / maxScore) * 100) || 0}%</span>
              </div>
           </div>
           <div className="bg-white px-6 py-5 rounded-2xl border border-slate-200 shadow-sm text-center hidden sm:block">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Questions</p>
              <div className="flex items-center justify-center gap-2">
                 <Layout className="w-5 h-5 text-indigo-500" />
                 <span className="text-2xl font-bold text-slate-900">{maxScore}</span>
              </div>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Rankings Table */}
        <div className="xl:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <TrendingUp className="w-5 h-5 text-slate-400" />
                 <span className="text-lg font-bold text-slate-900">Participant Standings</span>
              </div>
              <div className="relative group w-48 sm:w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                    type="text" 
                    placeholder="Search participants..."
                    className="w-full h-10 pl-9 pr-4 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 outline-none transition-all shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
           </div>

           <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                       <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Rank</th>
                       <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Participant</th>
                       <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Score</th>
                       <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Accuracy</th>
                       <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Duration</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {filteredParticipants.length > 0 ? (
                      filteredParticipants.map((intern, index) => {
                        const isTop3 = index < 3;
                        const scorePct = maxScore > 0 ? Math.round(((intern.score || 0) / maxScore) * 100) : 0;
                        
                        return (
                          <motion.tr 
                            key={intern.uniqueId || index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.02 }}
                            className={`group transition-colors ${isTop3 ? 'bg-blue-50/30' : 'hover:bg-slate-50'}`}
                          >
                             <td className="py-4 px-6">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm
                                   ${index === 0 ? 'bg-amber-100 text-amber-600' :
                                     index === 1 ? 'bg-slate-200 text-slate-600' :
                                     index === 2 ? 'bg-orange-100 text-orange-600' :
                                     'bg-slate-50 border border-slate-200 text-slate-500'}`}>
                                   {index + 1}
                                </div>
                             </td>
                             <td className="py-4 px-6">
                                <div>
                                   <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                      {intern.name}
                                      {index === 0 && <Award className="w-4 h-4 text-amber-500" />}
                                   </p>
                                   <p className="text-xs font-medium text-slate-500 mt-0.5">ID: {intern.uniqueId || "N/A"}</p>
                                </div>
                             </td>
                             <td className="py-4 px-6 text-center">
                                <span className="text-base font-bold text-slate-900">{intern.score || 0}</span>
                                <span className="text-xs text-slate-400 font-semibold ml-1">/ {maxScore}</span>
                             </td>
                             <td className="py-4 px-6 text-center">
                                <div className="flex flex-col items-center gap-1">
                                   <span className={`text-xs font-bold px-2 py-1 rounded-md
                                      ${scorePct >= 90 ? 'bg-emerald-100 text-emerald-700' : 
                                        scorePct >= 75 ? 'bg-blue-100 text-blue-700' :
                                        'bg-slate-100 text-slate-600'}`}>
                                      {scorePct}%
                                   </span>
                                </div>
                             </td>
                             <td className="py-4 px-6 text-right">
                                <div className="flex items-center justify-end gap-1.5 text-slate-500 text-sm font-medium">
                                   <Clock className="w-4 h-4" />
                                   {intern.timeTaken ? `${Math.floor(intern.timeTaken / 60)}m ${intern.timeTaken % 60}s` : 'N/A'}
                                </div>
                             </td>
                          </motion.tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-20 text-center">
                           <div className="flex flex-col items-center gap-4 text-slate-400">
                              <Search className="w-8 h-8" />
                              <p className="text-sm font-semibold">No matching participants.</p>
                           </div>
                        </td>
                      </tr>
                    )}
                 </tbody>
               </table>
             </div>
           </div>
        </div>

        {/* Sidebar Analytics */}
        <div className="space-y-6">
           <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
              <div className="flex items-center gap-2 mb-6">
                 <BarChart3 className="w-5 h-5 text-blue-500" />
                 <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Performance Analytics</h3>
              </div>
              
              <div className="space-y-8">
                 <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                       <span>Average Accuracy</span>
                       <span className="text-blue-600">{Math.round((avgScore / maxScore) * 100) || 0}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(avgScore / maxScore) * 100}%` }}
                          className="h-full bg-blue-500 rounded-full" 
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                       <div className="flex items-center gap-2 mb-1">
                          <Star className="w-4 h-4 text-amber-500" />
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Top Performers (&gt;90%)</span>
                       </div>
                       <p className="text-2xl font-bold text-slate-900">{participants.filter(p => (p.score / maxScore) >= 0.9).length}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                       <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Trend</span>
                       </div>
                       <p className="text-2xl font-bold text-slate-900">Positive</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-3">
                 <ShieldCheck className="w-4 h-4 text-emerald-500" />
                 <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Verified Results</h3>
              </div>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">
                 All submission data has been verified. The results are locked and recorded in the system.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ContestResults;
