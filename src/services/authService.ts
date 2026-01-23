import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from './api';

// Current user state (managed locally since we're using custom auth)
let currentUser: { email: string; name: string } | null = null;
let authStateListeners: ((user: any) => void)[] = [];

// Initialize user from storage on app start
const initializeUser = async () => {
  const email = await AsyncStorage.getItem('userEmail');
  const name = await AsyncStorage.getItem('userName');
  if (email) {
    currentUser = { email, name: name || '' };
  }
};
initializeUser();

const notifyAuthStateListeners = (user: any) => {
  authStateListeners.forEach(callback => callback(user));
};

export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  // Username availability is checked by the backend during signup
  return true;
};

export const checkEmailAvailability = async (email: string): Promise<boolean> => {
  // Email availability is checked by the backend during signup
  return true;
};

export const signUp = async (email: string, password: string, name: string, username?: string) => {
  try {
    // Call backend API for signup (validates and inserts)
    const response = await authApi.signup(email, password, username || name);

    if (!response.success) {
      // Handle validation errors from backend
      if (response.errors && response.errors.length > 0) {
        const error = response.errors[0];
        if (error.field === 'email' && error.message.includes('already')) {
          throw { code: 'auth/email-already-in-use', message: error.message };
        }
        throw { code: 'validation-error', message: error.message };
      }
      throw { code: 'signup-failed', message: response.message || 'Signup failed' };
    }

    // Store user info locally
    await AsyncStorage.setItem('userEmail', email);
    await AsyncStorage.setItem('userName', name);

    currentUser = { email, name };
    notifyAuthStateListeners(currentUser);

    console.log('User signed up successfully via backend API');
    return { email, displayName: name };
  } catch (error: any) {
    // Only log unexpected errors, not validation errors
    if (!error.code?.startsWith('auth/') && error.code !== 'validation-error') {
      console.error('Signup error:', error);
    }
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    // Call backend API for signin
    const response = await authApi.signin(email, password);

    if (!response.success) {
      throw { code: 'auth/invalid-credentials', message: response.message || 'Invalid email or password' };
    }

    const userData = response.data!;

    // Store user info locally
    await AsyncStorage.setItem('userEmail', userData.email);
    await AsyncStorage.setItem('userName', userData.username || '');

    currentUser = { email: userData.email, name: userData.username || '' };
    notifyAuthStateListeners(currentUser);

    console.log('User signed in successfully via backend API');
    return { email: userData.email, displayName: userData.username };
  } catch (error: any) {
    // Only log unexpected errors, not auth errors
    if (!error.code?.startsWith('auth/')) {
      console.error('Login error:', error);
    }
    throw error;
  }
};

export const signOut = async () => {
  try {
    await AsyncStorage.removeItem('userEmail');
    await AsyncStorage.removeItem('userName');
    currentUser = null;
    notifyAuthStateListeners(null);
    console.log('User signed out');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const getCurrentUser = () => {
  return currentUser;
};

export const onAuthStateChanged = (callback: (user: any) => void) => {
  authStateListeners.push(callback);
  // Immediately call with current state
  callback(currentUser);
  
  // Return unsubscribe function
  return () => {
    authStateListeners = authStateListeners.filter(cb => cb !== callback);
  };
};

export const resetPassword = async (email: string) => {
  // For now, just log - would need email service for actual reset
  console.log('Password reset requested for:', email);
  // In a real app, you'd send an email with a reset link
  throw { code: 'not-implemented', message: 'Password reset via email is not yet implemented.' };
};

export const updateUserProfile = async (displayName: string) => {
  try {
    const email = await AsyncStorage.getItem('userEmail');
    if (email) {
      // TODO: Add backend API endpoint for profile updates
      await AsyncStorage.setItem('userName', displayName);
      if (currentUser) {
        currentUser.name = displayName;
      }
    }
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

export const deleteAccount = async () => {
  try {
    const email = await AsyncStorage.getItem('userEmail');
    if (email) {
      // TODO: Add backend API endpoint for account deletion
      await AsyncStorage.clear();
      currentUser = null;
      notifyAuthStateListeners(null);
    }
  } catch (error) {
    console.error('Delete account error:', error);
    throw error;
  }
};
