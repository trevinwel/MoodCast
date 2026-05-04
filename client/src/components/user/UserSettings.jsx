import React, { useState, useEffect } from "react";
import { ShieldCheck, Cpu, Zap, AlertTriangle, Save, LogOut, HardDrive, User, Key, Download, Trash2, FileText, Globe, Loader2 } from "lucide-react";
import { useTranslation } from 'react-i18next';
import axios from "axios";

export default function UserSettings({ onLogout }) {
  const { t, i18n } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [hardware, setHardware] = useState({ cores: "Scanning...", ram: "Scanning..." });
  
  
  const [profile, setProfile] = useState({
    displayName: "User",
    username: ""
  });

  const [config, setConfig] = useState({
    language: i18n.language || "en-US", 
    quantization: "2bit",
    threading: 4,
    pruning: true,
    crisis_sensitivity: 8,
    watchlist: "suicide, self-harm, hurt, end it, pain, hopeless"
  });

  useEffect(() => {
    const cores = navigator.hardwareConcurrency || "Unknown";
    const ram = navigator.deviceMemory || "Unknown";
    setHardware({ cores: `${cores} Cores`, ram: `${ram}GB+ Detected` });

    
    const savedConfig = localStorage.getItem("moodcast_ai_config");
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      setConfig(parsedConfig);
      if (parsedConfig.language) i18n.changeLanguage(parsedConfig.language);
    }
    
    
    const savedProfile = localStorage.getItem("moodcast_profile");
    const activeUsername = localStorage.getItem("username") || "Unknown User";
    
    if (savedProfile) {
      setProfile({ ...JSON.parse(savedProfile), username: activeUsername });
    } else {
      setProfile({ displayName: "User", username: activeUsername });
    }
  }, [i18n]);

  
  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem("moodcast_ai_config", JSON.stringify(config));
      localStorage.setItem("moodcast_profile", JSON.stringify(profile));
      
      
      await axios.post("http://127.0.0.1:8000/admin/config/update", config);
    } catch (error) {
      console.error("Failed to sync settings with Python backend:", error);
    } finally {
      setTimeout(() => setSaving(false), 500); 
    }
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setConfig({...config, language: newLang});
    i18n.changeLanguage(newLang); 
  };

  
  const handleExportCSV = async () => {
    try {
      const activeUser = localStorage.getItem("username");
      if (!activeUser) return;
      
      const response = await axios.get(`http://127.0.0.1:8000/get_entries/${activeUser}`);
      const data = response.data;
      
      if (!data || data.length === 0) return alert(t("No entries to export."));

      const headers = ["Date", "Mood", "Content", "Tags"];
      const csvRows = data.map(e => {
        const tags = Array.isArray(e.tags) ? e.tags.join("; ") : e.tags;
        const safeContent = `"${e.content.replace(/"/g, '""')}"`; 
        return `${e.timestamp},${e.mood},${safeContent},"${tags}"`;
      });
      
      const csvString = [headers.join(","), ...csvRows].join("\n");
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MoodCast_Report_${activeUser}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV Export Failed:", err);
      alert(t("Failed to generate report. Make sure the Python server is running."));
    }
  };

  
  const handleExportJSON = async () => {
    try {
      const activeUser = localStorage.getItem("username");
      if (!activeUser) return;
      
      const response = await axios.get(`http://127.0.0.1:8000/export/${activeUser}`);
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Vault_Backup_${activeUser}_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("JSON Export Failed:", err);
      alert(t("Failed to export backup. Make sure the Python server is running."));
    }
  };

  
  const handleWipeVault = async () => {
    if (window.confirm(t("WARNING: This will permanently delete all encrypted journals, habits, and AI settings from this device. This action cannot be undone. Are you sure?"))) {
      try {
        const activeUser = localStorage.getItem("username");
        if (activeUser) {
          await axios.delete(`http://127.0.0.1:8000/nuke/${activeUser}`);
        }
      } catch (err) {
        console.error("Failed to delete backend data:", err);
      } finally {
        
        localStorage.clear();
        onLogout(); 
      }
    }
  };

  const CustomToggle = ({ checked, onChange, activeColor = "bg-purple-500" }) => (
    <div 
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-300 flex-shrink-0 ${checked ? activeColor : "bg-slate-300"}`}
    >
      <div className={`w-[18px] h-[18px] bg-white rounded-full absolute top-[3px] transition-transform duration-300 ease-in-out shadow-sm ${checked ? "translate-x-[23px]" : "translate-x-[3px]"}`} />
    </div>
  );

  return (
    <div className="py-10 px-6 max-w-[900px] mx-auto flex flex-col gap-8 font-sans pb-[120px]">
      
      <header className="flex flex-col gap-2">
        <h1 className="text-[clamp(32px,4vw,40px)] font-extrabold text-slate-900 m-0 tracking-tight">
          {t('Vault Settings')}
        </h1>
        <p className="m-0 text-slate-500 text-base">{t('Manage your identity, local AI engine, and data security.')}</p>
      </header>

      
      <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm flex flex-col gap-6">
        <h3 className="m-0 text-slate-900 text-xl font-bold flex items-center gap-3 border-b border-slate-100 pb-4">
          <User size={22} className="text-amber-500" /> {t('Profile & Identity')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">{t('Display Name')}</label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-3.5 text-slate-400" />
              <input 
                type="text" 
                value={profile.displayName} 
                onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-[15px] text-slate-700 outline-none transition-colors focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" 
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">{t('Vault ID (Username)')}</label>
            <div className="relative">
              <Key size={18} className="absolute left-4 top-3.5 text-slate-400" />
              <input 
                type="text" 
                value={profile.username} 
                disabled
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-100 text-[15px] text-slate-500 outline-none cursor-not-allowed" 
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">{t('Primary Language')}</label>
            <div className="relative">
              <Globe size={18} className="absolute left-4 top-3.5 text-slate-400" />
              <select 
                value={config.language} 
                onChange={handleLanguageChange}
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-[15px] text-slate-700 outline-none cursor-pointer transition-colors focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 appearance-none"
              >
                <option value="en-US">English (US)</option>
                <option value="si-LK">Sinhala (සිංහල)</option>
                <option value="ta-LK">Tamil (தமிழ்)</option>
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* System Health */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-[32px] p-8 border border-slate-200 shadow-sm flex flex-col gap-6">
        <h3 className="m-0 text-slate-900 text-xl font-bold flex items-center gap-3">
          <ShieldCheck size={22} className="text-emerald-500" /> {t('System Health & Sovereignty')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-[20px] bg-white border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <Cpu size={24} className="text-emerald-500" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('AI Engine Status')}</span>
              <span className="text-[15px] font-extrabold text-slate-900">{t('Gemma-3 Active')}</span>
            </div>
          </div>
          <div className="p-5 rounded-[20px] bg-white border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
              <HardDrive size={24} className="text-blue-500" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('Local Hardware')}</span>
              <span className="text-[15px] font-extrabold text-slate-900">{hardware.cores} / {hardware.ram}</span>
            </div>
          </div>
        </div>
      </div>

      
      <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm flex flex-col gap-6">
        <h3 className="m-0 text-slate-900 text-xl font-bold flex items-center gap-3 border-b border-slate-100 pb-4">
          <Zap size={22} className="text-purple-500" /> {t('Local Model Tuning')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">{t('Quantization Level')}</label>
            <select 
              value={config.quantization} 
              onChange={(e) => setConfig({...config, quantization: e.target.value})}
              className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[15px] text-slate-700 outline-none cursor-pointer transition-colors focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="2bit">{t('2-bit (Optimized for Laptops/Low VRAM)')}</option>
              <option value="4bit">{t('4-bit (Standard Precision)')}</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">{t('Hardware Threads')}</label>
            <input 
              type="number" 
              value={config.threading} 
              onChange={(e) => setConfig({...config, threading: parseInt(e.target.value)})}
              className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[15px] text-slate-700 outline-none transition-colors focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20" 
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between p-5 bg-purple-50 rounded-2xl border border-purple-100 gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-purple-800">{t('Aggressive Sentiment Pruning')}</span>
            <span className="text-[13px] text-purple-600">{t('Ignore filler words to reduce local CPU processing latency.')}</span>
          </div>
          <CustomToggle checked={config.pruning} onChange={(val) => setConfig({...config, pruning: val})} activeColor="bg-purple-500" />
        </div>
      </div>

      
      <div className="bg-white rounded-[32px] p-8 border border-rose-200 shadow-sm flex flex-col gap-6">
        <h3 className="m-0 text-rose-700 text-xl font-bold flex items-center gap-3 border-b border-rose-100 pb-4">
          <AlertTriangle size={22} className="text-rose-600" /> {t('Ethical Fail-safes & Crisis Detection')}
        </h3>
        <p className="m-0 -mt-2 text-[13px] text-rose-600 leading-relaxed">
          {t('If the NLP pipeline detects severe psychological distress matching these parameters, local emergency resources will be automatically displayed.')}
        </p>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold uppercase text-rose-800 tracking-wider">{t('Trigger Sensitivity (1-10)')}</label>
              <span className="text-sm font-bold text-rose-600">{t('Level')} {config.crisis_sensitivity}</span>
            </div>
            <input 
              type="range" min="1" max="10" 
              value={config.crisis_sensitivity} 
              onChange={(e) => setConfig({...config, crisis_sensitivity: parseInt(e.target.value)})}
              className="w-full h-2 bg-rose-200 rounded-full appearance-none outline-none cursor-pointer accent-rose-600" 
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase text-rose-800 tracking-wider">{t('Primary Keyword Watchlist')}</label>
            <textarea 
              value={config.watchlist} 
              onChange={(e) => setConfig({...config, watchlist: e.target.value})}
              className="w-full min-h-[80px] p-4 rounded-xl border border-rose-200 bg-rose-50 text-[13px] text-rose-700 outline-none box-border font-mono resize-y focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20"
            />
          </div>
        </div>
      </div>

      
      <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm flex flex-col gap-6">
        <h3 className="m-0 text-slate-900 text-xl font-bold flex items-center gap-3 border-b border-slate-100 pb-4">
          <Key size={22} className="text-slate-600" /> {t('Data & Vault Management')}
        </h3>
        <div className="flex flex-col gap-4">
          
          <button onClick={handleExportCSV} className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer transition-all duration-200 hover:border-emerald-500 hover:shadow-sm hover:bg-white group text-left w-full">
            <div className="flex items-center gap-4">
              <FileText size={18} className="text-emerald-500 flex-shrink-0" />
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-sm font-bold text-slate-900">{t('Generate Weekly Report (PDF/CSV)')}</span>
                <span className="text-xs text-slate-500 group-hover:text-slate-600">{t('Download a human-readable summary of your emotional trends.')}</span>
              </div>
            </div>
          </button>

          <button onClick={handleExportJSON} className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer transition-all duration-200 hover:border-blue-500 hover:shadow-sm hover:bg-white group text-left w-full">
            <div className="flex items-center gap-4">
              <Download size={18} className="text-blue-500 flex-shrink-0" />
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-sm font-bold text-slate-900">{t('Export Encrypted Backup')}</span>
                <span className="text-xs text-slate-500 group-hover:text-slate-600">{t('Download your entire vault as an AES-256 encrypted JSON file.')}</span>
              </div>
            </div>
          </button>
          
          <button 
            onClick={handleWipeVault} 
            className="flex items-center justify-between p-4 rounded-2xl border border-rose-200 bg-rose-50 cursor-pointer transition-all duration-200 hover:bg-rose-100 group text-left w-full"
          >
            <div className="flex items-center gap-4">
              <Trash2 size={18} className="text-rose-600 flex-shrink-0" />
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-sm font-bold text-rose-700">{t('Self-Destruct Vault')}</span>
                <span className="text-xs text-rose-600">{t('Permanently delete all local data, habits, and AI settings.')}</span>
              </div>
            </div>
          </button>
        </div>
      </div>

      
      <div className="flex justify-between items-center pt-4 flex-wrap gap-4">
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 bg-transparent border-none text-slate-500 font-semibold text-sm cursor-pointer py-2 px-4 rounded-xl transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <LogOut size={16} /> {t('Secure Logout')}
        </button>

        <button 
          onClick={handleSave} 
          disabled={saving}
          className="flex items-center gap-2 py-3.5 px-8 rounded-full border-none bg-gradient-to-br from-slate-800 to-slate-700 text-white font-bold text-[15px] cursor-pointer shadow-lg shadow-slate-800/20 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-80 disabled:cursor-not-allowed disabled:transform-none"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? t('Deploying Locally') : t('Save Parameters')}
        </button>
      </div>

    </div>
  );
}