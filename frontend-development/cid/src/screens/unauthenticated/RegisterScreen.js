
import React, { useState } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Button,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { CommonStyles, Colors } from '../../styles';

/**
 * Prüft, ob die E-Mail ein gültiges Format hat
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * RegisterScreen
 * User account registration form
 */
export default function RegisterScreen({ navigation }) {
  const { register, loading } = useAuth();
  const { login } = useAuth(); // For automatic login after registration
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const handleRegister = async () => {
    Keyboard.dismiss();
    if (!email.trim() || !password.trim()) {
      showToast({ message: 'Email und Passwort erforderlich', type: 'error' });
      return;
    }

    if (!isValidEmail(email.trim())) {
      showToast({ message: 'Bitte eine gültige E-Mail eingeben', type: 'error' });
      return;
    }

    try {
      await register(email, password, phone || null);
      // Automatically log in the user
      await login(email, password);
      showToast({ message: 'Registrierung erfolgreich!', type: 'success' });
      // Navigation will automatically happen via AppNavigator based on isLoggedIn state
    } catch (error) {
      showToast({ message: error.message || 'Registrierung fehlgeschlagen', type: 'error' });
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
        accessibilityLabel="E-Mail Adresse"
      />

      <TextInput
        style={CommonStyles.input}
        placeholder="Passwort"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
        accessibilityLabel="Passwort"
      />

      <TextInput
        style={CommonStyles.input}
        placeholder="Telefonnummer (optional, z.B. +49123456789)"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        editable={!loading}
        accessibilityLabel="Telefonnummer optional"
      />

      <TouchableOpacity
        style={CommonStyles.buttonPrimary}
        onPress={handleRegister}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="Konto erstellen"
      >
        {loading ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={CommonStyles.buttonText}>Konto erstellen</Text>
        )}
      </TouchableOpacity>

      <Button
        title="Zurück"
        onPress={() => navigation.goBack()}
        color={Colors.textGray}
        accessibilityLabel="Zurück zur Startseite"
      />
    </View>
  );
}