import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Button, ActivityIndicator } from 'react-native';

export default function LoginScreen({
                                        navigation,
                                        onLogin,                // E-Mail-Login aus App.js
                                        onSendPhoneCode,        // Code anfordern
                                        onConfirmPhoneCode,     // Code bestätigen
                                        phone,
                                        setPhone,
                                        code,
                                        setCode,
                                        confirm,
                                        errorMessage,
                                        loading
                                    }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginMode, setLoginMode] = useState('email'); // 'email' oder 'phone'

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>

            {errorMessage && (
                <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
            )}

            {/* Modus-Auswahl (Tabs) */}
            <View style={styles.modeButtons}>
                <TouchableOpacity
                    style={[
                        styles.modeButton,
                        loginMode === 'email' && styles.modeButtonActive
                    ]}
                    onPress={() => setLoginMode('email')}
                >
                    <Text style={[
                        styles.modeButtonText,
                        loginMode === 'email' && styles.modeButtonTextActive
                    ]}>
                        Mit E-Mail
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.modeButton,
                        loginMode === 'phone' && styles.modeButtonActive
                    ]}
                    onPress={() => setLoginMode('phone')}
                >
                    <Text style={[
                        styles.modeButtonText,
                        loginMode === 'phone' && styles.modeButtonTextActive
                    ]}>
                        Mit Telefon
                    </Text>
                </TouchableOpacity>
            </View>

            {/* E-Mail-Login */}
            {loginMode === 'email' && (
                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="E-Mail"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Passwort"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => onLogin(email.trim(), password)}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Mit E-Mail anmelden</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            {/* Telefon-Login */}
            {loginMode === 'phone' && (
                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="+49123456789"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                    />

                    {!confirm ? (
                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={onSendPhoneCode}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Code senden</Text>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <>
                            <TextInput
                                style={styles.input}
                                placeholder="6-stelliger Code"
                                value={code}
                                onChangeText={setCode}
                                keyboardType="number-pad"
                                maxLength={6}
                            />

                            <TouchableOpacity
                                style={styles.loginButton}
                                onPress={onConfirmPhoneCode}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>Code bestätigen</Text>
                                )}
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            )}

            {/* Zusätzliche Links */}
            <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')} style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Passwort vergessen?</Text>
            </TouchableOpacity>

            <Button title="Zurück" onPress={() => navigation.goBack()} color="gray" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    errorBox: {
        backgroundColor: '#ffebee',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        width: '100%',
        borderWidth: 1,
        borderColor: '#f44336',
    },
    errorText: {
        color: '#d32f2f',
        textAlign: 'center',
        fontWeight: '500',
    },
    modeButtons: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 25,
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    modeButton: {
        flex: 1,
        paddingVertical: 14,
        backgroundColor: '#f8f8f8',
        alignItems: 'center',
    },
    modeButtonActive: {
        backgroundColor: '#007AFF',
    },
    modeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
    },
    modeButtonTextActive: {
        color: '#fff',
    },
    form: {
        width: '100%',
        alignItems: 'center',
    },
    input: {
        width: '100%',
        height: 52,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        marginVertical: 8,
        backgroundColor: '#fafafa',
        fontSize: 16,
    },
    loginButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        borderRadius: 10,
        width: '100%',
        marginTop: 15,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    forgotBtn: {
        marginTop: 20,
        marginBottom: 10,
    },
    forgotText: {
        color: '#007AFF',
        textDecorationLine: 'underline',
        fontSize: 16,
    },
});