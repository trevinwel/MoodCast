import React, { useState } from 'react';
import { Card } from "../ui/card";
import { ShieldCheck, Info, AlertTriangle } from "lucide-react";

export default function ConsentModal({ onAccept }) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  const handleConsent = () => {
    localStorage.setItem("moodcast_consent", "true");
    setIsOpen(false);
    onAccept();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="max-w-xl w-full p-8 rounded-3xl shadow-2xl bg-white space-y-6">
        <div className="flex items-center gap-3 text-emerald-600">
          <ShieldCheck className="w-8 h-8" />
          <h2 className="text-2xl font-bold italic">Informed Consent & Privacy</h2>
        </div>

        <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
          <p>
            Welcome to <strong>MoodCast (Project 10952371)</strong>. Before we begin tracking your habits to power the 
            <strong> Temporal Fusion Transformer</strong>, please review our privacy commitments:
          </p>

          <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 border border-blue-100">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-1" />
            <ul className="space-y-2">
              <li><strong>Local Processing:</strong> All data, including your journal and habits, stays on this device. No data is transmitted to external servers.</li>
              <li><strong>Encryption:</strong> Your database is secured with <strong>AES-256</strong> encryption at rest.</li>
            </ul>
          </div>

          <div className="bg-amber-50 p-4 rounded-2xl flex gap-3 border border-amber-100">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-1" />
            <p className="text-amber-800">
              <strong>Disclaimer:</strong> MoodCast is an educational tool for self-awareness and is 
              not a medical diagnostic device. For emergencies, contact local crisis services (e.g., 1926).
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <button 
            onClick={handleConsent}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-200"
          >
            I Consent & Accept
          </button>
          <button 
            onClick={() => window.close()}
            className="w-full py-2 text-gray-400 hover:text-gray-600 text-xs font-medium"
          >
            Exit Application
          </button>
        </div>
      </Card>
    </div>
  );
}
