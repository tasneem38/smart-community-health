import React, { useRef } from "react";
import { View, StyleSheet, Dimensions, ScrollView, Image } from "react-native";
import { Video } from "expo-av";
import { Text, Button, Card, Avatar } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppButton from "../components/AppButton";

const { width, height } = Dimensions.get("window");

export default function HomeScreen({ navigation }: any) {
  const scrollRef = useRef<ScrollView>(null);

  const scrollToAbout = () => {
    scrollRef.current?.scrollTo({ y: height, animated: true });
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      bounces={false}
      showsVerticalScrollIndicator={false}
    >
      {/* ---------------------------------------------------------
          HERO SECTION (Full Screen)
      ---------------------------------------------------------- */}
      <View style={styles.heroContainer}>
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
        <View style={styles.overlay} />

        <View style={styles.heroContent}>
          <View style={styles.logoRow}>
            {/* Optional: Add Logo here if available */}
            {/* <Image source={require("../../assets/images/logo.png")} style={styles.heroLogo} /> */}
          </View>

          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.brandTitle}>Smart Health</Text>
          <Text style={styles.tagline}>
            Empowering communities with AI-driven health insights and real-time monitoring.
          </Text>

          <View style={styles.buttonGroup}>
            <AppButton
              style={styles.mainButton}
              onPress={() => navigation.navigate("Login")}
            >
              Sign In
            </AppButton>
            <AppButton
              style={styles.mainButton}
              onPress={() => navigation.navigate("Register")}
            >
              Get Started
            </AppButton>
          </View>
        </View>

        {/* Scroll Down Indicator */}
        <View style={styles.scrollIndicator}>
          <Text style={{ color: '#fff', fontSize: 12, marginBottom: 4 }}>Learn More</Text>
          <MaterialCommunityIcons
            name="chevron-down"
            size={30}
            color="#fff"
            onPress={scrollToAbout}
          />
        </View>
      </View>

      {/* ---------------------------------------------------------
          ABOUT SECTION
      ---------------------------------------------------------- */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>About SmartHealth</Text>
        <View style={styles.divider} />

        <Text style={styles.sectionText}>
          SmartHealth is a next-generation platform designed to bridge the gap between rural communities and advanced healthcare technology.
        </Text>
        <Text style={styles.sectionText}>
          By combining real-time water quality testing, symptom reporting, and AI-powered outbreak detection, we ensure that every citizen stays informed and protected.
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24/7</Text>
            <Text style={styles.statLabel}>Monitoring</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>AI</Text>
            <Text style={styles.statLabel}>Powered</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statLabel}>Secure</Text>
          </View>
        </View>
      </View>

      {/* ---------------------------------------------------------
          FEATURES SECTION
      ---------------------------------------------------------- */}
      <View style={[styles.sectionContainer, styles.altSection]}>
        <Text style={styles.sectionTitle}>Key Features</Text>
        <View style={[styles.divider, { backgroundColor: '#fff' }]} />

        <View style={styles.featureGrid}>
          <FeatureCard
            icon="water-check"
            title="Water Quality"
            desc="Real-time turbidity and pH testing to ensure safe drinking water."
          />
          <FeatureCard
            icon="doctor"
            title="Symptom Check"
            desc="Report symptoms instantly and get AI-driven health advice."
          />
          <FeatureCard
            icon="alert-decagram"
            title="Outbreak Alerts"
            desc="Early warning system for potential disease clusters."
          />
          <FeatureCard
            icon="wifi-off"
            title="Offline Mode"
            desc="Works seamlessly even without internet connectivity."
          />
        </View>
      </View>

      {/* ---------------------------------------------------------
          CTA / FOOTER
      ---------------------------------------------------------- */}
      <View style={styles.footer}>
        <Text style={styles.footerBrand}>SmartHealth</Text>
        <Text style={styles.footerText}>© 2026 Smart Health Initiative.</Text>
        <Text style={styles.footerText}>All rights reserved.</Text>
      </View>

    </ScrollView>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <View style={styles.featureCard}>
      <View style={styles.featureIconBox}>
        <MaterialCommunityIcons name={icon} size={32} color="#001F3F" />
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDesc}>{desc}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  /* HERO */
  heroContainer: {
    width,
    height, // Full screen
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 31, 63, 0.65)", // Midnight Blue overlay
  },
  heroContent: {
    width: "100%",
    paddingHorizontal: 24,
    alignItems: "center",
  },
  logoRow: {
    marginBottom: 20,
  },
  heroLogo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  welcomeText: {
    color: "#FFD700", // Soft Gold
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  brandTitle: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "900",
    marginBottom: 16,
    textAlign: "center",
  },
  tagline: {
    color: "#E0E0E0",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
    maxWidth: "90%",
  },
  buttonGroup: {
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  mainButton: {
    width: "80%",
    backgroundColor: "#FFD700",
  },
  outlineButton: {
    width: "80%",
    borderColor: "#fff",
    borderWidth: 1.5,
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },

  /* SECTIONS */
  sectionContainer: {
    paddingVertical: 60,
    paddingHorizontal: 24,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  altSection: {
    backgroundColor: "#001F3F", // Midnight Blue
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#001F3F",
    marginBottom: 10,
  },
  divider: {
    width: 60,
    height: 4,
    backgroundColor: "#FFD700",
    borderRadius: 2,
    marginBottom: 24,
  },
  sectionText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 24,
    maxWidth: 600,
  },

  /* STATS */
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 30,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: "#001F3F",
  },
  statLabel: {
    fontSize: 14,
    color: "#777",
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  /* FEATURES */
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    width: '100%',
  },
  featureCard: {
    width: '45%',
    minWidth: 150,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 3,
  },
  featureIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#001F3F',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },

  /* FOOTER */
  footer: {
    backgroundColor: "#F0F4F8",
    padding: 40,
    alignItems: "center",
  },
  footerBrand: {
    fontSize: 20,
    fontWeight: "800",
    color: "#001F3F",
    marginBottom: 10,
  },
  footerText: {
    color: "#888",
    fontSize: 12,
  },
});
