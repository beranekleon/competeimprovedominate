Local development scripts for running backend Docker + Expo frontend together (Windows batch scripts).

## 1) Prepare backend local files

1. Copy `backend-development/.env.local.example` to `backend-development/.env.local`.
2. Fill Twilio values in `.env.local` if you test OTP endpoints.
3. Put Firebase service account at:
	 - `backend-development/secrets/firebase-service-account.json`

## 2) Switch backend URL in `api.js`

Script: `scripts\set-backend-url.bat`

Interactive mode:

- `scripts\set-backend-url.bat`

Direct modes:

- Use URL from `.env` (`BACKEND_URL`):
	- `scripts\set-backend-url.bat env`
- Expo Go with local Docker backend (auto-detect LAN IP):
	- `scripts\set-backend-url.bat expo`
- Expo Go with explicit LAN IP:
	- `scripts\set-backend-url.bat expo 192.168.1.42`
- Android emulator local backend:
	- `scripts\set-backend-url.bat android`
- localhost local backend:
	- `scripts\set-backend-url.bat localhost`
- Custom URL:
	- `scripts\set-backend-url.bat custom https://example.com`

Note: This script updates only `frontend-development/cid/src/services/api.js` and never edits `.env`.

## 3) Start local full stack

Script: `scripts\start-local-dev.bat`

Examples:

- Default (Expo Go + auto LAN IP):
	- `scripts\start-local-dev.bat`
- Android emulator target:
	- `scripts\start-local-dev.bat android`

This launches two new windows:

- Docker compose backend (`docker-compose.local.yml`)
- Expo frontend (`npx expo start -c`)

## 4) Stop backend container

Script: `scripts\stop-local-backend.bat`

- `scripts\stop-local-backend.bat`

## CI/CD safety

`docker-compose.local.yml` does not affect your cloud Dockerfile build pipeline. CI/CD will continue using the configured Docker build command and `backend-development/Dockerfile`.