import React, { useState, useContext } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Card, ActivityIndicator } from 'react-native-paper';

import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import { loginApi } from '../../api/api';
import { AuthContext } from '../../store/authContext';

export default function LoginScreen({ navigation }) {
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
    const res = await loginApi(email, password);
    setLoading(false);

    if (res.ok) {
      login(res.data);
    } else {
      alert('Invalid email or password');
    }
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.headerRow}>
        <Image
          source={require('../../../assets/images/logo.jpg')}
          style={styles.logo}
        />
        <Text style={styles.smartHealth}>Smart Health</Text>
      </View>

      {/* Login Card */}
      <Card mode="elevated" style={styles.card}>
        <Card.Content>

          <Text style={styles.screenTitle}>Welcome Back 👋</Text>
          <Text style={styles.subtitle}>
            Continue your Smart Health journey.
          </Text>

          {/* Inputs */}
          <AppInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <AppInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Login Button */}
          {loading ? (
            <ActivityIndicator style={{ marginTop: 14 }} />
          ) : (
            <AppButton style={styles.button} onPress={doLogin}>
              Login
            </AppButton>
          )}

          {/* Register Link */}
          <AppButton
            mode="text"
            onPress={() => navigation.navigate('Register')}
            style={{ marginTop: 10 }}
          >
            Don’t have an account? Register
          </AppButton>

        </Card.Content>
      </Card>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9F5FF',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },

  /* HEADER */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  smartHealth: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0A4D68',
  },

  /* CARD */
  card: {
    borderRadius: 24,
    backgroundColor: '#FFFFFFEE',
    elevation: 10,
    paddingVertical: 14,
  },

  /* TEXT */
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
  },

  /* BUTTON */
  button: {
    marginTop: 16,
    paddingVertical: 4,
  },
});
