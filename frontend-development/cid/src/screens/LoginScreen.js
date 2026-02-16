import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Button, ActivityIndicator } from 'react-native';

export default function LoginScreen({ navigation, onLogin, errorMessage, loading }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      {errorMessage && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="E-Mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        accessibilityLabel="E-Mail Adresse Eingabefeld"
        accessibilityHint="Gib hier deine registrierte E-Mail Adresse ein"
      />

      <TextInput
        style={styles.input}
        placeholder="Passwort"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.mainButton} onPress={() => onLogin(email.trim(), password)} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Anmelden</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')} style={styles.forgotBtn}>
        <Text style={styles.forgotText}>Passwort vergessen?</Text>
      </TouchableOpacity>

      <Button title="Zurück" onPress={() => navigation.goBack()} color="gray" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
  errorBox: { backgroundColor: '#ffebee', padding: 12, borderRadius: 8, marginBottom: 15, width: '100%', borderWidth: 1, borderColor: '#f44336' },
  errorText: { color: '#d32f2f', textAlign: 'center', fontWeight: '500' },
  input: { width: '100%', height: 50, borderColor: '#ddd', borderWidth: 1, borderRadius: 8, paddingHorizontal: 15, marginVertical: 10, backgroundColor: '#fafafa' },
  mainButton: { backgroundColor: '#007AFF', paddingVertical: 15, borderRadius: 10, width: '100%', marginVertical: 20, height: 55, justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  forgotBtn: { marginBottom: 15 },
  forgotText: { color: '#007AFF', textDecorationLine: 'underline' },
});
