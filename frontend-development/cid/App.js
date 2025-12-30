import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '@env';

import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import TestScreen from './src/screens/TestScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('HOME');
  const [isAppReady, setIsAppReady] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  const [userEmail, setUserEmail] = useState('');
  const [userText, setUserText] = useState('');

  const API_URL = BACKEND_URL;

  /**
   * Prüft beim Start, ob der User eingeloggt ist und stellt die Session wieder her.
   * Checks on start if the user is logged in and restores the session.
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
          // Hier setzen wir die Nachricht für den automatischen Login
          setData("Willkommen zurück! (Automatisch angemeldet)");
          setCurrentScreen('TEST');
        }
      } catch (e) {
        console.error("Fehler beim Initialisieren:", e);
      } finally {
        setIsAppReady(true);
      }
    };
    loadInitialState();
  }, []);

  /**
   * Lokale Echtzeit-Sicherung im AsyncStorage.
   */
  useEffect(() => {
    const saveLocally = async () => {
      if (currentScreen === 'TEST' && isAppReady) {
        await AsyncStorage.setItem('@user_text', userText);
      }
    };
    saveLocally();
  }, [userText]);

  /**
   * Testet die Erreichbarkeit des Backends.
   */
  const testConnection = async () => {
    setLoading(true);
    setData(null); // Alte Nachricht löschen
    try {
      const response = await fetch(`${API_URL}/status`);
      const json = await response.json();
      setData(`Backend-Status: ${json.nachricht}`);
    } catch (error) {
      setData("Fehler: Verbindung zum Backend fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await response.json();
      if (response.ok) {
        setData(json.nachricht);
        setCurrentScreen('TEST');
      } else {
        setData(json.fehler || "Registrierung fehlgeschlagen");
        setCurrentScreen('TEST');
      }
    } catch (error) {
      setData("Netzwerkfehler");
      setCurrentScreen('TEST');
    } finally {
      setLoading(false);
    }
  };

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
        await AsyncStorage.setItem('@user_text', json.user.userData || '');
        setUserEmail(email);
        setUserText(json.user.userData || '');
        setData(`Login erfolgreich! Daten wurden synchronisiert.`);
        setCurrentScreen('TEST');
      } else {
        setLoginError(json.fehler || "Login fehlgeschlagen");
      }
    } catch (error) {
      setLoginError("Netzwerkfehler beim Login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      // Synchronisation mit Backend vor dem Löschen
      await fetch(`${API_URL}/save-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, userData: userText }),
      });
      await AsyncStorage.multiRemove(['@is_logged_in', '@user_email', '@user_text']);
      setUserEmail('');
      setUserText('');
      setData(null);
      setCurrentScreen('HOME');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isAppReady) return null;

  switch (currentScreen) {
    case 'HOME':
      return <HomeScreen onNavigateToLogin={() => setCurrentScreen('LOGIN')} onNavigateToRegister={() => setCurrentScreen('REGISTER')} />;
    case 'LOGIN':
      return <LoginScreen onLogin={handleLogin} errorMessage={loginError} onBack={() => setCurrentScreen('HOME')} />;
    case 'REGISTER':
      return <RegisterScreen onRegister={handleRegister} onBack={() => setCurrentScreen('HOME')} />;
    case 'TEST':
      return (
        <TestScreen 
          data={data} 
          loading={loading} 
          onTest={testConnection} // Hier war vorher eine leere Funktion!
          onLogout={handleLogout} 
          userText={userText} 
          setUserText={setUserText} 
        />
      );
    default:
      return <HomeScreen onNavigateToLogin={() => setCurrentScreen('LOGIN')} />;
  }
}