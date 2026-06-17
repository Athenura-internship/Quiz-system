import React, { useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Sidebar - responsive drawer */}
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        
        <main className="flex-1 overflow-y-auto relative">
           <div className="p-6 md:p-8 max-w-[1600px] w-full mx-auto animate-fade-in">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-10 min-h-[calc(100vh-140px)]">
                <Outlet />
              </div>
           </div>
           
           {/* Bottom Footer Spacing */}
           <div className="h-12 w-full" />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;