import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SidePromoCard from '../components/SidePromoCard';
import { apiCall } from '../utils/api';
import { 
  Trophy, 
  Target, 
  Award, 
  BarChart3, 
  Search, 
  TrendingUp, 
  Users, 
  Zap, 
  Star,
  ChevronRight,
  ShieldCheck,
  BrainCircuit,
  Filter
} from 'lucide-react';

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
    const domain = (item.domain || "").toLowerCase();

    return name.includes(searchText) || uniqueId.includes(searchText) || domain.includes(searchText);
  });

  const starPerformer = leaderboard.find(i => i.isInternOfTheMonth) || leaderboard[0];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading Leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header & Search */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Leaderboard
          </h1>
          <p className="text-slate-500 font-medium">Global standings across all sectors and domains.</p>
        </div>

        <div className="relative group w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search rankings..."
            className="w-full h-12 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Ranked', value: stats.totalInternsRanked, icon: <Users className="w-5 h-5 text-blue-500" />, bg: 'bg-white', border: 'border-slate-200' },
          { label: 'Badges Distributed', value: stats.totalBadgesDistributed, icon: <Award className="w-5 h-5 text-amber-500" />, bg: 'bg-white', border: 'border-slate-200' },
          { label: 'Average Score', value: `${stats.averageScore}%`, icon: <Target className="w-5 h-5 text-emerald-500" />, bg: 'bg-white', border: 'border-slate-200' },
          { label: 'Champions', value: stats.currentMonthChampions, icon: <Star className="w-5 h-5 text-purple-500" />, bg: 'bg-white', border: 'border-slate-200' },
        ].map((card, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between h-[140px] relative overflow-hidden group ${card.bg} ${card.border}`}
          >
              <div className="absolute top-4 right-4 p-2 bg-slate-50 rounded-lg">
                 {card.icon}
              </div>
              <div>
                <h3 className={`text-3xl font-bold text-slate-900 tracking-tight mt-6`}>{card.value}</h3>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">{card.label}</p>
              </div>
          </motion.div>
        ))}
      </div>

      {/* Star Performer Spotlight */}
      {starPerformer && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 md:p-12 border border-blue-200 shadow-md relative overflow-hidden flex flex-col md:flex-row items-center gap-10"
        >
           <div className="relative">
              <div className="w-32 h-32 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center text-5xl shadow-sm relative z-10 text-blue-600 font-bold">
                 {(starPerformer.name || starPerformer.fullName || "A").charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-3 -right-3 bg-amber-400 text-white p-3 rounded-xl shadow-md z-20">
                 <Trophy className="w-5 h-5" />
              </div>
           </div>

           <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                 <span className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2 inline-block">Top Performer</span>
                 <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                    {starPerformer.name || starPerformer.fullName || "Unknown Candidate"}
                 </h2>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                 <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Badges</p>
                    <p className="text-lg font-bold text-slate-900">{starPerformer.badgesEarned}</p>
                 </div>
                 <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl text-center">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Domain</p>
                    <p className="text-sm font-bold text-blue-800 mt-1">{starPerformer.domain || "N/A"}</p>
                 </div>
                 <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl text-center">
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Rank</p>
                    <p className="text-lg font-bold text-amber-600">#1</p>
                 </div>
              </div>
           </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rankings Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-slate-400" />
                <h3 className="text-lg font-bold text-slate-900">Global Rankings</h3>
             </div>
          </div>

          <div className="space-y-3">
            {filteredLeaderboard.length > 0 ? (
              filteredLeaderboard.map((intern, i) => (
                <motion.div
                  key={intern.uniqueId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + (i * 0.05) }}
                  className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 flex items-center justify-between gap-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-5 flex-1">
                      <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center font-bold text-lg
                         ${i === 0 ? 'bg-amber-100 text-amber-600' : 
                           i === 1 ? 'bg-slate-200 text-slate-600' : 
                           i === 2 ? 'bg-orange-100 text-orange-600' : 
                           'bg-slate-50 text-slate-500'}`}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-slate-900 truncate">
                           {intern.name || intern.fullName || "Candidate"}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                           <span className="text-xs font-semibold text-slate-500">{intern.uniqueId}</span>
                           <span className="w-1 h-1 bg-slate-300 rounded-full" />
                           <span className="text-xs font-semibold text-blue-600">{intern.domain}</span>
                        </div>
                      </div>

                      <div className="hidden md:flex items-center gap-8 text-center mr-6">
                          <div className="space-y-1">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Honors</p>
                             <p className="text-lg font-bold text-slate-900">{intern.badgesEarned}</p>
                          </div>
                      </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm">
                 <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-8 h-8 text-slate-400" />
                 </div>
                 <p className="text-sm font-bold text-slate-500">No candidates found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar / Promo */}
        <div className="space-y-6">
           <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <h4 className="text-base font-bold text-slate-900 mb-3">Ranking System</h4>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                 Rankings are calculated based on cumulative achievement badges distributed across all operational sectors.
              </p>
           </div>
           
           <SidePromoCard />
        </div>
      </div>
    </div>
  );
};

export default AdminLeaderboard;
