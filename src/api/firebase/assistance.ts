import { db } from "./config";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

/* ---------------------------
   FETCH ALL ASSISTANCE REQUESTS
---------------------------- */
export async function fetchAssistanceRequests() {
  try {
    const snap = await getDocs(collection(db, "assistanceRequests"));
    console.log("SNAP SIZE:", snap.size);

    const data = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    console.log("FETCHED DATA:", data);
    return data;

  } catch (error) {
    console.log("Error fetching assistance requests:", error);
    return [];
  }
}

/* ---------------------------
   MARK REQUEST AS RESOLVED
---------------------------- */
export async function resolveAssistanceRequest(id: string) {
  try {
    const ref = doc(db, "assistanceRequests", id);
    await updateDoc(ref, { resolved: true });
  } catch (error) {
    console.log("Error updating request:", error);
  }
}
