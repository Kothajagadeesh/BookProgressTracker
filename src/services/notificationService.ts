import {Platform, NativeModules} from 'react-native';
import {UserBook} from '../types';

let PushNotification: any = null;
let Importance: any = null;

// Only import if native module is available
try {
  if (NativeModules.RNPushNotification) {
    const PushNotificationModule = require('react-native-push-notification');
    PushNotification = PushNotificationModule.default;
    Importance = PushNotificationModule.Importance;
  }
} catch (error) {
  console.warn('Push notification module not available:', error);
}

/**
 * Initialize push notifications
 */
export const initializeNotifications = () => {
  // Check if the module was loaded successfully
  if (!PushNotification) {
    console.log('Push notifications not available on this platform');
    return;
  }

  PushNotification.configure({
    onNotification: function (notification: any) {
      console.log('NOTIFICATION:', notification);
    },
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },
    popInitialNotification: true,
    requestPermissions: Platform.OS === 'ios',
  });

  // Create channel for Android
  if (Platform.OS === 'android') {
    PushNotification.createChannel(
      {
        channelId: 'reading-reminders',
        channelName: 'Reading Reminders',
        channelDescription: 'Daily reminders for reading goals',
        playSound: true,
        soundName: 'default',
        importance: Importance.HIGH,
        vibrate: true,
      },
      (created: boolean) => console.log(`Channel created: ${created}`),
    );
  }
};

/**
 * Schedule daily notification at 6 AM
 */
export const scheduleDailyNotification = (userBook: UserBook) => {
  if (!PushNotification || !userBook.goalEnabled) {
    return;
  }

  const now = new Date();
  const scheduledTime = new Date();
  scheduledTime.setHours(6, 0, 0, 0);

  // If 6 AM has passed today, schedule for tomorrow
  if (now.getTime() > scheduledTime.getTime()) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  let message = '';
  if (userBook.goalType === 'pages' && userBook.goalValue) {
    message = `Don't forget to read ${userBook.goalValue} pages of "${userBook.book.title}" today! 📖`;
  } else if (userBook.goalType === 'duration' && userBook.goalValue) {
    message = `Keep up with your reading goal for "${userBook.book.title}"! 📚`;
  } else {
    message = `Time to continue reading "${userBook.book.title}"! 📕`;
  }

  PushNotification.localNotificationSchedule({
    channelId: 'reading-reminders',
    id: userBook.bookId.hashCode().toString(), // Use a hash of bookId as notification ID
    title: '⏰ Reading Reminder',
    message: message,
    date: scheduledTime,
    allowWhileIdle: true,
    repeatType: 'day', // Repeat daily
  });
};

/**
 * Cancel notification for a book
 */
export const cancelNotification = (bookId: string) => {
  if (!PushNotification) return;
  PushNotification.cancelLocalNotification(bookId.hashCode().toString());
};

/**
 * Cancel all notifications
 */
export const cancelAllNotifications = () => {
  if (!PushNotification) return;
  PushNotification.cancelAllLocalNotifications();
};

/**
 * Update notification when book status or goal changes
 */
export const updateBookNotification = (userBook: UserBook) => {
  // Cancel existing notification
  cancelNotification(userBook.bookId);

  // Schedule new one if goal is enabled and book is being read
  if (userBook.goalEnabled && userBook.status === 'reading') {
    scheduleDailyNotification(userBook);
  }
};

/**
 * Helper function to generate hash code from string (for notification IDs)
 */
declare global {
  interface String {
    hashCode(): number;
  }
}

String.prototype.hashCode = function (): number {
  let hash = 0;
  if (this.length === 0) return hash;
  for (let i = 0; i < this.length; i++) {
    const char = this.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};
