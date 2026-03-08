import React from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { TaskBarStyles } from '../styles';

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

const styles = TaskBarStyles;
