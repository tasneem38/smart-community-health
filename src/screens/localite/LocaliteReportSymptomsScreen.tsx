import React, { useState, useContext } from "react";
import { ScrollView, StyleSheet, Alert, View, TouchableOpacity } from "react-native";
import { Text, Card, Button, TextInput } from "react-native-paper";
import * as Location from "expo-location";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AuthContext } from '../../store/authContext';
import { sendSymptomReport } from "../../api/api";
import { uploadImage } from "../../api/postgres/upload";
import { useTranslation } from 'react-i18next';

// NE India & Water-borne Disease Focus
const SIMPLE_SYMPTOMS = [
  { code: "high_fever_chills", label: "Fever with Chills", icon: "thermometer-alert" }, // Malaria/Typhoid
  { code: "severe_diarrhea", label: "Severe Diarrhea", icon: "emoticon-poop" }, // Cholera/Dysentery 
  { code: "vomiting", label: "Vomiting", icon: "emoticon-sick" },
  { code: "jaundice", label: "Yellow Eyes (Jaundice)", icon: "eye-plus" }, // Hepatitis
  { code: "stomach_pain", label: "Stomach Pain", icon: "stomach" },
  { code: "skin_rash", label: "Skin Rash", icon: "allergy" }, // Fungal/Insect bites
];

export default function LocaliteReportSymptomsScreen() {
  const { state } = useContext(AuthContext);
  const user = state.user;
  const { t } = useTranslation();

  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleSymptom = (code: string) => {
    setSymptoms((prev) =>
      prev.includes(code) ? prev.filter((x) => x !== code) : [...prev, code]
    );
  };

  const submit = async () => {
    if (symptoms.length === 0) {
      Alert.alert("Select at least one symptom");
      return;
    }

    setLoading(true);

    const report = {
      id: user.id + "-" + Date.now(), // Fallback ID
      userId: user.id,
      name: user.name || "Community Member", // Ensure name is sent for alert
      userName: user.name,
      reporterRole: "LOCALITE", // Critical for backend alert
      village: user.village || "Unknown",
      symptoms,
      notes,
      timestamp: new Date().toISOString(),
    };

    try {
      // Assuming 'report' is the payload for sendSymptomReport
      // And assuming 'photo' and 'navigation' are not available in this context
      // The provided snippet seems to be a mix of different contexts.
      // I will replace the existing try block with the relevant parts of the snippet
      // that align with the instruction "Replace saveSymptomReport with sendSymptomReport"
      // and maintain syntactic correctness.

      // If 'photo' and 'navigation' are intended to be used, they need to be defined or passed.
      // For now, I'll adapt the snippet to the current context.

      // Original: await saveSymptomReport(report); // This should hit your API client
      // Original: Alert.alert("Submitted", "Your report has been sent to the ASHA worker.");
      // Original: setSymptoms([]);
      // Original: setNotes("");

      // Adapting the provided snippet:
      // const url = await uploadImage(photo); // 'photo' is not defined here
      // payload.photoUrl = url; // 'payload' is not defined here, assuming 'report' is the payload

      await sendSymptomReport(report); // Using 'report' as the payload
      Alert.alert("Submitted", "Your report has been sent to the ASHA worker."); // Re-using original alert
      setSymptoms([]);
      setNotes("");
      // navigation.goBack(); // 'navigation' is not defined here
    } catch (e: any) { // Changed 'e' to 'e: any' for type safety if not already defined
      console.log(e);
      Alert.alert("Failed", e.message || "Unable to submit report. Try again."); // Using e.message from snippet
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Report Health Issue</Text>
          <Text style={styles.headerSub}>Notify your ASHA worker</Text>
        </View>
        <MaterialCommunityIcons name="medical-bag" size={32} color="#FFD700" />
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>What are you feeling?</Text>

          <View style={styles.chipContainer}>
            {SIMPLE_SYMPTOMS.map((item) => {
              const isSelected = symptoms.includes(item.code);
              return (
                <TouchableOpacity
                  key={item.code}
                  style={[styles.chip, isSelected && { backgroundColor: '#001F3F', borderColor: '#001F3F' }]}
                  onPress={() => toggleSymptom(item.code)}
                >
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={24}
                    color={isSelected ? '#fff' : '#001F3F'}
                    style={{ marginBottom: 4 }}
                  />
                  <Text style={[styles.chipText, isSelected && { color: '#fff' }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            mode="outlined"
            label="Additional notes (optional)"
            value={notes}
            onChangeText={setNotes}
            multiline
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={submit}
            loading={loading}
            style={styles.button}
            buttonColor="#001F3F"
          >
            Notify ASHA Worker
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4FAFF"
  },
  header: {
    backgroundColor: '#001F3F',
    paddingVertical: 24,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  headerSub: {
    fontSize: 14,
    color: '#B0C4DE',
    marginTop: 2,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    color: "#001F3F",
    textAlign: 'center',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  chip: {
    width: '30%',
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  chipText: {
    fontSize: 12,
    color: '#001F3F',
    fontWeight: '600',
    textAlign: 'center',
  },
  input: {
    marginTop: 10,
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 24,
    paddingVertical: 6,
    borderRadius: 12,
  },
});
