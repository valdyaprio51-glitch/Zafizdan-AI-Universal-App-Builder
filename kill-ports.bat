@echo off
echo Cleaning up ports 3000, 4000 and cache...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 "') do (
  taskkill /f /pid %%a 2>nul
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":4000 "') do (
  taskkill /f /pid %%a 2>nul
)
if exist "apps\web\.next" (
  rmdir /s /q "apps\web\.next" 2>nul
)
echo Cache and ports cleared! You can now run start-dev.bat.
pause

