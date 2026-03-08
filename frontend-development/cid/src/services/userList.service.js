import api from './api';

/**
 * User List Service
 * Handles retrieval of public/visible user list data.
 */
const userListService = {
  /**
   * Fetch all users.
   * Supports different backend response shapes.
   * @returns {Promise<Array<object>>}
   */
  getUsers: async () => {
    const response = await api.get('/users');

    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.users)) {
      return response.users;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    return [];
  },
};

export default userListService;
