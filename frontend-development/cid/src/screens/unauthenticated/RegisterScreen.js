import React, { useState } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Button,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { CommonStyles } from '../../styles';

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
    <View style={CommonStyles.screenContainer}>
      <Text style={CommonStyles.screenTitle}>Registrierung</Text>

      <TextInput
        style={CommonStyles.input}
        placeholder="E-Mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading}
      />

      <TextInput
        style={CommonStyles.input}
        placeholder="Passwort"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />

      <TextInput
        style={CommonStyles.input}
        placeholder="Telefonnummer (optional, z.B. +49123456789)"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        editable={!loading}
      />

      <TouchableOpacity
        style={CommonStyles.buttonPrimary}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={CommonStyles.buttonText}>Konto erstellen</Text>
        )}
      </TouchableOpacity>

      <Button title="Zurück" onPress={() => navigation.goBack()} color="gray" />
    </View>
  );
}