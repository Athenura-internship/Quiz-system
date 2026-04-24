import React, { useState, useEffect } from 'react';
import SidePromoCard from '../components/SidePromoCard';
import LeaderboardTable from '../components/LeaderboardTable';
import { apiCall } from '../utils/api';

const InternDashboard = () => {
  const [activeTableConfig, setActiveTableConfig] = useState(null);
  const [internStats, setInternStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const storedUserStr = localStorage.getItem("user");
        const storedUser = storedUserStr ? JSON.parse(storedUserStr) : null;
        if (storedUser?.role === 'admin') {
           setError("Admin accounts do not have intern performance data.");
           return;
        }

        const response = await apiCall("/quiz/stats");
        if (response && response.success) {
          setInternStats(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch intern stats:", err);
        setError("Could not load performance data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleShowOverall = () => {
    if (!internStats) return;
    setActiveTableConfig(prev => prev?.tab === 'overall' ? null : { tab: 'overall', domain: internStats.domain });
  };

  const handleShowDomain = () => {
    if (!internStats) return;
    setActiveTableConfig(prev => prev?.tab === 'domain' ? null : { tab: 'domain', domain: internStats.domain });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (error || !internStats) {
    return (
      <div className="p-8 text-center bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/30">
        <p className="text-red-500 font-bold">{error || "Something went wrong."}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-sky-500 font-bold hover:underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-sans">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-[clamp(1.75rem,5vw,2.5rem)] font-bold text-slate-800 dark:text-slate-100 mb-2">Hello, {internStats.name.split(' ')[0]} ✨</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Track your progress and rankings internally.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              onClick={handleShowOverall}
              className={`bg-white dark:bg-slate-900 rounded-3xl border border-sky-100/50 dark:border-sky-900/50 shadow-sm ${activeTableConfig?.tab === 'overall' ? 'border-sky-500 ring-2 ring-sky-500/30 shadow-xl' : 'hover:shadow-lg hover:-translate-y-1 hover:border-sky-200'} p-8 relative overflow-hidden transition-all cursor-pointer group`}>
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-sky-50/80 dark:bg-sky-500/10 rounded-full group-hover:scale-110 transition-transform blur-2xl"></div>
              <div className="flex justify-between items-start mb-6 align-top">
                <div className="w-14 h-14 xl:w-14 xl:h-14 lg:w-10 lg:h-10 rounded-2xl bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 flex justify-center items-center">
                  <svg className="w-7 h-7 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span className="bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-sky-100 dark:border-sky-800/30">Across Platform</span>
              </div>
              <div>
                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">Overall Rank</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-[clamp(2.5rem,10vw,4.5rem)] lg:text-3xl font-black text-slate-800 dark:text-white">#{internStats.overallRank}</span>
                  <span className="text-slate-400 font-medium">/ {internStats.totalInterns}</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm">
                 <span className="text-green-500 flex items-center font-bold text-xs lg:text-[10px] xl:text-xs">
                   Competing well
                 </span>
                 <span className="text-sky-500 font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                   View Top 10 <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                 </span>
              </div>
            </div>

            <div 
              onClick={handleShowDomain}
              className={`bg-white dark:bg-slate-900 rounded-3xl border border-sky-100/50 dark:border-sky-900/50 shadow-sm ${activeTableConfig?.tab === 'domain' ? 'border-sky-500 ring-2 ring-sky-500/30 shadow-xl' : 'hover:shadow-lg hover:-translate-y-1 hover:border-sky-200'} p-8 relative overflow-hidden transition-all cursor-pointer group`}>
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-sky-50/80 dark:bg-sky-500/10 rounded-full group-hover:scale-110 transition-transform blur-2xl"></div>
               <div className="flex justify-between items-start mb-6 align-top">
                <div className="w-14 h-14 xl:w-14 xl:h-14 lg:w-10 lg:h-10 rounded-2xl bg-sky-50 dark:bg-sky-900/20 text-sky-500 dark:text-sky-400 border border-sky-100 dark:border-sky-800/30 flex justify-center items-center">
                  <svg className="w-7 h-7 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700">Domain View</span>
              </div>
              <div>
                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">{internStats.domain} Rank</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-[clamp(2.5rem,10vw,4.5rem)] lg:text-3xl font-black text-sky-500 dark:text-sky-400">#{internStats.domainRank}</span>
                  <span className="text-slate-400 font-medium">/ {internStats.domainInterns}</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm">
                 <span className="text-yellow-500 flex items-center font-bold text-xs lg:text-[10px] xl:text-xs font-bold">
                   Holding steady
                 </span>
                 <span className="text-sky-500 font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                   View Top 10 <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                 </span>
              </div>
            </div>
          </div>

          {activeTableConfig ? (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300 ease-out">
               <LeaderboardTable key={activeTableConfig.tab} initialTab={activeTableConfig.tab} initialDomain={activeTableConfig.domain} hideControls={true} />
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-sky-100/50 dark:border-sky-900/50 shadow-sm p-6 lg:p-8 flex flex-col sm:flex-row items-center sm:justify-between gap-6 text-center sm:text-left">
                   <div>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Score</p>
                      <p className="text-3xl font-black text-slate-700 dark:text-slate-100">{internStats.totalScore} <span className="text-lg font-medium text-slate-400">pts</span></p>
                   </div>
                   <div className="h-px w-full sm:w-px sm:h-16 bg-slate-100 dark:bg-slate-800"></div>
                   <div>
                      <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Recent Quiz</p>
                      <p className="text-xl font-bold text-slate-700 dark:text-slate-100">{internStats.recentScore}%</p>
                   </div>
                   <div className="h-16 w-px bg-slate-100 dark:bg-slate-800 hidden md:block"></div>
                   <div className="hidden md:block">
                      <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Badges Earned</p>
                      <p className="text-xl font-bold text-sky-500 dark:text-sky-400">{internStats.badgesEarned} 🏆</p>
                   </div>
              </div>
              
              <div className="bg-sky-50/50 dark:bg-sky-900/10 rounded-2xl border border-sky-100 dark:border-sky-800/30 p-8 text-center flex flex-col items-center justify-center flex-1">
                  <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-4">
                      <span className="text-2xl">👇</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Want to see the competition?</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md">Click on either of your Rank cards above to expand the live standings and see where you stand.</p>
              </div>
            </>
          )}

        </div>

        <div className="flex flex-col gap-6">
          <SidePromoCard />
        </div>
      </div>
    </div>
  );
};

export default InternDashboard;
