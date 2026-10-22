@echo off
echo Cleaning up ports 3000 and 4000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 "') do (
  taskkill /f /pid %%a 2>nul
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":4000 "') do (
  taskkill /f /pid %%a 2>nul
)
echo Ports cleared! You can now run start-dev.bat again.
pause
