import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiCall } from '../utils/api';
import { 
  Zap, 
  Calendar, 
  Clock, 
  Settings, 
  BrainCircuit, 
  CheckCircle2, 
  X, 
  ArrowRight,
  ChevronLeft,
  FileText,
  ShieldCheck,
  Target,
  Layout,
  Info,
  Check
} from 'lucide-react';

const CreateContest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    title: '',
    type: 'MCQ',
    description: '',
    date: '',
    startTime: '',
    duration: '',
    domain: '',
    totalQuestions: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.editContest) {
      const editData = location.state.editContest;
      setFormData({
        ...editData,
        date: new Date(editData.date).toISOString().split('T')[0],
        startTime: new Date(editData.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title required';
    if (!formData.description.trim()) newErrors.description = 'Description required';
    if (!formData.date.trim()) newErrors.date = 'Date required';
    if (!formData.startTime.trim()) newErrors.startTime = 'Time required';
    if (!formData.duration || Number(formData.duration) <= 0) newErrors.duration = 'Invalid duration';
    if (!formData.domain.trim()) newErrors.domain = 'Domain required';
    if (!formData.totalQuestions || isNaN(formData.totalQuestions) || Number(formData.totalQuestions) <= 0) {
      newErrors.totalQuestions = 'Invalid count';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const endpoint = location.state?.editContest ? `/admin/update-contest/${location.state.editContest._id}` : "/admin/create-contest";
      const method = location.state?.editContest ? "PUT" : "POST";
      
      const response = await apiCall(endpoint, {
        method,
        body: JSON.stringify(formData),
      });
      
      navigate('/review-question', { 
        state: { 
          newContest: {
            ...formData,
            contestId: response.contest?.contestId || location.state?.editContest?._id
          } 
        } 
      });
    } catch (error) {
      setErrors({ submit: error.message || 'Submission failed. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  const domains = [
    "DATA SCIENCE & ANALYTICS", 
    "FRONTEND DEVELOPER", 
    "BACKEND DEVELOPER", 
    "MACHINE LEARNING", 
    "CYBER SECURITY", 
    "FULL STACK DEVELOPMENT"
  ];

  const inputClasses = "w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm";
  const labelClasses = "block text-xs font-bold text-slate-700 mb-2 ml-1";

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fade-in pb-20">
      {/* Header section with back control */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
             <Settings className="w-5 h-5 text-blue-600" />
             <span className="text-sm font-bold text-blue-600">Assessment Setup</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {location.state?.editContest ? 'Edit Assessment' : 'Create New Assessment'}
          </h1>
          <p className="text-slate-500 font-medium mt-2">Define the details and settings for the assessment.</p>
        </div>
        
        <button 
           onClick={() => navigate('/contests')}
           className="h-11 px-6 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all flex items-center gap-2 font-semibold text-sm shadow-sm"
        >
           <ChevronLeft className="w-4 h-4" />
           Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form fields grid */}
        <div className="lg:col-span-2 space-y-8">
           {/* Section 1: Details */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-10 space-y-6"
           >
              <div className="flex items-center gap-4 mb-2 border-b border-slate-100 pb-6">
                 <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">1</div>
                 <h2 className="text-xl font-bold text-slate-900">General Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                 <div className="md:col-span-2">
                    <label className={labelClasses}>Assessment Title</label>
                    <input
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className={`${inputClasses} ${errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : ''}`}
                      placeholder="e.g. Machine Learning Concepts"
                    />
                    {errors.title && <p className="text-xs font-semibold text-red-500 mt-1 ml-1">{errors.title}</p>}
                 </div>
                 
                 <div className="md:col-span-2">
                    <label className={labelClasses}>Description Overview</label>
                    <textarea
                      name="description"
                      rows="3"
                      value={formData.description}
                      onChange={handleChange}
                      className={`${inputClasses} h-32 py-3 resize-none ${errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : ''}`}
                      placeholder="e.g. Testing deep learning principles and mathematics..."
                    />
                    {errors.description && <p className="text-xs font-semibold text-red-500 mt-1 ml-1">{errors.description}</p>}
                 </div>
              </div>
           </motion.div>

           {/* Section 2: Configuration */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-10 space-y-6"
           >
              <div className="flex items-center gap-4 mb-2 border-b border-slate-100 pb-6">
                 <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">2</div>
                 <h2 className="text-xl font-bold text-slate-900">Configuration</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                 <div>
                    <label className={labelClasses}>Domain / Department</label>
                    <select 
                       name="domain" 
                       value={formData.domain} 
                       onChange={handleChange} 
                       className={`${inputClasses} appearance-none cursor-pointer ${errors.domain ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : ''}`}
                    >
                       <option value="">Select Domain</option>
                       {domains.map(dom => <option key={dom} value={dom}>{dom}</option>)}
                    </select>
                    {errors.domain && <p className="text-xs font-semibold text-red-500 mt-1 ml-1">{errors.domain}</p>}
                 </div>

                 <div>
                    <label className={labelClasses}>Number of Questions</label>
                    <div className="relative">
                       <input
                          type="number"
                          name="totalQuestions"
                          value={formData.totalQuestions}
                          onChange={handleChange}
                          className={`${inputClasses} ${errors.totalQuestions ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : ''}`}
                          placeholder="20"
                       />
                       <FileText className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                    {errors.totalQuestions && <p className="text-xs font-semibold text-red-500 mt-1 ml-1">{errors.totalQuestions}</p>}
                 </div>

                 <div>
                    <label className={labelClasses}>Evaluation Date</label>
                    <div className="relative">
                       <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleChange}
                          className={`${inputClasses} ${errors.date ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : ''}`}
                       />
                    </div>
                    {errors.date && <p className="text-xs font-semibold text-red-500 mt-1 ml-1">{errors.date}</p>}
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className={labelClasses}>Start Time</label>
                       <input
                         type="time"
                         name="startTime"
                         value={formData.startTime}
                         onChange={handleChange}
                         className={`${inputClasses} px-3 ${errors.startTime ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : ''}`}
                       />
                       {errors.startTime && <p className="text-xs font-semibold text-red-500 mt-1 ml-1">{errors.startTime}</p>}
                    </div>
                    <div>
                       <label className={labelClasses}>Duration</label>
                       <div className="relative">
                          <input
                            type="number"
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            className={`${inputClasses} px-3 ${errors.duration ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : ''}`}
                            placeholder="30"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase">Min</span>
                       </div>
                       {errors.duration && <p className="text-xs font-semibold text-red-500 mt-1 ml-1">{errors.duration}</p>}
                    </div>
                 </div>
              </div>
           </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
           <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:opacity-10 transition-opacity">
                 <Target className="w-24 h-24 text-blue-600" />
              </div>
              
              <div className="flex items-center gap-2 mb-6">
                 <ShieldCheck className="w-5 h-5 text-blue-600" />
                 <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Setup Status</h3>
              </div>
              
              <div className="space-y-4 relative z-10">
                 <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${formData.title && formData.description ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-300'}`}>
                       <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className={`text-sm font-bold ${formData.title && formData.description ? 'text-slate-700' : 'text-slate-400'}`}>General Details</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${formData.domain && formData.totalQuestions ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-300'}`}>
                       <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className={`text-sm font-bold ${formData.domain && formData.totalQuestions ? 'text-slate-700' : 'text-slate-400'}`}>Domain & Questions</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${formData.date && formData.startTime ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-300'}`}>
                       <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className={`text-sm font-bold ${formData.date && formData.startTime ? 'text-slate-700' : 'text-slate-400'}`}>Time & Date</span>
                 </div>
              </div>

              {errors.submit && (
                <div className="mt-8 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                   <X className="w-4 h-4 text-red-500" />
                   <p className="text-xs font-bold text-red-600">{errors.submit}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-8 w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Next: Add Questions
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
           </div>

           <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-3">
                 <Info className="w-4 h-4 text-slate-400" />
                 <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">What happens next?</h3>
              </div>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">
                 After saving these details, you will be directed to the question review page where you can manually add questions or let the AI automatically generate them based on your selected domain.
              </p>
           </div>
        </div>
      </form>
    </div>
  );
};

export default CreateContest;
