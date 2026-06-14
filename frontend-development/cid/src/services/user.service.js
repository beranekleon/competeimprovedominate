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
    * @param {{startedAt: string, stoppedAt: string, durationMs: number, durationSeconds?: number, locations?: Array<object>}} session
   * @returns {Promise<object>} Success message
   */
  saveSession: async (email, session) => {
    return api.post('/save-session', {
      email,
      session,
    });
  },

  /**
   * Fetch all recorded sessions for a user
   * @param {string} email - User email
   * @returns {Promise<{sessions: Array<object>}>}
   */
  getSessions: async (email) => {
    const encodedEmail = encodeURIComponent((email || '').trim());
    return api.get(`/user-sessions?email=${encodedEmail}`);
  },

  /**
   * Fetch the current user's friend list.
   * @param {string} email - User email
   * @returns {Promise<{friends: Array<object>}>}
   */
  getFriends: async (email) => {
    const encodedEmail = encodeURIComponent((email || '').trim());
    return api.get(`/friends?email=${encodedEmail}`);
  },

  /**
   * Fetch a user's territory (area + GeoJSON)
   * @param {string} email - User email
   * @returns {Promise<{mergedTerritory: string, totalArea: number, displayName: string}>}
   */
  getUserTerritory: async (email) => {
    const encodedEmail = encodeURIComponent((email || '').trim());
    return api.get(`/user-territory?email=${encodedEmail}`);
  },

  /**
   * Add a friend by email
   * @param {string} email - User email
   * @param {string} friendEmail - Friend's email
   * @returns {Promise<object>} Success message
   */
  addFriend: async (email, friendEmail) => {
    return api.post('/add-friend', { email, friendEmail });
  },

  /**
   * Test connection to backend
   * @returns {Promise<object>} Status message from server
   */
  testConnection: async () => {
    return api.get('/status');
  },
  
  getLeaderboard: async () => {
    return api.get('/leaderboard');
  },
};

export default userService;
