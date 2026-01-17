// src/api/firebase/auth.ts
// REPLACED WITH POSTGRES IMPLEMENTATION
import { registerWithPostgres, loginWithPostgres } from "../postgres/client";

export async function registerWithFirebase(details: any) {
  const res = await registerWithPostgres(details);
  // map to old shape
  return {
    id: res.user.id,
    name: res.user.name,
    email: res.user.email,
    role: res.user.role,
    village: res.user.village,
    token: res.token,
  };
}

export async function loginWithFirebase(email: string, password: string) {
  const res = await loginWithPostgres(email, password);
  return {
    id: res.user.id,
    name: res.user.name,
    email: res.user.email,
    token: res.token,
  };
}
