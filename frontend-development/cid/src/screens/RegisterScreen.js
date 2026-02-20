import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Button, Alert } from 'react-native';
import { BACKEND_URL } from '@env';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState(''); // neu: Telefonnummer

  const handleRegister = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          phone: phone.trim() || null // neu: Telefonnummer (optional)
        }),
      });
      const json = await response.json();
      if (response.ok) {
        Alert.alert("Erfolg", "Konto erstellt! Du kannst dich jetzt einloggen.");
        navigation.navigate('Login');
      } else {
        Alert.alert("Fehler", json.fehler || "Registrierung fehlgeschlagen");
      }
    } catch (e) {
      Alert.alert("Fehler", "Netzwerkfehler");
    }
  };

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Registrierung</Text>

        <TextInput
            style={styles.input}
            placeholder="E-Mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
        />

        <TextInput
            style={styles.input}
            placeholder="Passwort"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
        />

        <TextInput
            style={styles.input}
            placeholder="Telefonnummer (optional, z.B. +49123456789)"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
        />

        <TouchableOpacity style={styles.mainButton} onPress={handleRegister}>
          <Text style={styles.buttonText}>Konto erstellen</Text>
        </TouchableOpacity>

        <Button title="Zurück" onPress={() => navigation.goBack()} color="gray" />
      </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '100%', height: 50, borderColor: '#ddd', borderWidth: 1, borderRadius: 8, paddingHorizontal: 15, marginVertical: 10, backgroundColor: '#fafafa' },
  mainButton: { backgroundColor: '#34C759', paddingVertical: 15, borderRadius: 10, width: '100%', marginVertical: 20 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }
});