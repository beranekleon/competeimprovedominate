import { useEffect, useState, useCallback } from 'react';
import * as Location from 'expo-location';

/**
 * Custom hook for GPS tracking
 * Handles location permissions and continuous position updates
 * 
 * @returns {object} { location, errorMsg, region, isLoading }
 */
export function useGPS() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [region, setRegion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateLocationState = useCallback((newLoc) => {
    const { latitude, longitude } = newLoc.coords;
    setLocation(newLoc.coords);
    setRegion({
      latitude,
      longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let locationSubscription = null;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          setErrorMsg('GPS Berechtigung verweigert.');
          setIsLoading(false);
          return;
        }

        // Get last known location
        const initialLocation = await Location.getLastKnownPositionAsync({});
        if (initialLocation) {
          updateLocationState(initialLocation);
        }

        // Start watching position
        locationSubscription = await Location.watchPositionAsync(
          { 
            accuracy: Location.Accuracy.High, 
            distanceInterval: 5 
          },
          (newLoc) => updateLocationState(newLoc)
        );
      } catch (err) {
        setErrorMsg('GPS-Fehler: ' + err.message);
        setIsLoading(false);
      }
    })();

    return () => locationSubscription?.remove();
  }, [updateLocationState]);

  return { location, errorMsg, region, isLoading };
}
