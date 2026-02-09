@echo off
COLOR 0C

echo ========================================
echo   DocuAI - Stop Application
echo ========================================
echo.

echo Stopping DocuAI...
docker-compose down

if %ERRORLEVEL% EQU 0 (
    COLOR 0A
    echo.
    echo [OK] DocuAI stopped successfully!
) else (
    echo.
    echo [ERROR] Failed to stop DocuAI
)

echo.
pause
