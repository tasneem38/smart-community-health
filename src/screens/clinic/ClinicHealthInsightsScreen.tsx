import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Card, Text, ProgressBar, ActivityIndicator } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../../api/firebase/config";

export default function ClinicHealthInsightsScreen() {
  const db = getFirestore(app);

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

      // Fetch all symptom reports
      const symSnap = await getDocs(collection(db, "symptomReports"));
      const symptomData = symSnap.docs.map((d) => d.data());

      // Total symptom reports
      setSymptomCount(symptomData.length);

      // Pending clinic reviews
      const pending = symptomData.filter((s: any) => !s.reviewed).length;
      setPendingReviews(pending);

      // Disease estimation from symptom codes
      const choleraCases = symptomData.filter((s: any) =>
        s.symptoms?.includes("C")
      ).length;

      const typhoidCases = symptomData.filter((s: any) =>
        s.symptoms?.includes("T")
      ).length;

      // Convert into scale 0 → 1 for progress bars
      setCholeraRisk(Math.min(choleraCases / 10, 1));
      setTyphoidRisk(Math.min(typhoidCases / 10, 1));
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
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
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
