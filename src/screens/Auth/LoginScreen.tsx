import React, { useState, useContext } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { Text, Card, ActivityIndicator, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import { loginWithPostgres } from '../../api/postgres/client';
import { AuthContext } from '../../store/authContext';

import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const doLogin = async () => {
    if (!email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const data = await loginWithPostgres(email, password);
      // Backend returns { user: {...}, token: '...' }
      login({ ...data.user, token: data.token });
    } catch (err: any) {
      alert(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>

          {/* Header section with Updated UI */}
          {/* Header section with Updated UI */}
          <View style={styles.headerContainer}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="heart-pulse" size={48} color="#001F3F" />
            </View>
            <Text style={styles.appTitle}>{t('app_title')}</Text>
            <Text style={styles.tagline}>{t('tagline')}</Text>
          </View>

          {/* Login Form Card */}
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Text style={styles.welcomeTitle}>{t('welcome_title')}</Text>
              <Text style={styles.welcomeSub}>{t('welcome_sub')}</Text>

              <AppInput
                label={t('email')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                left={<TextInput.Icon icon="email" />}
                style={styles.input}
              />

              <AppInput
                label={t('password')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                left={<TextInput.Icon icon="lock" />}
                style={styles.input}
              />

              {loading ? (
                <ActivityIndicator
                  animating={true}
                  color="#001F3F"
                  size="large"
                  style={{ marginTop: 20 }}
                />
              ) : (
                <AppButton
                  style={styles.loginButton}
                  labelStyle={styles.loginButtonLabel}
                  onPress={doLogin}
                >
                  {t('login')}
                </AppButton>
              )}

              <View style={styles.footerRow}>
                <Text style={styles.footerText}>{t('no_account')}</Text>
                <AppButton
                  mode="text"
                  onPress={() => navigation.navigate('Register')}
                  labelStyle={styles.registerLink}
                >
                  {t('register')}
                </AppButton>
              </View>
            </Card.Content>
          </Card>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001F3F', // Midnight Blue
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },

  /* Header */
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFD700', // Soft Gold background
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: '#FFD700', // Soft Gold
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 6,
    fontWeight: '600',
  },

  /* Card */
  card: {
    borderRadius: 24,
    backgroundColor: '#fff',
    elevation: 10,
  },
  cardContent: {
    paddingVertical: 24,
    paddingHorizontal: 12,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#001F3F',
    textAlign: 'center',
    marginBottom: 6,
  },
  welcomeSub: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#F7F9FC',
  },

  /* Buttons */
  loginButton: {
    marginTop: 18,
    backgroundColor: '#001F3F', // Dark Blue button
    borderRadius: 12,
    paddingVertical: 6,
  },
  loginButtonLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFD700', // Gold text
  },

  /* Footer */
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 15,
    color: '#555',
  },
  registerLink: {
    fontSize: 16,
    fontWeight: '800',
    color: '#001F3F',
  },
});
