import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { MapControlsStyles } from '../styles';

/**
 * MapControls
 * Reusable top-right actions for map interactions.
 */
export default function MapControls({ top, right, onShowAllPress, onRecenterPress }) {
  return (
    <View
      style={[
        MapControlsStyles.mapControls,
        {
          top,
          right,
        },
      ]}
    >
      <View style={MapControlsStyles.rightMapControls}>
        <TouchableOpacity style={MapControlsStyles.mapControlButton} onPress={onShowAllPress}>
          <Text style={MapControlsStyles.recenterButtonText}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity style={MapControlsStyles.mapControlButton} onPress={onRecenterPress}>
          <Text style={MapControlsStyles.recenterButtonText}>Center</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
