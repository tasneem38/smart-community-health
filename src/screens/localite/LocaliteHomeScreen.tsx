import React, { useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../store/authContext';

export default function LocaliteHomeScreen({ navigation }: any) {
  const { state } = useContext(AuthContext);
  const user = state.user;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>

      {/* -------------------------------------------
          HERO HEADER
      -------------------------------------------- */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeLabel}>Welcome Back,</Text>
            <Text style={styles.username}>{user?.name?.split(' ')[0]}</Text>
          </View>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="heart-pulse" size={24} color="#001F3F" />
          </View>
        </View>

        {/* WATER STATUS CARD (Prominent) */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <MaterialCommunityIcons name="water" size={32} color="#fff" />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.statusTitle}>Water Quality</Text>
              <Text style={styles.statusValue}>Good</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="check-circle" size={24} color="#FFD700" />
        </View>
      </View>

      {/* -------------------------------------------
          ACTIONS LIST
      -------------------------------------------- */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>I want to...</Text>

        <ActionItem
          title="Report Symptoms"
          desc="Not feeling well? Let us know."
          icon="clipboard-text"
          color="#D9534F"
          onPress={() => navigation.navigate("LocaliteReport")}
        />

        <ActionItem
          title="View Alerts"
          desc="See health alerts in your area"
          icon="bell-ring"
          color="#FF9800"
          onPress={() => navigation.navigate("LocaliteAlerts")}
        />

        <ActionItem
          title="Check Water Details"
          desc="View detailed water quality report"
          icon="water-percent"
          color="#2196F3"
          onPress={() => navigation.navigate("WaterStatus")}
        />

        <ActionItem
          title="Request Assistance"
          desc="Get help from an ASHA worker"
          icon="hand-heart"
          color="#4CAF50"
          onPress={() => navigation.navigate("Assistance")}
        />

      </View>

    </ScrollView>
  );
}

function ActionItem({ title, desc, icon, color, onPress }: any) {
  return (
    <TouchableOpacity style={styles.actionItem} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
        <MaterialCommunityIcons name={icon} size={26} color={color} />
      </View>
      <View style={{ flex: 1, marginLeft: 16 }}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDesc}>{desc}</Text>
      </View>
      <MaterialCommunityIcons name="arrow-right" size={20} color="#ccc" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },

  /* HEADER */
  header: {
    backgroundColor: '#001F3F', // Midnight Blue
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 6,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeLabel: {
    fontSize: 14,
    color: '#FFD700', // Gold
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  username: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* STATUS CARD */
  statusCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusTitle: {
    color: '#B0C4DE',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  statusValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },

  /* SECTION */
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#001F3F',
    marginBottom: 16,
  },

  /* ACTION ITEM */
  actionItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  actionDesc: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
});
