import 'react-native-gesture-handler';
import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { ToastProvider } from './src/context/ToastContext';
import { AppNavigator } from './src/navigation/AppNavigator';

/**
 * App
 * Entry point - wraps entire app with AuthProvider for state management
 */
export default function App() {
    return (
        <ToastProvider>
            <AuthProvider>
                <AppNavigator />
            </AuthProvider>
        </ToastProvider>
    );
}