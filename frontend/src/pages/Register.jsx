import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiCall } from "../utils/api";
import logo from "../assets/Athenura.png";
import { User, Mail, Lock, Key, Eye, EyeOff, ArrowRight } from "lucide-react";

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

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    secretKey: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "" });
  const [loading, setLoading] = useState(false);

  const isFormValid = formData.name.trim() && 
                      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && 
                      formData.password.length >= 6 && 
                      formData.secretKey.trim();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return setToast({ msg: "Name is required.", type: "err" });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return setToast({ msg: "Valid email is required.", type: "err" });
    if (formData.password.length < 6) return setToast({ msg: "Password must be at least 6 characters.", type: "err" });
    if (!formData.secretKey.trim()) return setToast({ msg: "Secret Key is required.", type: "err" });

    setLoading(true);
    try {
      await apiCall("/auth/register", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      setToast({ msg: "Account created successfully!", type: "ok" });
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setToast({ msg: err.message || "Registration failed.", type: "err" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative">
      <div className="w-full max-w-5xl bg-white rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-xl border border-slate-200">
        
        {/* LEFT PANEL */}
        <div className="md:w-5/12 bg-blue-600 p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <img src={logo} alt="Athenura" className="h-10 w-auto mb-16 brightness-0 invert opacity-90" />
            <h2 className="text-3xl font-bold text-white leading-tight mb-4">
              Create an Account
            </h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              Register as an administrator to manage interns, configure quizzes, and access analytics.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 p-12 md:p-16 flex flex-col justify-center bg-white">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Registration</h3>
            <p className="text-slate-500 text-sm">Enter your details to create a new admin account.</p>
          </div>

          <Toast message={toast.msg} type={toast.type} />

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                Full Name
              </label>
              <input
                type="text" name="name" value={formData.name} onChange={handleChange}
                placeholder="Jane Doe"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                Email Address
              </label>
              <input
                type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="admin@athenura.com"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                  Secret Key
                </label>
                <input
                  type="password" name="secretKey" value={formData.secretKey} onChange={handleChange}
                  placeholder="Secret Key"
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full py-3.5 mt-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
