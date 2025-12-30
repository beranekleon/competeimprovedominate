import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';

/**
 * TestScreen mit Eingabefeld für Benutzerdaten.
 * TestScreen with input field for user data.
 */
export default function TestScreen({ data, loading, onTest, onLogout, userText, setUserText }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard / Testbereich</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <Text style={styles.response}>{data || "Keine Daten empfangen"}</Text>
      )}

      {/** * Eingabefeld für die Persistenz-Übung 
       * Input field for persistence exercise 
       */}
      <TextInput
        style={styles.input}
        placeholder="Schreibe etwas..."
        value={userText}
        onChangeText={setUserText}
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={onTest}>
        <Text style={styles.buttonText}>Verbindung testen</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={onLogout}>
        <Text style={styles.buttonText}>Speichern & Ausloggen</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  response: { padding: 15, backgroundColor: '#fff', borderRadius: 8, marginBottom: 20, textAlign: 'center' },
  input: { width: '100%', height: 100, backgroundColor: '#fff', borderRadius: 8, padding: 15, marginBottom: 20, textAlignVertical: 'top', borderWidth: 1, borderColor: '#ddd' },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center', marginBottom: 10 },
  logoutButton: { backgroundColor: '#FF3B30' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});