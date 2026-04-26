import React, { useState, useEffect } from "react";
import { Target, Plus, Flame, Check, X, Sparkles, CalendarDays } from "lucide-react";
import axios from "axios";
import { useTranslation } from 'react-i18next'; 

export default function HabitTracker() {
  const { t } = useTranslation(); 

  const [habits, setHabits] = useState([]);
  const [insight, setInsight] = useState("Loading your personalized routine analysis...");
  const [newHabit, setNewHabit] = useState("");
  const [activeUser, setActiveUser] = useState(null);

  const habitColors = ["#10b981", "#06b6d4", "#a855f7", "#ec4899", "#f59e0b", "#3b82f6"];

  const fetchHabits = async (username) => {
    try {
      
      const config = JSON.parse(localStorage.getItem("moodcast_ai_config") || "{}");
      const currentLang = config.language || "en-US";

      
      const res = await axios.get(`http://127.0.0.1:8000/habits/${username}?lang=${currentLang}`);
      if (res.data) {
        setHabits(res.data.habits || []);
        setInsight(res.data.insight || "Your tracker is empty. Create a habit to get started.");
      }
    } catch (error) {
      console.error("Backend offline. Using local state fallback.");
      setInsight("Backend disconnected. Displaying local cache.");
    }
  };

  useEffect(() => {
    const user = localStorage.getItem("username");
    if (user) {
      setActiveUser(user);
      fetchHabits(user);
    }
  }, []);

  const getLast28Days = () => {
    const dates = [];
    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push({
        dateStr: d.toISOString().split('T')[0], 
        dayNum: d.getDate(),
        isToday: i === 0
      });
    }
    return dates;
  };
  const historyDays = getLast28Days();

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!newHabit.trim() || !activeUser) return;
    
    const randomColor = habitColors[Math.floor(Math.random() * habitColors.length)];
    
    try {
      await axios.post("http://127.0.0.1:8000/habits/add", {
        username: activeUser,
        name: newHabit.trim(),
        color: randomColor
      });
      fetchHabits(activeUser); 
    } catch (e) {
      setHabits([...habits, { id: Date.now().toString(), name: newHabit.trim(), color: randomColor, completedDates: [] }]);
    }
    setNewHabit("");
  };

  const toggleHabitDay = async (habitId, dateStr) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const isCompleted = habit.completedDates.includes(dateStr);
        const newDates = isCompleted ? habit.completedDates.filter(d => d !== dateStr) : [...habit.completedDates, dateStr];
        return { ...habit, completedDates: newDates };
      }
      return habit;
    }));

    try {
      if (activeUser) {
        await axios.post("http://127.0.0.1:8000/habits/toggle", {
          username: activeUser, habit_id: habitId, date: dateStr
        });
      }
    } catch (e) { console.error("Failed to sync toggle with server."); }
  };

  const deleteHabit = async (habitId) => {
    if(window.confirm(t("Permanently delete this habit?"))) {
      setHabits(habits.filter(h => h.id !== habitId));
      try {
        if (activeUser) await axios.delete(`http://127.0.0.1:8000/habits/${activeUser}/${habitId}`);
      } catch (e) { console.error("Failed to delete on server."); }
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f8fd] text-slate-700 font-sans pb-[120px]">
      <div className="max-w-[1000px] mx-auto py-10 px-6 flex flex-col gap-10">
        
        <header className="text-center flex flex-col gap-2">
          <h1 className="text-[clamp(36px,6vw,48px)] font-extrabold text-slate-900 m-0 tracking-tight">{t('Habit Tracker')}</h1>
          <p className="m-0 text-slate-500 text-base">{t('Long-term consistency visualization')}</p>
        </header>

        <div className="bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg shadow-emerald-500/40">
          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-white/90" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/90">{t('Personalized Feedback')}</span>
            </div>
            <p className="m-0 text-xl font-semibold leading-relaxed text-white">
              "{t(insight)}"
            </p>
          </div>
          <div className="absolute -bottom-10 -right-10 w-[200px] h-[200px] bg-white rounded-full blur-[60px] opacity-15 pointer-events-none" />
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] flex flex-col gap-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-100 rounded-xl">
              <Target size={20} className="text-slate-600" />
            </div>
            <h3 className="m-0 text-lg font-bold text-slate-900">{t('Establish a New Routine')}</h3>
          </div>

          <form onSubmit={handleAddHabit} className="flex gap-4 flex-wrap">
            <input 
              type="text" 
              placeholder={t("e.g., Read for 20 minutes...")} 
              value={newHabit} 
              onChange={(e) => setNewHabit(e.target.value)}
              className="flex-1 min-w-[250px] h-[52px] px-6 rounded-2xl border-2 border-slate-200 bg-slate-50 text-[15px] outline-none transition-colors focus:border-cyan-500"
            />
            <button 
              type="submit"
              className="h-[52px] px-8 rounded-2xl border-none cursor-pointer bg-slate-900 text-white font-bold text-[15px] flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 shadow-md shadow-slate-900/20"
            >
              <Plus size={18} /> {t('Add Habit')}
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-6">
          {habits.length === 0 ? (
            <div className="text-center p-[60px] text-slate-400 italic bg-white rounded-3xl border border-slate-200">
              {t("Your tracker is empty. Let's define your baseline routines.")}
            </div>
          ) : (
            habits.map((habit) => {
              const streakCount = habit.completedDates ? habit.completedDates.length : 0;

              return (
                <div key={habit.id} className="bg-white rounded-[24px] p-8 border border-slate-200 shadow-sm flex flex-col gap-6 transition-colors duration-300 hover:border-slate-300">
                  
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${habit.color}15` }}
                      >
                        <Target size={24} color={habit.color} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <h4 className="m-0 text-lg font-extrabold text-slate-900">{habit.name}</h4>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                            <Flame size={14} /> {streakCount} {t('total completions')}
                          </span>
                          <span className="flex items-center gap-1 text-slate-400 text-xs">
                            <CalendarDays size={14} /> {t('28-Day History')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => deleteHabit(habit.id)}
                      className="bg-transparent border-none cursor-pointer p-2 text-slate-300 transition-colors hover:text-red-500"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="flex gap-1 flex-wrap">
                    {historyDays.map((dayObj) => {
                      const isCompleted = habit.completedDates && habit.completedDates.includes(dayObj.dateStr);
                      return (
                        <div key={dayObj.dateStr} className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => toggleHabitDay(habit.id, dayObj.dateStr)}
                            title={dayObj.dateStr}
                            className="w-[26px] h-[26px] rounded-md cursor-pointer flex items-center justify-center transition-all duration-150"
                            style={{
                              backgroundColor: isCompleted ? habit.color : "#f1f5f9",
                              color: isCompleted ? "#fff" : "transparent",
                              boxShadow: isCompleted ? `0 2px 8px ${habit.color}50` : "none",
                              border: dayObj.isToday && !isCompleted ? `2px dashed ${habit.color}80` : "1px solid transparent"
                            }}
                          >
                            <Check size={14} strokeWidth={4} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}