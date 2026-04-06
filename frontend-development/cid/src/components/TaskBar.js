import React, { useState } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TaskBarStyles } from '../styles';

/**
 * TaskBar
 * Reusable bottom taskbar component with integrated burger menu
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
  onRightPress, // Optional override
  rightButtonVisible = true,
  rightButtonLabel = 'Menü öffnen',
  loading = false,
}) {
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);

  const handleRightPress = () => {
    if (onRightPress) {
      onRightPress();
    } else {
      setMenuVisible(!menuVisible);
    }
  };

  const navigateTo = (screen) => {
    setMenuVisible(false);
    navigation.navigate(screen);
  };

  return (
    <View style={styles.taskbar}>
      {/* Integrated Burger Menu */}
      {menuVisible && (
        <View
          style={{
            position: 'absolute',
            right: 20,
            bottom: 80, // Positioned above the taskbar
            backgroundColor: '#ffffff',
            borderRadius: 14,
            width: 170,
            elevation: 8,
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 3 },
            paddingVertical: 8,
            zIndex: 10000,
          }}
        >
          <TouchableOpacity
            style={{ paddingVertical: 14, paddingHorizontal: 16 }}
            onPress={() => navigateTo('Profile')}
          >
            <Text style={{ fontSize: 16, color: '#222', fontWeight: '600' }}>Profil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ paddingVertical: 14, paddingHorizontal: 16 }}
            onPress={() => navigateTo('Leaderboard')}
          >
            <Text style={{ fontSize: 16, color: '#222', fontWeight: '600' }}>Leaderboard</Text>
          </TouchableOpacity>
        </View>
      )}

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
                onPress={handleRightPress}
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
