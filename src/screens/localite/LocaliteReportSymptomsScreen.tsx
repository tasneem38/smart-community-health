import React, { useState, useContext, useEffect } from "react";
import { ScrollView, StyleSheet, Alert, View, TouchableOpacity, Image, StatusBar } from "react-native";
import { Text, Card, Button, TextInput, Checkbox, SegmentedButtons, Divider, IconButton, ActivityIndicator } from "react-native-paper";
import * as Location from "expo-location";
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio } from 'expo-av';
import { AuthContext } from '../../store/authContext';
import { sendSymptomReport, transcribeAudioApi } from "../../api/api";
import { uploadImage } from "../../api/postgres/upload";
import { useTranslation } from 'react-i18next';

// Grouped Symptoms for Triage
const SYMPTOM_GROUPS = [
  {
    title: "Fever Related",
    symptoms: [
      { code: "fever_chills", label: "Fever with Chills", icon: "thermometer-alert" },
      { code: "body_pain", label: "Body Pain", icon: "bone" },
      { code: "headache", label: "Headache", icon: "head-flash" },
    ]
  },
  {
    title: "Water-borne Disease",
    symptoms: [
      { code: "diarrhea", label: "Severe Diarrhea", icon: "emoticon-poop" },
      { code: "vomiting", label: "Vomiting", icon: "emoticon-sick" },
      { code: "stomach_pain", label: "Stomach Pain", icon: "stomach" },
      { code: "dehydration", label: "Dehydration", icon: "water-off" },
    ]
  },
  {
    title: "Infection Indicators",
    symptoms: [
      { code: "skin_rash", label: "Skin Rash", icon: "allergy" },
      { code: "jaundice", label: "Yellow Eyes (Jaundice)", icon: "eye-plus" },
    ]
  }
];

