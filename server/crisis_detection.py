from typing import Dict, List, Tuple
import re

class CrisisDetector:
  
    def __init__(self):
         
      
        self.risk_patterns = {
            "english": [
                r"\bself-harm\b", r"\bsuicide\b", r"\bend it all\b", 
                r"\bno reason to live\b", r"\bhurt myself\b", r"\bhopeless\b"
            ],
            "sinhala": [
                r"ජීවිතය නැති කර", r"මැරෙන්න ඕන", r"අසරණයි" 
            ],
            "tamil": [
                r"தற்கொலை", r"வாழ பிடிக்கவில்லை", r"உயிரை மாய்க்க"
            ]
        }
        
        
        self.resources = {
            "helpline": "1926 (National Mental Health Helpline - Sri Lanka)",
            "organization": "Sumithrayo",
            "contact": "011 268 2535",
            "emergency": "Call 119 for immediate assistance"
        }

    def scan_content(self, text: str) -> Tuple[bool, List[str]]:
        """
        Scans decrypted text for crisis triggers.
        """
        detected_markers = []
        text_lower = text.lower()
        
        for language, patterns in self.risk_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text_lower):
                    detected_markers.append(pattern)
        
        is_high_risk = len(detected_markers) > 0
        return is_high_risk, self.resources if is_high_risk else {}


crisis_detector = CrisisDetector()