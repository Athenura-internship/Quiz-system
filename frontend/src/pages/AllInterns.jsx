import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiCall } from '../utils/api';

const AllInterns = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDomain, setFilterDomain] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState(null);

  useEffect(() => {
    fetchInterns();
  }, []);

  const fetchInterns = async () => {
    setLoading(true);
    setDataError(null);
    try {
      const res = await apiCall("/admin/all-interns");
      console.log("Interns API response:", res);

      const internsData =
        res?.data?.data ||
        res?.data?.interns ||
        res?.data?.users ||
        res?.data ||
        res ||
        [];

      setInterns(Array.isArray(internsData) ? internsData : []);
    } catch (error) {
      console.error("Failed to fetch interns:", error);
      setDataError("Unable to connect to server. Please ensure the backend is running and your MongoDB IP is whitelisted.");
      setInterns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    if(window.confirm('Are you sure you want to delete this intern?')) {
      setInterns(interns.filter(i => i.uniqueId !== id));
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    
    if (newStatus === 'Inactive') {
      if (!window.confirm('Are you sure you want to mark this intern as Inactive?')) return;
    }

    setUpdatingStatus(id);
    
    try {
      await apiCall("/admin/update-status", {
        method: "PATCH",
        body: JSON.stringify({ uniqueId: id, status: newStatus }),
      });
      
      // Update local state
      setInterns(interns.map(intern => 
        intern.uniqueId === id ? { ...intern, status: newStatus } : intern
      ));
    } catch (error) {
      alert(error.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Responsive classes
  const mobileCardsClass = "md:hidden grid grid-cols-1 gap-4 pb-8";
  const tableWrapperClass = "hidden md:block overflow-hidden";

  const filteredInterns = interns.filter(intern => {
    const matchesSearch = intern.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          intern.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          intern.uniqueId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = filterDomain === 'All' || intern.domain === filterDomain;
    const matchesStatus = filterStatus === 'All' || intern.status === filterStatus;
    return matchesSearch && matchesDomain && matchesStatus;
  });

  const inputClass = "w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-700 dark:text-slate-200 shadow-sm placeholder-slate-400 dark:placeholder-slate-500";
  const selectClass = "px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-700 dark:text-slate-200 shadow-sm";

  return (
    <div className="w-full h-full p-4 sm:p-6 lg:p-8 font-sans overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-200/80 dark:border-slate-700/50 p-6 md:p-8 lg:p-10 transition-colors duration-300"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-slate-800 to-slate-900 dark:from-white dark:to-slate-100 bg-clip-text text-transparent mb-2">
              All Interns
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">
              Manage and view all enrolled interns across domains
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap w-full md:w-auto items-stretch sm:items-center">
            <div className="relative flex-1 min-w-0">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 dark:text-slate-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search interns, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${inputClass} min-w-0`}
              />
            </div>
            
            <select
              value={filterDomain}
              onChange={(e) => setFilterDomain(e.target.value)}
              className={selectClass}
            >
              <option value="All">All Domains</option>
              <option value="Data Science & Analytics">Data Science & Analytics</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Application Development">Application Development</option>
              <option value="Social Media Management">Social Media Management</option>
              <option value="Graphic Design">Graphic Design</option>
              <option value="Digital Marketing">Digital Marketing</option>
              <option value="Video Editing">Video Editing</option>
              <option value="Full Stack Development">Full Stack Development</option>
              <option value="MERN Stack Development">MERN Stack Development</option>
              <option value="Content Writing">Content Writing</option>
              <option value="Content Creator">Content Creator</option>
              <option value="UI/UX Designing">UI/UX Designing</option>
              <option value="Front-end Developer">Front-end Developer</option>
              <option value="Back-end Developer">Back-end Developer</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={selectClass}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Mobile Cards View */}
        <div className={mobileCardsClass}>
              {filteredInterns.length > 0 ? (
            filteredInterns.map((intern, index) => (
              <motion.div
                key={intern.uniqueId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200/60 dark:border-slate-700/50 hover:shadow-md transition-all"
              >
                {/* Header */}
                <div className="flex items-start gap-4 mb-4 pb-4 border-b border-slate-200/50 dark:border-slate-700">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0 mt-1">
                    {intern.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200 truncate">{intern.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{intern.email}</p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">Unique ID</span>
                    <span className="font-mono font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-xs block">
                      {intern.uniqueId}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">Domain</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{intern.domain}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">Phone</span>
                    <span className="text-slate-600 dark:text-slate-400 text-xs">{intern.mobile || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">Join Date</span>
                    <span className="text-slate-600 dark:text-slate-400">{new Date(intern.joiningDate).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${intern.status === 'Active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400'}`}>
                      {intern.status}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-700">
                  <button 
                    onClick={() => toggleStatus(intern.uniqueId, intern.status)}
                    disabled={updatingStatus === intern.uniqueId}
                    className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs border transition-all disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-1.5
                      ${intern.status === 'Active' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:border-emerald-800/50 dark:text-emerald-400' 
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400'
                      }`}
                  >
                    {updatingStatus === intern.uniqueId ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      `Toggle ${intern.status}`
                    )}
                  </button>
                  <div className="flex gap-1.5">
                    <button 
                      className="p-2.5 rounded-xl text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-all"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button 
                      className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                      title="Delete"
                      onClick={() => handleDelete(intern.uniqueId)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-1 text-center py-12 text-slate-500 dark:text-slate-400">
              <p className="text-lg font-medium mb-2">{loading ? 'Loading interns...' : 'No interns found'}</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className={tableWrapperClass}>
            {dataError ? (
              <div className="text-center py-20 px-6">
                <div className="text-5xl mb-6">📡</div>
                <h2 className="text-xl font-bold text-red-500 mb-2">Connection Issue Detected</h2>
                <p className="text-slate-500 max-w-md mx-auto mb-8">{dataError}</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button 
                    onClick={fetchInterns}
                    className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:shadow-lg transition-all"
                  >
                    Retry Connection
                  </button>
                  <a 
                    href="https://www.mongodb.com/docs/atlas/security-whitelist/" 
                    target="_blank" 
                    rel="noreferrer"
                    className="px-8 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm flex items-center justify-center"
                  >
                    Check Whitelist Guide
                  </a>
                </div>
              </div>
            ) : filteredInterns.length > 0 ? (
              <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100/50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                        <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider">Intern Detail</th>
                        <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider">Unique ID</th>
                        <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider">Phone</th>
                        <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider">Domain</th>
                        <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider">Joining Date</th>
                        <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider">Status</th>
                        <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
                      {filteredInterns.map((intern, index) => (
                        <motion.tr 
                          key={intern.uniqueId} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors"
                        >
                          <td className="py-3 px-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold shadow-sm">
                                {intern.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{intern.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{intern.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 sm:px-6">
                            <span className="text-sm font-medium font-mono text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-md">
                              {intern.uniqueId}
                            </span>
                          </td>
                          <td className="py-3 px-4 sm:px-6 text-sm text-slate-600 dark:text-slate-400">{intern.mobile || 'N/A'}</td>
                          <td className="py-3 px-4 sm:px-6 text-sm font-medium text-slate-700 dark:text-slate-300">{intern.domain}</td>
                          <td className="py-3 px-4 sm:px-6 text-sm text-slate-600 dark:text-slate-400">{new Date(intern.joiningDate).toLocaleDateString()}</td>
                          <td className="py-3 px-4 sm:px-6">
                            <button 
                              onClick={() => toggleStatus(intern.uniqueId, intern.status)}
                              disabled={updatingStatus === intern.uniqueId}
                              className={`flex items-center justify-center min-w-[80px] px-3 py-1 rounded-full text-xs font-bold border transition-all disabled:opacity-75 disabled:cursor-not-allowed
                              ${intern.status === 'Active' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50 dark:hover:bg-emerald-900/40' 
                                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-700'
                              }`}
                            >
                              {updatingStatus === intern.uniqueId ? (
                                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                intern.status.toUpperCase()
                              )}
                            </button>
                          </td>
                          <td className="py-3 px-4 sm:px-6 text-center">
                            <div className="flex items-center justify-center gap-2">
                               <button 
                                 className="p-2 rounded-lg text-slate-400 hover:text-sky-600 border border-transparent hover:border-sky-200 hover:bg-sky-50 dark:hover:border-sky-800 dark:hover:bg-sky-900/30 transition-all"
                                 title="View/Edit"
                               >
                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                 </svg>
                               </button>
                               <button 
                                 className="p-2 rounded-lg text-slate-400 hover:text-red-600 border border-transparent hover:border-red-200 hover:bg-red-50 dark:hover:border-red-800 dark:hover:bg-red-900/30 transition-all"
                                 title="Delete"
                                 onClick={() => handleDelete(intern.uniqueId)}
                               >
                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                 </svg>
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
              <div className="py-12 text-center text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                {loading ? (
                  <div className="flex flex-col items-center gap-4 py-8">
                    <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Fetching Platform Interns...</p>
                  </div>
                ) : (
                  <>
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">No interns found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </>
                )}
              </div>
            )}
        </div>
      </motion.div>
    </div>
  );
};

export default AllInterns;
