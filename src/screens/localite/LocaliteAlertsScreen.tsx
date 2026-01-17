import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text, Card } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Community Alerts</Text>
          <Text style={styles.headerSub}>Stay informed, stay safe</Text>
        </View>
        <MaterialCommunityIcons name="bell-ring" size={28} color="#FFD700" />
      </View>

      {alerts.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="check-circle-outline" size={60} color="#B0C4DE" />
          <Text style={{ color: "#888", marginTop: 10 }}>No active alerts in your village.</Text>
        </View>
      ) : (
        alerts.map((a) => {
          const isPrecaution = a.type === "Community Precaution";

          return (
            <Card
              style={[styles.card, isPrecaution ? styles.precautionCard : styles.riskCard]}
              key={a.id}
            >
              <Card.Content>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {isPrecaution ? (
                      <MaterialCommunityIcons name="shield-check" size={24} color="#155724" style={{ marginRight: 8 }} />
                    ) : (
                      <MaterialCommunityIcons name="alert-octagon" size={24} color="#721c24" style={{ marginRight: 8 }} />
                    )}
                    <Text style={[styles.alertType, isPrecaution ? { color: "#155724" } : { color: "#721c24" }]}>
                      {isPrecaution ? "Health Advisory" : a.type}
                    </Text>
                  </View>
                  {!isPrecaution && (
                    <View style={[styles.badge, { backgroundColor: a.risk === 'High' ? '#dc3545' : '#ffc107' }]}>
                      <Text style={{ fontSize: 10, color: a.risk === 'High' ? '#fff' : '#000', fontWeight: 'bold' }}>
                        {a.risk.toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.info, isPrecaution && styles.precautionText]}>
                  {a.description}
                </Text>

                <View style={styles.footerRow}>
                  <MaterialCommunityIcons name="clock-outline" size={12} color="#888" style={{ marginRight: 4 }} />
                  <Text style={styles.time}>
                    {new Date(a.timestamp).toLocaleString()}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F8FB"
  },

  /* HEADER */
  header: {
    backgroundColor: '#001F3F',
    paddingVertical: 24,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  headerSub: {
    fontSize: 14,
    color: '#B0C4DE',
    marginTop: 2,
  },

  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    opacity: 0.7,
  },

  /* CARDS */
  card: {
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 3,
  },
  riskCard: {
    borderLeftWidth: 5,
    borderLeftColor: '#dc3545', // Red for risk
  },
  precautionCard: {
    backgroundColor: '#d4edda', // Soft Green
    borderLeftWidth: 5,
    borderLeftColor: '#28a745',
  },

  alertType: {
    fontSize: 17,
    fontWeight: "700",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },

  info: {
    color: "#444",
    fontSize: 15,
    marginTop: 4,
    lineHeight: 22,
  },
  precautionText: {
    color: '#155724',
    fontStyle: 'italic',
  },

  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    justifyContent: 'flex-end',
  },
  time: {
    fontSize: 12,
    color: "#888",
  },
});
