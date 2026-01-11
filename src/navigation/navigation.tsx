import React, { useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";

import BottomTabs from "./BottomTabs";
import HelpScreen from "../screens/HelpScreen";
import SymptomCheckerScreen from "../screens/SymptomCheckerScreen";

import { AuthContext } from "../store/authContext";

/* -----------------------------------------
      CLINIC SCREENS
-------------------------------------------- */
import ClinicAlertsScreen from "../screens/clinic/ClinicAlertsScreen";
import ClinicAssignFollowupScreen from "../screens/clinic/ClinicAssignFollowupScreen";
import ClinicHealthInsightsScreen from "../screens/clinic/ClinicHealthInsightsScreen";
import ClinicOfflineQueueScreen from "../screens/clinic/ClinicOfflineQueueScreen";
import ClinicPendingReviewsScreen from "../screens/clinic/ClinicPendingReviewsScreen";

/* NEW — AI Insights Dashboard */
import ClinicAIInsightsScreen from "../screens/clinic/AIInsightsScreen";

/* NEW — Clinic Summary Generator */
import ClinicSummaryGeneratorScreen from "../screens/clinic/ClinicSummaryGeneratorScreen";

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;

  MainTabs: undefined;
  LocaliteTabs: undefined;

  Help: undefined;
  SymptomChecker: undefined;
  SummaryGenerator: undefined;

  ClinicAlerts: undefined;
  ClinicPendingReviews: undefined;
  ClinicOfflineQueue: undefined;
  ClinicHealthInsights: undefined;
  ClinicAssignFollowup: undefined;

  ClinicAIInsights: undefined;
  ClinicSummaryGenerator: undefined;   // 🔥 ADDED
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation() {
  const { state } = useContext(AuthContext);
  const role = state?.user?.role;

  return (
    <Stack.Navigator
      initialRouteName={
        !state.user
          ? "Home"
          : role === "LOCALITE"
          ? "LocaliteTabs"
          : "MainTabs"
      }
      screenOptions={{ headerShown: false }}
    >
      {/* BEFORE LOGIN */}
      {!state.user ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          {/* ASHA + CLINIC */}
          {role !== "LOCALITE" && (
            <Stack.Screen name="MainTabs" component={BottomTabs} />
          )}

          {/* LOCALITE */}
          {role === "LOCALITE" && (
            <Stack.Screen name="LocaliteTabs" component={BottomTabs} />
          )}

          {/* COMMON SCREENS */}
          <Stack.Screen name="Help" component={HelpScreen} />

          <Stack.Screen
            name="SymptomChecker"
            component={SymptomCheckerScreen}
            options={{ headerShown: true }}
          />

          {/* -------- CLINIC SCREENS -------- */}

          <Stack.Screen
            name="ClinicAlerts"
            component={ClinicAlertsScreen}
            options={{ headerShown: true, title: "Alerts" }}
          />

          <Stack.Screen
            name="ClinicPendingReviews"
            component={ClinicPendingReviewsScreen}
            options={{ headerShown: true, title: "Pending Reviews" }}
          />

          <Stack.Screen
            name="ClinicOfflineQueue"
            component={ClinicOfflineQueueScreen}
            options={{ headerShown: true, title: "Offline Queue" }}
          />

          <Stack.Screen
            name="ClinicHealthInsights"
            component={ClinicHealthInsightsScreen}
            options={{ headerShown: true, title: "Health Insights" }}
          />

          <Stack.Screen
            name="ClinicAssignFollowup"
            component={ClinicAssignFollowupScreen}
            options={{ headerShown: true, title: "Assign Follow-ups" }}
          />

          <Stack.Screen
            name="ClinicAIInsights"
            component={ClinicAIInsightsScreen}
            options={{ headerShown: true, title: "AI Insights Dashboard" }}
          />

          {/* 🚀 NEW — CLINIC SUMMARY GENERATOR */}
          <Stack.Screen
            name="ClinicSummaryGenerator"
            component={ClinicSummaryGeneratorScreen}
            options={{ headerShown: true, title: "Summary Generator" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
