import { db } from "./config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Save Symptom Checker result
export async function saveSymptomAIResult(input: string, output: string, userId: string) {
  await addDoc(collection(db, "ai_symptom_checker"), {
    userId,
    input,
    output,
    createdAt: serverTimestamp(),
  });
}

// Save Summary Generator result
export async function saveSummaryAIResult(input: string, output: string, userId: string) {
  await addDoc(collection(db, "ai_summary_generator"), {
    userId,
    input,
    output,
    createdAt: serverTimestamp(),
  });
}
