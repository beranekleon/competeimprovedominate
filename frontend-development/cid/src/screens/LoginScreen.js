import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Button, ActivityIndicator } from 'react-native';

export default function LoginScreen({ navigation, onLogin, onSendPhoneCode, onConfirmPhoneCode, phone, setPhone, code, setCode, confirm, errorMessage, loading }) {
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

            {/* Auswahl-Buttons */}
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

            {/* E-Mail-Bereich – nur sichtbar bei loginMode = 'email' */}
            {loginMode === 'email' && (
                <View style={styles.formSection}>
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
                        style={styles.mainButton}
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

            {/* Telefon-Bereich – nur sichtbar bei loginMode = 'phone' */}
            {loginMode === 'phone' && (
                <View style={styles.formSection}>
                    <TextInput
                        style={styles.input}
                        placeholder="+49123456789"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                    />

                    {!confirm ? (
                        <TouchableOpacity
                            style={styles.mainButton}
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
                                style={styles.mainButton}
                                onPress={onConfirmPhoneCode}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>Bestätigen</Text>
                                )}
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            )}

            {/* Reset-Passwort-Link */}
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
        fontSize: 26,
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
        marginBottom: 20,
        justifyContent: 'space-between',
    },
    modeButton: {
        flex: 1,
        paddingVertical: 12,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    modeButtonActive: {
        backgroundColor: '#007AFF',
    },
    modeButtonText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
    modeButtonTextActive: {
        color: '#fff',
    },
    formSection: {
        width: '100%',
        alignItems: 'center',
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginVertical: 10,
        backgroundColor: '#fafafa',
    },
    mainButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        borderRadius: 10,
        width: '100%',
        marginVertical: 10,
        height: 55,
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    forgotBtn: {
        marginTop: 15,
        marginBottom: 10,
    },
    forgotText: {
        color: '#007AFF',
        textDecorationLine: 'underline',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    phoneSection: {
        width: '100%',
        marginTop: 20,
    },
});