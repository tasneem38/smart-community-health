import React, { useState, useContext } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { TextInput, Button, Text, Card, ActivityIndicator } from "react-native-paper";
import { askGroq } from "../../api/aiService";
import { AuthContext } from "../../store/authContext";
import { saveSummaryAIResult } from "../../api/firebase/aiRecords";

export default function ClinicSummaryGeneratorScreen() {
  const { state } = useContext(AuthContext);
  const userId = state.user?.id;

  const [inputText, setInputText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const cleanAI = (text: string) => {
    return text
      .replace(/\*\*/g, "")
      .replace(/###/g, "")
      .replace(/\*/g, "•")
      .trim();
  };

  const generateSummary = async () => {
    if (!inputText.trim()) return;
    setLoading(true);

    const prompt = `
You are a professional medical document summarizer.
Summarize the following clinical report in simple structured sections:

1. Patient Summary
2. Key Findings
3. Medications (if any)
4. Recommended Follow-up
5. Urgent Concerns (if any)

Make the response simple, clean, and readable.
Do NOT use markdown formatting or symbols like **, ##, etc.

Report:
"${inputText}"
`;

    try {
      const aiResponse = await askGroq(prompt);
      const cleaned = cleanAI(aiResponse);
      setSummary(cleaned);

      // Save AI result (for clinic analytics / audit)
      try {
    await saveSummaryAIResult(
      inputText,        // input text
      cleaned,          // output summary
      userId || "unknown"  // user ID
    );
  } catch (saveErr) {
    console.warn("Failed to save AI summary:", saveErr);
  }
    } catch (err) {
      console.warn("AI service error:", err);
      setSummary("AI service error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const onClear = () => {
    setInputText("");
    setSummary("");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Clinic — Summary Generator</Text>
      <Text style={styles.subHeader}>Paste a patient's report or notes to produce a concise clinical summary.</Text>

      <Card style={styles.inputCard}>
        <Card.Content>
          <TextInput
            mode="outlined"
            label="Clinical text / notes"
            value={inputText}
            onChangeText={setInputText}
            multiline
            numberOfLines={8}
            style={styles.input}
            placeholder="Patient notes, findings, prescriptions..."
          />

          <Button
            mode="contained"
            onPress={generateSummary}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Generate Summary
          </Button>

          <Button
            mode="outlined"
            onPress={onClear}
            style={{ marginTop: 10 }}
          >
            Clear
          </Button>
        </Card.Content>
      </Card>

      {loading && (
        <View style={{ marginTop: 20, alignItems: "center" }}>
          <ActivityIndicator animating size="large" />
          <Text style={{ marginTop: 10, color: "#666" }}>Generating summary…</Text>
        </View>
      )}

      {!loading && summary ? (
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.summaryHeader}>Generated Summary</Text>
            <Text style={styles.summaryText}>{summary}</Text>
          </Card.Content>
        </Card>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, backgroundColor: "#F4ECFF" },
  header: { fontSize: 24, fontWeight: "800", color: "#5A2EA6", marginBottom: 6 },
  subHeader: { fontSize: 14, color: "#666", marginBottom: 16 },
  inputCard: { borderRadius: 12, elevation: 2 },
  input: { backgroundColor: "#fff", marginBottom: 12 },
  button: { backgroundColor: "#5A2EA6", paddingVertical: 6, borderRadius: 8 },
  summaryCard: { marginTop: 20, borderRadius: 12, elevation: 2, backgroundColor: "#fff" },
  summaryHeader: { fontSize: 18, fontWeight: "700", color: "#5A2EA6", marginBottom: 8 },
  summaryText: { fontSize: 16, lineHeight: 22, color: "#333" },
});
