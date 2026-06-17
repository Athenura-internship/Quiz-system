import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiCall } from '../utils/api';
import SidePromoCard from '../components/SidePromoCard';
import LeaderboardTable from '../components/LeaderboardTable';
import { 
  Trophy, Globe, Briefcase, Zap, Star, ArrowUpRight, Activity, Download, 
  Calendar, User, Compass, CheckCircle2, Clock, ChevronRight, Flame, Grid, 
  Award, Sparkles, TrendingUp
} from 'lucide-react';

const InternDashboard = () => {
  const [activeTableConfig, setActiveTableConfig] = useState(null);
  const [internStats, setInternStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const storedUserStr = localStorage.getItem("user");
        const storedUser = storedUserStr ? JSON.parse(storedUserStr) : null;
        if (storedUser?.role === 'admin') {
           setError("Administrative accounts do not possess intern-specific performance metrics.");
           return;
        }

        const statsResponse = await apiCall("/quiz/stats");
        if (statsResponse && statsResponse.success) {
          setInternStats(statsResponse.data);
        }

        const historyResponse = await apiCall("/quiz/history");
        if (historyResponse && historyResponse.success) {
          setHistory(historyResponse.history || []);
        }

        const upcomingResponse = await apiCall("/quiz/upcoming-quizzes");
        if (upcomingResponse && upcomingResponse.success) {
          setUpcoming(upcomingResponse.data || []);
        }

      } catch (err) {
        console.error("Failed to fetch intern dashboard data:", err);
        setError("Failed to load performance data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleShowOverall = () => {
    if (!internStats) return;
    setActiveTableConfig(prev => prev?.tab === 'overall' ? null : { tab: 'overall', domain: internStats.domain });
  };

  const handleShowDomain = () => {
    if (!internStats) return;
    setActiveTableConfig(prev => prev?.tab === 'domain' ? null : { tab: 'domain', domain: internStats.domain });
  };

  const calculateAccuracy = () => {
    if (!history || history.length === 0) return 0;
    const totalCorrect = history.reduce((sum, item) => sum + (item.score || 0), 0);
    const totalQ = history.reduce((sum, item) => sum + (item.totalQuestions || 0), 0);
    return totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;
  };

  const overallAccuracy = calculateAccuracy();

  const handleDownloadReport = () => {
    const printWindow = window.open('', '_blank');
    const content = `
      <html>
        <head>
          <title>Performance Report - ${internStats?.name}</title>
          <style>
            body { font-family: 'Inter', sans-serif; background-color: #F8F9FA; padding: 40px; color: #1E293B; }
            .header { border-bottom: 2px solid #E2E8F0; padding-bottom: 20px; margin-bottom: 40px; }
            .title { font-size: 28px; font-weight: 800; }
            .stats-grid { display: grid; grid-template-cols: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
            .card { background: white; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; }
            .card p { font-size: 12px; color: #64748B; margin: 0 0 8px 0; font-weight: 600; }
            .card h3 { font-size: 24px; margin: 0; font-weight: 700; }
            .table-container { background: white; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; }
            table { width: 100%; border-collapse: collapse; text-align: left; }
            th { background: #F1F5F9; padding: 16px; font-size: 12px; font-weight: 600; color: #475569; }
            td { padding: 16px; border-top: 1px solid #E2E8F0; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">Performance Transcript</h1>
            <p><strong>Candidate:</strong> ${internStats?.name} (${internStats?.uniqueId})</p>
            <p><strong>Domain:</strong> ${internStats?.domain}</p>
            <p><strong>Generated On:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="stats-grid">
            <div class="card"><p>Global Ranking</p><h3>#${internStats?.overallRank}</h3></div>
            <div class="card"><p>Domain Ranking</p><h3>#${internStats?.domainRank}</h3></div>
            <div class="card"><p>Total Score</p><h3>${internStats?.totalScore}</h3></div>
            <div class="card"><p>Avg Accuracy</p><h3>${overallAccuracy}%</h3></div>
          </div>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Assessment Title</th>
                  <th>Domain</th>
                  <th>Score</th>
                  <th>Questions</th>
                  <th>Date Attempted</th>
                </tr>
              </thead>
              <tbody>
                ${history.map(item => `
                  <tr>
                    <td><strong>${item.contestId?.contestTitle || 'N/A'}</strong></td>
                    <td>${item.domain || internStats?.domain}</td>
                    <td>${item.score}</td>
                    <td>${item.totalQuestions}</td>
                    <td>${new Date(item.createdAt).toLocaleDateString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading Dashboard Data...</p>
      </div>
    );
  }

  if (error || !internStats) {
    return (
      <div className="p-12 text-center bg-white border border-red-200 rounded-3xl shadow-sm">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Activity className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-4">Connection Failed</h3>
        <p className="text-slate-500 mb-8 max-w-sm mx-auto">{error || "The system encountered an unexpected error."}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-12 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
         <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="w-24 h-24 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-4xl font-bold text-blue-600">
               {internStats.name.charAt(0)}
            </div>
            
            <div className="space-y-2">
               <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                  <span className="px-3 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600">
                     {internStats.domain} Division
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    {internStats.status}
                  </span>
               </div>
               <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                  Welcome back, {internStats.name}
               </h1>
               <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> ID: {internStats.uniqueId}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Enrolled: {new Date(internStats.joiningDate).toLocaleDateString()}</span>
               </div>
            </div>
         </div>

         <button 
           onClick={handleDownloadReport}
           className="h-12 px-6 bg-white border border-slate-200 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
         >
            <Download className="w-4 h-4" />
            Download Transcript
         </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Points', val: internStats.totalScore, icon: <Star className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Assessments Done', val: history.length, icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Avg Accuracy', val: `${overallAccuracy}%`, icon: <Activity className="w-5 h-5" />, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Badges Earned', val: internStats.badgesEarned, icon: <Trophy className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between h-[140px] relative overflow-hidden"
          >
             <div className={`absolute top-4 right-4 p-2 rounded-lg ${card.bg} ${card.color}`}>
                {card.icon}
             </div>
             <div>
               <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{card.label}</p>
               <span className={`text-3xl font-bold text-slate-900 tracking-tight`}>{card.val}</span>
             </div>
          </motion.div>
        ))}
      </div>

      {/* Rankings Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div 
           onClick={handleShowOverall}
           className={`bg-white rounded-3xl p-8 border shadow-sm transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden
             ${activeTableConfig?.tab === 'overall' ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-200 hover:border-slate-300'}`}>
           <div className="absolute top-6 right-6">
             <Globe className={`w-8 h-8 ${activeTableConfig?.tab === 'overall' ? 'text-blue-500' : 'text-slate-300'}`} />
           </div>
           
           <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Global Ranking</p>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-bold text-slate-900 tracking-tight">#{internStats.overallRank}</span>
                <span className="text-lg font-medium text-slate-400">/ {internStats.totalInterns}</span>
              </div>
           </div>
           
           <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
             <span>View Global Standings</span>
             <ArrowUpRight className="w-5 h-5 text-slate-400" />
           </div>
         </div>

         <div 
           onClick={handleShowDomain}
           className={`bg-white rounded-3xl p-8 border shadow-sm transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden
             ${activeTableConfig?.tab === 'domain' ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-200 hover:border-slate-300'}`}>
           <div className="absolute top-6 right-6">
             <Briefcase className={`w-8 h-8 ${activeTableConfig?.tab === 'domain' ? 'text-blue-500' : 'text-slate-300'}`} />
           </div>
           
           <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Domain Ranking ({internStats.domain})</p>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-bold text-slate-900 tracking-tight">#{internStats.domainRank}</span>
                <span className="text-lg font-medium text-slate-400">/ {internStats.domainInterns}</span>
              </div>
           </div>
           
           <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
             <span>View Domain Standings</span>
             <ArrowUpRight className="w-5 h-5 text-slate-400" />
           </div>
         </div>
      </div>

      {/* Main Content Area - Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            {activeTableConfig ? (
               <div className="animate-fade-in">
                  <LeaderboardTable key={activeTableConfig.tab} initialTab={activeTableConfig.tab} initialDomain={activeTableConfig.domain} hideControls={true} />
               </div>
            ) : (
               <>
                 {/* Activity Heatmap Grid */}
                 <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                       <Grid className="w-5 h-5 text-slate-400" />
                       <h4 className="text-lg font-bold text-slate-900">Activity Overview</h4>
                    </div>
                    <p className="text-sm text-slate-500 mb-6">
                       Your assessment participation over recent segments.
                    </p>
                    
                    <div className="grid grid-cols-14 gap-2">
                       {Array.from({ length: 56 }).map((_, idx) => {
                          const levels = ['bg-slate-100', 'bg-blue-200', 'bg-blue-400', 'bg-blue-600'];
                          const level = idx % 9 === 0 ? levels[3] : idx % 4 === 0 ? levels[2] : idx % 3 === 0 ? levels[1] : levels[0];
                          return (
                             <div 
                               key={idx} 
                               className={`w-full aspect-square rounded-md ${level} transition-all duration-300 hover:scale-110`} 
                               title={`Activity ${idx + 1}`}
                             />
                          );
                       })}
                    </div>
                    <div className="flex items-center justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                       <span>Less Active</span>
                       <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded bg-slate-100" />
                          <span className="w-3 h-3 rounded bg-blue-200" />
                          <span className="w-3 h-3 rounded bg-blue-400" />
                          <span className="w-3 h-3 rounded bg-blue-600" />
                       </div>
                       <span>More Active</span>
                    </div>
                 </div>

                 {/* Recently Participated */}
                 <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
                    <div className="flex items-center gap-2">
                       <Flame className="w-5 h-5 text-slate-400" />
                       <h4 className="text-lg font-bold text-slate-900">Recent Assessments</h4>
                    </div>

                    <div className="space-y-4">
                       {history.length > 0 ? (
                         history.slice(0, 3).map((attempt, i) => (
                           <div 
                             key={i}
                             className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                           >
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-500">
                                    {i + 1}
                                 </div>
                                 <div>
                                    <h4 className="text-base font-bold text-slate-900">{attempt.contestId?.contestTitle || 'Assessment'}</h4>
                                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                                       {new Date(attempt.createdAt).toLocaleDateString()}
                                    </p>
                                 </div>
                              </div>

                              <div className="text-right">
                                 <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Score</p>
                                 <p className="text-lg font-bold text-slate-900">{attempt.score} <span className="text-xs text-slate-400">/ {attempt.totalQuestions}</span></p>
                              </div>
                           </div>
                         ))
                       ) : (
                         <div className="py-10 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                            <p className="text-sm font-semibold text-slate-500">No recent assessments found.</p>
                         </div>
                       )}
                    </div>
                 </div>
               </>
            )}
         </div>

         {/* Sidebar Navigation widgets */}
         <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
               <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                   <Star className="w-5 h-5 text-blue-600" />
                 </div>
                 <div>
                    <h4 className="text-base font-bold text-slate-900">Performance Insight</h4>
                 </div>
               </div>
               
               <p className="text-sm text-slate-600 leading-relaxed mb-6">
                 Your standing in the <span className="font-semibold text-slate-900">{internStats.domain}</span> division places you among the top performers. Keep completing assessments to maintain your rank.
               </p>

               <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                     <span>Profile Completion</span>
                     <span className="text-blue-600">85%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                     <div className="h-full w-[85%] bg-blue-600 rounded-full" />
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
               <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-slate-400" />
                  <h4 className="text-base font-bold text-slate-900">Upcoming</h4>
               </div>

               <div className="space-y-3">
                  {upcoming && upcoming.length > 0 ? (
                    upcoming.slice(0, 2).map((quiz) => (
                      <div key={quiz._id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
                         <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-600 mb-2">
                            {quiz.domain}
                         </span>
                         <h5 className="text-sm font-bold text-slate-900 mb-1 truncate">{quiz.contestTitle}</h5>
                         <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <span>{quiz.duration} Mins</span>
                            <span>•</span>
                            <span>{new Date(quiz.startTime).toLocaleDateString()}</span>
                         </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center text-slate-500 text-xs font-semibold">
                       No upcoming assessments.
                    </div>
                  )}
               </div>
            </div>

            <SidePromoCard />
         </div>
      </div>
    </div>
  );
};

export default InternDashboard;
