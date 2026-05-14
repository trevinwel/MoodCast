import requests
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from faster_whisper import WhisperModel
from dotenv import load_dotenv
import os
import database 
import datetime
import json 
import jwt 
import re

app = FastAPI(title="MoodCast Sovereign Core")

load_dotenv()
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM")

def analyze_with_local_llm(text):
    try:
        url = "http://localhost:11434/api/generate"
        payload = {
            "model": "gemma3:4b",  
            "prompt": f"You are a supportive AI for a journal app. Analyze this entry and give a 1-2 sentence empathetic response: {text}",
            "stream": False
        }
        
        response = requests.post(url, json=payload, timeout=60)
        response.raise_for_status()
        
        return response.json().get("response", "I'm listening. Your thoughts are safe here.")
        
    except Exception as e:
        print(f"--- Ollama Error: {e} ---")
        return "I'm here for you. It's good to get those thoughts out."

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)




class UserAuth(BaseModel):
    username: str
    password: str

class EntryCreate(BaseModel):
    username: str 
    content: str
    mood: Optional[str] = "Neutral"
    tags: Optional[List[str]] = []

class HabitCreate(BaseModel):
    username: str
    name: str
    color: str

class HabitToggle(BaseModel):
    username: str
    habit_id: str
    date: str


def get_db():
    db = database.SessionLocal()
    try: yield db
    finally: db.close()

system_config = {
    "quantization": "2bit",
    "threading": 4,
    "vault_rotation": True,
    "zero_cloud": True,
    "crisis_sensitivity": 8,
    "pruning": True,
    "crisis_keywords": ["suicide", "self-harm", "hurt", "end it", "pain", "hopeless"] # Default Watchlist
}

@app.on_event("startup")
def on_startup():
    database.init_db()
    





@app.post("/add_entry/")
async def add_entry(entry: EntryCreate, db: Session = Depends(get_db)):
    """Analyzes sentiment using Local Gemma 3 before encrypting into the vault."""
    
    threads = int(system_config.get("threading", 4))
    is_pruning = system_config.get("pruning", True)
    
    content_to_analyze = entry.content
    
    if is_pruning:
        fillers = ["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "is", "it", "of"]
        words = content_to_analyze.split()
        content_to_analyze = " ".join([w for w in words if w.lower() not in fillers])
       

    prompt = f"""
    Analyze the following journal entry and provide ONLY a single integer from 1 to 10 representing the mood.
    1 = extremely negative/sad, 10 = extremely positive/happy.
    Do not write any other words, just the number.
    Journal Entry: "{content_to_analyze}"
    """
    
    calculated_score = 5 
    
    try:
        response = requests.post('http://localhost:11434/api/generate', json={
            "model": "gemma3:4b", 
            "prompt": prompt,
            "stream": False,
            "options": {
                "num_thread": threads 
            }
        }, timeout=60) 
        
        if response.status_code == 200:
            ai_text = response.json().get("response", "").strip()
            numbers = re.findall(r'\d+', ai_text)
            if numbers:
                calculated_score = int(numbers[0])
                calculated_score = max(1, min(10, calculated_score)) 
                print(f"Gemma 3 Scored this entry as: {calculated_score}/10 using {threads} CPU Threads.")
    except Exception as e:
        print(f"Local AI offline or failed. Using fallback score. Error: {e}")

    
    is_crisis = False
    content_lower = entry.content.lower() 
    
    
    raw_sensitivity = float(system_config.get("crisis_sensitivity", 8))
    score_threshold = raw_sensitivity / 2.0
    
    if calculated_score <= score_threshold:
        is_crisis = True
        print(f"CRISIS DETECTED: Score {calculated_score} dropped below safety threshold ({score_threshold}).")
        
    
    if not is_crisis:
        kw_config = system_config.get("crisis_keywords", ["suicide", "self-harm", "hurt", "end it", "pain", "hopeless"])
        
        
        if isinstance(kw_config, str):
            keywords = [k.strip().lower() for k in kw_config.split(",") if k.strip()]
        else:
            keywords = [k.lower() for k in kw_config]
            
        if any(kw in content_lower for kw in keywords):
            is_crisis = True
            print("CRISIS DETECTED: Keyword match.")

    
    from database import cipher
    encrypted_text = cipher.encrypt(entry.content.encode())
    
    tags_json = json.dumps(entry.tags) if entry.tags else "[]"

    new_entry = database.JournalEntry(
        owner_username=entry.username, 
        encrypted_content=encrypted_text.decode(),
        mood=entry.mood,
        sentiment_score=calculated_score,
        tags=tags_json 
    )
    
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    
    
    return {"message": "Encrypted and processed locally", "analyzed_score": calculated_score, "is_crisis": is_crisis}

@app.get("/forecast/{username}")
def get_mood_forecast(username: str, lang: str = "en-US", db: Session = Depends(get_db)):
    entries = db.query(database.JournalEntry).filter(database.JournalEntry.owner_username == username).all()
    
    actual_scores = [e.sentiment_score for e in entries if e.sentiment_score is not None]
    
    if not actual_scores:
        return {"forecast": [5.0]*7, "insight": "No data yet. Start journaling!"}

    current_avg = round(sum(actual_scores) / len(actual_scores), 1)

    day_totals = {i: [] for i in range(7)}
    for e in entries:
        if e.sentiment_score is not None:
            day_of_week = e.timestamp.weekday()
            day_totals[day_of_week].append(e.sentiment_score)
            
    real_forecast = []
    for i in range(7):
        if len(day_totals[i]) > 0:
            real_forecast.append(round(sum(day_totals[i]) / len(day_totals[i]), 1))
        else:
            real_forecast.append(5.0) 
            
    insight_msg = f"Average: {current_avg}/10."

    if len(entries) >= 3:
        language_instruction = ""
        if lang == "si-LK":
            language_instruction = "You MUST write your response in Sinhala."
        elif lang == "ta-LK":
            language_instruction = "You MUST write your response in Tamil."

        prompt = f"""
        You are a grounded, literalist mood analyst. 
        The user has {len(entries)} recent entries with these specific scores: {actual_scores}.
        Their actual average is {current_avg}/10.

        IMPORTANT: 
        - A score of 7 is GOOD/STABLE. Do not act like the user is sad if they are scoring 7s.
        - Write a 2-sentence insight. Be brief and don't be overly dramatic.
        {language_instruction}
        """
        try:
            response = requests.post('http://localhost:11434/api/generate', json={
                "model": "gemma3:4b",
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.2
                }
            }, timeout=60)
            
            if response.status_code == 200:
                insight_msg = response.json().get("response", insight_msg).strip()
        except Exception:
            pass

    return {
        "forecast": real_forecast, 
        "insight": insight_msg
    }

