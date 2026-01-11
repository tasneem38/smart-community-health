# Smart Health Surveillance — Expo Starter App

A starter Expo + React Native app for ASHA workers, clinic staff, and community volunteers. Offline-first, multilingual, SMS fallback, role-based UI.

## Features
- Login & Register (mocked)
- Role-based Dashboard (ASHA / Clinic / Community)
- Symptom Report form (geo, photo, village, offline queue)
- Water Quality Test form
- Offline queue (SQLite)
- Sync manager (Sync on reconnect)
- SMS fallback using `expo-sms`
- i18n support (English, Hindi, Bodo placeholder)
- Mock API files with easy switch to real backend
- Clean UI with React Native Paper

## Quick setup
1. Install Expo CLI (if not installed)
   ```bash
   npm install -g expo-cli
Clone and install dependencies

npm install


Start Metro

npm run start


Run on Android / iOS via Expo Go or device emulator.

How to run on Android device

Connect device and enable USB debugging or scan the QR from Expo Go app.

npm run android (requires Android Studio) or open with Expo Go.

Testing offline mode

Use the app to create a symptom or water test while connected — it will attempt to post to the mock API.

Turn off network on device (Airplane mode), create a report — it will be added to the offline SQLite queue.

Turn network back on — the sync manager listens to network changes and will upload pending items automatically.

How to plug in real API

Edit src/api/api.ts:

Set useReal = true

Replace REAL_BASE with your backend URL

Replace loginApi, sendSymptomReport, etc. with real fetch calls.

Notes & TODOs

This scaffold uses expo-sqlite for local persistence. For heavy production use, consider WatermelonDB or Realm.

Add background tasks (TaskManager/BackgroundFetch) for periodic sync.

Add proper authentication, token refresh, and secure storage (SecureStore) for production.

Improve image upload to real backend (multipart/form-data).

Files of interest

src/db/db.ts — local DB schema & queue

src/services/syncService.ts — Network listener + sync

src/api/api.ts — mock API + switch to real backend

src/i18n/ — translations

### Notes, design choices & how to extend
- **Offline storage**: `expo-sqlite` chosen for simplicity; queue table stores pending JSON payloads. It’s easy to inspect and debug.
- **Sync**: `syncService.ts` listens to NetInfo network changes and attempts to flush queue. For production add exponential retry, dedup, and conflict resolution.
- **SMS fallback**: `smsFormatter.ts` creates a compact string `SYM|name|age|codes|date|lat,lon|village`. `expo-sms` is used to send SMS when desired.
- **i18n**: react-i18next with JSON resource files. Language switcher in Settings changes immediately.
- **UI**: React Native Paper ensures accessible components and quick theming. Colors chosen are calming blue/green medical tones.
- **Role-based UI**: Auth context stores `role` returned from mocked login. Dashboard renders tiles based on role.
