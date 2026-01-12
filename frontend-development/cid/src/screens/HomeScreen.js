import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Image source={require('../../assets/icon.png')} style={styles.logo} />
      <Text style={styles.welcomeText}>Willkommen bei Territory Conqueror</Text>
      
      <TouchableOpacity style={styles.mainButton} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Zum Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.mainButton, styles.registerButton]} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.buttonText}>Registrieren</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  logo: { width: 200, height: 200, resizeMode: 'contain', marginBottom: 30 },
  welcomeText: { fontSize: 18, textAlign: 'center', marginBottom: 40, color: '#333' },
  mainButton: { backgroundColor: '#007AFF', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 10, width: '100%', marginBottom: 15 },
  registerButton: { backgroundColor: '#34C759' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }
});