@app.get("/get_entries/{username}")
def get_journal_entries(username: str, db: Session = Depends(get_db)):
    entries = db.query(database.JournalEntry).filter(database.JournalEntry.owner_username == username).order_by(database.JournalEntry.timestamp.desc()).all()
    
    decrypted_list = []
    for e in entries:
        try:
            content = database.cipher.decrypt(e.encrypted_content.encode()).decode()
            decrypted_list.append({"id": e.id, "content": content, "mood": e.mood, "timestamp": e.timestamp.strftime("%Y-%m-%d %H:%M")})
        except: continue
    return decrypted_list




@app.get("/habits/{username}")
def get_habits(username: str, lang: str = "en-US", db: Session = Depends(get_db)):
    db_habits = db.query(database.Habit).filter(database.Habit.username == username).all()
    
    today = datetime.datetime.now().strftime("%Y-%m-%d")
    yesterday = (datetime.datetime.now() - datetime.timedelta(days=1)).strftime("%Y-%m-%d")
    
    formatted_habits = []
    active_streaks = []
    slipping_habits = []
    
    for h in db_habits:
        dates = json.loads(h.completed_dates)
        formatted_habits.append({
            "id": h.id,
            "name": h.name,
            "color": h.color,
            "completedDates": dates
        })
        
        if today in dates or yesterday in dates:
            if len(dates) >= 2:
                active_streaks.append(h.name)
        elif len(dates) > 0 and yesterday not in dates:
            slipping_habits.append(h.name)
            
    feedback = "Your tracker is ready. Log a completion today to start building momentum."
    
    if active_streaks or slipping_habits:
        language_instruction = ""
        if lang == "si-LK":
            language_instruction = "You MUST write your response in Sinhala."
        elif lang == "ta-LK":
            language_instruction = "You MUST write your response in Tamil."

        prompt = f"""
        Act as a highly supportive productivity and wellness AI assistant.
        The user has active habit streaks in: {', '.join(active_streaks) if active_streaks else 'None'}.
        They recently missed logging: {', '.join(slipping_habits) if slipping_habits else 'None'}.
        Write a short, punchy 2-sentence encouraging message to keep them motivated. Keep it conversational and friendly.
        {language_instruction}
        """
        try:
            response = requests.post('http://localhost:11434/api/generate', json={
                "model": "gemma3:4b",
                "prompt": prompt,
                "stream": False
            }, timeout=60)
            
            if response.status_code == 200:
                feedback = response.json().get("response", feedback).strip()
        except Exception as e:
            print(f"Local AI offline for habits: {e}")
        
    return {"habits": formatted_habits, "insight": feedback}

@app.post("/habits/add")
def add_habit(data: HabitCreate, db: Session = Depends(get_db)):
    habit_id = str(int(datetime.datetime.now().timestamp() * 1000))
    new_habit = database.Habit(
        id=habit_id,
        username=data.username,
        name=data.name,
        color=data.color,
        completed_dates="[]"
    )
    db.add(new_habit)
    db.commit()
    return {"status": "success", "habit_id": habit_id}

