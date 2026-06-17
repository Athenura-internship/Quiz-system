import React, { useState, useEffect } from 'react';
import { apiCall } from '../utils/api';
import { Search, Trophy, Medal, Star, ChevronRight, Activity } from 'lucide-react';

const LeaderboardTable = ({ initialTab = 'overall', initialDomain = '', hideControls = false }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let endpoint = "/leaderboard/overall";
        if (initialTab === 'domain' && initialDomain) {
          endpoint = `/leaderboard/domain/${initialDomain}`;
        }
        
        const response = await apiCall(endpoint);
        if (response && response.success) {
          setLeaderboardData(response.data.slice(0, 10)); 
        }
      } catch (err) {
        console.error("Leaderboard fetch failed:", err);
        setError("Neural link disruption. Could not load standings.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [initialTab, initialDomain]);

  const filteredInterns = leaderboardData.filter(intern => 
    intern.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    intern.uniqueId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="glass-card rounded-[40px] border-white/5 p-20 text-center flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin glow-blue mb-6" />
        <p className="text-xs font-black uppercase tracking-[0.4em] text-white/20">Syncing Standings...</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-[40px] border-white/5 overflow-hidden flex flex-col glow-blue">
      {!hideControls && (
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="relative group w-full md:w-80">
            <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search nodes by identity..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white/5 border-2 border-white/10 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary/50 focus:bg-white/10 transition-all placeholder:text-white/10" 
            />
          </div>
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Sort Protocol:</span>
             <span className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase">Rank_Asc</span>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              <th className="px-8 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] w-24 text-center">Position</th>
              <th className="px-8 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Identity</th>
              <th className="px-8 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] text-center">Sector</th>
              <th className="px-8 py-6 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] text-right">Badges</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredInterns.map((intern, index) => (
              <tr key={intern.uniqueId || index} className="group hover:bg-white/5 transition-all duration-300">
                <td className="px-8 py-6 text-center">
                  <div className="flex justify-center">
                    {index === 0 ? (
                      <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-black text-lg shadow-lg glow-blue border border-primary/30">1</div>
                    ) : index === 1 ? (
                      <div className="w-10 h-10 rounded-xl bg-accent-cyan/20 text-accent-cyan flex items-center justify-center font-black text-lg shadow-lg glow-cyan border border-accent-cyan/30">2</div>
                    ) : index === 2 ? (
                      <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center font-black text-lg shadow-lg border border-white/20">3</div>
                    ) : (
                      <span className="font-bold text-white/20 group-hover:text-white/40 transition-colors text-lg">{index + 1}</span>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-white/40 group-hover:bg-primary group-hover:text-white transition-all">
                      {intern.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-white uppercase tracking-tight group-hover:luminous-text transition-all">{intern.name}</p>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{intern.uniqueId}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                    <span className="px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-white/5 border border-white/10 text-white/40 group-hover:text-accent-cyan group-hover:border-accent-cyan/20 transition-all">
                      {intern.domain}
                    </span>
                </td>
                <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3 font-black text-white group-hover:text-primary transition-colors">
                        <span className="text-xl">{intern.badgesEarned}</span>
                        <Trophy className={`w-5 h-5 transition-all ${index < 3 ? "text-primary" : "text-white/10 group-hover:text-primary"}`} />
                    </div>
                </td>
              </tr>
            ))}
            
            {(filteredInterns.length === 0 && !error) && (
                <tr>
                  <td colSpan="4" className="text-center py-20">
                    <Activity className="w-12 h-12 text-white/5 mx-auto mb-4" />
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-white/20">No matching nodes found in sector.</p>
                  </td>
                </tr>
            )}

            {error && (
                <tr>
                  <td colSpan="4" className="text-center py-20 text-red-500/50 font-black uppercase tracking-widest text-xs">
                    {error}
                  </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardTable;
