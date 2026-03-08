import React, { useCallback, useRef } from 'react';
import {
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker, Polygon, Polyline } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useGPS } from '../../hooks/useGPS';
import { useSessionRecorder } from '../../hooks/useSessionRecorder';
import { useTerritoryGeometry } from '../../hooks/useTerritoryGeometry';
import { useUserSessions } from '../../hooks/useUserSessions';
import { Colors } from '../../styles';
import TaskBar from '../../components/TaskBar';
import { isValidCoordinate } from '../../utils/territory.utils';

const DEFAULT_REGION = {
  latitude: 48.2082,
  longitude: 16.3738,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

/**
 * DashboardScreen
 * Main user dashboard with map and taskbar
 */
export default function DashboardScreen({ navigation }) {

  const { loading, userEmail } = useAuth();
  // const { location, errorMsg, region, isLoading: gpsLoading } = useGPS();
  const { location, errorMsg, region } = useGPS();
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);

  const handleSessionsFetchError = useCallback((error) => {
    Alert.alert('Fehler', error?.message || 'Sessions konnten nicht geladen werden.');
  }, []);

  const {
    sessions,
    sessionsLoading,
    fetchSessions,
  } = useUserSessions({
    userEmail,
    onFetchError: handleSessionsFetchError,
  });

  const handleSessionSaveError = useCallback((error) => {
    Alert.alert(
      'Fehler',
      error?.message || 'Session konnte nicht gespeichert werden.'
    );
  }, []);

  const {
    isRunning,
    recordingLoading,
    liveTrack,
    toggleRecording,
  } = useSessionRecorder({
    userEmail,
    location,
    onSessionSaved: fetchSessions,
    onSaveError: handleSessionSaveError,
  });

  const {
    sessionTracks,
    mergedTerritoryRings,
    territoryCoordinates,
  } = useTerritoryGeometry({ sessions });

  const handleRecenter = useCallback(() => {
    if (!mapRef.current) {
      return;
    }

    if (isValidCoordinate(location)) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 350);
      return;
    }

    mapRef.current.animateToRegion(region || DEFAULT_REGION, 350);
  }, [location, region]);

  const handleShowAllTerritories = useCallback(() => {
    if (!mapRef.current) {
      return;
    }

    if (territoryCoordinates.length === 0) {
      handleRecenter();
      return;
    }

    if (territoryCoordinates.length === 1) {
      const onlyPoint = territoryCoordinates[0];
      mapRef.current.animateToRegion({
        latitude: onlyPoint.latitude,
        longitude: onlyPoint.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 350);
      return;
    }

    mapRef.current.fitToCoordinates(territoryCoordinates, {
      edgePadding: { top: 80, right: 80, bottom: 120, left: 80 },
      animated: true,
    });
  }, [territoryCoordinates, handleRecenter]);

  return (
    <View style={styles.container}>

      {/* Full Screen Map */}
      <View style={styles.mapContainer}>
        {region || sessions.length > 0 ? (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={region || DEFAULT_REGION}
            showsUserLocation={true}
          >
            {mergedTerritoryRings.map((ring, index) => (
              <Polygon
                key={`territory-${index}`}
                coordinates={ring}
                strokeColor="rgba(255, 0, 0, 1)"
                fillColor="rgba(255, 0, 0, 0.1)"
                strokeWidth={2}
              />
            ))}

            {sessionTracks.map((track, index) => (
              <Polyline
                key={`session-track-${index}`}
                coordinates={track}
                strokeColor="rgba(255, 0, 0, 1)"
                strokeWidth={3}
              />
            ))}

            {isRunning && liveTrack.length >= 2 && (
              <Polyline
                coordinates={liveTrack}
                strokeColor="rgba(255, 0, 0, 1)"
                strokeWidth={4}
              />
            )}

            {location && <Marker coordinate={location} title="Deine Position" />}
          </MapView>

        ) : (

          <View style={styles.mapPlaceholder}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={{ marginTop: 10 }}>GPS wird gesucht...</Text>
            {errorMsg && <Text style={{ color: Colors.error }}>{errorMsg}</Text>}
          </View>

        )}

        <View
          style={[
            styles.mapControls,
            {
              top: Math.max(12, insets.top + 8),
              right: Math.max(12, insets.right + 12),
            },
          ]}
        >
          <View style={styles.rightMapControls}>
            <TouchableOpacity style={styles.mapControlButton} onPress={handleShowAllTerritories}>
              <Text style={styles.recenterButtonText}>👁</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mapControlButton} onPress={handleRecenter}>
              <Text style={styles.recenterButtonText}>Center</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>


      {/* Bottom Taskbar */}
      <TaskBar
        onLeftPress={() => navigation.navigate('Users')}
        leftButtonText='Friends'
        leftButtonVisible={true}
        onCenterPress={toggleRecording}
        centerButtonText={isRunning ? 'Stop' : 'Start'}
        centerButtonActive={isRunning}
        onRightPress={() => navigation.navigate('Profile')}
        rightButtonVisible={true}
        loading={loading || recordingLoading || sessionsLoading}
      />

    </View>
  );
}


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

  mapControls: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rightMapControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mapControlButton: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  recenterButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
});

