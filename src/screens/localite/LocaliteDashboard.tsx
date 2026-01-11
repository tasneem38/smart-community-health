import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import LocaliteHomeScreen from "./LocaliteHomeScreen";
import LocaliteReportSymptomsScreen from "./LocaliteReportSymptomsScreen";
import LocaliteAlertsScreen from "./LocaliteAlertsScreen";
import LocaliteWaterStatusScreen from "./LocaliteWaterStatusScreen";
import LocaliteRequestAssistanceScreen from "./LocaliteRequestAssistanceScreen";

const Tab = createBottomTabNavigator();

export default function LocaliteDashboard() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: "#0A4D68",
        tabBarInactiveTintColor: "#777",
      }}
    >

      <Tab.Screen
        name="LocaliteHome"
        component={LocaliteHomeScreen}
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home" color={color} size={28} />
          ),
        }}
      />

      <Tab.Screen
        name="LocaliteReport"
        component={LocaliteReportSymptomsScreen}
        options={{
          title: "Report",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="clipboard-plus" color={color} size={28} />
          ),
        }}
      />

      <Tab.Screen
        name="LocaliteAlerts"
        component={LocaliteAlertsScreen}
        options={{
          title: "Alerts",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="alert-circle" color={color} size={28} />
          ),
        }}
      />

      <Tab.Screen
        name="WaterStatus"
        component={LocaliteWaterStatusScreen}
        options={{
          title: "Water",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="water" color={color} size={28} />
          ),
        }}
      />

      <Tab.Screen
        name="LocaliteAssistance"
        component={LocaliteRequestAssistanceScreen}
        options={{
          title: "Help",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="hand-heart" color={color} size={28} />
          ),
        }}
      />

    </Tab.Navigator>
  );
}
