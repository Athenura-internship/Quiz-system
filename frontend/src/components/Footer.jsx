import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/Athenura.png";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-12 px-6 md:px-[6%]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Brand */}
        <div className="md:col-span-2">
          <img src={logo} alt="Athenura" className="h-8 w-auto object-contain mb-4" />
          <p className="text-sm leading-6 text-slate-500 max-w-sm">
            The AI-powered assessment platform for intern programs.
            Automated, fair, and built to scale your hiring process seamlessly.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold text-sm text-slate-900 mb-4 tracking-wide uppercase">
            Quick Links
          </h4>
          {[
            { to: "/",        label: "Home"    },
            { to: "/about",   label: "About Us"   },
            { to: "/contact", label: "Contact" },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="block text-sm text-slate-500 hover:text-blue-600 mb-3 transition-colors font-medium"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-bold text-sm text-slate-900 mb-4 tracking-wide uppercase">
            Legal
          </h4>
          {[
            { to: "/rules", label: "Rules" },
            { to: "/terms", label: "Terms & Conditions" },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="block text-sm text-slate-500 hover:text-blue-600 mb-3 transition-colors font-medium"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400 font-medium">
        <div>
          © {new Date().getFullYear()} Athenura. All rights reserved.
        </div>
        <div>
          www.athenura.in
        </div>
      </div>
    </footer>
  );
}
