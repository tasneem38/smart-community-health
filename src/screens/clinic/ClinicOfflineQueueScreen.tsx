import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Card, Text, Button, ActivityIndicator } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getPendingQueue, clearQueue } from "../../db/db";

export default function ClinicOfflineQueueScreen() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    setLoading(true);
    const items = await getPendingQueue();
    setQueue(items);
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Offline Queue 📴</Text>

      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

      {!loading && queue.length === 0 && (
        <View style={styles.emptyBox}>
          <MaterialCommunityIcons name="cloud-check" size={50} color="#0A4D68" />
          <Text style={styles.emptyText}>No pending offline items 🎉</Text>
        </View>
      )}

      {queue.map((item) => (
        <Card style={styles.card} key={item.id}>
          <Card.Content>
            <View style={styles.row}>
              <MaterialCommunityIcons
                name="cloud-off-outline"
                size={34}
                color="#D9534F"
              />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.typeLabel}>{item.type}</Text>
                <Text style={styles.small}>ID: {item.id}</Text>
                <Text style={styles.small}>
                  Created: {new Date(item.created_at).toLocaleString()}
                </Text>
                <Text style={styles.status}>
                  Status: {item.status.toUpperCase()}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      ))}

      {queue.length > 0 && (
        <Button
          mode="contained"
          style={styles.clearBtn}
          onPress={async () => {
            await clearQueue();
            loadQueue();
          }}
        >
          Clear Offline Queue
        </Button>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, backgroundColor: "#F6FAFF" },
  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 12,
    color: "#0A4D68",
  },
  card: {
    marginBottom: 14,
    borderRadius: 18,
    paddingVertical: 6,
  },
  row: { flexDirection: "row", alignItems: "center" },
  typeLabel: { fontSize: 18, fontWeight: "700", marginBottom: 2 },
  small: { fontSize: 13, color: "#555" },
  status: {
    marginTop: 4,
    fontWeight: "600",
    color: "#D9534F",
  },
  clearBtn: {
    backgroundColor: "#D9534F",
    marginTop: 20,
    paddingVertical: 6,
    borderRadius: 10,
  },

  emptyBox: {
    marginTop: 40,
    alignItems: "center",
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#0A4D68",
  },
});
