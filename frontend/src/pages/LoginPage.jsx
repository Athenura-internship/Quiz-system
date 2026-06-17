import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Athenura.png";
import { apiCall } from "../utils/api";
import { ArrowRight, User, Calendar, Lock } from "lucide-react";

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

export default function LoginPage() {
  const navigate = useNavigate();
  const [internId, setInternId]     = useState("");
  const [internDate, setInternDate] = useState("");
  const [toast, setToast]           = useState({ msg: "", type: "" });
  const [loading, setLoading]       = useState(false);

  const handleLogin = async () => {
    if (!internId.trim()) {
      setToast({ msg: "Please enter your Unique ID.", type: "err" }); return;
    }
    const idRegex = /^ATHENURA\/\d{2}\/\d+$/i;
    if (!idRegex.test(internId.trim())) {
      setToast({ msg: "Format must be ATHENURA/YY/XXXXX", type: "err" }); return;
    }
    if (!internDate) {
      setToast({ msg: "Please select your joining date.", type: "err" }); return;
    }

    setLoading(true);
    setToast({ msg: "Authenticating...", type: "ok" });

    try {
      const data = await apiCall("/auth/login", {
        method: "POST",
        body: JSON.stringify({ uniqueId: internId, joiningDate: internDate }),
      });

      setToast({ msg: "Sign in successful.", type: "ok" });
      
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);

      setTimeout(() => {
        if (data.user.role === 'intern') {
          navigate('/intern-leaderboard');
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
        <div className="md:w-5/12 bg-blue-600 p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <img src={logo} alt="Athenura" className="h-10 w-auto mb-16 brightness-0 invert opacity-90" />
            <h2 className="text-3xl font-bold text-white leading-tight mb-4">
              Intern Assessment Portal
            </h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              Access your personalized dashboard to complete required assessments and track your progress throughout the program.
            </p>
          </div>
        </div>
 
        {/* RIGHT PANEL */}
        <div className="flex-1 p-12 md:p-16 flex flex-col justify-center bg-white">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Sign in</h3>
            <p className="text-slate-500 text-sm">Please enter your credentials to continue.</p>
          </div>
 
          <Toast message={toast.msg} type={toast.type} />
 
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                Intern Unique ID
              </label>
              <input
                type="text"
                value={internId}
                onChange={(e) => setInternId(e.target.value)}
                placeholder="ATHENURA/25/10115"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>
 
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                Joining Date
              </label>
              <input
                type="date"
                value={internDate}
                onChange={(e) => setInternDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600"
              />
            </div>
 
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3.5 mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Continue"}
              <ArrowRight className="w-5 h-5" />
            </button>
 
            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs font-medium text-slate-400">OR</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
 
            <button
              onClick={() => navigate('/admin-login')}
              className="w-full py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4 text-slate-500" />
              Administrator Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
