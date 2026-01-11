import React, { useContext } from "react";
import { View, StyleSheet, Image } from "react-native";
import { Text, Button, Card, Divider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AuthContext } from "../store/authContext";
import i18n from "../i18n/i18n";

export default function SettingsScreen({ navigation }: any) {
  const { logout, state } = useContext(AuthContext);

  const changeLang = (lng: string) => i18n.changeLanguage(lng);

  return (
    <View style={styles.container}>
      {/* --------------------------------------------------- */}
      {/* 🔵 PROFILE HEADER */}
      {/* --------------------------------------------------- */}
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Image
            source={require("../../assets/images/profile.jpg")}
            style={styles.profileImage}
          />
          <View style={{ marginLeft: 16 }}>
            <Text style={styles.profileName}>{state.user?.name}</Text>
            <Text style={styles.profileRole}>{state.user?.role} User</Text>
          </View>
        </Card.Content>
      </Card>

      {/* --------------------------------------------------- */}
      {/* ⚙️ SETTINGS CARD */}
      {/* --------------------------------------------------- */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>
            <MaterialCommunityIcons name="translate" size={20} /> Language
          </Text>

          <Button mode="outlined" onPress={() => changeLang("en")} style={styles.langButton}>
            English
          </Button>
          <Button mode="outlined" onPress={() => changeLang("hi")} style={styles.langButton}>
            हिन्दी
          </Button>

          <Divider style={{ marginVertical: 14 }} />

          <Text style={styles.sectionTitle}>
            <MaterialCommunityIcons name="account-circle" size={20} /> Account
          </Text>

          <Button
            mode="contained"
            style={styles.logoutButton}
            onPress={() => {
              logout();
              navigation.replace("Home");
            }}
          >
            <MaterialCommunityIcons name="logout" size={18} /> Logout
          </Button>
        </Card.Content>
      </Card>

      <Text style={styles.versionText}>SmartHealth v1.0.0</Text>
    </View>
  );
}

/* ---------------------------------------------------
   🖌️ STYLES
--------------------------------------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F9FF",
    padding: 20,
  },

  /* PROFILE HEADER */
  profileCard: {
    marginBottom: 20,
    borderRadius: 20,
    elevation: 4,
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 40,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0A4D68",
  },
  profileRole: {
    color: "#666",
    fontSize: 14,
  },

  /* SETTINGS CARD */
  card: {
    paddingVertical: 10,
    borderRadius: 18,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 10,
    color: "#0A4D68",
  },

  langButton: {
    marginBottom: 8,
  },

  logoutButton: {
    backgroundColor: "#D9534F",
    borderRadius: 10,
    paddingVertical: 6,
    marginTop: 4,
  },

  versionText: {
    marginTop: 20,
    textAlign: "center",
    color: "#999",
    fontSize: 12,
  },
});

