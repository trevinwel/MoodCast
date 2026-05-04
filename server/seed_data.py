import database
import random
from datetime import datetime, timedelta, UTC

def seed_factory():
    
    database.init_db()
    db = database.SessionLocal()
    
    print("--- Starting MoodCast Data Population ---")

    
    test_usernames = [
        "subject_alpha@moodcast.app", 
        "beta_tester@moodcast.app", 
        "gamma_user@moodcast.app",
        "delta_test@moodcast.app"
    ]
    
    for uname in test_usernames:
        if not db.query(database.User).filter(database.User.username == uname).first():
            new_user = database.User(
                username=uname,
                hashed_password="test_password_123",
                is_admin=False
            )
            db.add(new_user)
    
    db.commit()
    print(f"Created {len(test_usernames)} test subjects.")

    
    mood_options = ["High Energy", "Stable", "Low Energy", "Anxious", "Calm"]
    
    for i in range(25):
        random_days = random.randint(0, 7)
        
        timestamp = datetime.now(UTC) - timedelta(days=random_days, hours=random.randint(0, 23))
        
        
        sentiment = round(random.uniform(0.05, 0.95), 3)
        
        content = f"Test Entry {i}: System integrity diagnostic."
        encrypted_content = database.cipher.encrypt(content.encode()).decode()

        entry = database.JournalEntry(
            encrypted_content=encrypted_content,
            mood=random.choice(mood_options),
            sentiment_score=sentiment,
            timestamp=timestamp
        )
        db.add(entry)

    db.commit()
    print("Successfully seeded 25 encrypted journal entries.")
    db.close()
    print("--- Population Complete ---")

if __name__ == "__main__":
    seed_factory()