import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator, RadioButton, Card, Divider, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import uuid from "react-native-uuid";
import NetInfo from "@react-native-community/netinfo";
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../store/authContext';
// @ts-ignore
import { API_URL } from '../../api/postgres/client';

import AppInput from "../../components/AppInput";
import AppButton from "../../components/AppButton";

import { addToQueue } from "../../db/db";
import { sendWaterTest } from "../../api/api";
import { uploadImage } from "../../api/postgres/upload";

export default function WaterTestReportScreen({ navigation }: any) {
  const { t } = useTranslation();

  // LOCATION & META
  const [village, setVillage] = useState("");
  const [sourceType, setSourceType] = useState("tap"); // tap, well, river, handpump
  const [location, setLocation] = useState<any>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  // TEST PARAMETERS (Field Kit Standard)
  const [ph, setPh] = useState("");
  const [turbidity, setTurbidity] = useState("clear"); // clear, cloudy, opaque
  const [h2s, setH2s] = useState("safe"); // safe (no black), unsafe (black)
  const [chlorine, setChlorine] = useState(""); // mg/L
  const [nitrate, setNitrate] = useState(""); // mg/L

  const [loading, setLoading] = useState(false);

  // -----------------------------
  // FETCH LOCATION
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
  // CAMERA & GALLERY
  // -----------------------------
  const takePhoto = async () => {
    try {
      const res = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.5,
      });
      if (!res.canceled) {
        setPhoto(res.assets[0].uri);
      }
    } catch (err) {
      console.warn("Camera failed", err);
      Alert.alert("Camera Error", "Could not open camera. Please use gallery instead.");
    }
  };

  const pickImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.5,
      });
      if (!res.canceled) {
        setPhoto(res.assets[0].uri);
      }
    } catch (err) {
      console.warn("Gallery failed", err);
      Alert.alert("Error", "Could not open gallery.");
    }
  };

  // -----------------------------
  // SUBMIT
  // -----------------------------
  const submit = async () => {
    if (!village || !ph) {
      Alert.alert("Missing Data", "Please enter Village and pH level at minimum.");
      return;
    }

    setLoading(true);

    const turbidityMap: { [key: string]: number } = {
      clear: 5,
      cloudy: 35,
      opaque: 70,
    };

    const payload: any = {
      id: uuid.v4(),
      village,
      sourceType,
      ph: parseFloat(ph) || 7.0,
      turbidity: turbidityMap[turbidity] || 5,
      h2sResult: h2s,
      chlorine: parseFloat(chlorine) || 0,
      nitrate: parseFloat(nitrate) || 0,
      location,
      timestamp: new Date().toISOString(),
    };

    try {
      const net = await NetInfo.fetch();

      if (photo) {
        // Upload image to Node.js server
        // New uploadImage only requires the uri
        const url = await uploadImage(photo);
        payload.photoUrl = url;
      }

      if (net.isConnected) {
        await sendWaterTest(payload);
        Alert.alert("Success", "Water Test Uploaded.");
        navigation.goBack();
      } else {
        await addToQueue({ id: payload.id, type: "WATER_TEST", payload });
        Alert.alert("Saved Offline", "Water test saved to queue.");
        navigation.goBack();
      }
    } catch (e) {
      console.log(e);
      await addToQueue({ id: payload.id, type: "WATER_TEST", payload });
      Alert.alert("Error", "Saved offline as backup.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t('report_water_test')}</Text>
          <Text style={styles.headerSub}>{t('field_kit_entry')}</Text>
        </View>
        <MaterialCommunityIcons name="flask-outline" size={32} color="#FFD700" />
      </View>

      {/* SAMPLE SOURCE */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionHeader}>
            <MaterialCommunityIcons name="map-marker-radius" size={18} /> {t('source_details')}
          </Text>
          <Divider style={styles.divider} />

          <AppInput label={t('village')} value={village} onChangeText={setVillage} />

          <Text style={styles.label}>{t('water_source_type')}</Text>
          <SegmentedButtons
            value={sourceType}
            onValueChange={setSourceType}
            buttons={[
              { value: 'tap', label: t('tap') },
              { value: 'well', label: t('well') },
              { value: 'pump', label: t('handpump') },
              { value: 'river', label: t('river') },
            ]}
            style={{ marginBottom: 16 }}
            density="small"
          />

          <View style={styles.gpsBox}>
            <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#001F3F" />
            <Text style={styles.gpsText}>
              {location ?
                `GPS: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                : t('fetching_gps')}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* TEST PARAMETERS */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionHeader}>
            <MaterialCommunityIcons name="test-tube" size={18} /> {t('test_parameters')}
          </Text>
          <Divider style={styles.divider} />

          {/* 1. pH Level */}
          <View style={styles.paramRow}>
            <View style={{ flex: 1 }}>
              <AppInput
                label={t('ph_level')}
                value={ph}
                onChangeText={setPh}
                keyboardType="numeric"
              />
            </View>
            {/* Visual helper just to fill space or add info could go here */}
          </View>

          {/* 2. Turbidity */}
          <Text style={styles.label}>{t('turbidity')}</Text>
          <SegmentedButtons
            value={turbidity}
            onValueChange={setTurbidity}
            buttons={[
              { value: 'clear', label: t('clear') },
              { value: 'cloudy', label: t('cloudy') },
              { value: 'opaque', label: t('opaque') },
            ]}
            style={{ marginBottom: 16 }}
          />

          {/* 3. Bacterial (H2S Click) */}
          <Text style={styles.label}>{t('h2s_test')}</Text>
          <View style={styles.radioGroup}>
            <AppButton
              mode={h2s === 'safe' ? 'contained' : 'outlined'}
              onPress={() => setH2s('safe')}
              style={{ flex: 1, marginRight: 8, backgroundColor: h2s === 'safe' ? '#4CAF50' : undefined, borderColor: '#4CAF50' }}
            >
              {t('safe')}
            </AppButton>
            <AppButton
              mode={h2s === 'unsafe' ? 'contained' : 'outlined'}
              onPress={() => setH2s('unsafe')}
              style={{ flex: 1, marginLeft: 8, backgroundColor: h2s === 'unsafe' ? '#D9534F' : undefined, borderColor: '#D9534F' }}
            >
              {t('unsafe')}
            </AppButton>
          </View>

          {/* 4. Chemical */}
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <AppInput
                label={t('chlorine')}
                value={chlorine}
                onChangeText={setChlorine}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <AppInput
                label={t('nitrate')}
                value={nitrate}
                onChangeText={setNitrate}
                keyboardType="numeric"
              />
            </View>
          </View>

        </Card.Content>
      </Card>

      {/* PHOTO & SUBMIT */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <AppButton
              mode="outlined"
              icon="camera"
              onPress={takePhoto}
              textColor="#001F3F"
              style={{ flex: 1, marginRight: 8 }}
            >
              {t('take_photo')}
            </AppButton>
            <AppButton
              mode="outlined"
              icon="image"
              onPress={pickImage}
              textColor="#001F3F"
              style={{ flex: 1, marginLeft: 8 }}
            >
              Gallery
            </AppButton>
          </View>

          {photo && <Image source={{ uri: photo }} style={styles.photoPreview} />}

          {loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} color="#001F3F" />
          ) : (
            <AppButton onPress={submit} style={{ marginTop: 20 }}>
              {t('submit')}
            </AppButton>
          )}
        </Card.Content>
      </Card>

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

  /* CARD */
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },

  gpsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 10,
    borderRadius: 8,
  },
  gpsText: {
    marginLeft: 8,
    color: '#001F3F',
    fontWeight: '600',
  },

  /* INPUTS */
  paramRow: {
    marginBottom: 10,
  },
  radioGroup: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },

  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 12,
  },
});
