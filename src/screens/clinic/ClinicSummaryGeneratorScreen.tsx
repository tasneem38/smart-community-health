import React, { useState, useContext } from "react";
import { ScrollView, StyleSheet, View, StatusBar } from "react-native";
import { TextInput, Button, Text, Card, ActivityIndicator, IconButton } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { askGroq } from "../../api/aiService";
import { AuthContext } from "../../store/authContext";
import { saveAiRecord } from "../../api/api";
import { useTranslation } from "react-i18next";

export default function ClinicSummaryGeneratorScreen({ navigation }: any) {
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
        await saveAiRecord({
          type: "clinic_summary",
          content: cleaned,
          metadata: {
            originalText: inputText,
            userId: userId || "unknown"
          }
        });
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
    <View style={styles.container}>
      <StatusBar backgroundColor="#001F3F" barStyle="light-content" />
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <IconButton
            icon="arrow-left"
            iconColor="#fff"
            size={24}
            onPress={() => navigation.goBack()}
            style={{ marginLeft: -10, marginRight: 4 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Summary Generator</Text>
            <Text style={styles.headerSub}>AI-powered clinical summaries</Text>
          </View>
          <MaterialCommunityIcons name="file-document-edit" size={28} color="#FFD700" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.instruction}>
          Paste patient notes below to generate a concise summary.
        </Text>

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
              outlineColor="#E0E0E0"
              activeOutlineColor="#001F3F"
              placeholder="Patient notes, findings, prescriptions..."
            />

            <Button
              mode="contained"
              onPress={generateSummary}
              loading={loading}
              disabled={loading}
              style={styles.button}
              icon="creation"
              labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
            >
              Generate Summary
            </Button>

            <Button
              mode="outlined"
              onPress={onClear}
              style={{ marginTop: 12, borderColor: '#001F3F' }}
              textColor="#001F3F"
            >
              Clear
            </Button>
          </Card.Content>
        </Card>

        {loading && (
          <View style={{ marginTop: 20, alignItems: "center" }}>
            <ActivityIndicator animating size="large" color="#001F3F" />
            <Text style={{ marginTop: 10, color: "#666" }}>Processing with AI...</Text>
          </View>
        )}

        {!loading && summary ? (
          <Card style={styles.summaryCard}>
            <Card.Content>
              <View style={styles.summaryTitleRow}>
                <MaterialCommunityIcons name="text-box-check-outline" size={24} color="#001F3F" />
                <Text style={styles.summaryHeader}>Generated Summary</Text>
              </View>
              <Text style={styles.summaryText}>{summary}</Text>
            </Card.Content>
          </Card>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F4F8" },
  header: {
    backgroundColor: '#001F3F',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  content: { padding: 16 },
  instruction: { fontSize: 14, color: '#666', marginBottom: 12, marginLeft: 4 },

  inputCard: { borderRadius: 16, elevation: 2, backgroundColor: '#fff' },
  input: { backgroundColor: "#fff", marginBottom: 16 },
  button: { backgroundColor: "#001F3F", paddingVertical: 6, borderRadius: 12 },

  summaryCard: { marginTop: 20, borderRadius: 16, elevation: 2, backgroundColor: "#fff" },
  summaryTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  summaryHeader: { fontSize: 18, fontWeight: "700", color: "#001F3F", marginLeft: 8 },
  summaryText: { fontSize: 16, lineHeight: 24, color: "#333" },
});
