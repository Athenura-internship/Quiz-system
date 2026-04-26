import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiCall } from '../utils/api';
import * as XLSX from 'xlsx';

const UploadInterns = () => {
  const [activeView, setActiveView] = useState('options'); // 'options', 'bulk', 'single'

  // Bulk Upload State
  const [file, setFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const fileInputRef = useRef(null);
  const [parsedData, setParsedData] = useState([]);

  // Single Intern State
  const [singleInternData, setSingleInternData] = useState({
    name: '',
    email: '',
    mobile: '',
    domain: '',
    uniqueId: '',
    joiningDate: ''
  });
  const [isSavingSingle, setIsSavingSingle] = useState(false);
  const [singleSaveStatus, setSingleSaveStatus] = useState(null);

  // Bulk Upload Handlers
  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => { setIsDragOver(false); };

  const processFile = (selectedFile) => {
    if (!selectedFile) return;
    const validTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    
    // Check extension if MIME type is empty (common in some browsers/OS)
    const fileName = selectedFile.name.toLowerCase();
    const isExcelOrCsv = fileName.endsWith('.csv') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    if (!validTypes.includes(selectedFile.type) && !isExcelOrCsv) {
      alert("Invalid file type. Please upload a CSV or Excel file.");
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
        
        // Map common header variations to our expected format
        const mappedData = jsonData.slice(0, 10).map(row => {
          // Find value by case-insensitive key search
          const findVal = (keys) => {
            const rowKeys = Object.keys(row);
            for (const k of keys) {
              const match = rowKeys.find(rk => rk.toLowerCase().replace(/[\s_]/g, '') === k.toLowerCase().replace(/[\s_]/g, ''));
              if (match) return row[match];
            }
            return '';
          };

          return {
            name: findVal(['name', 'fullname', 'internname']),
            email: findVal(['email', 'emailaddress', 'mail']),
            mobile: String(findVal(['mobile', 'phone', 'contact', 'phonenumber']) || 'N/A'),
            domain: findVal(['domain', 'track', 'department']),
            uniqueId: findVal(['uniqueid', 'id', 'internid']),
            joiningDate: findVal(['joiningdate', 'date', 'joinedon'])
          };
        });

        setParsedData(mappedData);
      } catch (error) {
        console.error("Error parsing file:", error);
        alert("Failed to parse file. Please check the format.");
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setIsUploading(true);
    setUploadStatus(null);
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiCall("/admin/upload-interns", {
        method: "POST",
        body: formData,
        headers: {} // apiCall will handle Auth, but we shouldn't set Content-Type for FormData
      });

      setUploadStatus({ type: 'success', message: response.message });
      setFile(null);
      setParsedData([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error("Bulk upload failed:", error);
      alert(error.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelBulk = () => {
    setFile(null);
    setParsedData([]);
    setUploadStatus(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setActiveView('options');
  };

  // Single Intern Handlers
  const handleSingleChange = (e) => {
    setSingleInternData({ ...singleInternData, [e.target.name]: e.target.value });
  };

  const handleSaveSingle = async (e) => {
    e.preventDefault();
    setIsSavingSingle(true);
    setSingleSaveStatus(null);
    
    try {
      console.log("Submitting Intern Payload:", singleInternData);
      await apiCall("/admin/upload-single-intern", {
        method: "POST",
        body: JSON.stringify(singleInternData),
      });

      setSingleSaveStatus('success');
      setSingleInternData({ name: '', email: '', mobile: '', domain: '', uniqueId: '', joiningDate: '' });
    } catch (error) {
      console.error("Failed to add intern:", error);
      alert(error.message || "Failed to add intern");
    } finally {
      setIsSavingSingle(false);
    }
  };

  return (
    <div className="w-full h-full p-4 sm:p-6 lg:p-8 font-sans overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-200/80 dark:border-slate-700/50 p-6 md:p-8 lg:p-10 transition-colors duration-300"
      >
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black bg-gradient-to-r from-slate-800 to-slate-900 dark:from-white dark:to-slate-100 bg-clip-text text-transparent mb-2">
              Upload Interns
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">
              {activeView === 'options' && 'Select how you want to add interns'}
              {activeView === 'bulk' && 'Bulk import interns via CSV or Excel file'}
              {activeView === 'single' && 'Add a new intern manually'}
            </p>
          </div>
          
          {activeView !== 'options' && (
            <button 
              onClick={() => { setActiveView('options'); setUploadStatus(null); setSingleSaveStatus(null); }}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-colors self-start md:self-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Options
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {activeView === 'options' && (
            <motion.div 
              key="options"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Option 1: Bulk Upload */}
              <div 
                onClick={() => setActiveView('bulk')}
                className="group cursor-pointer bg-slate-50 hover:bg-sky-50 dark:bg-slate-800/50 dark:hover:bg-sky-900/20 border-2 border-slate-200/50 hover:border-sky-400 dark:border-slate-700/50 dark:hover:border-sky-500 rounded-2xl p-8 transition-all flex flex-col items-center text-center shadow-sm hover:shadow-md"
              >
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-sky-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Bulk Upload Interns</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Import multiple interns at once using a CSV or Excel file.
                </p>
              </div>

              {/* Option 2: Single Intern */}
              <div 
                onClick={() => setActiveView('single')}
                className="group cursor-pointer bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800/50 dark:hover:bg-indigo-900/20 border-2 border-slate-200/50 hover:border-indigo-400 dark:border-slate-700/50 dark:hover:border-indigo-500 rounded-2xl p-8 transition-all flex flex-col items-center text-center shadow-sm hover:shadow-md"
              >
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-indigo-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Add Single Intern</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Manually add a single intern using a form.
                </p>
              </div>
            </motion.div>
          )}

           {activeView === 'bulk' && (
            <motion.div
              key="bulk"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {uploadStatus?.type === 'success' && (
                <div className="mb-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <p className="text-emerald-800 dark:text-emerald-400 font-medium">{uploadStatus.message || 'Successfully imported interns!'}</p>
                  </div>
                  <button onClick={() => setUploadStatus(null)} className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 font-bold text-sm transition-colors">
                    Dismiss
                  </button>
                </div>
              )}

              <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6 md:p-8">
                <div 
                  className={`
                    w-full min-h-[240px] sm:min-h-[300px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 sm:p-8 transition-all cursor-pointer bg-white dark:bg-slate-800/50
                    ${isDragOver 
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 shadow-inner' 
                      : 'border-slate-300 dark:border-slate-600 hover:border-sky-400 dark:hover:border-sky-500'}
                  `}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                  />
                  
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center shadow-sm mb-6 text-sky-500 dark:text-sky-400 transition-transform hover:scale-105">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                    {file ? file.name : 'Click or Drag & Drop'}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm text-center max-w-sm">
                    {file 
                      ? `${(file.size / 1024).toFixed(2)} KB selected.` 
                      : 'Upload a CSV or Excel file containing intern details (Name, Email, Mobile, Domain).'}
                  </p>
                </div>

                {parsedData.length > 0 && !isUploading && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-8"
                  >
                    <h4 className="font-bold text-sm uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-4 px-2">Data Preview</h4>
                    <div className="bg-white dark:bg-slate-800/80 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700/50 shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm [&>tbody>tr]:hover:bg-slate-50/50 [&>tbody>tr]:dark:hover:bg-slate-700/30">
                          <thead className="bg-slate-100/50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300">
                            <tr>
                              <th className="py-3 px-4 sm:px-6 font-bold uppercase text-xs">Name</th>
                              <th className="py-3 px-4 sm:px-6 font-bold uppercase text-xs">Email</th>
                              <th className="py-3 px-4 sm:px-6 font-bold uppercase text-xs">Phone</th>
                              <th className="py-3 px-4 sm:px-6 font-bold uppercase text-xs">Domain</th>
                              <th className="py-3 px-4 sm:px-6 font-bold uppercase text-xs">Unique ID</th>
                              <th className="py-3 px-4 sm:px-6 font-bold uppercase text-xs">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {parsedData.map((row, idx) => (
                              <tr key={idx}>
                                <td className="py-3 px-4 sm:px-6 font-medium text-slate-800 dark:text-slate-200">{row.name}</td>
                                <td className="py-3 px-4 sm:px-6 text-slate-600 dark:text-slate-400">{row.email}</td>
                                <td className="py-3 px-4 sm:px-6 text-slate-600 dark:text-slate-400 text-xs">{row.mobile || 'N/A'}</td>
                                <td className="py-3 px-4 sm:px-6 text-slate-600 dark:text-slate-400 text-xs">{row.domain}</td>
                                <td className="py-3 px-4 sm:px-6 font-mono text-xs text-slate-500 dark:text-slate-400">{row.uniqueId}</td>
                                <td className="py-3 px-4 sm:px-6 text-xs text-slate-500 dark:text-slate-400">{row.joiningDate}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-end gap-4 border-t border-slate-200/50 dark:border-slate-700/50 pt-6">
                  <button 
                    onClick={handleCancelBulk}
                    disabled={isUploading}
                    className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all shadow-sm disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleImport}
                    disabled={!file || parsedData.length === 0 || isUploading}
                    className="w-full sm:w-auto px-8 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-[0_4px_12px_rgba(14,165,233,0.3)] hover:shadow-[0_6px_16px_rgba(14,165,233,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Importing...
                      </>
                    ) : (
                      'Import Data'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeView === 'single' && (
            <motion.div
              key="single"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {singleSaveStatus === 'success' && (
                <div className="mb-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <p className="text-emerald-800 dark:text-emerald-400 font-medium">Intern added successfully!</p>
                  </div>
                  <button onClick={() => setSingleSaveStatus(null)} className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 font-bold text-sm transition-colors">
                    Dismiss
                  </button>
                </div>
              )}

              <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6 md:p-8">
                <form onSubmit={handleSaveSingle} className="space-y-6 max-w-2xl mx-auto">
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Full Name *
                    </label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      value={singleInternData.name}
                      onChange={handleSingleChange}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-slate-100 transition-all outline-none"
                      placeholder="e.g. John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Email Address *
                    </label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      value={singleInternData.email}
                      onChange={handleSingleChange}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-slate-100 transition-all outline-none"
                      placeholder="e.g. john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Phone Number *
                    </label>
                    <input 
                      type="tel" 
                      name="mobile"
                      required
                      pattern="[0-9]{10}"
                      maxLength="10"
                      title="Phone number must be exactly 10 digits without spaces or special characters"
                      value={singleInternData.mobile}
                      onChange={handleSingleChange}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-slate-100 transition-all outline-none"
                      placeholder="e.g. 9876543210"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Domain *
                    </label>
                    <select 
                      name="domain"
                      required
                      value={singleInternData.domain}
                      onChange={handleSingleChange}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-slate-100 transition-all outline-none"
                    >
                      <option value="" disabled>Select a domain</option>
                      <option value="DATA SCIENCE & ANALYTICS">DATA SCIENCE & ANALYTICS</option>
                      <option value="HUMAN RESOURCES">HUMAN RESOURCES</option>
                      <option value="APPLICATION DEVELOPMENT">APPLICATION DEVELOPMENT</option>
                      <option value="SOCIAL MEDIA MANAGEMENT">SOCIAL MEDIA MANAGEMENT</option>
                      <option value="GRAPHIC DESIGN">GRAPHIC DESIGN</option>
                      <option value="DIGITAL MARKETING">DIGITAL MARKETING</option>
                      <option value="VIDEO EDITING">VIDEO EDITING</option>
                      <option value="FULL STACK DEVELOPMENT">FULL STACK DEVELOPMENT</option>
                      <option value="MERN STACK DEVELOPMENT">MERN STACK DEVELOPMENT</option>
                      <option value="CONTENT WRITING">CONTENT WRITING</option>
                      <option value="CONTENT CREATOR">CONTENT CREATOR</option>
                      <option value="UI/UX DESIGNING">UI/UX DESIGNING</option>
                      <option value="FRONT-END DEVELOPER">FRONT-END DEVELOPER</option>
                      <option value="BACK-END DEVELOPER">BACK-END DEVELOPER</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Unique ID *
                      </label>
                      <input 
                        type="text" 
                        name="uniqueId"
                        required
                        value={singleInternData.uniqueId}
                        onChange={handleSingleChange}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-slate-100 transition-all outline-none"
                        placeholder="e.g. ATHENURA/25/10115"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Joining Date *
                      </label>
                      <input 
                        type="date" 
                        name="joiningDate"
                        required
                        value={singleInternData.joiningDate}
                        onChange={handleSingleChange}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-slate-100 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200/50 dark:border-slate-700/50 flex flex-col sm:flex-row items-center justify-end gap-4">
                    <button 
                      type="button"
                      onClick={() => setActiveView('options')}
                      disabled={isSavingSingle}
                      className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all shadow-sm disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isSavingSingle}
                      className="w-full sm:w-auto px-8 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-[0_4px_12px_rgba(99,102,241,0.3)] hover:shadow-[0_6px_16px_rgba(99,102,241,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSavingSingle ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Intern'
                      )}
                    </button>
                  </div>

                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};

export default UploadInterns;
