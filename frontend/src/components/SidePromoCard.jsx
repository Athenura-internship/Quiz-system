import React from 'react';
import { useNavigate } from 'react-router-dom';
import promoIllustration from '../assets/promo_illustration.png';
import { BarChart2, FileText, TrendingUp, Users, Download } from 'lucide-react';

const SidePromoCard = () => {
  const navigate = useNavigate();
  return (
    <div className="glass-card rounded-[40px] border-white/5 p-8 relative overflow-hidden h-fit group glow-blue">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full translate-x-10 -translate-y-10 blur-3xl opacity-50"></div>
      
      <div className="relative z-10 mb-8 overflow-hidden rounded-3xl border border-white/5 bg-white/5">
        <img 
          src={promoIllustration} 
          alt="Leaderboard Insights" 
          className="w-full h-auto drop-shadow-2xl group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/80 to-transparent" />
      </div>
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <BarChart2 className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Sector Insights</h3>
      </div>

      <div className="space-y-4 mb-10 relative z-10">
        {[
          { label: "Prime Domain", val: "Frontend Development", icon: <TrendingUp className="w-4 h-4 text-emerald-500" /> },
          { label: "Sync Requests", val: "12 Node Pending", icon: <Users className="w-4 h-4 text-accent-cyan" /> },
          { label: "Recent Shift", val: "Nathan Drake ↑ 3", icon: <TrendingUp className="w-4 h-4 text-primary" /> },
        ].map((item, i) => (
          <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 group/item hover:bg-white/10 transition-all">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1 group-hover/item:text-white/40 transition-colors">{item.label}</p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-white group-hover/item:text-primary transition-colors">{item.val}</p>
              {item.icon}
            </div>
          </div>
        ))}
      </div>
      
      <div className="space-y-3 relative z-10">
        <button 
          onClick={() => navigate('/reports')} 
          className="w-full luminous-gradient py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-lg glow-blue hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group"
        >
          <FileText className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          Neural Report
        </button>
        <button className="w-full glass border-white/10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-3 group">
           <Download className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
           Export Stream
        </button>
      </div>
    </div>
  );
};

export default SidePromoCard;
