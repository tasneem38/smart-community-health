import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Card, Divider, Chip, List, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { API_URL } from '../../api/postgres/client';

export default function AshaWaterTestDetailsScreen({ route }: any) {
    const { test } = route.params;
    const theme = useTheme();

    const renderStatus = (turbidity: number, ph: number) => {
        const safe = (turbidity < 25) && (ph >= 6.5 && ph <= 8.5);
        return (
            <Chip
                icon={safe ? "check-circle" : "alert-circle"}
                style={{ backgroundColor: safe ? "#E8F5E9" : "#FFEBEE" }}
                textStyle={{ color: safe ? "#2E7D32" : "#C62828" }}
            >
                {safe ? "Overall Safe" : "Action Required"}
            </Chip>
        );
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <Text style={styles.headerTitle}>Water Test Report</Text>
                    {renderStatus(test.turbidity, test.ph)}
                </View>
                <Text style={styles.headerSub}>ID: {test.id}</Text>
                <Text style={styles.headerSub}>
                    {new Date(test.timestamp).toLocaleString(undefined, {
                        dateStyle: 'full',
                        timeStyle: 'short'
                    })}
                </Text>
            </View>

            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="robot" size={24} color="#0D47A1" />
                        <Text style={styles.sectionTitle}>AI Health Analysis</Text>
                    </View>
                    <Divider style={styles.divider} />
                    {test.raw_data?.ai_explanation ? (
                        <Text style={styles.aiText}>"{test.raw_data.ai_explanation}"</Text>
                    ) : (
                        <Text style={styles.noAiText}>No AI analysis available for this record.</Text>
                    )}
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Title title="Technical Metrics" left={(props) => <MaterialCommunityIcons {...props} name="flask-outline" />} />
                <Card.Content>
                    <View style={styles.metricsGrid}>
                        <MetricBox label="pH Level" value={test.ph} icon="ph" color="#4CAF50" />
                        <MetricBox label="Turbidity" value={`${test.turbidity} NTU`} icon="water-percent" color="#2196F3" />
                        <MetricBox label="Chlorine" value={`${test.raw_data?.chlorine || 0} mg/L`} icon="opacity" color="#FF9800" />
                        <MetricBox label="Nitrate" value={`${test.raw_data?.nitrate || 0} mg/L`} icon="molecule" color="#9C27B0" />
                    </View>

                    <Divider style={styles.innerDivider} />

                    <List.Item
                        title="H2S Contamination"
                        description={test.raw_data?.h2sResult === 'safe' ? "No fecal contamination detected" : "Fecal contamination detected (Black)"}
                        left={(props) => <MaterialCommunityIcons {...props} name="biohazard" color={test.raw_data?.h2sResult === 'safe' ? "#4CAF50" : "#D32F2F"} />}
                    />
                    <List.Item
                        title="Source Type"
                        description={test.raw_data?.sourceType || 'Not specified'}
                        left={(props) => <MaterialCommunityIcons {...props} name="source-branch" />}
                    />
                    <List.Item
                        title="Village"
                        description={test.village}
                        left={(props) => <MaterialCommunityIcons {...props} name="home-city-outline" />}
                    />
                </Card.Content>
            </Card>

            {test.raw_data?.photoUrl && (
                <Card style={styles.card}>
                    <Card.Title title="Visual Evidence" left={(props) => <MaterialCommunityIcons {...props} name="camera" />} />
                    <Card.Content>
                        <Image
                            source={{ uri: test.raw_data.photoUrl.startsWith('http') ? test.raw_data.photoUrl : `${API_URL}${test.raw_data.photoUrl}` }}
                            style={styles.photo}
                            resizeMode="cover"
                        />
                    </Card.Content>
                </Card>
            )}

            {test.raw_data?.location && (
                <Card style={styles.card}>
                    <Card.Title title="GPS Coordinates" left={(props) => <MaterialCommunityIcons {...props} name="map-marker-outline" />} />
                    <Card.Content>
                        <Text style={styles.locationText}>Lat: {test.raw_data.location.latitude}</Text>
                        <Text style={styles.locationText}>Long: {test.raw_data.location.longitude}</Text>
                    </Card.Content>
                </Card>
            )}
        </ScrollView>
    );
}

function MetricBox({ label, value, icon, color }: any) {
    return (
        <View style={styles.metricBox}>
            <MaterialCommunityIcons name={icon} size={24} color={color} />
            <Text style={styles.metricValue}>{value}</Text>
            <Text style={styles.metricLabel}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7F9',
    },
    header: {
        padding: 24,
        backgroundColor: '#001F3F',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSub: {
        fontSize: 13,
        color: '#B0C4DE',
        marginTop: 2,
    },
    card: {
        margin: 16,
        borderRadius: 16,
        elevation: 4,
        backgroundColor: '#fff',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
        color: '#0D47A1',
    },
    divider: {
        marginVertical: 12,
    },
    aiText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
        fontStyle: 'italic',
    },
    noAiText: {
        color: '#888',
        fontStyle: 'italic',
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    metricBox: {
        width: '45%',
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16,
    },
    metricValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 8,
    },
    metricLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    innerDivider: {
        marginVertical: 8,
    },
    photo: {
        width: '100%',
        height: 250,
        borderRadius: 12,
    },
    locationText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    }
});
