import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polygon, Polyline } from 'react-native-maps';
import { Colors } from '../styles';

/**
 * DashboardMap
 * Renders dashboard map with territory, session tracks and user marker.
 */
export default function DashboardMap({
  mapRef,
  initialRegion,
  canRenderMap,
  mergedTerritoryRings,
  sessionTracks,
  isRunning,
  liveTrack,
  location,
  errorMsg,
}) {
  if (!canRenderMap) {
    return (
      <View style={styles.mapPlaceholder}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.searchText}>GPS wird gesucht...</Text>
        {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
      </View>
    );
  }

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={initialRegion}
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
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
  },
  searchText: {
    marginTop: 10,
  },
  errorText: {
    color: Colors.error,
  },
});
