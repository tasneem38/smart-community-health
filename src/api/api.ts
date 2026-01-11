import { registerWithFirebase, loginWithFirebase } from "./firebase/auth";
import { saveUserRole, getUserRole, saveSymptomReport, saveWaterTest } from "./firebase/database";

export async function registerApi(details: any) {
  try {
    const user = await registerWithFirebase(details);

    await saveUserRole(user.id, details.role, details.village);

    return { ok: true, data: user };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export async function loginApi(email: string, password: string) {
  try {
    const user = await loginWithFirebase(email, password);
    const roleData = await getUserRole(user.id);

    return {
      ok: true,
      data: {
        ...user,
        role: roleData.role,
        village: roleData.village,
      },
    };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}


export async function sendSymptomReport(report: any) {
  try {
    await saveSymptomReport(report);
    return { ok: true };
  } catch (e) {
    return { ok: false };
  }
}

export async function sendWaterTest(report: any) {
  try {
    await saveWaterTest(report);
    return { ok: true };
  } catch (e) {
    return { ok: false };
  }
}

