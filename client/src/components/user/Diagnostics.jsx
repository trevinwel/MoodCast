import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ScatterChart, Scatter, ZAxis, ResponsiveContainer } from "recharts";
import { Activity, Zap, ShieldCheck, Cpu, HardDrive } from "lucide-react";
import { useTranslation } from 'react-i18next'; 

export default function Diagnostics() {
  const { t } = useTranslation(); 

  const [hardware, setHardware] = useState({ cores: "Scanning...", ram: "Scanning..." });
  const [inferenceSpeed, setInferenceSpeed] = useState("0.00");

  const chartData = {
    sentiment_trend: [
      { date: "Mon", polarity: 0.6, accuracy: 0.9 },
      { date: "Tue", polarity: 0.7, accuracy: 0.92 },
      { date: "Wed", polarity: 0.4, accuracy: 0.88 },
      { date: "Thu", polarity: 0.8, accuracy: 0.95 },
      { date: "Fri", polarity: 0.9, accuracy: 0.94 }
    ],
    clusters: [
      { x: 80, y: 70, z: 200 }, { x: 40, y: 30, z: 150 }, { x: 60, y: 80, z: 300 }
    ]
  };

  useEffect(() => {
    const cores = navigator.hardwareConcurrency || "Unknown";
    const ram = navigator.deviceMemory || "Unknown";
    
    setHardware({ cores: `${cores}`, ram: `${ram}` });

    const savedSpeed = localStorage.getItem("last_inference_speed") || "0.85";
    setInferenceSpeed(savedSpeed);
  }, []);

  return (
    <div className="py-10 px-6 max-w-[1100px] mx-auto flex flex-col gap-10 font-sans pb-[120px]">
      
      
      <div className="flex justify-between items-end flex-wrap gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-[clamp(32px,4vw,40px)] font-extrabold text-slate-900 m-0 tracking-tight">
            {t('System Diagnostics')}
          </h1>
          <p className="m-0 text-slate-500 text-base">{t('Real-time Local AI Telemetry & Hardware Utilization')}</p>
        </header>
        
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-sky-100 py-2.5 px-5 rounded-full border border-sky-200">
          <ShieldCheck size={16} className="text-sky-600" />
          <span className="text-[11px] font-bold text-sky-600 uppercase tracking-widest">
            {t('Sovereign Mode: Active')}
          </span>
        </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard label={t("Processing Power")} value={`${hardware.cores} ${t('Cores')}`} sub={t("Local CPU Threads")} icon={<Cpu size={16} className="text-blue-500"/>} />
        <MetricCard label={t("Allocated Memory")} value={`${hardware.ram}GB+ ${t('Detected')}`} sub={t("Available System RAM")} icon={<HardDrive size={16} className="text-purple-500"/>} />
        <MetricCard label={t("Inference Speed")} value={`${inferenceSpeed}s`} sub={t("Last Gemma-3 Generation")} blue icon={<Zap size={16} className="text-amber-500"/>} />
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        
        <div className="bg-white rounded-[32px] p-8 md:p-10 border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Activity size={20} className="text-blue-500" />
            </div>
            <h3 className="m-0 text-lg font-bold text-slate-900">{t('AI Sentiment Polarity Output')}</h3>
          </div>
          
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              
              <AreaChart data={chartData.sentiment_trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="polarity" stroke="#3b82f6" strokeWidth={4} fill="url(#colorPol)" />
                <Area type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

       
        <div className="bg-white rounded-[32px] p-8 md:p-10 border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-amber-50 rounded-xl">
              <Zap size={20} className="text-amber-500" />
            </div>
            <h3 className="m-0 text-lg font-bold text-slate-900">{t('Vector Proximity Clusters')}</h3>
          </div>
          
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              
              <ScatterChart margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" dataKey="x" name={t('Valence')} unit="%" domain={[0, 100]} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
                <YAxis type="number" dataKey="y" name={t('Arousal')} unit="%" domain={[0, 100]} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <ZAxis type="number" dataKey="z" range={[100, 500]} />
                <Tooltip cursor={{ strokeDasharray: '3 3', stroke: '#cbd5e1' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}/>
                <Scatter name={t('Emotions')} data={chartData.clusters} fill="#8b5cf6" opacity={0.8} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, blue, icon }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col gap-2 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <p className="m-0 text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        {icon}
      </div>
      <p className={`m-0 mt-2 text-[32px] font-extrabold leading-none ${blue ? "text-blue-500" : "text-slate-900"}`}>
        {value}
      </p>
      <div className="flex items-center gap-1.5 mt-1">
        <p className="m-0 text-xs text-slate-500 font-semibold">{sub}</p>
      </div>
    </div>
  );
}