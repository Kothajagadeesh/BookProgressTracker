export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  isbn?: string;
  pages?: number;
  publishedDate?: string;
  description?: string;
}

export interface UserBook {
  bookId: string;
  book: Book;
  status: 'reading' | 'completed' | 'want-to-read';
  startDate?: string;
  completedDate?: string;
  currentPage?: number;
  goalEnabled: boolean;
  goalType?: 'duration' | 'pages';
  goalValue?: number; // months for duration, pages per day for pages
  rating?: number;
  comment?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  booksRequired: number;
  icon: string;
  earned: boolean;
  earnedDate?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  booksCompleted: number;
  booksReading: number;
  badges: Badge[];
  joinedDate: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}
