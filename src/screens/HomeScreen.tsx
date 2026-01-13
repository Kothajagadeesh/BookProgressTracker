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
import {getUserBooks, getUserProfile, getProfilePicture} from '../storage/storage';
import {UserBook, UserProfile} from '../types';
import {calculateProgress} from '../utils/dateUtils';
import Icon from 'react-native-vector-icons/Ionicons';
import SearchField from '../components/SearchField';
import {useTheme} from '../context/ThemeContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const {theme: colors} = useTheme();
  const [readingBooks, setReadingBooks] = useState<UserBook[]>([]);
  const [completedBooks, setCompletedBooks] = useState<UserBook[]>([]);
  const [wantToReadBooks, setWantToReadBooks] = useState<UserBook[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const loadBooks = async () => {
    const books = await getUserBooks();
    
    // Sort reading books by start date (most recent first)
    const reading = books
      .filter(b => b.status === 'reading')
      .sort((a, b) => {
        const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
        const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
        return dateB - dateA; // Descending order (newest first)
      });
    setReadingBooks(reading);
    
    // Sort completed books by completion date (most recent first)
    const completed = books
      .filter(b => b.status === 'completed')
      .sort((a, b) => {
        const dateA = a.completedDate ? new Date(a.completedDate).getTime() : 0;
        const dateB = b.completedDate ? new Date(b.completedDate).getTime() : 0;
        return dateB - dateA; // Descending order (newest first)
      });
    setCompletedBooks(completed);
    
    setWantToReadBooks(books.filter(b => b.status === 'want-to-read'));
    
    const userProfile = await getUserProfile();
    setProfile(userProfile);
    const picture = await getProfilePicture();
    setProfilePicture(picture);
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
      // Navigate to search screen with query
      navigation.navigate('Search', {query: searchQuery.trim()});
    } else {
      // Just navigate to search screen
      navigation.navigate('Search', undefined);
    }
  };

  const navigateToSearch = () => {
    // Navigate to search screen
    navigation.navigate('Search', undefined);
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  const renderReadingBook = ({item}: {item: UserBook}) => {
    return (
      <TouchableOpacity
        style={[styles.bookCard, {backgroundColor: colors.surface, borderColor: colors.border}]}
        onPress={() => navigation.navigate('BookDetail', {bookId: item.bookId})}>
        <View style={styles.bookCardContent}>
          {item.book.coverUrl ? (
            <Image source={{uri: item.book.coverUrl}} style={styles.bookCover} />
          ) : (
            <View style={[styles.bookCover, styles.placeholderCover, {backgroundColor: colors.borderLight}]}>
              <Text style={styles.placeholderText}>📚</Text>
            </View>
          )}
          <View style={styles.bookInfo}>
            <Text style={[styles.bookTitle, {color: colors.text}]} numberOfLines={2}>
              {String(item.book.title)}
            </Text>
            <Text style={[styles.bookAuthor, {color: colors.textSecondary}]} numberOfLines={1}>
              {String(item.book.author)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCompletedBook = ({item}: {item: UserBook}) => (
    <TouchableOpacity
      style={[styles.completedCard, {backgroundColor: colors.surface}]}
      onPress={() => navigation.navigate('BookDetail', {bookId: item.bookId})}>
      {item.book.coverUrl ? (
        <Image source={{uri: item.book.coverUrl}} style={styles.completedCover} />
      ) : (
        <View style={[styles.completedCover, styles.placeholderCover, {backgroundColor: colors.borderLight}]}>
          <Text style={styles.placeholderText}>📚</Text>
        </View>
      )}
      <Text style={[styles.completedTitle, {color: colors.text}]} numberOfLines={2}>
        {String(item.book.title)}
      </Text>
      {item.rating && (
        <Text style={styles.rating}>{'⭐'.repeat(item.rating)}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Header with Profile */}
      <View style={[styles.header, {backgroundColor: colors.surface, borderBottomColor: colors.border}]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, {color: colors.text}]}>My Library</Text>
          <Text style={[styles.headerSubtitle, {color: colors.textSecondary}]}>
            <Text style={[styles.countBold, {color: colors.primary}]}>{readingBooks.length}</Text> reading • <Text style={[styles.countBold, {color: colors.primary}]}>{completedBooks.length}</Text> completed
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={handleProfilePress}>
          {profilePicture ? (
            <Image source={{uri: profilePicture}} style={styles.profileImage} />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Text style={styles.profileInitial}>
                {profile?.name.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchFieldWrapper}>
          <SearchField
            placeholder="Search by title, author, or ISBN..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            onClear={() => setSearchQuery('')}
            showClear={searchQuery.length > 0}
          />
        </View>
        <TouchableOpacity style={styles.searchIconButton} onPress={handleSearch}>
          <Icon name="search" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}>
        {/* Continue Reading Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, {color: colors.text}]}>Continue Reading</Text>
            {readingBooks.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('Shelf', {filter: 'reading'})}>
                <Text style={[styles.seeAllText, {color: colors.primary}]}>See All</Text>
              </TouchableOpacity>
            )}
          </View>

          {readingBooks.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="book-outline" size={48} color={colors.placeholder} />
              <Text style={[styles.emptyText, {color: colors.textSecondary}]}>No books in progress</Text>
              <Text style={[styles.emptySubtext, {color: colors.textTertiary}]}>
                Search for books to start reading
              </Text>
              <TouchableOpacity
                style={[styles.addButton, {backgroundColor: colors.primary}]}
                onPress={navigateToSearch}>
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
              <Text style={[styles.sectionTitle, {color: colors.text}]}>Recently Completed</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Shelf', {filter: 'completed'})}>
                <Text style={[styles.seeAllText, {color: colors.primary}]}>See All</Text>
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
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate('Shelf', {filter: 'completed'})}>
            <Text style={styles.statNumber}>{completedBooks.length}</Text>
            <Text style={styles.statLabel}>Books Read</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate('Shelf', {filter: 'reading'})}>
            <Text style={styles.statNumber}>{readingBooks.length}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate('Shelf', {filter: 'want-to-read'})}>
            <Text style={styles.statNumber}>{wantToReadBooks.length}</Text>
            <Text style={styles.statLabel}>Want to Read</Text>
          </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    flex: 1,
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
  countBold: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  profileButton: {
    marginLeft: 12,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  profilePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  profileInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  searchFieldWrapper: {
    flex: 1,
  },
  searchIconButton: {
    backgroundColor: '#6366F1',
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
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
