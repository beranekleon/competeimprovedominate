import React, { useCallback, useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { useGPS } from '../../hooks/useGPS';
import { useSessionRecorder } from '../../hooks/useSessionRecorder';
import { useTerritoryGeometry } from '../../hooks/useTerritoryGeometry';
import { useUserSessions } from '../../hooks/useUserSessions';
import { DashboardStyles } from '../../styles';
import DashboardMap from '../../components/DashboardMap';
import MapControls from '../../components/MapControls';
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
  const { showToast } = useToast();
  const { location, errorMsg, region } = useGPS();
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);

  const [menuVisible, setMenuVisible] = useState(false);

  const handleSessionsFetchError = useCallback((error) => {
    showToast({ message: error?.message || 'Sessions konnten nicht geladen werden.', type: 'error' });
  }, [showToast]);

  const {
    sessions,
    sessionsLoading,
    fetchSessions,
  } = useUserSessions({
    userEmail,
    onFetchError: handleSessionsFetchError,
  });

  const handleSessionSaveError = useCallback((error) => {
    showToast({ message: error?.message || 'Session konnte nicht gespeichert werden.', type: 'error' });
  }, [showToast]);

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
    <View style={DashboardStyles.container}>
      {/* Full Screen Map */}
      <View style={DashboardStyles.mapContainer}>
        <DashboardMap
          mapRef={mapRef}
          initialRegion={region || DEFAULT_REGION}
          canRenderMap={Boolean(region || sessions.length > 0)}
          mergedTerritoryRings={mergedTerritoryRings}
          sessionTracks={sessionTracks}
          isRunning={isRunning}
          liveTrack={liveTrack}
          location={location}
          errorMsg={errorMsg}
        />

        <MapControls
          top={Math.max(12, insets.top + 8)}
          right={Math.max(12, insets.right + 12)}
          onShowAllPress={handleShowAllTerritories}
          onRecenterPress={handleRecenter}
        />
      </View>

      {menuVisible && (
        <View
          style={{
            position: 'absolute',
            right: 20,
            bottom: 110,
            backgroundColor: '#ffffff',
            borderRadius: 14,
            width: 170,
            elevation: 8,
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 3 },
            paddingVertical: 8,
            zIndex: 9999,
          }}
        >
          <TouchableOpacity
            style={{
              paddingVertical: 14,
              paddingHorizontal: 16,
            }}
            onPress={() => {
              setMenuVisible(false);
              navigation.navigate('Profile');
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: '#222',
                fontWeight: '600',
              }}
            >
              Profil
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              paddingVertical: 14,
              paddingHorizontal: 16,
            }}
            onPress={() => {
              setMenuVisible(false);
              navigation.navigate('Leaderboard');
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: '#222',
                fontWeight: '600',
              }}
            >
              Leaderboard
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Taskbar */}
      <TaskBar
        onLeftPress={() => navigation.navigate('Users')}
        leftButtonText="Friends"
        leftButtonVisible={true}
        onCenterPress={toggleRecording}
        centerButtonText={isRunning ? 'Stop' : 'Start'}
        centerButtonActive={isRunning}
        onRightPress={() => setMenuVisible(!menuVisible)}
        rightButtonVisible={true}
        loading={loading || recordingLoading || sessionsLoading}
      />
    </View>
  );
}