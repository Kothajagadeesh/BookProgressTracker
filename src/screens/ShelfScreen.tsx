import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import {useFocusEffect, useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {getUserBooks} from '../storage/storage';
import {UserBook} from '../types';
import Icon from 'react-native-vector-icons/Ionicons';
import ToastNotification from '../components/ToastNotification';
import {useTheme} from '../context/ThemeContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ShelfRouteProp = RouteProp<RootStackParamList, 'Shelf'>;

const ShelfScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ShelfRouteProp>();
  const {theme: colors} = useTheme();
  const initialFilter = route.params?.filter || 'completed';
  
  const [books, setBooks] = useState<UserBook[]>([]);
  const [allBooks, setAllBooks] = useState<UserBook[]>([]);
  const [filter, setFilter] = useState<'completed' | 'reading' | 'want-to-read'>(initialFilter);
  const [refreshing, setRefreshing] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'tile'>('list');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const loadBooks = async () => {
    const userBooks = await getUserBooks();
    setAllBooks(userBooks);
    const filteredBooks = userBooks.filter(b => b.status === filter);
    setBooks(filteredBooks);
  };

  const getBookCount = (status: 'completed' | 'reading' | 'want-to-read') => {
    return allBooks.filter(b => b.status === status).length;
  };

  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, [filter]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBooks();
    setRefreshing(false);
  };

  const getFilterLabel = () => {
    switch (filter) {
      case 'completed':
        return 'Books Read';
      case 'reading':
        return 'In Progress';
      case 'want-to-read':
        return 'Want to Read';
      default:
        return 'Books Read';
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const handleFilterChange = (newFilter: 'completed' | 'reading' | 'want-to-read') => {
    setFilter(newFilter);
    setDropdownVisible(false);
  };

  const renderListBook = ({item}: {item: UserBook}) => (
    <TouchableOpacity
      style={styles.bookItem}
      onPress={() => navigation.navigate('BookDetail', {bookId: item.bookId})}>
      <View style={styles.bookContent}>
        {item.book.coverUrl ? (
          <Image source={{uri: item.book.coverUrl}} style={styles.bookCover} />
        ) : (
          <View style={[styles.bookCover, styles.placeholderCover]}>
            <Text style={styles.placeholderText}>📚</Text>
          </View>
        )}
        <View style={styles.bookDetails}>
          <Text style={styles.bookTitle} numberOfLines={2}>
            {item.book.title}
          </Text>
          <Text style={styles.bookAuthor} numberOfLines={1}>
            {item.book.author}
          </Text>
          {item.rating && filter === 'completed' && (
            <Text style={styles.rating}>{'⭐'.repeat(item.rating)}</Text>
          )}
        </View>
        <Icon name="chevron-forward" size={24} color={colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );

  const renderTileBook = ({item}: {item: UserBook}) => (
    <TouchableOpacity
      style={[styles.tileItem, {backgroundColor: colors.surface}]}
      onPress={() => navigation.navigate('BookDetail', {bookId: item.bookId})}>
      {item.book.coverUrl ? (
        <Image source={{uri: item.book.coverUrl}} style={styles.tileCover} />
      ) : (
        <View style={[styles.tileCover, styles.placeholderCover, {backgroundColor: colors.borderLight}]}>
          <Text style={styles.placeholderText}>📚</Text>
        </View>
      )}
      <View style={styles.tileDetails}>
        <Text style={[styles.tileTitle, {color: colors.text}]} numberOfLines={2}>
          {item.book.title}
        </Text>
        <Text style={[styles.tileAuthor, {color: colors.textSecondary}]} numberOfLines={1}>
          {item.book.author}
        </Text>
        {item.rating && filter === 'completed' && (
          <Text style={styles.tileRating}>{'⭐'.repeat(item.rating)}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Toast Notification */}
      <ToastNotification
        visible={toastVisible}
        message={toastMessage}
        type="info"
        onDismiss={() => setToastVisible(false)}
      />
      
      {/* Filter Dropdown */}
      <View style={[styles.filterContainer, {backgroundColor: colors.surface, borderBottomColor: colors.border}]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={[styles.filterButton, {backgroundColor: colors.primaryLight, borderColor: colors.primary}]}
            onPress={() => setDropdownVisible(!dropdownVisible)}>
            <Text style={[styles.filterButtonText, {color: colors.primary}]}>{getFilterLabel()}</Text>
            <Icon
              name={dropdownVisible ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>
          
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.viewButton, {borderColor: colors.border}, viewMode === 'list' && {backgroundColor: colors.primaryLight}]}
              onPress={() => setViewMode('list')}>
              <Icon
                name="list"
                size={20}
                color={viewMode === 'list' ? colors.primary : colors.textTertiary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewButton, {borderColor: colors.border}, viewMode === 'tile' && {backgroundColor: colors.primaryLight}]}
              onPress={() => setViewMode('tile')}>
              <Icon
                name="grid"
                size={20}
                color={viewMode === 'tile' ? colors.primary : colors.textTertiary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {dropdownVisible && (
          <View style={[styles.dropdown, {backgroundColor: colors.surface, borderColor: colors.border}]}>
            <TouchableOpacity
              style={[styles.dropdownItem, filter === 'completed' && {backgroundColor: colors.primaryLight}]}
              onPress={() => handleFilterChange('completed')}>
              <Text style={[styles.dropdownText, {color: colors.text}, filter === 'completed' && {color: colors.primary, fontWeight: '600'}]}>
                Books Read ({getBookCount('completed')})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dropdownItem, filter === 'reading' && {backgroundColor: colors.primaryLight}]}
              onPress={() => handleFilterChange('reading')}>
              <Text style={[styles.dropdownText, {color: colors.text}, filter === 'reading' && {color: colors.primary, fontWeight: '600'}]}>
                In Progress ({getBookCount('reading')})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dropdownItem, filter === 'want-to-read' && {backgroundColor: colors.primaryLight}]}
              onPress={() => handleFilterChange('want-to-read')}>
              <Text style={[styles.dropdownText, {color: colors.text}, filter === 'want-to-read' && {color: colors.primary, fontWeight: '600'}]}>
                Want to Read ({getBookCount('want-to-read')})
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Books List */}
      {books.length > 0 ? (
        <FlatList
          data={books}
          renderItem={viewMode === 'list' ? renderListBook : renderTileBook}
          keyExtractor={item => item.bookId}
          numColumns={viewMode === 'tile' ? 2 : 1}
          key={viewMode}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={viewMode === 'list' ? styles.listContent : styles.tileContent}
          columnWrapperStyle={viewMode === 'tile' ? styles.tileRow : undefined}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="book-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>No books in this shelf</Text>
          <Text style={styles.emptySubtext}>
            Add books to see them here
          </Text>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => navigation.navigate('Search', undefined)}>
            <Icon name="search" size={20} color="white" />
            <Text style={styles.searchButtonText}>Search for Books</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  filterContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  viewButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewButtonActive: {
    backgroundColor: 'white',
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  dropdown: {
    marginTop: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dropdownItemActive: {
    backgroundColor: '#ede9fe',
  },
  dropdownText: {
    fontSize: 15,
    color: '#4b5563',
  },
  dropdownTextActive: {
    color: '#6366f1',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  bookItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookCover: {
    width: 60,
    height: 90,
    borderRadius: 6,
    marginRight: 15,
  },
  placeholderCover: {
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
  },
  bookDetails: {
    flex: 1,
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
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
  },
  // Tile View Styles
  tileContent: {
    padding: 12,
  },
  tileRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  tileItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    marginHorizontal: 4,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tileCover: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  tileDetails: {
    flex: 1,
  },
  tileTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  tileAuthor: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  tileRating: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 20,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ShelfScreen;
