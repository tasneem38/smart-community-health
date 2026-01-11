import React from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import { Text, Card, Button } from "react-native-paper";

export default function LocaliteHomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>

      <Card style={styles.card}>
        <Card.Content>
          <View style={{ alignItems: "center" }}>
            <Image
              source={require("../../../assets/images/logo.jpg")}
              style={styles.logo}
            />
            <Text style={styles.heading}>Welcome to Smart Health</Text>
            <Text style={styles.sub}>
              Stay informed. Stay healthy. Your community health matters.
            </Text>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.buttons}>
        <Button
          mode="contained"
          icon="clipboard-text"
          style={styles.actionButton}
          onPress={() => navigation.navigate("LocaliteReport")}
        >
          Report Symptoms
        </Button>

        <Button
          mode="contained"
          icon="alert-circle"
          style={styles.actionButton}
          onPress={() => navigation.navigate("LocaliteAlerts")}
        >
          View Alerts
        </Button>

        <Button
          mode="contained"
          icon="water"
          style={styles.actionButton}
          onPress={() => navigation.navigate("WaterStatus")}
        >
          Water Status
        </Button>

        <Button
          mode="contained"
          icon="hand-heart"
          style={styles.actionButton}
          onPress={() => navigation.navigate("Assistance")}
        >
          Request Assistance
        </Button>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#F4FAFF" },
  logo: { width: 80, height: 80, borderRadius: 10, marginBottom: 10 },
  heading: { fontSize: 24, fontWeight: "800", color: "#0A4D68", textAlign: "center" },
  sub: { textAlign: "center", marginTop: 6, color: "#555" },
  card: { borderRadius: 18, marginBottom: 18, paddingVertical: 8 },
  buttons: { marginTop: 10 },
  actionButton: { marginVertical: 6, paddingVertical: 6, borderRadius: 10 },
});
