import React from "react";
import { View, StyleSheet } from "react-native";
import { Video } from "expo-av";
import { Text } from "react-native-paper";
import AppButton from "../components/AppButton";

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Background Video */}
      <Video
        source={require("../../assets/videos/health-bg.mp4")}
        rate={1.0}
        volume={1.0}
        isMuted={true}
        resizeMode={"cover" as any}
        shouldPlay={true}
        isLooping={true}
        style={StyleSheet.absoluteFill}
      />

      {/* Overlay */}
      <View style={styles.overlay} />

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to</Text>
        <Text style={styles.mainTitle}>Smart Health</Text>

        <AppButton 
          style={styles.button} 
          onPress={() => navigation.navigate("Login")}
        >
          Sign In
        </AppButton>

        <AppButton 
          style={styles.button} 
          onPress={() => navigation.navigate("Register")}
        >
          Sign Up
        </AppButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "300",
  },
  mainTitle: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "800",
    marginBottom: 40,
  },
  button: {
    width: "80%",
    marginVertical: 10,
  },
});
