import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/Athenura.png";
import { apiCall } from "../utils/api";
import { Shield, ArrowLeft, Mail, Eye, EyeOff } from "lucide-react";

const Toast = ({ message, type }) => {
  if (!message) return null;
  const isErr = type === "err";
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium mb-6 ${
      isErr ? "bg-red-50 text-red-600 border border-red-200" : "bg-green-50 text-green-600 border border-green-200"
    }`}>
      {isErr ? "⚠" : "✓"} {message}
    </div>
  );
};

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [toast, setToast]       = useState({ msg: "", type: "" });
  const [loading, setLoading]       = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) { setToast({ msg: "Please enter your email address.", type: "err" }); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setToast({ msg: "Please enter a valid email address.", type: "err" }); return; }
    if (!password || password.length < 6) { setToast({ msg: "Password must be at least 6 characters.", type: "err" }); return; }

    setLoading(true);
    setToast({ msg: "Verifying credentials...", type: "ok" });

    try {
      const data = await apiCall("/auth/admin-login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setToast({ msg: "Sign in successful.", type: "ok" });
      
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);

      setTimeout(() => {
        if (data.user.role === 'admin') {
          navigate('/reports');
        } else {
          navigate('/');
        }
      }, 1000);
    } catch (err) {
      setLoading(false);
      setToast({ msg: err.message || "Sign in failed.", type: "err" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative">
      <div className="w-full max-w-5xl bg-white rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-xl border border-slate-200">
        
        {/* LEFT PANEL */}
        <div className="md:w-5/12 bg-slate-900 p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <img src={logo} alt="Athenura" className="h-10 w-auto mb-16 brightness-0 invert opacity-90" />
            <div className="inline-block px-3 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 mb-6">
              Administration
            </div>
            <h2 className="text-3xl font-bold text-white leading-tight mb-4">
              Admin Portal
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Sign in to manage users, configure settings, and view platform analytics.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 p-12 md:p-16 flex flex-col justify-center bg-white">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Administrator Sign in</h3>
            <p className="text-slate-500 text-sm">Use your staff email address to continue.</p>
          </div>

          <Toast message={toast.msg} type={toast.type} />

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@athenura.com"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
                <button 
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3.5 mt-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in to Dashboard"}
            </button>

            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <button
              onClick={() => navigate('/login')}
              className="w-full py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              Back to Intern Login
            </button>

            <div className="mt-8 text-center">
              <p className="text-sm font-medium text-slate-500">
                Don't have an account?{" "}
                <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
