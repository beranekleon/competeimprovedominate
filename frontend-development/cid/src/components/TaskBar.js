import React from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../styles';

/**
 * TaskBar
 * Reusable bottom taskbar component with customizable center button
 */
export default function TaskBar({
  onLeftPress,
  leftButtonText,
  leftButtonVisible = false,
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
        <View style={styles.sideButtonsRow}>
          <View style={styles.sideSlotLeft}>
            {leftButtonVisible && (
              <TouchableOpacity
                style={styles.leftButton}
                onPress={onLeftPress}
                disabled={loading}
              >
                <Text style={styles.leftButtonText}>{leftButtonText}</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.sideSlotRight}>
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

        <View pointerEvents="box-none" style={styles.centerOverlay}>
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
        </View>
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
    position: 'relative',
    justifyContent: 'center',
    minHeight: 56,
  },
  sideButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideSlotLeft: {
    flex: 1,
    alignItems: 'flex-start',
    paddingLeft: 16,
  },
  sideSlotRight: {
    flex: 1,
    alignItems: 'flex-end',
    paddingRight: 16,
  },
  centerOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightButtonText: {
    fontSize: 28,
    color: Colors.primary,
  },
  leftButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
});
