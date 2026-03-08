import { useCallback, useEffect, useState } from 'react';
import userService from '../services/user.service';

/**
 * useUserSessions
 * Fetches and stores recording sessions for the current user.
 */
export function useUserSessions({ userEmail, onFetchError, autoFetch = true }) {
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  const fetchSessions = useCallback(async () => {
    if (!userEmail) {
      setSessions([]);
      return;
    }

    try {
      setSessionsLoading(true);
      const response = await userService.getSessions(userEmail);
      setSessions(Array.isArray(response.sessions) ? response.sessions : []);
    } catch (error) {
      if (typeof onFetchError === 'function') {
        onFetchError(error);
      }
    } finally {
      setSessionsLoading(false);
    }
  }, [onFetchError, userEmail]);

  useEffect(() => {
    if (!autoFetch) {
      return;
    }

    fetchSessions();
  }, [autoFetch, fetchSessions]);

  return {
    sessions,
    sessionsLoading,
    fetchSessions,
  };
}
