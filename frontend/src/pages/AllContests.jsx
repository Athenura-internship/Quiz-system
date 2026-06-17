import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../utils/api';
import { 
  Layout, Calendar, Clock, Plus, Search, Trash2, 
  Edit, MoreVertical, CheckCircle2, Timer, AlertCircle,
  BarChart3, ArrowRight, Filter, Layers, Settings2, X, Trash
} from 'lucide-react';

const AllContests = () => {
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDomain, setFilterDomain] = useState("All");

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const data = await apiCall("/admin/all-contests");
      if (data.success) setContests(data.data || []);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteContest = async (id) => {
    if (!window.confirm("Deleting this assessment is irreversible. Continue?")) return;
    try {
      await apiCall(`/admin/delete-contest/${id}`, { method: "DELETE" });
      setContests(prev => prev.filter(c => c._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const getStatus = (quiz) => {
    const now = new Date();
    const start = new Date(quiz.startTime);
    const expiry = new Date(quiz.expiryDate);

    if (now < start) return { 
      label: "Scheduled", 
      color: "text-amber-600", 
      bg: "bg-amber-50", 
      border: "border-amber-200",
      dot: "bg-amber-500"
    };
    if (now > expiry) return { 
      label: "Archived", 
      color: "text-slate-500", 
      bg: "bg-slate-100", 
      border: "border-slate-200",
      dot: "bg-slate-400"
    };
    return { 
      label: "Active", 
      color: "text-emerald-700", 
      bg: "bg-emerald-50", 
      border: "border-emerald-200",
      dot: "bg-emerald-500 animate-pulse"
    };
  };

  const filteredContests = contests.filter(c => {
    const title = c.contestTitle || "";
    const domain = c.domain || "";
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          domain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = filterDomain === "All" || domain === filterDomain;
    return matchesSearch && matchesDomain;
  });

  const domains = ["All", ...new Set(contests.map(c => c.domain))];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading Contests...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-fade-in">
      {/* Header with Search and Create */}
      <header className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Assessments
          </h1>
          <p className="text-slate-500 font-medium">Manage deployment parameters, schedules, and test diagnostics.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative group min-w-[280px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search assessments..."
              className="w-full h-12 pl-11 pr-12 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>
          
          <button
            onClick={() => navigate('/create-contest')}
            className="h-12 px-6 bg-blue-600 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-sm shrink-0"
          >
            <Plus size={16} />
            Create Contest
          </button>
        </div>
      </header>

      {/* Domain navigation pills */}
      <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 mr-4 text-slate-500">
          <Filter size={16} />
          <span className="text-sm font-semibold">Filter Domain</span>
        </div>
        {domains.map(domain => (
          <button
            key={domain}
            onClick={() => setFilterDomain(domain)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all
              ${filterDomain === domain 
                ? "bg-blue-100 text-blue-700 border border-blue-200" 
                : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"}`}
          >
            {domain}
          </button>
        ))}
      </div>

      {/* Grid of assessments */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredContests.map((quiz, i) => {
            const status = getStatus(quiz);
            return (
              <motion.div
                layout
                key={quiz._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                className="group relative bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between h-[300px]"
              >
                {/* Status bar */}
                <div className="flex justify-between items-start mb-4">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${status.border} ${status.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                    <span className={`text-xs font-semibold ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => navigate('/create-contest', { state: { editContest: quiz } })}
                      className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-500 transition-colors"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => deleteContest(quiz._id)}
                      className="p-2 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Body details */}
                <div className="space-y-2 mb-4 flex-1">
                  <div>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{quiz.domain}</span>
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1 leading-tight mt-2">
                      {quiz.contestTitle}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                    {quiz.description || "No description provided for this assessment."}
                  </p>
                </div>

                {/* Metadata footer */}
                <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-100 mt-auto">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                      <Calendar size={14} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</div>
                      <div className="text-sm text-slate-700 font-semibold">{new Date(quiz.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                      <Clock size={14} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration</div>
                      <div className="text-sm text-slate-700 font-semibold">{quiz.duration} mins</div>
                    </div>
                  </div>
                </div>

                {/* Metrics action button */}
                <button 
                  onClick={() => navigate(`/admin/contest-results/${quiz._id}`)}
                  className="w-full mt-4 h-10 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-700 transition-colors"
                >
                  View Submissions
                  <ArrowRight size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredContests.length === 0 && (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Layers size={24} />
          </div>
          <h3 className="text-slate-900 font-bold text-lg mb-1">No Assessments Found</h3>
          <p className="text-slate-500 text-sm">Create a new assessment to get started.</p>
        </div>
      )}
    </div>
  );
};

export default AllContests;