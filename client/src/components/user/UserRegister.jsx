import { useState } from "react";
import { Sparkles, User, Lock, ArrowLeft, Loader2, ShieldAlert } from "lucide-react";
import axios from "axios";
import { useTranslation } from 'react-i18next'; 

export default function Register({ onRegister, onBack, onSwitchToLogin }) {
  const { t } = useTranslation(); 

  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false); 
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  
  const handleInitialSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert(t("Passwords don't match!"));
      return;
    }
    
    setShowTerms(true);
  };

  
  const executeRegistration = async () => {
    setShowTerms(false); // Hide modal
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/register", {
        username: formData.username,
        password: formData.password
      });

      if (response.status === 200) {
        localStorage.setItem("username", formData.username);
        alert(t("Account created successfully! Welcome to MoodCast."));
        onRegister("user"); 
      }
    } catch (error) {
      console.error("Registration Error:", error);
      const errorMsg = error.response?.data?.detail || t("Could not connect to the server. Make sure your Python backend is running!");
      alert(t("Registration failed:") + " " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f8fd] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] bg-purple-500 rounded-full blur-[100px] opacity-15 animate-pulse" />
        <div 
          className="absolute top-[40%] right-[10%] w-[400px] h-[400px] bg-cyan-500 rounded-full blur-[100px] opacity-15 animate-pulse" 
          style={{ animationDelay: "1s" }} 
        />
      </div>

      <div className="w-full max-w-[440px] bg-white/90 backdrop-blur-xl rounded-[32px] p-10 md:p-12 border border-white/50 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] relative z-10">
        
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-transparent border-none text-slate-500 text-sm font-semibold cursor-pointer p-0 mb-8 transition-colors hover:text-slate-800"
        >
          <ArrowLeft size={16} /> {t("Back")}
        </button>

        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-[0_10px_20px_-5px_rgba(236,72,153,0.4)]">
            <Sparkles size={28} className="text-white" />
          </div>
        </div>

        <h2 className="text-[32px] font-extrabold text-center m-0 mb-2 text-slate-800 tracking-tight">
          {t("Create Account")}
        </h2>
        <p className="text-center text-slate-500 text-[15px] m-0 mb-8 leading-relaxed">
          {t("Start your mental wellness journey today")}
        </p>

        
        <form onSubmit={handleInitialSubmit} className="flex flex-col gap-5">
          
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-sm font-semibold text-slate-600">{t("User ID")}</label>
            <div className="relative flex items-center">
              <User size={18} className="text-slate-400 absolute left-4" />
              <input
                id="username" 
                type="text" 
                placeholder={t("Choose a unique ID")} 
                required
                value={formData.username} 
                onChange={(e) => handleChange("username", e.target.value)}
                className="w-full h-[52px] pl-12 pr-4 rounded-2xl border-2 border-slate-200 bg-slate-50 text-[15px] text-slate-700 outline-none transition-colors focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 box-border"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-semibold text-slate-600">{t("Master Password")}</label>
            <div className="relative flex items-center">
              <Lock size={18} className="text-slate-400 absolute left-4" />
              <input
                id="password" 
                type="password" 
                placeholder={t("Create a strong password")} 
                required 
                minLength={6}
                value={formData.password} 
                onChange={(e) => handleChange("password", e.target.value)}
                className="w-full h-[52px] pl-12 pr-4 rounded-2xl border-2 border-slate-200 bg-slate-50 text-[15px] text-slate-700 outline-none transition-colors focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 box-border"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-600">{t("Confirm Password")}</label>
            <div className="relative flex items-center">
              <Lock size={18} className="text-slate-400 absolute left-4" />
              <input
                id="confirmPassword" 
                type="password" 
                placeholder={t("Confirm your password")} 
                required
                value={formData.confirmPassword} 
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                className="w-full h-[52px] pl-12 pr-4 rounded-2xl border-2 border-slate-200 bg-slate-50 text-[15px] text-slate-700 outline-none transition-colors focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 box-border"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[56px] mt-2 rounded-full border-none text-white text-base font-bold flex items-center justify-center gap-2 bg-gradient-to-br from-purple-500 to-pink-500 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-pink-500/40 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> {t("Securing Vault...")}</>
            ) : (
              t("Create Account")
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          {t("Already have an account?")}{" "}
          <button 
            onClick={onSwitchToLogin}
            className="bg-transparent border-none text-purple-500 font-bold cursor-pointer p-0 hover:text-purple-600 hover:underline transition-all"
          >
            {t("Sign in")}
          </button>
        </div>
      </div>

      
      {showTerms && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-[480px] p-8 shadow-2xl flex flex-col gap-6 transform transition-all">
            
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <ShieldAlert size={24} className="text-amber-600" />
              </div>
              <div className="flex flex-col">
                <h3 className="m-0 text-xl font-extrabold text-slate-800">{t('Terms & AI Disclaimer')}</h3>
                <p className="m-0 text-sm text-slate-500 font-medium">{t('Please read carefully before proceeding.')}</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-4 text-[14px] text-slate-600 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-200 h-[220px] overflow-y-auto">
              <p className="m-0">
                <strong className="text-slate-800">1. AI Analysis:</strong> {t('This application uses local Artificial Intelligence to analyze your entries and provide supportive insights.')}
              </p>
              <p className="m-0">
                <strong className="text-amber-700">2. Not Medical Advice:</strong> {t('AI is not 100% accurate and can make mistakes. The insights provided are for personal reflection only and do NOT constitute professional medical advice, diagnosis, or treatment.')}
              </p>
              <p className="m-0">
                <strong className="text-rose-700">3. Emergency:</strong> {t('If you are in crisis, please use the emergency resources provided in the app or contact a medical professional.')}
              </p>
            </div>

            <div className="flex gap-3 mt-2">
              <button 
                onClick={() => setShowTerms(false)} 
                className="flex-1 py-3.5 rounded-full font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors border-none cursor-pointer"
              >
                {t('Cancel')}
              </button>
              <button 
                onClick={executeRegistration} 
                className="flex-[1.5] py-3.5 rounded-full font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/30 border-none cursor-pointer hover:-translate-y-0.5"
              >
                {t('I Understand & Agree')}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}