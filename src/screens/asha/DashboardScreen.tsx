import React, { useContext } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, Avatar, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../store/authContext';

export default function DashboardScreen({ navigation }: any) {
  const { state } = useContext(AuthContext);
  const { t } = useTranslation();
  const user = state.user;
  const role = user?.role;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* -------------------------------------------
          HERO SECTION
      -------------------------------------------- */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{t('hello')}, {user?.name?.split(' ')[0]}! 👋</Text>
            <Text style={styles.subGreeting}>
              {role === 'ASHA' ? t('role_asha') : t('role_member')}
            </Text>
          </View>
          <Avatar.Image
            size={50}
            source={require('../../../assets/images/profile.jpg')}
            style={styles.avatar}
          />
        </View>

        {/* Quick Stats or Message */}
        <View style={styles.highlightCard}>
          <MaterialCommunityIcons name="shield-check" size={24} color="#FFD700" />
          <Text style={styles.highlightText}>
            {t('community_status')}: <Text style={{ fontWeight: 'bold', color: '#FFD700' }}>{t('safe')}</Text>
          </Text>
        </View>
      </View>

      {/* -------------------------------------------
          CONTENT
      -------------------------------------------- */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('quick_actions')}</Text>

        {/* ASHA ACTIONS */}
        {role === 'ASHA' && (
          <>
            <ActionRow
              title={t('report_symptoms')}
              subtitle={t('sub_report_symptoms')}
              icon="clipboard-list"
              color="#4CAF50"
              onPress={() => navigation.navigate('SymptomReport')}
            />
            <ActionRow
              title={t('report_water_test')}
              subtitle={t('sub_water_test')}
              icon="water-check"
              color="#2196F3"
              onPress={() => navigation.navigate('WaterTestReport')}
            />
            <ActionRow
              title="Recent Water Tests"
              subtitle="View history & AI insights"
              icon="history"
              color="#607D8B"
              onPress={() => navigation.navigate('RecentWaterTests')}
            />
            <ActionRow
              title={t('alerts')}
              subtitle={t('sub_alerts')}
              icon="alert-circle-outline"
              color="#FF9800"
              onPress={() => navigation.navigate('Alerts')}
            />
          </>
        )}

        {/* COMMON ACTIONS */}
        <ActionRow
          title={t('symptom_checker')}
          subtitle={t('sub_symptom_checker')}
          icon="stethoscope"
          color="#9C27B0"
          onPress={() => navigation.navigate('SymptomChecker')}
        />

        <ActionRow
          title={t('assistance_requests')}
          subtitle={t('sub_assistance_requests')}
          icon="account-alert"
          color="#E91E63"
          onPress={() => navigation.navigate('AssistanceRequests')}
        />
      </View>

    </ScrollView>
  );
}

// -------------------------------------------
//  HELPER COMPONENT: Action Row
// -------------------------------------------
function ActionRow({ title, subtitle, icon, color, onPress }: any) {
  return (
    <TouchableOpacity style={styles.actionRow} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
        <MaterialCommunityIcons name={icon} size={28} color={color} />
      </View>
      <View style={styles.actionInfo}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
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
    backgroundColor: '#001F3F',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  subGreeting: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  avatar: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  highlightText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 14,
  },

  /* SECTION */
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#001F3F',
    marginBottom: 16,
    marginLeft: 4,
  },

  /* ACTION ROW */
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionInfo: {
    flex: 1,
    marginLeft: 16,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
});
