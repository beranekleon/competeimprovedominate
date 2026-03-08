param(
    [string]$Mode,
    [string]$Arg2,
    [int]$Port = 8080
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$apiFile = Join-Path $repoRoot "frontend-development\cid\src\services\api.js"
$envFile = Join-Path $repoRoot "frontend-development\cid\.env"

function Get-ModeFromMenu {
    Write-Host ""
    Write-Host "Select backend target:"
    Write-Host "  1) Use BACKEND_URL from .env"
    Write-Host "  2) Expo Go + local Docker (auto LAN IP)"
    Write-Host "  3) Android emulator + local Docker (10.0.2.2)"
    Write-Host "  4) localhost + local Docker"
    Write-Host "  5) Enter custom URL manually"
    Write-Host ""

    $choice = Read-Host "Enter choice [1-5]"

    switch ($choice) {
        "1" { return "env" }
        "2" { return "expo" }
        "3" { return "android" }
        "4" { return "localhost" }
        "5" { return "custom" }
        default { throw "Invalid choice." }
    }
}

function Get-BackendUrlFromEnv {
    if (-not (Test-Path -LiteralPath $envFile)) {
        throw ".env not found: $envFile"
    }

    foreach ($line in Get-Content -LiteralPath $envFile) {
        if ($line -match '^\s*BACKEND_URL\s*=\s*(.+?)\s*$') {
            $candidate = $matches[1].Trim().Trim('"').Trim("'")
            if (-not [string]::IsNullOrWhiteSpace($candidate)) {
                return $candidate
            }
        }
    }

    throw "BACKEND_URL not found in .env"
}

function Get-LanIpFromRoute {
    $lines = route print 0.0.0.0 2>$null
    foreach ($line in $lines) {
        if ($line -match '^\s*0\.0\.0\.0\s+0\.0\.0\.0\s+\d{1,3}(?:\.\d{1,3}){3}\s+(\d{1,3}(?:\.\d{1,3}){3})\s+\d+\s*$') {
            return $matches[1]
        }
    }

    return $null
}

function Resolve-BackendUrl {
    param(
        [string]$ResolvedMode,
        [string]$SecondaryArg
    )

    switch ($ResolvedMode) {
        "env" {
            return Get-BackendUrlFromEnv
        }
        "expo" {
            $hostIp = $SecondaryArg
            if ([string]::IsNullOrWhiteSpace($hostIp)) {
                $hostIp = Get-LanIpFromRoute
            }

            if ([string]::IsNullOrWhiteSpace($hostIp)) {
                throw "Could not auto-detect LAN IP. Use: .\\scripts\\set-backend-url.ps1 expo <LAN_IP>"
            }

            return "http://$hostIp`:$Port"
        }
        "android" {
            return "http://10.0.2.2`:$Port"
        }
        "localhost" {
            return "http://localhost`:$Port"
        }
        "custom" {
            $customUrl = $SecondaryArg
            if ([string]::IsNullOrWhiteSpace($customUrl)) {
                $customUrl = Read-Host "Enter full backend URL"
            }

            if ([string]::IsNullOrWhiteSpace($customUrl)) {
                throw "URL cannot be empty."
            }

            return $customUrl
        }
        default {
            throw "Unknown mode: $ResolvedMode. Allowed: env, expo, android, localhost, custom"
        }
    }
}

function Update-ManualBackendUrl {
    param([string]$Url)

    if ($Url -notmatch '^https?://') {
        throw "Invalid URL generated: $Url"
    }

    $content = Get-Content -LiteralPath $apiFile -Raw
    if ($content -notmatch "const MANUAL_BACKEND_URL = '[^']*';") {
        throw "MANUAL_BACKEND_URL marker not found in $apiFile"
    }

    $updated = [regex]::Replace($content, "const MANUAL_BACKEND_URL = '[^']*';", "const MANUAL_BACKEND_URL = '$Url';", 1)
    Set-Content -LiteralPath $apiFile -Value $updated -Encoding UTF8
}

try {
    if (-not (Test-Path -LiteralPath $apiFile)) {
        throw "api.js not found: $apiFile"
    }

    $resolvedMode = if ([string]::IsNullOrWhiteSpace($Mode)) { Get-ModeFromMenu } else { $Mode.ToLowerInvariant() }
    $selectedUrl = Resolve-BackendUrl -ResolvedMode $resolvedMode -SecondaryArg $Arg2
    Update-ManualBackendUrl -Url $selectedUrl

    Write-Host "[OK] Updated api.js backend URL to: $selectedUrl"
    exit 0
} catch {
    Write-Host "[ERROR] $($_.Exception.Message)"
    exit 1
}
