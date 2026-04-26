@echo off
color 0d
title MoodCast Sovereign Core [SYSTEM BOOT]


echo             Secure Local Initialization
echo.

echo [1/4] Waking up Local AI Engine (Ollama: Gemma-3)...
start "MoodCast AI Engine" /MIN ollama run gemma3:4b
timeout /t 4 /nobreak > NUL

echo [2/4] Decrypting Vault and Starting Python Backend...
start "MoodCast Backend Core" cmd /k "python -m uvicorn main:app --host 127.0.0.1 --port 8000"
timeout /t 3 /nobreak > NUL

echo [3/4] Compiling Local UI Dashboard...
start "MoodCast Frontend UI" cmd /k "npm run dev" 
timeout /t 4 /nobreak > NUL

echo [4/4] All Systems Nominal. Bypassing Cloud...
timeout /t 2 /nobreak > NUL

echo Launching Secure Vault in Default Browser...
start http://localhost:3000

echo.
