import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, TouchableOpacity, Button, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../hooks/useAuth';
import { CommonStyles, Colors } from '../../styles';

export default function LoginScreen({ navigation }) {
  const {
    login,
    requestPhoneCode,
    confirmPhoneCode,
    phoneAwaitingCode,
    loginError,
    loading,
    setLoginError,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMode, setLoginMode] = useState('email'); // 'email' oder 'phone'
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');

  // Lade gespeicherte E-Mail beim Öffnen des Screens (falls vorhanden)
  useEffect(() => {
    const loadSavedEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('@user_email');
        if (savedEmail) {
          setEmail(savedEmail);
        }
      } catch (e) {
        console.log("Fehler beim Laden der E-Mail:", e);
      }
    };
    loadSavedEmail();
  }, []);

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setLoginError('E-Mail und Passwort erforderlich');
      return;
    }

    await login(email.trim(), password);
  };

  const handleSendPhoneCode = async () => {
    if (!phone.trim()) {
      setLoginError('Telefonnummer erforderlich');
      return;
    }

    await requestPhoneCode(phone.trim());
  };

  const handleConfirmPhoneLogin = async () => {
    if (!phone.trim() || !code.trim()) {
      setLoginError('Telefonnummer und Code erforderlich');
      return;
    }

    await confirmPhoneCode(phone.trim(), code.trim());
  };

  return (
      <View style={CommonStyles.screenContainer}>
        <Text style={CommonStyles.title}>Login</Text>

        {loginError && (
            <View style={CommonStyles.errorBox}>
              <Text style={CommonStyles.errorText}>{loginError}</Text>
            </View>
        )}

        {/* Auswahl: E-Mail oder Telefon */}
        <View style={CommonStyles.modeButtons}>
          <TouchableOpacity
              style={[
                CommonStyles.modeButton,
                loginMode === 'email' && CommonStyles.modeButtonActive
              ]}
              onPress={() => setLoginMode('email')}
          >
            <Text style={[
              CommonStyles.modeButtonText,
              loginMode === 'email' && CommonStyles.modeButtonTextActive
            ]}>
              Mit E-Mail
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
              style={[
                CommonStyles.modeButton,
                loginMode === 'phone' && CommonStyles.modeButtonActive
              ]}
              onPress={() => setLoginMode('phone')}
          >
            <Text style={[
              CommonStyles.modeButtonText,
              loginMode === 'phone' && CommonStyles.modeButtonTextActive
            ]}>
              Mit Telefonnummer
            </Text>
          </TouchableOpacity>
        </View>

        {/* E-Mail-Bereich */}
        {loginMode === 'email' && (
            <View style={CommonStyles.form}>
              <TextInput
                  style={CommonStyles.input}
                  placeholder="E-Mail"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
              />

              <TextInput
                  style={CommonStyles.input}
                  placeholder="Passwort"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
              />

              <TouchableOpacity
                  style={CommonStyles.loginButton}
                  onPress={handleEmailLogin}
                  disabled={loading}
              >
                {loading ? (
                    <ActivityIndicator color={Colors.white} />
                ) : (
                    <Text style={CommonStyles.buttonText}>Mit E-Mail anmelden</Text>
                )}
              </TouchableOpacity>
            </View>
        )}

        {/* Telefon-Bereich */}
        {loginMode === 'phone' && (
            <View style={CommonStyles.form}>
              <TextInput
                  style={CommonStyles.input}
                  placeholder="+49123456789"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
              />

                {!phoneAwaitingCode ? (
                  <TouchableOpacity
                      style={CommonStyles.loginButton}
                    onPress={handleSendPhoneCode}
                      disabled={loading}
                  >
                    {loading ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <Text style={CommonStyles.buttonText}>Code per SMS/WhatsApp senden</Text>
                    )}
                  </TouchableOpacity>
              ) : (
                  <>
                    <TextInput
                        style={CommonStyles.input}
                        placeholder="Code aus SMS/WhatsApp"
                        value={code}
                        onChangeText={setCode}
                        keyboardType="number-pad"
                        maxLength={6}
                    />

                    <TouchableOpacity
                        style={CommonStyles.loginButton}
                      onPress={handleConfirmPhoneLogin}
                        disabled={loading}
                    >
                      {loading ? (
                          <ActivityIndicator color={Colors.white} />
                      ) : (
                          <Text style={CommonStyles.buttonText}>Code bestätigen</Text>
                      )}
                    </TouchableOpacity>
                  </>
              )}
            </View>
        )}

        {/* Zusätzliche Links */}
        <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')} style={CommonStyles.forgotBtn}>
          <Text style={CommonStyles.linkText}>Passwort vergessen?</Text>
        </TouchableOpacity>

        <Button title="Zurück" onPress={() => navigation.goBack()} color={Colors.textGray} />
      </View>
  );
}
