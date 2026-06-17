import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { apiCall } from "../utils/api";
import { User, Mail, Hash, Phone, Briefcase, Calendar, ShieldCheck, Trophy, Star } from "lucide-react";

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
                    setStats(internData);

                    const phoneNumber = 
                        internData?.phoneNumber || internData?.phone || internData?.mobile || internData?.mobileNumber || internData?.contact || internData?.contactNumber ||
                        internData?.user?.phoneNumber || internData?.user?.phone || internData?.user?.mobile || internData?.user?.mobileNumber ||
                        internData?.intern?.phoneNumber || internData?.intern?.phone || internData?.intern?.mobile || internData?.intern?.mobileNumber ||
                        storedUser?.phoneNumber || storedUser?.phone || storedUser?.mobile || storedUser?.mobileNumber || storedUser?.contact || storedUser?.contactNumber || "N/A";
                        
                    const joiningDateRaw = 
                        internData.joiningDate || internData.joining_date || internData.registrationDate || internData.createdAt ||
                        storedUser?.joiningDate || storedUser?.joining_date || storedUser?.createdAt || null;

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
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-sm font-semibold text-slate-500">Loading Profile...</p>
            </div>
        );
    }

    if (!user) return (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-slate-200 shadow-sm max-w-lg mx-auto mt-10">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
               <User className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Not Logged In</h2>
            <p className="text-slate-500 mb-8 font-medium">Please log in to view your profile details.</p>
            <button onClick={() => navigate('/login')} className="px-6 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
              Go to Login
            </button>
        </div>
    );

    const avatarInitial = (user.fullName || user.userName || "U").charAt(0).toUpperCase();

    const formatDate = (jDate) => {
        if (!jDate) return "N/A";
        if (typeof jDate === "string" && jDate.includes("-") && jDate.length <= 10) {
            return jDate;
        }
        const d = new Date(jDate);
        if (isNaN(d.getTime())) return "N/A";
        return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-fade-in">
            {/* Header Section */}
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    My Profile
                </h1>
                <p className="text-slate-500 font-medium mt-1">Manage your identity and track your platform achievements.</p>
            </header>

            {error && (
                <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-700">
                    <span className="font-semibold text-sm">{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Summary Card */}
                <div className="lg:col-span-1 space-y-6">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center flex flex-col items-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-50 to-white"></div>
                        
                        <div className="relative mb-6 mt-4">
                            <div className="w-32 h-32 rounded-3xl bg-blue-100 border-4 border-white flex items-center justify-center text-blue-700 font-bold text-5xl shadow-md z-10 relative">
                               {avatarInitial}
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center shadow-sm z-20">
                                <ShieldCheck className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        
                        <h2 className="text-2xl font-bold text-slate-900 mb-1 z-10">
                            {user.fullName || user.userName}
                        </h2>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider mb-6 z-10">
                            {user.domain || "Intern"}
                        </span>

                        {stats && (
                            <div className="grid grid-cols-2 gap-4 w-full border-t border-slate-100 pt-6">
                                <div className="text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Badges</p>
                                    <div className="flex items-center justify-center gap-1.5">
                                        <Trophy className="w-4 h-4 text-amber-500" />
                                        <span className="text-xl font-bold text-slate-900">{stats?.badgesEarned || 0}</span>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Points</p>
                                    <div className="flex items-center justify-center gap-1.5">
                                        <Star className="w-4 h-4 text-blue-500" />
                                        <span className="text-xl font-bold text-slate-900">{stats?.totalScore || 0}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {stats && (
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Rankings</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <span className="text-sm font-semibold text-slate-500">Global Rank</span>
                                    <span className="text-lg font-bold text-slate-900">#{stats?.overallRank || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                    <span className="text-sm font-semibold text-blue-700">Domain Rank</span>
                                    <span className="text-lg font-bold text-blue-700">#{stats?.domainRank || "N/A"}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Detailed Info */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Identity Section */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <User className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-bold text-slate-900">Personal Identity</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Full Name</label>
                                <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 text-slate-800 font-semibold">
                                    {user.fullName || user.userName}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Email Address</label>
                                <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 text-slate-800 font-semibold flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    <span className="truncate">{user.email || user.userEmail}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Unique ID</label>
                                <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 text-slate-800 font-semibold flex items-center gap-2">
                                    <Hash className="w-4 h-4 text-slate-400" />
                                    {user.id || user.uniqueId}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Phone Number</label>
                                <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 text-slate-800 font-semibold flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                    {user.mobile || user.phone || user.phoneNumber || user.contactNumber || "N/A"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Professional Details */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <Briefcase className="w-5 h-5 text-indigo-600" />
                            <h3 className="text-lg font-bold text-slate-900">Internship Details</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Specialization</label>
                                <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 text-slate-800 font-semibold uppercase">
                                    {user.domain}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Joining Date</label>
                                <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 text-slate-800 font-semibold flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    {formatDate(user.joiningDate || user.joining_date || user.registrationDate || user.createdAt)}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Professional Role</label>
                                <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 text-slate-800 font-semibold capitalize">
                                    {user.role}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Account Status</label>
                                <div className="bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100 text-emerald-700 font-bold flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    {user.status || "ACTIVE"}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProfilePage;