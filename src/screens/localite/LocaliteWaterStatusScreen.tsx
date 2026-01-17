import React, { useEffect, useState, useContext } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text, Card, ProgressBar, ActivityIndicator, Divider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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
    const village = user?.village;
    if (!village) {
      setWater(null);
      setLoading(false);
      return;
    }
    const data = await getLatestWaterStatus(village);
    setWater(data);
    setLoading(false);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>Water Reports</Text>
        <Text style={styles.headerSub}>Quality status for {user?.village || "your area"}</Text>
      </View>
      <MaterialCommunityIcons name="water-check-outline" size={32} color="#FFD700" />
    </View>
  );

  if (loading)
    return (
      <View style={styles.container}>
        {renderHeader()}
        <ActivityIndicator size="large" style={{ marginTop: 40 }} color="#001F3F" />
      </View>
    );

  if (!water)
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="water-off" size={60} color="#B0C4DE" />
          <Text style={{ color: "#888", marginTop: 10 }}>No water test reports found.</Text>
        </View>
      </View>
    );

  const { turbidity = 0, ph = 7, timestamp } = water;
  const safe = (turbidity < 25) && (ph >= 6.5 && ph <= 8.5);

  return (
    <ScrollView style={styles.container}>
      {renderHeader()}

      <Card style={[styles.card, safe ? styles.safeCard : styles.unsafeCard]}>
        <Card.Content>
          <View style={styles.statusHeader}>
            <MaterialCommunityIcons
              name={safe ? "check-decagram" : "alert-decagram"}
              size={40}
              color={safe ? "#155724" : "#721c24"}
            />
            <Text style={[styles.statusText, { color: safe ? "#155724" : "#721c24" }]}>
              {safe ? "SAFE for Consumption" : "UNSAFE - Do Not Drink"}
            </Text>
          </View>

          <Divider style={{ marginVertical: 16 }} />

          <Text style={styles.label}>Turbidity (Clarity)</Text>
          <View style={styles.progressContainer}>
            <ProgressBar progress={Math.min(turbidity / 50, 1)} color="#001F3F" style={styles.progressBar} />
            <Text style={styles.valueText}>{turbidity} NTU</Text>
          </View>
          <Text style={styles.helper}>Normal is &lt; 25 NTU</Text>

          <Text style={styles.label}>pH Level (Acidity)</Text>
          <View style={styles.metricBox}>
            <Text style={styles.phValue}>{ph}</Text>
            <Text style={styles.phLabel}>{ph >= 6.5 && ph <= 8.5 ? "Normal Range" : "Abnormal"}</Text>
          </View>

          <Text style={styles.dateText}>
            Last tested: {timestamp ? new Date(timestamp).toLocaleDateString() : 'N/A'}
          </Text>
        </Card.Content>
      </Card>

      {!safe && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <MaterialCommunityIcons name="information-outline" size={24} color="#001F3F" />
              <Text style={{ fontSize: 16, fontWeight: '700', marginLeft: 8, color: '#001F3F' }}>Precaution</Text>
            </View>
            <Text style={{ color: '#444' }}>
              Please boil water for at least 20 minutes before drinking or use filtered water sources until further notice.
            </Text>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F8FB"
  },

  /* HEADER */
  header: {
    backgroundColor: '#001F3F',
    paddingVertical: 24,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  headerSub: {
    fontSize: 14,
    color: '#B0C4DE',
    marginTop: 2,
  },

  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    opacity: 0.7,
  },

  /* CARDS */
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 3,
    backgroundColor: '#fff',
  },
  safeCard: {
    borderTopWidth: 6,
    borderTopColor: '#28a745',
  },
  unsafeCard: {
    borderTopWidth: 6,
    borderTopColor: '#dc3545',
  },

  statusHeader: {
    alignItems: 'center',
    marginVertical: 10,
  },
  statusText: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 8,
    textAlign: 'center',
  },

  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  valueText: {
    fontWeight: '700',
    color: '#001F3F',
    width: 60,
    textAlign: 'right',
  },
  helper: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },

  metricBox: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#001F3F',
  },
  phLabel: {
    fontSize: 14,
    color: '#001F3F',
  },

  dateText: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: 12,
    marginTop: 20,
  },

  infoCard: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
  },
});
