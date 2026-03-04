import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Dimensions, Animated } from "react-native";
import { Text, Card, ActivityIndicator, HelperText } from "react-native-paper";
import { Dropdown } from "react-native-element-dropdown";
import { MaterialCommunityIcons } from '@expo/vector-icons';

import AppInput from "../../components/AppInput";
import AppButton from "../../components/AppButton";
import { registerApi } from "../../api/api";

const { width } = Dimensions.get('window');

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("LOCALITE");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [village, setVillage] = useState("");

  const [loading, setLoading] = useState(false);
  const [isFocus, setIsFocus] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const roles = [
    { label: "Localite (Citizen)", value: "LOCALITE" },
    { label: "ASHA Worker", value: "ASHA" },
    { label: "Clinic Staff", value: "Clinic" }
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
      const errorMsg = res.error || "Registration failed. Please try again.";
      alert(`Registration failed: ${errorMsg}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Decorative Background Elements */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
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
                <HelperText type={password.length > 0 && password.length < 6 ? "error" : "info"} visible={true} style={styles.helper}>
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
                  style={[styles.dropdown, isFocus && { borderColor: '#001F3F', borderWidth: 1.5 }]}
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
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#001F3F", // Midnight Blue
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },

  /* Decorative Background */
  bgCircle1: {
    position: 'absolute',
    top: -40,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#FFD700',
    opacity: 0.1,
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -20,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FFD700',
    opacity: 0.07,
  },
  bgCircle3: {
    position: 'absolute',
    top: '25%',
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    opacity: 0.04,
  },

  /* Header */
  headerContainer: {
    alignItems: "center",
    marginBottom: 35,
  },
  iconCircle: {
    width: 85,
    height: 85,
    borderRadius: 43,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: "#FFD700",
    marginTop: 8,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  /* Card */
  card: {
    borderRadius: 32,
    backgroundColor: "#fff",
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    borderWidth: 1,
    borderColor: 'rgba(0, 31, 63, 0.05)',
  },
  cardContent: {
    paddingVertical: 25,
    paddingHorizontal: 15,
  },
  input: {
    backgroundColor: '#F8FAFC',
    marginBottom: 6,
  },
  helper: {
    marginBottom: 10,
    marginTop: -4,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#001F3F',
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 15,
    letterSpacing: 1,
    opacity: 0.6,
  },

  /* Dropdown */
  dropdown: {
    height: 52,
    borderColor: '#E0E7ED',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    marginBottom: 25,
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#999',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  iconStyle: {
    width: 22,
    height: 22,
  },

  /* Buttons */
  registerButton: {
    marginTop: 15,
    backgroundColor: "#001F3F",
    borderRadius: 16,
    paddingVertical: 8,
    elevation: 5,
  },
  registerButtonLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: "#FFD700",
  },

  /* Footer */
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
  },
  footerText: {
    fontSize: 15,
    color: "#666",
  },
  loginLink: {
    fontSize: 16,
    fontWeight: "900",
    color: "#001F3F",
  },
});
