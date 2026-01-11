// src/api/alerts.ts
import { db } from "./firebase/config";
import { collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";

/**
 * createAlert
 * - Adds an alert document into Firestore 'alerts'
 */
export async function createAlert(alert: {
  title?: string;
  type: string;
  description: string;
  risk: string; // High/Medium/Low
  village?: string;
  timestamp?: string;
}) {
  try {
    const doc = await addDoc(collection(db, "alerts"), {
      title: alert.title || alert.type,
      type: alert.type,
      description: alert.description,
      risk: alert.risk,
      village: alert.village || null,
      timestamp: alert.timestamp || new Date().toISOString(),
    });
    return { ok: true, id: doc.id };
  } catch (err) {
    console.error("createAlert error:", err);
    return { ok: false, error: err };
  }
}

/**
 * fetchRecentAlerts
 * - basic helper to fetch latest alerts
 */
export async function fetchRecentAlerts(limitCount = 50) {
  try {
    const q = query(collection(db, "alerts"), orderBy("timestamp", "desc"), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn("fetchRecentAlerts error:", err);
    return [];
  }
}
