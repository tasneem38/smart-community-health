import React, { useContext } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../store/authContext';

export default function DashboardScreen({ navigation }: any) {
  const { state } = useContext(AuthContext);
  const role = state.user?.role;

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome,</Text>
          <Text style={styles.nameText}>{state.user?.name}</Text>
        </View>

        <Avatar.Image
          size={50}
          source={require('../../assets/images/profile.jpg')}
        />
      </View>

      {/* ROLE BADGE */}
      <View style={styles.roleBadge}>
        <Text style={styles.roleText}>
          {role === "LOCALITE" ? "Localite User" : `${role} Worker`}
        </Text>
      </View>

      {/* TILES */}
      <View style={styles.grid}>

        {/* ASHA */}
        {role === 'ASHA' && (
          <>
            <DashboardTile
              title="Report Symptoms"
              icon="clipboard-list"
              color="#0A4D68"
              onPress={() => navigation.navigate('Symptoms')}
            />
            <DashboardTile
              title="Water Quality Test"
              icon="water-check"
              color="#3AA6B9"
              onPress={() => navigation.navigate('WaterTest')}
            />
            <DashboardTile
              title="Alerts"
              icon="alert-circle-outline"
              color="#D9534F"
              onPress={() => navigation.navigate('Alerts')}
            />
          </>
        )}

        {/* CLINIC */}
        {role === 'CLINIC' && (
          <>
            <DashboardTile
              title="View Alerts"
              icon="alert-circle-outline"
              color="#D9534F"
              onPress={() => navigation.navigate('ClinicAlerts')}
            />
            <DashboardTile
              title="Offline Queue"
              icon="cloud-off-outline"
              color="#6C757D"
              onPress={() => navigation.navigate('ClinicOfflineQueue')}
            />
            <DashboardTile
              title="Health Insights"
              icon="chart-line"
              color="#3AA6B9"
              onPress={() => navigation.navigate('ClinicHealthInsights')}
            />
            <DashboardTile
              title="Pending Reviews"
              icon="clipboard-text-search-outline"
              color="#0A4D68"
              onPress={() => navigation.navigate('ClinicPendingReviews')}
            />
          </>
        )}

        {/* LOCALITE */}
        {role === 'LOCALITE' && (
          <>
            <DashboardTile
              title="Report Symptoms"
              icon="account-heart-outline"
              color="#0A4D68"
              onPress={() => navigation.navigate('LocaliteReport')}
            />
            <DashboardTile
              title="Nearby Alerts"
              icon="alert"
              color="#D9534F"
              onPress={() => navigation.navigate('LocaliteAlerts')}
            />
            <DashboardTile
              title="Health Tips"
              icon="hand-heart"
              color="#4CAF50"
              onPress={() => navigation.navigate('Help')}
            />
            <DashboardTile
              title="Request Assistance"
              icon="account-plus"
              color="#0087B8"
              onPress={() => navigation.navigate('Assistance')}
            />
          </>
        )}

        {/* COMMON */}
        <DashboardTile
          title="Settings"
          icon="cog"
          color="#556EE6"
          onPress={() => navigation.navigate('Settings')}
        />

        <DashboardTile
          title="Help"
          icon="help-circle-outline"
          color="#20B2AA"
          onPress={() => navigation.navigate('Help')}
        />

        {/* AI FEATURES (SymptomChecker kept for all where applicable) */}
        <DashboardTile
          title="Symptom Checker"
          icon="stethoscope"
          color="#0087B8"
          onPress={() => navigation.navigate('SymptomChecker')}
        />
      </View>
    </ScrollView>
  );
}

function DashboardTile({ title, icon, color, onPress }: any) {
  return (
    <Pressable style={styles.tile} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: color }]}>
        <MaterialCommunityIcons name={icon} size={28} color="#fff" />
      </View>
      <Text style={styles.tileText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: '#F5FAFF',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  welcomeText: {
    fontSize: 18,
    color: '#666',
  },

  nameText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0A4D68',
  },

  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#D6EAF8',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 18,
  },

  roleText: {
    fontWeight: '600',
    color: '#0A4D68',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  tile: {
    width: '48%',
    height: 150,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    elevation: 5,
    justifyContent: 'flex-end',
  },

  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  tileText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
});
