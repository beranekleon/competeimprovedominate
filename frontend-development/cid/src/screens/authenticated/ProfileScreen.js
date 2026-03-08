import React, { useState } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { CommonStyles, Colors } from '../../styles';
import TaskBar from '../../components/TaskBar';

/**
 * ProfileScreen
 * User profile management with cloud notes, connection test, and account deletion
 */
export default function ProfileScreen({ navigation }) {
  const { userData, setUserData, logout, deleteAccount, testConnection, loading } = useAuth();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const handleTestConnection = async () => {
    try {
      const result = await testConnection();
      Alert.alert('Verbindung', result);
    } catch (error) {
      Alert.alert('Fehler', 'Verbindungsfehler');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout & Speichern',
      'Wirklich abmelden?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Abmelden',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Fehler', error.message || 'Logout fehlgeschlagen');
            }
          },
        },
      ]
    );
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
    <View style={styles.container}>
      {/* Header with Title */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Profil</Text>
        </View>
      </SafeAreaView>

      {/* Content */}
      <ScrollView style={styles.scrollContainer}>
        {/* Cloud Notes Section */}
        <Text style={styles.sectionTitle}>Cloud-Notizen</Text>
        <TextInput
          style={CommonStyles.multilineInput}
          value={userData}
          onChangeText={setUserData}
          multiline
          editable={!loading}
          placeholder="Deine Notizen..."
        />

        {/* Test Connection Button */}
        <TouchableOpacity
          style={[CommonStyles.buttonSecondary, styles.testButton]}
          onPress={handleTestConnection}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={CommonStyles.buttonText}>Verbindung testen</Text>
          )}
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          style={[CommonStyles.buttonSecondary, styles.logoutButton]}
          onPress={handleLogout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={CommonStyles.buttonText}>Logout & Speichern</Text>
          )}
        </TouchableOpacity>

        {/* Delete Account Button */}
        <TouchableOpacity
          style={CommonStyles.deleteAccountButton}
          onPress={() => setDeleteModalVisible(true)}
          disabled={loading}
        >
          <Text style={CommonStyles.deleteButtonText}>Konto unwiderruflich löschen</Text>
        </TouchableOpacity>
      </ScrollView>

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

      {/* Bottom Taskbar */}
      <TaskBar
        onLeftPress={() => navigation.navigate('Users')}
        leftButtonText='Friends'
        leftButtonVisible={true}
        onCenterPress={() => navigation.navigate('Dashboard')}
        centerButtonText='Map'
        centerButtonActive={false}
        onRightPress={() => navigation.navigate('Profile')}
        rightButtonVisible={true}
        loading={loading}
      />
    </View>
  );
}

// Screen-specific styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerSafeArea: {
    backgroundColor: Colors.background,
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 12,
  },
  testButton: {
    marginTop: 16,
    backgroundColor: Colors.purple,
  },
  logoutButton: {
    marginTop: 16,
    backgroundColor: Colors.purple,
  },
});
