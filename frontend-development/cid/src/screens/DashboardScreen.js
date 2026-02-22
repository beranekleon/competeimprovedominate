import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useAuth } from '../hooks/useAuth';
import { useGPS } from '../hooks/useGPS';

/**
 * DashboardScreen (formerly TestScreen)
 * Main user dashboard with map, cloud notes, and account management
 */
export default function DashboardScreen() {
  const { userData, setUserData, logout, deleteAccount, testConnection, loading } = useAuth();
  const { location, errorMsg, region, isLoading: gpsLoading } = useGPS();
  const [statusMessage, setStatusMessage] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const handleTestConnection = async () => {
    try {
      const result = await testConnection();
      setStatusMessage(result);
    } catch (error) {
      setStatusMessage('Verbindungsfehler');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert('Fehler', error.message || 'Logout fehlgeschlagen');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletePassword.trim()) {
      Alert.alert('Fehler', 'Bitte Passwort eingeben');
      return;
    }

    try {
      await deleteAccount(deletePassword);
      setDeleteModalVisible(false);
      Alert.alert('Erfolg', 'Konto erfolgreich gelöscht.');
    } catch (error) {
      Alert.alert('Fehler', error.message || 'Fehler beim Löschen');
      setDeletePassword('');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Dashboard</Text>

        {/* Map Display */}
        <View style={styles.mapContainer}>
          {region ? (
            <MapView style={styles.map} region={region} showsUserLocation={true}>
              {location && <Marker coordinate={location} title="Deine Position" />}
            </MapView>
          ) : (
            <View style={styles.mapPlaceholder}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={{ marginTop: 10 }}>GPS wird gesucht...</Text>
              {errorMsg && <Text style={{ color: 'red' }}>{errorMsg}</Text>}
            </View>
          )}
        </View>

        {/* Status Message */}
        <View style={styles.messageBox}>
          {loading ? (
            <ActivityIndicator color="#007AFF" />
          ) : (
            <Text style={styles.messageText}>{statusMessage || 'System online'}</Text>
          )}
        </View>

        {/* Cloud Notes */}
        <Text style={styles.label}>Cloud-Notizen:</Text>
        <TextInput
          style={styles.input}
          value={userData}
          onChangeText={setUserData}
          multiline
          editable={!loading}
        />

        {/* Test Connection Button */}
        <TouchableOpacity
          style={styles.testButton}
          onPress={handleTestConnection}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Verbindung testen</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={loading}>
          <Text style={styles.buttonText}>Logout & Speichern</Text>
        </TouchableOpacity>

        {/* Delete Account Button */}
        <TouchableOpacity
          style={styles.deleteAccountButton}
          onPress={() => setDeleteModalVisible(true)}
          disabled={loading}
        >
          <Text style={styles.deleteButtonText}>Konto unwiderruflich löschen</Text>
        </TouchableOpacity>

        {/* Delete Confirmation Modal */}
        <Modal visible={deleteModalVisible} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Konto löschen</Text>
              <Text>Bitte Passwort zur Bestätigung eingeben:</Text>
              <TextInput
                style={styles.modalInput}
                secureTextEntry
                value={deletePassword}
                onChangeText={setDeletePassword}
                editable={!loading}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity
                  onPress={() => {
                    setDeleteModalVisible(false);
                    setDeletePassword('');
                  }}
                  disabled={loading}
                >
                  <Text style={{ color: 'gray' }}>Abbrechen</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDeleteConfirm} disabled={loading}>
                  {loading ? (
                    <ActivityIndicator color="red" />
                  ) : (
                    <Text style={{ color: 'red', fontWeight: 'bold' }}>Löschen</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContainer: { alignItems: 'center', padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  mapContainer: {
    width: '100%',
    height: 250,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  map: { width: '100%', height: '100%' },
  mapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#eee' },
  messageBox: {
    width: '100%',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  messageText: { color: '#007AFF', fontWeight: 'bold' },
  label: { alignSelf: 'flex-start', marginBottom: 5, fontWeight: '600' },
  input: {
    width: '100%',
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    textAlignVertical: 'top',
  },
  testButton: { backgroundColor: '#5856D6', paddingVertical: 12, borderRadius: 10, width: '100%', marginTop: 20 },
  logoutButton: { backgroundColor: '#8E8E93', paddingVertical: 12, borderRadius: 10, width: '100%', marginTop: 10 },
  deleteAccountButton: { marginTop: 30, padding: 10 },
  deleteButtonText: { color: 'red', textAlign: 'center', textDecorationLine: 'underline' },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '80%', backgroundColor: '#fff', padding: 20, borderRadius: 15 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginVertical: 15 },
});
