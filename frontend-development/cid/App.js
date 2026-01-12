import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '@env';

// Screens importieren
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import TestScreen from './src/screens/TestScreen';

const Stack = createStackNavigator();

export default function App() {
  // State-Management
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userText, setUserText] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null); // Für /status Nachrichten
  const [loginError, setLoginError] = useState(null);

  const API_URL = BACKEND_URL;

  /**
   * Stellt die Sitzung beim App-Start wieder her.
   */
  useEffect(() => {
    const loadInitialState = async () => {
      try {
        const loggedIn = await AsyncStorage.getItem('@is_logged_in');
        const savedEmail = await AsyncStorage.getItem('@user_email');
        const savedText = await AsyncStorage.getItem('@user_text');

        if (loggedIn === 'true' && savedEmail) {
          setUserEmail(savedEmail);
          setUserText(savedText || '');
          setIsLoggedIn(true);
        }
      } catch (e) {
        console.error("Fehler beim Laden des lokalen Speichers:", e);
      } finally {
        setIsAppReady(true);
      }
    };
    loadInitialState();
  }, []);

  /**
   * Testet die Verbindung zum Backend (/status).
   */
  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/status`);
      const json = await response.json();
      setData(json.nachricht);
    } catch (e) {
      setData("Verbindungsfehler: Backend nicht erreichbar");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Loggt den Benutzer ein und speichert die Session.
   */
  const handleLogin = async (email, password) => {
    setLoading(true);
    setLoginError(null);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await response.json();

      if (response.ok) {
        // Daten lokal speichern
        await AsyncStorage.setItem('@is_logged_in', 'true');
        await AsyncStorage.setItem('@user_email', email);
        await AsyncStorage.setItem('@user_text', json.user.userData || '');
        
        // App State aktualisieren
        setUserEmail(email);
        setUserText(json.user.userData || '');
        setIsLoggedIn(true);
      } else {
        setLoginError(json.fehler || "Login fehlgeschlagen");
      }
    } catch (e) {
      setLoginError("Netzwerkfehler: Bitte Internetverbindung prüfen");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Speichert die Daten in der Cloud und loggt den User aus.
   */
  const handleLogout = async () => {
    setLoading(true);
    try {
      // 1. Synchronisation mit Firestore
      await fetch(`${API_URL}/save-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, userData: userText }),
      });

      // 2. Lokale Daten löschen
      await AsyncStorage.multiRemove(['@is_logged_in', '@user_email', '@user_text']);
      
      // 3. States zurücksetzen
      setUserEmail('');
      setUserText('');
      setData(null);
      setIsLoggedIn(false);
    } catch (e) {
      console.error("Fehler beim Logout/Sync:", e);
      alert("Fehler beim Speichern. Du wirst trotzdem ausgeloggt.");
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  // Splash-Screen Logik (wartet bis AsyncStorage bereit ist)
  if (!isAppReady) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          // Eingeloggter Bereich
          <Stack.Screen name="Dashboard">
            {(props) => (
              <TestScreen 
                {...props} 
                userText={userText} 
                setUserText={setUserText} 
                onLogout={handleLogout} 
                onTest={testConnection}
                data={data}
                loading={loading}
              />
            )}
          </Stack.Screen>
        ) : (
          // Nicht eingeloggter Bereich
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen 
                  {...props} 
                  onLogin={handleLogin} 
                  errorMessage={loginError} 
                  loading={loading}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}