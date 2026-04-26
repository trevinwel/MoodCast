import json
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Boolean, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from cryptography.fernet import Fernet
import datetime

DATABASE_URL = "sqlite:///./moodcast_vault.db"
ENCRYPTION_KEY = b'8shBrjKeY5hW70EVS_BzhNzLXjML8bU86-HhdbOd_jQ=' 
cipher = Fernet(ENCRYPTION_KEY)

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    """Stores local credentials for Sovereign Mode."""
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_admin = Column(Boolean, default=False)

class JournalEntry(Base):
    """The core encrypted table for MoodCast journal entries."""
    __tablename__ = "journal_entries"
    id = Column(Integer, primary_key=True, index=True)
    owner_username = Column(String, index=True)
    encrypted_content = Column(Text)
    mood = Column(String)
    sentiment_score = Column(Float, default=0.5) 
    tags = Column(String, default="[]") 
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class Habit(Base):
    """Stores user habits and their long-term completion history."""
    __tablename__ = "habits"
    id = Column(String, primary_key=True, index=True)
    username = Column(String, index=True) 
    name = Column(String)
    color = Column(String)
    completed_dates = Column(Text, default="[]") 

def init_db():
    """Initializes the vault and seeds the admin@moodcast.app user."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    admin_username = "admin@moodcast.app"
    if not db.query(User).filter(User.username == admin_username).first():
        db.add(User(username=admin_username, hashed_password="admin_pass_123", is_admin=True))
        db.commit()
        print("--- MoodCast: Admin Account Created ---")
    db.close()