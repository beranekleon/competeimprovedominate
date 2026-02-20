import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Alert, Button } from 'react-native';
import { BACKEND_URL } from '@env';

export default function ResetPasswordScreen({ navigation }) {
  const [step, setStep] = useState(1); // 1 = Code anfordern, 2 = Passwort setzen
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const requestCode = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const json = await response.json();

      if (response.ok) {
        Alert.alert("Code gesendet", json.nachricht || "Wenn das Konto existiert, wurde ein Code gesendet.");
        setStep(2);
      } else {
        Alert.alert("Fehler", json.fehler || "Fehler beim Anfordern.");
      }
    } catch (e) {
      Alert.alert("Fehler", "Netzwerkfehler");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (newPassword.length < 8) {
      Alert.alert("Fehler", "Passwort muss mindestens 8 Zeichen haben.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: code.trim(), newPassword }),
      });
      const json = await response.json();

      if (response.ok) {
        Alert.alert("Erfolg", "Passwort wurde geändert. Du kannst dich jetzt einloggen.");
        navigation.navigate('Login');
      } else {
        Alert.alert("Fehler", json.fehler || "Zurücksetzen fehlgeschlagen.");
      }
    } catch (e) {
      Alert.alert("Fehler", "Netzwerkfehler");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Passwort zurücksetzen</Text>

      <TextInput
        style={styles.input}
        placeholder="E-Mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {step === 1 ? (
        <>
          <TouchableOpacity style={styles.mainButton} onPress={requestCode} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Code anfordern</Text>}
          </TouchableOpacity>
          <Button title="Zurück" onPress={() => navigation.goBack()} color="gray" />
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="6-stelliger Code"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Neues Passwort (min. 8 Zeichen)"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.mainButton} onPress={resetPassword} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Passwort setzen</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setStep(1)} style={{ marginTop: 10 }}>
            <Text style={{ color: '#007AFF' }}>Neuen Code anfordern</Text>
          </TouchableOpacity>

          <View style={{ marginTop: 20, width: '100%' }}>
            <Button title="Zurück" onPress={() => navigation.goBack()} color="gray" />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '100%', height: 50, borderColor: '#ddd', borderWidth: 1, borderRadius: 8, paddingHorizontal: 15, marginVertical: 10, backgroundColor: '#fafafa' },
  mainButton: { backgroundColor: '#007AFF', paddingVertical: 15, borderRadius: 10, width: '100%', marginVertical: 20, height: 55, justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
});
