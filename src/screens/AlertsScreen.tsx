import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";

import AlertCard from "../components/AlertCard";
import { useTranslation } from "react-i18next";

// Firebase
import { fetchAlertsFromFirebase } from "../api/firebase/database";

// Local SQLite DB
import { getAlertsFromDB, addAlert } from "../db/db";

export default function AlertsScreen() {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<any[]>([]);

  // Load alerts from Firebase → then save to local DB → show UI
  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      // Step 1: Try fetching from Firebase
      const remote = await fetchAlertsFromFirebase();

      if (remote && remote.length > 0) {
        // Save each alert locally
        remote.forEach((a: any) => {
          addAlert({
            ...a,
            read: a.read ? 1 : 0,
          });
        });

        // Load updated list from SQLite
        const dbAlerts = await getAlertsFromDB();
        setAlerts(dbAlerts);
      } else {
        // No remote alerts → Load cached ones
        const dbAlerts = await getAlertsFromDB();
        setAlerts(dbAlerts);
      }
    } catch (e) {
      console.log("Alert fetch failed, using cached alerts.", e);
      const dbAlerts = await getAlertsFromDB();
      setAlerts(dbAlerts);
    }
  };

  // Mark alert as read (local only)
  const markRead = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, read: 1 } : a))
    );
  };

  return (
    <ScrollView style={{ padding: 12 }}>
      {alerts.length === 0 ? (
        <></>
      ) : (
        alerts.map((alert) => (
          <AlertCard key={alert.id} alert={alert} onMarkRead={markRead} />
        ))
      )}
    </ScrollView>
  );
}
