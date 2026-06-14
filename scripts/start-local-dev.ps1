$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$backendDir = Join-Path $repoRoot "backend-development"
$frontendDir = Join-Path $repoRoot "frontend-development\cid"
$composeLocalFile = Join-Path $backendDir "docker-compose.local.yml"
$composeDefaultFile = Join-Path $backendDir "docker-compose.yml"
$composeFile = if (Test-Path -LiteralPath $composeLocalFile) { $composeLocalFile } else { $composeDefaultFile }
$envLocal = Join-Path $backendDir ".env.local"
$firebaseKey = Join-Path $backendDir "secrets\firebase-service-account.json"
$runtimeDir = Join-Path $PSScriptRoot ".runtime"
$pidFile = Join-Path $runtimeDir "local-dev-processes.json"

if (-not (Test-Path -LiteralPath $composeFile)) {
    Write-Host "[ERROR] Missing compose file: $composeFile"
    exit 1
}
if (-not (Test-Path -LiteralPath $envLocal)) {
    Write-Host "[ERROR] Missing $envLocal"
    Write-Host "        Create env.local and fill values."
    exit 1
}
if (-not (Test-Path -LiteralPath $firebaseKey)) {
    Write-Host "[ERROR] Missing Firebase key: $firebaseKey"
    exit 1
}

$null = & docker info 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Docker daemon is not reachable."
    Write-Host "        Start Docker Desktop and make sure Linux containers are running."
    Write-Host "        Then retry: .\scripts\start-local-dev.ps1"
    exit 1
}

$forceFreshBuild = Read-Host "Möchtest du einen sauberen Build erzwingen? (j/N)"

if (-not (Test-Path -LiteralPath $runtimeDir)) {
    New-Item -ItemType Directory -Path $runtimeDir | Out-Null
}

$backendCmd = if ($forceFreshBuild -eq 'j' -or $forceFreshBuild -eq 'y') {
    "cd /d `"$backendDir`" && docker compose -f `"$composeFile`" build --no-cache && docker compose -f `"$composeFile`" up"
} else {
    "cd /d `"$backendDir`" && docker compose -f `"$composeFile`" up --build"
}

$frontendCmd = "cd /d `"$frontendDir`" && npx expo start -c"

$backendProc = Start-Process -FilePath "cmd.exe" -ArgumentList "/k", $backendCmd -WorkingDirectory $backendDir -PassThru
$frontendProc = Start-Process -FilePath "cmd.exe" -ArgumentList "/k", $frontendCmd -WorkingDirectory $frontendDir -PassThru

$tracked = [ordered]@{
    backend = [ordered]@{
        pid = $backendProc.Id
        startTimeUtc = $backendProc.StartTime.ToUniversalTime().ToString("o")
    }
    frontend = [ordered]@{
        pid = $frontendProc.Id
        startTimeUtc = $frontendProc.StartTime.ToUniversalTime().ToString("o")
    }
}

$tracked | ConvertTo-Json | Set-Content -LiteralPath $pidFile -Encoding ASCII

Write-Host "[OK] Started backend and frontend in separate windows."
Write-Host "     Tracked process file: $pidFile"
Write-Host "     Run .\scripts\stop-local-backend.ps1 to stop backend and close both windows."
