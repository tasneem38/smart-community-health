import React, { useState, useContext } from "react";
import { ScrollView, StyleSheet, Alert } from "react-native";
import { Text, Card, Checkbox, Button, TextInput } from "react-native-paper";
import { AuthContext } from "../../store/authContext";
import { saveSymptomReport } from "../../api/firebase/database";

export default function LocaliteReportSymptomsScreen() {
  const { state } = useContext(AuthContext);
  const user = state.user;

  const [symptoms, setSymptoms] = useState({
    fever: false,
    headache: false,
    diarrhea: false,
    stomachPain: false,
    rash: false,
    vomiting: false,
  });

  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const toggle = (key: string) => {
    setSymptoms({ ...symptoms, [key]: !symptoms[key] });
  };

  const submit = async () => {
    const selected = Object.values(symptoms).some((v) => v === true);
    if (!selected) {
      Alert.alert("Select at least one symptom");
      return;
    }

    setLoading(true);

    const report = {
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      symptoms,
      notes,
      timestamp: new Date().toISOString(),
    };

    try {
      await saveSymptomReport(report);
      Alert.alert("Submitted", "Your symptoms have been submitted successfully.");
    } catch {
      Alert.alert("Failed", "Unable to submit report. Try again.");
    }

    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Report Your Symptoms</Text>

          {/* SYMPTOMS CHECKBOXES */}
          {Object.entries(symptoms).map(([key, value]) => (
            <Checkbox.Item
              key={key}
              label={convertLabel(key)}
              status={value ? "checked" : "unchecked"}
              onPress={() => toggle(key)}
              color="#0A4D68"
              uncheckedColor="#777"
            />
          ))}

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
          >
            Submit Report
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

function convertLabel(key: string) {
  switch (key) {
    case "stomachPain": return "Stomach Pain";
    default: return key.charAt(0).toUpperCase() + key.slice(1);
  }
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#F4FAFF" },
  card: { borderRadius: 18, paddingVertical: 8 },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 14,
    color: "#0A4D68",
  },
  input: {
    marginTop: 10,
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 16,
    backgroundColor: "#0A4D68",
    paddingVertical: 6,
    borderRadius: 10,
  },
});
