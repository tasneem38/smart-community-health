import React, { useContext } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AuthContext } from "../store/authContext";

/* ASHA / CLINIC SHARED SCREENS */
import DashboardScreen from "../screens/asha/DashboardScreen";
import SymptomReportScreen from "../screens/asha/SymptomReportScreen";
import WaterTestReportScreen from "../screens/asha/WaterTestReportScreen";
import AlertsScreen from "../screens/asha/AlertsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import AssistanceRequestsScreen from "../screens/asha/AssistanceRequestsScreen";

/* LOCALITE SCREENS */
import LocaliteHomeScreen from "../screens/localite/LocaliteHomeScreen";
import LocaliteAlertsScreen from "../screens/localite/LocaliteAlertsScreen";

/* CLINIC SCREENS */
import ClinicDashboardScreen from "../screens/clinic/ClinicDashboardScreen";
import ClinicPendingReviewsScreen from "../screens/clinic/ClinicPendingReviewsScreen";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const { state } = useContext(AuthContext);
  const role = state?.user?.role;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 65,
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: '#001F3F', // Midnight Blue Background
          borderTopWidth: 0,
          elevation: 10,
        },
        tabBarActiveTintColor: "#FFD700", // Soft Gold
        tabBarInactiveTintColor: "#B0C4DE", // Light steel blue for inactive
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          paddingBottom: 4,
        }
      }}
    >

      {/* LOCALITE (Simplified) */}
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
            name="LocaliteAlerts"
            component={LocaliteAlertsScreen}
            options={{
              title: "Alerts",
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="alert-circle" size={28} color={color} />
              ),
            }}
          />
        </>
      )}

      {/* CLINIC (Simplified) */}
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
