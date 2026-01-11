import React, { useState, useContext } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Text, Card, TextInput, Button, ActivityIndicator } from "react-native-paper";
import { AuthContext } from "../../store/authContext";
import { saveAssistanceRequest } from "../../api/firebase/database";

export default function LocaliteRequestAssistanceScreen() {
  const { state } = useContext(AuthContext);
  const user = state?.user;

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!msg.trim()) {
      alert("Please describe your issue.");
      return;
    }

    setLoading(true);

    try {
      await saveAssistanceRequest({
        message: msg,
        userId: user.id,
        timestamp: new Date().toISOString(),
      });

      alert("Your request has been sent to your ASHA worker.");
      setMsg("");
    } catch (e) {
      console.log(e);
      alert("Failed to send request. Try again.");
    }

    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Request Assistance</Text>

          <TextInput
            label="Describe your issue"
            mode="outlined"
            value={msg}
            onChangeText={setMsg}
            multiline
            numberOfLines={5}
            style={{ marginTop: 10 }}
          />

          {loading ? (
            <ActivityIndicator style={{ marginTop: 16 }} />
          ) : (
            <Button mode="contained" style={styles.btn} onPress={submit}>
              Submit Request
            </Button>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#F4FAFF" },
  card: { borderRadius: 18 },
  title: { fontSize: 22, fontWeight: "700", color: "#0A4D68" },
  btn: { marginTop: 14, paddingVertical: 6 },
});
