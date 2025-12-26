/**
 * HomeScreen Erweiterung um Registrierungs-Button.
 * HomeScreen extension including a registration button.
 */
export default function HomeScreen({ onNavigateToLogin, onNavigateToRegister }) {
  return (
    <View style={styles.container}>
      <Image source={require('../../assets/logo.jpg')} style={styles.logo} />
      <Text style={styles.welcomeText}>Willkommen bei Territory Conqueror</Text>
      
      <TouchableOpacity style={styles.mainButton} onPress={onNavigateToLogin}>
        <Text style={styles.buttonText}>Zum Login</Text>
      </TouchableOpacity>

      {/* Button zur Registrierung | Button for registration */}
      <TouchableOpacity 
        style={[styles.mainButton, { backgroundColor: '#28a745', marginTop: 10 }]} 
        onPress={onNavigateToRegister}
      >
        <Text style={styles.buttonText}>Registrieren</Text>
      </TouchableOpacity>
    </View>
  );
}
// ... styles wie gehabt | styles as before