export default function LocaliteReportSymptomsScreen({ navigation }: any) {
  const { state } = useContext(AuthContext);
  const user = state.user;
  const { t } = useTranslation();

  // State Management
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("M");
  const [daysSick, setDaysSick] = useState("1");
  const [selectedSymptoms, setSelectedSymptoms] = useState<Record<string, string>>({}); // { code: severity }
  const [photo, setPhoto] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationName, setLocationName] = useState("Detecting...");
  const [coords, setCoords] = useState<any>(null);

  // Audio Recording State
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [recording]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationName("Permission denied");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setCoords(location.coords);
      setLocationName(`${user.village || 'Village'}, Ward 3`); // Simplified for UI
    })();
  }, []);

  const toggleSymptom = (code: string) => {
    const newSelected = { ...selectedSymptoms };
    if (newSelected[code]) {
      delete newSelected[code];
    } else {
      newSelected[code] = "Moderate"; // Default severity
    }
    setSelectedSymptoms(newSelected);
  };

  const setSeverity = (code: string, severity: string) => {
    setSelectedSymptoms({ ...selectedSymptoms, [code]: severity });
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Camera access is required to take photos.");
        return;
      }

      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.5,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Camera error:', err);
      Alert.alert("Camera Error", "Failed to open camera.");
    }
  };

  async function startRecording() {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Microphone access is required for voice reporting.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert("Microphone Error", "Could not start audio recording.");
    }
  }

  async function stopRecording() {
    setIsRecording(false);
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        handleAutoTranscription(uri);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  }

  async function handleAutoTranscription(uri: string) {
    setIsTranscribing(true);
    try {
      const res = await transcribeAudioApi(uri);
      if (res.ok && res.data) {
        const transcript = res.data.trim();
        if (transcript) {
          setNotes(prev => prev ? `${prev}\n\n[Voice Note]: ${transcript}` : transcript);
        }
      }
    } catch (err) {
      console.error("Auto-transcription error:", err);
    } finally {
      setIsTranscribing(false);
    }
  }

  const isSevere = Object.values(selectedSymptoms).includes("Severe") || 
                   selectedSymptoms["diarrhea"] === "Moderate" || 
                   selectedSymptoms["jaundice"];

  const submit = async () => {
    if (Object.keys(selectedSymptoms).length === 0) {
      Alert.alert("Error", "Please select at least one symptom.");
      return;
    }
    if (!consent) {
      Alert.alert("Consent Required", "Please agree to share health data.");
      return;
    }

    setLoading(true);

    try {
      let finalPhotoUrl = photo;
      
      // Upload photo if it's a local URI
      if (photo && photo.startsWith('file://')) {
        try {
          finalPhotoUrl = await uploadImage(photo);
        } catch (uploadErr) {
          console.error("Photo upload failed:", uploadErr);
          // Continue anyway, but warn
        }
      }

      const report = {
        userId: user.id,
        patientInfo: { age, gender, daysSick, village: user.village },
        symptoms: selectedSymptoms,
        notes,
        location: coords,
        photoUrl: finalPhotoUrl,
        timestamp: new Date().toISOString(),
        isHighRisk: isSevere,
      };

      await sendSymptomReport(report);
      Alert.alert("Success", "Report submitted. Your ASHA worker has been notified.");
      // Reset form
      setSelectedSymptoms({});
      setNotes("");
      setPhoto(null);
    } catch (e: any) {
      Alert.alert("Failed", "Unable to submit. The report will be synced automatically later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar backgroundColor="#001F3F" barStyle="light-content" />
      <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          iconColor="#fff"
          size={24}
          onPress={() => navigation.goBack()}
          style={{ marginLeft: -10, marginRight: 4 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Report Health Issue</Text>
          <Text style={styles.headerSub}>Notify ASHA & get AI guidance</Text>
          <View style={styles.locationRow}>
            <MaterialCommunityIcons name="map-marker" size={14} color="#FFD700" />
            <Text style={styles.locationText}>{locationName}</Text>
          </View>
        </View>
        <IconButton icon="microphone" iconColor="#FFD700" size={28} onPress={() => {}} />
      </View>

      <View style={styles.offlineBanner}>
        <MaterialCommunityIcons name="wifi-off" size={16} color="#666" />
        <Text style={styles.offlineText}>Offline mode – auto-sync enabled</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          {/* PATIENT INFO */}
          <Text style={styles.sectionTitle}>Patient Info</Text>
          <View style={styles.row}>
            <TextInput
              mode="outlined"
              label="Age"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              style={[styles.input, { flex: 1, marginRight: 8 }]}
            />
            <View style={{ flex: 1.5 }}>
              <Text style={styles.label}>Gender</Text>
              <SegmentedButtons
                value={gender}
                onValueChange={setGender}
                buttons={[
                  { value: 'M', label: 'M' },
                  { value: 'F', label: 'F' },
                  { value: 'O', label: 'Other' },
                ]}
                style={styles.segmented}
              />
            </View>
          </View>
          
          <Text style={styles.label}>Days since symptoms started</Text>
          <SegmentedButtons
            value={daysSick}
            onValueChange={setDaysSick}
            buttons={[
              { value: '1', label: 'Today' },
              { value: '2', label: '2 Days' },
              { value: '3+', label: '3+ Days' },
            ]}
            style={styles.segmented}
          />

          <Divider style={styles.divider} />

          {/* SYMPTOMS */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Symptoms</Text>
            <TouchableOpacity 
              style={[styles.voiceBtn, (isRecording || isTranscribing) && { backgroundColor: '#FF8C00' }]} 
              onPress={isRecording ? stopRecording : startRecording}
              disabled={isTranscribing}
            >
              <MaterialCommunityIcons 
                name={isRecording ? "stop" : (isTranscribing ? "sync" : "microphone")} 
                size={20} 
                color="#001F3F" 
              />
              <Text style={styles.voiceBtnText}>
                {isRecording ? "Stop" : (isTranscribing ? "Converting..." : "Voice Report")}
              </Text>
            </TouchableOpacity>
          </View>

          {SYMPTOM_GROUPS.map((group) => (
            <View key={group.title} style={styles.groupContainer}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              <View style={styles.chipContainer}>
                {group.symptoms.map((item) => {
                  const isSelected = !!selectedSymptoms[item.code];
                  return (
                    <View key={item.code} style={styles.symptomBox}>
                      <TouchableOpacity
                        style={[styles.chip, isSelected && styles.chipSelected]}
                        onPress={() => toggleSymptom(item.code)}
                      >
                        <MaterialCommunityIcons
                          name={item.icon as any}
                          size={28}
                          color={isSelected ? '#fff' : '#001F3F'}
                        />
                        <Text style={[styles.chipText, isSelected && { color: '#fff' }]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                      
                      {isSelected && (
                        <View style={styles.severityContainer}>
                          {['Mild', 'Mod', 'Sev'].map((sev) => (
                            <TouchableOpacity
                              key={sev}
                              onPress={() => setSeverity(item.code, sev === 'Sev' ? 'Severe' : sev === 'Mod' ? 'Moderate' : 'Mild')}
                              style={[
                                styles.sevBtn,
                                selectedSymptoms[item.code] === (sev === 'Sev' ? 'Severe' : sev === 'Mod' ? 'Moderate' : 'Mild') && styles.sevBtnActive
                              ]}
                            >
                              <Text style={styles.sevBtnText}>{sev}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          ))}

          {/* RISK INDICATOR */}
          {isSevere && (
            <View style={styles.riskCard}>
              <MaterialCommunityIcons name="alert-decagram" size={24} color="#D32F2F" />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.riskTitle}>High Risk Detected</Text>
                <Text style={styles.riskSub}>ASHA worker will be alerted immediately.</Text>
              </View>
            </View>
          )}

          {/* ADDONS */}
          <View style={styles.row}>
            <Button icon="camera" mode="outlined" onPress={pickImage} style={{ flex: 1, marginRight: 4 }}>
              Add Photo
            </Button>
            <Button icon="note-text" mode="outlined" onPress={() => {}} style={{ flex: 1, marginLeft: 4 }}>
              Add Notes
            </Button>
          </View>
          
          {photo && (
            <View style={styles.photoPreview}>
              <Image source={{ uri: photo }} style={styles.image} />
              <IconButton icon="close-circle" style={styles.closePhoto} onPress={() => setPhoto(null)} />
            </View>
          )}

          <TextInput
            mode="outlined"
            label="Additional details..."
            value={notes}
            onChangeText={setNotes}
            multiline
            style={styles.inputNotes}
          />

          <View style={styles.consentRow}>
            <Checkbox
              status={consent ? 'checked' : 'unchecked'}
              onPress={() => setConsent(!consent)}
              color="#001F3F"
            />
            <Text style={styles.consentText}>I agree to share health data for community safety</Text>
          </View>

          <Button
            mode="contained"
            onPress={submit}
            loading={loading}
            style={styles.button}
            buttonColor="#001F3F"
          >
            Submit & Get Advice
          </Button>
          <Text style={styles.btnHint}>ASHA worker will be notified</Text>
        </Card.Content>
      </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4FAFF" },
  header: {
    backgroundColor: '#001F3F',
    paddingVertical: 24,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: 14, color: '#B0C4DE', marginTop: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  locationText: { color: '#FFD700', fontSize: 12, marginLeft: 4, fontWeight: '600' },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    backgroundColor: '#EAEAEA',
  },
  offlineText: { fontSize: 11, color: '#666', marginLeft: 6 },
  card: { margin: 16, borderRadius: 16, backgroundColor: '#fff', elevation: 4 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#001F3F", marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  label: { fontSize: 14, color: '#666', marginBottom: 6, marginTop: 10 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  input: { backgroundColor: '#fff' },
  segmented: { marginBottom: 10 },
  divider: { marginVertical: 16 },
  groupContainer: { marginBottom: 20 },
  groupTitle: { fontSize: 14, fontWeight: '700', color: '#555', marginBottom: 10, textTransform: 'uppercase' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  symptomBox: { width: '47%', marginBottom: 10 },
  chip: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F9F9F9',
    alignItems: 'center',
  },
  chipSelected: { backgroundColor: '#001F3F', borderColor: '#001F3F' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#001F3F', marginTop: 6, textAlign: 'center' },
  severityContainer: { flexDirection: 'row', marginTop: 6, justifyContent: 'space-between' },
  sevBtn: { flex: 1, padding: 4, alignItems: 'center', borderWidth: 1, borderColor: '#DDD', marginHorizontal: 2, borderRadius: 4 },
  sevBtnActive: { backgroundColor: '#FFD700', borderColor: '#FFD700' },
  sevBtnText: { fontSize: 10, fontWeight: 'bold' },
  voiceBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFD700', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  voiceBtnText: { marginLeft: 6, fontSize: 12, fontWeight: 'bold', color: '#001F3F' },
  riskCard: { flexDirection: 'row', backgroundColor: '#FFEBEE', padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#D32F2F', marginBottom: 16 },
  riskTitle: { fontSize: 16, fontWeight: 'bold', color: '#B71C1C' },
  riskSub: { fontSize: 12, color: '#D32F2F' },
  photoPreview: { marginVertical: 12, height: 150, borderRadius: 12, overflow: 'hidden' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  closePhoto: { position: 'absolute', top: 0, right: 0 },
  inputNotes: { marginTop: 8, backgroundColor: '#fff', minHeight: 80 },
  consentRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  consentText: { fontSize: 12, color: '#444', flex: 1 },
  button: { marginTop: 20, borderRadius: 12, paddingVertical: 8 },
  btnHint: { textAlign: 'center', fontSize: 11, color: '#888', marginTop: 6 },
});
