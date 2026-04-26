@echo off
color 0b
title MoodCast Automated Installer
echo.
echo This will automatically download all required background files.
echo Please make sure you are connected to the internet.
echo.
pause

echo.
echo [1/2] Installing Python Security & Server Packages...
pip install fastapi uvicorn sqlalchemy pydantic pyjwt requests

echo.
echo [2/2] Installing UI Dashboard Packages...
:: NOTE: Make sure the word "frontend" below matches your React folder name!
cd frontend 
npm install

echo.
echo You only ever have to run this file once. 
echo You can now close this window and double-click "Start_MoodCast.bat"
echo.
pause