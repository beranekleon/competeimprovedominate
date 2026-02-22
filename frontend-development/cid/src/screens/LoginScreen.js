import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Button,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';

/**
 * LoginScreen
 * Email/password or phone code login with mode toggle
 */
export default function LoginScreen({ navigation }) {
  const { login, loginError, loading, setLoginError, requestPhoneCode, confirmPhoneCode, phoneAwaitingCode, setPhoneAwaitingCode } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loginMode, setLoginMode] = useState('email'); // 'email' or 'phone'

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setLoginError('Email und Passwort erforderlich');
      return;
    }

    try {
      await login(email, password);
    } catch (error) {
      setLoginError(error.message || 'Login fehlgeschlagen');
    }
  };

  const handleSendPhoneCode = async () => {
    if (!phone.trim()) {
      setLoginError('Bitte Telefonnummer eingeben');
      return;
    }

    try {
      await requestPhoneCode(phone);
      Alert.alert('Code gesendet', 'Wenn das Konto existiert, wurde ein Code gesendet.');
    } catch (error) {
      // Error already set in context
    }
  };

  const handleConfirmPhoneCode = async () => {
    if (!code.trim()) {
      setLoginError('Bitte Code eingeben');
      return;
    }

    if (code.length !== 6) {
      setLoginError('Code muss 6 Ziffern haben');
      return;
    }

    try {
      await confirmPhoneCode(phone, code);
    } catch (error) {
      // Error already set in context
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      {loginError && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{loginError}</Text>
        </View>
      )}

      {/* Mode Selection Tabs */}
      <View style={styles.modeButtons}>
        <TouchableOpacity
          style={[styles.modeButton, loginMode === 'email' && styles.modeButtonActive]}
          onPress={() => {
            setLoginMode('email');
            setLoginError(null);
          }}
        >
          <Text style={[styles.modeButtonText, loginMode === 'email' && styles.modeButtonTextActive]}>
            Mit E-Mail
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeButton, loginMode === 'phone' && styles.modeButtonActive]}
          onPress={() => {
            setLoginMode('phone');
            setPhoneAwaitingCode(false);
            setLoginError(null);
          }}
        >
          <Text style={[styles.modeButtonText, loginMode === 'phone' && styles.modeButtonTextActive]}>
            Mit Telefon
          </Text>
        </TouchableOpacity>
      </View>

      {/* Email Login */}
      {loginMode === 'email' && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="E-Mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Passwort"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity style={styles.loginButton} onPress={handleEmailLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Mit E-Mail anmelden</Text>}
          </TouchableOpacity>
        </View>
      )}

      {/* Phone Login */}
      {loginMode === 'phone' && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="+49123456789"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            editable={!loading && !phoneAwaitingCode}
          />

          {!phoneAwaitingCode ? (
            <TouchableOpacity style={styles.loginButton} onPress={handleSendPhoneCode} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Code senden</Text>}
            </TouchableOpacity>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="6-stelliger Code"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
                editable={!loading}
              />

              <TouchableOpacity style={styles.loginButton} onPress={handleConfirmPhoneCode} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Code bestätigen</Text>}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setPhoneAwaitingCode(false)} style={{ marginTop: 10 }} disabled={loading}>
                <Text style={{ color: '#007AFF', textAlign: 'center' }}>Neuen Code anfordern</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {/* Additional Links */}
      <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')} style={styles.forgotBtn}>
        <Text style={styles.forgotText}>Passwort vergessen?</Text>
      </TouchableOpacity>

      <Button title="Zurück" onPress={() => navigation.goBack()} color="gray" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  errorBox: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#f44336',
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    fontWeight: '500',
  },
  modeButtons: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 25,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modeButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#007AFF',
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  form: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    height: 52,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginVertical: 8,
    backgroundColor: '#fafafa',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
    width: '100%',
    marginTop: 15,
    alignItems: 'center',
    height: 55,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotBtn: {
    marginTop: 20,
    marginBottom: 10,
  },
  forgotText: {
    color: '#007AFF',
    textDecorationLine: 'underline',
    fontSize: 16,
  },
});