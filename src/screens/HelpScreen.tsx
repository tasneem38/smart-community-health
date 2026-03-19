import React, { useState } from "react";
import { ScrollView, StyleSheet, View, Linking, TouchableOpacity, StatusBar } from "react-native";
import { Text, Card, List, Button, Divider, Avatar, IconButton } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function HelpScreen({ navigation }: any) {
  const [expandedSection, setExpandedSection] = useState<string | null>("guide");

  const handlePress = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const callNumber = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#001F3F" barStyle="light-content" />
      {/* -------------------------------------------
          HEADER
      -------------------------------------------- */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-left"
            iconColor="#fff"
            size={24}
            onPress={() => navigation.goBack()}
            style={{ marginLeft: -10, marginRight: 4 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Help Center</Text>
            <Text style={styles.headerSubtitle}>Hygiene, Safety & Support</Text>
          </View>
          <View style={styles.headerIconCircle}>
            <MaterialCommunityIcons name="lifebuoy" size={32} color="#001F3F" />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* -------------------------------------------
            EMERGENCY SECTION (Prominent)
        -------------------------------------------- */}
        <Card style={styles.emergencyCard}>
          <Card.Content>
            <View style={styles.emergencyHeader}>
              <MaterialCommunityIcons name="ambulance" size={28} color="#D32F2F" />
              <Text style={styles.emergencyTitle}>Emergency Contacts</Text>
            </View>
            <Divider style={{ marginVertical: 10 }} />
            <View style={styles.contactRow}>
              <ContactButton label="Ambulance" number="108" onPress={() => callNumber('108')} />
              <ContactButton label="Health Center" number="104" onPress={() => callNumber('104')} />
            </View>
            <View style={[styles.contactRow, { marginTop: 10 }]}>
              <ContactButton label="Supervisor" number="8765493265" onPress={() => callNumber('8765493265')} outline />
            </View>
          </Card.Content>
        </Card>

        {/* -------------------------------------------
            ACCORDION SECTIONS
        -------------------------------------------- */}
        <List.Section style={styles.accordionSection}>

          {/* USER GUIDE */}
          <List.Accordion
            title="App Guide"
            left={props => <List.Icon {...props} icon="cellphone-information" color="#001F3F" />}
            expanded={expandedSection === 'guide'}
            onPress={() => handlePress('guide')}
            style={styles.accordionHeader}
            titleStyle={styles.accordionTitle}
          >
            <InfoItem text="Use 'Report Symptoms' to log potential disease cases in your village." />
            <InfoItem text="Submit 'Water Tests' to track pH and turbidity levels of local sources." />
            <InfoItem text="Check 'Alerts' daily for outbreak warnings in your area." />
          </List.Accordion>

          <Divider />

          {/* HYGIENE TIPS */}
          <List.Accordion
            title="Hygiene & Safety"
            left={props => <List.Icon {...props} icon="hand-wash" color="#001F3F" />}
            expanded={expandedSection === 'hygiene'}
            onPress={() => handlePress('hygiene')}
            style={styles.accordionHeader}
            titleStyle={styles.accordionTitle}
          >
            <InfoItem text="Boil water for at least 3 minutes before drinking." />
            <InfoItem text="Wash hands with soap before meals and after using the toilet." />
            <InfoItem text="Keep water storage containers covered and clean." />
          </List.Accordion>

          <Divider />

          {/* SYMPTOM AWARENESS */}
          <List.Accordion
            title="When to Seek Help"
            left={props => <List.Icon {...props} icon="hospital-box" color="#D32F2F" />}
            expanded={expandedSection === 'symptoms'}
            onPress={() => handlePress('symptoms')}
            style={styles.accordionHeader}
            titleStyle={styles.accordionTitle}
          >
            <InfoItem text="High Fever (>102°F) persisting for more than 2 days." icon="thermometer-alert" color="#D32F2F" />
            <InfoItem text="Severe Dehydration (dry mouth, no urine)." icon="water-off" color="#D32F2F" />
            <InfoItem text="Difficulty Breathing or Chest Pain." icon="heart-pulse" color="#D32F2F" />
          </List.Accordion>

        </List.Section>

        {/* -------------------------------------------
            SUPPORT INFO
        -------------------------------------------- */}
        <View style={styles.supportBox}>
          <MaterialCommunityIcons name="email-outline" size={24} color="#666" />
          <Text style={styles.supportText}>
            For technical issues, contact <Text style={{ fontWeight: 'bold' }}>support@smarthealth.org</Text>
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

function ContactButton({ label, number, onPress, outline }: any) {
  return (
    <TouchableOpacity
      style={[
        styles.contactBtn,
        outline && styles.contactBtnOutline
      ]}
      onPress={onPress}
    >
      <MaterialCommunityIcons
        name="phone"
        size={18}
        color={outline ? "#001F3F" : "#fff"}
        style={{ marginRight: 8 }}
      />
      <View>
        <Text style={[styles.contactBtnText, outline && { color: "#001F3F" }]}>{label}</Text>
        <Text style={[styles.contactBtnSub, outline && { color: "#555" }]}>{number}</Text>
      </View>
    </TouchableOpacity>
  );
}

function InfoItem({ text, icon = "check-circle-outline", color = "#555" }: any) {
  return (
    <View style={styles.infoRow}>
      <MaterialCommunityIcons name={icon} size={20} color={color} style={{ marginRight: 12, marginTop: 2 }} />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  /* HEADER */
  headerContainer: {
    backgroundColor: '#001F3F',
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFD700',
    marginTop: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },

  /* EMERGENCY CARD */
  emergencyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    marginTop: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#D32F2F',
    elevation: 4,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D32F2F',
    marginLeft: 10,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  contactBtn: {
    flex: 1,
    backgroundColor: '#D32F2F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 2,
  },
  contactBtnOutline: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#001F3F',
  },
  contactBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  contactBtnSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
  },

  /* ACCORDION */
  accordionSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  accordionHeader: {
    backgroundColor: '#fff',
    paddingVertical: 4,
  },
  accordionTitle: {
    color: '#001F3F',
    fontWeight: '700',
    fontSize: 16,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FAFAFA',
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    lineHeight: 20,
  },

  /* SUPPORT */
  supportBox: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
});
