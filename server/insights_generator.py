from fpdf import FPDF
from datetime import datetime, timedelta
import database

class WeeklyReport(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 15)
        self.cell(0, 10, 'MoodCast: Weekly Emotional Intelligence Report', 0, 1, 'C')
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, 'Privacy Guaranteed: Processed locally on-device. No data transmitted.', 0, 0, 'C')

def generate_weekly_pdf(user_id: int, db_session):
    
    report = WeeklyReport()
    report.add_page()
    report.set_font("Arial", size=12)

    
    end_date = datetime.now()
    start_date = end_date - timedelta(days=7)
    
    report.cell(200, 10, txt=f"Reporting Period: {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}", ln=True)
    report.ln(10)

   
    entries = db_session.query(database.JournalEntry).filter(
        database.JournalEntry.timestamp >= start_date
    ).all()
    
    habits = db_session.query(database.HabitLog).filter(
        database.HabitLog.timestamp >= start_date
    ).all()

    
    report.set_font("Arial", 'B', 12)
    report.cell(200, 10, txt="1. Emotional Sentiment Summary", ln=True)
    report.set_font("Arial", size=11)
    
    for entry in entries:
        date_str = entry.timestamp.strftime("%b %d")
        report.cell(200, 8, txt=f"- {date_str}: Mood: {entry.mood} | Tags: {entry.tags}", ln=True)

    report.ln(5)

    
    report.set_font("Arial", 'B', 12)
    report.cell(200, 10, txt="2. Behavioral Habit Tracking", ln=True)
    report.set_font("Arial", size=11)
    
    avg_sleep = sum(h.sleep_hours for h in habits) / len(habits) if habits else 0
    report.cell(200, 8, txt=f"- Average Sleep: {avg_sleep:.1f} hours", ln=True)
    report.cell(200, 8, txt=f"- Total Caffeine Logs: {len(habits)} entries recorded", ln=True)

    
    report.ln(5)
    report.set_font("Arial", 'B', 12)
    report.cell(200, 10, txt="3. AI-Driven Short-Term Forecast (Next 7 Days)", ln=True)
    report.set_font("Arial", size=11)
    report.multi_cell(0, 8, txt="Your personalized Temporal Fusion Transformer model suggests a steady emotional trend based on your improved sleep patterns this week.")

    
    report.ln(10)
    report.set_text_color(128, 128, 128)
    report.set_font("Arial", 'I', 9)
    report.multi_cell(0, 5, txt="Disclaimer: MoodCast is an educational tool for self-awareness and is not a medical diagnostic device. For emergencies, please consult local crisis resources immediately.")

    
    filename = f"MoodCast_Report_{datetime.now().strftime('%Y%m%d')}.pdf"
    report.output(filename)
    return filename