import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";
import logo from "../assets/Athenura.png";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const links = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 md:px-12
        ${scrolled ? "py-3" : "py-6"}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between relative">
        
        {/* ── Background Glass (Only on Scroll) ── */}
        <div className={`absolute inset-0 -mx-4 rounded-2xl transition-all duration-500 -z-10
          ${scrolled ? "bg-white/90 backdrop-blur-xl border border-slate-200 shadow-sm" : "bg-transparent border-transparent"}`} 
        />

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-3 group relative z-10">
          <img 
            src={logo} 
            alt="Athenura Logo" 
            className="h-8 md:h-9 w-auto object-contain transition-transform duration-500 group-hover:scale-105" 
          />
        </Link>

        {/* ── Desktop Central Navigation (Floating Pill) ── */}
        <div className={`hidden md:flex items-center gap-1 p-1 rounded-full border backdrop-blur-md transition-colors ${scrolled ? 'bg-slate-50/50 border-slate-200' : 'bg-white/50 border-slate-200/50'}`}>
          {links.map(({ to, label }) => {
            const active = location.pathname === to;
            return (
              <Link 
                key={to} 
                to={to} 
                className={`px-6 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all duration-300 relative
                  ${active ? "text-blue-700" : "text-slate-500 hover:text-slate-900"}`}
              >
                {active && (
                  <div className="absolute inset-0 bg-blue-50 border border-blue-100 rounded-full -z-10" />
                )}
                {label}
              </Link>
            );
          })}
        </div>

        {/* ── Desktop Action Buttons ── */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all"
          >
            Sign In
          </Link>
          <Link
            to="/login"
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest text-white transition-all shadow-sm flex items-center gap-2 group"
          >
            Get Started
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* ── Mobile Hamburger ── */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden w-10 h-10 flex items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm"
        >
          {menuOpen ? <X className="text-slate-900 w-5 h-5" /> : <Menu className="text-slate-900 w-5 h-5" />}
        </button>
      </div>

      {/* ── Mobile Menu ── */}
      <div className={`absolute top-full left-6 right-6 mt-4 transition-all duration-500 ease-in-out origin-top
        ${menuOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0 pointer-events-none"}`}
      >
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-8">
          <div className="flex flex-col gap-6">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`text-sm font-bold uppercase tracking-[0.2em] transition-colors
                  ${location.pathname === to ? "text-blue-600" : "text-slate-500"}`}
              >
                {label}
              </Link>
            ))}
          </div>
          
          <div className="h-px bg-slate-100" />
          
          <div className="flex flex-col gap-4">
            <Link
              to="/login"
              className="w-full py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 font-bold text-center uppercase tracking-widest text-xs"
            >
              Sign In
            </Link>
            <Link
              to="/contact"
              className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold text-center uppercase tracking-widest text-xs shadow-md flex items-center justify-center gap-2"
            >
              Get Started
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}