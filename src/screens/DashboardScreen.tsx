import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {getUserBooks} from '../storage/storage';
import {UserBook} from '../types';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../context/ThemeContext';
import LinearGradient from 'react-native-linear-gradient';

const {width} = Dimensions.get('window');

const DashboardScreen = () => {
  const {theme: colors} = useTheme();
  const [books, setBooks] = useState<UserBook[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalBooks: 0,
    booksThisMonth: 0,
    booksThisYear: 0,
    currentlyReading: 0,
    readingStreak: 0,
    completionRate: 0,
  });

  const loadStatistics = async () => {
    const allBooks = await getUserBooks();
    setBooks(allBooks);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const completedBooks = allBooks.filter(b => b.status === 'completed');
    const readingBooks = allBooks.filter(b => b.status === 'reading');

    // Books completed this month
    const booksThisMonth = completedBooks.filter(b => {
      if (!b.completedDate) return false;
      const completedDate = new Date(b.completedDate);
      return completedDate.getMonth() === currentMonth && 
             completedDate.getFullYear() === currentYear;
    }).length;

    // Books completed this year
    const booksThisYear = completedBooks.filter(b => {
      if (!b.completedDate) return false;
      const completedDate = new Date(b.completedDate);
      return completedDate.getFullYear() === currentYear;
    }).length;

    // Calculate reading streak (simplified - consecutive days with reading activity)
    const streak = calculateReadingStreak(completedBooks);

    // Completion rate (completed vs total books added)
    const completionRate = allBooks.length > 0 
      ? Math.round((completedBooks.length / allBooks.length) * 100)
      : 0;

    setStats({
      totalBooks: completedBooks.length,
      booksThisMonth,
      booksThisYear,
      currentlyReading: readingBooks.length,
      readingStreak: streak,
      completionRate,
    });
  };

  const calculateReadingStreak = (completedBooks: UserBook[]): number => {
    if (completedBooks.length === 0) return 0;

    // Sort books by completion date (most recent first)
    const sortedBooks = completedBooks
      .filter(b => b.completedDate)
      .sort((a, b) => {
        const dateA = new Date(a.completedDate!).getTime();
        const dateB = new Date(b.completedDate!).getTime();
        return dateB - dateA;
      });

    if (sortedBooks.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedBooks.length; i++) {
      const bookDate = new Date(sortedBooks[i].completedDate!);
      bookDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((today.getTime() - bookDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff <= streak + 7) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  useFocusEffect(
    useCallback(() => {
      loadStatistics();
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStatistics();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.background}]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, '#8b5cf6']}
        style={styles.header}>
        <Text style={styles.headerTitle}>Reading Dashboard</Text>
        <Text style={styles.headerSubtitle}>Track your reading journey</Text>
      </LinearGradient>

      {/* Main Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.statCardLarge]}>
          <LinearGradient
            colors={['#10b981', '#059669']}
            style={styles.statGradient}>
            <Icon name="book" size={32} color="white" />
            <Text style={styles.statNumber}>{stats.totalBooks}</Text>
            <Text style={styles.statLabel}>Books Read</Text>
          </LinearGradient>
        </View>

        <View style={[styles.statCard, styles.statCardLarge]}>
          <LinearGradient
            colors={['#f59e0b', '#d97706']}
            style={styles.statGradient}>
            <Icon name="flame" size={32} color="white" />
            <Text style={styles.statNumber}>{stats.readingStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Secondary Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCardSmall}>
          <Icon name="calendar" size={24} color="#6366f1" />
          <Text style={styles.statNumberSmall}>{stats.booksThisMonth}</Text>
          <Text style={styles.statLabelSmall}>This Month</Text>
        </View>

        <View style={styles.statCardSmall}>
          <Icon name="calendar-outline" size={24} color="#8b5cf6" />
          <Text style={styles.statNumberSmall}>{stats.booksThisYear}</Text>
          <Text style={styles.statLabelSmall}>This Year</Text>
        </View>

        <View style={styles.statCardSmall}>
          <Icon name="book-outline" size={24} color="#10b981" />
          <Text style={styles.statNumberSmall}>{stats.currentlyReading}</Text>
          <Text style={styles.statLabelSmall}>Reading</Text>
        </View>
      </View>

      {/* Completion Rate */}
      <View style={styles.completionCard}>
        <Text style={styles.sectionTitle}>Completion Rate</Text>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                {width: `${stats.completionRate}%`}
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{stats.completionRate}%</Text>
        </View>
        <Text style={styles.completionSubtext}>
          {stats.totalBooks} completed out of {books.length} total books
        </Text>
      </View>

      {/* Reading Insights */}
      <View style={styles.insightsCard}>
        <Text style={styles.sectionTitle}>📊 Reading Insights</Text>
        
        <View style={styles.insightRow}>
          <Icon name="trending-up" size={20} color="#10b981" />
          <Text style={styles.insightText}>
            {stats.booksThisMonth > 0 
              ? `You've read ${stats.booksThisMonth} book${stats.booksThisMonth > 1 ? 's' : ''} this month!`
              : "Start reading to build your monthly streak!"}
          </Text>
        </View>

        <View style={styles.insightRow}>
          <Icon name="trophy" size={20} color="#f59e0b" />
          <Text style={styles.insightText}>
            {stats.readingStreak > 0
              ? `${stats.readingStreak} day reading streak! Keep it up!`
              : "Complete a book to start your reading streak!"}
          </Text>
        </View>

        <View style={styles.insightRow}>
          <Icon name="stats-chart" size={20} color="#6366f1" />
          <Text style={styles.insightText}>
            {stats.booksThisYear > 0
              ? `${stats.booksThisYear} books completed this year`
              : "Your reading journey starts here!"}
          </Text>
        </View>

        {stats.currentlyReading > 0 && (
          <View style={styles.insightRow}>
            <Icon name="time" size={20} color="#8b5cf6" />
            <Text style={styles.insightText}>
              {stats.currentlyReading} book{stats.currentlyReading > 1 ? 's' : ''} in progress
            </Text>
          </View>
        )}
      </View>

      {/* Motivational Message */}
      <View style={styles.motivationCard}>
        <Text style={styles.motivationEmoji}>
          {stats.totalBooks === 0 ? '📚' : 
           stats.totalBooks < 5 ? '🌱' :
           stats.totalBooks < 10 ? '🌿' :
           stats.totalBooks < 25 ? '🌳' : '🏆'}
        </Text>
        <Text style={styles.motivationText}>
          {stats.totalBooks === 0 ? 'Start your reading journey today!' :
           stats.totalBooks < 5 ? 'Great start! Keep reading!' :
           stats.totalBooks < 10 ? 'You\'re building a great habit!' :
           stats.totalBooks < 25 ? 'Amazing progress! You\'re a bookworm!' :
           'Incredible! You\'re a reading champion!'}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 15,
    gap: 15,
  },
  statCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardLarge: {
    flex: 1,
  },
  statGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  statNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 5,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    gap: 15,
    marginBottom: 15,
  },
  statCardSmall: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumberSmall: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabelSmall: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  completionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  progressBar: {
    flex: 1,
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
    minWidth: 50,
  },
  completionSubtext: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 10,
  },
  insightsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 12,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  motivationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 30,
    marginHorizontal: 15,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  motivationEmoji: {
    fontSize: 48,
    marginBottom: 15,
  },
  motivationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
});

export default DashboardScreen;
