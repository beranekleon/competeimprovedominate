import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage Service
 * Wrapper around AsyncStorage for better type safety and easier testing
 */
const STORAGE_KEYS = {
  IS_LOGGED_IN: '@is_logged_in',
  USER_EMAIL: '@user_email',
  USER_TEXT: '@user_text',
};

const storageService = {
  /**
   * Save login state
   * @param {boolean} isLoggedIn
   */
  setLoginState: async (isLoggedIn) => {
    await AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, String(isLoggedIn));
  },

  /**
   * Get login state
   * @returns {Promise<boolean>}
   */
  getLoginState: async () => {
    const state = await AsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
    return state === 'true';
  },

  /**
   * Save user email
   * @param {string} email
   */
  setUserEmail: async (email) => {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_EMAIL, email);
  },

  /**
   * Get user email
   * @returns {Promise<string|null>}
   */
  getUserEmail: async () => {
    return AsyncStorage.getItem(STORAGE_KEYS.USER_EMAIL);
  },

  /**
   * Save user data/text
   * @param {string} userData
   */
  setUserData: async (userData) => {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_TEXT, userData);
  },

  /**
   * Get user data/text
   * @returns {Promise<string|null>}
   */
  getUserData: async () => {
    return AsyncStorage.getItem(STORAGE_KEYS.USER_TEXT);
  },

  /**
   * Load all auth-related data at once
   * @returns {Promise<object>} { isLoggedIn, userEmail, userData }
   */
  loadAuthState: async () => {
    try {
      const [isLoggedInStr, userEmail, userData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN),
        AsyncStorage.getItem(STORAGE_KEYS.USER_EMAIL),
        AsyncStorage.getItem(STORAGE_KEYS.USER_TEXT),
      ]);

      return {
        isLoggedIn: isLoggedInStr === 'true',
        userEmail: userEmail || '',
        userData: userData || '',
      };
    } catch (error) {
      console.error('Error loading auth state:', error);
      return {
        isLoggedIn: false,
        userEmail: '',
        userData: '',
      };
    }
  },

  /**
   * Clear all auth data (logout)
   */
  clearAuthState: async () => {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.IS_LOGGED_IN,
      STORAGE_KEYS.USER_EMAIL,
      STORAGE_KEYS.USER_TEXT,
    ]);
  },

  /**
   * Clear all storage
   */
  clearAll: async () => {
    await AsyncStorage.clear();
  },
};

export { STORAGE_KEYS };
export default storageService;
