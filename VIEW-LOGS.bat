@echo off
COLOR 0B

echo ========================================
echo   DocuAI - View Logs
echo ========================================
echo.

echo Opening logs...
echo Press Ctrl+C to exit logs view
echo.

docker-compose logs -f
