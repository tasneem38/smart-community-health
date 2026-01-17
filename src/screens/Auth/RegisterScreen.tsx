import React, { useState } from "react";
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Text, Card, ActivityIndicator, HelperText } from "react-native-paper";
import { Dropdown } from "react-native-element-dropdown";
import { MaterialCommunityIcons } from '@expo/vector-icons';

import AppInput from "../../components/AppInput";
import AppButton from "../../components/AppButton";
import { registerApi } from "../../api/api";

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("LOCALITE");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [village, setVillage] = useState("");

  const [loading, setLoading] = useState(false);
  const [isFocus, setIsFocus] = useState(false);

  const roles = [
    { label: "Localite (Citizen)", value: "LOCALITE" },
    { label: "ASHA Worker", value: "ASHA" },
    { label: "Clinic Staff", value: "CLINIC" }
  ];

  const doRegister = async () => {
    if (!name || !email || !password || !village) {
      alert("Please fill all fields including village.");
      return;
    }

    setLoading(true);
    const res = await registerApi({ name, email, password, role, village });
    setLoading(false);

    if (res.ok) {
      alert("Account created successfully! Please login.");
      navigation.goBack();
    } else {
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>

          {/* Header */}
          <View style={styles.headerContainer}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="account-plus" size={42} color="#001F3F" />
            </View>
            <Text style={styles.appTitle}>Smart Health</Text>
            <Text style={styles.tagline}>Create Your Account</Text>
          </View>

          {/* Form Card */}
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>

              <Text style={styles.sectionHeader}>Personal Info</Text>

              <AppInput
                label="Full Name"
                value={name}
                onChangeText={setName}
                style={styles.input}
              />

              <AppInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />

              <AppInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
              />
              <HelperText type={password.length > 0 && password.length < 6 ? "error" : "info"} visible={true}>
                Password must be at least 6 characters long.
              </HelperText>

              <AppInput
                label="Village / Area"
                value={village}
                onChangeText={setVillage}
                style={styles.input}
              />

              <Text style={styles.sectionHeader}>Role Selection</Text>
              <Dropdown
                style={[styles.dropdown, isFocus && { borderColor: '#001F3F' }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                iconStyle={styles.iconStyle}
                data={roles}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? 'Select Role' : '...'}
                value={role}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  setRole(item.value);
                  setIsFocus(false);
                }}
              />

              {loading ? (
                <ActivityIndicator
                  animating={true}
                  color="#001F3F"
                  size="large"
                  style={{ marginTop: 20 }}
                />
              ) : (
                <AppButton
                  style={styles.registerButton}
                  labelStyle={styles.registerButtonLabel}
                  onPress={doRegister}
                >
                  Register
                </AppButton>
              )}

              <View style={styles.footerRow}>
                <Text style={styles.footerText}>Already have an account?</Text>
                <AppButton
                  mode="text"
                  onPress={() => navigation.navigate('Login')}
                  labelStyle={styles.loginLink}
                >
                  Log In
                </AppButton>
              </View>

            </Card.Content>
          </Card>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#001F3F", // Midnight Blue
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    paddingTop: 40,
  },

  /* Header */
  headerContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFD700', // Soft Gold
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
  },
  tagline: {
    fontSize: 14,
    color: "#FFD700", // Gold
    marginTop: 4,
    fontWeight: "600",
    letterSpacing: 1,
  },

  /* Card */
  card: {
    borderRadius: 24,
    backgroundColor: "#fff",
    elevation: 8,
  },
  cardContent: {
    paddingVertical: 24,
    paddingHorizontal: 12,
  },
  input: {
    backgroundColor: '#F7F9FC',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 6,
  },

  /* Dropdown */
  dropdown: {
    height: 50,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#F7F9FC',
    marginBottom: 20,
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#999',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#333',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },

  /* Buttons */
  registerButton: {
    marginTop: 10,
    backgroundColor: "#001F3F",
    borderRadius: 12,
    paddingVertical: 6,
  },
  registerButtonLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: "#FFD700",
  },

  /* Footer */
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    fontSize: 15,
    color: "#555",
  },
  loginLink: {
    fontSize: 16,
    fontWeight: "800",
    color: "#001F3F",
  },
});
