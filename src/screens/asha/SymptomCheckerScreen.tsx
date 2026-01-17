import React, { useState, useContext, useEffect } from "react";
import { ScrollView, StyleSheet, View, Alert } from "react-native";
import { TextInput, Button, Text, Card, ActivityIndicator, Chip } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import * as Notifications from 'expo-notifications';
import { askGroq } from "../../api/aiService";
import { AuthContext } from "../../store/authContext";
import { saveSymptomAIResult } from "../../api/firebase/aiRecords";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const COMMON_SYMPTOMS = [
  { label_key: "sym_high_fever", value: "High Fever" },
  { label_key: "sym_chills", value: "Chills" },
  { label_key: "sym_headache", value: "Headache" },
  { label_key: "sym_vomiting", value: "Vomiting" },
  { label_key: "sym_severe_diarrhea", value: "Diarrhea" },
  { label_key: "sym_stomach_pain", value: "Stomach Pain" },
  { label_key: "sym_cough", value: "Cough" },
  { label_key: "sym_breathlessness", value: "Breathlessness" },
  { label_key: "sym_joint_pain", value: "Joint Pain" },
  { label_key: "sym_skin_rash", value: "Skin Rash" },
  { label_key: "sym_weakness", value: "Weakness" },
  { label_key: "sym_dizziness", value: "Dizziness" }
];

export default function SymptomCheckerScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { state } = useContext(AuthContext);
  const userId = state.user?.id;

  React.useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        // silently fail or log
        console.log('Notification permission not granted');
      }
    })();
  }, []);

  const toggleSymptom = (sym: string) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const cleanAIResponse = (text: string) => {
    return text
      .replace(/\*\*/g, "")
      .replace(/###/g, "")
      .replace(/\*/g, "•");
  };

  const checkSymptoms = async () => {
    if (selectedSymptoms.length === 0 && !description.trim()) {
      Alert.alert(t('missing_fields'), t('select_symptoms_helper'));
      return;
    }

    setLoading(true);
    setResult("");

    const combinedSymptoms = `Selected: ${selectedSymptoms.join(", ")}. Notes: ${description}`;

    const prompt = `
You are a medical assistant for an ASHA worker in Rural North India.
Patient Symptoms: "${combinedSymptoms}".

Context: Rural North India (Endemic for Dengue, Malaria, Typhoid, Chikungunya, Tuberculosis).
Task: Provide a structured summary.
1. Possible Condition (List top 2-3 likely causes specific to this region)
2. Risk Level (Low/Medium/High)
3. Immediate Advice (Home care vs Hospital referral)
4. Key Questions to Ask (To narrow down diagnosis)

Format: Plain text with bullet points. No markdown. Keep it concise.
`;

    try {
      const aiResponse = await askGroq(prompt);
      const cleaned = cleanAIResponse(aiResponse);
      setResult(cleaned);

      // Trigger Notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: t('notification_title'),
          body: t('notification_body'),
          sound: true,
        },
        trigger: null,
      });

      // SAVE TO BACKEND
      await saveSymptomAIResult(combinedSymptoms, cleaned, userId);
    } catch (error) {
      Alert.alert(t('network_error'), "Failed to get AI analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.headerTitle}>{t('symptom_checker')}</Text>
          <Text style={styles.headerSub}>{t('sub_symptom_checker')}</Text>
        </View>
        <MaterialCommunityIcons name="robot" size={32} color="#fff" style={styles.headerIcon} />
      </View>

      {/* COMMON SYMPTOMS CHIPS */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>{t('observed_symptoms')}</Text>
          <View style={styles.chipDisplay}>
            {COMMON_SYMPTOMS.map((item) => (
              <Chip
                key={item.value}
                selected={selectedSymptoms.includes(item.value)}
                onPress={() => toggleSymptom(item.value)}
                style={[
                  styles.chip,
                  selectedSymptoms.includes(item.value) && styles.chipSelected
                ]}
                textStyle={[
                  styles.chipText,
                  selectedSymptoms.includes(item.value) && styles.chipTextSelected
                ]}
                showSelectedOverlay
              >
                {t(item.label_key as any)}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* DETAILED DESCRIPTION */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>{t('additional_info')}</Text>
          <TextInput
            mode="outlined"
            placeholder={t('select_symptoms_helper')} // Using existing helper text as placeholder for now
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={styles.input}
            outlineColor="#E0E0E0"
            activeOutlineColor="#001F3F"
          />
        </Card.Content>
      </Card>

      {/* ACTION BUTTON */}
      <Button
        mode="contained"
        onPress={checkSymptoms}
        loading={loading}
        disabled={loading}
        style={styles.analyzeBtn}
        labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
        icon="stethoscope"
      >
        {loading ? t('analyzing') : t('analyze_symptoms')}
      </Button>

      {/* RESULT SECTION */}
      {result ? (
        <Card style={styles.resultCard}>
          <Card.Content>
            <View style={styles.resultHeaderBox}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={24} color="#001F3F" />
              <Text style={styles.resultHeader}>{t('ai_assessment')}</Text>
            </View>
            <View style={styles.resultDivider} />
            <Text style={styles.resultText}>{result}</Text>

            <View style={styles.disclaimerBox}>
              <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#D32F2F" />
              <Text style={styles.disclaimerText}>
                {t('ai_disclaimer')}
              </Text>
            </View>
          </Card.Content>
        </Card>
      ) : null}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8"
  },
  headerContainer: {
    backgroundColor: '#001F3F',
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
  },
  headerSub: {
    fontSize: 13,
    color: "#B0C4DE",
    marginTop: 2,
  },
  headerIcon: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 50,
    padding: 8
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#001F3F',
    marginBottom: 12,
  },
  chipDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  chipSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#001F3F',
  },
  chipText: {
    color: '#555',
  },
  chipTextSelected: {
    color: '#001F3F',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    fontSize: 14,
  },
  analyzeBtn: {
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: '#001F3F',
    paddingVertical: 6,
    borderRadius: 12,
    elevation: 3,
  },
  resultCard: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderLeftWidth: 5,
    borderLeftColor: '#FFD700',
    elevation: 4,
  },
  resultHeaderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: "#001F3F",
    marginLeft: 8,
  },
  resultDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 12,
  },
  resultText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#333",
  },
  disclaimerBox: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#D32F2F',
    marginLeft: 6,
    flex: 1,
  },
});
