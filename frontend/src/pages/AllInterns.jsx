import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiCall } from '../utils/api';
import { 
  Users, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  ShieldAlert,
  UserCheck,
  UserMinus,
  ChevronRight,
  MoreVertical,
  X,
  Layout,
  Layers,
  ArrowRight
} from 'lucide-react';

const AllInterns = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDomain, setFilterDomain] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingIntern, setEditingIntern] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    fetchInterns();
  }, []);

  const fetchInterns = async () => {
    setLoading(true);
    setDataError(null);
    try {
      const res = await apiCall("/admin/all-interns");
      const internsData = res?.data?.data || res?.data?.interns || res?.data?.users || res?.data || res || [];
      setInterns(Array.isArray(internsData) ? internsData : []);
    } catch (error) {
      setDataError("Failed to fetch intern data. Ensure backend services are operational.");
      setInterns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this intern? This action cannot be undone.')) {
      try {
        await apiCall(`/admin/delete-intern?uniqueId=${encodeURIComponent(id)}`, { method: "DELETE" });
        setInterns(interns.filter(i => i.uniqueId !== id));
      } catch (error) {
        alert(error.message || 'Deletion failed');
      }
    }
  };

  const handleEdit = (intern) => {
    setEditingIntern({ 
      ...intern, 
      joiningDate: intern.joiningDate ? new Date(intern.joiningDate).toISOString().split('T')[0] : "" 
    });
    setIsEditModalOpen(true);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setIsSavingEdit(true);
    try {
      await apiCall(`/admin/update-intern`, {
        method: "PUT",
        body: JSON.stringify(editingIntern)
      });
      setInterns(interns.map(intern => intern.uniqueId === editingIntern.uniqueId ? { ...editingIntern } : intern));
      setIsEditModalOpen(false);
      setEditingIntern(null);
    } catch (error) {
      alert(error.message || 'Update failed');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    if (newStatus === 'Inactive' && !window.confirm('Deactivate this intern?')) return;

    setUpdatingStatus(id);
    try {
      await apiCall("/admin/update-status", {
        method: "PATCH",
        body: JSON.stringify({ uniqueId: id, status: newStatus }),
      });
      setInterns(interns.map(intern => intern.uniqueId === id ? { ...intern, status: newStatus } : intern));
    } catch (error) {
      alert(error.message || 'Status update failed');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filteredInterns = interns.filter((intern) => {
    const searchText = searchTerm.toLowerCase();
    const name = (intern.name || intern.fullName || intern.username || "").toLowerCase();
    const email = (intern.email || "").toLowerCase();
    const uniqueId = (intern.uniqueId || "").toLowerCase();
    const domain = (intern.domain || "").toLowerCase();

    const matchesSearch = name.includes(searchText) || email.includes(searchText) || uniqueId.includes(searchText) || domain.includes(searchText);
    const matchesDomain = filterDomain === 'All' || (intern.domain || "") === filterDomain;
    const matchesStatus = filterStatus === 'All' || intern.status === filterStatus;
    
    return matchesSearch && matchesDomain && matchesStatus;
  });

  const domains = [
    "All", 
    "Data Science & Analytics", 
    "Frontend Developer", 
    "Backend Developer", 
    "Machine Learning", 
    "Cyber Security",
    "Full Stack Development"
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading Intern Database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
             Intern Directory
          </h1>
          <p className="text-slate-500 font-medium">Manage access, status, and details for all candidates.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
           <div className="relative group w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search candidates..."
                className="w-full h-12 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>
      </div>

      {/* Roster filter bars */}
      <div className="flex flex-wrap items-center gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
         <div className="flex items-center gap-2 mr-2 text-slate-500">
            <Filter className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Filters</span>
         </div>
         
         <select
            value={filterDomain}
            onChange={(e) => setFilterDomain(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 transition-all cursor-pointer"
         >
            {domains.map(d => <option key={d} value={d}>{d}</option>)}
         </select>

         <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 transition-all cursor-pointer"
         >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
         </select>

         <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100 text-blue-700">
            <span className="text-xs font-bold uppercase tracking-wider">Total Active: {interns.filter(i => i.status === 'Active').length}</span>
         </div>
      </div>

      {/* Directory Table */}
      {dataError ? (
        <div className="py-16 text-center bg-red-50 rounded-3xl border border-red-200 shadow-sm">
           <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
           <h2 className="text-xl font-bold text-slate-900 mb-2">Connection Failed</h2>
           <p className="text-slate-600 max-w-sm mx-auto mb-6">{dataError}</p>
           <button onClick={fetchInterns} className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-50 transition-colors shadow-sm">Try Again</button>
        </div>
      ) : filteredInterns.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Candidate</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Unique ID</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Domain</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInterns.map((intern, index) => (
                  <motion.tr 
                    key={intern.uniqueId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                          {(intern.name || intern.fullName || "A").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {intern.name || intern.fullName || "Intern"}
                          </p>
                          <p className="text-xs font-medium text-slate-500 mt-0.5">
                            {intern.email || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                       <span className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md">
                          {intern.uniqueId}
                       </span>
                    </td>
                    <td className="py-4 px-6">
                       <p className="text-xs font-semibold text-slate-700">{intern.domain || "General"}</p>
                    </td>
                    <td className="py-4 px-6">
                       <button 
                         onClick={() => toggleStatus(intern.uniqueId, intern.status)}
                         disabled={updatingStatus === intern.uniqueId}
                         className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors
                           ${intern.status === 'Active' 
                             ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' 
                             : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'}`}
                       >
                         {updatingStatus === intern.uniqueId ? (
                           <div className="w-3 h-3 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin" />
                         ) : intern.status === 'Active' ? (
                           <UserCheck className="w-3 h-3" />
                         ) : (
                           <UserMinus className="w-3 h-3" />
                         )}
                         {intern.status}
                       </button>
                    </td>
                    <td className="py-4 px-6 text-center">
                       <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleEdit(intern)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                          >
                             <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(intern.uniqueId)}
                            className="p-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                          >
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm">
           <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Layers className="w-8 h-8 text-slate-400" />
           </div>
           <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">No candidates found.</p>
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsEditModalOpen(false)}
               className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
             />
             
             <motion.div
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden"
             >
                <div className="p-8 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                   <div>
                     <h2 className="text-xl font-bold text-slate-900">
                        Edit Candidate
                     </h2>
                     <p className="text-xs font-semibold text-slate-500 mt-1">ID: {editingIntern?.uniqueId}</p>
                   </div>
                   <button 
                      onClick={() => setIsEditModalOpen(false)}
                      className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                   </button>
                </div>

                <form onSubmit={saveEdit} className="p-8 space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                         <label className="text-xs font-bold text-slate-700 mb-1 block">Full Name</label>
                         <input 
                           type="text" 
                           required
                           value={editingIntern?.name || ''}
                           onChange={(e) => setEditingIntern({...editingIntern, name: e.target.value})}
                           className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                         />
                      </div>
                      <div>
                         <label className="text-xs font-bold text-slate-700 mb-1 block">Email</label>
                         <input 
                           type="email" 
                           required
                           value={editingIntern?.email || ''}
                           onChange={(e) => setEditingIntern({...editingIntern, email: e.target.value})}
                           className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                         />
                      </div>
                      <div>
                         <label className="text-xs font-bold text-slate-700 mb-1 block">Mobile</label>
                         <input 
                           type="tel" 
                           required
                           value={editingIntern?.mobile || ''}
                           onChange={(e) => setEditingIntern({...editingIntern, mobile: e.target.value})}
                           className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                         />
                      </div>
                      <div>
                         <label className="text-xs font-bold text-slate-700 mb-1 block">Domain</label>
                         <select 
                           value={editingIntern?.domain || ''}
                           onChange={(e) => setEditingIntern({...editingIntern, domain: e.target.value})}
                           className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all cursor-pointer"
                         >
                           {domains.filter(d => d !== 'All').map(d => <option key={d} value={d}>{d}</option>)}
                         </select>
                      </div>
                      <div>
                         <label className="text-xs font-bold text-slate-700 mb-1 block">Joining Date</label>
                         <input 
                           type="date" 
                           required
                           value={editingIntern?.joiningDate || ''}
                           onChange={(e) => setEditingIntern({...editingIntern, joiningDate: e.target.value})}
                           className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                         />
                      </div>
                   </div>

                   <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                      <button 
                        type="button"
                        onClick={() => setIsEditModalOpen(false)}
                        className="px-6 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        disabled={isSavingEdit}
                        className="px-6 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        {isSavingEdit ? (
                           <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AllInterns;
