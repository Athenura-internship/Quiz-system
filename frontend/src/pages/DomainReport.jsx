import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiCall } from "../utils/api";

const MOCK_DOMAIN_DATA = {
  "c++": [
    { rank: 1, name: "Arden Cho", email: "arden@athenura.com", score: 980, timeTaken: 120, badges: 4 },
    { rank: 2, name: "Marcus Vane", email: "marcus@athenura.com", score: 955, timeTaken: 145, badges: 3 },
    { rank: 3, name: "Sela Ward", email: "sela@athenura.com", score: 920, timeTaken: 160, badges: 2 },
    { rank: 4, name: "Kenji Sato", email: "kenji@athenura.com", score: 890, timeTaken: 180, badges: 1 },
  ],
  "frontend": [
    { rank: 1, name: "Kelly Kapoor", email: "kelly@athenura.com", score: 995, timeTaken: 110, badges: 5 },
    { rank: 2, name: "Jim Halpert", email: "jim@athenura.com", score: 960, timeTaken: 130, badges: 3 },
    { rank: 3, name: "Pam Beesly", email: "pam@athenura.com", score: 940, timeTaken: 140, badges: 2 },
  ],
  "backend": [
    { rank: 1, name: "Dwight Schrute", email: "dwight@athenura.com", score: 990, timeTaken: 115, badges: 4 },
    { rank: 2, name: "Angela Martin", email: "angela@athenura.com", score: 975, timeTaken: 125, badges: 3 },
  ]
};

export default function DomainReport() {
  const [data, setData] = useState([]);
  const [domain, setDomain] = useState("Data Science & Analytics");
  const [loading, setLoading] = useState(false);
  const [useBackup, setUseBackup] = useState(false);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setUseBackup(false);
    try {
      const result = await apiCall(`/leaderboard/domain/${encodeURIComponent(domain)}`);
      
      if (result.success && result.data && result.data.length > 0) {
        setData(result.data);
      } else {
        // Fallback to mock data for visualization if backend is empty
        setData(MOCK_DOMAIN_DATA[domain.toLowerCase()] || []);
        setUseBackup(true);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setData(MOCK_DOMAIN_DATA[domain.toLowerCase()] || []);
      setUseBackup(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [domain]);

  const topThree = useMemo(() => data.slice(0, 3), [data]);
  const others = useMemo(() => data.slice(3), [data]);

  const domainThemes = {
    "data science & analytics": "from-blue-600 to-indigo-700 shadow-blue-500/20",
    "human resources": "from-rose-500 to-pink-700 shadow-rose-500/20",
    "application development": "from-sky-500 to-blue-700 shadow-sky-500/20",
    "social media management": "from-purple-500 to-indigo-700 shadow-purple-500/20",
    "graphic design": "from-amber-400 to-orange-600 shadow-amber-500/20",
    "digital marketing": "from-emerald-500 to-teal-700 shadow-emerald-500/20",
    "video editing": "from-red-500 to-orange-700 shadow-red-500/20",
    "full stack development": "from-indigo-600 to-violet-800 shadow-indigo-500/20",
    "mern stack development": "from-green-600 to-emerald-800 shadow-green-500/20",
    "content writing": "from-slate-600 to-slate-800 shadow-slate-500/20",
    "content creator": "from-cyan-500 to-blue-700 shadow-cyan-500/20",
    "ui/ux designing": "from-fuchsia-500 to-purple-700 shadow-fuchsia-500/20",
    "front-end developer": "from-sky-400 to-blue-600 shadow-sky-500/20",
    "back-end developer": "from-teal-600 to-emerald-800 shadow-teal-500/20"
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-10 font-sans transition-colors duration-500">
      
      {/* Header Section */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div className="flex items-center gap-4">
           <div className={`p-4 rounded-2xl bg-gradient-to-br ${domainThemes[domain.toLowerCase()] || domainThemes["c++"]} text-white shadow-lg`}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
           </div>
           <div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                {domain.toUpperCase()} <span className="text-slate-400 font-medium">Rankings</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">Platform-wide top performers in specialized domains.</p>
           </div>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
           <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 max-w-2xl px-2">
             {["Data Science & Analytics", "Human Resources", "Application Development", "Social Media Management", "Graphic Design", "Digital Marketing", "Video Editing", "Full Stack Development", "MERN Stack Development", "Content Writing", "Content Creator", "UI/UX Designing", "Front-end Developer", "Back-end Developer"].map((d) => (
               <button
                 key={d}
                 onClick={() => setDomain(d)}
                 className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                   domain === d
                     ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
                     : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                 }`}
               >
                 {d}
               </button>
             ))}
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Loading State */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 font-bold animate-pulse">Calculating rankings...</p>
            </motion.div>
          ) : data.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 bg-white dark:bg-slate-800 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700"
            >
               <div className="text-6xl mb-6">🏆</div>
               <h2 className="text-2xl font-black text-slate-800 dark:text-white">Ready for Kickoff!</h2>
               <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-2">
                 No competition data found for this domain yet. Be the first to take a quiz and claim the #1 spot!
               </p>
            </motion.div>
          ) : (
            <div className="space-y-12">
              {/* Podium View (Top 3) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                {topThree.map((user, index) => {
                  const rankStyles = [
                    { order: "md:order-2", card: "bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-900/20 dark:to-slate-800 border-yellow-200 dark:border-yellow-700 h-[320px]", icon: "bg-yellow-400", emoji: "👑" },
                    { order: "md:order-1", card: "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-[260px]", icon: "bg-slate-400", emoji: "🥈" },
                    { order: "md:order-3", card: "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-[220px]", icon: "bg-orange-400", emoji: "🥉" }
                  ][index];

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative p-8 rounded-[2.5rem] border shadow-xl flex flex-col items-center justify-center text-center ${rankStyles.card} ${rankStyles.order} group hover:-translate-y-2 transition-all duration-300`}
                    >
                      <div className={`absolute -top-6 w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-lg border-4 border-white dark:border-slate-900 ${rankStyles.icon}`}>
                         {rankStyles.emoji}
                      </div>
                      
                      <div className="mb-4">
                         <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-2xl mb-3 font-black text-slate-400 mx-auto border-2 border-white dark:border-slate-600">
                            {user.name.charAt(0)}
                         </div>
                         <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">{user.name}</h2>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{(user.email || user.uniqueId || '').split('@')[0]}</p>
                      </div>

                      <div className="w-full flex justify-around items-center pt-6 border-t border-slate-100 dark:border-slate-700/50">
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Score</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">{user.score || user.totalScore}</p>
                         </div>
                         <div className="w-px h-6 bg-slate-100 dark:bg-slate-700"></div>
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Avg</p>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-300">{user.timeTaken || user.badges} {user.timeTaken ? 's' : '🏆'}</p>
                         </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Others Table */}
              {others.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] ml-4 mb-4">Champion Ranks</h3>
                  {others.map((user, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow group"
                    >
                      <div className="flex items-center gap-6">
                        <span className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center font-black text-slate-400">
                          #{idx + 4}
                        </span>
                        <div>
                          <p className="font-black text-slate-800 dark:text-white tracking-tight">{user.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8">
                         <div className="text-right">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Metrics</p>
                           <p className="text-lg font-black text-slate-800 dark:text-white">{user.score || user.totalScore}</p>
                         </div>
                         <div className="w-10 h-10 rounded-full bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                            </svg>
                         </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </AnimatePresence>

        {useBackup && (
           <div className="mt-12 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800/30 text-center">
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                 ⚡ Technical Note: Showing Preview Data while your database is populating
              </p>
           </div>
        )}
      </div>
    </div>
  );
}