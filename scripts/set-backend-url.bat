@echo off
setlocal EnableExtensions

set "REPO_ROOT=%~dp0.."
for %%I in ("%REPO_ROOT%") do set "REPO_ROOT=%%~fI"
set "API_FILE=%REPO_ROOT%\frontend-development\cid\src\services\api.js"
set "ENV_FILE=%REPO_ROOT%\frontend-development\cid\.env"
set "PORT=8080"

if not exist "%API_FILE%" (
  echo [ERROR] api.js not found: "%API_FILE%"
  exit /b 1
)

if not exist "%ENV_FILE%" (
  echo [ERROR] .env not found: "%ENV_FILE%"
  exit /b 1
)

set "MODE=%~1"
set "ARG2=%~2"

if /I "%MODE%"=="" goto :menu
goto :resolve

:menu
echo.
echo Select backend target:
echo   1^) Use BACKEND_URL from .env
echo   2^) Expo Go + local Docker ^(auto LAN IP^)
echo   3^) Android emulator + local Docker ^(10.0.2.2^)
echo   4^) localhost + local Docker
echo   5^) Enter custom URL manually
echo.
set /p CHOICE=Enter choice [1-5]: 

if "%CHOICE%"=="1" set "MODE=env"
if "%CHOICE%"=="2" set "MODE=expo"
if "%CHOICE%"=="3" set "MODE=android"
if "%CHOICE%"=="4" set "MODE=localhost"
if "%CHOICE%"=="5" set "MODE=custom"

if not defined MODE (
  echo [ERROR] Invalid choice.
  exit /b 1
)

:resolve
set "SELECTED_URL="

if /I "%MODE%"=="env" goto :from_env
if /I "%MODE%"=="expo" goto :expo
if /I "%MODE%"=="android" goto :android
if /I "%MODE%"=="localhost" goto :localhost
if /I "%MODE%"=="custom" goto :custom

echo [ERROR] Unknown mode: %MODE%
echo Allowed: env, expo, android, localhost, custom
exit /b 1

:from_env
for /f "usebackq tokens=1,* delims==" %%A in ("%ENV_FILE%") do (
  if /I "%%~A"=="BACKEND_URL" set "SELECTED_URL=%%~B"
)
if not defined SELECTED_URL (
  echo [ERROR] BACKEND_URL not found in .env
  exit /b 1
)
goto :update

:expo
set "HOST_IP=%ARG2%"
if defined HOST_IP goto :expo_done

for /f "tokens=4" %%I in ('route print 0.0.0.0 ^| findstr /R "^[ ]*0\.0\.0\.0[ ]*0\.0\.0\.0"') do (
  if not defined HOST_IP set "HOST_IP=%%I"
)

if defined HOST_IP set "HOST_IP=%HOST_IP: =%"

echo(%HOST_IP%| findstr /R "^[0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*$" >nul
if errorlevel 1 set "HOST_IP="

if not defined HOST_IP (
  echo [ERROR] Could not auto-detect LAN IP. Use: set-backend-url.bat expo ^<LAN_IP^>
  exit /b 1
)

:expo_done
set "SELECTED_URL=http://%HOST_IP%:%PORT%"
goto :update

:android
set "SELECTED_URL=http://10.0.2.2:%PORT%"
goto :update

:localhost
set "SELECTED_URL=http://localhost:%PORT%"
goto :update

:custom
if defined ARG2 (
  set "SELECTED_URL=%ARG2%"
) else (
  set /p SELECTED_URL=Enter full backend URL: 
)
if not defined SELECTED_URL (
  echo [ERROR] URL cannot be empty.
  exit /b 1
)
goto :update

:update
set "URL_OK="
if /I "%SELECTED_URL:~0,7%"=="http://" set "URL_OK=1"
if /I "%SELECTED_URL:~0,8%"=="https://" set "URL_OK=1"
if not defined URL_OK (
  echo [ERROR] Invalid URL generated: %SELECTED_URL%
  exit /b 1
)

set "ESCAPED_URL=%SELECTED_URL:'=''%"

powershell -NoProfile -ExecutionPolicy Bypass -Command "$path = '%API_FILE%'; $url = '%ESCAPED_URL%'; $content = Get-Content -Path $path -Raw; if ($content -notmatch 'const MANUAL_BACKEND_URL = ''[^'']*'';') { Write-Error 'MANUAL_BACKEND_URL marker not found'; exit 1 }; $updated = [regex]::Replace($content, 'const MANUAL_BACKEND_URL = ''[^'']*'';', ('const MANUAL_BACKEND_URL = ''' + $url + ''';'), 1); Set-Content -Path $path -Value $updated -Encoding UTF8"
if errorlevel 1 (
  echo [ERROR] Could not update api.js marker line.
  exit /b 1
)

echo [OK] Updated api.js backend URL to: %SELECTED_URL%
exit /b 0
