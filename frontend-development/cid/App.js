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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userText, setUserText] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null); 
  const [loginError, setLoginError] = useState(null);

  const API_URL = BACKEND_URL;

  // 1. Sitzung beim App-Start wiederherstellen
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
        console.error("Fehler beim Laden:", e);
      } finally {
        setIsAppReady(true);
      }
    };
    loadInitialState();
  }, []);

  // 2. Verbindungstest
  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/status`);
      const json = await response.json();
      setData(json.nachricht);
    } catch (e) {
      setData("Verbindungsfehler");
    } finally {
      setLoading(false);
    }
  };

  // 3. Login
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
        await AsyncStorage.setItem('@is_logged_in', 'true');
        await AsyncStorage.setItem('@user_email', email);
        await AsyncStorage.setItem('@user_text', JSON.stringify(json.user.userData) || '');
        
        setUserEmail(email);
        setUserText(typeof json.user.userData === 'object' ? JSON.stringify(json.user.userData) : json.user.userData);
        setIsLoggedIn(true);
      } else {
        setLoginError(json.fehler || "Login fehlgeschlagen");
      }
    } catch (e) {
      setLoginError("Netzwerkfehler");
    } finally {
      setLoading(false);
    }
  };

  // 4. Logout (mit Cloud-Sync)
  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/save-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, userData: userText }),
      });
      await AsyncStorage.multiRemove(['@is_logged_in', '@user_email', '@user_text']);
      setIsLoggedIn(false);
      setUserEmail('');
      setUserText('');
      setData(null);
    } catch (e) {
      console.error("Sync-Fehler:", e);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  // 5. NEU: Account löschen Logik
  const handleDeleteAccount = async (password) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/delete-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, password }),
      });
      const json = await response.json();

      if (response.ok) {
        await AsyncStorage.multiRemove(['@is_logged_in', '@user_email', '@user_text']);
        setIsLoggedIn(false);
        setUserEmail('');
        setUserText('');
        alert("Konto erfolgreich gelöscht.");
      } else {
        alert(json.fehler || "Fehler beim Löschen.");
      }
    } catch (e) {
      alert("Netzwerkfehler beim Löschen.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAppReady) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name="Dashboard">
            {(props) => (
              <TestScreen 
                {...props} 
                userText={userText} 
                setUserText={setUserText} 
                onLogout={handleLogout} 
                onTest={testConnection}
                onDeleteAccount={handleDeleteAccount} // Hier wird die Funktion übergeben
                data={data}
                loading={loading}
              />
            )}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen {...props} onLogin={handleLogin} errorMessage={loginError} loading={loading} />
              )}
            </Stack.Screen>
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}