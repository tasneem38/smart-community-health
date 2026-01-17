import React, { useEffect, useState, useContext } from "react";
import { ScrollView, StyleSheet, View, FlatList, TouchableOpacity, RefreshControl, Alert } from "react-native";
import { Card, Text, Button, ActivityIndicator, Chip, Divider, Searchbar, TextInput } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from 'react-i18next';
// @ts-ignore
import { API_URL } from '../../api/postgres/client';
import { AuthContext } from '../../store/authContext';
import { fetchAssistanceRequests, resolveAssistanceRequest } from "../../api/firebase/assistance";

interface AssistanceRequest {
  id: string;
  village: string;
  message: string; // Changed from reason to message to match usage
  status: string;
  userId?: string; // Added optional
  timestamp: string;
  resolved: boolean;
}

export default function AssistanceRequestsScreen() {
  const { t } = useTranslation();
  const { state } = useContext(AuthContext);
  const user = state.user;

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadRequests = async () => {
    // If refreshing, don't show full loader
    if (!refreshing) setLoading(true);

    try {
      const data: any[] = await fetchAssistanceRequests();
      // Map data to ensure it matches AssistanceRequest if needed, or cast it
      const mappedData: AssistanceRequest[] = data.map(d => ({
        id: d.id,
        village: d.village || '',
        message: d.message || d.reason || '', // Handle both potential keys
        status: d.status || 'pending',
        timestamp: d.timestamp,
        userId: d.userId,
        resolved: d.resolved || d.status === 'resolved' || false
      }));

      // Sort by status (pending first) then date
      const sorted = mappedData.sort((a, b) => {
        if (a.resolved === b.resolved) {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        }
        return a.resolved ? 1 : -1;
      });
      setRequests(sorted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  const markResolved = async (id: string) => {
    await resolveAssistanceRequest(id);
    loadRequests();
  };

  // -------------------------
  // STATS CALCULATION
  // -------------------------
  const total = requests.length;
  const pending = requests.filter(r => !r.resolved).length;
  const resolved = total - pending;

  // -------------------------
  // FILTERING
  // -------------------------
  const filteredRequests = requests.filter(r =>
    r.village?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>

      {/* HEADER STATS */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('assistance_requests')}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{pending}</Text>
            <Text style={styles.statLabel}>{t('pending')}</Text>
          </View>
          <View style={[styles.statBox, { borderLeftWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }]}>
            <Text style={styles.statNum}>{resolved}</Text>
            <Text style={styles.statLabel}>{t('resolved')}</Text>
          </View>
          <View style={[styles.statBox, { borderLeftWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }]}>
            <Text style={styles.statNum}>{total}</Text>
            <Text style={styles.statLabel}>{t('total')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Searchbar
          placeholder={t('search_requests_placeholder')}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={{ minHeight: 0 }} // Fix for some paper versions
        />

        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color="#001F3F" size="large" />
        ) : (
          <FlatList
            data={filteredRequests}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
              <Text style={styles.emptyText}>{t('no_requests_found')}</Text>
            }
            renderItem={({ item }) => (
              <RequestCard item={item} onResolve={() => markResolved(item.id)} />
            )}
          />
        )}
      </View>

    </View>
  );
}

function RequestCard({ item, onResolve }: any) {
  const { t } = useTranslation();
  const isResolved = item.resolved;

  return (
    <Card style={[styles.card, isResolved && styles.cardResolved]}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Chip
            icon={isResolved ? "check" : "alert-circle-outline"}
            style={[styles.statusChip, isResolved ? { backgroundColor: '#E8F5E9' } : { backgroundColor: '#FFEBEE' }]}
            textStyle={{ color: isResolved ? '#2E7D32' : '#C62828', fontSize: 12 }}
          >
            {isResolved ? t('resolved') : t('action_required')}
          </Chip>
          <Text style={styles.date}>{new Date(item.timestamp).toLocaleDateString()}</Text>
        </View>

        <Text style={styles.message}>{item.message}</Text>

        <Divider style={styles.divider} />

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
            <Text style={styles.metaText}>{item.village || t('unknown_village')}</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="account" size={16} color="#666" />
            <Text style={styles.metaText}>ID: {item.userId?.substring(0, 6) || "N/A"}</Text>
          </View>
        </View>

        {!isResolved && (
          <Button
            mode="contained"
            onPress={onResolve}
            style={styles.resolveBtn}
            icon="check-circle"
          >
            {t('mark_resolved')}
          </Button>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },
  /* HEADER */
  header: {
    backgroundColor: '#001F3F',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingVertical: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#B0C4DE',
    fontSize: 12,
    marginTop: 2,
    textTransform: 'uppercase',
  },

  /* CONTENT */
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchBar: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
    height: 48,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
  },

  /* CARD */
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#D9534F', // Default pending red
  },
  cardResolved: {
    borderLeftColor: '#4CAF50',
    opacity: 0.8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusChip: {
    height: 28,
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  message: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 22,
  },
  divider: {
    backgroundColor: '#F0F0F0',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 13,
    color: '#555',
    marginLeft: 4,
  },
  resolveBtn: {
    backgroundColor: '#001F3F',
    borderRadius: 8,
  },
});
