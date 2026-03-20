import React, { useState } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { CommonStyles, Colors, ProfileScreenStyles } from '../../styles';
import TaskBar from '../../components/TaskBar';

/**
 * ProfileScreen
 * User profile management with cloud notes, connection test, account deletion and password change
 */
export default function ProfileScreen({ navigation }) {
  const { userData, setUserData, logout, deleteAccount, testConnection, loading } = useAuth();
  const { showToast } = useToast();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const handleTestConnection = async () => {
    try {
      const result = await testConnection();
      showToast({ message: result, type: 'success' });
    } catch (error) {
      showToast({ message: 'Verbindungsfehler', type: 'error' });
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
                showToast({ message: 'Erfolgreich abgemeldet', type: 'success' });
              } catch (error) {
                showToast({ message: error.message || 'Logout fehlgeschlagen', type: 'error' });
              }
            },
          },
        ]
    );
  };

  const handleDeleteConfirm = async () => {
    if (!deletePassword.trim()) {
      showToast({ message: 'Bitte Passwort eingeben', type: 'error' });
      return;
    }

    try {
      await deleteAccount(deletePassword);
      setDeleteModalVisible(false);
      showToast({ message: 'Konto erfolgreich gelöscht.', type: 'success' });
    } catch (error) {
      showToast({ message: error.message || 'Fehler beim Löschen', type: 'error' });
      setDeletePassword('');
    }
  };

  return (
      <View style={ProfileScreenStyles.container}>
        {/* Header with Title */}
        <SafeAreaView edges={['top']} style={ProfileScreenStyles.headerSafeArea}>
          <View style={ProfileScreenStyles.header}>
            <Text style={ProfileScreenStyles.title}>Profil</Text>
          </View>
        </SafeAreaView>

        {/* Content */}
        <ScrollView style={ProfileScreenStyles.scrollContainer}>



          {/* Test Connection Button */}
          <TouchableOpacity
              style={[CommonStyles.buttonSecondary, ProfileScreenStyles.testButton]}
              onPress={handleTestConnection}
              disabled={loading}
          >
            {loading ? (
                <ActivityIndicator color={Colors.white} />
            ) : (
                <Text style={CommonStyles.buttonText}>Verbindung testen</Text>
            )}
          </TouchableOpacity>

          {/* Change Password Button – NEU */}
          <TouchableOpacity
              style={[CommonStyles.buttonSecondary, { backgroundColor: '#007AFF', marginTop: 15 }]}
              onPress={() => navigation.navigate('ChangePassword')}
              disabled={loading}
          >
            {loading ? (
                <ActivityIndicator color={Colors.white} />
            ) : (
                <Text style={CommonStyles.buttonText}>Passwort ändern</Text>
            )}
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity
              style={[CommonStyles.buttonSecondary, ProfileScreenStyles.logoutButton]}
              onPress={handleLogout}
              disabled={loading}
          >
            {loading ? (
                <ActivityIndicator color={Colors.white} />
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
              <View style={ProfileScreenStyles.modalActionsRow}>
                <TouchableOpacity
                    onPress={() => {
                      setDeleteModalVisible(false);
                      setDeletePassword('');
                    }}
                    disabled={loading}
                >
                  <Text style={ProfileScreenStyles.modalCancelText}>Abbrechen</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDeleteConfirm} disabled={loading}>
                  {loading ? (
                      <ActivityIndicator color={Colors.red} />
                  ) : (
                      <Text style={ProfileScreenStyles.modalDeleteText}>Löschen</Text>
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