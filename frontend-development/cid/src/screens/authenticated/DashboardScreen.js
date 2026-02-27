import React, { useEffect, useRef, useState } from 'react';
import {
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useAuth } from '../../hooks/useAuth';
import { useGPS } from '../../hooks/useGPS';
import { CommonStyles, Colors } from '../../styles';
import TaskBar from '../../components/TaskBar';
import userService from '../../services/user.service';

/**
 * DashboardScreen
 * Main user dashboard with map and taskbar
 */
export default function DashboardScreen({ navigation }) {
  const { loading, userEmail } = useAuth();
  const { location, errorMsg, region, isLoading: gpsLoading } = useGPS();
  const [isRunning, setIsRunning] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [recordingLoading, setRecordingLoading] = useState(false);
  const gpsTrackRef = useRef([]);
  const latestLocationRef = useRef(null);

  useEffect(() => {
    latestLocationRef.current = location || null;
  }, [location]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const pushCurrentLocation = () => {
      const current = latestLocationRef.current;
      if (!current || typeof current.latitude !== 'number' || typeof current.longitude !== 'number') {
        return;
      }

      const sample = {
        latitude: current.latitude,
        longitude: current.longitude,
        accuracy: typeof current.accuracy === 'number' ? current.accuracy : null,
        speed: typeof current.speed === 'number' ? current.speed : null,
        heading: typeof current.heading === 'number' ? current.heading : null,
        timestamp: new Date().toISOString(),
      };

      gpsTrackRef.current.push(sample);
    };

    pushCurrentLocation();
    const intervalId = setInterval(pushCurrentLocation, 5000);

    return () => clearInterval(intervalId);
  }, [isRunning]);

  const handleStartStop = async () => {
    if (!isRunning) {
      gpsTrackRef.current = [];
      setSessionStartTime(Date.now());
      setIsRunning(true);
      return;
    }

    if (!sessionStartTime) {
      setIsRunning(false);
      return;
    }

    const stopTime = Date.now();
    const durationMs = Math.max(0, stopTime - sessionStartTime);
    const session = {
      startedAt: new Date(sessionStartTime).toISOString(),
      stoppedAt: new Date(stopTime).toISOString(),
      durationMs,
      durationSeconds: Math.floor(durationMs / 1000),
      locations: gpsTrackRef.current,
    };

    try {
      setRecordingLoading(true);
      await userService.saveSession(userEmail, session);
      setIsRunning(false);
      setSessionStartTime(null);
      gpsTrackRef.current = [];
    } catch (error) {
      Alert.alert('Fehler', error.message || 'Session konnte nicht gespeichert werden.');
    } finally {
      setRecordingLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Full Screen Map */}
      <View style={styles.mapContainer}>
        {region ? (
          <MapView style={styles.map} region={region} showsUserLocation={true}>
            {location && <Marker coordinate={location} title="Deine Position" />}
          </MapView>
        ) : (
          <View style={styles.mapPlaceholder}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={{ marginTop: 10 }}>GPS wird gesucht...</Text>
            {errorMsg && <Text style={{ color: Colors.error }}>{errorMsg}</Text>}
          </View>
        )}
      </View>

      {/* Bottom Taskbar */}
      <TaskBar
        onCenterPress={handleStartStop}
        centerButtonText={isRunning ? 'Stop' : 'Start'}
        centerButtonActive={isRunning}
        onRightPress={() => navigation.navigate('Profile')}
        rightButtonVisible={true}
        loading={loading || recordingLoading}
      />
    </View>
  );
}

// Screen-specific styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
  },
});
