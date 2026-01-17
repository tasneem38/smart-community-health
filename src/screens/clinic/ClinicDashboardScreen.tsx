import React, { useContext } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Avatar, ProgressBar } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AuthContext } from "../../store/authContext";

export default function ClinicDashboardScreen({ navigation }: any) {
  const { state } = useContext(AuthContext);
  const user = state.user;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* -------------------------------------------
          HEADER
      -------------------------------------------- */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.clinicLabel}>CLINIC PORTAL</Text>
            <Text style={styles.clinicName}>Main City Clinic</Text>
            <Text style={styles.staffName}>Dr. {user?.name}</Text>
          </View>
          <View style={styles.profileBox}>
            <Avatar.Image size={44} source={require("../../../assets/images/profile.jpg")} />
          </View>
        </View>

        {/* SUMMARY STATS */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>12</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>5</Text>
            <Text style={styles.statLabel}>Alerts</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>98%</Text>
            <Text style={styles.statLabel}>Water Safe</Text>
          </View>
        </View>
      </View>

      {/* -------------------------------------------
          MAIN TASKS
      -------------------------------------------- */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Tasks</Text>

        <TaskRow
          title="Pending Reviews"
          sub="Review submitted symptom reports"
          count={12}
          color="#D9534F"
          icon="clipboard-text-search-outline"
          onPress={() => navigation.navigate("ClinicPendingReviews")}
        />

        <TaskRow
          title="Offline Queue"
          sub="Sync data collected offline"
          count={3}
          color="#FF9800"
          icon="cloud-off-outline"
          onPress={() => navigation.navigate("ClinicOfflineQueue")}
        />

        <TaskRow
          title="Assign Follow-ups"
          sub="Deploy ASHA workers to high-risk areas"
          color="#4CAF50"
          icon="account-check-outline"
          onPress={() => navigation.navigate("ClinicAssignFollowup")}
        />
      </View>

      {/* -------------------------------------------
          INSIGHTS
      -------------------------------------------- */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Analytics & Reports</Text>

        <View style={styles.analyticsGrid}>
          <AnalyticsCard
            title="Health Insights"
            icon="chart-line"
            color="#2196F3"
            onPress={() => navigation.navigate("ClinicHealthInsights")}
          />
          <AnalyticsCard
            title="Summary Generator"
            icon="file-document-edit"
            color="#9C27B0"
            onPress={() => navigation.navigate("ClinicSummaryGenerator")}
          />
        </View>
      </View>

    </ScrollView>
  );
}

function TaskRow({ title, sub, count, color, icon, onPress }: any) {
  return (
    <TouchableOpacity style={styles.taskRow} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={styles.taskTitle}>{title}</Text>
        <Text style={styles.taskSub}>{sub}</Text>
      </View>
      {count !== undefined && (
        <View style={[styles.badge, { backgroundColor: color }]}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      )}
      <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
    </TouchableOpacity>
  );
}

function AnalyticsCard({ title, icon, color, onPress }: any) {
  return (
    <TouchableOpacity style={styles.analyticsCard} onPress={onPress}>
      <MaterialCommunityIcons name={icon} size={32} color={color} />
      <Text style={styles.analyticsTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },

  /* HEADER */
  header: {
    backgroundColor: '#001F3F',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  clinicLabel: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  clinicName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  staffName: {
    color: '#B0C4DE',
    fontSize: 14,
    marginTop: 2,
  },
  profileBox: {
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 50,
    padding: 2,
  },

  /* STATS */
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNum: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    color: '#B0C4DE',
    fontSize: 10,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  /* SECTIONS */
  section: {
    padding: 24,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#444',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },

  /* TASKS */
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  taskSub: {
    fontSize: 12,
    color: '#888',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  /* ANALYTICS */
  analyticsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  analyticsCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    marginBottom: 20,
  },
  analyticsTitle: {
    marginTop: 12,
    fontWeight: '700',
    color: '#555',
  },
});
