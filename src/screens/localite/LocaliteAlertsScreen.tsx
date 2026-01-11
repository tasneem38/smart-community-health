import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Text, Card } from "react-native-paper";

import { fetchAlertsFromFirebase } from "../../api/firebase/database";
import { getAlertsFromDB, addAlert } from "../../db/db";
import { AlertRecord } from "../../types/Alerts";

export default function LocaliteAlertsScreen() {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const remote = await fetchAlertsFromFirebase();

      if (remote && remote.length > 0) {
        for (const a of remote) {
          addAlert({
            id: a.id,
            type: a.type,
            description: a.description,
            risk: a.risk,
            timestamp: a.timestamp,
            read: 0,
          });
        }

        const dbAlerts = await getAlertsFromDB();
        setAlerts(dbAlerts);
      } else {
        const dbAlerts = await getAlertsFromDB();
        setAlerts(dbAlerts);
      }
    } catch (err) {
      console.warn("Failed remote alerts, showing cached");
      const dbAlerts = await getAlertsFromDB();
      setAlerts(dbAlerts);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Nearby Alerts</Text>

      {alerts.length === 0 ? (
        <Text style={{ color: "#888", marginTop: 20 }}>No alerts found.</Text>
      ) : (
        alerts.map((a) => (
          <Card style={styles.card} key={a.id}>
            <Card.Content>
              <Text style={styles.alertType}>{a.type}</Text>
              <Text style={styles.info}>Risk: {a.risk}</Text>
              <Text style={styles.info}>{a.description}</Text>
              <Text style={styles.time}>
                {new Date(a.timestamp).toLocaleString()}
              </Text>
            </Card.Content>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#F4FAFF" },
  title: { fontSize: 22, fontWeight: "700", color: "#0A4D68", marginBottom: 12 },
  card: { marginBottom: 12, borderRadius: 16 },
  alertType: { fontSize: 18, fontWeight: "700" },
  info: { color: "#555", marginTop: 4 },
  time: { marginTop: 4, fontSize: 12, color: "#888" },
});
