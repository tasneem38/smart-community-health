// src/api/api.ts
import {
  loginWithPostgres,
  registerWithPostgres,
  saveSymptomReportPostgres,
  saveWaterTestPostgres,
  saveAssistanceRequestPostgres
} from "./postgres/client";

export async function registerApi(details: any) {
  try {
    const response = await registerWithPostgres(details);
    // response -> { user, token }
    return { ok: true, data: response.user };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function loginApi(email: string, password: string) {
  try {
    const response = await loginWithPostgres(email, password);
    // response -> { user, token }
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
    await saveAssistanceRequestPostgres(req);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false };
  }
}


