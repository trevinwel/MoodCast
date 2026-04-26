import React, { useState, useEffect, useRef } from "react";
import { Mic, Square, Sparkles, Activity, BookHeart, Sun, Feather, CloudRain, Moon, Lock } from "lucide-react";
import { useTranslation } from 'react-i18next'; 

export default function UserHome() {
  const { t } = useTranslation(); 

  const [isRecording, setIsRecording] = useState(false);
  const [entries, setEntries] = useState([]); 
  const [username, setUsername] = useState(t("Friend"));
  const [greeting, setGreeting] = useState(t("Good Evening"));
  const [currentDate, setCurrentDate] = useState("");
  const [transcript, setTranscript] = useState(""); 
  const [insight, setInsight] = useState({ title: t("Welcome to MoodCast"), body: t("Your journey starts here. Speak your mind or log your first entry.") });
  
  const mediaRecorder = useRef(null);
  const recognitionRef = useRef(null); 
  
  const isRecordingRef = useRef(false);
  const transcriptRef = useRef(""); 
  const finalizedTextRef = useRef(""); 
  
  useEffect(() => { 
    const now = new Date();
    const hour = now.getHours();
    if (hour < 12) setGreeting(t("Good Morning"));
    else if (hour < 17) setGreeting(t("Good Afternoon"));
    else setGreeting(t("Good Evening"));

    
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    setCurrentDate(now.toLocaleDateString('en-US', options)); 

    const storedName = localStorage.getItem("username");
    if (storedName) {
      const namePart = storedName.split('@')[0];
      setUsername(namePart.charAt(0).toUpperCase() + namePart.slice(1));
    }

    fetchStats(); 
    
  }, [t]);

  const generateInsight = (data) => {
    if (!data || data.length === 0) return;
    const latestEntry = data.find(e => e.mood && e.mood !== "Neutral" && !e.content.includes("Quick Check-in"));
    
    if (!latestEntry) {
      setInsight({ title: t("Building Momentum"), body: t("Keep logging your thoughts! Every entry helps build a clearer picture of your mental well-being.") });
      return;
    }

    const mood = latestEntry.mood;
    if (mood === "Great" || mood === "Good") {
      setInsight({ title: t("Positive Wave"), body: t("Your recent logs reflect a bright, positive energy. Take a moment to appreciate what's going right today.") });
    } else if (mood === "Okay" || mood === "Stable") {
      setInsight({ title: t("Finding Balance"), body: t("Things are steady right now. Remember to take a deep breath and carve out a little time just for yourself today.") });
    } else if (mood === "Low" || mood === "Difficult" || mood === "Anxious") {
      setInsight({ title: t("Be Gentle"), body: t("It looks like things have been a bit heavy lately. Remember that it's okay to rest and take things one day at a time.") });
    } else {
      setInsight({ title: t("System Check-in"), body: t("Thank you for logging your thoughts. Every entry helps build a clearer picture of your mental well-being.") });
    }
  };

  const fetchStats = async () => {
    try {
      const activeUser = localStorage.getItem("username");
      if (!activeUser) return;

      const response = await fetch(`http://127.0.0.1:8000/get_entries/${activeUser}`);
      const data = await response.json();
      const reversedData = data.reverse();
      setEntries(reversedData); 
      generateInsight(reversedData); 
    } catch (e) { console.error(e); }
  };

  const toggleRecording = async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert(t("Web Speech API not supported in this browser."));

    if (!isRecordingRef.current) {
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder.current = new MediaRecorder(stream);
        mediaRecorder.current.start();
        
        isRecordingRef.current = true;
        setIsRecording(true);
        setTranscript(t("Listening..."));
        transcriptRef.current = "";
        finalizedTextRef.current = "";

        // THE LOOP
        const startListening = () => {
          if (!isRecordingRef.current) return;

          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onresult = (event) => {
            let currentInterim = "";
            let currentFinal = "";
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
              if (event.results[i].isFinal) {
                currentFinal += event.results[i][0].transcript;
              } else {
                currentInterim += event.results[i][0].transcript;
              }
            }
            
            if (currentFinal) {
              finalizedTextRef.current = (finalizedTextRef.current + " " + currentFinal).trim();
            }
            
            const fullText = (finalizedTextRef.current + " " + currentInterim).trim();
            setTranscript(fullText || t("Listening..."));
            transcriptRef.current = fullText;
          };

          recognition.onerror = (event) => {
            if (event.error === 'not-allowed') {
              isRecordingRef.current = false; setIsRecording(false);
            }
          };

          recognition.onend = () => {
            if (isRecordingRef.current) {
              setTimeout(() => {
                if (isRecordingRef.current) startListening();
              }, 250);
            }
          };

          try {
            recognition.start();
            recognitionRef.current = recognition;
          } catch (e) { console.error("Mic start failed", e); }
        };

        startListening();

      } catch (err) { 
        console.error(err); 
        alert(t("Please allow microphone access."));
      }
    } else {
      
      isRecordingRef.current = false;
      setIsRecording(false);
      
      
      if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
        mediaRecorder.current.stop();
        mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      }
      
      
      if (recognitionRef.current) recognitionRef.current.stop();
      
      const activeUser = localStorage.getItem("username");
      const finalPayload = transcriptRef.current.trim();

      
      if (finalPayload && finalPayload !== t("Listening...") && activeUser) {
         try {
          await fetch("http://127.0.0.1:8000/add_entry/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              username: activeUser, 
              content: `Voice Note: ${finalPayload}`, 
              mood: "Neutral", 
              tags: ["Voice Log"] 
            }),
          });
          fetchStats();
        } catch (e) { console.error(e); }
      }
      
      setTimeout(() => {
        setTranscript("");
        transcriptRef.current = "";
        finalizedTextRef.current = "";
      }, 2000);
    }
  };

  const getFeedAesthetic = (mood) => {
    if (mood === "Great") return { icon: Sun, color: "#f59e0b", bg: "#fef3c7" }; 
    if (mood === "Good") return { icon: Sparkles, color: "#ec4899", bg: "#fce7f3" }; 
    if (mood === "Okay" || mood === "Stable") return { icon: Feather, color: "#06b6d4", bg: "#cffafe" }; 
    if (mood === "Low" || mood === "Anxious") return { icon: CloudRain, color: "#6366f1", bg: "#e0e7ff" }; 
    if (mood === "Difficult") return { icon: Moon, color: "#e11d48", bg: "#ffe4e6" }; 
    return { icon: Activity, color: "#a855f7", bg: "#f3e8ff" }; 
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9f8fd", color: "#334155", fontFamily: "sans-serif", paddingBottom: "120px" }}>
      
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 24px", display: "flex", flexDirection: "column", gap: "48px" }}>
        
        
        <header style={{ display: "flex", flexDirection: "column", gap: "16px", paddingLeft: "8px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(to right, #f3e8ff, #fae8ff)", padding: "6px 16px", borderRadius: "50px", border: "1px solid #e9d5ff", width: "fit-content" }}>
            <Lock size={12} color="#9333ea" />
            <span style={{ fontSize: "10px", fontWeight: "bold", color: "#9333ea", textTransform: "uppercase", letterSpacing: "1px" }}>
              {currentDate}
            </span>
          </div>
          
          <h1 style={{ fontSize: "clamp(36px, 6vw, 56px)", fontWeight: "300", lineHeight: "1.1", letterSpacing: "-1px", margin: 0, color: "#1e293b" }}>
            {t(greeting)}, <br />
            <span style={{ color: "#9333ea", fontWeight: "600" }}>{username}.</span>
          </h1>
        </header>

        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
          
          
          <div style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)", borderRadius: "32px", padding: "40px", boxShadow: "0 10px 25px -5px rgba(236, 72, 153, 0.4)", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "240px", color: "#fff", transition: "transform 0.3s ease" }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={20} color="#fff" />
                <span style={{ fontSize: "12px", fontWeight: "bold", letterSpacing: "1px", color: "rgba(255,255,255,0.9)", textTransform: "uppercase" }}>{t('AI Sentiment')}</span>
              </div>
              
              <h3 style={{ margin: 0, color: "#fff", fontWeight: "600", fontSize: "28px", lineHeight: "1.2" }}>
                {t(insight.title)}
              </h3>
              
              <p style={{ margin: 0, color: "rgba(255,255,255,0.9)", lineHeight: "1.6", fontSize: "16px" }}>
                {t(insight.body)}
              </p>
            </div>
          </div>

          
          <div style={{ background: "linear-gradient(135deg, #6366f1, #06b6d4)", borderRadius: "32px", padding: "40px", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "240px", boxShadow: "0 10px 25px -5px rgba(6, 182, 212, 0.4)", transition: "transform 0.3s ease" }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            
            <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "200px", height: "200px", backgroundColor: "#fff", borderRadius: "50%", filter: "blur(60px)", opacity: 0.2, pointerEvents: "none" }} />
            
            <div style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px", borderRadius: "50px", backgroundColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.3)", width: "fit-content" }}>
                  <Mic size={12} color="#fff" />
                  <span style={{ fontSize: "10px", fontWeight: "bold", letterSpacing: "1px", color: "#fff", textTransform: "uppercase" }}>{t('Voice Log')}</span>
                </div>
                <h3 style={{ margin: 0, color: "#fff", fontWeight: "600", fontSize: "28px", lineHeight: "1.2" }}>
                  {isRecording ? t("Listening...") : t("Speak your mind.")}
                </h3>
              </div>
              
              <button 
                onClick={toggleRecording}
                style={{
                  flexShrink: 0, width: "60px", height: "60px", borderRadius: "50%", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s ease",
                  backgroundColor: isRecording ? "#ef4444" : "#fff",
                  boxShadow: isRecording ? "0 0 30px rgba(239,68,68,0.6)" : "0 10px 20px -5px rgba(0,0,0,0.2)",
                  transform: isRecording ? "scale(1.1)" : "scale(1)"
                }}
              >
                {isRecording ? <Square size={22} color="#fff" fill="#fff" /> : <Mic size={24} color="#06b6d4" />}
              </button>
            </div>

            <div style={{ position: "relative", zIndex: 10, marginTop: "32px", minHeight: "40px", display: "flex", alignItems: "flex-end" }}>
              {transcript ? (
                <p style={{ margin: 0, color: "#fff", fontSize: "15px", fontStyle: "italic", lineHeight: "1.6", borderLeft: "3px solid #fff", paddingLeft: "16px" }}>
                  "{transcript}"
                </p>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(255,255,255,0.8)", fontSize: "14px", fontWeight: "500" }}>
                  <Activity size={16} />
                  <span>{t('Tap mic to auto-save to vault')}</span>
                </div>
              )}
            </div>
          </div>

        </div>

        
        <div style={{ backgroundColor: "#fff", borderRadius: "32px", padding: "40px", border: "1px solid #f1f5f9", boxShadow: "0 4px 20px -2px rgba(0,0,0,0.03)" }}>
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px" }}>
            <h3 style={{ margin: 0, color: "#334155", fontWeight: "600", fontSize: "22px", display: "flex", alignItems: "center", gap: "12px" }}>
              <BookHeart size={24} color="#ec4899" /> {t('Your Journey')}
            </h3>
          </div>

          <div style={{ position: "relative", paddingLeft: "8px" }}>
            <div style={{ position: "absolute", left: "35px", top: "16px", bottom: "24px", width: "2px", backgroundColor: "#f1f5f9" }} />

            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              {entries.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: "14px", fontStyle: "italic", paddingLeft: "80px", margin: 0 }}>
                  {t('No journey logs yet. Your first entry will appear here.')}
                </p>
              ) : (
                entries.slice(0, 5).map((entry, index) => {
                  const aesthetic = getFeedAesthetic(entry.mood);
                  const Icon = aesthetic.icon;
                  const isVoiceLog = entry.content.includes("Voice Note:");
                  const isQuickLog = entry.content.includes("Quick Check-in");

                  let displayContent = entry.content;
                  if (isVoiceLog) displayContent = entry.content.replace("Voice Note: ", "");
                  if (isQuickLog) displayContent = t("Logged a quick energy check-in.");

                  return (
                    <div key={index} style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: "24px", zIndex: 10 }}>
                      
                      <div style={{ width: "56px", height: "56px", backgroundColor: aesthetic.bg, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "4px solid #fff", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
                        <Icon size={22} color={aesthetic.color} strokeWidth={2.5} />
                      </div>

                      <div style={{ flex: 1, backgroundColor: "#fff", border: "1px solid #f1f5f9", padding: "28px", borderRadius: "24px", transition: "all 0.2s ease", boxShadow: "0 2px 10px rgba(0,0,0,0.01)" }}>
                        
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "16px" }}>
                          <span style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: "#94a3b8" }}>
                            {t(isVoiceLog ? "Audio Dictation" : isQuickLog ? "Telemetry" : "Journal Entry")}
                          </span>
                          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", backgroundColor: "#f8fafc", padding: "6px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                            {entry.timestamp || entry.date}
                          </span>
                        </div>
                        
                        <p style={{ margin: "0 0 20px 0", color: "#475569", fontWeight: "500", fontSize: "15px", lineHeight: "1.7" }}>
                          {displayContent}
                        </p>
                        
                        {!isQuickLog && entry.mood && entry.mood !== "Neutral" && (
                           <div style={{ display: "flex", alignItems: "center" }}>
                             <span style={{ backgroundColor: aesthetic.bg, color: aesthetic.color, border: `1px solid ${aesthetic.color}40`, padding: "6px 16px", borderRadius: "50px", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>
                               {t(entry.mood)}
                             </span>
                           </div>
                        )}
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}