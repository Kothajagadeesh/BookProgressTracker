import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  try {
    const snapshot = await firestore()
      .collection('users')
      .where('username', '==', username.toLowerCase())
      .limit(1)
      .get();

    return snapshot.empty; // If snapshot is empty, username is available
  } catch (error) {
    console.error('Error checking username:', error);
    // In case of an error, it's safer to prevent signup to avoid duplicates.
    return false;
  }
};

export const checkEmailAvailability = async (email: string): Promise<boolean> => {
  try {
    const app = auth().app;
    if (!app) {
      console.log('Firebase not initialized, skipping email check');
      return true;
    }
    const methods = await auth().fetchSignInMethodsForEmail(email);
    return methods.length === 0;
  } catch (error) {
    console.error('Error checking email:', error);
    return true; 
  }
};

export const signUp = async (email: string, password: string, name: string, username?: string) => {
    try {
      // Create user with email and password
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
  
      // Update user profile with display name
      await user.updateProfile({
        displayName: name,
      });
  
      // Create a user document in Firestore
      await firestore().collection('users').doc(user.uid).set({
        uid: user.uid,
        name,
        username: username ? username.toLowerCase() : '',
        email,
        createdAt: firestore.FieldValue.serverTimestamp(),
        profilePicture: null,
        bio: '',
      });
  
      return user;
    } catch (error: any) {
      console.error('Signup error:', error);
      // If user creation succeeded but firestore failed, delete the auth user
      if (error.code !== 'auth/email-already-in-use' && auth().currentUser) {
         await auth().currentUser.delete();
      }
      throw error;
    }
  };

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    
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
      // Also update the name in Firestore
      await firestore().collection('users').doc(user.uid).update({
        name: displayName
      });
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
      // Delete user document from Firestore
      await firestore().collection('users').doc(user.uid).delete();
      // Delete user from Auth
      await user.delete();
      await AsyncStorage.clear();
    }
  } catch (error) {
    console.error('Delete account error:', error);
    throw error;
  }
};
