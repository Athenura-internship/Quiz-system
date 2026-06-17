import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Target, Zap, Shield, Award, Layers, ChevronRight, Binary, Globe, BarChart3, Users } from "lucide-react";

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900">
      
      {/* ── HERO SECTION ── */}
      <section className="relative pt-40 pb-24 px-6 md:px-12 flex items-center overflow-hidden border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Vision & Mission */}
          <div className="space-y-8 max-w-2xl">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-100">
              <Globe className="w-4 h-4 text-blue-600 mr-2.5" />
              <span className="text-xs font-bold tracking-widest text-blue-700 uppercase">
                Global Evaluation Standards
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              Transforming <br />
              <span className="text-blue-600">
                technical hiring.
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
              Athenura is an advanced evaluation engine designed to bridge the gap between human potential and enterprise performance through domain-specific assessments.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={() => navigate('/register')}
                className="px-8 py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                Create Account
                <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => navigate('/contact')}
                className="px-8 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                Contact Sales
              </button>
            </div>
          </div>

          {/* Right Column: Clean Geometric/CSS Graphic */}
          <div className="relative flex justify-center items-center h-full min-h-[400px]">
             <div className="relative w-full max-w-md p-8 bg-slate-50 border border-slate-200 rounded-3xl shadow-sm">
                <div className="flex justify-between items-center mb-6">
                   <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                   </div>
                </div>
                <div className="space-y-6">
                   <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                         <Target className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 space-y-2">
                         <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                         <div className="h-3 bg-slate-100 rounded w-full"></div>
                      </div>
                   </div>
                   <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                         <Zap className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1 space-y-2">
                         <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                         <div className="h-3 bg-slate-100 rounded w-5/6"></div>
                      </div>
                   </div>
                   <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                         <Shield className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="flex-1 space-y-2">
                         <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                         <div className="h-3 bg-slate-100 rounded w-4/5"></div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* ── MISSION SECTION ── */}
      <section className="py-24 px-6 md:px-12 bg-slate-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          <div className="space-y-10">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                Built for the next generation of <span className="text-blue-600">engineering teams.</span>
              </h2>
              <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                <p>
                  We created Athenura to eliminate the noise in talent assessment. 
                  By replacing generic multiple-choice questions with dynamic, 
                  domain-aware challenges, we ensure that true skill is accurately measured.
                </p>
                <p>
                  Whether you are assessing Frontend architecture or backend scalability, 
                  our platform serves the right challenges to the right candidates, 
                  recognizing excellence objectively.
                </p>
              </div>
            </div>

            <div className="bg-white border-l-4 border-blue-600 p-8 rounded-r-2xl shadow-sm">
              <p className="text-lg font-medium text-slate-800 italic leading-relaxed">
                "Precision evaluation through objective logic — that's the Athenura promise."
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col gap-6 transform hover:-translate-y-1 transition-transform">
               <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                     <BarChart3 className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                     <div className="text-2xl font-bold text-slate-900">99.8%</div>
                     <div className="text-slate-500 font-medium">Evaluation Accuracy</div>
                  </div>
               </div>
               <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center">
                     <Users className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                     <div className="text-2xl font-bold text-slate-900">10k+</div>
                     <div className="text-slate-500 font-medium">Candidates Assessed</div>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center">
                     <Award className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                     <div className="text-2xl font-bold text-slate-900">Top 1%</div>
                     <div className="text-slate-500 font-medium">Talent Identified</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES BENTO GRID ── */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-slate-200">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Our Core Principles</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <div className="md:col-span-3 bg-white border border-slate-200 p-10 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <Zap className="w-8 h-8 text-blue-600 mb-6" />
            <h3 className="text-xl font-bold text-slate-900 mb-3">Automation First</h3>
            <p className="text-slate-600 leading-relaxed">
              Every challenge is generated dynamically, ensuring fresh, relevant content for every session. No recycled questions, just pure logic evaluation.
            </p>
          </div>

          <div className="md:col-span-3 bg-white border border-slate-200 p-10 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <Target className="w-8 h-8 text-blue-600 mb-6" />
            <h3 className="text-xl font-bold text-slate-900 mb-3">Domain Precision</h3>
            <p className="text-slate-600 leading-relaxed">
              Questions are mapped to specific career paths, from high-level UI/UX principles to low-level Data Engineering architecture.
            </p>
          </div>

          <div className="md:col-span-2 bg-white border border-slate-200 p-10 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <Shield className="w-8 h-8 text-blue-600 mb-6" />
            <h3 className="text-xl font-bold text-slate-900 mb-3">Objective Meritocracy</h3>
            <p className="text-slate-600 leading-relaxed">
              A transparent, time-weighted scoring system that rewards deep understanding and speed without bias.
            </p>
          </div>

          <div className="md:col-span-4 bg-white border border-slate-200 p-10 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-8 items-center">
            <div className="space-y-4">
              <Award className="w-8 h-8 text-blue-600" />
              <h3 className="text-xl font-bold text-slate-900">Verifiable Skill Growth</h3>
              <p className="text-slate-600 leading-relaxed">
                Candidates unlock permanent credentials and climb global leaderboards. Their verified skill becomes a tangible asset for employment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="py-24 px-6 md:px-12 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto bg-blue-600 p-12 md:p-16 rounded-3xl text-center shadow-lg">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
            Ready to upgrade your hiring process?
          </h2>
          <p className="text-lg text-blue-100 mb-10 max-w-xl mx-auto">
            Contact us today for a private demonstration of the full Athenura evaluation ecosystem.
          </p>
          <button 
            onClick={() => navigate('/contact')}
            className="px-8 py-3.5 rounded-xl bg-white text-blue-600 font-bold text-lg hover:bg-slate-50 transition-colors shadow-sm inline-flex items-center gap-2"
          >
            Get In Touch
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
}