import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getUserProfile} from '../storage/storage';

export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  try {
    // Get all registered usernames from AsyncStorage
    const usernamesJson = await AsyncStorage.getItem('registeredUsernames');
    const usernames: string[] = usernamesJson ? JSON.parse(usernamesJson) : [];
    
    // Check if username already exists (case-insensitive)
    return !usernames.some(u => u.toLowerCase() === username.toLowerCase());
  } catch (error) {
    console.error('Error checking username:', error);
    return true; // Allow signup if check fails
  }
};

export const checkEmailAvailability = async (email: string): Promise<boolean> => {
  try {
    // Check if Firebase is initialized
    const app = auth().app;
    if (!app) {
      console.log('Firebase not initialized, skipping email check');
      return true;
    }
    
    // Firebase will check email uniqueness during signup
    // This is just a pre-check using fetch sign-in methods
    const methods = await auth().fetchSignInMethodsForEmail(email);
    return methods.length === 0; // Available if no methods found
  } catch (error) {
    console.error('Error checking email:', error);
    return true; // Allow signup if check fails
  }
};

export const signUp = async (email: string, password: string, name: string, username: string) => {
  try {
    // Check username availability
    const usernameAvailable = await checkUsernameAvailability(username);
    if (!usernameAvailable) {
      throw new Error('Username already taken');
    }

    // Create user with email and password
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    
    // Update user profile with display name
    await userCredential.user.updateProfile({
      displayName: name,
    });

    // Store user info locally
    await AsyncStorage.setItem('userName', name);
    await AsyncStorage.setItem('userEmail', email);
    await AsyncStorage.setItem('username', username);
    
    // Add username to registered usernames list
    const usernamesJson = await AsyncStorage.getItem('registeredUsernames');
    const usernames: string[] = usernamesJson ? JSON.parse(usernamesJson) : [];
    usernames.push(username);
    await AsyncStorage.setItem('registeredUsernames', JSON.stringify(usernames));
    
    return userCredential.user;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    
    // Store user info locally
    await AsyncStorage.setItem('userEmail', email);
    if (userCredential.user.displayName) {
      await AsyncStorage.setItem('userName', userCredential.user.displayName);
    }
    
    return userCredential.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await auth().signOut();
    // Clear local user data
    await AsyncStorage.removeItem('userEmail');
    await AsyncStorage.removeItem('userName');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const getCurrentUser = () => {
  return auth().currentUser;
};

export const onAuthStateChanged = (callback: (user: any) => void) => {
  return auth().onAuthStateChanged(callback);
};

export const resetPassword = async (email: string) => {
  try {
    await auth().sendPasswordResetEmail(email);
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

export const updateUserProfile = async (displayName: string) => {
  try {
    const user = auth().currentUser;
    if (user) {
      await user.updateProfile({
        displayName,
      });
      await AsyncStorage.setItem('userName', displayName);
    }
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

export const deleteAccount = async () => {
  try {
    const user = auth().currentUser;
    if (user) {
      await user.delete();
      await AsyncStorage.clear();
    }
  } catch (error) {
    console.error('Delete account error:', error);
    throw error;
  }
};
