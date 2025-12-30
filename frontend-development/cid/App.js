import React, { useState } from 'react';
import { BACKEND_URL } from '@env';

/** * Import der funktionalen Bildschirme | Import of functional screens 
 */
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import TestScreen from './src/screens/TestScreen';

/**
 * Hauptkomponente zur Steuerung des Anwendungsflusses und der Authentifizierungslogik.
 * Main component for controlling application flow and authentication logic.
 */
export default function App() {
  /** * Navigation-Status: 'HOME', 'LOGIN', 'REGISTER', 'TEST' 
   * Navigation state: 'HOME', 'LOGIN', 'REGISTER', 'TEST'
   */
  const [currentScreen, setCurrentScreen] = useState('HOME');
  
  /** * Status für API-Antwortdaten und Ladeindikatoren 
   * State for API response data and loading indicators 
   */
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  /** * Basis-URL aus der Umgebungskonfiguration 
   * Base URL from environment configuration 
   */
  const API_URL = BACKEND_URL;

  /**
   * Führt einen Verbindungstest zum Backend durch (GET /status).
   * Performs a connectivity test to the backend (GET /status).
   */
  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/status`);
      const json = await response.json();
      setData(json.nachricht);
    } catch (error) {
      setData("Fehler: Backend nicht erreichbar | Error: Backend unreachable");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Übermittelt Registrierungsdaten per POST an das Backend.
   * Transmits registration data to the backend via POST.
   */
  const handleRegister = async (email, password) => {
    setLoading(true);
    setData(null);
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
        setData(json.fehler || "Registrierung fehlgeschlagen | Registration failed");
        setCurrentScreen('TEST');
      }
    } catch (error) {
      setData("Netzwerkfehler | Network error");
      setCurrentScreen('TEST');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Übermittelt Login-Daten an das Backend zur Verifizierung (POST /login).
   * Submits login data to the backend for verification (POST /login).
   * * @param {string} email - Benutzer-E-Mail | User email
   * @param {string} password - Benutzer-Passwort | User password
   */
  const handleLogin = async (email, password) => {
    setLoading(true);
    setData(null);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await response.json();

      if (response.ok) {
        /** * Erfolgreicher Login: Benutzerinfo speichern und navigieren 
         * Successful login: store user info and navigate 
         */
        setData(`Login erfolgreich! Willkommen ${json.user.email}`);
        setCurrentScreen('TEST');
      } else {
        /** * Fehlerbehandlung bei falschen Zugangsdaten 
         * Error handling for invalid credentials 
         */
        setData(json.fehler || "Login fehlgeschlagen | Login failed");
        setCurrentScreen('TEST');
      }
    } catch (error) {
      setData("Netzwerkfehler beim Login | Network error during login");
      setCurrentScreen('TEST');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Bedingtes Rendering basierend auf dem aktuellen Navigationsstatus.
   * Conditional rendering based on the current navigation state.
   */
  switch (currentScreen) {
    case 'HOME':
      return (
        <HomeScreen 
          onNavigateToLogin={() => setCurrentScreen('LOGIN')} 
          onNavigateToRegister={() => setCurrentScreen('REGISTER')} 
        />
      );
    case 'LOGIN':
      return (
        <LoginScreen 
          onLogin={handleLogin} 
          onBack={() => setCurrentScreen('HOME')} 
        />
      );
    case 'REGISTER':
      return (
        <RegisterScreen 
          onRegister={handleRegister} 
          onBack={() => setCurrentScreen('HOME')} 
        />
      );
    case 'TEST':
      return (
        <TestScreen 
          data={data} 
          loading={loading} 
          onTest={testConnection} 
          onLogout={() => setCurrentScreen('HOME')} 
        />
      );
    default:
      return <HomeScreen onNavigateToLogin={() => setCurrentScreen('LOGIN')} />;
  }
}