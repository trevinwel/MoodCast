import React, { useState, useEffect, useRef } from "react";
import { Smile, Heart, Meh, Frown, Angry, Save, Mic, Square, Lock, HeartHandshake } from "lucide-react";
import axios from "axios"; 
import { useTranslation } from 'react-i18next'; 

export default function Journal() {
  const { t } = useTranslation(); 
  
  const [selectedMood, setSelectedMood] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [entryText, setEntryText] = useState(""); 
  const [entries, setEntries] = useState([]); 
  
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [crisisAlert, setCrisisAlert] = useState(false); 
  
  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false); 
  const transcriptRef = useRef("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const fetchEntries = async () => {
    try {
      const activeUser = localStorage.getItem("username");
      if (!activeUser) return;
      
      const response = await axios.get(`http://127.0.0.1:8000/get_entries/${activeUser}`);
      setEntries(response.data.reverse());
    } catch (error) {
      console.error("Failed to fetch entries:", error);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const toggleDictation = async () => {
    
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
      return;
    }

    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('file', audioBlob, 'journal_voice.wav');

        setIsAnalyzing(true); 
        
        try {
          
          const response = await axios.post('http://127.0.0.1:8000/api/journal/voice', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          if (response.data.transcript) {
            setEntryText((prev) => (prev + (prev ? " " : "") + response.data.transcript).trim());
          }
          
          if (response.data.analysis) {
            setAiResponse(response.data.analysis);
          }

        } catch (err) {
          console.error("Local Whisper processing failed:", err);
          alert("Local AI server is offline. Check your terminal!");
        } finally {
          setIsAnalyzing(false);
          
          stream.getTracks().forEach(track => track.stop());
        }
      };

      
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

    } catch (err) {
      console.error("Mic access denied:", err);
      alert("Please allow microphone access for local dictation.");
    }
  };

  const moods = [
    { icon: Smile, label: "Great", color: "#f59e0b", bg: "#fef3c7" },
    { icon: Heart, label: "Good", color: "#ec4899", bg: "#fce7f3" },
    { icon: Meh, label: "Okay", color: "#06b6d4", bg: "#cffafe" },
    { icon: Frown, label: "Low", color: "#6366f1", bg: "#e0e7ff" },
    { icon: Angry, label: "Difficult", color: "#e11d48", bg: "#ffe4e6" },
  ];

  const availableTags = ["Grateful", "Calm", "Anxious", "Hopeful", "Stressed", "Happy", "Sad", "Focused", "Tired"];

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const getMoodData = (moodLabel) => {
    if (!moodLabel || moodLabel === "Neutral") return { icon: Meh, color: "#94a3b8", bg: "#f1f5f9" };
    return moods.find(m => m.label === moodLabel) || { icon: Smile, color: "#94a3b8", bg: "#f1f5f9" };
  };

  const handleSave = async () => {
    let finalTextToSave = entryText;
    
    if (isRecordingRef.current) {
      toggleDictation();
      finalTextToSave = (entryText + (entryText && transcriptRef.current ? " " : "") + transcriptRef.current).trim();
    }

    if (!finalTextToSave.trim()) return alert(t("Please write or dictate something first!"));
    if (!selectedMood) return alert(t("Please select a mood before saving!"));

    try {
      const activeUser = localStorage.getItem("username");
      if (!activeUser) return alert(t("You must be logged in to save an entry."));

      const response = await axios.post("http://127.0.0.1:8000/add_entry/", {
        username: activeUser, 
        content: finalTextToSave,
        mood: selectedMood,
        tags: selectedTags 
      });

      if (response.status === 200) {
        
        
        if (response.data.is_crisis) {
            setCrisisAlert(true);
        }

        setEntryText(""); 
        setSelectedMood("");
        setSelectedTags([]);
        setTranscript("");
        transcriptRef.current = "";
        fetchEntries(); 
      }
    } catch (error) {
      console.error("Connection Error:", error);
      alert(t("Backend connection failed. Make sure the Python server is running!"));
    }
  };

  const displayValue = isRecording ? (entryText + (entryText && transcript ? " " : "") + transcript) : entryText;

  return (
    <div className="min-h-screen bg-[#f9f8fd] text-slate-700 font-sans pb-[120px] relative">
      <div className="max-w-[800px] mx-auto py-10 px-6 flex flex-col gap-10 relative z-10">
        
        
        <header className="text-center flex flex-col gap-2">
          <h1 className="text-[40px] font-light text-purple-600 m-0 tracking-tight">{t('Journal')}</h1>
          <p className="m-0 text-slate-500 text-[15px]">{t('Express your thoughts and securely lock them away')}</p>
        </header>

        
        <div className="bg-white rounded-[32px] p-10 border border-slate-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] flex flex-col gap-8">
          
          <h3 className="m-0 text-purple-500 font-semibold text-xl">{t('New Entry')}</h3>

          
          <div className="flex flex-col gap-3">
            <label className="text-sm text-slate-600 font-semibold">{t('How are you feeling?')}</label>
            <div className="flex gap-3 flex-wrap">
              {moods.map((mood) => {
                const Icon = mood.icon;
                const isSelected = selectedMood === mood.label;
                return (
                  <button
                    key={mood.label}
                    onClick={() => setSelectedMood(mood.label)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full cursor-pointer transition-all duration-200 border ${
                      isSelected 
                        ? "border-transparent scale-105 shadow-md" 
                        : "border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                    style={{
                      backgroundColor: isSelected ? mood.bg : undefined,
                      color: isSelected ? mood.color : "#64748b",
                      fontWeight: isSelected ? "bold" : "500"
                    }}
                  >
                    <Icon size={18} strokeWidth={2.5} />
                    <span>{t(mood.label)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-slate-600 font-semibold">{t("What's on your mind?")}</label>
              <button
                onClick={toggleDictation}
                className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer text-xs font-bold border-none transition-all duration-200 ${
                  isRecording 
                    ? "bg-red-100 text-red-500 animate-pulse" 
                    : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                }`}
              >
                {isRecording ? (
                  <><Square size={14} fill="#ef4444" /> {t('Listening...')}</>
                ) : (
                  <><Mic size={14} /> {t('Dictate')}</>
                )}
              </button>
            </div>
            
            <textarea
              value={displayValue}
              onChange={(e) => { if (!isRecording) setEntryText(e.target.value); }}
              disabled={isRecording} 
              placeholder={t("Write about your day, or click 'Dictate' to speak your thoughts...")}
              className={`w-full min-h-[160px] rounded-3xl p-6 text-base leading-relaxed resize-none outline-none box-border font-sans transition-all duration-300 text-slate-700 border-2 ${
                isRecording 
                  ? "bg-red-50 border-red-300" 
                  : "bg-slate-50 border-slate-200 focus:bg-white focus:border-purple-300 focus:ring-4 focus:ring-purple-500/10"
              }`}
            />
          </div>

          
          <div className="flex flex-col gap-3">
            <label className="text-sm text-slate-600 font-semibold">
              {t('Add tags')} <span className="text-slate-400 font-normal text-xs">{t('(Select multiple)')}</span>
            </label>
            <div className="flex gap-2.5 flex-wrap">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-full text-xs cursor-pointer transition-all duration-200 border ${
                      isSelected 
                        ? "bg-slate-700 text-white border-transparent font-bold scale-105" 
                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50 font-medium"
                    }`}
                  >
                    {t(tag)}
                  </button>
                );
              })}
            </div>
          </div>

          
          <button 
            onClick={handleSave}
            className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-none p-4 rounded-full flex items-center justify-center gap-2 font-bold text-base cursor-pointer mt-2 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-pink-500/40 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Save size={18} />
            {t('Save Entry')}
          </button>
        </div>

        
        <div className="flex flex-col gap-6">
          <h3 className="m-0 mt-4 text-cyan-500 font-semibold text-xl">{t('Past Entries')}</h3>
          
          {entries.length === 0 ? (
            <div className="text-center py-[60px] px-5 bg-white rounded-3xl border border-slate-100">
              <p className="m-0 text-slate-400 italic">{t('No entries yet. Start writing!')}</p>
            </div>
          ) : (
            entries.map((entry) => {
              const moodInfo = getMoodData(entry.mood);
              const MoodIcon = moodInfo.icon;

              return (
                <div key={entry.id} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.02)] flex flex-col gap-5">
                  
                  
                  <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: moodInfo.bg }}
                      >
                        <MoodIcon size={24} color={moodInfo.color} strokeWidth={2.5} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-base font-bold text-slate-800">{t(entry.mood)}</span>
                        <span className="text-xs text-slate-500 font-medium">{entry.timestamp || entry.date}</span>
                      </div>
                    </div>
                    
                    <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                      <Lock size={10} className="text-green-500" />
                      <span className="text-[9px] font-bold tracking-widest text-green-500 uppercase">{t('Secure')}</span>
                    </div>
                  </div>

                  
                  <p className="m-0 text-slate-600 leading-relaxed text-[15px] whitespace-pre-wrap">
                    {entry.content}
                  </p>

                  
                  {(() => {
                    let parsedTags = [];
                    if (Array.isArray(entry.tags)) parsedTags = entry.tags;
                    else if (typeof entry.tags === "string") {
                      try { parsedTags = JSON.parse(entry.tags.replace(/'/g, '"')); } catch (e) { parsedTags = []; }
                    }

                    if (parsedTags && parsedTags.length > 0) {
                      return (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {parsedTags.map((tag, i) => (
                            <span key={i} className="text-[11px] font-semibold bg-slate-50 text-slate-500 px-3 py-1.5 rounded-full border border-slate-200">
                              {t(tag)}
                            </span>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              );
            })
          )}
        </div>
      </div>


      
      {crisisAlert && (
        <div className="fixed bottom-[110px] left-1/2 -translate-x-1/2 w-[90%] max-w-[500px] bg-rose-50 border-2 border-rose-200 rounded-3xl p-6 shadow-[0_20px_40px_-10px_rgba(225,29,72,0.3)] z-[100] transition-all duration-500 transform translate-y-0 opacity-100">
          <div className="flex items-start gap-5">
            <div className="p-3.5 bg-rose-100 rounded-full text-rose-600 shrink-0">
              <HeartHandshake size={28} />
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="m-0 text-rose-800 font-extrabold text-[20px]">{t('You are not alone')}</h4>
              <p className="m-0 text-rose-700 text-[15px] leading-relaxed">
                {t('We noticed you might be going through a really tough time right now. Your feelings are valid, and it\'s okay to ask for help.')}
              </p>
              <div className="mt-2 flex flex-col gap-1.5 text-[15px] font-bold text-rose-900 bg-white/60 p-4 rounded-2xl border border-rose-100">
                <span className="flex items-center gap-2">📞 {t('National Crisis Helpline: 1333')}</span>
                <span className="flex items-center gap-2">🤝 {t('Sri Lanka Sumithrayo: 011 269 2909')}</span>
              </div>
              <button 
                onClick={() => setCrisisAlert(false)}
                className="mt-4 bg-rose-600 hover:bg-rose-700 text-white border-none rounded-full py-3 px-6 font-bold cursor-pointer transition-colors text-[15px] w-fit shadow-md shadow-rose-600/30 hover:-translate-y-0.5"
              >
                {t('I understand, close')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}