import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Card, Text, Button, TextInput, Snackbar } from "react-native-paper";

import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { app } from "../../api/firebase/config";

export default function ClinicAssignFollowupScreen() {
  const db = getFirestore(app);

  const [patient, setPatient] = useState("");
  const [task, setTask] = useState("");
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ visible: false, msg: "" });

  const handleAssign = async () => {
    if (!patient.trim() || !task.trim()) {
      setSnack({ visible: true, msg: "Please fill in all fields." });
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "followups"), {
        patient,
        task,
        assignedAt: serverTimestamp(),
        status: "pending",
      });

      setSnack({ visible: true, msg: "Follow-up assigned successfully!" });

      // Reset fields
      setPatient("");
      setTask("");
    } catch (error) {
      console.log(error);
      setSnack({ visible: true, msg: "Error assigning follow-up." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Assign Follow-up 🩺</Text>

      <Card style={styles.card}>
        <Card.Content>
          <TextInput
            label="Patient Name"
            mode="outlined"
            value={patient}
            onChangeText={setPatient}
            style={styles.input}
          />

          <TextInput
            label="Follow-up Task"
            mode="outlined"
            value={task}
            onChangeText={setTask}
            multiline
            numberOfLines={3}
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleAssign}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Assign Task
          </Button>
        </Card.Content>
      </Card>

      <Snackbar
        visible={snack.visible}
        onDismiss={() => setSnack({ visible: false, msg: "" })}
        duration={2500}
      >
        {snack.msg}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, backgroundColor: "#F6FAFF" },
  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 14,
    color: "#0A4D68",
  },
  card: {
    borderRadius: 18,
    paddingVertical: 10,
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#0A4D68",
    paddingVertical: 6,
    borderRadius: 10,
  },
});
