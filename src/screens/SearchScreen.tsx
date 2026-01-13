import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ScrollView,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {searchBooks} from '../services/bookApi';
import {Book} from '../types';
import Icon from 'react-native-vector-icons/Ionicons';
import BookLoadingAnimation from '../components/BookLoadingAnimation';
import {useTheme} from '../context/ThemeContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SearchRouteProp = RouteProp<RootStackParamList, 'Search'>;

const SearchScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SearchRouteProp>();
  const {theme: colors} = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (route.params?.query && typeof route.params.query === 'string') {
      setSearchQuery(route.params.query);
      performSearch(route.params.query);
      navigation.setParams({query: undefined} as any);
    }
  }, [route.params?.query]);

  const performSearch = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    
    try {
      const results = await searchBooks(query);
      
      const validBooks = results
        .filter(book => {
          return (
            book &&
            typeof book === 'object' &&
            book.id &&
            book.title &&
            typeof book.title === 'string'
          );
        })
        .map(book => {
          return {
            ...book,
            author: typeof book.author === 'string' ? book.author : 'Unknown Author',
            title: String(book.title),
            publishedDate: book.publishedDate ? String(book.publishedDate) : undefined,
          };
        });
      
      setBooks(validBooks);
    } catch (error) {
      console.error('Search error:', error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    performSearch(searchQuery);
  };

  const renderBook = ({item}: {item: Book}) => {
    if (!item || !item.id || !item.title) {
      return null;
    }
    
    const handleBookPress = () => {
      setSelectedBook(item);
      setModalVisible(true);
    };
    
    return (
      <TouchableOpacity
        style={[styles.bookItem, {backgroundColor: colors.surface, borderBottomColor: colors.border}]}
        onPress={handleBookPress}>
        <View style={styles.bookContent}>
          {item.coverUrl ? (
            <Image source={{uri: item.coverUrl}} style={styles.bookCover} />
          ) : (
            <View style={[styles.bookCover, styles.placeholderCover, {backgroundColor: colors.borderLight}]}>
              <Text style={styles.placeholderText}>📚</Text>
            </View>
          )}
          <View style={styles.bookDetails}>
            <Text style={[styles.bookTitle, {color: colors.text}]} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={[styles.bookAuthor, {color: colors.textSecondary}]} numberOfLines={1}>
              {item.author || 'Unknown Author'}
            </Text>
          </View>
          <Icon name="chevron-forward" size={24} color={colors.textTertiary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, {backgroundColor: colors.background}]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, {backgroundColor: colors.surface, borderBottomColor: colors.border}]}>
        <Text style={[styles.headerTitle, {color: colors.text}]}>Search Books</Text>
        <View style={[styles.searchContainer, {backgroundColor: colors.background, borderColor: colors.border}]}>
          <Icon name="search" size={20} color={colors.textTertiary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, {color: colors.text}]}
            placeholder="Search by title, author, or ISBN..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setBooks([]);
                setSearched(false);
              }}>
              <Icon name="close-circle" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.searchButton,
            {backgroundColor: colors.primary},
            !searchQuery.trim() && [styles.searchButtonDisabled, {backgroundColor: colors.placeholder}],
          ]}
          onPress={handleSearch}
          disabled={!searchQuery.trim() || loading}>
          <Text style={styles.searchButtonText}>
            {loading ? 'Searching...' : 'Search'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <BookLoadingAnimation />
          <Text style={[styles.loadingText, {color: colors.textSecondary}]}>Searching for books...</Text>
        </View>
      ) : books.length > 0 ? (
        <FlatList
          data={books}
          renderItem={renderBook}
          keyExtractor={(item, index) => (item?.id ? String(item.id) : `book-${index}`)}
          contentContainerStyle={styles.listContent}
        />
      ) : searched ? (
        <View style={styles.centerContainer}>
          <Icon name="book-outline" size={64} color={colors.placeholder} />
          <Text style={[styles.emptyText, {color: colors.textSecondary}]}>No books found</Text>
          <Text style={[styles.emptySubtext, {color: colors.textTertiary}]}>Try different keywords</Text>
        </View>
      ) : (
        <View style={styles.centerContainer}>
          <Icon name="search-outline" size={64} color={colors.placeholder} />
          <Text style={[styles.emptyText, {color: colors.textSecondary}]}>Find Your Next Read</Text>
          <Text style={[styles.emptySubtext, {color: colors.textTertiary}]}>
            Search for books by title, author, or ISBN
          </Text>
        </View>
      )}

      {/* Book Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedBook && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Book Details</Text>
                    <TouchableOpacity
                      onPress={() => setModalVisible(false)}
                      style={styles.closeButton}>
                      <Icon name="close" size={28} color="#1f2937" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalBookInfo}>
                    {selectedBook.coverUrl ? (
                      <Image
                        source={{uri: selectedBook.coverUrl}}
                        style={styles.modalCoverImage}
                      />
                    ) : (
                      <View style={[styles.modalCoverImage, styles.placeholderCover]}>
                        <Text style={styles.placeholderText}>📚</Text>
                      </View>
                    )}

                    <View style={styles.modalDetails}>
                      <Text style={styles.modalBookTitle}>{selectedBook.title}</Text>
                      <Text style={styles.modalBookAuthor}>{selectedBook.author}</Text>
                      
                      {selectedBook.isbn && (
                        <View style={styles.modalInfoRow}>
                          <Icon name="barcode-outline" size={18} color="#6366f1" />
                          <Text style={styles.modalInfoText}>ISBN: {selectedBook.isbn}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                      setModalVisible(false);
                      const sanitizedBook: Book = {
                        id: String(selectedBook.id),
                        title: String(selectedBook.title),
                        author: String(selectedBook.author || 'Unknown Author'),
                        coverUrl: selectedBook.coverUrl ? String(selectedBook.coverUrl) : undefined,
                        isbn: selectedBook.isbn ? String(selectedBook.isbn) : undefined,
                        pages: typeof selectedBook.pages === 'number' ? selectedBook.pages : undefined,
                        publishedDate: selectedBook.publishedDate ? String(selectedBook.publishedDate) : undefined,
                        description: selectedBook.description ? String(selectedBook.description) : undefined,
                      };
                      navigation.navigate('AddBook', {book: sanitizedBook});
                    }}>
                    <Text style={styles.addButtonText}>Add to Shelf</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  searchButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 15,
  },
  bookItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
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
  bookPages: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  publishedDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  pages: {
    fontSize: 12,
    color: '#9ca3af',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#6b7280',
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
  },
  noBookContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 30,
    margin: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noBookIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  noBookText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  searchAgainButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  searchAgainText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    padding: 5,
  },
  modalBookInfo: {
    alignItems: 'center',
    marginBottom: 25,
  },
  modalCoverImage: {
    width: 120,
    height: 180,
    borderRadius: 10,
    marginBottom: 20,
  },
  modalDetails: {
    width: '100%',
  },
  modalBookTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalBookAuthor: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  modalInfoText: {
    fontSize: 15,
    color: '#374151',
    marginLeft: 10,
  },
  addButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SearchScreen;
