import React, { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/auth.service';
import userService from '../services/user.service';
import storageService from '../services/storage.service';

/**
 * AuthContext
 * Manages global authentication state and provides auth methods
 */
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userData, setUserData] = useState('');
  const [isAppReady, setIsAppReady] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  // Phone login state
  const [phoneAwaitingCode, setPhoneAwaitingCode] = useState(false);

  /**
   * Load persisted auth state on app start
   */
  useEffect(() => {
    const restoreAuthState = async () => {
      try {
        const { isLoggedIn: saved, userEmail: savedEmail, userData: savedData } = 
          await storageService.loadAuthState();
        
        if (saved && savedEmail) {
          setIsLoggedIn(true);
          setUserEmail(savedEmail);
          setUserData(savedData);
        }
      } catch (error) {
        console.error('Error restoring auth state:', error);
      } finally {
        setIsAppReady(true);
      }
    };

    restoreAuthState();
  }, []);

  /**
   * Login handler
   */
  const handleLogin = useCallback(async (email, password) => {
    setLoading(true);
    setLoginError(null);

    try {
      const response = await authService.login(email, password);
      
      // Save to storage
      await storageService.setLoginState(true);
      await storageService.setUserEmail(email);
      const userDataStr = typeof response.user?.userData === 'object' 
        ? JSON.stringify(response.user.userData) 
        : response.user?.userData || '';
      await storageService.setUserData(userDataStr);

      // Update state
      setIsLoggedIn(true);
      setUserEmail(email);
      setUserData(userDataStr);
    } catch (error) {
      setLoginError(error.message || 'Login fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Register handler
   */
  const handleRegister = useCallback(async (email, password, phone = null) => {
    setLoading(true);

    try {
      await authService.register(email, password, phone);
      // Registration successful - user needs to login
      return true;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Request phone verification code
   */
  const handleRequestPhoneCode = useCallback(async (phone) => {
    setLoading(true);
    setLoginError(null);

    try {
      const response = await authService.requestPhoneCode(phone);
      setPhoneAwaitingCode(true);
      return response;
    } catch (error) {
      setLoginError(error.message || 'Fehler beim Anfordern des Codes');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Confirm phone code and login
   */
  const handleConfirmPhoneCode = useCallback(async (phone, code) => {
    setLoading(true);
    setLoginError(null);

    try {
      const response = await authService.confirmPhoneCode(phone, code);

      // Save to storage
      await storageService.setLoginState(true);
      await storageService.setUserEmail(phone);
      const userDataStr = typeof response.user?.userData === 'object'
        ? JSON.stringify(response.user.userData)
        : response.user?.userData || '';
      await storageService.setUserData(userDataStr);

      // Update state
      setIsLoggedIn(true);
      setUserEmail(phone);
      setUserData(userDataStr);
      setPhoneAwaitingCode(false);
    } catch (error) {
      setLoginError(error.message || 'Fehler beim Bestätigen des Codes');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Password reset request handler
   */
  const handleRequestPasswordReset = useCallback(async (email) => {
    setLoading(true);

    try {
      return await authService.requestPasswordReset(email);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Password reset handler
   */
  const handleResetPassword = useCallback(async (email, code, newPassword) => {
    setLoading(true);

    try {
      return await authService.resetPassword(email, code, newPassword);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout handler - sync data to cloud first
   */
  const handleLogout = useCallback(async () => {
    setLoading(true);

    try {
      // Save user data to cloud before logout
      if (userEmail && userData) {
        await userService.saveData(userEmail, userData);
      }
    } catch (error) {
      console.error('Sync error during logout:', error);
    } finally {
      // Clear state and storage
      await storageService.clearAuthState();
      setIsLoggedIn(false);
      setUserEmail('');
      setUserData('');
      setLoading(false);
    }
  }, [userEmail, userData]);

  /**
   * Delete account handler
   */
  const handleDeleteAccount = useCallback(async (password) => {
    setLoading(true);

    try {
      await authService.deleteAccount(userEmail, password);

      // Clear state and storage
      await storageService.clearAuthState();
      setIsLoggedIn(false);
      setUserEmail('');
      setUserData('');
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  /**
   * Save user data to cloud
   */
  const handleSaveData = useCallback(async () => {
    setLoading(true);

    try {
      await userService.saveData(userEmail, userData);
      return true;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [userEmail, userData]);

  /**
   * Test backend connection
   */
  const handleTestConnection = useCallback(async () => {
    setLoading(true);

    try {
      const response = await userService.testConnection();
      return response.message || response.nachricht || 'Connected';
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    // State
    isLoggedIn,
    userEmail,
    userData,
    isAppReady,
    loading,
    loginError,
    phoneAwaitingCode,

    // Setters
    setUserData,
    setLoginError,
    setPhoneAwaitingCode,

    // Auth actions
    login: handleLogin,
    register: handleRegister,
    requestPhoneCode: handleRequestPhoneCode,
    confirmPhoneCode: handleConfirmPhoneCode,
    requestPasswordReset: handleRequestPasswordReset,
    resetPassword: handleResetPassword,
    logout: handleLogout,
    deleteAccount: handleDeleteAccount,
    saveData: handleSaveData,
    testConnection: handleTestConnection,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
