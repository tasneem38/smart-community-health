import React, { useState } from "react";
import { View, StyleSheet, Image } from "react-native";
import { Text, Card, ActivityIndicator } from "react-native-paper";
import { Dropdown } from "react-native-element-dropdown";

import AppInput from "../../components/AppInput";
import AppButton from "../../components/AppButton";
import { registerApi } from "../../api/api";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("LOCALITE");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [village, setVillage] = useState("");

  const [loading, setLoading] = useState(false);

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
      alert("Account created! Please login.");
      navigation.goBack();
    } else {
      alert("Registration failed.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Image
          source={require("../../../assets/images/logo.jpg")}
          style={styles.logo}
        />
        <Text style={styles.smartHealth}>Smart Health</Text>
      </View>

      <Card mode="elevated" style={styles.card}>
        <Card.Content>
          <Text style={styles.screenTitle}>Create Account ✨</Text>
          <Text style={styles.subtitle}>
            Join Smart Health & help keep your community healthy.
          </Text>

          <AppInput label="Full Name" value={name} onChangeText={setName} />

          <AppInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <AppInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Village Field */}
          <AppInput
            label="Village / Area"
            value={village}
            onChangeText={setVillage}
          />

          <Text style={styles.label}>Select Role</Text>
          <Dropdown
            data={roles}
            labelField="label"
            valueField="value"
            placeholder="Select role"
            value={role}
            onChange={(item) => setRole(item.value)}
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
          />

          {loading ? (
            <ActivityIndicator style={{ marginTop: 18 }} />
          ) : (
            <AppButton onPress={doRegister} style={{ marginTop: 14 }}>
              Register
            </AppButton>
          )}

          <AppButton
            mode="text"
            onPress={() => navigation.goBack()}
            style={{ marginTop: 10 }}
          >
            Already have an account? Login
          </AppButton>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E9F5FF",
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
  },
  logo: {
    width: 45,
    height: 45,
    borderRadius: 6,
    marginRight: 10,
  },
  smartHealth: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0A4D68",
  },
  card: {
    borderRadius: 22,
    backgroundColor: "#FFFFFFEE",
    elevation: 8,
    paddingVertical: 10,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
    color: "#0A4D68",
  },
  subtitle: {
    textAlign: "center",
    color: "#555",
    marginBottom: 18,
  },
  label: {
    marginTop: 12,
    marginBottom: 6,
    fontWeight: "700",
    color: "#333",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#B5C6D6",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 50,
    backgroundColor: "#fff",
    marginBottom: 14,
  },
  placeholderStyle: { color: "#999" },
  selectedTextStyle: { color: "#000", fontSize: 16 },
});
