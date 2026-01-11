import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, Image, Alert, View } from "react-native";
import { Text, Checkbox, Button, ActivityIndicator, Card } from "react-native-paper";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import NetInfo from "@react-native-community/netinfo";
import uuid from "react-native-uuid";

import AppInput from "../components/AppInput";
import AppButton from "../components/AppButton";

import { addToQueue } from "../db/db";
import { uploadImage, saveSymptomReport } from "../api/firebase/database";
import { useTranslation } from "react-i18next";

const SYMPTOM_OPTIONS = [
  { code: "D", label: "Diarrhea" },
  { code: "C", label: "Cholera Sign (Rice-water Stool)" },
  { code: "F", label: "Fever" },
  { code: "T", label: "Typhoid-like Symptoms" },
];

export default function SymptomReportScreen({ navigation }) {
  const { t } = useTranslation();

  // Form Fields
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [village, setVillage] = useState("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [onsetDate, setOnsetDate] = useState(new Date().toISOString().slice(0, 10));

  // Extra
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  // -----------------------------
  // GET LOCATION
  // -----------------------------
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
      }
    })();
  }, []);

  // -----------------------------
  // TOGGLE SYMPTOM OPTION
  // -----------------------------
  const toggleSymptom = (code: string) => {
    setSymptoms((prev) =>
      prev.includes(code) ? prev.filter((x) => x !== code) : [...prev, code]
    );
  };

  // -----------------------------
  // IMAGE PICKER
  // -----------------------------
  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.5,
    });

    if (!res.canceled) {
      setPhoto(res.assets[0].uri);
    }
  };

  // -----------------------------
  // SUBMIT REPORT
  // -----------------------------
  const submit = async () => {
    if (!name || !age || !gender || symptoms.length === 0) {
      Alert.alert("Missing Fields", "Please fill all required details.");
      return;
    }

    setLoading(true);

    const payload: any = {
      id: uuid.v4(),
      name,
      age,
      gender,
      village,
      symptoms,
      onsetDate,
      timestamp: new Date().toISOString(),
      location,
    };

    try {
      const net = await NetInfo.fetch();

      // Upload photo if exists
      if (photo) {
        const url = await uploadImage(photo, `symptoms/${payload.id}.jpg`);
        payload.photoUrl = url;
      }

      if (net.isConnected) {
        // ONLINE → Send to backend
        await saveSymptomReport(payload);

        setLoading(false);
        Alert.alert("Success", "Symptom report submitted.");
        navigation.goBack();
      } else {
        // OFFLINE → Save locally
        await addToQueue({ id: payload.id, type: "SYMPTOM", payload });

        setLoading(false);
        Alert.alert("Offline", "Saved to offline queue.");
        navigation.goBack();
      }
    } catch (err) {
      console.log(err);

      // Save in queue as fallback
      await addToQueue({ id: payload.id, type: "SYMPTOM", payload });

      setLoading(false);
      Alert.alert("Error", "Something went wrong. Saved offline.");
      navigation.goBack();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.header}>{t("report_symptoms")}</Text>

          <AppInput label="Name" value={name} onChangeText={setName} />
          <AppInput label="Age" value={age} onChangeText={setAge} keyboardType="numeric" />
          <AppInput label="Gender" value={gender} onChangeText={setGender} />
          <AppInput label="Village / Ward" value={village} onChangeText={setVillage} />

          <Text style={styles.section}>Symptoms</Text>
          {SYMPTOM_OPTIONS.map((opt) => (
            <Checkbox.Item
              key={opt.code}
              label={opt.label}
              status={symptoms.includes(opt.code) ? "checked" : "unchecked"}
              onPress={() => toggleSymptom(opt.code)}
            />
          ))}

          <AppInput label="Onset Date" value={onsetDate} onChangeText={setOnsetDate} />

          <Button mode="outlined" onPress={pickPhoto} style={{ marginTop: 10 }}>
            Attach Photo (Optional)
          </Button>

          {photo && (
            <Image source={{ uri: photo }} style={styles.photo} />
          )}

          {loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} />
          ) : (
            <AppButton style={{ marginTop: 20 }} onPress={submit}>
              Submit
            </AppButton>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#F4FAFF" },
  card: { borderRadius: 18, padding: 10 },
  header: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0A4D68",
    marginBottom: 12,
  },
  section: { fontSize: 16, fontWeight: "600", marginTop: 12 },
  photo: {
    width: 140,
    height: 140,
    borderRadius: 10,
    marginTop: 12,
  },
});
