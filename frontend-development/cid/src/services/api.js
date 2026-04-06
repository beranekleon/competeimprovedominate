import { BACKEND_URL } from '@env';
console.log('ENV BACKEND_URL:', BACKEND_URL);
const MANUAL_BACKEND_URL = 'http://192.168.1.54:8080';
// Allow overriding the hardcoded backend URL via env (useful for local dev)
const EFFECTIVE_BACKEND_URL = BACKEND_URL || MANUAL_BACKEND_URL;

/**
 * Base API client for all HTTP requests
 * Handles common fetch logic, error handling, and response parsing
 */
class ApiClient {
  constructor(baseURL = EFFECTIVE_BACKEND_URL) {
    // Log what backend URL is actually being used (helps debug Expo + .env issues)
    console.log('API Base URL:', baseURL);
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
      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        data = null;
      }

      if (!response.ok) {
        const errorMsg =
          data?.fehler ||
          data?.error ||
          `HTTP ${response.status} ${response.statusText}`;

        // Prefer structured message, but include raw body for easier debugging
        throw new Error(`${errorMsg}${data ? '' : `: ${text}`}`);
      }

      if (!data) {
        throw new Error(`Ungültige JSON-Antwort vom Server erhalten: ${text}`);
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









































