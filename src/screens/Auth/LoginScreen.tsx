import React, { useState, useContext, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Dimensions, Animated } from 'react-native';
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

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const doLogin = async () => {
    if (!email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const data = await loginWithPostgres(email, password);
      login({ ...data.user, token: data.token });
    } catch (err: any) {
      alert(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Decorative Background Elements */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* Header section */}
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
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001F3F', // Midnight Blue
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },

  /* Decorative Background */
  bgCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FFD700',
    opacity: 0.1,
  },
  bgCircle2: {
    position: 'absolute',
    bottom: 50,
    left: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FFD700',
    opacity: 0.08,
  },
  bgCircle3: {
    position: 'absolute',
    top: '40%',
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    opacity: 0.05,
  },

  /* Header */
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 85,
    height: 85,
    borderRadius: 43,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  appTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: '#FFD700',
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginTop: 8,
    fontWeight: '700',
  },

  /* Card */
  card: {
    borderRadius: 32,
    backgroundColor: '#fff',
    elevation: 15,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    borderWidth: 1,
    borderColor: 'rgba(0, 31, 63, 0.05)',
  },
  cardContent: {
    paddingVertical: 30,
    paddingHorizontal: 15,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#001F3F',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSub: {
    fontSize: 15,
    color: '#777',
    textAlign: 'center',
    marginBottom: 35,
    lineHeight: 22,
  },
  input: {
    backgroundColor: '#F8FAFC',
    marginBottom: 10,
  },

  /* Buttons */
  loginButton: {
    marginTop: 20,
    backgroundColor: '#001F3F',
    borderRadius: 16,
    paddingVertical: 8,
    elevation: 5,
  },
  loginButtonLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFD700',
  },

  /* Footer */
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
  },
  footerText: {
    fontSize: 15,
    color: '#666',
  },
  registerLink: {
    fontSize: 16,
    fontWeight: '900',
    color: '#001F3F',
  },
});
