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
   * Lädt den initialen Status (Kaltstart).
   * Loads the initial state (cold start).
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
          setCurrentScreen('TEST');
        }
      } catch (e) { console.error(e); }
      finally { setIsAppReady(true); }
    };
    loadInitialState();
  }, []);

  /**
   * Lokale Persistenz während der Session.
   * Local persistence during the session.
   */
  useEffect(() => {
    const saveLocally = async () => {
      if (currentScreen === 'TEST') {
        await AsyncStorage.setItem('@user_text', userText);
      }
    };
    saveLocally();
  }, [userText]);

  /**
   * Login-Funktion mit Daten-Abruf (Zwei-Wege-Sync).
   * Login function with data retrieval (two-way sync).
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
        /**
         * Speichern der Identität und der vom Backend gelieferten Daten.
         * Storing identity and data delivered by the backend.
         */
        await AsyncStorage.setItem('@is_logged_in', 'true');
        await AsyncStorage.setItem('@user_email', email);
        await AsyncStorage.setItem('@user_text', json.user.userData || '');

        setUserEmail(email);
        setUserText(json.user.userData || ''); // Daten in das Textfeld laden | Loading data into text field
        
        setData(`Willkommen zurück! Daten wurden geladen.`);
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

  /**
   * Logout mit abschließender Synchronisation.
   * Logout with final synchronization.
   */
  const handleLogout = async () => {
    setLoading(true);
    try {
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
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
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
      return <TestScreen data={data} loading={loading} onTest={() => {}} onLogout={handleLogout} userText={userText} setUserText={setUserText} />;
    default:
      return <HomeScreen onNavigateToLogin={() => setCurrentScreen('LOGIN')} />;
  }
}