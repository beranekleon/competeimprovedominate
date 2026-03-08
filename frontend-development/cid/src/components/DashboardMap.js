import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import MapView, { Marker, Polygon, Polyline } from 'react-native-maps';
import { DashboardMapStyles, DashboardMapTheme } from '../styles';

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
      <View style={DashboardMapStyles.mapPlaceholder}>
        <ActivityIndicator size="large" color={DashboardMapTheme.loadingIndicatorColor} />
        <Text style={DashboardMapStyles.searchText}>GPS wird gesucht...</Text>
        {errorMsg && <Text style={DashboardMapStyles.errorText}>{errorMsg}</Text>}
      </View>
    );
  }

  return (
    <MapView
      ref={mapRef}
      style={DashboardMapStyles.map}
      initialRegion={initialRegion}
      showsUserLocation={true}
    >
      {mergedTerritoryRings.map((ring, index) => (
        <Polygon
          key={`territory-${index}`}
          coordinates={ring}
          strokeColor={DashboardMapTheme.strokeColor}
          fillColor={DashboardMapTheme.fillColor}
          strokeWidth={2}
        />
      ))}

      {sessionTracks.map((track, index) => (
        <Polyline
          key={`session-track-${index}`}
          coordinates={track}
          strokeColor={DashboardMapTheme.strokeColor}
          strokeWidth={3}
        />
      ))}

      {isRunning && liveTrack.length >= 2 && (
        <Polyline
          coordinates={liveTrack}
          strokeColor={DashboardMapTheme.strokeColor}
          strokeWidth={4}
        />
      )}

      {location && <Marker coordinate={location} title="Deine Position" />}
    </MapView>
  );
}
