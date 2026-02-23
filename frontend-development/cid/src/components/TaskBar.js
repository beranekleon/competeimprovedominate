import React from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../styles';

/**
 * TaskBar
 * Reusable bottom taskbar component with customizable center button
 */
export default function TaskBar({
  onCenterPress,
  centerButtonText,
  centerButtonActive,
  onRightPress,
  rightButtonVisible = true,
  loading = false,
}) {
  return (
    <View style={styles.taskbar}>
      <View style={styles.taskbarContent}>
        {/* Center Button */}
        <TouchableOpacity
          style={[styles.centerButton, centerButtonActive && styles.centerButtonActive]}
          onPress={onCenterPress}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.centerButtonText}>{centerButtonText}</Text>
          )}
        </TouchableOpacity>

        {/* Right Button */}
        {rightButtonVisible && (
          <TouchableOpacity
            style={styles.rightButton}
            onPress={onRightPress}
            disabled={loading}
          >
            <Text style={styles.rightButtonText}>☰</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  taskbar: {
    backgroundColor: Colors.neutral,
    paddingBottom: 20,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  taskbarContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  centerButton: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    backgroundColor: Colors.primary,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButtonActive: {
    backgroundColor: Colors.success || '#4CAF50',
  },
  centerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rightButton: {
    position: 'absolute',
    right: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightButtonText: {
    fontSize: 28,
    color: Colors.primary,
  },
});
