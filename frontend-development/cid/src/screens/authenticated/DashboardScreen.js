import React, { useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useAuth } from '../../hooks/useAuth';
import { useGPS } from '../../hooks/useGPS';
import { CommonStyles, Colors } from '../../styles';
import TaskBar from '../../components/TaskBar';

/**
 * DashboardScreen
 * Main user dashboard with map and taskbar
 */
export default function DashboardScreen({ navigation }) {
  const { loading } = useAuth();
  const { location, errorMsg, region, isLoading: gpsLoading } = useGPS();
  const [isRunning, setIsRunning] = useState(false);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
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
        loading={loading}
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
