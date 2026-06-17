import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Globe, MapPin, Clock, Send, CheckCircle, ArrowRight, MessageSquare, Briefcase } from "lucide-react";
import { apiCall } from "../utils/api";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fname: "", lname: "", email: "", org: "", interest: "", msg: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.fname.trim() || !form.email.trim() || !form.msg.trim() || !form.interest) {
      setError("Please fill out all required fields.");
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        firstName: form.fname,
        lastName: form.lname,
        email: form.email,
        inquiryType: form.interest,
        message: form.msg
      };
      
      const res = await apiCall('/contact/submit', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.success) {
        setSubmitted(true);
      } else {
        setError(res.message || "Failed to send message. Please try again.");
      }
    } catch (err) {
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 pt-32 pb-20 font-sans">
      
      {/* ── HERO ── */}
      <section className="px-6 md:px-12 py-12 text-center max-w-4xl mx-auto">
        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold tracking-widest uppercase mb-6">
          Contact Sales
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-slate-900">
          Get in Touch
        </h1>
        <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto">
          Reach out to our team for a personalized demo, enterprise partnership, or technical support inquiry.
        </p>
      </section>

      {/* ── MAIN CONTENT ── */}
      <section className="px-6 md:px-12 max-w-6xl mx-auto mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
          
          {/* ── LEFT: FORM ── */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-8 md:p-12 shadow-sm">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">First Name</label>
                    <input
                      type="text" placeholder="Jane" required
                      value={form.fname} onChange={(e) => set("fname", e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Last Name</label>
                    <input
                      type="text" placeholder="Doe"
                      value={form.lname} onChange={(e) => set("lname", e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Work Email</label>
                  <input
                    type="email" placeholder="jane@company.com" required
                    value={form.email} onChange={(e) => set("email", e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Inquiry Type</label>
                  <select
                    value={form.interest} onChange={(e) => set("interest", e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select Topic...</option>
                    <option>Platform Demo</option>
                    <option>Enterprise Pricing</option>
                    <option>Technical Support</option>
                    <option>Partnership</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Message</label>
                  <textarea
                    rows={4} placeholder="How can we help?"
                    value={form.msg} onChange={(e) => set("msg", e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 resize-none min-h-[120px]"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-xl">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 mt-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send Message"}
                  {!loading && <Send className="w-4 h-4" />}
                </button>
              </form>
            ) : (
              <div className="text-center py-16 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Message Sent</h3>
                <p className="text-slate-600 font-medium max-w-sm mb-8">
                  Thanks for reaching out! Our team will get back to you within 24 business hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Send another message
                </button>
              </div>
            )}
          </div>

          {/* ── RIGHT: INFO ── */}
          <div className="lg:col-span-2 space-y-10 lg:pl-8">
            <div>
              <h3 className="text-xl font-bold mb-6 text-slate-900">Global Offices</h3>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Globe className="text-blue-600 w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Headquarters</p>
                    <p className="text-slate-600">Sector 62, Noida</p>
                    <p className="text-sm text-slate-500 mt-1"> Uttar Pradesh</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Clock className="text-blue-600 w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Business Hours</p>
                    <p className="text-slate-600">09:00 - 18:00 IST</p>
                    <p className="text-sm text-slate-500 mt-1">Monday - Friday</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-100 p-8 rounded-2xl border border-slate-200">
              <MessageSquare className="w-8 h-8 text-blue-600 mb-4" />
              <h4 className="text-lg font-bold text-slate-900 mb-2">Direct Email</h4>
              <p className="text-slate-600 mb-4 text-sm">
                Prefer to email us directly? Reach our sales team at:
              </p>
              <a href="mailto:hr.athenura@gmail.com" className="text-blue-600 font-bold hover:underline">
                hr.athenura@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
