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
   * Save a recording session (start/stop and duration)
   * @param {string} email - User email
   * @param {{startedAt: string, stoppedAt: string, durationMs: number, durationSeconds?: number}} session
   * @returns {Promise<object>} Success message
   */
  saveSession: async (email, session) => {
    return api.post('/save-session', {
      email,
      session,
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
