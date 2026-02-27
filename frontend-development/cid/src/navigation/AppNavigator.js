import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../hooks/useAuth';

// Screens
import HomeScreen from '../screens/unauthenticated/HomeScreen';
import LoginScreen from '../screens/unauthenticated/LoginScreen';
import RegisterScreen from '../screens/unauthenticated/RegisterScreen';
import ResetPasswordScreen from '../screens/unauthenticated/ResetPasswordScreen';
import DashboardScreen from '../screens/authenticated/DashboardScreen';
import ProfileScreen from '../screens/authenticated/ProfileScreen';

const Stack = createStackNavigator();

/**
 * AuthenticatedNavigator
 * Stack navigator for authenticated user flow
 */
function AuthenticatedNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

/**
 * AppNavigator
 * Handles all routing - authenticated vs unauthenticated flows
 */
export function AppNavigator() {
  const { isLoggedIn, isAppReady } = useAuth();

  // Don't render until auth state is restored
  if (!isAppReady) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          // Authenticated Flow
          <Stack.Screen name="AuthFlow" component={AuthenticatedNavigator} />
        ) : (
          // Unauthenticated Flow
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
