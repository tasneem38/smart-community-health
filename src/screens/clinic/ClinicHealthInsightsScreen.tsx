import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, StatusBar } from "react-native";
import { Card, Text, ProgressBar, ActivityIndicator, IconButton } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { fetchAnalytics, fetchDetailedAnalytics } from "../../api/api";

export default function ClinicHealthInsightsScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [choleraRisk, setCholeraRisk] = useState(0);
  const [typhoidRisk, setTyphoidRisk] = useState(0);
  const [symptomCount, setSymptomCount] = useState(0);
  const [pendingReviews, setPendingReviews] = useState(0);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);

      const stats = await fetchAnalytics();
      setSymptomCount(stats.symptomReports || 0);
      setPendingReviews(stats.pendingAssistance || 0); // Using assistance requests as proxy for pending work

      const detailed: any = await fetchDetailedAnalytics();
      const patterns = detailed.symptomPatterns || [];

      // Heuristic: Check for specific keywords in symptom patterns
      // Note: This relies on the symptom names being consistent with what is saved (e.g. "Severe Diarrhea")
      const diarrheaCount = patterns.find((p: any) => p.symptom.includes("Diarrhea"))?.count || 0;
      const feverCount = patterns.find((p: any) => p.symptom.includes("Fever"))?.count || 0;

      // Scale risk based on count (arbitrary threshold for demo)
      setCholeraRisk(Math.min(diarrheaCount / 5, 1));
      setTyphoidRisk(Math.min(feverCount / 5, 1));

    } catch (err) {
      console.log("Error loading insights:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator animating size="large" color="#001F3F" />
        <Text style={{ marginTop: 16, color: '#001F3F' }}>Loading analytics...</Text>
      </View>
    );
  }

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
            <Text style={styles.headerTitle}>Health Insights</Text>
            <Text style={styles.headerSub}>Community health trends</Text>
          </View>
          <MaterialCommunityIcons name="chart-line-variant" size={28} color="#FFD700" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Disease Trends */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardTitleRow}>
              <MaterialCommunityIcons name="virus-outline" size={24} color="#D32F2F" />
              <Text style={styles.cardTitle}>Disease Risks</Text>
            </View>

            <View style={styles.riskRow}>
              <View style={styles.riskLabelRow}>
                <Text style={styles.riskLabel}>Cholera-like Symptoms</Text>
                <Text style={styles.riskValue}>{(choleraRisk * 100).toFixed(0)}%</Text>
              </View>
              <ProgressBar progress={choleraRisk} color="#D32F2F" style={styles.bar} />
            </View>

            <View style={styles.riskRow}>
              <View style={styles.riskLabelRow}>
                <Text style={styles.riskLabel}>Typhoid-like Symptoms</Text>
                <Text style={styles.riskValue}>{(typhoidRisk * 100).toFixed(0)}%</Text>
              </View>
              <ProgressBar progress={typhoidRisk} color="#FF9800" style={styles.bar} />
            </View>
          </Card.Content>
        </Card>

        {/* Reporting Activity */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardTitleRow}>
              <MaterialCommunityIcons name="file-document-multiple-outline" size={24} color="#2196F3" />
              <Text style={styles.cardTitle}>Activity Summary</Text>
            </View>

            <View style={styles.statGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{symptomCount}</Text>
                <Text style={styles.statLabel}>Total Reports</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{pendingReviews}</Text>
                <Text style={styles.statLabel}>Pending Reviews</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
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

  cardTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#001F3F', marginLeft: 10 },

  riskRow: { marginBottom: 16 },
  riskLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  riskLabel: { fontSize: 14, color: '#555' },
  riskValue: { fontWeight: '700', color: '#333' },
  bar: { height: 8, borderRadius: 4, backgroundColor: '#F0F0F0' },

  statGrid: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 10 },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '800', color: '#001F3F' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 4 },
  statDivider: { width: 1, height: 40, backgroundColor: '#E0E0E0' },
});
