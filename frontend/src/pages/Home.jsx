import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Cpu, Trophy, Check, BarChart3, Users, Zap, BrainCircuit } from "lucide-react";

/* ─────────────────────────────────────────
   STATS BAR
───────────────────────────────────────── */
function StatsBar() {
  const stats = [
    { label: "Assessments Completed", value: "25,000+", icon: <Zap className="w-5 h-5 text-blue-600" /> },
    { label: "Active Interns", value: "10,000+", icon: <Users className="w-5 h-5 text-blue-600" /> },
    { label: "Platform Uptime", value: "99.9%", icon: <Check className="w-5 h-5 text-blue-600" /> },
  ];

  return (
    <div className="relative z-20 -mt-10 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-around items-center gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="flex items-center gap-4 w-full md:w-auto justify-center">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              {stat.icon}
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   FEATURES
───────────────────────────────────────── */
function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6 md:px-12 relative max-w-7xl mx-auto">
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-sm font-semibold text-blue-600 tracking-wider uppercase">Platform Capabilities</h2>
        <h3 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
          Everything you need to manage assessments.
        </h3>
        <p className="text-slate-600 max-w-2xl mx-auto text-lg">
          A robust environment for testing, tracking, and analyzing intern performance at scale.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-10 shadow-sm hover:shadow-md transition-shadow">
          <BrainCircuit className="w-8 h-8 text-blue-600 mb-6" />
          <h4 className="text-xl font-bold text-slate-900 mb-3">Dynamic Question Banks</h4>
          <p className="text-slate-600 leading-relaxed max-w-md">
            Automatically generate and rotate questions from a vast library of domain-specific topics, ensuring assessments remain fair and comprehensive.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-10 shadow-sm hover:shadow-md transition-shadow">
          <BarChart3 className="w-8 h-8 text-blue-600 mb-6" />
          <h4 className="text-xl font-bold text-slate-900 mb-3">Deep Analytics</h4>
          <p className="text-slate-600 leading-relaxed">
            Track progress over time with comprehensive visual dashboards and performance metrics.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-10 shadow-sm hover:shadow-md transition-shadow">
          <Trophy className="w-8 h-8 text-blue-600 mb-6" />
          <h4 className="text-xl font-bold text-slate-900 mb-3">Global Leaderboards</h4>
          <p className="text-slate-600 leading-relaxed">
            Motivate candidates by tracking relative performance across your entire intern cohort.
          </p>
        </div>

        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-10 shadow-sm hover:shadow-md transition-shadow">
          <Users className="w-8 h-8 text-blue-600 mb-6" />
          <h4 className="text-xl font-bold text-slate-900 mb-3">Cohort Management</h4>
          <p className="text-slate-600 leading-relaxed max-w-md">
            Easily group interns into specialized cohorts. Assign specific assessments, set deadlines, and review aggregate performance metrics.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   HOW IT WORKS
───────────────────────────────────────── */
const STEPS = [
  { title: "Select a Domain", desc: "Choose from specialized tech and business disciplines." },
  { title: "Generate Assessment", desc: "The platform creates a tailored evaluation based on your requirements." },
  { title: "Administer Test", desc: "Candidates complete the proctored challenge within the allotted timeframe." },
  { title: "Review Results", desc: "Receive immediate, granular feedback on candidate performance." },
];

function HowSection() {
  return (
    <section className="py-24 px-6 md:px-12 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="order-2 lg:order-1 relative rounded-2xl border border-slate-200 bg-slate-50 p-12 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
             <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-blue-600" />
             </div>
             <h3 className="text-xl font-bold text-slate-900">Seamless Assessment Flow</h3>
             <p className="text-slate-500 mt-2">No setup required. Works out of the box.</p>
          </div>
        </div>

        <div className="order-1 lg:order-2 space-y-12">
          <div>
            <h2 className="text-sm font-semibold text-blue-600 tracking-wider uppercase mb-3">The Process</h2>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">
              Streamlined evaluation workflow.
            </h3>
            <p className="text-slate-600 text-lg">
              Designed to remove friction so you can focus entirely on assessing talent.
            </p>
          </div>

          <div className="space-y-8 relative">
            <div className="absolute left-[1.15rem] top-4 bottom-4 w-px bg-slate-200"></div>
            {STEPS.map((step, idx) => (
              <div key={idx} className="flex gap-6 relative z-10">
                <div className="w-10 h-10 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center text-sm font-bold text-blue-600 flex-shrink-0 mt-1">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">{step.title}</h4>
                  <p className="text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   LEADERBOARD
───────────────────────────────────────── */
const LB_DATA = [
  { pos: 1, ini: "AK", bg: "bg-blue-100 text-blue-700", name: "Ayush Kumar", dom: "Frontend", sc: 19, trend: "+2" },
  { pos: 2, ini: "PS", bg: "bg-purple-100 text-purple-700", name: "Priya Sharma", dom: "Data Science", sc: 18, trend: "-" },
  { pos: 3, ini: "RV", bg: "bg-emerald-100 text-emerald-700", name: "Rohan Verma", dom: "Backend", sc: 17, trend: "+1" },
  { pos: 4, ini: "SP", bg: "bg-slate-100 text-slate-700", name: "Sneha Patel", dom: "UI/UX", sc: 17, trend: "-1" },
];

function LeaderboardSection() {
  return (
    <section className="py-24 px-6 md:px-12 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">
            Top Performers
          </h2>
          <p className="text-slate-600 text-lg">
            Track performance across all active cohorts.
          </p>
        </div>
        <button className="text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 px-6 py-2.5 rounded-xl transition-colors shadow-sm">
          View All Results
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50">
          <div className="col-span-1">Rank</div>
          <div className="col-span-6 md:col-span-5">Candidate</div>
          <div className="hidden md:block col-span-4">Specialization</div>
          <div className="col-span-5 md:col-span-2 text-right">Score</div>
        </div>

        <div className="divide-y divide-slate-100">
          {LB_DATA.map((row) => (
            <div key={row.pos} className="grid grid-cols-12 gap-4 px-8 py-4 items-center hover:bg-slate-50 transition-colors">
              <div className="col-span-1 font-bold text-slate-400">#{row.pos}</div>
              <div className="col-span-6 md:col-span-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${row.bg}`}>
                  {row.ini}
                </div>
                <span className="font-semibold text-slate-900 truncate">{row.name}</span>
              </div>
              <div className="hidden md:block col-span-4">
                <span className="text-xs px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md text-slate-600 font-medium">
                  {row.dom}
                </span>
              </div>
              <div className="col-span-5 md:col-span-2 flex justify-end items-center gap-4">
                <span className={`text-xs font-semibold ${row.trend.includes('+') ? 'text-emerald-600' : row.trend.includes('-1') ? 'text-red-600' : 'text-slate-400'}`}>
                  {row.trend}
                </span>
                <span className="font-bold text-lg text-slate-900">
                  {row.sc} <span className="text-slate-400 text-sm font-medium">/ 20</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   CTA BANNER
───────────────────────────────────────── */
function CTASection() {
  const navigate = useNavigate();
  return (
    <section className="py-16 px-6 md:px-12 pb-32">
      <div className="max-w-5xl mx-auto bg-blue-600 p-12 md:p-16 rounded-3xl text-center shadow-xl">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
          Ready to streamline your assessments?
        </h2>
        <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
          Deploy your first contest in minutes. Stop manually grading spreadsheets and start uncovering real talent.
        </p>
        <button
          onClick={() => navigate('/register')}
          className="px-8 py-3.5 rounded-xl bg-white text-blue-600 font-bold text-lg hover:bg-slate-50 transition-colors shadow-sm"
        >
          Create Admin Account
        </button>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   HOME PAGE
───────────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900">
      {/* ── HERO SECTION ── */}
      <section className="relative pt-32 pb-32 px-6 md:px-12 flex items-center">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Side: Text Content */}
          <div className="text-left space-y-6 pt-12 md:pt-0">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1] pb-2">
              The standard for <br />
              <span className="text-blue-600">
                intern assessments.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 max-w-lg leading-relaxed pt-2">
              Experience the next generation of professional learning. Robust quizzes, immediate feedback, and real-time cohort analytics.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3.5 rounded-xl bg-blue-600 text-white font-medium text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                Sign in to Platform
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/admin-login')}
                className="px-6 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-medium text-lg hover:bg-slate-50 transition-colors flex items-center justify-center shadow-sm"
              >
                Admin Access
              </button>
            </div>
          </div>

          {/* Right Side: Clean Graphic */}
          <div className="relative w-full h-full flex items-center justify-center pt-10 lg:pt-0">
             <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-8 transform rotate-1 hover:rotate-0 transition-transform duration-500 relative z-10">
                <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                         <BarChart3 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                         <div className="text-sm font-bold text-slate-900">Performance Overview</div>
                         <div className="text-xs text-slate-500">Q3 Assessment</div>
                      </div>
                   </div>
                   <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Active</span>
                </div>
                <div className="space-y-4">
                   <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                   <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                   <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                   <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                </div>
                <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center">
                   <div className="text-xs text-slate-500">Last updated: Just now</div>
                   <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white"></div>
                      <div className="w-8 h-8 rounded-full bg-slate-300 border-2 border-white"></div>
                      <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xs font-bold text-blue-600">+5</div>
                   </div>
                </div>
             </div>
             {/* Decorative background shape to replace the glowing blobs */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[400px] max-h-[400px] bg-slate-100 rounded-full -z-0"></div>
          </div>
        </div>
      </section>

      <StatsBar />
      <FeaturesSection />
      <HowSection />
      <LeaderboardSection />
      <CTASection />


    </div>
  );
}