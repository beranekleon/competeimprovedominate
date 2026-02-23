/**
 * Global Common Styles
 * Shared style patterns used across multiple screens
 */

import { StyleSheet } from 'react-native';
import { Colors } from './colors';

export const CommonStyles = StyleSheet.create({
  // ========== CONTAINERS ==========
  
  /**
   * Main screen container - centered, full flex
   */
  screenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors.white,
  },

  /**
   * Scroll view container including padding from top (for status bar, etc)
   */
  scrollContainer: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },

  /**
   * Root container with light background
   */
  containerWithBackground: {
    flex: 1,
    backgroundColor: Colors.lightBackground,
  },

  // ========== TEXT STYLES ==========

  /**
   * Main page title
   */
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  /**
   * Smaller section titles (Dashboard, etc)
   */
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  /**
   * Form/Input labels
   */
  label: {
    alignSelf: 'flex-start',
    marginBottom: 5,
    fontWeight: '600',
  },

  /**
   * Primary button text
   */
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  /**
   * Secondary/link text
   */
  linkText: {
    color: Colors.primary,
    textDecorationLine: 'underline',
    fontSize: 16,
  },

  /**
   * Error message text
   */
  errorText: {
    color: Colors.errorText,
    textAlign: 'center',
    fontWeight: '500',
  },

  /**
   * Success/info message text
   */
  messageText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },

  // ========== INPUT FIELDS ==========

  /**
   * Standard text input field
   */
  input: {
    width: '100%',
    height: 52,
    borderColor: Colors.borderLight,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginVertical: 8,
    backgroundColor: Colors.inputBackground,
    fontSize: 16,
  },

  /**
   * Text input with vertical text alignment (for multiline)
   */
  multilineInput: {
    width: '100%',
    height: 80,
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    textAlignVertical: 'top',
  },

  /**
   * Modal/dialog input field
   */
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.borderLightest,
    borderRadius: 8,
    padding: 10,
    marginVertical: 15,
  },

  // ========== BUTTONS ==========

  /**
   * Primary button (blue)
   */
  buttonPrimary: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 10,
    width: '100%',
    marginVertical: 20,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /**
   * Success/Register button (green)
   */
  buttonSuccess: {
    backgroundColor: Colors.success,
    paddingVertical: 15,
    borderRadius: 10,
    width: '100%',
    marginVertical: 20,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /**
   * Secondary button styles (test, logout, etc)
   */
  buttonSecondary: {
    paddingVertical: 12,
    borderRadius: 10,
    width: '100%',
    marginTop: 20,
    alignItems: 'center',
  },

  /**
   * Button for login/form submission
   */
  loginButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 10,
    width: '100%',
    marginTop: 15,
    alignItems: 'center',
    height: 55,
    justifyContent: 'center',
  },

  /**
   * Main button style (used on home, register screens)
   */
  mainButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '100%',
    marginBottom: 15,
  },

  /**
   * Register button variant (green)
   */
  registerButton: {
    backgroundColor: Colors.success,
  },

  /**
   * Delete/destructive button text
   */
  deleteButtonText: {
    color: Colors.red,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },

  /**
   * Delete account button container
   */
  deleteAccountButton: {
    marginTop: 30,
    padding: 10,
  },

  // ========== ERROR & MESSAGE BOXES ==========

  /**
   * Error notification box
   */
  errorBox: {
    backgroundColor: Colors.errorBackground,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.error,
  },

  /**
   * Status/message box (generic)
   */
  messageBox: {
    width: '100%',
    padding: 15,
    backgroundColor: Colors.white,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLighter,
  },

  // ========== MODE/TAB BUTTONS ==========

  /**
   * Container for mode toggle buttons
   */
  modeButtons: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 25,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },

  /**
   * Individual mode button (inactive state)
   */
  modeButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
  },

  /**
   * Mode button active state
   */
  modeButtonActive: {
    backgroundColor: Colors.primary,
  },

  /**
   * Mode button text (inactive)
   */
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  /**
   * Mode button text (active)
   */
  modeButtonTextActive: {
    color: Colors.white,
  },

  // ========== FORM WRAPPERS ==========

  /**
   * Form section container
   */
  form: {
    width: '100%',
    alignItems: 'center',
  },

  /**
   * Forgot password/link button container
   */
  forgotBtn: {
    marginTop: 20,
    marginBottom: 10,
  },

  // ========== MODALS & OVERLAYS ==========

  /**
   * Semi-transparent backdrop for modals
   */
  modalBackdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /**
   * Modal card/dialog container
   */
  modalCard: {
    width: '80%',
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 15,
  },

  /**
   * Modal title text
   */
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  // ========== MAP & MEDIA ==========

  /**
   * Map view container
   */
  mapContainer: {
    width: '100%',
    height: 250,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.borderLightest,
  },

  /**
   * Map view itself (fill container)
   */
  map: {
    width: '100%',
    height: '100%',
  },

  /**
   * Placeholder shown while map/data loads
   */
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightBackground,
  },

  /**
   * Logo/image sizing
   */
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 30,
  },

  /**
   * Welcome/intro text
   */
  welcomeText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    color: Colors.textPrimary,
  },
});

export default CommonStyles;
