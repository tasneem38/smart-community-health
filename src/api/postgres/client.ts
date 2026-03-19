import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { getToken } from '../auth';

// Hardcoded server configuration (environment variables not working in Expo 48)
const SERVER_IP = "10.120.81.171"; // Updated to current machine IP
const PORT = "3000";

// Use hardcoded IP for mobile, localhost for web
const IS_ANDROID_EMULATOR = false; // Set to true if using Android Emulator
const ACTUAL_SERVER_IP = "10.120.81.171";
const EMULATOR_IP = "10.0.2.2";

export const API_URL = __DEV__
    ? (Platform.OS === 'web' ? 'http://localhost:3000' : 'http://10.120.81.171:3000')
    : 'https://sanjeevaniai-api.onrender.com'; // YOUR RENDER URL

async function request(endpoint: string, method: string = "GET", body?: any, isFormData: boolean = false) {
    const headers: any = {};
    const token = await getToken();

    if (!isFormData) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const url = `${API_URL}${endpoint}`;
    console.log(`[API Request] ${method} ${url}`);

    try {
        const response = await fetch(url, {
            method,
            headers,
            body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || "Network request failed");
        }

        const data = await response.json();
        return data;
    } catch (error: any) {
        console.error(`[API Error] ${method} ${url}:`, error.message);
        if (error.message === 'Network request failed') {
            throw new Error(`Connection to ${url} failed. Ensure your phone is on the same Wi-Fi and the IP ${ACTUAL_SERVER_IP} is correct.`);
        }
        throw error;
    }
}

export async function loginWithPostgres(email: string, password: string) {
    return request("/login", "POST", { email, password });
}

export async function registerWithPostgres(details: any) {
    // details contains: name, email, password, role, village
    return request("/register", "POST", details);
}

export async function saveSymptomReportPostgres(report: any) {
    return request("/symptom-reports", "POST", { ...report, consentGiven: true });
}

export async function saveWaterTestPostgres(report: any) {
    return request("/water-tests", "POST", { ...report, consentGiven: true });
}

export async function getLatestWaterStatusPostgres(village: string) {
    return request(`/water-status?village=${encodeURIComponent(village)}`, "GET");
}

export async function fetchWaterTestsPostgres(village: string) {
    return request(`/water-tests/village?village=${encodeURIComponent(village)}`, "GET");
}

export async function fetchAlertsFromPostgres() {
    return request("/alerts", "GET");
}

export async function saveAssistanceRequestPostgres(req: any) {
    return request("/assistance-requests", "POST", { ...req, consentGiven: true });
}

export async function fetchAssistanceRequestsPostgres() {
    return request("/assistance-requests", "GET");
}

export async function resolveAssistanceRequestPostgres(id: string) {
    return request(`/assistance-requests/${id}/resolve`, "PATCH");
}

export async function saveAiRecordPostgres(record: any) {
    // record: { type, content, metadata }
    return request("/ai-records", "POST", record);
}

export async function fetchAnalyticsPostgres() {
    return request("/analytics", "GET");
}

export async function fetchDetailedAnalyticsPostgres() {
    return request("/analytics/detailed", "GET");
}

export async function assignFollowupPostgres(task: any) {
    return request("/followups", "POST", task);
}

export async function chatWithSarvamPostgres(messages: any[]) {
    return request("/api/sarvam/chat", "POST", { messages });
}

export async function clearSarvamHistoryPostgres(userId: number) {
    return request(`/api/sarvam/history/${userId}`, "DELETE");
}

export async function transcribeAudioPostgres(uri: string) {
    console.log("[STT Frontend] Transcribing URI:", uri);
    const formData = new FormData();

    if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append('audio', blob, 'audio-input.m4a');
    } else {
        // Construct the file object correctly for React Native fetch
        const file = {
            uri,
            name: 'audio-input.m4a',
            type: 'audio/m4a'
        };
        formData.append('audio', file as any);
    }

    const result = await request("/api/sarvam/stt", "POST", formData, true);

    // [ON-DEVICE PRIVACY] Delete the temporary file after upload
    try {
        await FileSystem.deleteAsync(uri, { idempotent: true });
        console.log("[STT Frontend] Deleted temporary audio file:", uri);
    } catch (e) {
        console.warn("[STT Frontend] Failed to delete temporary audio file:", e);
    }

    return result;
}

export async function fetchSarvamHistoryPostgres(userId: number) {
    return request(`/api/sarvam/history?user_id=${userId}`, "GET");
}

export async function saveSarvamMessagePostgres(userId: number, role: string, content: string) {
    console.log(`[CLIENT SAVE] userId=${userId}, role=${role}, contentLen=${content?.length}`);
    return request("/api/sarvam/save", "POST", { user_id: userId, role, content });
}

export async function textToSpeechPostgres(text: string, languageCode: string = 'hi-IN', isCallAgent: boolean = false) {
    return request("/api/sarvam/tts", "POST", { text, languageCode, isCallAgent });
}

// User role is embedded in login/register response, but if we need a separate call:
export async function getUserRolePostgres(userId: string) {
    // Note: Backend endpoint /users/:id could be implemented if needed.
    // For now, we assume role is cached/returned on login.
    return null;
}
