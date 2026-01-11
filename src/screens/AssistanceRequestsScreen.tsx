import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Card, Text, Button, ActivityIndicator } from "react-native-paper";
import { fetchAssistanceRequests, resolveAssistanceRequest } from "../api/firebase/assistance";

export default function AssistanceRequestsScreen() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);

  const loadRequests = async () => {
    setLoading(true);
    const data = await fetchAssistanceRequests();
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const markResolved = async (id: string) => {
    await resolveAssistanceRequest(id);
    loadRequests(); // refresh after update
  };

  if (loading) {
    return (
      <View style={{ marginTop: 30, alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading assistance requests...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Assistance Requests</Text>

      {requests.length === 0 && (
        <Text style={{ marginTop: 20, textAlign: "center", color: "#777" }}>
          No assistance requests found.
        </Text>
      )}

      {requests.map((req) => (
        <Card key={req.id} style={styles.card}>
          <Card.Content>
            <Text style={styles.message}>{req.message}</Text>

            <Text style={styles.meta}>
              User: {req.userId || "Unknown"}
            </Text>

            <Text style={styles.meta}>
              Time: {new Date(req.timestamp).toLocaleString()}
            </Text>

            <Text style={[styles.status, req.resolved ? styles.resolved : styles.pending]}>
              {req.resolved ? "Resolved" : "Pending"}
            </Text>

            {!req.resolved && (
              <Button
                mode="contained"
                onPress={() => markResolved(req.id)}
                style={styles.button}
              >
                Mark as Resolved
              </Button>
            )}
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F4FAFF",
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 14,
    color: "#0A4D68",
  },
  card: {
    marginBottom: 14,
    borderRadius: 16,
    padding: 4,
  },
  message: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginBottom: 8,
  },
  meta: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  status: {
    marginTop: 10,
    fontWeight: "700",
    fontSize: 14,
  },
  resolved: {
    color: "green",
  },
  pending: {
    color: "red",
  },
  button: {
    marginTop: 10,
  },
});
