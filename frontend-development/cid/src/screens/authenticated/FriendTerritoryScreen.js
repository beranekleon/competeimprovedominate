import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import userService from '../../services/user.service';
import DashboardMap from '../../components/DashboardMap';
import { toMapPolygonRings } from '../../utils/territory.utils';
import { useToast } from '../../context/ToastContext';

/**
 * FriendTerritoryScreen
 * Viewing mode for a friend's territory.
 */
export default function FriendTerritoryScreen({ route, navigation }) {
  const { friendEmail, friendName } = route.params;
  const { showToast } = useToast();

  const [territoryData, setTerritoryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTerritory = async () => {
      try {
        console.log("FriendTerritoryScreen: Fetching for", friendEmail);
        const data = await userService.getUserTerritory(friendEmail);
        console.log("FriendTerritoryScreen: Received data", !!data?.mergedTerritory);
        setTerritoryData(data);
      } catch (error) {
        console.error("FriendTerritoryScreen: Fetch error", error);
        showToast({ message: 'Gebiet konnte nicht geladen werden.', type: 'error' });
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchTerritory();
  }, [friendEmail, navigation, showToast]);

  const mergedTerritoryRings = useMemo(() => {
    if (!territoryData?.mergedTerritory) return [];
    
    try {
      // Backend returns stringified GeoJSON
      const geojson = typeof territoryData.mergedTerritory === 'string' 
        ? JSON.parse(territoryData.mergedTerritory) 
        : territoryData.mergedTerritory;
      
      return toMapPolygonRings({ geometry: geojson });
    } catch (e) {
      console.error("Error parsing territory GeoJSON:", e);
      return [];
    }
  }, [territoryData]);

  // Calculate a reasonable initial region based on the first ring if available
  const initialRegion = useMemo(() => {
    if (mergedTerritoryRings.length > 0 && mergedTerritoryRings[0].length > 0) {
      const firstPoint = mergedTerritoryRings[0][0];
      return {
        latitude: firstPoint.latitude,
        longitude: firstPoint.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }
    // Fallback to a default (e.g. Vienna)
    return {
      latitude: 48.2082,
      longitude: 16.3738,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
  }, [mergedTerritoryRings]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#222" />
        <Text style={styles.loadingText}>Gebiet wird geladen...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Zurück"
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {friendName || territoryData?.displayName || 'Freund'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {Math.round(territoryData?.totalArea || 0)} m² markiert
          </Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.mapWrapper}>
        <DashboardMap
          initialRegion={initialRegion}
          canRenderMap={true}
          mergedTerritoryRings={mergedTerritoryRings}
          sessionTracks={[]}
          isRunning={false}
          liveTrack={[]}
          location={null}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFD600', // Match Leaderboard yellow
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#222',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFD600',
  },
  backButton: {
    width: 40,
  },
  backText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f1f1f',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f1f1f',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  headerSpacer: {
    width: 40,
  },
  mapWrapper: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
});
