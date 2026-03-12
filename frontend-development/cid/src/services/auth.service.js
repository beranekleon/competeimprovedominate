import api from './api';

/**
 * Authentication Service
 * Handles all auth-related API calls: login, register, password reset, account deletion
 */
const authService = {
  /**
   * Login with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<object>} User data and token
   */
  login: async (email, password) => {
    return api.post('/login', { email, password });
  },

  /**
   * Register new user account
   * @param {string} email - User email
   * @param {string} password - User password (min 8 chars)
   * @param {string|null} phone - Optional phone number
   * @returns {Promise<object>} Success message
   */
  register: async (email, password, phone = null) => {
    return api.post('/register', {
      email: email.trim(),
      password,
      phone: phone?.trim() || null,
    });
  },

  /**
   * Request password reset code
   * @param {string} email - User email
   * @returns {Promise<object>} Confirmation message
   */
  requestPasswordReset: async (email) => {
    return api.post('/request-password-reset', { email: email.trim() });
  },

  /**
   * Reset password with verification code
   * @param {string} email - User email
   * @param {string} code - 6-digit verification code
   * @param {string} newPassword - New password (min 8 chars)
   * @returns {Promise<object>} Success message
   */
  resetPassword: async (email, code, newPassword) => {
    return api.post('/reset-password', {
      email: email.trim(),
      code: code.trim(),
      newPassword,
    });
  },

  /**
   * Delete user account
   * @param {string} email - User email
   * @param {string} password - User password for confirmation
   * @returns {Promise<object>} Success message
   */
  deleteAccount: async (email, password) => {
    return api.post('/delete-user', { email, password });
  },

  /**
   * Request phone verification code
   * @param {string} phone - Phone number
   * @returns {Promise<object>} Confirmation message
   */
  requestPhoneCode: async (phone) => {
    return api.post('/request-phone-code', { phone: phone.trim() });
  },

  /**
   * Confirm phone login with verification code
   * @param {string} phone - Phone number
   * @param {string} code - 6-digit verification code
   * @returns {Promise<object>} User data and token
   */
  confirmPhoneCode: async (phone, code) => {
    return api.post('/verify-phone-code', {
      phone: phone.trim(),
      code: code.trim(),
    });
  },
};

export default authService;
