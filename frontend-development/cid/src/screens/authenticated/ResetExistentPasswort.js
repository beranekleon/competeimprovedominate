import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { BACKEND_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChangePasswordScreen({ navigation }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChangePassword = async () => {
        if (!currentPassword.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
            setError('Alle Felder ausfüllen');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setError('Neue Passwörter stimmen nicht überein');
            return;
        }

        if (newPassword.length < 6) {
            setError('Neues Passwort muss mindestens 6 Zeichen lang sein');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const email = await AsyncStorage.getItem('@user_email');
            if (!email) throw new Error('Nicht eingeloggt');

            const res = await fetch(`${BACKEND_URL}/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim(),
                    currentPassword,
                    newPassword
                }),
            });

            const json = await res.json();

            if (res.ok) {
                Alert.alert('Erfolg', 'Passwort geändert! Bitte neu einloggen.');
                // Optional: Logout nach Änderung
                await AsyncStorage.multiRemove(['@is_logged_in', '@user_email', '@user_text']);
                navigation.navigate('Login');
            } else {
                setError(json.fehler || 'Fehler beim Ändern');
            }
        } catch (e) {
            setError('Netzwerkfehler oder nicht eingeloggt');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Passwort ändern</Text>

            {error ? <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text> : null}

            <TextInput
                style={{ borderWidth: 1, padding: 12, marginBottom: 10, borderRadius: 8 }}
                placeholder="Aktuelles Passwort"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
            />

            <TextInput
                style={{ borderWidth: 1, padding: 12, marginBottom: 10, borderRadius: 8 }}
                placeholder="Neues Passwort"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
            />

            <TextInput
                style={{ borderWidth: 1, padding: 12, marginBottom: 20, borderRadius: 8 }}
                placeholder="Neues Passwort wiederholen"
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                secureTextEntry
            />

            <TouchableOpacity
                onPress={handleChangePassword}
                disabled={loading}
                style={{ backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' }}
            >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>Passwort ändern</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                <Text style={{ color: '#007AFF', textAlign: 'center' }}>Abbrechen</Text>
            </TouchableOpacity>
        </View>
    );
}