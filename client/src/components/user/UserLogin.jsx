import { useState } from "react";
import { Sparkles, User, Lock, ArrowLeft, Loader2 } from "lucide-react";
import axios from "axios";
import { useTranslation } from 'react-i18next'; 

export default function Login({ onLogin, onBack, onSwitchToRegister }) {
  const { t } = useTranslation(); 

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/login", {
        username: username, 
        password: password
      });

      if (response.status === 200) {
       
        
        localStorage.setItem("jwt_token", response.data.access_token);
        localStorage.setItem("username", response.data.user);
        
        
        onLogin();
      }
    } catch (error) {
      console.error("Login Error:", error);
      const errorMsg = error.response?.data?.detail || t("Invalid credentials or server offline.");
      alert(t("Login failed:") + " " + errorMsg);
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
          {t("Welcome Back")}
        </h2>
        
        <p className="text-center text-slate-500 text-[15px] m-0 mb-10 leading-relaxed">
          {t("Unlock your sovereign mental health vault")}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-sm font-semibold text-slate-600">{t("User ID")}</label>
            <div className="relative flex items-center">
              <User size={18} className="text-slate-400 absolute left-4" />
              <input
                id="username"
                type="text"
                placeholder={t("Enter your User ID")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
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
                placeholder={t("Enter your password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
              <><Loader2 size={18} className="animate-spin" /> {t("Authenticating Vault...")}</>
            ) : (
              t("Secure Login")
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          {t("Don't have an account?")}{" "}
          <button 
            onClick={onSwitchToRegister}
            className="bg-transparent border-none text-purple-500 font-bold cursor-pointer p-0 hover:text-purple-600 hover:underline transition-all"
          >
            {t("Create Private Vault")}
          </button>
        </div>

      </div>
    </div>
  );
}