@echo off
setlocal EnableExtensions

set "REPO_ROOT=%~dp0.."
for %%I in ("%REPO_ROOT%") do set "REPO_ROOT=%%~fI"
set "BACKEND_DIR=%REPO_ROOT%\backend-development"
set "COMPOSE_FILE=%BACKEND_DIR%\docker-compose.local.yml"

if not exist "%COMPOSE_FILE%" (
  echo [ERROR] Missing compose file: %COMPOSE_FILE%
  exit /b 1
)

cd /d "%BACKEND_DIR%"
docker compose -f "%COMPOSE_FILE%" down
