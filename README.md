# Smart Health Surveillance App

A comprehensive offline-first React Native application designed for rural health surveillance in India (Assam/North East focus). It connects ASHA workers, Localities (villagers), and Clinic staff to a central health monitoring system.

## 🌟 Key Features

### 👩‍⚕️ For ASHA Workers
- **Symptom Reporting**: Report detailed symptoms for villagers with geo-tagging and offline support.
- **Water Quality Testing**: Submit water test reports (turbidity, pH) with photo evidence.
- **AI-Powered Assistance**: Symptom Checker integrated with Groq AI for preliminary assessment.
- **Alerts & Assistance**: Receive high-risk alerts and manage village assistance requests.
- **Offline Queue**: Works seamlessly without internet; syncs data when online.

### 🏡 For Localities (Villagers)
- **Report Symptoms**: Simplified interface for villagers to report their own symptoms.
- **Water Status**: View real-time safety status of village water sources.
- **Community Precautions**: Receive AI-generated health precautions (e.g., "Boil water alert").
- **Request Help**: One-tap assistance request to local ASHA workers.

### 🏥 For Clinic Staff
- **Dashboard**: Monitor incoming reports and alerts.
- **Patient Management**: Assign follow-ups and review pending cases.

### 🛡️ Data Privacy & Security (DPDP Ready)
- **Consent Management**: Explicit consent required for all sensitive health data collection.
- **JWT Auth**: Secure, signed sessions with data minimization to protect user identity.
- **Audit Logs**: Verifiable logs of data access and modifications for accountability.
- **Automatic Deletion**: Secure purging of temporary on-device media after sync.
- **Erasure Flow**: Built-in support for "Right to be Forgotten" data deletion requests.

## 🎨 UI & Design
- **Premium Aesthetic**: "Midnight Blue & Gold" theme for a professional, trustworthy look.
- **Localized**: Full translation support (English default).
- **Interactive**: Smooth animations and clear visual indicators for safe/unsafe conditions.

## 🛠 Tech Stack
- **Frontend**: React Native (Expo), React Native Paper, Victory Native (Charts).
- **Backend**: Node.js (Express), PostgreSQL (Data), Firebase (Images/Storage).
- **AI**: Groq AI SDK for generating health insights and precautions.
- **Offline**: `expo-sqlite` and `NetInfo` for robust offline styling.

## 📂 Project Structure
```
src/
  screens/
    asha/       # ASHA-specific screens (Alerts, Reports, etc.)
    localite/   # Villager-facing screens
    clinic/     # Clinic staff dashboard & tools
  components/   # Reusable UI components
  api/          # API clients (Postgres, Firebase, AI)
  db/           # Local SQLite database & Sync logic
  navigation/   # Stack & Tab navigators
```

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Backend**
   - Ensure PostgreSQL is running.
   - Navigate to `server/` and run:
     ```bash
     npm start
     ```

3. **Start Mobile App**
   ```bash
   npx expo start -c
   ```

4. **Environment Variables**
   - update `src/api/postgres/client.ts` with your local IP address.

## 🔄 Offline & Sync
The app automatically detects network changes. Reports created offline are stored locally and pushed to the server automatically when connectivity is restored.

---
*Built for the Smart Community Health Initiative.*
