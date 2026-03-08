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
import union from '@turf/union';
import { featureCollection, polygon as turfPolygon } from '@turf/helpers';
import { useAuth } from '../../hooks/useAuth';
import { useGPS } from '../../hooks/useGPS';
import { Colors } from '../../styles';
import TaskBar from '../../components/TaskBar';
import userService from '../../services/user.service';

const DEFAULT_REGION = {
  latitude: 48.2082,
  longitude: 16.3738,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

const TERRITORY_CLOSURE_DISTANCE_METERS = 10;
const SESSION_SAMPLE_INTERVAL_MS = 2000;

const isValidCoordinate = (point) => (
  point
  && typeof point.latitude === 'number'
  && typeof point.longitude === 'number'
);

const toCoordinateTrack = (locations) => {
  const seen = new Set();

  return (Array.isArray(locations) ? locations : [])
    .filter(isValidCoordinate)
    .filter((point) => {
      const key = `${point.latitude.toFixed(6)}:${point.longitude.toFixed(6)}`;
      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .map((point) => ({
      latitude: point.latitude,
      longitude: point.longitude,
    }));
};

const toRadians = (degrees) => (degrees * Math.PI) / 180;

const distanceMeters = (a, b) => {
  const earthRadiusMeters = 6371000;
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const x = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

const isClosedTrack = (coordinates, thresholdMeters = TERRITORY_CLOSURE_DISTANCE_METERS) => {
  if (!Array.isArray(coordinates) || coordinates.length < 3) {
    return false;
  }

  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];
  return distanceMeters(first, last) <= thresholdMeters;
};

const toPolygonFeature = (coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length < 3) {
    return null;
  }

  const ring = coordinates.map((point) => [point.longitude, point.latitude]);
  const first = ring[0];
  const last = ring[ring.length - 1];
  const isClosed = first[0] === last[0] && first[1] === last[1];

  if (!isClosed) {
    ring.push([first[0], first[1]]);
  }

  return turfPolygon([ring]);
};

const mergePolygonFeatures = (features) => {
  if (!features.length) {
    return null;
  }

  let merged = features[0];
  for (let i = 1; i < features.length; i += 1) {
    const next = features[i];
    let unionResult = null;

    try {
      unionResult = union(featureCollection([merged, next]));
    } catch (error) {
      unionResult = union(merged, next);
    }

    if (unionResult) {
      merged = unionResult;
    }
  }

  return merged;
};

const toMapPolygonRings = (feature) => {
  if (!feature || !feature.geometry) {
    return [];
  }

  const { type, coordinates } = feature.geometry;

  if (type === 'Polygon') {
    return [coordinates[0].map(([longitude, latitude]) => ({ latitude, longitude }))];
  }

  if (type === 'MultiPolygon') {
    return coordinates.map((polygonRing) => (
      polygonRing[0].map(([longitude, latitude]) => ({ latitude, longitude }))
    ));
  }

  return [];
};

const normalizeRing = (ring) => {
  if (!Array.isArray(ring) || ring.length === 0) {
    return [];
  }

  const normalized = [...ring];
  if (normalized.length < 2) {
    return normalized;
  }

  const first = normalized[0];
  const last = normalized[normalized.length - 1];
  if (first.latitude === last.latitude && first.longitude === last.longitude) {
    normalized.pop();
  }

  return normalized;
};

const pathLengthMeters = (points) => {
  if (!Array.isArray(points) || points.length < 2) {
    return 0;
  }

  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += distanceMeters(points[i - 1], points[i]);
  }

  return total;
};

const findNearestVertexIndex = (ring, point, thresholdMeters) => {
  if (!Array.isArray(ring) || ring.length === 0 || !isValidCoordinate(point)) {
    return null;
  }

  let bestIndex = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let i = 0; i < ring.length; i += 1) {
    const distance = distanceMeters(ring[i], point);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = i;
    }
  }

  if (bestDistance > thresholdMeters) {
    return null;
  }

  return bestIndex;
};

const buildRingPath = (ring, startIndex, endIndex, forward) => {
  if (!ring.length) {
    return [];
  }

  const result = [ring[startIndex]];
  let index = startIndex;

  while (index !== endIndex) {
    index = forward ? (index + 1) % ring.length : (index - 1 + ring.length) % ring.length;
    result.push(ring[index]);

    if (result.length > ring.length + 1) {
      break;
    }
  }

  return result;
};

const dedupeSequentialPoints = (points) => (
  points.filter((point, index) => {
    if (index === 0) {
      return true;
    }

    const prev = points[index - 1];
    return point.latitude !== prev.latitude || point.longitude !== prev.longitude;
  })
);

const buildExpansionFeatureFromTrack = (track, territoryRings, thresholdMeters) => {
  if (!Array.isArray(track) || track.length < 3 || !Array.isArray(territoryRings) || !territoryRings.length) {
    return null;
  }

  const trackStart = track[0];
  const trackEnd = track[track.length - 1];

  for (let i = 0; i < territoryRings.length; i += 1) {
    const ring = normalizeRing(territoryRings[i]);
    if (ring.length < 3) {
      continue;
    }

    const startIdx = findNearestVertexIndex(ring, trackStart, thresholdMeters);
    const endIdx = findNearestVertexIndex(ring, trackEnd, thresholdMeters);

    if (startIdx === null || endIdx === null) {
      continue;
    }

    const forwardBoundary = buildRingPath(ring, endIdx, startIdx, true);
    const backwardBoundary = buildRingPath(ring, endIdx, startIdx, false);
    const chosenBoundary = pathLengthMeters(forwardBoundary) <= pathLengthMeters(backwardBoundary)
      ? forwardBoundary
      : backwardBoundary;

    const candidate = dedupeSequentialPoints([...track, ...chosenBoundary]);
    if (candidate.length < 3) {
      continue;
    }

    const polygonFeature = toPolygonFeature(candidate);
    if (polygonFeature) {
      return polygonFeature;
    }
  }

  return null;
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

      {/* USER LIST BUTTON */}
      <TouchableOpacity
        style={styles.userListButton}
        onPress={() => navigation.navigate('Users')}
      >
        <Text style={styles.userListButtonText}>Users</Text>
      </TouchableOpacity>


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
              left: Math.max(12, insets.left + 12),
            },
          ]}
        >
          <TouchableOpacity style={styles.mapControlButton} onPress={handleShowAllTerritories}>
            <Text style={styles.recenterButtonText}>👁</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.mapControlButton} onPress={handleRecenter}>
            <Text style={styles.recenterButtonText}>Center</Text>
          </TouchableOpacity>
        </View>
      </View>


      {/* Bottom Taskbar */}
      <TaskBar
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

  userListButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    zIndex: 10
  },

  userListButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  },

  mapControls: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

