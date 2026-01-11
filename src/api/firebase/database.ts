// src/api/firebase/database.ts
import { db } from "./config";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp
} from "firebase/firestore";

import { analyzeClusterWithGroq } from "../aiService";
import { createAlert } from "../alerts";

/* ---------------------------------------------------------
   SAVE USER ROLE (after registration)
--------------------------------------------------------- */
export async function saveUserRole(userId: string, role: string, village?: string) {
  await setDoc(doc(db, "roles", userId), { role, village: village || null });
}

/* ---------------------------------------------------------
   GET USER ROLE (after login)
--------------------------------------------------------- */
export async function getUserRole(userId: string) {
  const snap = await getDoc(doc(db, "roles", userId));
  return snap.exists() ? snap.data() : null;
}

/* ---------------------------------------------------------
   SAVE SYMPTOM REPORT — now triggers cluster analysis
   - report should include: id, village, symptoms (array of codes), timestamp (ISO)
--------------------------------------------------------- */
export async function saveSymptomReport(report: any) {
  // 1) save base report
  const docRef = await addDoc(collection(db, "symptomReports"), {
    ...report,
    timestamp: report.timestamp || new Date().toISOString(),
  });

  // 2) fetch recent reports for same village (or same approximate area)
  try {
    const village = report.village || null;
    if (village) {
      // WARNING: Firestore may require a composite index for (where village, orderBy timestamp)
      const q = query(
        collection(db, "symptomReports"),
        where("village", "==", village),
        orderBy("timestamp", "desc"),
        limit(20)
      );

      const snap = await getDocs(q);
      const recent = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      // 3) analyze with Groq AI
      const analysis = await analyzeClusterWithGroq(recent);

      // 4) if analysis says outbreak, create an alert
      if (analysis.outbreak) {
        const description = `AI detected possible cluster in ${village}. ${analysis.reason || ""}`;
        const risk = analysis.risk || "Medium";

        await createAlert({
          type: "Potential Outbreak",
          description,
          risk,
          village,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      // If no village provided, we could still analyze by geo / nearest village in future
      console.log("saveSymptomReport: no village provided; skipping cluster analysis");
    }
  } catch (err) {
    // If analysis fails, do not break the main flow
    console.warn("Cluster analysis failed (non-blocking):", err);
  }

  return { ok: true, id: docRef.id };
}

/* ---------------------------------------------------------
   Other helpers (water tests, alerts fetch etc.)
--------------------------------------------------------- */
export async function saveWaterTest(report: any) {
  await addDoc(collection(db, "waterTests"), {
    ...report,
    timestamp: report.timestamp || new Date().toISOString(),
  });
}

import { AlertRecord } from "../../types/Alerts";

export async function fetchAlertsFromFirebase(): Promise<AlertRecord[]> {
  const snap = await getDocs(collection(db, "alerts"));
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<AlertRecord, "id">),
  }));
}


/* GET LATEST WATER STATUS (for Localite Dashboard) */
export async function getLatestWaterStatus(village: string) {
  try {
    const q = query(
      collection(db, "waterTests"),
      where("village", "==", village),
      orderBy("timestamp", "desc"),
      limit(1)
    );

    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data();
  } catch (e) {
    console.log("Error fetching latest water status: ", e);
    return null;
  }
}

// Save assistance request
export async function saveAssistanceRequest(req: any) {
  await addDoc(collection(db, "assistanceRequests"), {
    ...req,
    timestamp: req.timestamp || new Date().toISOString(),
  });
}
