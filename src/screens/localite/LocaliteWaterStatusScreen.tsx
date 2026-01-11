import React, { useEffect, useState, useContext } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Text, Card, ProgressBar, ActivityIndicator } from "react-native-paper";
import { AuthContext } from "../../store/authContext";
import { getLatestWaterStatus } from "../../api/firebase/database";

export default function LocaliteWaterStatusScreen() {
  const { state } = useContext(AuthContext);
  const user = state.user;

  const [water, setWater] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWaterStatus();
  }, []);

  const loadWaterStatus = async () => {
    setLoading(true);

    // 🔹 FIXED: use logged-in user’s village
    const village = user?.village;

    if (!village) {
      console.log("⚠️ No village saved for this user.");
      setWater(null);
      setLoading(false);
      return;
    }

    const data = await getLatestWaterStatus(village);

    setWater(data);
    setLoading(false);
  };

  if (loading)
    return (
      <ScrollView style={styles.container}>
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      </ScrollView>
    );

  if (!water)
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Your Water Source Status</Text>
        <Card style={styles.card}>
          <Card.Content>
            <Text>No recent water tests found for your village ({user?.village}).</Text>
          </Card.Content>
        </Card>
      </ScrollView>
    );

  const { turbidity, ph } = water;
  const safe = turbidity < 25 && ph >= 6.5 && ph <= 8.5;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Water Source Status</Text>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.label}>Village: {user?.village}</Text>

          <Text style={styles.label}>Turbidity</Text>
          <ProgressBar progress={turbidity / 100} color="#0A4D68" />
          <Text>{turbidity} NTU</Text>

          <Text style={styles.label}>pH Level</Text>
          <Text style={styles.ph}>{ph}</Text>

          <Text
            style={[
              styles.status,
              { color: safe ? "#4CAF50" : "#D9534F" },
            ]}
          >
            Status: {safe ? "SAFE" : "UNSAFE"}
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#F4FAFF" },
  title: { fontSize: 22, fontWeight: "700", color: "#0A4D68", marginBottom: 12 },
  card: { borderRadius: 18, paddingVertical: 6 },
  label: { marginTop: 10, fontWeight: "600" },
  ph: { fontSize: 18, fontWeight: "700", marginTop: 4 },
  status: { marginTop: 14, fontSize: 18, fontWeight: "700" },
});
