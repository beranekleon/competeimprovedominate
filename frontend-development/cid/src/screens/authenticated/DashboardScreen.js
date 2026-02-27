import React, { useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
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

  const handleStartStop = async () => {
    if (!isRunning) {
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
    };

    try {
      setRecordingLoading(true);
      await userService.saveSession(userEmail, session);
      setIsRunning(false);
      setSessionStartTime(null);
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
