import React, { useState } from 'react';
import { BACKEND_URL } from '@env';

// Import der funktionalen Bildschirme | Import of functional screens
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import TestScreen from './src/screens/TestScreen';

/**
 * Hauptkomponente zur Steuerung des Anwendungsflusses und des globalen Status.
 * Main component controlling the application flow and global state.
 */
export default function App() {
  // Navigation-Status zur Steuerung der Bildschirmanzeige | Navigation state to control screen display
  const [currentScreen, setCurrentScreen] = useState('HOME');
  
  // Status für API-Antwortdaten und Ladeindikatoren | State for API response data and loading indicators
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Basis-URL für API-Anfragen | Base URL for API requests
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
   * * @param {string} email - Die E-Mail des Benutzers | User's email
   * @param {string} password - Das gewählte Passwort | Chosen password
   */
  const handleRegister = async (email, password) => {
    setLoading(true);
    setData(null); // Vorherige Ergebnisse zurücksetzen | Reset previous results

    try {
      // POST-Anfrage an den Registrierungs-Endpunkt | POST request to the registration endpoint
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const json = await response.json();

      if (response.ok) {
        // Erfolgsfall: Nachricht speichern und zum Test-Screen navigieren
        // Success: Store message and navigate to test screen
        setData(json.nachricht);
        setCurrentScreen('TEST');
      } else {
        // Fehlerfall: Fehlermeldung vom Server anzeigen
        // Failure: Display error message from server
        setData(json.fehler || "Registrierung fehlgeschlagen | Registration failed");
        setCurrentScreen('TEST'); // Wechsel zum Screen, um Fehlermeldung anzuzeigen
      }
    } catch (error) {
      // Netzwerkfehler | Network error
      setData("Netzwerkfehler: Backend nicht erreichbar | Network error: Backend unreachable");
      setCurrentScreen('TEST');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Steuerung des bedingten Renderings basierend auf currentScreen.
   * Conditional rendering logic based on currentScreen.
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
          onLoginSuccess={() => setCurrentScreen('TEST')} 
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