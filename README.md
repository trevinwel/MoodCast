MoodCast: A Privacy-First Sovereign Journaling Vault
An offline, decentralized journaling platform designed to process emotional data entirely on local hardware. Built for absolute data sovereignty, MoodCast eliminates "privacy anxiety" by ensuring zero external data transmission while still delivering advanced artificial intelligence analytics.

Academic Context: This project was developed as a final-year submission for the BSc (Hons) Technology Management program (NSBM Green University / University of Plymouth).

Table of Contents

1.Project Overview
2.Key Features
3.Technology Stack
4.Repository Notes
5.Prerequisites
6.Installation & Setup
7.Running the Application
8.System Architecture

Project Overview

Digital journaling serves as a vital mechanism for tracking mental well-being. However, reliance on modern cloud infrastructure forces users to store intimate reflections on third-party servers, leading to "privacy anxiety."

MoodCast resolves this by implementing a strict "Sovereign Vault" architecture. It provides intelligent emotional analytics, hands-free voice transcription, and mood forecasting without ever connecting to the internet, creating a genuinely secure sanctuary for personal reflection.

Key Features

Zero-Cloud Architecture: 100% local processing with zero external network dependencies or data leakage.

Hands-Free Journaling: Near-instant, highly accurate speech-to-text conversion via Faster-Whisper.

Intelligent Mood Forecasting: Generates empathetic feedback and emotional trend analysis (~14s) using a locally hosted Gemma 3 model.

Secure Local Storage: All journal entries and metrics are stored locally, locked to the user's specific hardware.

Technology Stack

Frontend: React.js (Vite/Dev Server)

Backend: Python / FastAPI

Local AI / LLM: Gemma 3 (via local environment)

Transcription: Faster-Whisper 

Dependencies:
To ensure a smooth demonstration, the node_modules for the frontend are pre-included in this repository/folder. You do not need to run npm install. Simply navigate to the /client directory and run npm run dev.

Prerequisites
Before running MoodCast, ensure the following are installed:

Python (v3.10 to v3.13)

Node.js (v16 or higher)

Ollama local LLM server configured to serve Gemma 3.

Installation & Setup

1. Clone the Repository

git clone https://github.com/trevinwel/MoodCast.git
cd MoodCast

2. Backend Environment

cd server

source venv/Scripts/activate

pip install -r requirements.txt

Running the Application
cd server
python main.py

Terminal 2: Launch the Frontend (Client)
cd client
npm run dev

System Architecture
MoodCast utilizes a decoupled architecture communicating via REST APIs:

Client Layer: React handles UI rendering and audio capture.

API Gateway: FastAPI (Python) routes requests securely.

Inference Engine: Dedicated local processes handle transcription (Faster-Whisper) and sentiment analysis (Gemma 3).

Privacy Validation: Network packet monitoring confirms that zero outbound web requests are made during the AI inference phase. All data remains strictly within the local hardware boundary.

CI/CD Pipeline
This repository utilizes GitHub Actions for Continuous Integration.

Frontend: Automated builds via Node.js 20 to ensure UI integrity.

Backend: Environment validation and dependency auditing for the FastAPI core.

Privacy Check: Ensures no .env or sensitive vault keys are leaked to the version control history.

Sovereign Launch Sequence
MoodCast is designed to run in a zero-telemetry, fully local environment.

Ensure Ollama is installed and the gemma3:4b model is pulled.

Double-click MoodCast.bat in the root directory.

This will automatically:

Initialize the Local AI Engine.

Boot the FastAPI Sovereign Server (Port 8000).

Compile the React Client Dashboard (Port 3000).

Trigger the Ethical Fail-safe & Crisis Monitor.
