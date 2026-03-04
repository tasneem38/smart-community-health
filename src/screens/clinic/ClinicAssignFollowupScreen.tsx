import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Card, Text, Button, TextInput, Snackbar } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { assignFollowup } from "../../api/api";

export default function ClinicAssignFollowupScreen() {
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

      await assignFollowup({
        patient,
        task,
        status: "pending"
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
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Assign Follow-up</Text>
            <Text style={styles.headerSub}>Deploy ASHA workers</Text>
          </View>
          <MaterialCommunityIcons name="account-arrow-right" size={28} color="#FFD700" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="Patient Name"
              mode="outlined"
              value={patient}
              onChangeText={setPatient}
              style={styles.input}
              outlineColor="#E0E0E0"
              activeOutlineColor="#001F3F"
            />

            <TextInput
              label="Follow-up Task"
              mode="outlined"
              value={task}
              onChangeText={setTask}
              multiline
              numberOfLines={3}
              style={styles.input}
              outlineColor="#E0E0E0"
              activeOutlineColor="#001F3F"
            />

            <Button
              mode="contained"
              onPress={handleAssign}
              loading={loading}
              disabled={loading}
              style={styles.button}
              labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
              icon="send"
            >
              Assign Task
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={snack.visible}
        onDismiss={() => setSnack({ visible: false, msg: "" })}
        duration={2500}
        style={{ margin: 16, borderRadius: 8 }}
      >
        {snack.msg}
      </Snackbar>
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
  card: { borderRadius: 16, backgroundColor: '#fff', elevation: 2 },
  input: {
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#001F3F",
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
});
