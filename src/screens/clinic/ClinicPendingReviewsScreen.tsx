import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Card, Text, Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ClinicPendingReviewsScreen() {
  const [reports] = useState([
    { id: "p1", name: "Ramu", symptom: "Fever + Diarrhea", severity: "High" },
    { id: "p2", name: "Lakshmi", symptom: "Fatigue", severity: "Low" },
  ]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Pending Reviews 📝</Text>

      {reports.map((r) => (
        <Card key={r.id} style={styles.card}>
          <Card.Content>
            <View style={styles.row}>
              <MaterialCommunityIcons name="clipboard-text" size={30} color="#0A4D68" />

              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.name}>{r.name}</Text>
                <Text style={styles.symptom}>{r.symptom}</Text>
                <Text style={styles.severity}>Severity: {r.severity}</Text>
              </View>

              <Button mode="contained" style={styles.reviewBtn}>
                Review
              </Button>
            </View>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#F6FAFF" },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 12 },
  card: { marginBottom: 12, borderRadius: 18 },
  row: { flexDirection: "row", alignItems: "center" },
  name: { fontSize: 18, fontWeight: "700" },
  symptom: { color: "#555", marginVertical: 3 },
  severity: { fontSize: 12, color: "#888" },
  reviewBtn: { backgroundColor: "#0A4D68" },
});
