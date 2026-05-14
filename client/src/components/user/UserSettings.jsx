import React, { useState, useEffect } from "react";
import { AlertTriangle, Save, LogOut, User, Key, Download, Trash2, FileText, Globe, Loader2 } from "lucide-react";
import { useTranslation } from 'react-i18next';
import axios from "axios";

export default function UserSettings({ onLogout }) {
  const { t, i18n } = useTranslation();
  const [saving, setSaving] = useState(false);
  
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
      console.error("Failed to sync settings:", error);
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
      alert(t("Failed to generate report."));
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
      alert(t("Failed to export backup."));
    }
  };

  const handleWipeVault = async () => {
    if (window.confirm(t("WARNING: This will permanently delete all encrypted journals, habits, and AI settings. Are you sure?"))) {
      try {
        const activeUser = localStorage.getItem("username");
        if (activeUser) await axios.delete(`http://127.0.0.1:8000/nuke/${activeUser}`);
      } catch (err) {
        console.error("Nuke failed:", err);
      } finally {
        localStorage.clear();
        onLogout(); 
      }
    }
  };

  return (
    <div className="py-10 px-6 max-w-[900px] mx-auto flex flex-col gap-8 font-sans pb-[120px]">
      
      <header className="flex flex-col gap-2">
        <h1 className="text-[clamp(32px,4vw,40px)] font-extrabold text-slate-900 m-0 tracking-tight">
          {t('Vault Settings')}
        </h1>
        <p className="m-0 text-slate-500 text-base">{t('Manage your identity and data security.')}</p>
      </header>

      {/* Profile & Identity */}
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
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-[15px] outline-none focus:bg-white focus:border-amber-500" 
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">{t('Vault ID')}</label>
            <div className="relative">
              <Key size={18} className="absolute left-4 top-3.5 text-slate-400" />
              <input type="text" value={profile.username} disabled className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">{t('Primary Language')}</label>
            <div className="relative">
              <Globe size={18} className="absolute left-4 top-3.5 text-slate-400" />
              <select 
                value={config.language} 
                onChange={handleLanguageChange} 
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 outline-none appearance-none cursor-pointer"
              >
                <option value="en-US">English (US)</option>
                <option value="si-LK">Sinhala (සිංහල)</option>
                <option value="ta-LK">Tamil (தமிழ்)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Ethical Fail-safes & Crisis Detection */}
      <div className="bg-white rounded-[32px] p-8 border border-rose-200 shadow-sm flex flex-col gap-6">
        <h3 className="m-0 text-rose-700 text-xl font-bold flex items-center gap-3 border-b border-rose-100 pb-4">
          <AlertTriangle size={22} className="text-rose-600" /> {t('Ethical Fail-safes & Crisis Detection')}
        </h3>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold uppercase text-rose-800 tracking-wider">{t('Trigger Sensitivity')}</label>
              <span className="text-sm font-bold text-rose-600">{t('Level')} {config.crisis_sensitivity}</span>
            </div>
            <input type="range" min="1" max="10" value={config.crisis_sensitivity} onChange={(e) => setConfig({...config, crisis_sensitivity: parseInt(e.target.value)})} className="w-full accent-rose-600 cursor-pointer" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase text-rose-800 tracking-wider">{t('Primary Keyword Watchlist')}</label>
            <textarea value={config.watchlist} onChange={(e) => setConfig({...config, watchlist: e.target.value})} className="w-full min-h-[80px] p-4 rounded-xl border border-rose-200 bg-rose-50 font-mono text-[13px]" />
          </div>
        </div>
      </div>

      {/* Data & Vault Management */}
      <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm flex flex-col gap-6">
        <h3 className="m-0 text-slate-900 text-xl font-bold flex items-center gap-3 border-b border-slate-100 pb-4">
          <Key size={22} className="text-slate-600" /> {t('Data & Vault Management')}
        </h3>
        <div className="flex flex-col gap-4">
          <button onClick={handleExportCSV} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:border-emerald-500 hover:bg-white transition-all text-left w-full">
            <FileText size={18} className="text-emerald-500" />
            <div className="flex flex-col">
              <span className="text-sm font-bold">{t('Generate Weekly Report (PDF/CSV)')}</span>
              <span className="text-xs text-slate-500">{t('Download a human-readable summary of your trends.')}</span>
            </div>
          </button>
          <button onClick={handleExportJSON} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:border-blue-500 hover:bg-white transition-all text-left w-full">
            <Download size={18} className="text-blue-500" />
            <div className="flex flex-col">
              <span className="text-sm font-bold">{t('Export Encrypted Backup')}</span>
              <span className="text-xs text-slate-500">{t('Download your entire vault as an AES-256 JSON file.')}</span>
            </div>
          </button>
          <button onClick={handleWipeVault} className="flex items-center gap-4 p-4 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 transition-all text-left w-full">
            <Trash2 size={18} className="text-rose-600" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-rose-700">{t('Self-Destruct Vault')}</span>
              <span className="text-xs text-rose-600">{t('Permanently delete all local data and AI settings.')}</span>
            </div>
          </button>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between items-center pt-4">
        <button onClick={onLogout} className="flex items-center gap-2 text-slate-500 font-semibold hover:text-slate-900 transition-colors">{t('Secure Logout')}</button>
        <button onClick={handleSave} disabled={saving} className="bg-gradient-to-br from-slate-800 to-slate-700 text-white py-3.5 px-8 rounded-full font-bold shadow-lg hover:-translate-y-0.5 transition-all">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? t('Saving...') : t('Save Parameters')}
        </button>
      </div>
    </div>
  );
}