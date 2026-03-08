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
    minHeight: 56,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButton: {
    width: '92%',
    maxWidth: 180,
    paddingHorizontal: 16,
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
