import React, { useEffect, useState, useContext } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Searchbar, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
// @ts-ignore
import { API_URL } from '../../api/postgres/client';
import { AuthContext } from '../../store/authContext';
import { fetchAlerts } from "../../api/api";
import { getAlertsFromDB, addAlert } from "../../db/db";
import AlertCard from "../../components/AlertCard";

export default function AlertsScreen() {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("All"); // All, High, Medium, Low
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    if (!refreshing) setLoading(true);
    try {
      const remote = await fetchAlerts();
      if (remote && remote.length > 0) {
        remote.forEach((a: any) => addAlert({ ...a, read: a.read ? 1 : 0 }));
      }
      const dbAlerts = await getAlertsFromDB();
      // Sort: High Risk first, then Newest
      const sorted = dbAlerts.sort((a, b) => {
        const riskOrder: any = { 'High': 3, 'Medium': 2, 'Low': 1 };
        const riskA = riskOrder[a.risk] || 0;
        const riskB = riskOrder[b.risk] || 0;
        if (riskA !== riskB) return riskB - riskA;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
      setAlerts(sorted);
    } catch (e) {
      console.log(e);
      // Fallback
      const dbAlerts = await getAlertsFromDB();
      setAlerts(dbAlerts);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAlerts();
  };

  const markRead = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, read: 1 } : a))
    );
  };

  const filteredAlerts = alerts.filter(a => {
    const matchesFilter = filter === "All" || a.risk === filter;
    const matchesSearch =
      (a.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.place || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.village || "").toLowerCase().includes(search.toLowerCase()); // Support village key
    return matchesFilter && matchesSearch;
  });

  const getLabel = (level: string) => {
    if (level === 'All') return t('all');
    if (level === 'High') return t('risk_high');
    if (level === 'Medium') return t('risk_medium');
    if (level === 'Low') return t('risk_low');
    return level;
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>{t('alerts_title')}</Text>
            <Text style={styles.headerSub}>{t('alerts_sub')}</Text>
          </View>
          <MaterialCommunityIcons name="broadcast" size={32} color="#FFD700" />
        </View>

        {/* RISK FILTER CHIPS */}
        <View style={styles.chipRow}>
          {["All", "High", "Medium", "Low"].map((level) => (
            <Chip
              key={level}
              selected={filter === level}
              onPress={() => setFilter(level)}
              style={[
                styles.chip,
                filter === level && styles.chipSelected,
                level === "High" && filter === "High" && { backgroundColor: '#FFEBEE' },
                level === "Medium" && filter === "Medium" && { backgroundColor: '#FFF3E0' },
              ]}
              textStyle={[
                styles.chipText,
                filter === level && { color: '#001F3F' }, // Default Text
                level === "High" && filter === "High" && { color: '#D32F2F' },
                level === "Medium" && filter === "Medium" && { color: '#E65100' },
              ]}
            >
              {getLabel(level)}
            </Chip>
          ))}
        </View>
      </View>

      {/* SEARCH */}
      <View style={{ paddingHorizontal: 16, marginTop: -20, marginBottom: 10 }}>
        <Searchbar
          placeholder={t('search_placeholder')}
          onChangeText={setSearch}
          value={search}
          style={styles.searchBar}
          inputStyle={{ minHeight: 0 }}
        />
      </View>

      {/* LIST */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#001F3F" style={{ marginTop: 40 }} />
        ) : filteredAlerts.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="shield-check" size={64} color="#C8E6C9" />
            <Text style={styles.emptyText}>{t('no_alerts')}</Text>
          </View>
        ) : (
          filteredAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} onMarkRead={markRead} />
          ))
        )}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },
  header: {
    backgroundColor: '#001F3F',
    paddingTop: 50,
    paddingBottom: 40, // Extra space for search bar overlap
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  headerSub: {
    fontSize: 14,
    color: '#B0C4DE',
    marginTop: 2,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    height: 32,
  },
  chipSelected: {
    backgroundColor: '#fff',
  },
  chipText: {
    fontSize: 12,
    color: '#fff',
  },
  searchBar: {
    borderRadius: 12,
    elevation: 4,
    backgroundColor: '#fff',
    height: 48,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#888',
    marginTop: 16,
    fontSize: 16,
  },
});
