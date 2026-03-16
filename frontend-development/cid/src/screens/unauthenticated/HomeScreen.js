import React from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import { CommonStyles } from '../../styles';

/**
 * HomeScreen
 * Welcome page with login & register buttons
 */
export default function HomeScreen({ navigation }) {
  return (
    <View style={CommonStyles.screenContainer}>
      <Image
        source={require('../../../assets/icon.png')}
        style={CommonStyles.logo}
        accessibilityRole="image"
        accessibilityLabel="Territory Conqueror Logo"
      />
      <Text style={CommonStyles.welcomeText}>Willkommen bei Territory Conqueror</Text>

      <TouchableOpacity
        style={CommonStyles.mainButton}
        onPress={() => navigation.navigate('Login')}
        accessibilityRole="button"
        accessibilityLabel="Zum Login"
      >
        <Text style={CommonStyles.buttonText}>Zum Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[CommonStyles.mainButton, CommonStyles.registerButton]}
        onPress={() => navigation.navigate('Register')}
        accessibilityRole="button"
        accessibilityLabel="Registrieren"
      >
        <Text style={CommonStyles.buttonText}>Registrieren</Text>
      </TouchableOpacity>
    </View>
  );
}