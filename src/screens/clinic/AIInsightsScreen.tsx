import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, RefreshControl } from "react-native";
import { Card, Text, ActivityIndicator, ProgressBar, Divider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fetchDetailedAnalytics } from "../../api/api";

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
      const data: any = await fetchDetailedAnalytics();

      setHotspots(data.hotspots || []);
      setWaterTrend(data.waterTrend || []);
      setSymptomPattern(data.symptomPatterns || []);

      // Calculate total reports from hotspots or patterns as an approximation
      const total = (data.hotspots || []).reduce((acc: number, cur: any) => acc + parseInt(cur.count), 0);
      setTotalReports(total);

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
        <ActivityIndicator animating size="large" color="#001F3F" />
        <Text style={{ marginTop: 12, color: '#001F3F' }}>Loading analytics...</Text>
      </View>
    );
  }

  // helpers for rendering bars
  const maxHotspot = Math.max(1, ...(hotspots.map(h => h.count)));
  const maxSymptom = Math.max(1, ...(symptomPattern.map(s => s.count)));
  const maxTurb = Math.max(1, ...(waterTrend.map(w => w.avgTurbidity)));

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>AI Analytics Dashboard</Text>
            <Text style={styles.headerSub}>Deep dive into health data</Text>
          </View>
          <MaterialCommunityIcons name="brain" size={28} color="#FFD700" />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#001F3F"]} />}
      >

        {/* OVERVIEW CARD */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardTitleRow}>
              <MaterialCommunityIcons name="information-outline" size={24} color="#001F3F" />
              <Text style={styles.sectionTitle}>Overview</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Reports (30d):</Text>
              <Text style={styles.statValue}>{totalReports}</Text>
            </View>
            <Text style={styles.hintText}>
              Hotspots and trends are automatically derived from collected reports.
            </Text>
          </Card.Content>
        </Card>

        {/* HOTSPOTS */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardTitleRow}>
              <MaterialCommunityIcons name="map-marker-radius" size={24} color="#D32F2F" />
              <Text style={styles.sectionTitle}>Disease Hotspots</Text>
            </View>

            <View style={{ marginTop: 8 }}>
              {hotspots.length === 0 && <Text style={styles.noData}>No data available</Text>}
              {hotspots.map((h) => (
                <View key={h.village} style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={styles.rowTitle}>{h.village}</Text>
                    <ProgressBar progress={h.count / maxHotspot} color="#D32F2F" style={styles.bar} />
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{h.count}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* WATER TREND */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardTitleRow}>
              <MaterialCommunityIcons name="water-alert" size={24} color="#0288D1" />
              <Text style={styles.sectionTitle}>Water Contamination</Text>
            </View>
            <Text style={styles.subTitleSmall}>(Avg Turbidity - last 14 days)</Text>

            <View style={{ marginTop: 12 }}>
              {waterTrend.length === 0 && <Text style={styles.noData}>No water test data available</Text>}
              {waterTrend.map((d) => (
                <View key={d.date} style={styles.rowSmall}>
                  <Text style={styles.dateLabel}>{d.date.slice(5)}</Text>
                  <ProgressBar progress={maxTurb ? d.avgTurbidity / maxTurb : 0} color="#0288D1" style={styles.barThinking} />
                  <Text style={styles.valueLabel}>{d.avgTurbidity.toFixed(1)} NTU</Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* SYMPTOM PATTERNS */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardTitleRow}>
              <MaterialCommunityIcons name="virus" size={24} color="#FFA000" />
              <Text style={styles.sectionTitle}>Symptom Patterns</Text>
            </View>

            {symptomPattern.length === 0 && <Text style={styles.noData}>No symptom data</Text>}
            {symptomPattern.map((s) => (
              <View key={s.symptom} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{s.symptom}</Text>
                  <ProgressBar progress={s.count / maxSymptom} color="#FFA000" style={styles.bar} />
                </View>
                <View style={[styles.badge, { backgroundColor: '#FFF3E0' }]}>
                  <Text style={[styles.badgeText, { color: '#FFA000' }]}>{s.count}</Text>
                </View>
              </View>
            ))}

          </Card.Content>
        </Card>

        <Divider style={{ marginVertical: 12 }} />

        <Text style={styles.footerNote}>
          Insights are derived from symptom reports and water tests stored in Firestore.
        </Text>
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
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  headerSub: {
    fontSize: 14,
    color: '#B0C4DE',
    marginTop: 2,
  },
  content: { padding: 16, paddingBottom: 40 },
  card: { marginBottom: 16, borderRadius: 16, backgroundColor: '#fff', elevation: 2 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 18, backgroundColor: "#F0F4F8" },

  cardTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginLeft: 10, color: "#001F3F" },

  statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  statLabel: { fontSize: 16, color: '#555' },
  statValue: { fontSize: 18, fontWeight: '800', color: '#001F3F', marginLeft: 8 },
  hintText: { fontSize: 12, color: "#888", fontStyle: 'italic' },

  row: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  rowSmall: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  rowTitle: { fontSize: 14, fontWeight: "600", color: '#444' },
  bar: { height: 8, borderRadius: 8, marginTop: 6, backgroundColor: '#f0f0f0' },
  barThinking: { flex: 1, height: 8, borderRadius: 8, backgroundColor: '#E1F5FE' },

  badge: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFEBEE', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  badgeText: { fontWeight: "700", color: '#D32F2F', fontSize: 12 },

  dateLabel: { width: 40, fontSize: 12, color: '#666' },
  valueLabel: { width: 70, textAlign: "right", marginLeft: 8, fontWeight: '700', fontSize: 12, color: '#0288D1' },
  subTitleSmall: { fontSize: 12, color: '#888', marginBottom: 8, marginLeft: 34 },

  noData: { color: "#999", fontStyle: 'italic', marginLeft: 34 },
  footerNote: { textAlign: "center", color: "#888", fontSize: 12, marginBottom: 20 },
});
