import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Card, Text, ProgressBar, ActivityIndicator } from "react-native-paper";

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
      <ScrollView style={styles.container}>
        <ActivityIndicator animating size="large" />
        <Text style={{ textAlign: "center", marginTop: 10 }}>
          Loading insights...
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Health Insights 📊</Text>

      {/* Disease Trends */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.subTitle}>Disease Trends</Text>

          <Text>Cholera-like Symptoms</Text>
          <ProgressBar
            progress={choleraRisk}
            color="#d9534f"
            style={styles.bar}
          />

          <Text>Typhoid-like Symptoms</Text>
          <ProgressBar
            progress={typhoidRisk}
            color="#f0ad4e"
            style={styles.bar}
          />
        </Card.Content>
      </Card>

      {/* Reporting Activity */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.subTitle}>Reporting Activity</Text>
          <Text>Total Symptom Reports: {symptomCount}</Text>
          <Text>Pending Clinic Reviews: {pendingReviews}</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, backgroundColor: "#F6FAFF" },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 12 },
  card: { marginBottom: 14, borderRadius: 18 },
  bar: { height: 8, borderRadius: 6, marginBottom: 10 },
  subTitle: { fontWeight: "700", fontSize: 18, marginBottom: 10 },
});
