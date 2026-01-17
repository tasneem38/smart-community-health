import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { theme } from '../theme/theme';

const PrivacyPolicyScreen = ({ navigation }: any) => {
    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Surface style={styles.surface} elevation={2}>
                    <Text variant="headlineMedium" style={styles.header}>Privacy Policy</Text>
                    <Text variant="bodyMedium" style={styles.lastUpdated}>Last Updated: January 2026</Text>

                    <View style={styles.section}>
                        <Text variant="titleMedium" style={styles.sectionTitle}>1. Introduction</Text>
                        <Text variant="bodyMedium" style={styles.paragraph}>
                            Welcome to the Smart Health App. This application is designed to assist ASHA workers in collecting and managing health data for their communities. We are committed to protecting the privacy and security of both our workers and the patients they serve.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text variant="titleMedium" style={styles.sectionTitle}>2. Data Collection</Text>
                        <Text variant="bodyMedium" style={styles.paragraph}>
                            We collect the following types of information to provide better health services:
                        </Text>
                        <View style={styles.bulletPoint}>
                            <Text variant="bodyMedium">• </Text>
                            <Text variant="bodyMedium" style={styles.bulletText}>
                                <Text style={{ fontWeight: 'bold' }}>Patient Vitals:</Text> Heart rate, blood pressure, temperature, and other health indicators recorded during visits.
                            </Text>
                        </View>
                        <View style={styles.bulletPoint}>
                            <Text variant="bodyMedium">• </Text>
                            <Text variant="bodyMedium" style={styles.bulletText}>
                                <Text style={{ fontWeight: 'bold' }}>Demographics:</Text> Name, age, gender, and address for patient identification and record-keeping.
                            </Text>
                        </View>
                        <View style={styles.bulletPoint}>
                            <Text variant="bodyMedium">• </Text>
                            <Text variant="bodyMedium" style={styles.bulletText}>
                                <Text style={{ fontWeight: 'bold' }}>Location Data:</Text> GPS coordinates may be collected to tag the location of health visits and water sample collection points.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text variant="titleMedium" style={styles.sectionTitle}>3. How We Use Your Data</Text>
                        <Text variant="bodyMedium" style={styles.paragraph}>
                            collected data is used strictly for:
                        </Text>
                        <View style={styles.bulletPoint}>
                            <Text variant="bodyMedium">• </Text>
                            <Text variant="bodyMedium" style={styles.bulletText}>Monitoring community health trends.</Text>
                        </View>
                        <View style={styles.bulletPoint}>
                            <Text variant="bodyMedium">• </Text>
                            <Text variant="bodyMedium" style={styles.bulletText}>Facilitating early diagnosis and treatment.</Text>
                        </View>
                        <View style={styles.bulletPoint}>
                            <Text variant="bodyMedium">• </Text>
                            <Text variant="bodyMedium" style={styles.bulletText}>Reporting to local health clinics and authorities for resource allocation.</Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text variant="titleMedium" style={styles.sectionTitle}>4. Data Security</Text>
                        <Text variant="bodyMedium" style={styles.paragraph}>
                            We implement industry-standard security measures to protect data from unauthorized access, alteration, or destruction. All sensitive health data is encrypted during transmission and storage.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text variant="titleMedium" style={styles.sectionTitle}>5. Contact Us</Text>
                        <Text variant="bodyMedium" style={styles.paragraph}>
                            If you have any questions or concerns about this Privacy Policy or our data practices, please contact your supervisor or the technical support team.
                        </Text>
                    </View>

                    <Button
                        mode="contained"
                        onPress={() => navigation.goBack()}
                        style={styles.button}
                        buttonColor={theme.colors.primary}
                    >
                        Close
                    </Button>

                </Surface>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    surface: {
        padding: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.surface,
    },
    header: {
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: 8,
        textAlign: 'center',
    },
    lastUpdated: {
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        fontStyle: 'italic',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontWeight: 'bold',
        color: theme.colors.secondary,
        marginBottom: 8,
    },
    paragraph: {
        color: '#333',
        lineHeight: 22,
    },
    bulletPoint: {
        flexDirection: 'row',
        marginTop: 4,
        paddingLeft: 8,
    },
    bulletText: {
        flex: 1,
        lineHeight: 22,
        color: '#333',
    },
    button: {
        marginTop: 16,
        alignSelf: 'center',
        width: '50%',
    },
});

export default PrivacyPolicyScreen;
