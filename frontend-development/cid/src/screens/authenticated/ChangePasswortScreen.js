import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { BACKEND_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChangePasswordScreen({ navigation }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChangePassword = async () => {
        // Validierung
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
                // Logout erzwingen
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
        <View style={styles.container}>
            <Text style={styles.title}>Passwort ändern</Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TextInput
                style={styles.input}
                placeholder="Aktuelles Passwort"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
            />

            <TextInput
                style={styles.input}
                placeholder="Neues Passwort"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
            />

            <TextInput
                style={styles.input}
                placeholder="Neues Passwort wiederholen"
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                secureTextEntry
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleChangePassword}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Passwort ändern</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancel}>
                <Text style={styles.cancelText}>Abbrechen</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 15,
        fontSize: 16,
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        marginVertical: 10,
        backgroundColor: '#fafafa',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    cancel: {
        marginTop: 20,
        alignItems: 'center',
    },
    cancelText: {
        color: '#007AFF',
        fontSize: 16,
    },
});