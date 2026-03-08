Local development scripts for running backend Docker + Expo frontend together (Windows PowerShell scripts).

## Responsibilities

- `set-backend-url.ps1` changes only `frontend-development/cid/src/services/api.js` (`MANUAL_BACKEND_URL`).
- `start-local-dev.ps1` starts backend + frontend and tracks started windows for managed shutdown.
- `stop-local-backend.ps1` stops Docker and closes windows started by `start-local-dev.ps1`.

## 1) Set backend URL

Script: `scripts\set-backend-url.ps1`

Examples:

- Interactive mode:
	- `.\scripts\set-backend-url.ps1`
- Use URL from `.env` (`BACKEND_URL`):
	- `.\scripts\set-backend-url.ps1 env`
- Expo Go with auto LAN IP:
	- `.\scripts\set-backend-url.ps1 expo`
- Expo Go with explicit LAN IP:
	- `.\scripts\set-backend-url.ps1 expo 192.168.1.42`
- Android emulator:
	- `.\scripts\set-backend-url.ps1 android`
- localhost:
	- `.\scripts\set-backend-url.ps1 localhost`
- Custom URL:
	- `.\scripts\set-backend-url.ps1 custom https://example.com`

## 2) Start local full stack

Script: `scripts\start-local-dev.ps1`

Examples:

- Start services:
	- `.\scripts\start-local-dev.ps1`

This launches two new windows:

- Docker compose backend (`docker-compose.local.yml`)
- Expo frontend (`npx expo start -c`)

## 3) Stop backend container and close managed windows

Script: `scripts\stop-local-backend.ps1`

- `.\scripts\stop-local-backend.ps1`

## Typical workflow

1. Set frontend API target once when needed:
	- `.\scripts\set-backend-url.ps1 expo`
2. Start local stack:
	- `.\scripts\start-local-dev.ps1`
3. Stop stack and close managed windows:
	- `.\scripts\stop-local-backend.ps1`

## CI/CD safety

`docker-compose.local.yml` does not affect cloud Dockerfile build pipeline. CI/CD will continue using the configured Docker build command and `backend-development/Dockerfile`.