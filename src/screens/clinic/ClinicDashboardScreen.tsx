import React, { useContext } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Avatar } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AuthContext } from "../../store/authContext";

export default function ClinicDashboardScreen({ navigation }: any) {
  const { state } = useContext(AuthContext);
  const user = state.user;

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome,</Text>
          <Text style={styles.nameText}>{user?.name}</Text>
        </View>

        <Avatar.Image
          size={50}
          source={require("../../../assets/images/profile.jpg")}
        />
      </View>

      {/* ROLE BADGE */}
      <View style={styles.roleBadge}>
        <Text style={styles.roleText}>Clinic Staff</Text>
      </View>

      {/* GRID ACTIONS */}
      <View style={styles.grid}>
        <Tile
          title="View Alerts"
          icon="alert-circle-outline"
          color="#D9534F"
          onPress={() => navigation.navigate("ClinicAlerts")}
        />

        <Tile
          title="Pending Reviews"
          icon="clipboard-text-search-outline"
          color="#0A4D68"
          onPress={() => navigation.navigate("ClinicPendingReviews")}
        />

        <Tile
          title="Offline Queue"
          icon="cloud-off-outline"
          color="#6C757D"
          onPress={() => navigation.navigate("ClinicOfflineQueue")}
        />

        <Tile
          title="Health Insights"
          icon="chart-line"
          color="#3AA6B9"
          onPress={() => navigation.navigate("ClinicHealthInsights")}
        />

        <Tile
          title="Assign Follow-ups"
          icon="account-check-outline"
          color="#4CAF50"
          onPress={() => navigation.navigate("ClinicAssignFollowup")}
        />

        <Tile
          title="Summary Generator"
          icon="file-document-edit"
          color="#8E44AD"
          onPress={() => navigation.navigate("ClinicSummaryGenerator")}
        />

        <Tile
          title="Settings"
          icon="cog"
          color="#556EE6"
          onPress={() => navigation.navigate("Settings")}
        />
      </View>
    </ScrollView>
  );
}

function Tile({ title, icon, color, onPress }: any) {
  return (
    <TouchableOpacity style={styles.tile} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: color }]}>
        <MaterialCommunityIcons name={icon} size={28} color="#fff" />
      </View>
      <Text style={styles.tileText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#F5FAFF", padding: 18 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    alignItems: "center",
  },
  welcomeText: { fontSize: 18, color: "#666" },
  nameText: { fontSize: 26, fontWeight: "800", color: "#0A4D68" },
  roleBadge: {
    backgroundColor: "#E2F0FB",
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 18,
  },
  roleText: { fontWeight: "700", color: "#0A4D68" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  tile: {
    width: "48%",
    height: 150,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    elevation: 4,
    justifyContent: "flex-end",
  },
  tileText: { fontSize: 18, fontWeight: "700", color: "#333" },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
});
