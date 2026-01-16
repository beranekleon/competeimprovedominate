import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function TestScreen({ data, loading, onTest, onLogout, userText, setUserText }) {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [region, setRegion] = useState(null);

  useEffect(() => {
    let locationSubscription = null;

    (async () => {
      console.log("Prüfe Standort-Berechtigungen...");
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Berechtigung zum Zugriff auf den Standort wurde verweigert.');
          return;
        }

        // 1. Versuch: Schneller Abruf des letzten bekannten Standorts (verhindert Hanging)
        let lastKnown = await Location.getLastKnownPositionAsync({});
        if (lastKnown) {
          console.log("Letzter bekannter Standort geladen.");
          updateLocationState(lastKnown);
        }

        // 2. Versuch: Aktuellen Standort mit Timeout abrufen
        // Wir setzen ein kurzes Zeitlimit, damit die App nicht hängen bleibt
        try {
          let initialLocation = await Promise.race([
            Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
          ]);
          console.log("Aktueller initialer Standort gefunden.");
          updateLocationState(initialLocation);
        } catch (e) {
          console.log("Initialer Abruf übersprungen (Timeout/Fehler), starte Live-Tracking...");
        }

        // 3. Kontinuierliches Tracking starten
        // Das ist am wichtigsten für den Emulator, da er auf "Set Location" Events reagiert
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 1, // Wir reagieren schon auf 1 Meter Änderung für Tests
            timeInterval: 2000,   // Alle 2 Sekunden prüfen
          },
          (newLocation) => {
            console.log("Live-Standort Update erhalten.");
            updateLocationState(newLocation);
          }
        );

      } catch (err) {
        console.error("Fehler im Location-Setup:", err);
        setErrorMsg("GPS-Fehler: " + err.message);
      }
    })();

    // Cleanup-Funktion beim Verlassen des Screens
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
        console.log("Location-Subscription beendet.");
      }
    };
  }, []);

  const updateLocationState = (newLocation) => {
    const { latitude, longitude } = newLocation.coords;
    setLocation(newLocation.coords);
    setRegion({
      latitude,
      longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Dashboard</Text>
        
        <View style={styles.mapContainer}>
          {region ? (
            <MapView 
              style={styles.map} 
              region={region}
              showsUserLocation={true}
              loadingEnabled={true}
            >
              {location && (
                <Marker 
                  coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                  title="Aktuelle Position"
                />
              )}
            </MapView>
          ) : (
            <View style={[styles.map, styles.mapPlaceholder]}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={{ marginTop: 10 }}>Warte auf GPS-Daten...</Text>
              {errorMsg && <Text style={{ color: 'red', marginTop: 10 }}>{errorMsg}</Text>}
              <Text style={styles.hintText}>
                Tipp: Setze im Emulator erst die Location, dann starte die App mit 'r' neu.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.messageBox}>
          {loading ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Text style={styles.messageText}>{data || "System bereit"}</Text>
          )}
        </View>

        <Text style={styles.label}>Deine Notizen (Cloud-Sync):</Text>
        <TextInput
          style={styles.input}
          placeholder="Notizen hier..."
          value={userText}
          onChangeText={setUserText}
          multiline
        />

        <TouchableOpacity style={styles.testButton} onPress={onTest}>
          <Text style={styles.buttonText}>Verbindung testen</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.buttonText}>Speichern & Ausloggen</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContainer: { alignItems: 'center', padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  mapContainer: {
    width: '100%',
    height: 300,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  map: { width: '100%', height: '100%' },
  mapPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 20
  },
  hintText: { fontSize: 11, color: '#888', marginTop: 15, textAlign: 'center' },
  messageBox: {
    width: '100%',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 20,
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center'
  },
  messageText: { color: '#007AFF', textAlign: 'center' },
  label: { alignSelf: 'flex-start', marginBottom: 5, fontWeight: '600', color: '#666' },
  input: {
    width: '100%',
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    textAlignVertical: 'top',
  },
  testButton: { backgroundColor: '#5856D6', paddingVertical: 12, borderRadius: 10, width: '100%', marginTop: 20 },
  logoutButton: { backgroundColor: '#FF3B30', paddingVertical: 15, borderRadius: 10, width: '100%', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }
});