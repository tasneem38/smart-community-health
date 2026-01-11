import React, { useContext } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AuthContext } from "../store/authContext";

/* ASHA / CLINIC SHARED SCREENS */
import DashboardScreen from "../screens/DashboardScreen";
import SymptomReportScreen from "../screens/SymptomReportScreen";
import WaterTestReportScreen from "../screens/WaterTestReportScreen";
import AlertsScreen from "../screens/AlertsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import AssistanceRequestsScreen from "../screens/AssistanceRequestsScreen";

/* LOCALITE SCREENS */
import LocaliteHomeScreen from "../screens/localite/LocaliteHomeScreen";
import LocaliteReportSymptomsScreen from "../screens/localite/LocaliteReportSymptomsScreen";
import LocaliteAlertsScreen from "../screens/localite/LocaliteAlertsScreen";
import LocaliteWaterStatusScreen from "../screens/localite/LocaliteWaterStatusScreen";
import LocaliteRequestAssistanceScreen from "../screens/localite/LocaliteRequestAssistanceScreen";

/* CLINIC SCREENS */
import ClinicDashboardScreen from "../screens/clinic/ClinicDashboardScreen";
import ClinicOfflineQueueScreen from "../screens/clinic/ClinicOfflineQueueScreen";
import ClinicPendingReviewsScreen from "../screens/clinic/ClinicPendingReviewsScreen";
import ClinicAssignFollowupScreen from "../screens/clinic/ClinicAssignFollowupScreen";
import ClinicHealthInsightsScreen from "../screens/clinic/ClinicHealthInsightsScreen";
import ClinicAIInsightsScreen from "../screens/clinic/AIInsightsScreen";
import ClinicSummaryGeneratorScreen from "../screens/clinic/ClinicSummaryGeneratorScreen";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const { state } = useContext(AuthContext);
  const role = state?.user?.role;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarStyle: { height: 60, paddingVertical: 6 },
        tabBarActiveTintColor: "#0A4D68",
        tabBarInactiveTintColor: "#777",
      }}
    >

      {/* LOCALITE */}
      {role === "LOCALITE" && (
        <>
          <Tab.Screen
            name="LocaliteHome"
            component={LocaliteHomeScreen}
            options={{
              title: "Home",
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="home-heart" size={28} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="LocaliteReport"
            component={LocaliteReportSymptomsScreen}
            options={{
              title: "Report",
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="clipboard-text" size={28} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="LocaliteAlerts"
            component={LocaliteAlertsScreen}
            options={{
              title: "Alerts",
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="alert-circle" size={28} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="WaterStatus"
            component={LocaliteWaterStatusScreen}
            options={{
              title: "Water",
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="water" size={28} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Assistance"
            component={LocaliteRequestAssistanceScreen}
            options={{
              title: "Help",
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="hand-heart" size={28} color={color} />
              ),
            }}
          />
        </>
      )}

      {/* CLINIC */}
      {role === "CLINIC" && (
        <>
          <Tab.Screen
            name="ClinicDashboard"
            component={ClinicDashboardScreen}
            options={{
              title: "Dashboard",
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="hospital-building" size={28} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="PendingReviews"
            component={ClinicPendingReviewsScreen}
            options={{
              title: "Reviews",
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="clipboard-clock" size={28} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="AssignFollowUps"
            component={ClinicAssignFollowupScreen}
            options={{
              title: "Follow-up",
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="account-check" size={28} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="OfflineQueue"
            component={ClinicOfflineQueueScreen}
            options={{
              title: "Queue",
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="cloud-off-outline" size={28} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="HealthInsights"
            component={ClinicHealthInsightsScreen}
            options={{
              title: "Insights",
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="chart-areaspline" size={28} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="AIInsights"
            component={ClinicAIInsightsScreen}
            options={{
              title: "AI Insights",
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="robot" size={28} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="ClinicSummaryGenerator"
            component={ClinicSummaryGeneratorScreen}
            options={{
              title: "Summary",
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="file-document-edit" size={28} color={color} />
              ),
            }}
          />
        </>
      )}

      {/* ASHA */}
      {role === "ASHA" && (
        <>
          <Tab.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="view-dashboard" size={28} color={color} />
              ),
            }}
          />

          <Tab.Screen
            name="Symptoms"
            component={SymptomReportScreen}
            options={{
              title: "Report",
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="clipboard-list" size={28} color={color} />
              ),
            }}
          />

          <Tab.Screen
            name="WaterTest"
            component={WaterTestReportScreen}
            options={{
              title: "Water Test",
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="water-percent" size={28} color={color} />
              ),
            }}
          />

          <Tab.Screen
            name="Requests"
            component={AssistanceRequestsScreen}
            options={{
              title: "Requests",
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="account-alert" size={28} color={color} />
              ),
            }}
          />

          <Tab.Screen
            name="Alerts"
            component={AlertsScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="alert" size={28} color={color} />
              ),
            }}
          />
        </>
      )}

      {/* SETTINGS — always present */}
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="cog" size={28} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
