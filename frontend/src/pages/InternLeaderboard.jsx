import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiCall } from '../utils/api';
import Badge1st from '../assets/1st.png';
import Badge2nd from '../assets/2nd.png';
import Badge3rd from '../assets/3rd.png';
import { Trophy, Search, Star, ChevronRight, X } from 'lucide-react';

const InternLeaderboard = () => {
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [leaderboardType, setLeaderboardType] = useState('Domain');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setCurrentUser(storedUser);
  }, []);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let endpoint = "/leaderboard/overall";
      if (leaderboardType === 'Domain' && currentUser?.domain) {
        endpoint = `/leaderboard/domain/${encodeURIComponent(currentUser.domain.trim().toUpperCase())}`;
      }
      const response = await apiCall(endpoint);
      if (response && response.success) {
        setLeaderboardData(response.data || []);
      }
    } catch (err) {
      console.error("Leaderboard fetch failed:", err);
      setError("Failed to load rankings.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchLeaderboard();
    }
  }, [currentUser, leaderboardType]);

  const filteredInterns = leaderboardData.filter(inc => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = (inc.name || '').toLowerCase().includes(searchLower);
    const idMatch = (inc.uniqueId || '').toLowerCase().includes(searchLower);
    return nameMatch || idMatch;
  });

  const topThree = filteredInterns.slice(0, 3);
  const remainingInterns = filteredInterns.slice(3);

  const getBadgeAsset = (rank) => {
    if (rank === 1) return Badge1st;
    if (rank === 2) return Badge2nd;
    if (rank === 3) return Badge3rd;
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading Rankings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
             Leaderboard
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-2">Rankings for {leaderboardType === 'Domain' ? (currentUser?.domain || 'General') : 'Overall'} domain.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <select
            value={leaderboardType}
            onChange={(e) => setLeaderboardType(e.target.value)}
            className="w-full sm:w-48 h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-blue-500 shadow-sm cursor-pointer"
          >
            <option value="Domain">My Department</option>
            <option value="Overall">Overall Leaderboard</option>
          </select>
          <div className="relative group w-full sm:w-72">
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

      {topThree.length > 0 && (
        <div className="pt-6 flex flex-col md:flex-row items-end justify-center gap-6 max-w-4xl mx-auto">
           {topThree[1] && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => setSelectedIntern(topThree[1])}
                className="w-full md:w-64 bg-white border border-slate-200 shadow-sm rounded-3xl p-6 flex flex-col items-center text-center cursor-pointer group hover:shadow-md transition-all h-[260px]"
              >
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">2nd Place</span>
                 <img src={Badge2nd} alt="Silver" className="w-16 h-16 object-contain mb-4" />
                 <h3 className="text-base font-bold text-slate-900 truncate w-full">{topThree[1].name}</h3>
                 <p className="text-xs font-medium text-slate-500 mt-1">{topThree[1].domain}</p>
                 <div className="mt-auto pt-4 border-t border-slate-100 w-full flex justify-between items-center px-4 text-sm font-bold">
                    <span className="text-slate-700">{topThree[1].totalScore || 0} pts</span>
                    <span className="text-amber-500">{topThree[1].badgesEarned} badges</span>
                 </div>
              </motion.div>
           )}

           {topThree[0] && (
              <motion.div 
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full md:w-72 bg-white border-2 border-amber-300 shadow-lg rounded-3xl p-8 flex flex-col items-center text-center cursor-pointer group hover:-translate-y-2 transition-all h-[300px] z-10"
                onClick={() => setSelectedIntern(topThree[0])}
              >
                 <span className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-4">1st Place</span>
                 <img src={Badge1st} alt="Gold" className="w-20 h-20 object-contain mb-4" />
                 <h3 className="text-lg font-bold text-slate-900 truncate w-full">{topThree[0].name}</h3>
                 <p className="text-xs font-medium text-slate-500 mt-1">{topThree[0].domain}</p>
                 <div className="mt-auto pt-4 border-t border-slate-100 w-full flex justify-between items-center px-4 text-base font-bold">
                    <span className="text-slate-900">{topThree[0].totalScore || 0} pts</span>
                    <span className="text-amber-600">{topThree[0].badgesEarned} badges</span>
                 </div>
              </motion.div>
           )}

           {topThree[2] && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => setSelectedIntern(topThree[2])}
                className="w-full md:w-64 bg-white border border-slate-200 shadow-sm rounded-3xl p-6 flex flex-col items-center text-center cursor-pointer group hover:shadow-md transition-all h-[240px]"
              >
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">3rd Place</span>
                 <img src={Badge3rd} alt="Bronze" className="w-14 h-14 object-contain mb-4" />
                 <h3 className="text-base font-bold text-slate-900 truncate w-full">{topThree[2].name}</h3>
                 <p className="text-xs font-medium text-slate-500 mt-1">{topThree[2].domain}</p>
                 <div className="mt-auto pt-4 border-t border-slate-100 w-full flex justify-between items-center px-4 text-sm font-bold">
                    <span className="text-slate-700">{topThree[2].totalScore || 0} pts</span>
                    <span className="text-amber-500">{topThree[2].badgesEarned} badges</span>
                 </div>
              </motion.div>
           )}
        </div>
      )}

      <div className="space-y-4">
        {error ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-red-200 shadow-sm">
             <p className="text-sm font-bold text-red-500">{error}</p>
          </div>
        ) : filteredInterns.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm">
             <p className="text-sm font-semibold text-slate-500">No candidates found.</p>
          </div>
        ) : (
          filteredInterns.map((intern, i) => {
            const isSelf = currentUser && currentUser.uniqueId === intern.uniqueId;
            const rank = i + 1;
            const hasBadge = rank <= 3;
            
            return (
              <motion.div
                key={intern.id || intern.uniqueId || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => setSelectedIntern(intern)}
                className={`bg-white rounded-2xl p-4 md:p-5 flex items-center justify-between gap-6 hover:shadow-md transition-shadow cursor-pointer border
                  ${isSelf ? 'border-blue-300 bg-blue-50' : 'border-slate-200'}`}
              >
                <div className="flex items-center gap-6 flex-1">
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-sm text-slate-500">
                      {hasBadge ? (
                         <img src={getBadgeAsset(rank)} alt={`Rank ${rank}`} className="w-6 h-6 object-contain" />
                      ) : (
                         `#${rank}`
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                         <h3 className="text-base font-bold text-slate-900 truncate">
                            {intern.name}
                         </h3>
                         {isSelf && (
                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                               You
                            </span>
                         )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                         <span className="text-xs font-medium text-slate-500">{intern.uniqueId}</span>
                         <span className="w-1 h-1 bg-slate-300 rounded-full" />
                         <span className="text-xs font-semibold text-blue-600">{intern.domain}</span>
                      </div>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-center mr-6">
                        <div className="space-y-1">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Points</p>
                           <p className="text-base font-bold text-slate-900">{intern.totalScore || 0}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Badges</p>
                           <p className="text-base font-bold text-amber-500">{intern.badgesEarned}</p>
                        </div>
                    </div>
                </div>

                <button className="hidden sm:flex w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 items-center justify-center text-slate-400 transition-colors">
                   <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {selectedIntern && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedIntern(null)}
               className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
             />
             
             <motion.div
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden"
             >
                <div className="p-8 border-b border-slate-100 bg-slate-50 flex flex-col items-center text-center relative">
                   <button 
                      onClick={() => setSelectedIntern(null)}
                      className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                   </button>
                   <div className="w-20 h-20 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-bold mb-4">
                      {selectedIntern.name.charAt(0)}
                   </div>
                   <h2 className="text-xl font-bold text-slate-900">{selectedIntern.name}</h2>
                   <p className="text-sm font-medium text-slate-500 mt-1">{selectedIntern.domain}</p>
                </div>

                <div className="p-8 space-y-6">
                   <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-sm font-semibold text-slate-600">Total Points</span>
                      <span className="text-lg font-bold text-slate-900">{selectedIntern.totalScore || 0}</span>
                   </div>
                   <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-sm font-semibold text-slate-600">Badges Earned</span>
                      <div className="flex items-center gap-1.5">
                         <Star className="w-4 h-4 text-amber-500" />
                         <span className="text-lg font-bold text-slate-900">{selectedIntern.badgesEarned}</span>
                      </div>
                   </div>

                   <button 
                     onClick={() => setSelectedIntern(null)}
                     className="w-full py-3 bg-white border border-slate-300 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-50 transition-colors"
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

export default InternLeaderboard;
