import React, { useState } from "react";

import { Home, BookOpen, Target, BarChart2, CalendarDays, Settings as SettingsIcon, Cpu } from "lucide-react";

import UserHome from "./user/UserHome";
import Journal from "./user/Journal";
import HabitTracker from "./user/HabitTracker"; 
import Dashboard from "./user/Dashboard";
import Forecast from "./user/MoodForecast"; 
import Settings from "./user/UserSettings"; 

import Diagnostics from "./user/Diagnostics"; 

export default function UserApp({ onLogout }) {
  const [activeTab, setActiveTab] = useState("home");

  const renderView = () => {
    switch (activeTab) {
      case "home": return <UserHome />;
      case "journal": return <Journal />;
      case "habits": return <HabitTracker />; 
      case "dashboard": return <Dashboard />;
      case "forecast": return <Forecast />;
      case "diagnostics": return <Diagnostics />; 
      case "settings": return <Settings onLogout={onLogout} />;
      default: return <UserHome />;
    }
  };

  
  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "journal", label: "Journal", icon: BookOpen },
    { id: "habits", label: "Habits", icon: Target }, 
    { id: "dashboard", label: "Data", icon: BarChart2 },
    { id: "forecast", label: "Forecast", icon: CalendarDays },
    { id: "diagnostics", label: "System", icon: Cpu }, 
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <div style={{ position: "relative", minHeight: "100vh", backgroundColor: "#f9f8fd" }}>
      
      
      <div style={{ paddingBottom: "100px" }}>
        {renderView()}
      </div>

      
      <div 
        style={{
          position: "fixed",
          bottom: "32px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.6)",
          borderRadius: "100px",
          padding: "8px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1), 0 0 0 1px rgba(226, 232, 240, 0.5)",
          zIndex: 1000,
          width: "max-content",
          maxWidth: "95vw",
          overflowX: "auto"
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: isActive ? "8px" : "0px",
                padding: isActive ? "12px 24px" : "12px 16px",
                borderRadius: "50px",
                border: "none",
                cursor: "pointer",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                background: isActive ? "linear-gradient(135deg, #a855f7, #ec4899)" : "transparent",
                color: isActive ? "#fff" : "#64748b",
                fontWeight: "600",
                fontSize: "14px",
                boxShadow: isActive ? "0 10px 20px -5px rgba(236, 72, 153, 0.4)" : "none",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = "#a855f7";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = "#64748b";
              }}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              
              <span 
                style={{ 
                  display: isActive ? "block" : "none",
                  opacity: isActive ? 1 : 0,
                  transition: "opacity 0.3s ease",
                  whiteSpace: "nowrap"
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      
    </div>
  );
}