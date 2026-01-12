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
        
        {/* Anzeige der System-Nachrichten (z.B. "Backend ist online!") */}
        <View style={styles.messageBox}>
          {loading ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Text style={styles.messageText}>{data || "Bereit für Verbindungstest..."}</Text>
          )}
        </View>

        <Text style={styles.label}>Deine Notizen (Cloud-Sync):</Text>
        <TextInput
          style={styles.input}
          placeholder="Tippe hier deine Daten ein..."
          value={userText}
          onChangeText={setUserText}
          multiline
        />

        {/* Button für den Status-Endpunkt Test */}
        <TouchableOpacity style={styles.testButton} onPress={onTest} disabled={loading}>
          <Text style={styles.buttonText}>Verbindung testen (/status)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={onLogout} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Speichern & Ausloggen</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContainer: { alignItems: 'center', justifyContent: 'center', padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
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
  input: { width: '100%', height: 120, backgroundColor: '#fff', borderRadius: 10, padding: 15, borderWidth: 1, borderColor: '#e0e0e0', textAlignVertical: 'top' },
  testButton: { backgroundColor: '#5856D6', paddingVertical: 12, borderRadius: 10, width: '100%', marginTop: 20 },
  logoutButton: { backgroundColor: '#FF3B30', paddingVertical: 15, borderRadius: 10, width: '100%', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }
});