import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';

/**
 * Startbildschirm der Anwendung mit Logo und Navigationsoptionen.
 * Home screen of the application with logo and navigation options.
 * * @param {Object} props - Navigations-Handler | Navigation handlers
 */
export default function HomeScreen({ onNavigateToLogin, onNavigateToRegister }) {
  return (
    <View style={styles.container}>
      {/* Anzeige des App-Logos | Display of the app logo */}
      <Image 
        source={require('../../assets/icon.png')} 
        style={styles.logo} 
      />
      
      <Text style={styles.welcomeText}>Willkommen bei Territory Conqueror</Text>
      
      {/* Navigations-Button zum Login-Screen | Navigation button to login screen */}
      <TouchableOpacity 
        style={styles.mainButton} 
        onPress={onNavigateToLogin}
      >
        <Text style={styles.buttonText}>Zum Login</Text>
      </TouchableOpacity>

      {/* Button zur Registrierung eines neuen Kontos | Button for registering a new account */}
      <TouchableOpacity 
        style={[styles.mainButton, styles.registerButton]} 
        onPress={onNavigateToRegister}
      >
        <Text style={styles.buttonText}>Registrieren</Text>
      </TouchableOpacity>
    </View>
  );
}

/**
 * Stylesheets für das Layout des HomeScreens.
 * Stylesheets for the HomeScreen layout.
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff'
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 30
  },
  welcomeText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    color: '#333'
  },
  mainButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center'
  },
  registerButton: {
    backgroundColor: '#28a745',
    marginTop: 10
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  }
});