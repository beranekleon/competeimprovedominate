$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$backendDir = Join-Path $repoRoot "backend-development"
$composeLocalFile = Join-Path $backendDir "docker-compose.local.yml"
$composeDefaultFile = Join-Path $backendDir "docker-compose.yml"
$composeFile = if (Test-Path -LiteralPath $composeLocalFile) { $composeLocalFile } else { $composeDefaultFile }
$pidFile = Join-Path (Join-Path $PSScriptRoot ".runtime") "local-dev-processes.json"

if (-not (Test-Path -LiteralPath $composeFile)) {
    Write-Host "[ERROR] Missing compose file: $composeFile"
    exit 1
}

Push-Location $backendDir
try {
    & docker compose -f $composeFile down
} finally {
    Pop-Location
}

function Stop-TrackedProcess {
    param(
        [string]$Name,
        [object]$Entry
    )

    if ($null -eq $Entry -or $null -eq $Entry.pid -or $null -eq $Entry.startTimeUtc) {
        Write-Host "[WARN] No valid process entry found for $Name."
        return
    }

    $pidValue = [int]$Entry.pid
    $expectedStartTime = [datetime]::Parse($Entry.startTimeUtc).ToUniversalTime()
    $proc = Get-Process -Id $pidValue -ErrorAction SilentlyContinue

    if ($null -eq $proc) {
        Write-Host "[INFO] $Name window is already closed (pid: $pidValue)."
        return
    }

    $actualStartTime = $proc.StartTime.ToUniversalTime()
    if ($actualStartTime -ne $expectedStartTime) {
        Write-Host "[WARN] PID reuse detected for $Name (pid: $pidValue). Skipping kill for safety."
        return
    }

    # Kill the full process tree so child processes (for example Expo/Node) cannot keep the console alive.
    $null = & taskkill /PID $pidValue /T /F 2>$null

    $stillRunning = Get-Process -Id $pidValue -ErrorAction SilentlyContinue
    if ($null -ne $stillRunning) {
        # Fallback for environments where taskkill cannot terminate the process.
        Stop-Process -Id $pidValue -Force -ErrorAction SilentlyContinue
    }

    $finalCheck = Get-Process -Id $pidValue -ErrorAction SilentlyContinue
    if ($null -eq $finalCheck) {
        Write-Host "[OK] Closed $Name window (pid: $pidValue)."
    } else {
        Write-Host "[WARN] Could not fully close $Name window (pid: $pidValue)."
    }
}

if (Test-Path -LiteralPath $pidFile) {
    try {
        $tracked = Get-Content -LiteralPath $pidFile -Raw | ConvertFrom-Json
        Stop-TrackedProcess -Name "backend" -Entry $tracked.backend
        Stop-TrackedProcess -Name "frontend" -Entry $tracked.frontend
    } catch {
        Write-Host "[WARN] Could not parse $pidFile. Skipping managed window shutdown."
    }

    Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
} else {
    Write-Host "[INFO] No tracked process file found at $pidFile"
    Write-Host "       Nothing to close automatically."
}
