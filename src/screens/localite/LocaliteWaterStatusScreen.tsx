import React, { useEffect, useState, useContext } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, ActivityIndicator, Divider, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from "../../store/authContext";
import { useTranslation } from 'react-i18next';
import { getLatestWaterStatus } from "../../api/api";

export default function LocaliteWaterStatusScreen() {
  const { state } = useContext(AuthContext);
  const user = state.user;

  const [waterReports, setWaterReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWaterStatus();
  }, []);

  const loadWaterStatus = async () => {
    setLoading(true);
    try {
      const village = user?.village;
      if (!village) {
        setWaterReports([]);
        setLoading(false);
        return;
      }
      const data = await getLatestWaterStatus(village);
      setWaterReports(Array.isArray(data) ? data : (data ? [data] : []));
    } catch (err) {
      console.error("Failed to load water status:", err);
      setWaterReports([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate aggregate status: 2 = Unsafe, 1 = Warning, 0 = Safe
  const getAggregateStatus = () => {
    if (waterReports.length === 0) return 0;

    let maxRisk = 0;
    waterReports.forEach(r => {
      const ph = r.ph || 7;
      const turb = r.turbidity || 0;

      // Unsafe Level
      if (ph < 5 || ph > 10 || turb >= 50) {
        maxRisk = Math.max(maxRisk, 2);
      }
      // Warning Level
      else if (ph < 6.5 || ph > 8.5 || turb >= 25) {
        maxRisk = Math.max(maxRisk, 1);
      }
    });
    return maxRisk;
  };

  const aggregateStatus = getAggregateStatus();

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>Water Status</Text>
        <Text style={styles.headerSub}>Latest reports for {user?.village || "your area"}</Text>
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

  if (waterReports.length === 0)
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="water-off" size={60} color="#B0C4DE" />
          <Text style={{ color: "#888", marginTop: 10 }}>No water test reports found.</Text>
        </View>
      </View>
    );

  const getRecs = (status: number) => {
    switch (status) {
      case 2: // UNSAFE
        return [
          { icon: "fire", title: "Boil Water", desc: "Boil for 20 mins. Essential to kill bacteria and viruses.", color: "#D32F2F" },
          { icon: "filter-variant", title: "Filter First", desc: "Filter through clean cloth to remove mud before boiling.", color: "#1976D2" },
          { icon: "pill", title: "Chlorine Tablets", desc: "Use 1 tablet per 20L if boiling is not an option.", color: "#00796B" },
          { icon: "alert", title: "Medical Alert", desc: "Consult doctor if you feel sick after drinking.", color: "#E65100" }
        ];
      case 1: // WARNING
        return [
          { icon: "sun-sideview", title: "Solar (SODIS)", desc: "Expose water in clear bottles to sun for 6 hours.", color: "#F57C00" },
          { icon: "filter", title: "Basic Filter", desc: "Use a sand or charcoal filter to improve clarity.", color: "#388E3C" },
          { icon: "soap", title: "Clean Vessels", desc: "Scrub your storage pots with soap and dry in sun.", color: "#0288D1" },
          { icon: "hand-wash", title: "Wait & Settle", desc: "Let mud settle at bottom before pouring out.", color: "#7B1FA2" }
        ];
      default: // SAFE
        return [
          { icon: "shield-check", title: "Keep it Safe", desc: "Always keep water pots covered with a clean lid.", color: "#2E7D32" },
          { icon: "hand-water", title: "Clean Hands", desc: "Wash hands properly before fetching or drinking.", color: "#1976D2" },
          { icon: "map-marker-radius", title: "Protect Source", desc: "Keep the area around the well/tap clean from waste.", color: "#00796B" },
          { icon: "update", title: "Regular Testing", desc: "Ensure ASHA worker tests the source every month.", color: "#455A64" }
        ];
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadWaterStatus} colors={["#001F3F"]} />}
    >
      {renderHeader()}

      <View style={styles.introBox}>
        <MaterialCommunityIcons name="information" size={20} color="#001F3F" />
        <Text style={styles.introText}>Showing latest status for each water source in your village.</Text>
      </View>

      {waterReports.map((report) => {
        const { turbidity = 0, ph = 7, timestamp, raw_data } = report;
        const sourceType = raw_data?.sourceType || 'General Source';

        // Define per-report status for coloring
        let reportStatus = 0; // Safe
        if (ph < 5 || ph > 10 || turbidity >= 50) reportStatus = 2; // Unsafe
        else if (ph < 6.5 || ph > 8.5 || turbidity >= 25) reportStatus = 1; // Warning

        const statusLabel = reportStatus === 2 ? "UNSAFE" : reportStatus === 1 ? "WARNING" : "SAFE";
        const statusColor = reportStatus === 2 ? "#D32F2F" : reportStatus === 1 ? "#F57C00" : "#2E7D32";

        return (
          <Card key={report.id} style={[styles.card, { borderTopWidth: 6, borderTopColor: statusColor }]}>
            <Card.Content>
              <View style={styles.sourceHeader}>
                <MaterialCommunityIcons
                  name={sourceType === 'well' ? 'water-well' : sourceType === 'tap' ? 'water-pump' : 'source-branch'}
                  size={24} color="#001F3F"
                />
                <Text style={styles.sourceTitle}>{sourceType.toUpperCase()}</Text>
              </View>

              <View style={styles.statusHeader}>
                <MaterialCommunityIcons
                  name={reportStatus === 2 ? "alert-decagram" : reportStatus === 1 ? "alert-circle-outline" : "check-decagram"}
                  size={32}
                  color={statusColor}
                />
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {statusLabel} - {reportStatus === 0 ? "Ready to drink" : reportStatus === 1 ? "Treatment advised" : "Do not drink raw"}
                </Text>
              </View>

              <Divider style={{ marginVertical: 12 }} />

              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <Text style={styles.miniLabel}>Turbidity</Text>
                  <Text style={styles.miniValue}>{turbidity} NTU</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.miniLabel}>pH Level</Text>
                  <Text style={styles.miniValue}>{ph}</Text>
                </View>
              </View>

              {raw_data?.ai_explanation && (
                <View style={[styles.aiBox, { borderLeftColor: statusColor, backgroundColor: statusColor + '08' }]}>
                  <View style={styles.aiHeader}>
                    <MaterialCommunityIcons name="robot" size={20} color={statusColor} />
                    <Text style={[styles.aiLabel, { color: statusColor }]}>Health Advice</Text>
                  </View>
                  <Text style={styles.aiText}>"{raw_data.ai_explanation}"</Text>
                </View>
              )}

              <Text style={styles.dateText}>
                Tested on: {timestamp ? new Date(timestamp).toLocaleDateString() : 'N/A'}
              </Text>
            </Card.Content>
          </Card>
        );
      })}

      <Card style={styles.infoCard}>
        <Card.Content>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <MaterialCommunityIcons name="shield-check" size={24} color="#001F3F" />
            <Text style={{ fontSize: 16, fontWeight: '700', marginLeft: 8, color: '#001F3F' }}>About Safety</Text>
          </View>
          <Text style={{ color: '#444', fontSize: 13 }}>
            Safety status is determined by pH levels (6.5-8.5) and turbidity (&lt; 25 NTU). Follow AI health advice for specific treatment instructions.
          </Text>
        </Card.Content>
      </Card>

      <Text style={[styles.recTitle, { color: aggregateStatus === 2 ? "#D32F2F" : aggregateStatus === 1 ? "#F57C00" : "#2E7D32" }]}>
        {aggregateStatus === 2 ? "⚠️ Critical Actions" : aggregateStatus === 1 ? "🟠 Precautionary Actions" : "✅ Maintenance Tips"}
      </Text>

      <View style={styles.recContainer}>
        {getRecs(aggregateStatus).map((rec, index) => (
          <RecommendationItem
            key={index}
            icon={rec.icon}
            title={rec.title}
            desc={rec.desc}
            color={rec.color}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function RecommendationItem({ icon, title, desc, color }: any) {
  return (
    <View style={styles.recItem}>
      <View style={[styles.recIconBox, { backgroundColor: color + '15' }]}>
        <MaterialCommunityIcons name={icon} size={28} color={color} />
      </View>
      <View style={styles.recTextBox}>
        <Text style={[styles.recItemTitle, { color }]}>{title}</Text>
        <Text style={styles.recItemDesc}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F8FB"
  },
  header: {
    backgroundColor: '#001F3F',
    paddingVertical: 24,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  introBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    opacity: 0.8,
  },
  introText: {
    fontSize: 12,
    color: '#001F3F',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    opacity: 0.7,
  },
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
  sourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sourceTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#001F3F',
    marginLeft: 8,
    letterSpacing: 1,
  },
  statusHeader: {
    alignItems: 'center',
    marginVertical: 4,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 10,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  metricItem: {
    alignItems: 'center',
  },
  miniLabel: {
    fontSize: 11,
    color: '#888',
    textTransform: 'uppercase',
  },
  miniValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  aiBox: {
    backgroundColor: '#F0F7FF',
    padding: 12,
    borderRadius: 12,
    marginTop: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#0D47A1',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  aiLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0D47A1',
    marginLeft: 6,
  },
  aiText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  dateText: {
    textAlign: 'right',
    color: '#bbb',
    fontSize: 10,
    marginTop: 12,
  },
  infoCard: {
    marginHorizontal: 16,
    marginBottom: 30,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    padding: 4,
  },
  recTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#001F3F',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 16,
  },
  recContainer: {
    marginHorizontal: 16,
    marginBottom: 40,
  },
  recItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    alignItems: 'center',
  },
  recIconBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recTextBox: {
    flex: 1,
    marginLeft: 16,
  },
  recItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  recItemDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});
