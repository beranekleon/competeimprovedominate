import api from './api';

/**
 * User Service
 * Handles user data operations (save, retrieve, etc.)
 */
const userService = {
  /**
   * Save user data to cloud
   * @param {string} email - User email
   * @param {string|object} userData - User data to save
   * @returns {Promise<object>} Success message
   */
  saveData: async (email, userData) => {
    return api.post('/save-data', {
      email,
      userData: typeof userData === 'object' ? JSON.stringify(userData) : userData,
    });
  },

  /**
   * Test connection to backend
   * @returns {Promise<object>} Status message from server
   */
  testConnection: async () => {
    return api.get('/status');
  },
};

export default userService;
