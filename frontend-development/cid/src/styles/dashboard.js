import { StyleSheet } from 'react-native';
import { Colors } from './colors';

export const DashboardStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
  },
});

export const DashboardMapStyles = StyleSheet.create({
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

export const DashboardMapTheme = {
  loadingIndicatorColor: Colors.primary,
  strokeColor: 'rgba(255, 0, 0, 1)',
  fillColor: 'rgba(255, 0, 0, 0.1)',
};

export const MapControlsStyles = StyleSheet.create({
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
