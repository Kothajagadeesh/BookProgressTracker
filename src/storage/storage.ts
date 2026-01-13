import AsyncStorage from '@react-native-async-storage/async-storage';
import {UserBook, UserProfile, Badge} from '../types';

const KEYS = {
  USER_BOOKS: 'user_books',
  USER_PROFILE: 'user_profile',
  BADGES: 'badges',
  PROFILE_PICTURE: 'profile_picture',
};

/**
 * Initialize default badges
 */
const DEFAULT_BADGES: Badge[] = [
  {
    id: 'badge-25',
    name: 'Bookworm',
    description: 'Complete 25 books',
    booksRequired: 25,
    icon: '📚',
    earned: false,
  },
  {
    id: 'badge-50',
    name: 'Book Enthusiast',
    description: 'Complete 50 books',
    booksRequired: 50,
    icon: '📖',
    earned: false,
  },
  {
    id: 'badge-75',
    name: 'Avid Reader',
    description: 'Complete 75 books',
    booksRequired: 75,
    icon: '📕',
    earned: false,
  },
  {
    id: 'badge-100',
    name: 'Century Reader',
    description: 'Complete 100 books',
    booksRequired: 100,
    icon: '🏆',
    earned: false,
  },
  {
    id: 'badge-150',
    name: 'Master Reader',
    description: 'Complete 150 books',
    booksRequired: 150,
    icon: '🌟',
    earned: false,
  },
  {
    id: 'badge-200',
    name: 'Reading Legend',
    description: 'Complete 200 books',
    booksRequired: 200,
    icon: '👑',
    earned: false,
  },
  {
    id: 'badge-500',
    name: 'Ultimate Bibliophile',
    description: 'Complete 500 books',
    booksRequired: 500,
    icon: '🎖️',
    earned: false,
  },
];

/**
 * Get all user books
 */
export const getUserBooks = async (): Promise<UserBook[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.USER_BOOKS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting user books:', error);
    return [];
  }
};

/**
 * Save user books
 */
export const saveUserBooks = async (books: UserBook[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.USER_BOOKS, JSON.stringify(books));
  } catch (error) {
    console.error('Error saving user books:', error);
  }
};

/**
 * Add or update a user book
 */
export const saveUserBook = async (userBook: UserBook): Promise<void> => {
  try {
    const books = await getUserBooks();
    const index = books.findIndex(b => b.bookId === userBook.bookId);
    
    if (index >= 0) {
      books[index] = userBook;
    } else {
      books.push(userBook);
    }
    
    await saveUserBooks(books);
    
    // Update profile stats
    await updateProfileStats();
  } catch (error) {
    console.error('Error saving user book:', error);
  }
};

/**
 * Get user profile
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
    if (data) {
      return JSON.parse(data);
    }
    
    // Create default profile
    const defaultProfile: UserProfile = {
      id: 'user-1',
      name: 'Book Lover',
      email: '',
      booksCompleted: 0,
      booksReading: 0,
      badges: DEFAULT_BADGES,
      joinedDate: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(defaultProfile));
    return defaultProfile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return {
      id: 'user-1',
      name: 'Book Lover',
      email: '',
      booksCompleted: 0,
      booksReading: 0,
      badges: DEFAULT_BADGES,
      joinedDate: new Date().toISOString(),
    };
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (profile: Partial<UserProfile>): Promise<void> => {
  try {
    const currentProfile = await getUserProfile();
    const updatedProfile = { ...currentProfile, ...profile };
    await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(updatedProfile));
  } catch (error) {
    console.error('Error updating user profile:', error);
  }
};

/**
 * Update profile statistics based on user books
 */
export const updateProfileStats = async (): Promise<void> => {
  try {
    const books = await getUserBooks();
    const profile = await getUserProfile();
    
    const completedBooks = books.filter(b => b.status === 'completed');
    const readingBooks = books.filter(b => b.status === 'reading');
    
    // Update badge status
    const updatedBadges = profile.badges.map(badge => {
      if (completedBooks.length >= badge.booksRequired && !badge.earned) {
        return {
          ...badge,
          earned: true,
          earnedDate: new Date().toISOString(),
        };
      }
      return badge;
    });
    
    await updateUserProfile({
      booksCompleted: completedBooks.length,
      booksReading: readingBooks.length,
      badges: updatedBadges,
    });
  } catch (error) {
    console.error('Error updating profile stats:', error);
  }
};

/**
 * Get badges
 */
export const getBadges = async (): Promise<Badge[]> => {
  const profile = await getUserProfile();
  return profile.badges;
};

/**
 * Delete a user book
 */
export const deleteUserBook = async (bookId: string): Promise<void> => {
  try {
    const books = await getUserBooks();
    const filteredBooks = books.filter(b => b.bookId !== bookId);
    await saveUserBooks(filteredBooks);
    await updateProfileStats();
  } catch (error) {
    console.error('Error deleting user book:', error);
  }
};

/**
 * Save profile picture URI
 */
export const saveProfilePicture = async (uri: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.PROFILE_PICTURE, uri);
  } catch (error) {
    console.error('Error saving profile picture:', error);
  }
};

/**
 * Get profile picture URI
 */
export const getProfilePicture = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(KEYS.PROFILE_PICTURE);
  } catch (error) {
    console.error('Error getting profile picture:', error);
    return null;
  }
};
