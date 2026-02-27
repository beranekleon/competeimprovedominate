import React, { useState } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Button,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { CommonStyles, Colors } from '../../styles';

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
    <View style={CommonStyles.screenContainer}>
      <Text style={CommonStyles.title}>Login</Text>

      {loginError && (
        <View style={CommonStyles.errorBox}>
          <Text style={CommonStyles.errorText}>{loginError}</Text>
        </View>
      )}

      {/* Mode Selection Tabs */}
      <View style={CommonStyles.modeButtons}>
        <TouchableOpacity
          style={[CommonStyles.modeButton, loginMode === 'email' && CommonStyles.modeButtonActive]}
          onPress={() => {
            setLoginMode('email');
            setLoginError(null);
          }}
        >
          <Text style={[CommonStyles.modeButtonText, loginMode === 'email' && CommonStyles.modeButtonTextActive]}>
            Mit E-Mail
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[CommonStyles.modeButton, loginMode === 'phone' && CommonStyles.modeButtonActive]}
          onPress={() => {
            setLoginMode('phone');
            setPhoneAwaitingCode(false);
            setLoginError(null);
          }}
        >
          <Text style={[CommonStyles.modeButtonText, loginMode === 'phone' && CommonStyles.modeButtonTextActive]}>
            Mit Telefon
          </Text>
        </TouchableOpacity>
      </View>

      {/* Email Login */}
      {loginMode === 'email' && (
        <View style={CommonStyles.form}>
          <TextInput
            style={CommonStyles.input}
            placeholder="E-Mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />

          <TextInput
            style={CommonStyles.input}
            placeholder="Passwort"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity style={CommonStyles.loginButton} onPress={handleEmailLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={CommonStyles.buttonText}>Mit E-Mail anmelden</Text>}
          </TouchableOpacity>
        </View>
      )}

      {/* Phone Login */}
      {loginMode === 'phone' && (
        <View style={CommonStyles.form}>
          <TextInput
            style={CommonStyles.input}
            placeholder="+49123456789"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            editable={!loading && !phoneAwaitingCode}
          />

          {!phoneAwaitingCode ? (
            <TouchableOpacity style={CommonStyles.loginButton} onPress={handleSendPhoneCode} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={CommonStyles.buttonText}>Code senden</Text>}
            </TouchableOpacity>
          ) : (
            <>
              <TextInput
                style={CommonStyles.input}
                placeholder="6-stelliger Code"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
                editable={!loading}
              />

              <TouchableOpacity style={CommonStyles.loginButton} onPress={handleConfirmPhoneCode} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={CommonStyles.buttonText}>Code bestätigen</Text>}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setPhoneAwaitingCode(false)} style={CommonStyles.forgotBtn} disabled={loading}>
                <Text style={CommonStyles.linkText}>Neuen Code anfordern</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {/* Additional Links */}
      <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')} style={CommonStyles.forgotBtn}>
        <Text style={CommonStyles.linkText}>Passwort vergessen?</Text>
      </TouchableOpacity>

      <Button title="Zurück" onPress={() => navigation.goBack()} color="gray" />
    </View>
  );
}