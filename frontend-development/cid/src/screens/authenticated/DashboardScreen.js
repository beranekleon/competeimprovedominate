import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { Colors } from '../../styles';
import TaskBar from '../../components/TaskBar';
import userService from '../../services/user.service';
import {
  buildExpansionFeatureFromTrack,
  isClosedTrack,
  isValidCoordinate,
  mergePolygonFeatures,
  toCoordinateTrack,
  toMapPolygonRings,
  toPolygonFeature,
} from '../../utils/territory.utils';

const DEFAULT_REGION = {
  latitude: 48.2082,
  longitude: 16.3738,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

const TERRITORY_CLOSURE_DISTANCE_METERS = 10;
const SESSION_SAMPLE_INTERVAL_MS = 2000;

/**
 * DashboardScreen
 * Main user dashboard with map and taskbar
 */
export default function DashboardScreen({ navigation }) {

  const { loading, userEmail } = useAuth();
  // const { location, errorMsg, region, isLoading: gpsLoading } = useGPS();
  const { location, errorMsg, region } = useGPS();
  const insets = useSafeAreaInsets();
  const [isRunning, setIsRunning] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [recordingLoading, setRecordingLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [liveTrack, setLiveTrack] = useState([]);
  const mapRef = useRef(null);
  const gpsTrackRef = useRef([]);
  const latestLocationRef = useRef(null);

  const fetchSessions = useCallback(async () => {
    if (!userEmail) {
      setSessions([]);
      return;
    }

    try {
      setSessionsLoading(true);
      const response = await userService.getSessions(userEmail);
      setSessions(Array.isArray(response.sessions) ? response.sessions : []);
    } catch (error) {
      Alert.alert('Fehler', error.message || 'Sessions konnten nicht geladen werden.');
    } finally {
      setSessionsLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    latestLocationRef.current = location || null;
  }, [location]);

  useEffect(() => {

    if (!isRunning) return;

    const pushCurrentLocation = () => {

      const current = latestLocationRef.current;

      if (!current ||
          typeof current.latitude !== 'number' ||
          typeof current.longitude !== 'number') {
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
      setLiveTrack([...gpsTrackRef.current]);
    };

    pushCurrentLocation();
    const intervalId = setInterval(pushCurrentLocation, SESSION_SAMPLE_INTERVAL_MS);

    return () => clearInterval(intervalId);

  }, [isRunning]);

  const sessionTracks = useMemo(
    () => sessions.map((session) => toCoordinateTrack(session.locations)).filter((track) => track.length >= 2),
    [sessions]
  );

  const mergedTerritoryFeature = useMemo(() => {
    const closedTrackFeatures = sessionTracks
      .filter((track) => isClosedTrack(track))
      .map((track) => toPolygonFeature(track))
      .filter(Boolean);

    let merged = mergePolygonFeatures(closedTrackFeatures);

    if (!merged) {
      return null;
    }

    const openTracks = sessionTracks.filter((track) => !isClosedTrack(track) && track.length >= 3);

    for (let i = 0; i < openTracks.length; i += 1) {
      const territoryRings = toMapPolygonRings(merged);
      const expansionFeature = buildExpansionFeatureFromTrack(
        openTracks[i],
        territoryRings,
        TERRITORY_CLOSURE_DISTANCE_METERS
      );

      if (!expansionFeature) {
        continue;
      }

      const expanded = mergePolygonFeatures([merged, expansionFeature]);
      if (expanded) {
        merged = expanded;
      }
    }

    return merged;
  }, [sessionTracks]);

  const mergedTerritoryRings = useMemo(
    () => toMapPolygonRings(mergedTerritoryFeature),
    [mergedTerritoryFeature]
  );

  const territoryCoordinates = useMemo(() => (
    sessionTracks.flat().map((point) => ({
      latitude: point.latitude,
      longitude: point.longitude,
    }))
  ), [sessionTracks]);

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

  const handleStartStop = async () => {

    if (!isRunning) {
      gpsTrackRef.current = [];
      setLiveTrack([]);
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
      setLiveTrack([]);
      await fetchSessions();
    } catch (error) {

      Alert.alert(
        'Fehler',
        error.message || 'Session konnte nicht gespeichert werden.'
      );

    } finally {
      setRecordingLoading(false);
    }
  };


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
        onCenterPress={handleStartStop}
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

