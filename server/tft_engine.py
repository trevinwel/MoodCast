import torch
import torch.nn as nn
import numpy as np
from typing import Dict, List

class MoodForecasterTFT(nn.Module):
    """
    Temporal Fusion Transformer (TFT) for MoodCast.
    Designed to process sentiment vectors and habit covariates locally[cite: 50, 158, 189].
    """
    def __init__(self, input_dim: int, hidden_dim: int, output_horizon: int = 7):
        super(MoodForecasterTFT, self).__init__()
        self.output_horizon = output_horizon
        
        
        self.vsn = nn.Linear(input_dim, hidden_dim)
        
        
        self.lstm = nn.LSTM(hidden_dim, hidden_dim, batch_first=True)
        
        
        self.attention = nn.MultiheadAttention(embed_dim=hidden_dim, num_heads=4)
        
        
        self.forecast_head = nn.Linear(hidden_dim, output_horizon)

    def forward(self, x):
        
        x = torch.relu(self.vsn(x))
        lstm_out, _ = self.lstm(x)
        
        
        attn_out, _ = self.attention(lstm_out, lstm_out, lstm_out)
        
        
        prediction = self.forecast_head(attn_out[:, -1, :])
        return prediction

class TFTEngine:
    def __init__(self):
        
        self.model = MoodForecasterTFT(input_dim=5, hidden_dim=64) 
        self.model.eval()

    def predict(self, features: Dict) -> List[float]:
      
        
        input_tensor = torch.FloatTensor([[
            features['sentiment_score'],
            features['emotional_polarity'],
            features['sleep'],
            features['caffeine'],
            features['exercise']
        ]]).unsqueeze(0) 

        with torch.no_grad():
            forecast = self.model(input_tensor)
        
        
        return forecast.squeeze().tolist()

tft_engine = TFTEngine()