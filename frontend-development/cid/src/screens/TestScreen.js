import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

export default function TestScreen({ data, loading, onTest, onLogout, userText, setUserText }) {
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Dashboard</Text>
        
        {/* Anzeige der System-Nachrichten (Login-Erfolg, Verbindungstest etc.) */}
        <View style={styles.messageBox}>
          {loading ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Text style={styles.messageText}>{data || "Bereit für Eingabe..."}</Text>
          )}
        </View>

        <Text style={styles.label}>Deine Notizen (Cloud-Sync):</Text>
        <TextInput
          style={styles.input}
          placeholder="Tippe hier deine Daten ein..."
          value={userText}
          onChangeText={setUserText}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity style={styles.testButton} onPress={onTest}>
          <Text style={styles.buttonText}>Verbindung testen</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.buttonText}>Speichern & Ausloggen</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContainer: { alignItems: 'center', justifyContent: 'center', padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  messageBox: {
    width: '100%',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 20,
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center'
  },
  messageText: { color: '#007AFF', textAlign: 'center', fontWeight: '500' },
  label: { alignSelf: 'flex-start', marginBottom: 5, fontWeight: '600', color: '#666' },
  input: {
    width: '100%',
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  testButton: { backgroundColor: '#34C759', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center', marginBottom: 10 },
  logoutButton: { backgroundColor: '#FF3B30', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});