import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SidePromoCard from '../components/SidePromoCard';
import { apiCall } from '../utils/api';

const AdminLeaderboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInternsRanked: '0',
    totalBadgesDistributed: '0',
    averageScore: '0',
    currentMonthChampions: '0'
  });

  useEffect(() => {
    fetchLeaderboard();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const result = await apiCall("/leaderboard/stats");
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const result = await apiCall("/leaderboard/overall");
      if (result.success) {
        console.log("Leaderboard API:", result.data);
        setLeaderboard(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeaderboard = leaderboard.filter((item) => {
    const searchText = (searchTerm || "").toLowerCase();

    const name = (item.name || item.fullName || item.username || "").toLowerCase();
    const uniqueId = (item.uniqueId || "").toLowerCase();
    const email = (item.email || "").toLowerCase();
    const domain = (item.domain || "").toLowerCase();

    return (
      name.includes(searchText) ||
      uniqueId.includes(searchText) ||
      email.includes(searchText) ||
      domain.includes(searchText)
    );
  });

  const starPerformer = leaderboard.find(i => i.isInternOfTheMonth) || leaderboard[0];

  return (
    <div className="w-full h-full p-4 sm:p-6 lg:p-8 font-sans overflow-x-hidden space-y-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header & Admin Stats */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
             <div>
               <h1 className="text-4xl font-black bg-gradient-to-r from-slate-800 to-slate-900 dark:from-white dark:to-slate-100 bg-clip-text text-transparent mb-2 tracking-tight">
                 Admin Dashboard: Hall of Fame
               </h1>
               <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium">
                 Comprehensive view of platform achievement metrics and global standings.
               </p>
             </div>
             
             <div className="relative w-full md:w-80">
                <input
                  type="text"
                  placeholder="Filter by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700/50 rounded-[12px] focus:border-sky-400 focus:ring-4 focus:ring-sky-100/30 transition-all text-sm font-medium"
                />
                <svg className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Interns Ranked', value: stats.totalInternsRanked, color: 'text-sky-600', bg: 'bg-sky-50 shadow-sky-500/10' },
              { label: 'Total Badges Distributed', value: stats.totalBadgesDistributed, color: 'text-amber-600', bg: 'bg-amber-50 shadow-amber-500/10' },
              { label: 'Average Score', value: stats.averageScore, color: 'text-emerald-600', bg: 'bg-emerald-50 shadow-emerald-500/10' },
              { label: 'Current Month Champions', value: stats.currentMonthChampions, color: 'text-purple-600', bg: 'bg-purple-50 shadow-purple-500/10' },
            ].map((card, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-700/30 shadow-sm flex flex-col justify-between h-[120px]`}
              >
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">{card.label}</p>
                  <h3 className={`text-2xl font-black ${card.color} dark:text-white`}>{card.value}</h3>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Hall of Fame Spotlight (Shared Component Design) */}
        {starPerformer && (
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[3rem] p-8 sm:p-12 relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
             <div className="relative flex flex-col md:flex-row items-center gap-10">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[2rem] bg-slate-800 border-[3px] border-amber-400/50 flex items-center justify-center text-6xl shadow-2xl transform rotate-3">
                   ✨
                </div>
                <div className="flex-1 text-center md:text-left">
                   <h4 className="text-amber-400 font-black text-xs uppercase tracking-widest mb-2">Platform Star Performer</h4>
                   <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight leading-none">
                      {starPerformer.name || starPerformer.fullName || starPerformer.username || "Unknown"}
                   </h2>
                   <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                      <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-center">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Total Badges</p>
                         <p className="text-xl font-black text-white">{starPerformer.badgesEarned}</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-center">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Global Domain</p>
                         <p className="text-xl font-black text-sky-400">{starPerformer.domain || "N/A"}</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Rankings Area */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[.2em] px-2 mb-4">Detailed Rankings</h3>
            {filteredLeaderboard.length > 0 ? (
              filteredLeaderboard.map((intern, i) => (
                <motion.div
                  key={intern.uniqueId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + (i * 0.05) }}
                  className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-700/50 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row w-full items-center gap-6">
                      <div className="shrink-0 w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-black text-xl text-slate-400">
                        #{i + 1}
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">{intern.name || intern.fullName || intern.username || "Unknown"}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{intern.uniqueId || "N/A"} • {intern.domain || "N/A"}</p>
                      </div>

                      <div className="shrink-0 text-center min-w-[80px]">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-0.5">Badges Earned</p>
                          <p className="text-3xl font-black text-slate-800 dark:text-white leading-none">{intern.badgesEarned}</p>
                      </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
                 <p className="text-slate-400 font-bold">{loading ? 'Loading Rankings...' : 'No data found in Hall of Fame'}</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <SidePromoCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLeaderboard;
