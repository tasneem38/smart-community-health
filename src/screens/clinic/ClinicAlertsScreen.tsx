import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Card, Text, ActivityIndicator } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { fetchAlerts } from "../../api/api";
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
      const remote = await fetchAlerts();
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
          } catch (e) { }
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
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Community Alerts</Text>
            <Text style={styles.headerSub}>Real-time health updates</Text>
          </View>
          <MaterialCommunityIcons name="broadcast" size={28} color="#FFD700" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? <ActivityIndicator size="large" color="#001F3F" style={{ marginTop: 20 }} /> : null}

        {!loading && alerts.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="check-circle-outline" size={64} color="#C8E6C9" />
            <Text style={styles.emptyText}>No active alerts. Good job!</Text>
          </View>
        )}

        {alerts.map((a) => (
          <Card key={a.id} style={[styles.card, a.risk === 'High' && styles.highRiskCard]}>
            <Card.Content>
              <View style={styles.row}>
                <View style={[styles.iconBox, { backgroundColor: a.risk === 'High' ? '#FFEBEE' : '#FFF3E0' }]}>
                  <MaterialCommunityIcons
                    name="alert"
                    size={24}
                    color={a.risk === "High" ? "#d9534f" : "#f0ad4e"}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.alertTitle}>{a.type}</Text>
                    {a.risk === 'High' && <View style={styles.badge}><Text style={styles.badgeText}>URGENT</Text></View>}
                  </View>
                  <Text style={styles.desc}>{a.description}</Text>
                  <View style={styles.metaRow}>
                    <MaterialCommunityIcons name="map-marker" size={12} color="#888" />
                    <Text style={styles.time}>
                      {a.village ? `${a.village} • ` : ""}{new Date(a.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F4F8" },
  header: {
    backgroundColor: '#001F3F',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  headerSub: {
    fontSize: 14,
    color: '#B0C4DE',
    marginTop: 2,
  },
  content: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    elevation: 2,
  },
  highRiskCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#d9534f',
  },
  row: { flexDirection: "row", alignItems: "flex-start" },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertTitle: { fontSize: 16, fontWeight: "700", color: '#333' },
  badge: {
    backgroundColor: '#d9534f',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  desc: { color: "#555", marginTop: 4, fontSize: 14, lineHeight: 20 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  time: { fontSize: 12, color: "#888", marginLeft: 4 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#888', marginTop: 16, fontSize: 16 },
});
