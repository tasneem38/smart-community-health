// src/screens/clinic/AIInsightsScreen.tsx
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, RefreshControl } from "react-native";
import { Card, Text, ActivityIndicator, ProgressBar, Avatar, Divider } from "react-native-paper";
import {
  fetchSymptomReports,
  fetchWaterTests,
  aggregateHotspots,
  aggregateWaterTrend,
  aggregateSymptomPatterns,
} from "../../api/firebase/analytics";

export default function AIInsightsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [hotspots, setHotspots] = useState<{ village: string; count: number }[]>([]);
  const [waterTrend, setWaterTrend] = useState<{ date: string; avgTurbidity: number; samples: number }[]>([]);
  const [symptomPattern, setSymptomPattern] = useState<{ symptom: string; count: number }[]>([]);
  const [totalReports, setTotalReports] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      // last 30 days for symptoms, 14 days for water
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      const [symReports, waterTests] = await Promise.all([
        fetchSymptomReports({ sinceISO: thirtyDaysAgo.toISOString() }),
        fetchWaterTests({ sinceISO: fourteenDaysAgo.toISOString() }),
      ]);

      setTotalReports(symReports.length);

      setHotspots(aggregateHotspots(symReports, 8));
      setWaterTrend(aggregateWaterTrend(waterTests, 14));
      setSymptomPattern(aggregateSymptomPatterns(symReports).slice(0, 8));
    } catch (err) {
      console.warn("AIInsights load error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating size="large" />
        <Text style={{ marginTop: 12 }}>Loading insights...</Text>
      </View>
    );
  }

  // helpers for rendering bars
  const maxHotspot = Math.max(1, ...(hotspots.map(h => h.count)));
  const maxSymptom = Math.max(1, ...(symptomPattern.map(s => s.count)));
  const maxTurb = Math.max(1, ...(waterTrend.map(w => w.avgTurbidity)));

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>AI Insights Dashboard</Text>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text>Total symptom reports (last 30d): {totalReports}</Text>
          <Text style={{ marginTop: 8, color: "#666" }}>Hotspots and trends are automatically derived from collected reports.</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Disease Hotspots (villages)</Text>
          <View style={{ marginTop: 8 }}>
            {hotspots.length === 0 && <Text style={{ color: "#777" }}>No data available</Text>}
            {hotspots.map((h) => (
              <View key={h.village} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={styles.rowTitle}>{h.village}</Text>
                  <ProgressBar progress={h.count / maxHotspot} color="#d9534f" style={{ height: 10, borderRadius: 8, marginTop: 6 }} />
                </View>
                <Text style={styles.badge}>{h.count}</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Water Contamination Trend (avg turbidity)</Text>

          <View style={{ marginTop: 8 }}>
            {waterTrend.length === 0 && <Text style={{ color: "#777" }}>No water test data available</Text>}
            {waterTrend.map((d) => (
              <View key={d.date} style={styles.rowSmall}>
                <Text style={{ width: 90 }}>{d.date.slice(5)}</Text>
                <ProgressBar progress={maxTurb ? d.avgTurbidity / maxTurb : 0} style={{ flex: 1, height: 8, borderRadius: 8 }} />
                <Text style={{ width: 60, textAlign: "right", marginLeft: 8 }}>{d.avgTurbidity.toFixed(1)} NTU</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Symptom Patterns (top)</Text>

          {symptomPattern.length === 0 && <Text style={{ color: "#777" }}>No symptom data</Text>}
          {symptomPattern.map((s) => (
            <View key={s.symptom} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{s.symptom}</Text>
                <ProgressBar progress={s.count / maxSymptom} color="#0077b6" style={{ height: 10, borderRadius: 8, marginTop: 6 }} />
              </View>
              <Text style={styles.badge}>{s.count}</Text>
            </View>
          ))}

        </Card.Content>
      </Card>

      <Divider style={{ marginVertical: 12 }} />

      <Text style={{ textAlign: "center", color: "#666", marginBottom: 30 }}>
        Insights are derived from symptom reports and water tests stored in Firestore.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#F7FCFF" },
  title: { fontSize: 22, fontWeight: "800", color: "#0A4D68", marginBottom: 12 },
  card: { marginBottom: 12, borderRadius: 14 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 18 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6, color: "#0A4D68" },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  rowSmall: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  rowTitle: { fontSize: 14, fontWeight: "700" },
  badge: { width: 46, textAlign: "center", fontWeight: "700" },
});
