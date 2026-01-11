const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// --------------------------------------------------
// RULE 1: Generate alert when water test is saved
// --------------------------------------------------
exports.createAlertOnWaterTest = functions.firestore
  .document("waterTests/{testId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();

    const alertsToCreate = [];

    if (data.turbidity > 30) {
      alertsToCreate.push({
        type: "Water Contamination",
        description: `High turbidity detected (${data.turbidity} NTU)`,
        risk: "High",
        timestamp: new Date().toISOString(),
        read: false,
      });
    }

    if (data.ph < 6.5 || data.ph > 8.5) {
      alertsToCreate.push({
        type: "Unsafe pH",
        description: `pH out of safe range: ${data.ph}`,
        risk: "Medium",
        timestamp: new Date().toISOString(),
        read: false,
      });
    }

    for (const alert of alertsToCreate) {
      await db.collection("alerts").add(alert);
    }

    return true;
  });

// --------------------------------------------------
// RULE 2: Generate alert when symptom report submitted
// --------------------------------------------------
exports.createAlertOnSymptoms = functions.firestore
  .document("symptomReports/{reportId}")
  .onCreate(async (snap) => {
    const data = snap.data();

    const symptoms = data.symptoms || [];

    // Example cholera/dengue rule
    if (symptoms.includes("diarrhea") && symptoms.includes("vomiting")) {
      await db.collection("alerts").add({
        type: "Possible Cholera Outbreak",
        description: "Multiple GI symptoms detected in recent reports.",
        risk: "High",
        timestamp: new Date().toISOString(),
        read: false,
      });
    }

    if (symptoms.includes("fever") && symptoms.includes("rash")) {
      await db.collection("alerts").add({
        type: "Possible Dengue Cluster",
        description: "Fever + rash combination reported.",
        risk: "Medium",
        timestamp: new Date().toISOString(),
        read: false,
      });
    }

    return true;
  });
