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
  Pressable,
  Alert
} from 'react-native';

export default function TestScreen({
  data,
  loading,
  onTest,
  onLogout,
  onDeleteAccount, // erwartet jetzt: onDeleteAccount(password)
  userText,
  setUserText
}) {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const openDeleteModal = () => {
    setDeletePassword('');
    setDeleteModalVisible(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalVisible(false);
    setDeletePassword('');
  };

  const confirmDelete = () => {
    if (!deletePassword.trim()) {
      Alert.alert("Passwort fehlt", "Bitte gib dein Passwort ein, um das Konto zu löschen.");
      return;
    }

    // optional: Extra Warnung
    Alert.alert(
      "Wirklich löschen?",
      "Dieser Schritt ist endgültig. Dein Account wird gelöscht.",
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Löschen",
          style: "destructive",
          onPress: async () => {
            try {
              await onDeleteAccount(deletePassword);
              closeDeleteModal();
            } catch (e) {
              // falls deine onDeleteAccount wirft
              // Modal offen lassen, damit man es nochmal versuchen kann
            }
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Dashboard</Text>

        {/* Anzeige der System-Nachrichten */}
        <View style={styles.messageBox}>
          {loading ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Text style={styles.messageText}>
              {data || "Bereit für Verbindungstest..."}
            </Text>
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

        <TouchableOpacity style={styles.testButton} onPress={onTest} disabled={loading}>
          <Text style={styles.buttonText}>Verbindung testen (/status)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={onLogout} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Speichern & Ausloggen</Text>}
        </TouchableOpacity>

        {/* 🔴 Nutzerkonto löschen -> öffnet Modal */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={openDeleteModal}
          disabled={loading}
        >
          <Text style={styles.deleteButtonText}>Konto endgültig löschen</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Passwort-Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeDeleteModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Konto löschen</Text>
            <Text style={styles.modalText}>
              Bitte gib dein Passwort ein, um das Löschen zu bestätigen.
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Passwort"
              value={deletePassword}
              onChangeText={setDeletePassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalActions}>
              <Pressable style={[styles.modalBtn, styles.modalBtnSecondary]} onPress={closeDeleteModal}>
                <Text style={styles.modalBtnTextSecondary}>Abbrechen</Text>
              </Pressable>

              <Pressable
                style={[styles.modalBtn, styles.modalBtnDanger]}
                onPress={confirmDelete}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalBtnTextDanger}>Löschen</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  input: {
    width: '100%',
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    textAlignVertical: 'top'
  },

  testButton: { backgroundColor: '#5856D6', paddingVertical: 12, borderRadius: 10, width: '100%', marginTop: 20 },
  logoutButton: { backgroundColor: '#FF3B30', paddingVertical: 15, borderRadius: 10, width: '100%', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },

  deleteButton: {
    marginTop: 20,
    backgroundColor: "#c62828",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  deleteButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e6e6e6"
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  modalText: { color: "#444", marginBottom: 12, lineHeight: 18 },

  modalInput: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 14
  },

  modalActions: { flexDirection: "row", gap: 10, justifyContent: "flex-end" },
  modalBtn: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, minWidth: 110, alignItems: "center" },
  modalBtnSecondary: { backgroundColor: "#f2f2f2" },
  modalBtnDanger: { backgroundColor: "#c62828" },

  modalBtnTextSecondary: { color: "#333", fontWeight: "700" },
  modalBtnTextDanger: { color: "#fff", fontWeight: "700" },
});
