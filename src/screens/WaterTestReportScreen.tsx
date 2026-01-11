import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Image,
  View,
  StyleSheet,
  Alert,
} from "react-native";
import {
  Text,
  Card,
  TextInput,
  Button,
  Switch,
  HelperText,
  ActivityIndicator,
  Snackbar,
  IconButton,
} from "react-native-paper";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import uuid from "react-native-uuid";
import NetInfo from "@react-native-community/netinfo";
import { addToQueue } from "../db/db";
import { saveWaterTest } from "../api/firebase/database";
import * as SMS from "expo-sms";

export default function WaterTestReportScreen({ navigation }: any) {
  const [turbidity, setTurbidity] = useState("");
  const [ph, setPh] = useState("");
  const [conductivity, setConductivity] = useState("");
  const [bacterial, setBacterial] = useState(false);
  const [village, setVillage] = useState("");

  const [photo, setPhoto] = useState<string | undefined>();
  const [location, setLocation] = useState(null as any);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ visible: false, message: "" });

  /* ------------------------------
      NETWORK + LOCATION SETUP
  ------------------------------- */
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) =>
      setIsConnected(Boolean(state.isConnected))
    );

    fetchLocation();
    return () => unsubscribe();
  }, []);

  const fetchLocation = async () => {
    try {
      setGettingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Location Permission Needed");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    } catch {
      Alert.alert("Location Error", "Unable to fetch GPS");
    } finally {
      setGettingLocation(false);
    }
  };

  /* ------------------------------
        PHOTO PICKER
  ------------------------------- */
  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return Alert.alert("Camera permission needed");

    const pic = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    if (!pic.canceled) setPhoto(pic.assets[0].uri);
  };

  const pickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert("Gallery permission needed");

    const pic = await ImagePicker.launchImageLibraryAsync({ quality: 0.6 });
    if (!pic.canceled) setPhoto(pic.assets[0].uri);
  };

  /* ------------------------------
        VALIDATION
  ------------------------------- */
  const isNumeric = (v: string) => v.trim() !== "" && !isNaN(Number(v));

  const formValid = () =>
    location &&
    village.trim() !== "" &&
    isNumeric(turbidity) &&
    isNumeric(ph) &&
    isNumeric(conductivity);

  /* ------------------------------
    BUILD SMS FALLBACK PAYLOAD
  ------------------------------- */
  const buildSmsPayload = (p: any) =>
    `WATER|${p.id}|T:${p.turbidity}|PH:${p.ph}|C:${p.conductivity}|B:${
      p.bacterial ? 1 : 0
    }|LOC:${p.location.latitude},${p.location.longitude}|V:${p.village}|TS:${
      p.timestamp
    }`;

  /* ------------------------------
          SUBMIT REPORT
  ------------------------------- */
  const submit = async () => {
    if (!formValid()) {
      setSnack({
        visible: true,
        message: "Fill all fields correctly and allow location",
      });
      return;
    }

    const payload = {
      id: String(uuid.v4()),
      turbidity: Number(turbidity),
      ph: Number(ph),
      conductivity: Number(conductivity),
      bacterial,
      village,
      location,
      photo: photo || null,
      timestamp: new Date().toISOString(),
    };

    Alert.alert("Submit Water Test", "Confirm submission?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Submit",
        onPress: async () => {
          setLoading(true);

          const net = await NetInfo.fetch();
          const online = net.isConnected;

          try {
            if (online) {
              // 🔵 Send to Firebase
              await saveWaterTest(payload);
              setSnack({ visible: true, message: "Water test submitted!" });
            } else {
              // 🔴 Offline → Queue locally
              await addToQueue({
                id: payload.id,
                type: "WATER_TEST",
                payload,
              });
              setSnack({
                visible: true,
                message: "Offline: saved to queue",
              });

              // 📩 Optional SMS fallback
              const canSMS = await SMS.isAvailableAsync();
              if (canSMS)
                await SMS.sendSMSAsync(["108"], buildSmsPayload(payload));
            }
          } catch (err) {
            await addToQueue({
              id: payload.id,
              type: "WATER_TEST",
              payload,
            });
            setSnack({
              visible: true,
              message: "Error: saved offline",
            });
          } finally {
            setLoading(false);
            navigation.goBack();
          }
        },
      },
    ]);
  };

  /* ------------------------------
           UI LAYOUT
  ------------------------------- */
  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text style={styles.headerTitle}>Water Quality Test</Text>
          <Text style={styles.sub}>
            Enter turbidity, pH, conductivity & bacteria presence.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.formCard}>
        <Card.Content>
          <TextInput
            label="Village / Area"
            mode="outlined"
            value={village}
            onChangeText={setVillage}
            style={styles.input}
          />

          <TextInput
            label="Turbidity (NTU)"
            mode="outlined"
            value={turbidity}
            keyboardType="numeric"
            onChangeText={setTurbidity}
            style={styles.input}
          />

          <TextInput
            label="pH Level"
            mode="outlined"
            value={ph}
            keyboardType="numeric"
            onChangeText={setPh}
            style={styles.input}
          />

          <TextInput
            label="Conductivity (µS/cm)"
            mode="outlined"
            value={conductivity}
            keyboardType="numeric"
            onChangeText={setConductivity}
            style={styles.input}
          />

          <View style={styles.row}>
            <Text style={styles.label}>Bacterial Presence</Text>
            <Switch value={bacterial} onValueChange={setBacterial} />
          </View>

          {/* LOCATION */}
          <View style={{ marginTop: 18 }}>
            <Text style={styles.label}>GPS Location</Text>
            <Text>
              {location
                ? `Lat: ${location.latitude.toFixed(
                    5
                  )}, Lon: ${location.longitude.toFixed(5)}`
                : "Fetching location..."}
            </Text>

            <Button
              mode="outlined"
              onPress={fetchLocation}
              style={{ marginTop: 6 }}
            >
              Refresh GPS
            </Button>
            {gettingLocation && <ActivityIndicator style={{ marginTop: 6 }} />}
          </View>

          {/* PHOTO */}
          <View style={{ marginTop: 22 }}>
            <Text style={styles.label}>Optional Photo</Text>

            <View style={styles.buttonRow}>
              <Button mode="contained" onPress={takePhoto}>
                Take Photo
              </Button>
              <Button mode="outlined" onPress={pickFromGallery}>
                Gallery
              </Button>
            </View>

            {photo && (
              <View style={styles.photoRow}>
                <Image source={{ uri: photo }} style={styles.photo} />
                <IconButton icon="close" onPress={() => setPhoto(undefined)} />
              </View>
            )}
          </View>

          <Button
            mode="contained"
            loading={loading}
            style={styles.submitBtn}
            onPress={submit}
          >
            Submit Water Test
          </Button>

          <Button mode="text" onPress={() => navigation.goBack()}>
            Cancel
          </Button>
        </Card.Content>
      </Card>

      <Snackbar
        visible={snack.visible}
        onDismiss={() => setSnack({ visible: false, message: "" })}
      >
        {snack.message}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12, backgroundColor: "#F6FAFF" },
  headerCard: { borderRadius: 16, marginBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#015D7C" },
  sub: { marginTop: 6, color: "#555" },
  formCard: { borderRadius: 16 },
  input: { marginBottom: 14 },
  label: { fontWeight: "700", marginBottom: 6 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  buttonRow: { flexDirection: "row", marginTop: 10, gap: 10 },
  photoRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  photo: { width: 120, height: 120, borderRadius: 10 },
  submitBtn: { marginTop: 20, backgroundColor: "#015D7C" },
});
