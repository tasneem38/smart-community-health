import React, { useRef } from "react";
import { View, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from "react-native";
import { Video } from "expo-av";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

// Style Constants
const COLORS = {
  midnight: "#001F3F",
  gold: "#FFD700",
  white: "#FFFFFF",
  gray: "#f8f9fa",
  textGray: "#666",
};

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
          HERO SECTION
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
          <Text style={styles.brandTitle}>SMART HEALTH</Text>
          <Text style={styles.tagline}>
            Innovating healthcare for rural communities with real-time water quality testing and AI-driven insights.
          </Text>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.getStartedBtn}
              onPress={() => navigation.navigate("Register")}
            >
              <Text style={styles.getStartedBtnText}>Get Started</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.signInBtn}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.signInBtnText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Scroll Down Indicator */}
        <View style={styles.scrollIndicator}>
          <MaterialCommunityIcons
            name="chevron-down"
            size={34}
            color="#fff"
            onPress={scrollToAbout}
          />
        </View>
      </View>

      {/* ---------------------------------------------------------
          ABOUT US SECTION
      ---------------------------------------------------------- */}
      <View style={styles.sectionContainer}>
        <View style={styles.aboutWrapper}>
          <View style={styles.aboutTextContent}>
            <Text style={styles.sectionTitle}>ABOUT US</Text>
            <View style={styles.goldDivider} />
            <Text style={styles.aboutDescription}>
              Smart Health is an offline-first platform designed for rural health surveillance. We connect health workers and villagers to a central monitoring system with AI insights.
            </Text>
          </View>
          <View style={styles.aboutIllustration}>
            <MaterialCommunityIcons name="clipboard-pulse-outline" size={100} color={COLORS.midnight} />
            <MaterialCommunityIcons
              name="shield-check"
              size={30}
              color={COLORS.gold}
              style={{ position: 'absolute', top: 10, right: 10 }}
            />
          </View>
        </View>
      </View>

      {/* ---------------------------------------------------------
          FEATURES SECTION
      ---------------------------------------------------------- */}
      <View style={[styles.sectionContainer, styles.altSection]}>
        <Text style={[styles.sectionTitle, { textAlign: 'center' }]}>CORE FEATURES</Text>
        <View style={[styles.goldDivider, { alignSelf: 'center' }]} />

        <View style={styles.featureGrid}>
          <FeatureCard
            icon="clipboard-text-outline"
            title="Symptom Reporting"
          />
          <FeatureCard
            icon="water-outline"
            title="Water Quality"
          />
          <FeatureCard
            icon="brain"
            title="AI Health Checker"
          />
          <FeatureCard
            icon="alert-octagon-outline"
            title="Outbreak Alerts"
          />
          <FeatureCard
            icon="wifi-off"
            title="Offline Support"
          />
          <FeatureCard
            icon="hand-heart-outline"
            title="Local Assistance"
          />
        </View>
      </View>

      {/* Footer / Info Section */}
      <View style={styles.footerInfo}>
        <Text style={styles.footerText}>© 2026 Smart Health Initiative</Text>
      </View>

    </ScrollView>
  );
}

function FeatureCard({ icon, title }: { icon: any; title: string }) {
  return (
    <View style={styles.featureCard}>
      <View style={styles.cardHeader} />
      <View style={styles.cardContent}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name={icon} size={32} color={COLORS.midnight} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  /* HERO */
  heroContainer: {
    width,
    height: height * 0.45,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 31, 63, 0.7)",
  },
  heroContent: {
    paddingHorizontal: 30,
    alignItems: "center",
  },
  brandTitle: {
    color: COLORS.gold,
    fontSize: 48,
    fontWeight: "900",
    marginBottom: 10,
    letterSpacing: 2,
    textAlign: "center",
  },
  tagline: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
    fontWeight: "500",
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  getStartedBtn: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  getStartedBtnText: {
    color: COLORS.midnight,
    fontSize: 16,
    fontWeight: "700",
  },
  signInBtn: {
    borderColor: COLORS.gold,
    borderWidth: 1.5,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 25,
  },
  signInBtnText: {
    color: COLORS.gold,
    fontSize: 16,
    fontWeight: "700",
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: 20,
  },

  /* ABOUT */
  sectionContainer: {
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  aboutWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
  },
  aboutTextContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.midnight,
    marginBottom: 8,
  },
  goldDivider: {
    width: 40,
    height: 3,
    backgroundColor: COLORS.gold,
    marginBottom: 16,
  },
  aboutDescription: {
    fontSize: 14,
    color: COLORS.textGray,
    lineHeight: 22,
  },
  aboutIllustration: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* FEATURES */
  altSection: {
    backgroundColor: "#F9F9F9",
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
    marginTop: 20,
  },
  featureCard: {
    width: (width - 63) / 2, // 2 columns
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 10,
    overflow: 'hidden',
  },
  cardHeader: {
    height: 40,
    backgroundColor: COLORS.midnight,
  },
  cardContent: {
    padding: 15,
    alignItems: 'center',
    paddingBottom: 25,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
    borderWidth: 4,
    borderColor: '#fff',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.midnight,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
  },

  /* FOOTER */
  footerInfo: {
    paddingVertical: 30,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerText: {
    fontSize: 12,
    color: "#888",
  },
});

