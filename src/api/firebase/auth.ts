// src/api/firebase/auth.ts
import { auth } from "./config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

export async function registerWithFirebase({ name, email, password, role }) {
  const res = await createUserWithEmailAndPassword(auth, email, password);

  // Save display name
  await updateProfile(res.user, { displayName: name });

  return {
    id: res.user.uid,
    name,
    email,
    role,
    token: await res.user.getIdToken(),
  };
}

export async function loginWithFirebase(email: string, password: string) {
  const res = await signInWithEmailAndPassword(auth, email, password);

  return {
    id: res.user.uid,
    name: res.user.displayName,
    email: res.user.email,
    token: await res.user.getIdToken(),
  };
}
