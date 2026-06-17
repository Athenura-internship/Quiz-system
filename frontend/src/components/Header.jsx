import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, ChevronDown, User, LogOut, Settings, Award, Sun, Moon, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (err) {}
    } else {
      setUserData(null);
    }
  }, [location]);

  const isIntern = userData?.role === 'intern' || userData?.role === 'student';
  
  let displayName = 'Admin User';
  let displayRole = 'System Administrator';
  let avatarLetter = 'A';

  if (isIntern) {
    if (userData.firstName && userData.lastName) {
      displayName = `${userData.firstName} ${userData.lastName}`;
    } else if (userData.firstName) {
       displayName = userData.firstName;
    } else if (userData.name) {
      displayName = userData.name;
    } else if (userData.userName) {
      displayName = userData.userName;
    } else {
      displayName = 'Intern User';
    }
    displayRole = 'Intern Candidate';
    const cleanName = displayName.replace(/[^a-zA-Z]/g, '');
    avatarLetter = cleanName ? cleanName.charAt(0).toUpperCase() : 'I';
  }

  return (
    <header className="h-20 flex items-center justify-between px-8 z-40 sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-200 transition-colors duration-300">
      <div className="flex items-center gap-6">
        {/* Mobile Toggle */}
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Global Search */}
        <div className="relative group hidden lg:block">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search dashboard..." 
            className="w-[320px] pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">

        {/* Notification Hub */}
        <div className="relative">
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className={`p-2.5 rounded-xl transition-colors relative flex items-center justify-center
              ${notificationsOpen ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-100"}`}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white" />
          </button>

          <AnimatePresence>
            {notificationsOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden"
              >
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                  <span className="text-xs font-semibold text-blue-600 px-2 py-0.5 bg-blue-50 rounded-md">2 New</span>
                </div>
                
                <div className="max-h-[320px] overflow-y-auto">
                  <div className="divide-y divide-slate-100">
                    {[
                      { icon: <Award className="text-purple-600" />, title: "Rank Milestone reached!", desc: "You've moved into the Top 10 for Frontend Development.", time: "2m ago", bg: "bg-purple-50" },
                      { icon: <Zap className="text-amber-600" />, title: "Quiz generation complete", desc: "Your tailored MERN stack contest is now ready.", time: "1h ago", bg: "bg-amber-50" },
                    ].map((n, i) => (
                      <div key={i} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="flex gap-3">
                          <div className={`w-10 h-10 rounded-xl ${n.bg} flex items-center justify-center flex-shrink-0`}>
                            {n.icon}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900 text-sm">{n.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5 mb-1.5">{n.desc}</p>
                            <p className="text-xs font-medium text-slate-400">{n.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border-t border-slate-100">
                  <button className="w-full py-2 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors text-center rounded-lg hover:bg-blue-50">
                    Mark all as read
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>

        {/* User Profile Hub */}
        <div className="relative">
          <div 
            className={`flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-xl cursor-pointer transition-colors
              ${profileOpen ? "bg-slate-100" : "hover:bg-slate-50"}`}
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
              {avatarLetter}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-slate-900 leading-tight">{displayName}</p>
              <p className="text-xs text-slate-500 font-medium leading-tight">{displayRole}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
          </div>

          <AnimatePresence>
            {profileOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 mt-3 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden"
              >
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                  <p className="font-semibold text-slate-900 truncate">{displayName}</p>
                  <p className="text-xs text-slate-500 truncate">{displayRole}</p>
                </div>
                
                <div className="p-2">
                  <button 
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors"
                    onClick={() => { setProfileOpen(false); navigate('/intern/profile'); }}
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium">Profile</span>
                  </button>
                  <button 
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium">Settings</span>
                  </button>
                  
                  <div className="h-px bg-slate-100 my-1 mx-2" />
                  
                  <button 
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-600 transition-colors"
                    onClick={() => {
                      localStorage.removeItem('user');
                      localStorage.removeItem('token');
                      navigate('/');
                      setProfileOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;
