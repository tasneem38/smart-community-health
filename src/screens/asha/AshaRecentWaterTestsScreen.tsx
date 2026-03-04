import React, { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Image } from 'react-native';
import { Text, Card, ActivityIndicator, Divider, Chip, List } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../store/authContext';
import { fetchWaterTestsPostgres, API_URL } from '../../api/postgres/client';

export default function AshaRecentWaterTestsScreen({ navigation }: any) {
    const { state } = useContext(AuthContext);
    const user = state.user;

    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadTests = async () => {
        setLoading(true);
        setError(null);
        try {
            const village = user?.village;
            if (!village) {
                setTests([]);
                return;
            }
            const data = await fetchWaterTestsPostgres(village);
            setTests(data);
        } catch (err: any) {
            console.error("Failed to load water tests:", err);
            setError(err.message || "Failed to load tests. Check server connection.");
            setTests([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadTests();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadTests();
    };

    const renderStatus = (turbidity: number, ph: number) => {
        const safe = (turbidity < 25) && (ph >= 6.5 && ph <= 8.5);
        return (
            <Chip
                icon={safe ? "check-circle" : "alert-circle"}
                style={{ backgroundColor: safe ? "#E8F5E9" : "#FFEBEE" }}
                textStyle={{ color: safe ? "#2E7D32" : "#C62828" }}
            >
                {safe ? "Safe" : "Unsafe"}
            </Chip>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#001F3F" />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadTests} colors={["#001F3F"]} />}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Recent Tests</Text>
                <Text style={styles.headerSub}>Historical records for {user?.village}</Text>
            </View>

            {error && (
                <Card style={styles.errorCard}>
                    <Card.Content style={styles.errorContent}>
                        <MaterialCommunityIcons name="alert-circle" size={24} color="#C62828" />
                        <Text style={styles.errorText}>{error}</Text>
                    </Card.Content>
                </Card>
            )}

            {tests.length === 0 && !error ? (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="clipboard-text-outline" size={60} color="#ccc" />
                    <Text style={styles.emptyText}>No test records found for this village.</Text>
                </View>
            ) : (
                tests.map((test) => (
                    <Card
                        key={test.id}
                        style={styles.card}
                        onPress={() => navigation.navigate('WaterTestDetails', { test })}
                    >
                        <Card.Content>
                            <View style={styles.cardHeader}>
                                <View>
                                    <Text style={styles.dateText}>
                                        {new Date(test.timestamp).toLocaleDateString(undefined, {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </Text>
                                    <Text style={styles.sourceText}>Source: {test.raw_data?.sourceType || 'Standard'}</Text>
                                </View>
                                {renderStatus(test.turbidity, test.ph)}
                            </View>

                            <Divider style={styles.divider} />

                            <View style={styles.metricsRow}>
                                <MetricItem label="pH Level" value={test.ph} icon="ph" />
                                <MetricItem label="Turbidity" value={`${test.turbidity} NTU`} icon="water" />
                            </View>

                            {test.raw_data?.ai_explanation && (
                                <View style={styles.aiBox}>
                                    <View style={styles.aiHeader}>
                                        <MaterialCommunityIcons name="robot" size={18} color="#0D47A1" />
                                        <Text style={styles.aiTitle}>AI Analysis</Text>
                                    </View>
                                    <Text style={styles.aiContent} numberOfLines={2}>"{test.raw_data.ai_explanation}"</Text>
                                    <Text style={styles.viewMore}>Tap for full details →</Text>
                                </View>
                            )}
                        </Card.Content>
                    </Card>
                ))
            )}
        </ScrollView>
    );
}

function MetricItem({ label, value, icon }: any) {
    return (
        <View style={styles.metricItem}>
            <MaterialCommunityIcons name={icon} size={16} color="#666" />
            <Text style={styles.metricLabel}>{label}:</Text>
            <Text style={styles.metricValue}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7F9',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: '#001F3F',
        padding: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSub: {
        fontSize: 14,
        color: '#B0C4DE',
        marginTop: 4,
    },
    card: {
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 12,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    dateText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    sourceText: {
        fontSize: 12,
        color: '#666',
    },
    divider: {
        marginVertical: 8,
    },
    metricsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    metricItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metricLabel: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    metricValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
        marginLeft: 6,
    },
    aiBox: {
        backgroundColor: '#E3F2FD',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    aiHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    aiTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#0D47A1',
        marginLeft: 6,
    },
    aiContent: {
        fontSize: 13,
        color: '#0D47A1',
        fontStyle: 'italic',
    },
    emptyContainer: {
        marginTop: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        marginTop: 16,
        color: '#888',
        fontSize: 16,
    },
    imageBox: {
        marginTop: 12,
    },
    imageLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#666',
        marginBottom: 6,
    },
    photo: {
        width: '100%',
        height: 150,
        borderRadius: 8,
    },
    errorCard: {
        margin: 16,
        backgroundColor: '#FFEBEE',
    },
    errorContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    errorText: {
        marginLeft: 12,
        color: '#C62828',
        fontWeight: '600',
        flex: 1,
    },
    viewMore: {
        fontSize: 12,
        color: '#0D47A1',
        fontWeight: '700',
        marginTop: 8,
        textAlign: 'right',
    }
});
