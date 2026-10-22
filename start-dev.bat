@echo off
echo ========================================================
echo   Starting Universal AI App Builder Platform...
echo ========================================================

start "Universal AI Backend (Port 4000)" cmd /k "npm run server:dev"
timeout /t 3 /nobreak >nul
start "Universal AI Frontend (Port 3000)" cmd /k "npm run web:dev"

echo.
echo Platform is launching!
echo Backend API : http://localhost:4000
echo Frontend UI : http://localhost:3000
echo.
pause

