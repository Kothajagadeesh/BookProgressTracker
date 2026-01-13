import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  FlatList,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {getUserBooks} from '../storage/storage';
import {UserBook} from '../types';
import {calculateProgress} from '../utils/dateUtils';
import Icon from 'react-native-vector-icons/Ionicons';
import SearchField from '../components/SearchField';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [readingBooks, setReadingBooks] = useState<UserBook[]>([]);
  const [completedBooks, setCompletedBooks] = useState<UserBook[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadBooks = async () => {
    const books = await getUserBooks();
    setReadingBooks(books.filter(b => b.status === 'reading'));
    setCompletedBooks(books.filter(b => b.status === 'completed'));
  };

  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBooks();
    setRefreshing(false);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('Search');
    }
  };

  const renderReadingBook = ({item}: {item: UserBook}) => {
    const progress = item.book.pages
      ? calculateProgress(item.currentPage || 0, item.book.pages)
      : 0;

    return (
      <TouchableOpacity
        style={styles.bookCard}
        onPress={() => navigation.navigate('BookDetail', {bookId: item.bookId})}>
        <View style={styles.bookCardContent}>
          {item.book.coverUrl ? (
            <Image source={{uri: item.book.coverUrl}} style={styles.bookCover} />
          ) : (
            <View style={[styles.bookCover, styles.placeholderCover]}>
              <Text style={styles.placeholderText}>📚</Text>
            </View>
          )}
          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle} numberOfLines={2}>
              {item.book.title}
            </Text>
            <Text style={styles.bookAuthor} numberOfLines={1}>
              {item.book.author}
            </Text>
            {item.startDate && (
              <Text style={styles.startDate}>
                Started: {formatDate(item.startDate)}
              </Text>
            )}
            {item.goalEnabled && (
              <Text style={styles.goalText}>
                🎯 {getGoalDescription(item.goalType, item.goalValue)}
              </Text>
            )}
            {item.book.pages && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, {width: `${progress}%`}]} />
                </View>
                <Text style={styles.progressText}>
                  {item.currentPage || 0} / {item.book.pages} pages ({progress}%)
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCompletedBook = ({item}: {item: UserBook}) => (
    <TouchableOpacity
      style={styles.completedBookCard}
      onPress={() => navigation.navigate('BookDetail', {bookId: item.bookId})}>
      {item.book.coverUrl ? (
        <Image source={{uri: item.book.coverUrl}} style={styles.completedCover} />
      ) : (
        <View style={[styles.completedCover, styles.placeholderCover]}>
          <Text style={styles.placeholderText}>📚</Text>
        </View>
      )}
      <Text style={styles.completedTitle} numberOfLines={2}>
        {item.book.title}
      </Text>
      {item.rating && (
        <Text style={styles.rating}>{'⭐'.repeat(item.rating)}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Library</Text>
        <Text style={styles.headerSubtitle}>
          {readingBooks.length} reading • {completedBooks.length} completed
        </Text>
      </View>

      {/* Search Bar */}
      <SearchField
        placeholder="Search by title, author, or ISBN..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch}
        onClear={() => setSearchQuery('')}
        showClear={searchQuery.length > 0}
      />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}>
        {/* Continue Reading Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Continue Reading</Text>
            {readingBooks.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('MainTabs')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            )}
          </View>

          {readingBooks.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="book-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No books in progress</Text>
              <Text style={styles.emptySubtext}>
                Search for books to start reading
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('MainTabs')}>
                <Text style={styles.addButtonText}>Browse Books</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              horizontal
              data={readingBooks}
              renderItem={renderReadingBook}
              keyExtractor={item => item.bookId}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          )}
        </View>

        {/* Recently Completed Section */}
        {completedBooks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recently Completed</Text>
              <TouchableOpacity onPress={() => navigation.navigate('MainTabs')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={completedBooks.slice(0, 10)}
              renderItem={renderCompletedBook}
              keyExtractor={item => item.bookId}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedBooks.length}</Text>
            <Text style={styles.statLabel}>Books Read</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{readingBooks.length}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {completedBooks.filter(b => b.rating && b.rating >= 4).length}
            </Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  seeAllText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  horizontalList: {
    paddingRight: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F7F7F8',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  // Reading Book Card (Horizontal Card - 80×120 image)
  bookCard: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginRight: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  bookCardContent: {
    flexDirection: 'row',
  },
  bookCover: {
    width: 80,
    height: 120,
    borderRadius: 8,
    marginRight: 12,
  },
  placeholderCover: {
    backgroundColor: '#F2F3F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  bookInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  // Completed Book Card (120×190)
  completedCard: {
    width: 120,
    marginRight: 12,
  },
  completedCover: {
    width: 120,
    height: 160,
    borderRadius: 12,
    marginBottom: 8,
  },
  completedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  rating: {
    fontSize: 12,
  },
});

export default HomeScreen;
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>
                    No books in progress. Search for books to start reading! 📖
                  </Text>
                </View>
              ) : (
                readingBooks.map(book => (
                  <View key={book.bookId}>{renderReadingBook({item: book})}</View>
                ))
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recently Completed</Text>
              {completedBooks.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>
                    Complete your first book to see it here! 🎉
                  </Text>
                </View>
              ) : (
                <FlatList
                  horizontal
                  data={completedBooks.slice(0, 10)}
                  renderItem={renderCompletedBook}
                  keyExtractor={item => item.bookId}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.completedList}
                />
              )}
            </View>
          </>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 15,
    color: '#1f2937',
  },
  bookCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookCardContent: {
    flexDirection: 'row',
  },
  bookCover: {
    width: 80,
    height: 120,
    borderRadius: 8,
    marginRight: 15,
  },
  placeholderCover: {
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  bookInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  startDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  goalText: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600',
    marginBottom: 8,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
  },
  completedList: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  completedBookCard: {
    width: 120,
    marginRight: 15,
  },
  completedCover: {
    width: 120,
    height: 180,
    borderRadius: 8,
    marginBottom: 8,
  },
  completedTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  rating: {
    fontSize: 12,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default HomeScreen;
