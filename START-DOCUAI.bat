@echo off
SETLOCAL EnableDelayedExpansion
COLOR 0A

echo ========================================
echo   DocuAI - Automated Setup
echo ========================================
echo.

REM Check if Docker is installed
echo [1/5] Checking Docker installation...
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    COLOR 0C
    echo.
    echo [ERROR] Docker is not installed!
    echo.
    echo Please install Docker Desktop from:
    echo https://www.docker.com/products/docker-desktop
    echo.
    echo After installing Docker Desktop:
    echo 1. Restart your computer
    echo 2. Run this script again
    echo.
    pause
    exit /b 1
)
echo [OK] Docker is installed
echo.

REM Check if Docker is running
echo [2/5] Checking if Docker is running...
docker ps >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    COLOR 0E
    echo.
    echo [WARNING] Docker Desktop is not running!
    echo.
    echo Please start Docker Desktop and wait for it to be ready.
    echo Look for the Docker icon in your system tray.
    echo.
    echo Press any key after Docker Desktop is running...
    pause >nul
    
    REM Check again
    docker ps >nul 2>&1
    if !ERRORLEVEL! NEQ 0 (
        COLOR 0C
        echo.
        echo [ERROR] Docker is still not running.
        echo Please make sure Docker Desktop is started.
        echo.
        pause
        exit /b 1
    )
)
echo [OK] Docker is running
echo.

REM Stop any existing containers
echo [3/5] Cleaning up old containers...
docker-compose down >nul 2>&1
echo [OK] Cleanup complete
echo.

REM Build and start the application
echo [4/5] Building and starting DocuAI...
echo This may take a few minutes on first run...
echo.
docker-compose up -d --build

if %ERRORLEVEL% NEQ 0 (
    COLOR 0C
    echo.
    echo [ERROR] Failed to start the application!
    echo.
    echo Please check the error messages above.
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] Application started successfully!
echo.

REM Wait for application to be ready
echo [5/5] Waiting for application to be ready...
timeout /t 10 /nobreak >nul

REM Check if application is responding
set MAX_RETRIES=30
set RETRY_COUNT=0

:CHECK_HEALTH
set /a RETRY_COUNT+=1
curl -s http://localhost:3000/api/health >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    goto HEALTH_OK
)

if %RETRY_COUNT% GEQ %MAX_RETRIES% (
    COLOR 0E
    echo.
    echo [WARNING] Application is taking longer than expected to start.
    echo It may still be initializing. Opening browser anyway...
    goto OPEN_BROWSER
)

timeout /t 2 /nobreak >nul
goto CHECK_HEALTH

:HEALTH_OK
echo [OK] Application is ready!
echo.

:OPEN_BROWSER
COLOR 0A
echo ========================================
echo   SUCCESS!
echo ========================================
echo.
echo DocuAI is now running!
echo.
echo Opening browser at: http://localhost:3000
echo.
echo Login credentials:
echo   Email:    admin@docuai.com
echo   Password: admin123
echo.
echo ========================================
echo.

REM Open browser
start http://localhost:3000

echo.
echo To view logs:    docker-compose logs -f
echo To stop app:     docker-compose down
echo To restart:      Run this script again
echo.
echo Press any key to close this window...
pause >nul
