// src/api/api.ts
import {
  loginWithPostgres,
  registerWithPostgres,
  saveSymptomReportPostgres,
  saveWaterTestPostgres,
  saveAssistanceRequestPostgres,
  getLatestWaterStatusPostgres,
  fetchAlertsFromPostgres,
  fetchAssistanceRequestsPostgres,
  resolveAssistanceRequestPostgres,
  saveAiRecordPostgres,
  fetchAnalyticsPostgres,
  fetchDetailedAnalyticsPostgres,
  assignFollowupPostgres,
  chatWithSarvamPostgres,
  transcribeAudioPostgres,
  fetchSarvamHistoryPostgres,
  saveSarvamMessagePostgres,
  textToSpeechPostgres
} from "./postgres/client";
import { saveToken } from "./auth";

export async function sarvamChatApi(messages: any[]) {
  try {
    const response = await chatWithSarvamPostgres(messages);
    return { ok: true, data: response.content };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function transcribeAudioApi(uri: string) {
  try {
    const response = await transcribeAudioPostgres(uri);
    return { ok: true, data: response.transcript };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function fetchSarvamHistoryApi(userId: number) {
  try {
    const response = await fetchSarvamHistoryPostgres(userId);
    return { ok: true, data: response };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function saveSarvamMessageApi(userId: number, role: string, content: string) {
  try {
    const response = await saveSarvamMessagePostgres(userId, role, content);
    return { ok: true, data: response };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function textToSpeechApi(text: string, languageCode: string = 'hi-IN', isCallAgent: boolean = false) {
  try {
    const response = await textToSpeechPostgres(text, languageCode, isCallAgent);
    return { ok: true, data: response.audioBase64 };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function registerApi(details: any) {
  try {
    const response = await registerWithPostgres(details);
    if (response.token) {
      await saveToken(response.token);
    }
    return { ok: true, data: response.user };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function loginApi(email: string, password: string) {
  try {
    const response = await loginWithPostgres(email, password);
    if (response.token) {
      await saveToken(response.token);
    }
    return {
      ok: true,
      data: {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
        village: response.user.village,
        token: response.token
      },
    };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}


export async function sendSymptomReport(report: any) {
  try {
    await saveSymptomReportPostgres(report);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false };
  }
}

export async function sendWaterTest(report: any) {
  try {
    await saveWaterTestPostgres(report);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false };
  }
}

export async function sendAssistanceRequest(req: any) {
  try {
    const res: any = await saveAssistanceRequestPostgres(req);
    return { ok: true, solutions: res.solutions || [] };
  } catch (e) {
    console.error(e);
    return { ok: false };
  }
}

export async function getLatestWaterStatus(village: string) {
  return getLatestWaterStatusPostgres(village);
}

export async function fetchAlerts() {
  return fetchAlertsFromPostgres(); // Ensure this returns array directly
}

export async function fetchAssistanceRequests() {
  return fetchAssistanceRequestsPostgres();
}

export async function resolveAssistanceRequest(id: string) {
  return resolveAssistanceRequestPostgres(id);
}

export async function saveAiRecord(record: any) {
  return saveAiRecordPostgres(record);
}

export async function fetchAnalytics() {
  return fetchAnalyticsPostgres();
}

export async function fetchDetailedAnalytics() {
  return fetchDetailedAnalyticsPostgres();
}

export async function assignFollowup(task: any) {
  return assignFollowupPostgres(task);
}
