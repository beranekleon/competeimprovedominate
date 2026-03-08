import { StyleSheet } from 'react-native';
import { Colors } from './colors';

export const TaskBarStyles = StyleSheet.create({
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
    backgroundColor: Colors.success,
  },
  centerButtonText: {
    color: Colors.white,
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
