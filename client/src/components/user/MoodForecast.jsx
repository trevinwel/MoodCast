import React, { useState, useEffect } from "react";
import { Sparkles, Heart, Sun, Calendar, ArrowRight, AlertCircle, Cloud, Activity } from "lucide-react";
import { useTranslation } from 'react-i18next'; 

export default function Forecast() {
  const { t } = useTranslation(); 

  const [data, setData] = useState({ analysis: "", predictions: [], chartData: [] });
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  
  const [hoveredDate, setHoveredDate] = useState(null);
  const [hoveredPred, setHoveredPred] = useState(null);

  const placeholderData = {
    analysis: "Welcome to MoodCast! You're taking a wonderful first step. As you log your daily moments, the AI will build your baseline and generate real trajectory forecasts.",
    chartData: [
      { day: "Mon", score: 5.0 }, { day: "Tue", score: 5.5 }, { day: "Wed", score: 6.0 },
      { day: "Thu", score: 5.8 }, { day: "Fri", score: 6.5 }, { day: "Sat", score: 7.0 }, { day: "Sun", score: 7.5 }
    ],
    predictions: [
      { day: "Tomorrow", score: 6.5, icon: <Sun size={20} color="#f59e0b" />, tags: ["Building Baseline"] },
      { day: "Day 2", score: 7.0, icon: <Heart size={20} color="#ec4899" />, tags: ["Analyzing Weights"] },
      { day: "Day 3", score: 7.5, icon: <Cloud size={20} color="#06b6d4" />, tags: ["Stabilizing"] }
    ]
  };

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const activeUser = localStorage.getItem("username");
        if (!activeUser) {
          setData(placeholderData);
          setLoading(false);
          return;
        }

        
        const config = JSON.parse(localStorage.getItem("moodcast_ai_config") || "{}");
        const currentLang = config.language || "en-US";

        const [entriesRes, forecastRes] = await Promise.all([
          fetch(`http://127.0.0.1:8000/get_entries/${activeUser}`).then(res => res.json()).catch(() => []),
          fetch(`http://127.0.0.1:8000/forecast/${activeUser}?lang=${currentLang}`).then(res => res.json()).catch(() => null)
        ]);

        if (entriesRes && entriesRes.length > 0 && forecastRes && forecastRes.forecast) {
          setEntries(entriesRes);
          const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
          const formattedChart = forecastRes.forecast.map((v, i) => ({ day: days[i], score: v }));
          
          setData({
            analysis: forecastRes.insight,
            chartData: formattedChart,
            predictions: [
              { day: "Tomorrow", score: forecastRes.forecast[0], icon: <Sun size={20} color="#f59e0b" />, tags: ["Active Prediction"] },
              { day: "Day 2", score: forecastRes.forecast[1], icon: <Heart size={20} color="#ec4899" />, tags: ["Analyzing"] },
              { day: "Day 3", score: forecastRes.forecast[2], icon: <Cloud size={20} color="#06b6d4" />, tags: ["Stabilizing"] }
            ]
          });
        } else {
          setEntries([]);
          setData(placeholderData);
        }
      } catch (e) {
        setEntries([]);
        setData(placeholderData);
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
  }, []);

  const getSelectedEntryText = () => {
    const entryForDay = entries.find(e => new Date(e.timestamp).getDate() === selectedDate);
    if (entryForDay) return `${t('You logged a')} "${t(entryForDay.mood)}" ${t('mood:')} "${entryForDay.content}"`;
    if (entries.length === 0) return t("No entries found. Start journaling to train your local model!");
    return t("No journal entry for this day.");
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f9f8fd", color: "#a855f7", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        <Sparkles size={40} style={{ animation: "pulse 2s infinite" }} />
        <p style={{ fontWeight: "600" }}>{t('Gathering your positive moments...')}</p>
      </div>
    </div>
  );

  const cardStyle = {
    backgroundColor: "#fff",
    borderRadius: "32px",
    padding: "40px",
    border: "1px solid #f1f5f9",
    boxShadow: "0 4px 20px -2px rgba(0,0,0,0.03)",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9f8fd", color: "#334155", fontFamily: "sans-serif", paddingBottom: "120px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 24px", display: "flex", flexDirection: "column", gap: "40px" }}>
        
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "8px" }}>
          <h1 style={{ fontSize: "40px", fontWeight: "300", color: "#a855f7", margin: 0, letterSpacing: "-1px" }}>{t('Mood Forecast')}</h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: "15px" }}>{t('Discover what your days hold')}</p>
        </div>

        <div style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)", borderRadius: "32px", padding: "40px", color: "#fff", position: "relative", overflow: "hidden", boxShadow: "0 10px 25px -5px rgba(236, 72, 153, 0.4)" }}>
          <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={20} color="rgba(255,255,255,0.9)" />
              <span style={{ fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: "rgba(255,255,255,0.9)" }}>{t('AI Neural Insight')}</span>
            </div>
            <p style={{ margin: 0, fontSize: "24px", fontWeight: "600", lineHeight: "1.4", color: "#fff" }}>
              "{t(data.analysis)}"
            </p>
          </div>
          <div style={{ position: "absolute", bottom: "-60px", right: "-60px", width: "250px", height: "250px", backgroundColor: "#fff", borderRadius: "50%", filter: "blur(60px)", opacity: 0.15, pointerEvents: "none" }} />
        </div>

        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
            <h3 style={{ margin: 0, color: "#a855f7", fontWeight: "600", fontSize: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
              <Activity size={24} /> {t('7-Day Trajectory Inference')}
            </h3>
            <span style={{ fontSize: "10px", fontWeight: "bold", color: "#64748b", backgroundColor: "#f8fafc", padding: "6px 12px", borderRadius: "50px", border: "1px solid #e2e8f0", letterSpacing: "1px" }}>
              LIVE_TFT_ACTIVE
            </span>
          </div>
          
          <div style={{ height: "240px", width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "12px" }}>
            {data.chartData && data.chartData.map((item, idx) => {
              const normalizedScore = item.score <= 1.0 ? item.score * 10 : item.score;
              const fillHeight = Math.max((normalizedScore / 10) * 100, 5);

              return (
                <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, height: "100%", justifyContent: "flex-end", group: "true" }}>
                  <span style={{ fontSize: "12px", fontWeight: "bold", color: "#a855f7", marginBottom: "8px", opacity: 0.8 }}>
                    {normalizedScore.toFixed(1)}
                  </span>
                  
                  <div style={{ width: "100%", maxWidth: "48px", height: "100%", backgroundColor: "#f1f5f9", borderRadius: "16px", position: "relative", overflow: "hidden", display: "flex", alignItems: "flex-end" }}>
                    <div
                      style={{
                        width: "100%", height: `${fillHeight}%`, borderRadius: "16px", transition: "height 1s ease-out",
                        background: "linear-gradient(to top, #a855f7, #ec4899)", boxShadow: "0 4px 10px rgba(236, 72, 153, 0.2)"
                      }}
                    />
                  </div>
                  
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#94a3b8", marginTop: "16px" }}>{t(item.day)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "32px" }}>
          
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
              <h3 style={{ margin: 0, color: "#a855f7", fontWeight: "600", fontSize: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
                <Calendar size={24} /> {t('History')}
              </h3>
              <span style={{ fontSize: "14px", color: "#94a3b8" }}>{t('Current Month')}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", textAlign: "center", fontSize: "12px", fontWeight: "600", color: "#94a3b8", marginBottom: "16px" }}>
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d}>{t(d)}</div>)}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
              {Array.from({ length: 28 }, (_, i) => {
                const day = i + 1;
                const isSelected = selectedDate === day;
                const isHovered = hoveredDate === day;
                const hasData = entries.some(e => new Date(e.timestamp).getDate() === day);

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(day)}
                    onMouseEnter={() => setHoveredDate(day)}
                    onMouseLeave={() => setHoveredDate(null)}
                    style={{
                      aspectRatio: "1/1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      borderRadius: "50%", border: "none", fontSize: "14px", fontWeight: isSelected ? "bold" : "600", cursor: "pointer",
                      transition: "all 0.2s ease", position: "relative",
                      backgroundColor: isSelected ? "#06b6d4" : (isHovered ? "#f3e8ff" : "transparent"),
                      color: isSelected ? "#fff" : (isHovered ? "#a855f7" : "#475569"),
                      boxShadow: isSelected ? "0 4px 10px rgba(6, 182, 212, 0.3)" : "none",
                      transform: isHovered && !isSelected ? "scale(1.1)" : "scale(1)"
                    }}
                  >
                    {day}
                    {hasData && !isSelected && (
                      <span style={{ position: "absolute", bottom: "4px", width: "4px", height: "4px", backgroundColor: "#a855f7", borderRadius: "50%" }} />
                    )}
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: "32px", padding: "24px", borderRadius: "24px", backgroundColor: "#f9f8fd", border: "1px solid #e9d5ff" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ fontSize: "12px", fontWeight: "bold", color: "#a855f7", textTransform: "uppercase" }}>{t('Daily Reflection')}</span>
                <span style={{ fontSize: "12px", fontWeight: "bold", color: "#06b6d4", padding: "4px 10px", backgroundColor: "#cffafe", borderRadius: "50px" }}>{t('Day')} {selectedDate}</span>
              </div>
              <p style={{ margin: 0, fontSize: "14px", color: "#475569", lineHeight: "1.6", fontStyle: "italic" }}>
                {getSelectedEntryText()}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ margin: "0 0 8px 0", color: "#475569", fontWeight: "600", fontSize: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
               {t('Looking Ahead')} <ArrowRight size={20} color="#ec4899" />
            </h3>
            
            {data.predictions && data.predictions.map((p, i) => {
              const displayScore = p.score <= 1.0 ? p.score * 10 : p.score;
              const isHovered = hoveredPred === i;

              return (
                <div 
                  key={i} 
                  onMouseEnter={() => setHoveredPred(i)}
                  onMouseLeave={() => setHoveredPred(null)}
                  style={{
                    backgroundColor: "#fff", padding: "24px", borderRadius: "24px", border: "1px solid #f1f5f9",
                    display: "flex", flexDirection: "column", gap: "16px", transition: "all 0.3s ease",
                    boxShadow: isHovered ? "0 10px 20px rgba(0,0,0,0.05)" : "0 4px 10px rgba(0,0,0,0.02)",
                    transform: isHovered ? "translateY(-4px)" : "translateY(0)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h4 style={{ margin: 0, fontWeight: "600", color: "#a855f7", fontSize: "16px" }}>{t(p.day)}</h4>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#f9f8fd", padding: "6px 12px", borderRadius: "50px", border: "1px solid #e9d5ff" }}>
                      {p.icon}
                      <span style={{ fontSize: "14px", fontWeight: "bold", color: "#334155" }}>{t('Forecast:')} {displayScore.toFixed(1)}/10</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {p.tags.map(tag => (
                      <span key={tag} style={{ backgroundColor: "#fdf4ff", color: "#d946ef", border: "1px solid #fae8ff", padding: "4px 12px", borderRadius: "50px", fontSize: "11px", fontWeight: "bold" }}>
                        {t(tag)}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}