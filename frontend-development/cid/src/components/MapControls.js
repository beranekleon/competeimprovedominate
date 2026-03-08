import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../styles';

/**
 * MapControls
 * Reusable top-right actions for map interactions.
 */
export default function MapControls({ top, right, onShowAllPress, onRecenterPress }) {
  return (
    <View
      style={[
        styles.mapControls,
        {
          top,
          right,
        },
      ]}
    >
      <View style={styles.rightMapControls}>
        <TouchableOpacity style={styles.mapControlButton} onPress={onShowAllPress}>
          <Text style={styles.recenterButtonText}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.mapControlButton} onPress={onRecenterPress}>
          <Text style={styles.recenterButtonText}>Center</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
