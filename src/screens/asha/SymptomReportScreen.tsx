import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import { Text, TextInput, Button, Checkbox, ActivityIndicator, Card, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import NetInfo from "@react-native-community/netinfo";
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../store/authContext';
// @ts-ignore
import { API_URL } from '../../api/postgres/client';

import AppInput from "../../components/AppInput";
import AppButton from "../../components/AppButton";

import { addToQueue } from "../../db/db";
import { uploadImage, saveSymptomReport } from "../../api/firebase/database";

// -----------------------------------------------------
// 1. SYMPTOM CATEGORIES (North India Focus)
// -----------------------------------------------------
const SYMPTOM_GROUPS = [
  {
    category_key: "cat_fever",
    color: "#D9534F",
    icon: "thermometer-alert",
    items: [
      { code: "high_fever", label_key: "sym_high_fever" },
      { code: "intermittent_fever", label_key: "sym_intermittent_fever" },
      { code: "severe_headache", label_key: "sym_severe_headache" },
      { code: "joint_pain", label_key: "sym_joint_pain" },
    ],
  },
  {
    category_key: "cat_gastro",
    color: "#F0AD4E", // Orange
    icon: "stomach",
    items: [
      { code: "severe_diarrhea", label_key: "sym_severe_diarrhea" },
      { code: "vomiting", label_key: "sym_vomiting" },
      { code: "abdominal_pain", label_key: "sym_abdominal_pain" },
      { code: "dehydration", label_key: "sym_dehydration" },
    ],
  },
  {
    category_key: "cat_resp_skin",
    color: "#5BC0DE", // Blue
    icon: "lungs",
    items: [
      { code: "persistent_cough", label_key: "sym_persistent_cough" },
      { code: "breathlessness", label_key: "sym_breathlessness" },
      { code: "skin_rash", label_key: "sym_skin_rash" },
      { code: "jaundice", label_key: "sym_jaundice" },
    ],
  },
];

export default function SymptomReportScreen({ navigation }: any) {
  const { t } = useTranslation();

  // Patient Info
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [village, setVillage] = useState("");
  const [phone, setPhone] = useState("");

  // Clinical Data
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [onsetDate, setOnsetDate] = useState(new Date().toISOString().slice(0, 10));

  // Meta
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
  // TOGGLE SYMPTOM
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
      allowsEditing: true, quality: 0.5,
    });
    if (!res.canceled) {
      setPhoto(res.assets[0].uri);
    }
  };

  // -----------------------------
  // SUBMIT
  // -----------------------------
  const submit = async () => {
    if (!name || !age || !gender || symptoms.length === 0) {
      Alert.alert(t('missing_fields'), t('missing_fields_desc'));
      return;
    }

    setLoading(true);

    const payload: any = {
      id: "report-" + Date.now().toString(),
      name,
      age,
      gender,
      village,
      phone,
      symptoms,
      onsetDate,
      timestamp: new Date().toISOString(),
      location: location,
      reporterRole: "ASHA", // Assuming ASHA worker
    };

    try {
      const net = await NetInfo.fetch();

      // Upload photo if exists
      if (photo) {
        // This is a shim, in real app upload and get URL
        const url = await uploadImage(photo, `symptoms/${payload.id}.jpg`);
        payload.photoUrl = url;
      }

      if (net.isConnected) {
        await saveSymptomReport(payload);
        Alert.alert(t('success'), t('report_success_msg'));
        navigation.goBack();
      } else {
        await addToQueue({ id: payload.id, type: "SYMPTOM", payload });
        Alert.alert(t('saved_offline'), t('saved_offline_msg'));
        navigation.goBack();
      }
    } catch (err) {
      console.log(err);
      await addToQueue({ id: payload.id, type: "SYMPTOM", payload });
      Alert.alert(t('network_error'), t('saved_offline_msg'));
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t("report_symptoms")}</Text>
          <Text style={styles.headerSub}>{t("asha_portal")}</Text>
        </View>
        <MaterialCommunityIcons name="medical-bag" size={32} color="#FFD700" />
      </View>

      {/* PATIENT FORM CARD */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionHeader}>
            <MaterialCommunityIcons name="account" size={18} /> {t('patient_details')}
          </Text>
          <Divider style={styles.divider} />

          <AppInput label={t('name')} value={name} onChangeText={setName} />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <AppInput label={t('age')} value={age} onChangeText={setAge} keyboardType="numeric" />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <AppInput label={t('gender')} value={gender} onChangeText={setGender} />
            </View>
          </View>

          <AppInput label={t('village')} value={village} onChangeText={setVillage} />
          <AppInput label={t('phone_optional')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        </Card.Content>
      </Card>

      {/* SYMPTOMS SECTION */}
      <View style={styles.symptomSection}>
        <Text style={styles.sectionMainTitle}>{t('observed_symptoms')}</Text>
        <Text style={styles.helperText}>{t('select_symptoms_helper')}</Text>

        {SYMPTOM_GROUPS.map((group, idx) => (
          <Card key={idx} style={[styles.symptomCard, { borderLeftColor: group.color }]}>
            <Card.Content>
              <View style={styles.groupHeader}>
                <MaterialCommunityIcons name={group.icon as any} size={24} color={group.color} />
                <Text style={[styles.groupTitle, { color: group.color }]}>{t(group.category_key)}</Text>
              </View>

              <View style={styles.chipContainer}>
                {group.items.map((item) => {
                  const isSelected = symptoms.includes(item.code);
                  return (
                    <TouchableOpacity
                      key={item.code}
                      style={[styles.chip, isSelected && { backgroundColor: group.color }]}
                      onPress={() => toggleSymptom(item.code)}
                    >
                      <Text style={[styles.chipText, isSelected && { color: '#fff' }]}>
                        {t(item.label_key)}
                      </Text>
                      {isSelected && <MaterialCommunityIcons name="check" size={16} color="#fff" style={{ marginLeft: 4 }} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>

      {/* ADDITIONAL INFO */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionHeader}>{t('additional_info')}</Text>
          <Divider style={styles.divider} />

          <AppInput
            label={t('onset_date')}
            value={onsetDate}
            onChangeText={setOnsetDate}
            placeholder="YYYY-MM-DD"
          />

          <Button
            mode="outlined"
            icon="camera"
            onPress={pickPhoto}
            style={styles.photoButton}
            textColor="#001F3F"
          >
            {photo ? t('change_photo') : t('attach_photo')}
          </Button>

          {photo && (
            <Image source={{ uri: photo }} style={styles.previewImage} />
          )}
        </Card.Content>
      </Card>

      {/* SUBMIT BUTTON */}
      <View style={styles.footer}>
        {loading ? (
          <ActivityIndicator animating={true} color="#001F3F" size="large" />
        ) : (
          <AppButton onPress={submit} style={styles.submitBtn}>
            {t('submit_report')}
          </AppButton>
        )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },

  /* HEADER */
  header: {
    backgroundColor: '#001F3F',
    paddingVertical: 24,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  headerSub: {
    fontSize: 14,
    color: '#B0C4DE',
    marginTop: 2,
  },

  /* FORM CARDS */
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#001F3F',
    marginBottom: 8,
  },
  divider: {
    backgroundColor: '#E0E0E0',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },

  /* SYMPTOM CONFIG */
  symptomSection: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionMainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#001F3F',
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  symptomCard: {
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 5,
    backgroundColor: '#fff',
    elevation: 2,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 13,
    color: '#444',
    fontWeight: '500',
  },

  /* PHOTOS */
  photoButton: {
    borderColor: '#001F3F',
    marginTop: 8,
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginTop: 12,
    borderRadius: 8,
    resizeMode: 'cover',
  },

  /* FOOTER */
  footer: {
    padding: 20,
  },
  submitBtn: {
    backgroundColor: '#001F3F',
    paddingVertical: 6,
    borderRadius: 30,
  },
});
