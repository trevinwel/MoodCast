import React, { useState } from "react";
import { Sparkles, Heart, TrendingUp, Shield, ArrowRight, Lock, Fingerprint } from "lucide-react";

export default function Landing({ onGetStarted, onSignIn }) {
  const [hoveredNavBtn, setHoveredNavBtn] = useState(false);
  const [hoveredMainBtn, setHoveredMainBtn] = useState(false);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9f8fd", color: "#334155", fontFamily: "sans-serif", position: "relative", overflow: "hidden" }}>
      
      
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "500px", height: "500px", backgroundColor: "#a855f7", borderRadius: "50%", filter: "blur(120px)", opacity: 0.15, animation: "pulse 4s infinite alternate" }} />
        <div style={{ position: "absolute", top: "20%", right: "-10%", width: "500px", height: "500px", backgroundColor: "#06b6d4", borderRadius: "50%", filter: "blur(120px)", opacity: 0.15, animation: "pulse 4s infinite alternate", animationDelay: "1s" }} />
      </div>

      
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, height: "80px",
        backgroundColor: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(226, 232, 240, 0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{ width: "100%", maxWidth: "1100px", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          
          
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "44px", height: "44px", background: "linear-gradient(135deg, #a855f7, #ec4899)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 4px 15px rgba(236, 72, 153, 0.3)" }}>
              <Sparkles size={22} strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: "22px", fontWeight: "800", letterSpacing: "-0.5px", color: "#1e293b" }}>MoodCast</span>
          </div>

          
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <button 
              onClick={onSignIn} 
              style={{ background: "none", border: "none", fontSize: "15px", fontWeight: "700", color: "#475569", cursor: "pointer", transition: "color 0.2s" }} 
              onMouseEnter={(e) => e.currentTarget.style.color = "#a855f7"} 
              onMouseLeave={(e) => e.currentTarget.style.color = "#475569"}
            >
              Sign In
            </button>
            <button 
              onClick={onGetStarted} 
              onMouseEnter={() => setHoveredNavBtn(true)}
              onMouseLeave={() => setHoveredNavBtn(false)}
              style={{ 
                background: "linear-gradient(135deg, #a855f7, #ec4899)", color: "#fff", padding: "10px 24px", borderRadius: "50px", fontWeight: "bold", border: "none", cursor: "pointer", fontSize: "15px", transition: "all 0.3s ease",
                boxShadow: hoveredNavBtn ? "0 10px 20px -5px rgba(236, 72, 153, 0.5)" : "0 4px 10px rgba(236, 72, 153, 0.3)",
                transform: hoveredNavBtn ? "translateY(-2px)" : "translateY(0)"
              }}
            >
              Create Private Vault
            </button>
          </div>

        </div>
      </nav>

      
      <main style={{ paddingTop: "200px", paddingBottom: "100px", textAlign: "center", paddingLeft: "24px", paddingRight: "24px", position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(to right, #f3e8ff, #fae8ff)", padding: "8px 20px", borderRadius: "50px", border: "1px solid #e9d5ff", marginBottom: "32px" }}>
            <Lock size={14} color="#9333ea" />
            <span style={{ fontSize: "11px", fontWeight: "bold", color: "#9333ea", textTransform: "uppercase", letterSpacing: "1px" }}>Zero-Knowledge AES-256 Encryption</span>
          </div>
          
          <h1 style={{ fontSize: "clamp(48px, 8vw, 84px)", fontWeight: "900", lineHeight: "1.1", marginBottom: "24px", color: "#1e293b", letterSpacing: "-2px" }}>
            Your mind, <br />
            <span style={{ color: "transparent", backgroundImage: "linear-gradient(135deg, #a855f7, #ec4899)", WebkitBackgroundClip: "text", backgroundClip: "text" }}>
              deciphered.
            </span>
          </h1>
          
          <p style={{ fontSize: "20px", color: "#64748b", lineHeight: "1.6", marginBottom: "48px", maxWidth: "600px", margin: "0 auto 48px" }}>
            A private, AI-enhanced space to document your journey. 
            Understand your emotional patterns with hardware-level security.
          </p>
          
          <button 
            onClick={onGetStarted} 
            onMouseEnter={() => setHoveredMainBtn(true)}
            onMouseLeave={() => setHoveredMainBtn(false)}
            style={{ 
              height: "64px", background: "linear-gradient(135deg, #06b6d4, #3b82f6)", color: "#fff", borderRadius: "50px", padding: "0 40px", fontSize: "18px", fontWeight: "bold", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "12px", transition: "all 0.3s ease",
              boxShadow: hoveredMainBtn ? "0 15px 30px -5px rgba(6, 182, 212, 0.5)" : "0 4px 15px rgba(6, 182, 212, 0.3)",
              transform: hoveredMainBtn ? "translateY(-4px)" : "translateY(0)"
            }}
          >
            Create Your Private Vault
            <ArrowRight size={22} />
          </button>
        </div>
      </main>

      
      <section style={{ padding: "80px 24px", position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexWrap: "wrap", gap: "32px", justifyContent: "center" }}>
          <FeatureCard 
            icon={<Fingerprint size={28} color="#06b6d4" />} 
            title="Privacy First" 
            desc="Your data is encrypted locally using Fernet (AES-256). We match global security standards." 
            glowColor="rgba(6, 182, 212, 0.15)"
          />
          <FeatureCard 
            icon={<TrendingUp size={28} color="#a855f7" />} 
            title="AI Sentiment" 
            desc="Leveraging advanced LLM capabilities to detect subtle mood shifts and provide awareness." 
            glowColor="rgba(168, 85, 247, 0.15)"
          />
          <FeatureCard 
            icon={<Heart size={28} color="#ec4899" />} 
            title="Predictive Analytics" 
            desc="Visualize trends over time. Identify triggers before they become stressors." 
            glowColor="rgba(236, 72, 153, 0.15)"
          />
        </div>
      </section>

      
      <footer style={{ padding: "60px 24px", textAlign: "center", borderTop: "1px solid rgba(226, 232, 240, 0.6)", position: "relative", zIndex: 10 }}>
        <p style={{ fontSize: "11px", fontWeight: "bold", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "2px" }}>
          MoodCast v1.0.0 Stable • 2026
        </p>
      </footer>
    </div>
  );
}


function FeatureCard({ icon, title, desc, glowColor }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        flex: "1 1 300px", maxWidth: "350px", backgroundColor: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(10px)", padding: "40px", 
        borderRadius: "32px", border: "1px solid #f1f5f9", 
        boxShadow: isHovered ? `0 20px 40px -10px ${glowColor}` : "0 4px 20px -2px rgba(0,0,0,0.03)", 
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isHovered ? "translateY(-8px)" : "translateY(0)"
      }}
    >
      <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "#f8fafc", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
        {icon}
      </div>
      <h3 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "12px", color: "#1e293b" }}>{title}</h3>
      <p style={{ fontSize: "15px", color: "#64748b", lineHeight: "1.7", margin: 0 }}>{desc}</p>
    </div>
  );
}