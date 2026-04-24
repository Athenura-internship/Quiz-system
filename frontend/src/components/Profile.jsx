import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { apiCall } from "../utils/api";

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            try {
                // 1. Get base user from local storage
                const userStr = localStorage.getItem("user");
                const storedUser = userStr ? JSON.parse(userStr) : null;
                
                // If user is Admin, they don't have intern stats, so skip fetching
                if (storedUser?.role === 'admin') {
                    setUser(storedUser);
                    setLoading(false);
                    return;
                }

                // 2. Fetch real-time stats from backend
                const statsResponse = await apiCall("/quiz/stats");
                
                if (statsResponse && statsResponse.success) {
                    const internData = statsResponse.data || {};
                    console.log("Intern profile API response:", internData);
                    setStats(internData);

                    const phoneNumber = 
                        internData?.phoneNumber || internData?.phone || internData?.mobile || internData?.mobileNumber || internData?.contact || internData?.contactNumber ||
                        internData?.user?.phoneNumber || internData?.user?.phone || internData?.user?.mobile || internData?.user?.mobileNumber ||
                        internData?.intern?.phoneNumber || internData?.intern?.phone || internData?.intern?.mobile || internData?.intern?.mobileNumber ||
                        storedUser?.phoneNumber || storedUser?.phone || storedUser?.mobile || storedUser?.mobileNumber || storedUser?.contact || storedUser?.contactNumber || "N/A";
                        
                    const joiningDateRaw = 
                        internData.joiningDate || internData.joining_date || internData.registrationDate || internData.createdAt ||
                        storedUser?.joiningDate || storedUser?.joining_date || storedUser?.createdAt || null;

                    console.log("Mapped phone number:", phoneNumber);
                    console.log("Mapped joining date:", joiningDateRaw);

                    // Update user state with merged info from backend API
                    setUser({
                        ...storedUser,
                        uniqueId: internData.uniqueId || storedUser?.uniqueId || storedUser?.id,
                        fullName: internData.name || storedUser?.userName || "Intern",
                        email: internData.email || storedUser?.email,
                        mobile: phoneNumber,
                        role: internData.role || storedUser?.role,
                        domain: internData.domain || storedUser?.domain,
                        badgesEarned: internData.badgesEarned,
                        totalScore: internData.totalScore,
                        status: internData.status || storedUser?.status,
                        joiningDate: joiningDateRaw
                    });
                } else {
                    setUser(storedUser);
                }
            } catch (err) {
                console.error("Failed to fetch profile stats:", err);
                const userStr = localStorage.getItem("user");
                setUser(userStr ? JSON.parse(userStr) : null);
                setError("Could not load real-time rankings. Showing local data.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[70vh] w-full font-sans">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-800 border-t-sky-500 rounded-full animate-spin"></div>
                    <p className="text-slate-500 text-sm font-semibold animate-pulse">Synchronizing Profile...</p>
                </div>
            </div>
        );
    }

    if (!user) return (
        <div className="text-center py-20">
            <p className="text-slate-500 font-bold">Please log in to view your profile.</p>
            <button onClick={() => navigate('/login')} className="mt-4 px-6 py-2 bg-sky-500 text-white rounded-xl">Go to Login</button>
        </div>
    );

    const avatarInitial = (user.fullName || user.userName || "U").charAt(0).toUpperCase();

    return (
        <div className="w-full h-full p-4 sm:p-6 lg:p-8 font-sans overflow-x-hidden relative">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-200/80 dark:border-slate-700/50 p-8 md:p-12 transition-colors duration-300"
            >
                {/* Header Section */}
                <div className="mb-12">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent mb-2 tracking-tight">
                        My Profile
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm tracking-wide">
                        Securely manage your intern identity and track your platform achievements.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* LEFT COLUMN: HERO SUMMARY */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-700/50 flex flex-col items-center text-center group transition-all hover:shadow-lg">
                            <div className="relative mb-6">
                                <div className="w-32 h-32 rounded-3xl bg-white dark:bg-slate-800 border-2 border-sky-100 dark:border-sky-900 flex items-center justify-center text-slate-700 dark:text-slate-200 font-black text-5xl shadow-xl shadow-sky-500/5 group-hover:rotate-3 transition-transform duration-500">
                                   {avatarInitial}
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full flex items-center justify-center shadow-lg">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4"/></svg>
                                </div>
                            </div>
                            
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-1 tracking-tight">
                                {user.fullName || user.userName}
                            </h2>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 font-black mb-6">
                                {user.id || user.uniqueId}
                            </p>

                            <div className="w-full flex gap-3 justify-center mb-8">
                                <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-center flex-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Badges</p>
                                    <p className="text-lg font-black text-amber-500">{stats?.badgesEarned || 0} 🏆</p>
                                </div>
                                <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-center flex-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Points</p>
                                    <p className="text-lg font-black text-sky-500">{stats?.totalScore || 0}</p>
                                </div>
                            </div>

                            <div className="w-full space-y-3">
                                <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                    <span className="text-xs font-bold text-slate-500">Global Rank</span>
                                    <span className="text-sm font-black text-slate-800 dark:text-white">#{stats?.overallRank || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                    <span className="text-xs font-bold text-slate-500">{stats?.domain || "Domain"} Rank</span>
                                    <span className="text-sm font-black text-indigo-500">#{stats?.domainRank || "N/A"}</span>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-800/30 text-center">
                               <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest leading-relaxed">
                                 ⚡ {error}
                               </p>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: DETAILED INFO */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        
                        {/* ── SECTION: IDENTITY ── */}
                        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-700/50">
                            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                                <div className="w-2 h-6 bg-sky-500 rounded-full"></div>
                                Personal Identity
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Full Name</label>
                                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-bold shadow-sm">
                                        {user.fullName || user.userName}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Email Address</label>
                                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-bold shadow-sm truncate">
                                        {user.email || user.userEmail}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Unique Identification</label>
                                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-bold shadow-sm">
                                        {user.id || user.uniqueId}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Phone Number</label>
                                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-bold shadow-sm">
                                        {user.mobile || user.phone || user.phoneNumber || user.contactNumber || "N/A"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── SECTION: PLACEMENT ── */}
                        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] p-8 border border-slate-200/40 dark:border-slate-700/50">
                            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                                <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
                                Internship & Specialization
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Assigned Domain</label>
                                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                        <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></div>
                                        <span className="text-slate-800 dark:text-slate-100 font-black uppercase text-sm">
                                            {user.domain}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Joining Date</label>
                                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-bold shadow-sm">
                                        {(() => {
                                            const jDate = user.joiningDate || user.joining_date || user.registrationDate || user.createdAt;
                                            if (!jDate) return "N/A";
                                            if (typeof jDate === "string" && jDate.includes("-") && jDate.length <= 10) {
                                                return jDate;
                                            }
                                            const d = new Date(jDate);
                                            if (isNaN(d.getTime())) return "N/A";
                                            const day = String(d.getDate()).padStart(2, '0');
                                            const month = String(d.getMonth() + 1).padStart(2, '0');
                                            return `${day}-${month}-${d.getFullYear()}`;
                                        })()}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Professional Role</label>
                                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-bold shadow-sm uppercase">
                                        {user.role}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Account Status</label>
                                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-black text-sm flex items-center gap-2 shadow-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                        {user.status || "ACTIVE"}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer Disclaimer */}
                <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        Athenura Professional ID System
                    </p>
                    <button className="text-xs font-black text-sky-500 hover:text-sky-600 uppercase tracking-widest transition-colors flex items-center gap-2">
                        Request Profile Update
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ProfilePage;