@echo off
setlocal EnableExtensions

set "REPO_ROOT=%~dp0.."
for %%I in ("%REPO_ROOT%") do set "REPO_ROOT=%%~fI"
set "BACKEND_DIR=%REPO_ROOT%\backend-development"
set "FRONTEND_DIR=%REPO_ROOT%\frontend-development\cid"
set "SET_URL_SCRIPT=%REPO_ROOT%\scripts\set-backend-url.bat"
set "COMPOSE_FILE=%BACKEND_DIR%\docker-compose.local.yml"
set "ENV_LOCAL=%BACKEND_DIR%\.env.local"
set "FIREBASE_KEY=%BACKEND_DIR%\secrets\firebase-service-account.json"

if not exist "%SET_URL_SCRIPT%" (
  echo [ERROR] Missing script: %SET_URL_SCRIPT%
  exit /b 1
)
if not exist "%COMPOSE_FILE%" (
  echo [ERROR] Missing compose file: %COMPOSE_FILE%
  exit /b 1
)
if not exist "%ENV_LOCAL%" (
  echo [ERROR] Missing %ENV_LOCAL%
  echo         Copy .env.local.example to .env.local and fill values.
  exit /b 1
)
if not exist "%FIREBASE_KEY%" (
  echo [ERROR] Missing Firebase key: %FIREBASE_KEY%
  exit /b 1
)

docker info >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Docker daemon is not reachable.
  echo         Start Docker Desktop and make sure Linux containers are running.
  echo         Then retry: scripts\start-local-dev.bat
  exit /b 1
)

set "MODE=%~1"
if "%MODE%"=="" set "MODE=expo"
set "ARG2=%~2"

call "%SET_URL_SCRIPT%" %MODE% %ARG2%
if errorlevel 1 exit /b 1

start "CID Backend (Docker)" cmd /k "cd /d ""%BACKEND_DIR%"" && docker compose -f ""%COMPOSE_FILE%"" up --build"
start "CID Frontend (Expo)" cmd /k "cd /d ""%FRONTEND_DIR%"" && npx expo start -c"

echo [OK] Started backend and frontend in separate windows.
echo      Run scripts\stop-local-backend.bat to stop backend container.
exit /b 0
