import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, StatusBar } from "react-native";
import { Card, Text, Button, ActivityIndicator, IconButton } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getPendingQueue, clearQueue } from "../../db/db";

export default function ClinicOfflineQueueScreen({ navigation }: any) {
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
    <View style={styles.container}>
      <StatusBar backgroundColor="#001F3F" barStyle="light-content" />
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <IconButton
            icon="arrow-left"
            iconColor="#fff"
            size={24}
            onPress={() => navigation.goBack()}
            style={{ marginLeft: -10, marginRight: 4 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Offline Queue</Text>
            <Text style={styles.headerSub}>Pending updates to sync</Text>
          </View>
          <MaterialCommunityIcons name="cloud-sync" size={28} color="#FFD700" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading && <ActivityIndicator size="large" color="#001F3F" style={{ marginTop: 20 }} />}

        {!loading && queue.length === 0 && (
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons name="cloud-check" size={64} color="#C8E6C9" />
            <Text style={styles.emptyText}>All synced! You are up to date.</Text>
          </View>
        )}

        {queue.map((item) => (
          <Card style={styles.card} key={item.id}>
            <Card.Content>
              <View style={styles.row}>
                <View style={styles.iconBox}>
                  <MaterialCommunityIcons
                    name="cloud-off-outline"
                    size={24}
                    color="#FF9800"
                  />
                </View>
                <View style={{ marginLeft: 14, flex: 1 }}>
                  <Text style={styles.typeLabel}>{item.type}</Text>
                  <Text style={styles.small}>Created: {new Date(item.created_at).toLocaleString()}</Text>
                  <View style={styles.statusRow}>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.idText}>#{item.id}</Text>
                  </View>
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}

        {queue.length > 0 && (
          <Button
            mode="contained"
            style={styles.clearBtn}
            icon="delete-sweep"
            onPress={async () => {
              await clearQueue();
              loadQueue();
            }}
          >
            Clear Offline Queue
          </Button>
        )}
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
  content: { padding: 16 },
  card: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  row: { flexDirection: "row", alignItems: "flex-start" },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
  },
  typeLabel: { fontSize: 16, fontWeight: "700", color: '#333' },
  small: { fontSize: 12, color: "#888", marginTop: 2 },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statusBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    color: '#2b2bd9',
    fontSize: 10,
    fontWeight: '700',
  },
  idText: { fontSize: 10, color: '#ccc' },
  clearBtn: {
    backgroundColor: "#D32F2F",
    marginTop: 20,
    borderRadius: 12,
  },
  emptyBox: {
    marginTop: 60,
    alignItems: "center",
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#888",
  },
});
