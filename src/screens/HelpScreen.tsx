import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text, Card } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function HelpScreen() {
  return (
    <ScrollView style={styles.container}>

      {/* HEADER */}
      <Text style={styles.title}>Help & Hygiene Awareness</Text>
      <Text style={styles.subtitle}>
        Everything you need to stay safe and report effectively.
      </Text>

      {/* ABOUT SECTION */}
      <SectionCard
        title="About Smart Health"
        icon="information-outline"
        content={[
          "Smart Health helps detect early symptoms of water-borne diseases in rural communities.",
          "It supports ASHA workers, clinics, and community reporters."
        ]}
      />

      {/* HOW TO USE SECTION */}
      <SectionHeader title="How to Use the App" />

      <SectionCard
        title="Dashboard"
        icon="view-dashboard"
        content={[
          "View role-based options.",
          "Submit reports, check alerts, manage settings."
        ]}
      />
      <SectionCard
        title="Report Symptoms"
        icon="clipboard-list-outline"
        content={[
          "Record patient symptoms, age, gender, location, and photos.",
          "Used to detect early outbreaks."
        ]}
      />
      <SectionCard
        title="Water Quality Test"
        icon="water-check"
        content={[
          "Submit water pH, turbidity, bacterial presence, and GPS location.",
          "Helps identify unsafe water sources."
        ]}
      />
      <SectionCard
        title="Alerts"
        icon="alert-outline"
        content={[
          "View local health alerts and outbreak warnings.",
          "Mark alerts as read."
        ]}
      />
      <SectionCard
        title="Offline Queue"
        icon="cloud-off-outline"
        content={[
          "Reports sync automatically when internet returns."
        ]}
      />

      {/* HYGIENE SECTION */}
      <SectionHeader title="Hygiene & Safety Tips" />

      <SectionCard
        title="Safe Drinking Water"
        icon="cup-water"
        content={[
          "Always boil water for 3 minutes before drinking.",
          "Cover water storage containers.",
          "Avoid using unclean wells or tanks."
        ]}
      />
      <SectionCard
        title="Personal Hygiene"
        icon="hand-wash"
        content={[
          "Wash hands before eating.",
          "Keep nails clean.",
          "Avoid open defecation; use proper toilets."
        ]}
      />
      <SectionCard
        title="Food Safety"
        icon="food"
        content={[
          "Eat freshly cooked food.",
          "Wash fruits and vegetables well.",
          "Avoid street food during outbreaks."
        ]}
      />

      {/* WHEN TO SEEK HELP */}
      <SectionHeader title="When to Seek Medical Help" />

      <SectionCard
        title="Seek immediate help if:"
        icon="hospital"
        content={[
          "Severe dehydration.",
          "High fever.",
          "Blood in stool.",
          "Persistent vomiting.",
          "Dizziness or confusion."
        ]}
      />

      {/* EMERGENCY CONTACTS */}
      <SectionHeader title="Emergency Contacts" />

      <SectionCard
        title="Important Numbers"
        icon="phone"
        content={[
          "Local Health Center — 108",
          "Ambulance — 112",
          "ASHA Supervisor — 8765493265",
          "Water Department — 5674986432"
        ]}
      />

      {/* SUPPORT */}
      <SectionHeader title="Support" />

      <SectionCard
        title="Need Technical Help?"
        icon="lifebuoy"
        content={[
          "Contact your supervisor or regional health coordinator.",
          "Report app issues via your support channel."
        ]}
      />

    </ScrollView>
  );
}

/* ------------------------- COMPONENTS ------------------------- */

function SectionHeader({ title }: { title: string }) {
  return (
    <Text style={styles.sectionHeader}>{title}</Text>
  );
}

function SectionCard({
  title,
  icon,
  content,
}: {
  title: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  content: string[];
}) {
  return (
    <Card style={styles.card} mode="elevated">
      <Card.Title
        title={title}
        titleStyle={styles.cardTitle}
        left={() => (
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name={icon} size={26} color="#fff" />
          </View>
        )}
      />
      <Card.Content>
        {content.map((line, idx) => (
          <Text key={idx} style={styles.cardText}>
            • {line}
          </Text>
        ))}
      </Card.Content>
    </Card>
  );
}

/* --------------------------- STYLES --------------------------- */

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F2FAFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    color: "#0A4D68",
    marginTop: 10,
  },
  subtitle: {
    textAlign: "center",
    color: "#555",
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 10,
    color: "#0A4D68",
  },
  card: {
    borderRadius: 16,
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  cardText: {
    fontSize: 15,
    marginVertical: 3,
    color: "#444",
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#0A4D68",
    justifyContent: "center",
    alignItems: "center",
  },
});
