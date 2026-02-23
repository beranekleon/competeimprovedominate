import React, { useState } from 'react';
import {
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
  StyleSheet,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useAuth } from '../hooks/useAuth';
import { useGPS } from '../hooks/useGPS';
import { CommonStyles, Colors } from '../styles';

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
      style={CommonStyles.containerWithBackground}
    >
      <ScrollView contentContainerStyle={CommonStyles.scrollContainer}>
        <Text style={CommonStyles.screenTitle}>Dashboard</Text>

        {/* Map Display */}
        <View style={CommonStyles.mapContainer}>
          {region ? (
            <MapView style={CommonStyles.map} region={region} showsUserLocation={true}>
              {location && <Marker coordinate={location} title="Deine Position" />}
            </MapView>
          ) : (
            <View style={CommonStyles.mapPlaceholder}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={{ marginTop: 10 }}>GPS wird gesucht...</Text>
              {errorMsg && <Text style={{ color: Colors.error }}>{errorMsg}</Text>}
            </View>
          )}
        </View>

        {/* Status Message */}
        <View style={CommonStyles.messageBox}>
          {loading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <Text style={CommonStyles.messageText}>{statusMessage || 'System online'}</Text>
          )}
        </View>

        {/* Cloud Notes */}
        <Text style={CommonStyles.label}>Cloud-Notizen:</Text>
        <TextInput
          style={CommonStyles.multilineInput}
          value={userData}
          onChangeText={setUserData}
          multiline
          editable={!loading}
        />

        {/* Test Connection Button */}
        <TouchableOpacity
          style={[CommonStyles.buttonSecondary, styles.testButton]}
          onPress={handleTestConnection}
          disabled={loading}
        >
          <Text style={CommonStyles.buttonText}>Verbindung testen</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          style={[CommonStyles.buttonSecondary, styles.logoutButton]}
          onPress={handleLogout}
          disabled={loading}
        >
          <Text style={CommonStyles.buttonText}>Logout & Speichern</Text>
        </TouchableOpacity>

        {/* Delete Account Button */}
        <TouchableOpacity
          style={CommonStyles.deleteAccountButton}
          onPress={() => setDeleteModalVisible(true)}
          disabled={loading}
        >
          <Text style={CommonStyles.deleteButtonText}>Konto unwiderruflich löschen</Text>
        </TouchableOpacity>

        {/* Delete Confirmation Modal */}
        <Modal visible={deleteModalVisible} transparent animationType="fade">
          <View style={CommonStyles.modalBackdrop}>
            <View style={CommonStyles.modalCard}>
              <Text style={CommonStyles.modalTitle}>Konto löschen</Text>
              <Text>Bitte Passwort zur Bestätigung eingeben:</Text>
              <TextInput
                style={CommonStyles.modalInput}
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
                  <Text style={{ color: Colors.textGray }}>Abbrechen</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDeleteConfirm} disabled={loading}>
                  {loading ? (
                    <ActivityIndicator color={Colors.red} />
                  ) : (
                    <Text style={{ color: Colors.red, fontWeight: 'bold' }}>Löschen</Text>
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

// Screen-specific button color variants
const styles = StyleSheet.create({
  testButton: { 
    backgroundColor: Colors.purple,
  },
  logoutButton: { 
    backgroundColor: Colors.neutral,
  },
});
