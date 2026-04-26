import React, { useState, useEffect } from "react";
import { AlertTriangle, ShieldAlert, X } from "lucide-react";

export default function CrisisAlert() {
  const [sysStatus, setSysStatus] = useState({ alert: false, alert_message: "" });
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/admin/stats");
        const data = await res.json();
        setSysStatus(data);
      } catch (e) { console.error("Status Sync Failed", e); }
    };
    
    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  if (!sysStatus.alert || !visible) return null;

  return (
    <div className="mb-6 animate-in slide-in-from-top duration-500">
      <div className="flex items-center justify-between p-4 bg-rose-600 border border-rose-500 text-white rounded-[1.5rem] shadow-lg shadow-rose-200">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-white/20 rounded-xl">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">System Alert Active</p>
            <p className="text-sm font-bold">{sysStatus.alert_message}</p>
          </div>
        </div>
        <button onClick={() => setVisible(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}