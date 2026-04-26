import { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Heart, Calendar, Clock, Activity } from "lucide-react";
import { useTranslation } from 'react-i18next'; 

export default function Dashboard() {
  const { t } = useTranslation(); 

  const [data, setData] = useState({
    moodTrend: [],
    breakdown: [],
    activities: [],
    stats: { avgMood: 0, streak: 0, total: 0 }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const activeUser = localStorage.getItem("username");
        if (!activeUser) {
          setLoading(false);
          return;
        }

        const response = await fetch(`http://127.0.0.1:8000/get_entries/${activeUser}`);
        if (!response.ok) throw new Error("Failed to fetch entries");
        const entries = await response.json();

        
        const trend = entries.slice(-7).reverse().map(entry => ({
          date: new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          score: entry.mood === "Great" ? 10 : entry.mood === "Good" ? 7.5 : entry.mood === "Neutral" ? 5 : entry.mood === "Okay" ? 5 : 2.5
        }));

        
        const counts = entries.reduce((acc, entry) => {
          const moodKey = entry.mood === "Okay" ? "Neutral" : entry.mood;
          acc[moodKey] = (acc[moodKey] || 0) + 1;
          return acc;
        }, {});

        const breakdown = [
          { name: "Great", value: counts["Great"] || 0, color: "#f59e0b" }, 
          { name: "Good", value: counts["Good"] || 0, color: "#ec4899" },  
          { name: "Neutral", value: counts["Neutral"] || 0, color: "#06b6d4" }, 
          { name: "Low", value: (counts["Low"] || 0) + (counts["Difficult"] || 0), color: "#6366f1" }, 
        ];

        
        const keywords = [
          "Meditation", "Exercise", "Therapy", "Journaling", 
          "Yoga", "Walking", "Running", "Workout", 
          "Reading", "Nature", "Sleep", "Stretching"
        ];
        
        const activityCounts = keywords.map(word => {
          const count = entries.filter(e => 
            e.content.toLowerCase().includes(word.toLowerCase())
          ).length;
          return { activity: word, count };
        }).filter(a => a.count > 0);

        
        const totalEntries = entries.length;
        const totalScore = entries.reduce((sum, entry) => {
          const scoreMap = { "Great": 10, "Good": 7.5, "Okay": 5, "Neutral": 5, "Low": 2.5, "Difficult": 1 };
          return sum + (scoreMap[entry.mood] || 5);
        }, 0);
        
        const avgOverall = totalEntries > 0 ? (totalScore / totalEntries).toFixed(1) : 0;

        const calculateStreak = (allEntries) => {
          if (allEntries.length === 0) return 0;
          const dates = [...new Set(allEntries.map(e => 
            new Date(e.timestamp).toISOString().split('T')[0]
          ))].sort((a, b) => new Date(b) - new Date(a));

          const today = new Date().toISOString().split('T')[0];
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

          if (dates[0] !== today && dates[0] !== yesterday) return 0;

          let streak = 1;
          for (let i = 0; i < dates.length - 1; i++) {
            const diff = (new Date(dates[i]) - new Date(dates[i + 1])) / (1000 * 60 * 60 * 24);
            if (diff === 1) streak++;
            else break;
          }
          return streak;
        };

        setData({
          moodTrend: trend,
          breakdown: breakdown,
          activities: activityCounts,
          stats: { avgMood: avgOverall, streak: calculateStreak(entries), total: totalEntries }
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f8fd] text-purple-500 font-sans">
        <div className="flex flex-col items-center gap-4">
          <Activity size={40} className="animate-pulse" />
          <p className="font-semibold">{t('Compiling your wellness analytics...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f8fd] text-slate-700 font-sans pb-[120px]">
      <div className="max-w-[1000px] mx-auto py-10 px-6 flex flex-col gap-10">
        
        
        <div className="text-center flex flex-col gap-2">
          <h1 className="text-4xl font-light text-cyan-500 m-0 tracking-tight">{t('Dashboard')}</h1>
          <p className="m-0 text-slate-500 text-[15px]">{t('Your mental wellness insights')}</p>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          
          <div className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg shadow-pink-500/40 transition-transform duration-300 hover:-translate-y-1">
            <div className="relative z-10 flex justify-between items-start">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold opacity-90">{t('Average Mood')}</span>
                <span className="text-5xl font-bold leading-none">{data.stats.avgMood}</span>
                <div className="flex items-center gap-1.5 text-xs opacity-80 mt-1">
                  <TrendingUp size={14} /> {t('All-time average')}
                </div>
              </div>
              <Heart size={48} className="opacity-20" />
            </div>
          </div>

          
          <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg shadow-indigo-500/40 transition-transform duration-300 hover:-translate-y-1">
            <div className="relative z-10 flex justify-between items-start">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold opacity-90">{t('Journal Streak')}</span>
                <span className="text-5xl font-bold leading-none">{data.stats.streak}<span className="text-xl">d</span></span>
                <div className="text-xs opacity-80 mt-1">{t('Consecutive logs')}</div>
              </div>
              <Calendar size={48} className="opacity-20" />
            </div>
          </div>

          
          <div className="bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg shadow-emerald-500/40 transition-transform duration-300 hover:-translate-y-1">
            <div className="relative z-10 flex justify-between items-start">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold opacity-90">{t('Total Entries')}</span>
                <span className="text-5xl font-bold leading-none">{data.stats.total}</span>
                <div className="text-xs opacity-80 mt-1">{t('Lifetime logs')}</div>
              </div>
              <Clock size={48} className="opacity-20" />
            </div>
          </div>
        </div>

        
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)]">
          <h3 className="mb-6 text-slate-800 text-lg font-bold">{t('7-Day Mood Trend')}</h3>
          <div className="w-full h-[280px]">
            <ResponsiveContainer>
              <LineChart data={data.moodTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis hide domain={[0, 10]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold', color: '#1e293b' }} 
                  itemStyle={{ color: '#ec4899' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#ec4899" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: "#ec4899", strokeWidth: 3, stroke: "#fff" }} 
                  activeDot={{ r: 8, fill: "#a855f7", stroke: "#fff", strokeWidth: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)]">
            <h3 className="mb-4 text-slate-800 text-lg font-bold">{t('Mood Breakdown')}</h3>
            <div className="w-full h-[220px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={data.breakdown} innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value" stroke="none">
                    {data.breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            
            <div className="flex justify-center flex-wrap gap-4 mt-4">
              {data.breakdown.filter(d => d.value > 0).map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {t(item.name)}
                </div>
              ))}
            </div>
          </div>

          
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)]">
            <h3 className="mb-6 text-slate-800 text-lg font-bold">{t('Wellness Activities')}</h3>
            {data.activities.length > 0 ? (
              <div className="w-full h-[220px]">
                <ResponsiveContainer>
                  <BarChart data={data.activities} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="activity" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }} />
                    <Bar dataKey="count" fill="#06b6d4" radius={[8, 8, 8, 8]} barSize={40}>
                      {data.activities.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#06b6d4" : "#a855f7"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm italic text-center leading-relaxed">
                {t('No activities detected yet.')}<br/>{t('Try mentioning "Yoga", "Reading",')}<br/>{t('or "Walking" in your notes!')}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}