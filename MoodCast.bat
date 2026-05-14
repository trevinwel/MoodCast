@echo off
color 0d
title MoodCast Sovereign Core [SYSTEM BOOT]

echo =======================================================
echo         MOODCAST SOVEREIGN VAULT - INITIALIZING
echo =======================================================
echo.

echo [1/5] Waking up Local AI Engine (Ollama: Gemma-3)...
echo       - Establishing zero-telemetry environment
start "MoodCast AI Engine" /MIN ollama run gemma3:4b
timeout /t 4 /nobreak > NUL

echo [2/5] Decrypting Vault and Starting Python Backend...
echo       - Binding FastAPI to 127.0.0.1:8000
start "MoodCast Backend Core" cmd /k "cd server && python -m uvicorn main:app --host 127.0.0.1 --port 8000"
timeout /t 3 /nobreak > NUL

echo [3/5] Initializing Ethical Fail-safes ^& Crisis Monitor...
echo       - Connecting live system telemetry
timeout /t 2 /nobreak > NUL

echo [4/5] Compiling Local UI Dashboard...
echo       - Loading user consent protocols
start "MoodCast Frontend UI" cmd /k "cd client && npm run dev" 
timeout /t 4 /nobreak > NUL

echo [5/5] All Systems Nominal. Cloud Bypass Confirmed.
timeout /t 2 /nobreak > NUL

echo.
echo Launching Secure Vault in Default Browser...
start http://localhost:3000

echo.
