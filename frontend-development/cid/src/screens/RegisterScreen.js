import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Button, ActivityIndicator } from 'react-native';

/**
 * Bildschirm für die Benutzerregistrierung.
 * User registration screen.
 */
export default function RegisterScreen({ onRegister, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrierung</Text>
      <Text style={styles.subtitle}>Erstelle ein Konto, um Gebiete zu erobern.</Text>
      <Text style={styles.subtitle}>Create an account to conquer territories.</Text>

      {/* Eingabefeld für E-Mail | Input field for email */}
      <TextInput
        style={styles.input}
        placeholder="E-Mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {/* Eingabefeld für Passwort | Input field for password */}
      <TextInput
        style={styles.input}
        placeholder="Passwort"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Button zum Auslösen der Registrierung | Button to trigger registration */}
      <TouchableOpacity 
        style={styles.mainButton} 
        onPress={() => onRegister(email, password)}
      >
        <Text style={styles.buttonText}>Konto erstellen</Text>
      </TouchableOpacity>

      <Button title="Zurück" onPress={onBack} color="gray" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginVertical: 10,
    backgroundColor: '#fafafa'
  },
  mainButton: {
    backgroundColor: '#28a745', // Grün für "Erstellen" | Green for "Create"
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  }
});