// src/api/firebase/analytics.ts
import { getFirestore, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { app } from "./config"; // adjust path if needed

const db = getFirestore(app);

/**
 * Fetch symptom reports from Firestore in a given date range (ISO strings).
 * If no range provided, fetch last 90 days by default.
 */
export async function fetchSymptomReports({ sinceISO }: { sinceISO?: string } = {}) {
  try {
    const col = collection(db, "symptomReports");
    // simple fetch - Firestore composite indexes may be needed for complex queries
    const snap = await getDocs(col);
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (!sinceISO) return data;
    return data.filter((r: any) => new Date(r.timestamp) >= new Date(sinceISO));
  } catch (e) {
    console.error("fetchSymptomReports", e);
    return [];
  }
}

/**
 * Fetch water tests from Firestore in a given date range.
 */
export async function fetchWaterTests({ sinceISO }: { sinceISO?: string } = {}) {
  try {
    const col = collection(db, "waterTests");
    const snap = await getDocs(col);
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (!sinceISO) return data;
    return data.filter((r: any) => new Date(r.timestamp) >= new Date(sinceISO));
  } catch (e) {
    console.error("fetchWaterTests", e);
    return [];
  }
}

/* -----------------------
   Aggregation helpers
   ----------------------- */

/**
 * topVillagesByReports: returns array [{ village, count }]
 */
export function aggregateHotspots(reports: any[], topN = 8) {
  const counts: Record<string, number> = {};
  reports.forEach((r: any) => {
    const v = (r.village || r.location?.village || "Unknown").toString();
    counts[v] = (counts[v] || 0) + 1;
  });
  const arr = Object.entries(counts).map(([v, c]) => ({ village: v, count: c }));
  arr.sort((a, b) => b.count - a.count);
  return arr.slice(0, topN);
}

/**
 * timeSeriesAvgTurbidity: for lastDays, bucket avg turbidity per day
 * returns [{ date: 'YYYY-MM-DD', avgTurbidity }]
 */
export function aggregateWaterTrend(waterTests: any[], lastDays = 14) {
  const now = new Date();
  const buckets: Record<string, { sum: number; count: number }> = {};

  for (let i = 0; i < lastDays; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets[key] = { sum: 0, count: 0 };
  }

  waterTests.forEach((w: any) => {
    if (!w.timestamp) return;
    const key = new Date(w.timestamp).toISOString().slice(0, 10);
    if (key in buckets) {
      const turb = Number(w.turbidity ?? w.turbidityValue ?? w.turbidityNTU ?? 0);
      if (!isNaN(turb)) {
        buckets[key].sum += turb;
        buckets[key].count += 1;
      }
    }
  });

  // produce ascending date list (oldest first)
  const out = Object.keys(buckets)
    .sort()
    .map(k => ({
      date: k,
      avgTurbidity: buckets[k].count > 0 ? buckets[k].sum / buckets[k].count : 0,
      samples: buckets[k].count,
    }));

  return out;
}

/**
 * aggregateSymptoms: counts per symptom code or label
 * symptomField expected to be array like ['C','F'] or string names
 */
export function aggregateSymptomPatterns(reports: any[]) {
  const counts: Record<string, number> = {};
  reports.forEach((r: any) => {
    const s = r.symptoms;
    if (!s) return;
    // normalize: if string, try split by comma
    const items = Array.isArray(s) ? s : String(s).split(/[,\s]+/).filter(Boolean);
    items.forEach((it: string) => {
      const key = it.toString();
      counts[key] = (counts[key] || 0) + 1;
    });
  });
  const arr = Object.entries(counts).map(([sym, count]) => ({ symptom: sym, count }));
  arr.sort((a, b) => b.count - a.count);
  return arr;
}
