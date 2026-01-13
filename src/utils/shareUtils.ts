import Share from 'react-native-share';
import {UserBook} from '../types';

/**
 * Share book start message to social media
 */
export const shareBookStart = async (userBook: UserBook) => {
  try {
    const message = `📚 Hey! I just started reading "${userBook.book.title}" by ${userBook.book.author}! 

Tracking my progress with Book Progress Tracker 📖

#Reading #Books #${userBook.book.title.replace(/\s+/g, '')}`;

    const shareOptions = {
      title: 'Share Reading Progress',
      message: message,
      subject: `Started reading ${userBook.book.title}`,
    };

    await Share.open(shareOptions);
  } catch (error: any) {
    if (error.message !== 'User did not share') {
      console.error('Error sharing book start:', error);
    }
  }
};

/**
 * Share book completion message to social media
 */
export const shareBookCompletion = async (userBook: UserBook) => {
  try {
    const ratingStars = userBook.rating ? '⭐'.repeat(userBook.rating) : '';
    const message = `🎉 I just completed "${userBook.book.title}" by ${userBook.book.author}! ${ratingStars}

${userBook.comment ? `My thoughts: ${userBook.comment}\n\n` : ''}Tracking my reading journey with Book Progress Tracker 📚

#BookCompleted #Reading #${userBook.book.title.replace(/\s+/g, '')}`;

    const shareOptions = {
      title: 'Share Book Completion',
      message: message,
      subject: `Completed ${userBook.book.title}`,
    };

    await Share.open(shareOptions);
  } catch (error: any) {
    if (error.message !== 'User did not share') {
      console.error('Error sharing book completion:', error);
    }
  }
};

/**
 * Share reading milestone (badge earned)
 */
export const shareMilestone = async (badgeName: string, booksCount: number) => {
  try {
    const message = `🏆 Achievement Unlocked! 

I just earned the "${badgeName}" badge for completing ${booksCount} books! 

Join me in tracking your reading journey! 📚✨

#ReadingMilestone #BookLover #${booksCount}Books`;

    const shareOptions = {
      title: 'Share Achievement',
      message: message,
      subject: `Earned ${badgeName} Badge`,
    };

    await Share.open(shareOptions);
  } catch (error: any) {
    if (error.message !== 'User did not share') {
      console.error('Error sharing milestone:', error);
    }
  }
};