@app.post("/habits/toggle")
def toggle_habit(data: HabitToggle, db: Session = Depends(get_db)):
    habit = db.query(database.Habit).filter(database.Habit.id == data.habit_id, database.Habit.username == data.username).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
        
    dates = json.loads(habit.completed_dates)
    if data.date in dates:
        dates.remove(data.date) 
    else:
        dates.append(data.date) 
        
    habit.completed_dates = json.dumps(dates)
    db.commit()
    return {"status": "success"}

@app.delete("/habits/{username}/{habit_id}")
def delete_habit(username: str, habit_id: str, db: Session = Depends(get_db)):
    habit = db.query(database.Habit).filter(database.Habit.id == habit_id, database.Habit.username == username).first()
    if habit:
        db.delete(habit)
        db.commit()
    return {"status": "success"}




@app.post("/register")
def register_user(user: UserAuth, db: Session = Depends(get_db)):
    existing = db.query(database.User).filter(database.User.username == user.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    
    new_user = database.User(username=user.username, hashed_password=user.password, is_admin=False)
    db.add(new_user)
    db.commit()
    
    base_time = int(datetime.datetime.now().timestamp() * 1000)
    seed_habits = [
        database.Habit(id=str(base_time + 1), username=user.username, name="Sleep Tracking", color="#3b82f6", completed_dates="[]"),
        database.Habit(id=str(base_time + 2), username=user.username, name="Caffeine Intake", color="#f59e0b", completed_dates="[]"),
        database.Habit(id=str(base_time + 3), username=user.username, name="Exercise", color="#10b981", completed_dates="[]")
    ]
    db.bulk_save_objects(seed_habits)
    db.commit()
    
    print(f"--- New User Registered & Baseline Habits Seeded: {user.username} ---")
    return {"status": "success"}

@app.post("/login")
def login_user(user: UserAuth, db: Session = Depends(get_db)):
    db_user = db.query(database.User).filter(database.User.username == user.username).first()
    
    if not db_user or db_user.hashed_password != user.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    
    expiration_time = datetime.datetime.now(datetime.UTC) + datetime.timedelta(hours=24)
    
    token_payload = {
        "sub": db_user.username,
        "is_admin": db_user.is_admin,
        "exp": expiration_time
    }
    
    encoded_jwt = jwt.encode(token_payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    
    return {
        "access_token": encoded_jwt, 
        "token_type": "bearer",
        "user": db_user.username
    }




@app.get("/admin/config")
def get_admin_config():
    return system_config

@app.post("/admin/config/update")
def update_admin_config(new_params: dict):
    global system_config
    system_config.update(new_params)
    print(f"--- System Configuration Updated by User --- \n{system_config}")
    return {"status": "Updated"}

@app.get("/export/{username}")
def export_vault(username: str, db: Session = Depends(get_db)):
    """Exports the raw, encrypted vault data for cold storage."""
    entries = db.query(database.JournalEntry).filter(database.JournalEntry.owner_username == username).all()
    habits = db.query(database.Habit).filter(database.Habit.username == username).all()
    
    export_data = {
        "user": username,
        "export_date": datetime.datetime.now().isoformat(),
        "encrypted_entries": [{"id": e.id, "ciphertext": e.encrypted_content, "mood": e.mood, "timestamp": e.timestamp.strftime("%Y-%m-%d %H:%M")} for e in entries],
        "habits": [{"id": h.id, "name": h.name, "completed_dates": h.completed_dates} for h in habits]
    }
    return export_data

@app.delete("/nuke/{username}")
def nuke_vault(username: str, db: Session = Depends(get_db)):
    """Permanently obliterates all user data, habits, and credentials from the local database."""
    db.query(database.JournalEntry).filter(database.JournalEntry.owner_username == username).delete()
    db.query(database.Habit).filter(database.Habit.username == username).delete()
    db.query(database.User).filter(database.User.username == username).delete()
    db.commit()
    print(f"--- VAULT OBLITERATED FOR USER: {username} ---")
    return {"status": "Obliterated"}

model = WhisperModel("tiny", device="cpu", compute_type="int8")

@app.post("/api/journal/voice")
async def process_voice_journal(file: UploadFile = File(...)):
    temp_filename = "temp_audio.wav"
    
    
    try:
        content = await file.read()
        with open(temp_filename, "wb") as buffer:
            buffer.write(content)

        
        segments, info = model.transcribe(
            temp_filename, 
            beam_size=1, 
            vad_filter=True,
            word_timestamps=False
        )
        
        full_text = " ".join([segment.text for segment in segments]).strip()

        
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

        if not full_text:
            return {"transcript": "", "analysis": "I couldn't hear anything. Try speaking a bit louder?"}

        ai_analysis = analyze_with_local_llm(full_text)
        return {"transcript": full_text, "analysis": ai_analysis}

    except Exception as e:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
        print(f"Transcription Error: {e}")
        raise HTTPException(status_code=500, detail="Voice processing failed.")