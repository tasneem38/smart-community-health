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
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Pending Reviews</Text>
            <Text style={styles.headerSub}>Patient reports awaiting action</Text>
          </View>
          <MaterialCommunityIcons name="clipboard-text-clock" size={28} color="#FFD700" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {reports.map((r) => (
          <Card key={r.id} style={styles.card}>
            <Card.Content>
              <View style={styles.row}>
                <View style={[styles.iconBox, { backgroundColor: r.severity === 'High' ? '#FFEBEE' : '#E3F2FD' }]}>
                  <MaterialCommunityIcons
                    name={r.severity === 'High' ? "alert-circle" : "information"}
                    size={24}
                    color={r.severity === 'High' ? "#D32F2F" : "#2196F3"}
                  />
                </View>

                <View style={{ marginLeft: 14, flex: 1 }}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.name}>{r.name}</Text>
                    <View style={[styles.badge, r.severity === 'High' ? styles.badgeHigh : styles.badgeLow]}>
                      <Text style={[styles.badgeText, r.severity === 'High' ? styles.textHigh : styles.textLow]}>
                        {r.severity} Risk
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.symptom}>{r.symptom}</Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <Button mode="outlined" style={styles.skipBtn} textColor="#888">Skip</Button>
                <Button mode="contained" style={styles.reviewBtn} icon="check">Review</Button>
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
  content: { padding: 16 },
  card: { marginBottom: 16, borderRadius: 16, backgroundColor: '#fff', elevation: 2 },
  row: { flexDirection: "row", alignItems: "flex-start" },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: { fontSize: 18, fontWeight: "700", color: '#333' },
  symptom: { color: "#555", marginTop: 4, fontSize: 14 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeHigh: { backgroundColor: '#FFEBEE' },
  badgeLow: { backgroundColor: '#E3F2FD' },
  badgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  textHigh: { color: '#D32F2F' },
  textLow: { color: '#2196F3' },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 10,
  },
  skipBtn: { borderColor: '#ddd' },
  reviewBtn: { backgroundColor: '#001F3F', borderRadius: 8 },
});
