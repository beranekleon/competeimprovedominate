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
  leftButtonLabel,
  onCenterPress,
  centerButtonText,
  centerButtonActive,
  centerButtonLabel,
  onRightPress,
  rightButtonVisible = true,
  rightButtonLabel = 'Menü öffnen',
  loading = false,
}) {
  return (
    <View style={styles.taskbar}>
      <View style={styles.taskbarContent}>
        <View style={styles.buttonsRow}>
          <View style={styles.buttonSlot}>
            {leftButtonVisible && (
              <TouchableOpacity
                style={styles.leftButton}
                onPress={onLeftPress}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel={leftButtonLabel || leftButtonText || 'Linke Aktion'}
              >
                <Text style={styles.leftButtonText}>{leftButtonText}</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.buttonSlot}>
            <TouchableOpacity
              style={[styles.centerButton, centerButtonActive && styles.centerButtonActive]}
              onPress={onCenterPress}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel={centerButtonLabel || centerButtonText || 'Mittlere Aktion'}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text numberOfLines={1} ellipsizeMode="tail" style={styles.centerButtonText}>
                  {centerButtonText}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.buttonSlot}>
            {rightButtonVisible && (
              <TouchableOpacity
                style={styles.rightButton}
                onPress={onRightPress}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel={rightButtonLabel}
              >
                <Text style={styles.rightButtonText}>☰</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = TaskBarStyles;
