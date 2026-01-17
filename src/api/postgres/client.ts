// src/api/postgres/client.ts

// REPLACE WITH YOUR PC'S IP ADDRESS IF RUNNING ON PHYSICAL DEVICE OR ANDROID EMULATOR (use 10.0.2.2 for Android Emulator)
const API_URL = "http://172.16.165.224:3000";

async function request(endpoint: string, method: string = "GET", body?: any, token?: string) {
    const headers: any = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Network request failed");
    }

    return response.json();
}

export async function loginWithPostgres(email: string, password: string) {
    return request("/login", "POST", { email, password });
}

export async function registerWithPostgres(details: any) {
    // details contains: name, email, password, role, village
    return request("/register", "POST", details);
}

export async function saveSymptomReportPostgres(report: any) {
    return request("/symptom-reports", "POST", report);
}

export async function saveWaterTestPostgres(report: any) {
    return request("/water-tests", "POST", report);
}

export async function getLatestWaterStatusPostgres(village: string) {
    return request(`/water-status?village=${encodeURIComponent(village)}`, "GET");
}

export async function fetchAlertsFromPostgres() {
    return request("/alerts", "GET");
}

export async function saveAssistanceRequestPostgres(req: any) {
    return request("/assistance-requests", "POST", req);
}

// User role is embedded in login/register response, but if we need a separate call:
export async function getUserRolePostgres(userId: string) {
    // Note: Backend endpoint /users/:id could be implemented if needed.
    // For now, we assume role is cached/returned on login.
    return null;
}
