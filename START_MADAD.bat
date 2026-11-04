@echo off
title MADAD Connect Platform
echo ========================================================
echo         STARTING MADAD CONNECT SOCIAL PLATFORM          
echo ========================================================
echo.
echo 1. Starting Express API backend & React Frontend...
echo 2. Opening http://localhost:5173 in your browser...
echo.

start "" "http://localhost:5173"
node run_all.js

pause
