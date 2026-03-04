import React, { useState, useContext, useEffect } from "react";
import { ScrollView, StyleSheet, View, TouchableOpacity, Modal } from "react-native";
import { Text, TextInput, Button, ActivityIndicator, Card, HelperText, IconButton, Portal, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio } from 'expo-av';
// @ts-ignore
import * as Speech from 'expo-speech';
import { AuthContext } from "../../store/authContext";
import { useTranslation } from 'react-i18next';
import { sendAssistanceRequest } from "../../api/api";
import { uploadAudio } from "../../api/postgres/upload";
import AppInput from "../../components/AppInput";

export default function LocaliteRequestAssistanceScreen({ navigation }: any) {
  const { state } = useContext(AuthContext);
  const user = state?.user;

  const [msg, setMsg] = useState("");
  const [village, setVillage] = useState(user?.village || "");
  const [loading, setLoading] = useState(false);

  // Audio Recording State
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // AI Solutions State
  const [solutions, setSolutions] = useState<string[]>([]);
  const [showSolutions, setShowSolutions] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      Speech.stop();
    };
  }, [sound]);

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(recording);
        setIsRecording(true);
      } else {
        alert('Permission to access microphone is required!');
      }
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    setIsRecording(false);
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioUri(uri);
      setRecording(null);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  }

  async function playSound() {
    if (!audioUri) return;
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
      setSound(sound);
      await sound.playAsync();
    } catch (err) {
      console.error('Failed to play sound', err);
    }
  }

  const speakSolutions = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = solutions.join(". ") + ". These are temporary suggestions. Wait for your ASHA worker.";
    setIsSpeaking(true);
    Speech.speak(textToSpeak, {
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const submit = async () => {
    if (!msg.trim() && !audioUri) {
      alert("Please describe your issue with text or a voice message.");
      return;
    }
    if (!village.trim()) {
      alert("Please provide your village.");
      return;
    }

    setLoading(true);

    try {
      let finalAudioUrl = null;
      if (audioUri) {
        finalAudioUrl = await uploadAudio(audioUri);
      }

      const res: any = await sendAssistanceRequest({
        village: village,
        description: msg || (audioUri ? "[Voice Message]" : ""),
        userId: user?.id,
        userName: user?.name,
        audioUrl: finalAudioUrl,
        timestamp: new Date().toISOString()
      });

      if (res.ok) {
        if (res.solutions && res.solutions.length > 0) {
          setSolutions(res.solutions);
          setShowSolutions(true);
        } else {
          alert("Request Sent! An ASHA worker will review it shortly.");
          navigation.goBack();
        }
      } else {
        alert("Failed to send request.");
      }

      setMsg("");
      setAudioUri(null);
    } catch (e) {
      console.log(e);
      alert("Failed to send request. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Need Help?</Text>
            <Text style={styles.headerSub}>Request assistance from ASHA</Text>
          </View>
          <MaterialCommunityIcons name="hand-heart" size={40} color="#FFD700" />
        </View>

        {/* QUICK CALL BANNER */}
        <TouchableOpacity
          style={styles.callBanner}
          onPress={() => navigation.navigate('HelplineCall')}
          activeOpacity={0.8}
        >
          <View style={styles.callBannerIcon}>
            <MaterialCommunityIcons name="phone-in-talk" size={28} color="#fff" />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.callBannerTitle}>Need Immediate Help?</Text>
            <Text style={styles.callBannerSub}>Tap to call the Health Helpline</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#D9534F" />
        </TouchableOpacity>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.introText}>
              Describe your health or community issue below. You can type it or record a voice message.
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
              numberOfLines={4}
              style={styles.textArea}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              placeholder="Start typing..."
            />

            {/* AUDIO SECTION */}
            <View style={styles.audioSection}>
              <View style={styles.audioRow}>
                <IconButton
                  icon={isRecording ? "stop-circle" : "microphone"}
                  iconColor={isRecording ? "#d32f2f" : "#001F3F"}
                  size={40}
                  onPress={isRecording ? stopRecording : startRecording}
                  animated
                />
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text style={{ fontWeight: '700', color: isRecording ? '#d32f2f' : '#001F3F' }}>
                    {isRecording ? "Recording... (Tap to stop)" : audioUri ? "Audio Recorded" : "Record Voice Message"}
                  </Text>
                  {isRecording && <Text style={{ fontSize: 10, color: '#d32f2f' }}>Microphone is active</Text>}
                </View>

                {audioUri && !isRecording && (
                  <View style={{ flexDirection: 'row' }}>
                    <IconButton icon="play" iconColor="#2e7d32" onPress={playSound} />
                    <IconButton icon="delete" iconColor="#757575" onPress={() => setAudioUri(null)} />
                  </View>
                )}
              </View>
            </View>

            <HelperText type="info" visible={true}>
              Voice messages are great if you find typing difficult.
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

      {/* AI SOLUTIONS MODAL */}
      <Portal>
        <Modal
          visible={showSolutions}
          onDismiss={() => {
            setShowSolutions(false);
            Speech.stop();
            navigation.goBack();
          }}
          // @ts-ignore
          contentContainerStyle={styles.modalContent}
        >
          <IconButton
            icon="close"
            size={24}
            onPress={() => {
              setShowSolutions(false);
              Speech.stop();
              navigation.goBack();
            }}
            style={styles.closeBtn}
          />

          <View style={styles.aiHeader}>
            <MaterialCommunityIcons name="robot" size={32} color="#001F3F" />
            <Text style={styles.aiTitle}>Temporary Solutions</Text>
          </View>

          <Text style={styles.aiSubtitle}>While you wait for your ASHA worker, you can try these:</Text>

          <ScrollView style={styles.solutionsContainer}>
            {solutions.map((item, index) => (
              <View key={index} style={styles.solutionItem}>
                <MaterialCommunityIcons name="check-circle" size={20} color="#2E7D32" />
                <Text style={styles.solutionText}>{item}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerText}>
              These are temporary suggestions. Always wait for your ASHA worker for professional medical advice.
            </Text>
          </View>

          <Button
            mode="contained"
            icon={isSpeaking ? "stop" : "volume-high"}
            onPress={speakSolutions}
            style={styles.ttsBtn}
            labelStyle={{ color: '#fff' }}
          >
            {isSpeaking ? "Stop Voice" : "Listen to Advice"}
          </Button>

          <Button
            mode="outlined"
            onPress={() => {
              setShowSolutions(false);
              Speech.stop();
              navigation.goBack();
            }}
            style={styles.doneBtn}
          >
            Got it
          </Button>
        </Modal>
      </Portal>
    </View>
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
  audioSection: {
    marginTop: 16,
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#001F3F',
    padding: 4,
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitBtn: {
    marginTop: 24,
    paddingVertical: 6,
    backgroundColor: '#001F3F',
    borderRadius: 12,
  },

  /* MODAL */
  modalContent: {
    backgroundColor: 'white',
    padding: 24,
    margin: 20,
    borderRadius: 24,
    elevation: 5,
  },
  closeBtn: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  aiTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#001F3F',
    marginLeft: 12,
  },
  aiSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  solutionsContainer: {
    marginBottom: 20,
  },
  solutionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F1F8E9',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  solutionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  disclaimerBox: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#E65100',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  ttsBtn: {
    backgroundColor: '#001F3F',
    borderRadius: 12,
    marginBottom: 12,
  },
  doneBtn: {
    borderColor: '#001F3F',
    borderRadius: 12,
  },

  /* CALL BANNER */
  callBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#D9534F',
    elevation: 3,
    shadowColor: '#D9534F',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  callBannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D9534F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#D9534F',
  },
  callBannerSub: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
});
