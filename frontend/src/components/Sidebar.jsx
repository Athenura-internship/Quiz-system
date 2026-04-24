import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/Athenura.png";

const Sidebar = ({ isOpen, onClose }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, [location]);


  const menuItems = [
    { name: "Hall of Fame", path: "/intern-leaderboard" },
    { name: "Upcoming Quiz", path: "/upcoming" },
    { name: "My Quizzes", path: "/my-quizzes" },
  ];

  const adminItems = [
    { name: "Leaderboard", path: "/leaderboard" },
    { name: "All Contests", path: "/contests" },
    { name: "All Interns", path: "/all-interns" },
    { name: "Upload Interns", path: "/upload-interns" },
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
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar - responsive transform */}
      <div className={`flex flex-col h-screen fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 shadow-2xl border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out md:relative md:z-0 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* TOP */}
        <div className="flex-1 flex flex-col">
          {/* Logo & Close */}
          <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <img src={logo} alt="Athenura Logo" className="h-10 md:h-12 w-auto object-contain dark:brightness-125" />
            <button 
              onClick={onClose} 
              className="md:hidden text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* USER INFO */}
          {user  && (
            <div 
              onClick={() => { navigate('/intern/profile'); onClose(); }}
              className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-medium text-sm shadow-sm ring-2 ring-transparent dark:ring-slate-800">
                  {user?.userName?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{user?.userName || "User"}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user?.domain || (user?.role === 'admin' ? 'Administration' : '')}</p>
                </div>
              </div>
            </div>
          )}

          {/* NAVIGATION */}
          <nav className="flex-1 px-4 py-4">
            {user?.role !== "admin" && menuItems.map((item, i) => (
              <button
                key={`menu-${i}`}
                onClick={() => { navigate(item.path); onClose(); }}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium mb-1 ${
                  location.pathname === item.path
                    ? "bg-sky-500 text-white shadow-lg"
                    : "text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-900/30 hover:text-sky-600 dark:hover:text-sky-400 hover:shadow-md"
                }`}
              >
                {item.name}
              </button>
            ))}

            {user?.role === "admin" &&
              adminItems.map((item, i) => (
                <button
                  key={`admin-${i}`}
                  onClick={() => { navigate(item.path); onClose(); }}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium mb-1 ${
                    location.pathname === item.path
                      ? "bg-sky-500 text-white shadow-lg"
                      : "text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-900/30 hover:text-sky-600 dark:hover:text-sky-400 hover:shadow-md"
                  }`}
                >
                  {item.name}
                </button>
              ))}
          </nav>
        </div>

        {/* BOTTOM / LOGOUT */}
        <div className="mt-auto px-4 py-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center w-full gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400 rounded-xl transition-all font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

