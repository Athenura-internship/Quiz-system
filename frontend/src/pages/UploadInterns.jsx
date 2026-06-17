import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiCall } from '../utils/api';
import * as XLSX from 'xlsx';
import { 
  UploadCloud, 
  UserPlus, 
  FileSpreadsheet, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ShieldCheck, 
  BrainCircuit, 
  Zap,
  Users,
  Layout,
  Layers,
  ArrowRight,
  X,
  Mail,
  Smartphone,
  Calendar,
  Fingerprint,
  Download
} from 'lucide-react';

const UploadInterns = () => {
  const [activeView, setActiveView] = useState('options'); // 'options', 'bulk', 'single'
  const [file, setFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const fileInputRef = useRef(null);
  const [parsedData, setParsedData] = useState([]);
  const [singleInternData, setSingleInternData] = useState({ name: '', email: '', mobile: '', domain: '', uniqueId: '', joiningDate: '' });
  const [isSavingSingle, setIsSavingSingle] = useState(false);
  const [singleSaveStatus, setSingleSaveStatus] = useState(null);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => { setIsDragOver(false); };

  const processFile = (selectedFile) => {
    if (!selectedFile) return;
    const fileName = selectedFile.name.toLowerCase();
    const isExcelOrCsv = fileName.endsWith('.csv') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    if (!isExcelOrCsv) {
      alert("Format mismatch. Please provide CSV or Excel files.");
      return;
    }

    setFile(selectedFile);
    setUploadStatus(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const mappedData = jsonData.slice(0, 5).map(row => {
          const findVal = (keys) => {
            const rowKeys = Object.keys(row);
            for (const k of keys) {
              const match = rowKeys.find(rk => rk.toLowerCase().replace(/[\s_]/g, '') === k.toLowerCase().replace(/[\s_]/g, ''));
              if (match) return row[match];
            }
            return '';
          };
          return {
            name: findVal(['name', 'fullname']),
            email: findVal(['email']),
            mobile: String(findVal(['mobile', 'phone']) || 'N/A'),
            domain: findVal(['domain', 'track']),
            uniqueId: findVal(['uniqueid', 'id']),
            joiningDate: findVal(['joiningdate', 'date'])
          };
        });
        setParsedData(mappedData);
      } catch (error) {
        alert("Parsing failed. File corrupted.");
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleImport = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await apiCall("/admin/upload-interns", { method: "POST", body: formData, headers: {} });
      setUploadStatus({ type: 'success', message: response.message });
      setFile(null);
      setParsedData([]);
    } catch (error) {
      alert(error.message || "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveSingle = async (e) => {
    e.preventDefault();
    setIsSavingSingle(true);
    try {
      await apiCall("/admin/upload-single-intern", { method: "POST", body: JSON.stringify(singleInternData) });
      setSingleSaveStatus('success');
      setSingleInternData({ name: '', email: '', mobile: '', domain: '', uniqueId: '', joiningDate: '' });
      setTimeout(() => setSingleSaveStatus(null), 3000);
    } catch (error) {
      alert(error.message || "Manual entry failed.");
    } finally {
      setIsSavingSingle(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "Name,Email,Mobile,Domain,UniqueId,JoiningDate\nJane Doe,jane@athenura.io,+91-9876543210,Frontend Developer,ATHENURA/25/17112,17/05/2026\nJohn Smith,john@athenura.io,+91-8765432109,Backend Developer,ATHENURA/25/17113,17/05/2026";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "intern_upload_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const domains = [
    "Data Science & Analytics", 
    "Frontend Developer", 
    "Backend Developer", 
    "Machine Learning", 
    "Cyber Security",
    "Full Stack Development"
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header and selection */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
             Upload Candidates
          </h1>
          <p className="text-slate-500 font-medium">Add new candidates to the system via bulk upload or manual entry.</p>
        </div>

        {activeView !== 'options' && (
          <button 
            onClick={() => setActiveView('options')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Options
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeView === 'options' ? (
          <motion.div 
            key="options"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {[
              { id: 'bulk', title: 'CSV/Excel Upload', desc: 'Upload multiple candidates at once using a spreadsheet template.', icon: <Layers className="w-8 h-8" /> },
              { id: 'single', title: 'Manual Entry', desc: 'Add a single candidate to the system manually.', icon: <UserPlus className="w-8 h-8" /> }
            ].map(opt => (
              <button 
                key={opt.id}
                onClick={() => setActiveView(opt.id)}
                className="bg-white p-10 rounded-3xl border border-slate-200 hover:border-blue-300 hover:shadow-md text-center group transition-all"
              >
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                   {opt.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{opt.title}</h3>
                <p className="text-sm font-medium text-slate-500 max-w-[240px] mx-auto">{opt.desc}</p>
              </button>
            ))}
          </motion.div>
        ) : activeView === 'bulk' ? (
          <motion.div 
            key="bulk"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Download template */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
               <div>
                  <h4 className="text-sm font-bold text-slate-900">Download Template</h4>
                  <p className="text-xs text-slate-500 mt-1">Use this CSV template to format your candidate data correctly.</p>
               </div>
               <button 
                 onClick={downloadTemplate}
                 className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
               >
                  <Download className="w-4 h-4" />
                  Template.csv
               </button>
            </div>

            {uploadStatus && (
               <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between text-emerald-700">
                  <div className="flex items-center gap-3">
                     <CheckCircle2 className="w-5 h-5" />
                     <p className="text-sm font-bold">{uploadStatus.message}</p>
                  </div>
                  <button onClick={() => setUploadStatus(null)} className="p-1 hover:bg-emerald-100 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
               </div>
            )}

            {/* Drag & Drop File Zone */}
            <div 
              className={`bg-white rounded-3xl border-dashed border-2 p-16 flex flex-col items-center justify-center text-center transition-colors cursor-pointer
                ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
               <input type="file" ref={fileInputRef} onChange={(e) => processFile(e.target.files?.[0])} className="hidden" accept=".csv, .xlsx, .xls" />
               <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                  <FileSpreadsheet className="w-8 h-8" />
               </div>
               <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {file ? file.name : 'Click or drag file to upload'}
               </h3>
               <p className="text-sm text-slate-500">
                  {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Supports .csv, .xlsx, .xls'}
               </p>
            </div>

            {parsedData.length > 0 && (
               <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                     <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Preview (First 5 Rows)</span>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm">
                        <thead>
                           <tr className="border-b border-slate-200 bg-slate-50">
                              <th className="py-3 px-6 font-semibold text-slate-600">Candidate</th>
                              <th className="py-3 px-6 font-semibold text-slate-600">Email</th>
                              <th className="py-3 px-6 font-semibold text-slate-600">Domain</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {parsedData.map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                 <td className="py-3 px-6 font-medium text-slate-900">{row.name}</td>
                                 <td className="py-3 px-6 text-slate-500">{row.email}</td>
                                 <td className="py-3 px-6">
                                    <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded-md">{row.domain}</span>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}

            <div className="flex justify-end pt-4">
               <button 
                  onClick={handleImport}
                  disabled={!file || isUploading}
                  className="px-8 py-3 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
               >
                  {isUploading ? <BrainCircuit className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                  {isUploading ? 'Uploading...' : 'Upload Candidates'}
               </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="single"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {singleSaveStatus && (
               <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between text-emerald-700">
                  <div className="flex items-center gap-3">
                     <CheckCircle2 className="w-5 h-5" />
                     <p className="text-sm font-bold">Candidate Successfully Added.</p>
                  </div>
                  <button onClick={() => setSingleSaveStatus(null)} className="p-1 hover:bg-emerald-100 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
               </div>
            )}

            {/* Manual Form Entry */}
            <form onSubmit={handleSaveSingle} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-10 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-700 ml-1">Full Name</label>
                     <div className="relative">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                           type="text" required value={singleInternData.name}
                           onChange={(e) => setSingleInternData({...singleInternData, name: e.target.value})}
                           className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                           placeholder="John Doe"
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-700 ml-1">Email Address</label>
                     <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                           type="email" required value={singleInternData.email}
                           onChange={(e) => setSingleInternData({...singleInternData, email: e.target.value})}
                           className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                           placeholder="john@example.com"
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-700 ml-1">Mobile Number</label>
                     <div className="relative">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                           type="tel" required pattern="[0-9]{10}" maxLength="10" value={singleInternData.mobile}
                           onChange={(e) => setSingleInternData({...singleInternData, mobile: e.target.value})}
                           className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                           placeholder="9876543210"
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-700 ml-1">Domain</label>
                     <div className="relative">
                        <Layout className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select 
                           required value={singleInternData.domain}
                           onChange={(e) => setSingleInternData({...singleInternData, domain: e.target.value})}
                           className="w-full h-12 pl-11 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer"
                        >
                           <option value="" disabled>Select Domain</option>
                           {domains.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <div className="flex items-center justify-between ml-1">
                        <label className="text-xs font-bold text-slate-700">Intern Unique ID</label>
                        <span className="text-[10px] font-semibold text-slate-400">Format: ATHENURA/YY/XXXXX</span>
                     </div>
                     <div className="relative">
                        <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                           type="text" required value={singleInternData.uniqueId}
                           onChange={(e) => setSingleInternData({...singleInternData, uniqueId: e.target.value.toUpperCase()})}
                           pattern="^ATHENURA/\d{2}/\d{5}$"
                           title="Format must be ATHENURA/YY/XXXXX"
                           className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                           placeholder="ATHENURA/25/10115"
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-700 ml-1">Joining Date</label>
                     <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                           type="date" required value={singleInternData.joiningDate}
                           onChange={(e) => setSingleInternData({...singleInternData, joiningDate: e.target.value})}
                           className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                        />
                     </div>
                  </div>
               </div>

               <div className="pt-6 flex justify-end">
                  <button 
                     type="submit"
                     disabled={isSavingSingle}
                     className="px-8 py-3 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                  >
                     {isSavingSingle ? <BrainCircuit className="w-4 h-4 animate-spin text-white" /> : <UserPlus className="w-4 h-4 fill-white" />}
                     Add Candidate
                  </button>
               </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadInterns;
