import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { apiCall } from "../utils/api";
import { 
  Trophy, 
  Zap, 
  Star, 
  Activity, 
  Shield, 
  Award, 
  BarChart3, 
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Layers,
  Users,
  PlusCircle,
  Upload
} from "lucide-react";
import Badge1st from '../assets/1st.png';
import Badge2nd from '../assets/2nd.png';
import Badge3rd from '../assets/3rd.png';

const domains = [
  "Overall Ranking",
  "Data Science & Analytics", 
  "Frontend Developer", 
  "Backend Developer", 
  "Machine Learning", 
  "Cyber Security",
  "Full Stack Development"
];

export default function DomainReport() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [domain, setDomain] = useState("Overall Ranking");
  const [loading, setLoading] = useState(false);
  const [useBackup, setUseBackup] = useState(false);
  const [stats, setStats] = useState({
     totalInternsRanked: 0,
     totalBadgesDistributed: 0,
     averageScore: 0,
     currentMonthChampions: 0
  });

  const fetchStatsAndLeaderboard = async () => {
    setLoading(true);
    setUseBackup(false);
    try {
      // 1. Fetch Stats
      const statsRes = await apiCall("/leaderboard/stats");
      if (statsRes && statsRes.success) {
         setStats(statsRes.data);
      }

      // 2. Fetch Leaderboard
      let result;
      if (domain === "Overall Ranking") {
         result = await apiCall("/leaderboard/overall");
      } else {
         result = await apiCall(`/leaderboard/domain/${encodeURIComponent(domain)}`);
      }
      
      if (result.success) {
        setData(result.data || []);
      } else {
        setData([]);
      }
    } catch (err) {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatsAndLeaderboard();
  }, [domain]);

  const topThree = useMemo(() => data.slice(0, 3), [data]);
  const others = useMemo(() => data.slice(3), [data]);

  return (
    <div className="space-y-12 animate-fade-in pb-10">
      {/* Header section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
             Analytics Dashboard
          </h1>
          <p className="text-slate-500 font-medium">Monitor active users, domain performance, and system metrics.</p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
           <button 
             onClick={() => navigate('/create-contest')}
             className="px-5 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
           >
              <PlusCircle className="w-4 h-4" />
              Publish Quiz
           </button>
           <button 
             onClick={() => navigate('/upload-interns')}
             className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold text-sm rounded-xl flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
           >
              <Upload className="w-4 h-4" />
              Bulk Import
           </button>
        </div>
      </div>

      {/* Real-time Telemetry Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: "Active Interns", val: stats.totalInternsRanked, icon: <Users className="w-5 h-5 text-blue-600" />, bg: "bg-blue-50" },
           { label: "Badges Issued", val: stats.totalBadgesDistributed, icon: <Award className="w-5 h-5 text-purple-600" />, bg: "bg-purple-50" },
           { label: "Avg Skill Accuracy", val: `${stats.averageScore}%`, icon: <Activity className="w-5 h-5 text-emerald-600" />, bg: "bg-emerald-50" },
           { label: "Sector Champions", val: stats.currentMonthChampions, icon: <Trophy className="w-5 h-5 text-amber-600" />, bg: "bg-amber-50" },
         ].map((tile, idx) => (
            <div 
              key={idx}
              className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between h-[140px] shadow-sm"
            >
               <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{tile.label}</span>
                  <div className={`p-2 rounded-lg ${tile.bg}`}>
                     {tile.icon}
                  </div>
               </div>
               <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{tile.val}</h3>
            </div>
         ))}
      </div>

      {/* Sector filter tabs */}
      <div className="space-y-4">
         <h3 className="text-sm font-bold text-slate-900">Filter by Domain</h3>
         <div className="flex flex-wrap gap-2">
            {domains.map((d) => (
              <button
                key={d}
                onClick={() => setDomain(d)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
                  ${domain === d
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
              >
                {d}
              </button>
            ))}
         </div>
      </div>

      {/* Main leader standings visualizer */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="py-32 flex flex-col items-center justify-center gap-4"
            >
              <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-sm font-medium text-slate-500">Loading domain data...</p>
            </motion.div>
          ) : data.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="py-24 bg-white rounded-3xl border border-slate-200 border-dashed text-center shadow-sm"
            >
               <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-slate-400" />
               </div>
               <h2 className="text-xl font-bold text-slate-900 mb-2">No Active Submissions</h2>
               <p className="text-slate-500 font-medium max-w-sm mx-auto">
                  The {domain} domain currently has no active interns. Use bulk import to onboard users.
               </p>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="space-y-12"
            >
              {/* Podium View */}
              {topThree.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-8 max-w-4xl mx-auto">
                   {topThree[1] && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="w-full bg-white border border-slate-200 shadow-sm rounded-3xl p-6 flex flex-col items-center text-center cursor-pointer group hover:shadow-md transition-all h-[260px] md:order-1"
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
                        className="w-full bg-white border-2 border-amber-300 shadow-lg rounded-3xl p-8 flex flex-col items-center text-center cursor-pointer group hover:-translate-y-2 transition-all h-[300px] z-10 md:order-2"
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
                        className="w-full bg-white border border-slate-200 shadow-sm rounded-3xl p-6 flex flex-col items-center text-center cursor-pointer group hover:shadow-md transition-all h-[240px] md:order-3"
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

              {/* Table standing roster */}
              {others.length > 0 && (
                <div className="space-y-4 pt-6">
                   <div className="flex items-center gap-4 px-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Other Standings</span>
                      <div className="flex-1 h-px bg-slate-200" />
                   </div>

                   <div className="space-y-3">
                      {others.map((u, i) => {
                        const rank = i + 4;
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + (i * 0.05) }}
                            className="bg-white rounded-2xl p-4 md:p-5 flex items-center justify-between gap-6 hover:shadow-md transition-shadow cursor-pointer border border-slate-200"
                          >
                             <div className="flex items-center gap-6 flex-1">
                                 <div className="w-10 h-10 shrink-0 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-sm text-slate-500">
                                    #{rank}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                   <div className="flex items-center gap-3">
                                      <h3 className="text-base font-bold text-slate-900 truncate">
                                         {u.name}
                                      </h3>
                                   </div>
                                   <div className="flex items-center gap-3 mt-1">
                                      <span className="text-xs font-medium text-slate-500">{u.uniqueId}</span>
                                      <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                      <span className="text-xs font-semibold text-blue-600">{u.domain}</span>
                                   </div>
                                 </div>

                                 <div className="hidden md:flex items-center gap-8 text-center mr-6">
                                     <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Points</p>
                                        <p className="text-base font-bold text-slate-900">{u.score || u.totalScore || 0}</p>
                                     </div>
                                     <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Badges</p>
                                        <p className="text-base font-bold text-amber-500">{u.badgesEarned !== undefined ? u.badgesEarned : u.badges || 0}</p>
                                     </div>
                                 </div>
                             </div>

                             <button className="hidden sm:flex w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 items-center justify-center text-slate-400 transition-colors">
                                <ChevronRight className="w-5 h-5" />
                             </button>
                          </motion.div>
                        );
                      })}
                   </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {useBackup && (
           <div className="mt-12 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center gap-2 text-amber-700">
              <BrainCircuit className="w-4 h-4" />
              <p className="text-sm font-semibold">Displaying simulated data (API connection failed)</p>
           </div>
        )}
      </div>
    </div>
  );
}