// src/screens/clinic/ClinicAlertsScreen.tsx
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Card, Text, ActivityIndicator } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { fetchAlertsFromFirebase } from "../../api/firebase/database";
import { addAlert, getAlertsFromDB } from "../../db/db";
import { AlertRecord } from "../../types/Alerts";

export default function ClinicAlertsScreen() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const remote = await fetchAlertsFromFirebase();
      if (remote && remote.length > 0) {
        // cache and then show
        for (const a of remote) {
            try {
              addAlert({
                id: a.id,
                type: a.type,
                description: a.description || a.village || "Health Alert",
                risk: a.risk,
                timestamp: a.timestamp,   // changed from a.timestamp
                read: a.read || 0,
              });
            } catch (e) {}
          }
      }
      const cached = await getAlertsFromDB();
      setAlerts(cached);
    } catch (err) {
      console.warn("Error loading alerts:", err);
      const cached = await getAlertsFromDB();
      setAlerts(cached);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Community Alerts 🚨</Text>

      {loading ? <ActivityIndicator /> : null}

      {alerts.map((a) => (
        <Card key={a.id} style={styles.card}>
          <Card.Content>
            <View style={styles.row}>
              <MaterialCommunityIcons
                name="alert"
                size={30}
                color={a.risk === "High" ? "#d9534f" : "#f0ad4e"}
              />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.alertTitle}>{a.type}</Text>
                <Text style={styles.desc}>{a.description}</Text>
                <Text style={styles.time}>
                  {a.village ? `${a.village} • ` : ""}{new Date(a.timestamp).toLocaleString()}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#F6FAFF" },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 14 },
  card: { paddingVertical: 6, borderRadius: 16, marginBottom: 14 },
  row: { flexDirection: "row", alignItems: "center" },
  alertTitle: { fontSize: 18, fontWeight: "700" },
  desc: { color: "#555", marginTop: 4 },
  time: { marginTop: 4, fontSize: 12, color: "#888" },
});
