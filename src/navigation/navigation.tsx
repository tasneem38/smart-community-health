import React, { useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";

import BottomTabs from "./BottomTabs";
import HelpScreen from "../screens/HelpScreen";
import HelpingHandScreen from "../screens/HelpScreen";
import SymptomCheckerScreen from "../screens/asha/SymptomCheckerScreen";
import SymptomReportScreen from "../screens/asha/SymptomReportScreen";
import WaterTestReportScreen from "../screens/asha/WaterTestReportScreen";
import AssistanceRequestsScreen from "../screens/asha/AssistanceRequestsScreen";
import AlertsScreen from "../screens/asha/AlertsScreen";
import PrivacyPolicyScreen from "../screens/PrivacyPolicyScreen";

import { AuthContext } from "../store/authContext";

/* -----------------------------------------
      CLINIC SCREENS
-------------------------------------------- */
import ClinicAlertsScreen from "../screens/clinic/ClinicAlertsScreen";
import ClinicAssignFollowupScreen from "../screens/clinic/ClinicAssignFollowupScreen";
import ClinicHealthInsightsScreen from "../screens/clinic/ClinicHealthInsightsScreen";
import ClinicOfflineQueueScreen from "../screens/clinic/ClinicOfflineQueueScreen";
import ClinicPendingReviewsScreen from "../screens/clinic/ClinicPendingReviewsScreen";

/* LOCALITE SCREENS */
import LocaliteReportSymptomsScreen from '../screens/localite/LocaliteReportSymptomsScreen';
import LocaliteWaterStatusScreen from '../screens/localite/LocaliteWaterStatusScreen';
import LocaliteRequestAssistanceScreen from '../screens/localite/LocaliteRequestAssistanceScreen';
import LocaliteChatScreen from '../screens/localite/LocaliteChatScreen';
import HelplineCallScreen from '../screens/localite/HelplineCallScreen';

/* NEW — AI Insights Dashboard */
import ClinicAIInsightsScreen from "../screens/clinic/AIInsightsScreen";

/* NEW — Clinic Summary Generator */
/* NEW — Clinic Summary Generator */
import ClinicSummaryGeneratorScreen from "../screens/clinic/ClinicSummaryGeneratorScreen";

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;

  MainTabs: undefined;
  LocaliteTabs: undefined;
  LocaliteReport: undefined;
  WaterStatus: undefined;
  Assistance: undefined;
  Help: undefined;
  SymptomChecker: undefined;
  SummaryGenerator: undefined;

  SymptomReport: undefined;
  WaterTestReport: undefined;
  AssistanceRequests: undefined;
  Alerts: undefined;
  PrivacyPolicy: undefined;

  ClinicAlerts: undefined;
  ClinicPendingReviews: undefined;
  ClinicOfflineQueue: undefined;
  ClinicHealthInsights: undefined;
  ClinicAssignFollowup: undefined;

  ClinicAIInsights: undefined;
  ClinicSummaryGenerator: undefined;
  RecentWaterTests: undefined;
  WaterTestDetails: { test: any };
  LocaliteChat: undefined;
  HelplineCall: undefined;
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
            <>
              <Stack.Screen name="LocaliteTabs" component={BottomTabs} />

              {/* Stack Screens for Localite Dashboard Navigation */}
              <Stack.Screen
                name="LocaliteReport"
                component={LocaliteReportSymptomsScreen}
                options={{ title: 'Report Symptoms', headerShown: true }}
              />
              <Stack.Screen
                name="WaterStatus"
                component={LocaliteWaterStatusScreen}
                options={{ title: 'Water Status', headerShown: true }}
              />
              <Stack.Screen
                name="Assistance"
                component={LocaliteRequestAssistanceScreen}
                options={{ title: 'Request Help', headerShown: true }}
              />
              <Stack.Screen
                name="LocaliteChat"
                component={LocaliteChatScreen}
              />
              <Stack.Screen
                name="HelplineCall"
                component={HelplineCallScreen}
                options={{ headerShown: false }}
              />
            </>
          )}

          {/* COMMON SCREENS */}
          <Stack.Screen name="Help" component={HelpScreen} />

          <Stack.Screen
            name="SymptomChecker"
            component={SymptomCheckerScreen}
            options={{ headerShown: true }}
          />

          <Stack.Screen name="SymptomReport" component={SymptomReportScreen} options={{ title: 'Report Symptoms', headerShown: true }} />
          <Stack.Screen name="WaterTestReport" component={WaterTestReportScreen} options={{ title: 'Water Quality Test', headerShown: true }} />
          <Stack.Screen name="AssistanceRequests" component={AssistanceRequestsScreen} options={{ title: 'Assistance Requests', headerShown: true }} />
          <Stack.Screen name="Alerts" component={AlertsScreen} options={{ title: 'Alerts', headerShown: true }} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ title: 'Privacy Policy', headerShown: true }} />

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

          <Stack.Screen
            name="RecentWaterTests"
            component={require("../screens/asha/AshaRecentWaterTestsScreen").default}
            options={{ headerShown: true, title: "Recent Water Tests" }}
          />

          <Stack.Screen
            name="WaterTestDetails"
            component={require("../screens/asha/AshaWaterTestDetailsScreen").default}
            options={{ headerShown: true, title: "Test Details" }}
          />

        </>
      )}
    </Stack.Navigator>
  );
}
