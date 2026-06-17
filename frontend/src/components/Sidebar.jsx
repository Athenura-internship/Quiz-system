import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/Athenura.png";
import { Trophy, Calendar, ClipboardList, BarChart2, Users, Upload, LogOut, X } from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, [location]);

  const menuItems = [
    { name: "Leaderboard", path: "/intern-leaderboard", icon: <Trophy className="w-5 h-5" /> },
    { name: "Upcoming Quizzes", path: "/upcoming", icon: <Calendar className="w-5 h-5" /> },
    { name: "My Quizzes", path: "/my-quizzes", icon: <ClipboardList className="w-5 h-5" /> },
  ];

  const adminItems = [
    { name: "Analytics Dashboard", path: "/reports", icon: <BarChart2 className="w-5 h-5" /> },
    // { name: "Global Rankings", path: "/leaderboard", icon: <Trophy className="w-5 h-5" /> },
    { name: "Contest Management", path: "/contests", icon: <ClipboardList className="w-5 h-5" /> },
    { name: "Intern Directory", path: "/all-interns", icon: <Users className="w-5 h-5" /> },
    { name: "Bulk Import", path: "/upload-interns", icon: <Upload className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`flex flex-col h-screen fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* TOP: Brand & Close */}
        <div className="p-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Athenura" className="h-8 w-auto" />
          </div>
          <button onClick={onClose} className="md:hidden p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
 
        {/* User Quick Info */}
        {user && (
          <div className="p-6 border-b border-slate-100">
            <div 
              onClick={() => { navigate('/intern/profile'); onClose(); }}
              className="flex items-center gap-4 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg shadow-sm">
                {user?.userName?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{user?.userName || "User"}</p>
                <p className="text-xs font-medium text-slate-500">{user?.domain || (user?.role === 'admin' ? 'Administrator' : 'Intern')}</p>
              </div>
            </div>
          </div>
        )}
 
        {/* NAVIGATION */}
        <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="px-4 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Main Menu</p>
          
          {(user?.role === "admin" ? adminItems : menuItems).map((item, i) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={i}
                onClick={() => { navigate(item.path); onClose(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium
                  ${active 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
              >
                <div className={`${active ? "text-blue-600" : "text-slate-400"}`}>
                  {item.icon}
                </div>
                <span className="text-sm">{item.name}</span>
              </button>
            );
          })}
        </div>
 
        {/* BOTTOM: Logout */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full gap-3 px-4 py-3 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium text-sm"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
