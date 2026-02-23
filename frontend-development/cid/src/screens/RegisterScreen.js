import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Button,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';

/**
 * RegisterScreen
 * User account registration form
 */
export default function RegisterScreen({ navigation }) {
  const { register, loading } = useAuth();
  const { login } = useAuth(); // For automatic login after registration
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const handleRegister = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Fehler', 'Email und Passwort erforderlich');
      return;
    }

    try {
      await register(email, password, phone || null);
      // Automatically log in the user
      await login(email, password);
      // Navigation will automatically happen via AppNavigator based on isLoggedIn state
    } catch (error) {
      Alert.alert('Fehler', error.message || 'Registrierung fehlgeschlagen');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrierung</Text>

      <TextInput
        style={styles.input}
        placeholder="E-Mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Passwort"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Telefonnummer (optional, z.B. +49123456789)"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        editable={!loading}
      />

      <TouchableOpacity
        style={styles.mainButton}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Konto erstellen</Text>
        )}
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
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
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
    backgroundColor: '#34C759',
    paddingVertical: 15,
    borderRadius: 10,
    width: '100%',
    marginVertical: 20,
    height: 55,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});