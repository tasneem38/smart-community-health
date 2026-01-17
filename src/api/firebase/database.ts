// src/api/firebase/database.ts
// REPLACED WITH POSTGRES IMPLEMENTATION
import {
  saveSymptomReportPostgres,
  saveWaterTestPostgres,
  fetchAlertsFromPostgres,
  getLatestWaterStatusPostgres,
  saveAssistanceRequestPostgres
} from "../postgres/client";

export async function saveUserRole(userId: string, role: string, village?: string) {
  // handled by register endpoint
  console.log("saveUserRole: handled by backend register");
}

export async function getUserRole(userId: string) {
  // handled by login response
  return null;
}

export async function saveSymptomReport(report: any) {
  return saveSymptomReportPostgres(report);
}

export async function saveWaterTest(report: any) {
  return saveWaterTestPostgres(report);
}

export async function fetchAlertsFromFirebase() {
  return fetchAlertsFromPostgres();
}

export async function getLatestWaterStatus(village: string) {
  return getLatestWaterStatusPostgres(village);
}

export async function saveAssistanceRequest(req: any) {
  return saveAssistanceRequestPostgres(req);
}

// Dummy image upload for now
export async function uploadImage(uri: string, path: string) {
  console.log("Image upload skipped (Postgres backend):", path);
  return null;
}
