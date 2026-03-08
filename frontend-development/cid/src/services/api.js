import { BACKEND_URL } from '@env';
const MANUAL_BACKEND_URL = 'https://cid-testing-228623557792.europe-west3.run.app';
const EFFECTIVE_BACKEND_URL = MANUAL_BACKEND_URL || BACKEND_URL;

/**
 * Base API client for all HTTP requests
 * Handles common fetch logic, error handling, and response parsing
 */
class ApiClient {
  constructor(baseURL = EFFECTIVE_BACKEND_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Generic request method
   * @param {string} endpoint - API endpoint (e.g., '/login', '/status')
   * @param {string} method - HTTP method (GET, POST, etc.)
   * @param {object} body - Request body for POST/PUT requests
   * @returns {Promise<object>} Parsed JSON response
   * @throws {Error} With message from server or network error
   */
  async request(endpoint, method = 'GET', body = null) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      method,
      headers: this.defaultHeaders,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.fehler || data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Convenience methods
   */
  get(endpoint) {
    return this.request(endpoint, 'GET');
  }

  post(endpoint, body) {
    return this.request(endpoint, 'POST', body);
  }

  put(endpoint, body) {
    return this.request(endpoint, 'PUT', body);
  }

  delete(endpoint, body) {
    return this.request(endpoint, 'DELETE', body);
  }
}

// Export singleton instance
export default new ApiClient();








































