import React, { useState, useContext } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { TextInput, Button, Text, Card, ActivityIndicator } from "react-native-paper";
import { askGroq } from "../api/aiService";
import { AuthContext } from "../store/authContext";
import { saveSymptomAIResult } from "../api/firebase/aiRecords";

export default function SymptomCheckerScreen() {
  const { state } = useContext(AuthContext);
  const userId = state.user?.id;

  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const cleanAIResponse = (text: string) => {
    return text
      .replace(/\*\*/g, "")
      .replace(/###/g, "")
      .replace(/\*/g, "•");
  };

  const checkSymptoms = async () => {
    if (!symptoms.trim()) return;

    setLoading(true);

    const prompt = `
You are a medical triage assistant.
Given the symptoms: "${symptoms}".

Provide:
Risk Level
Possible Conditions
When to Seek Medical Help
Recommended Next Steps

Write clean sentences. No markdown.
`;

    const aiResponse = await askGroq(prompt);
    const cleaned = cleanAIResponse(aiResponse);
    setResult(cleaned);

    // SAVE TO BACKEND
    await saveSymptomAIResult(symptoms, cleaned, userId);

    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>AI Symptom Checker 🤖</Text>
      <Text style={styles.subHeader}>Enter symptoms and get instant AI health triage.</Text>

      <Card style={styles.inputCard}>
        <Card.Content>
          <TextInput
            mode="outlined"
            label="Describe symptoms here..."
            value={symptoms}
            onChangeText={setSymptoms}
            multiline
            numberOfLines={6}
            style={styles.input}
            placeholder="Ex: Fever, headache, vomiting since 2 days..."
          />

          <Button
            mode="contained"
            onPress={checkSymptoms}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Analyze Symptoms
          </Button>
        </Card.Content>
      </Card>

      {loading && (
        <View style={{ marginTop: 20, alignItems: "center" }}>
          <ActivityIndicator animating size="large" />
          <Text style={{ marginTop: 10, color: "#666" }}>Analyzing with AI...</Text>
        </View>
      )}

      {!loading && result ? (
        <Card style={styles.resultCard}>
          <Card.Content>
            <Text style={styles.resultHeader}>AI Analysis Result</Text>
            <Text style={styles.resultText}>{result}</Text>
          </Card.Content>
        </Card>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, backgroundColor: "#ECF7FF" },
  header: { fontSize: 26, fontWeight: "800", color: "#015D7C" },
  subHeader: { marginTop: 4, fontSize: 14, color: "#555", marginBottom: 16 },
  inputCard: { borderRadius: 20, elevation: 3 },
  input: { marginBottom: 14, backgroundColor: "#fff" },
  button: { backgroundColor: "#015D7C", paddingVertical: 6, borderRadius: 10 },
  resultCard: { marginTop: 20, borderRadius: 20, elevation: 3, backgroundColor: "#FFFFFF" },
  resultHeader: { fontSize: 20, fontWeight: "700", marginBottom: 10, color: "#0A4D68" },
  resultText: { fontSize: 16, lineHeight: 22, color: "#333" },
});
