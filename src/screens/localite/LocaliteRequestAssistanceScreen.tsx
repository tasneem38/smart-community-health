import React, { useState, useContext } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text, Card, TextInput, Button, ActivityIndicator, HelperText } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AuthContext } from "../../store/authContext";
import { saveAssistanceRequest } from "../../api/firebase/database";
import AppInput from "../../components/AppInput";

export default function LocaliteRequestAssistanceScreen({ navigation }: any) {
  const { state } = useContext(AuthContext);
  const user = state?.user;

  const [msg, setMsg] = useState("");
  const [village, setVillage] = useState(user?.village || ""); // Pre-fill if available
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!msg.trim() || !village.trim()) {
      alert("Please provide your village and describe your issue.");
      return;
    }

    setLoading(true);

    try {
      await saveAssistanceRequest({
        message: msg,
        userId: user.id || "Unknown",
        village: village,
        timestamp: new Date().toISOString(),
      });

      alert("Request Sent! An ASHA worker will review it shortly.");
      setMsg("");
      navigation.goBack();
    } catch (e) {
      console.log(e);
      alert("Failed to send request. Check your connection.");
    }

    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Need Help?</Text>
          <Text style={styles.headerSub}>Request assistance from ASHA</Text>
        </View>
        <MaterialCommunityIcons name="hand-heart" size={40} color="#FFD700" />
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.introText}>
            Describe your health or community issue below. Your local ASHA worker will be notified.
          </Text>

          <AppInput
            label="Your Village / Locality"
            value={village}
            onChangeText={setVillage}
            placeholder="e.g. Rampur"
            left={<TextInput.Icon icon="map-marker" />}
          />

          <TextInput
            label="Describe the Issue"
            mode="flat"
            value={msg}
            onChangeText={setMsg}
            multiline
            numberOfLines={6}
            style={styles.textArea}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            placeholder="Start typing..."
          />
          <HelperText type="info" visible={true}>
            Please include specific details.
          </HelperText>

          {loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} color="#001F3F" />
          ) : (
            <Button
              mode="contained"
              style={styles.submitBtn}
              labelStyle={{ fontSize: 16, fontWeight: '700' }}
              onPress={submit}
              icon="send"
            >
              Submit Request
            </Button>
          )}

        </Card.Content>
      </Card>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8"
  },

  /* HEADER */
  header: {
    backgroundColor: '#001F3F',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
  },
  headerSub: {
    fontSize: 14,
    color: "#B0C4DE",
    marginTop: 2,
  },

  /* CARD */
  card: {
    borderRadius: 16,
    marginHorizontal: 16,
    elevation: 3,
    backgroundColor: '#fff',
  },
  introText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  textArea: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginTop: 10,
    paddingHorizontal: 0,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  submitBtn: {
    marginTop: 24,
    paddingVertical: 6,
    backgroundColor: '#001F3F',
    borderRadius: 12,
  },
});
