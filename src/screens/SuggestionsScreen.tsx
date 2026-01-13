import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {searchBooks} from '../services/bookApi';
import {Book} from '../types';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../context/ThemeContext';
import BookLoadingAnimation from '../components/BookLoadingAnimation';

type SuggestionsRouteProp = RouteProp<RootStackParamList, 'Suggestions'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SuggestionsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SuggestionsRouteProp>();
  const {theme: colors} = useTheme();
  const {book} = route.params;

  const [suggestedBooks, setSuggestedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const allSuggestions: Book[] = [];
      
      // Search for books by same author
      if (book.author) {
        const authorBooks = await searchBooks(book.author);
        const filteredAuthorBooks = authorBooks.filter(b => b.id !== book.id);
        allSuggestions.push(...filteredAuthorBooks);
      }

      // Search for books in same genre (using title keywords as proxy)
      const titleWords = book.title.split(' ').slice(0, 2).join(' ');
      const genreBooks = await searchBooks(titleWords);
      const filteredGenreBooks = genreBooks.filter(
        b => b.id !== book.id && !allSuggestions.some(existing => existing.id === b.id)
      );
      allSuggestions.push(...filteredGenreBooks);

      // Remove duplicates and limit to 10 books
      const uniqueBooks = allSuggestions
        .filter((book, index, self) => 
          index === self.findIndex(b => b.id === book.id)
        )
        .slice(0, 10);
      
      setSuggestedBooks(uniqueBooks);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookPress = (selectedBook: Book) => {
    navigation.navigate('AddBook', {book: selectedBook});
  };

  const handleDone = () => {
    navigation.navigate('MainTabs');
  };

  const renderBook = ({item}: {item: Book}) => (
    <TouchableOpacity
      style={[styles.bookCard, {backgroundColor: colors.surface}]}
      onPress={() => handleBookPress(item)}>
      {item.coverUrl ? (
        <Image source={{uri: item.coverUrl}} style={styles.bookCover} />
      ) : (
        <View style={[styles.bookCover, styles.placeholderCover, {backgroundColor: colors.borderLight}]}>
          <Text style={styles.placeholderText}>📚</Text>
        </View>
      )}
      <View style={styles.bookInfo}>
        <Text style={[styles.bookTitle, {color: colors.text}]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.bookAuthor, {color: colors.textSecondary}]} numberOfLines={1}>
          {item.author}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, {backgroundColor: colors.background}]}>
        <BookLoadingAnimation />
        <Text style={[styles.loadingText, {color: colors.textSecondary}]}>Finding recommendations...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Header */}
      <View style={[styles.header, {backgroundColor: colors.surface}]}>
        <TouchableOpacity onPress={handleDone} style={styles.closeButton}>
          <Icon name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Icon name="sparkles" size={32} color={colors.primary} />
          <Text style={[styles.headerTitle, {color: colors.text}]}>What to Read Next?</Text>
          <Text style={[styles.headerSubtitle, {color: colors.textSecondary}]}>
            Based on "{book.title}"
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Books You May Like Section */}
        {suggestedBooks.length > 0 ? (
          <>
            <View style={styles.sectionHeaderContainer}>
              <View style={styles.sectionHeader}>
                <Icon name="heart" size={24} color={colors.primary} />
                <Text style={[styles.sectionTitle, {color: colors.text}]}>Books You May Like</Text>
              </View>
              <Text style={[styles.sectionSubtitle, {color: colors.textSecondary}]}>
                {suggestedBooks.length} {suggestedBooks.length === 1 ? 'recommendation' : 'recommendations'} based on your reading
              </Text>
            </View>
            <FlatList
              data={suggestedBooks}
              renderItem={renderBook}
              keyExtractor={(item) => item.id}
              numColumns={2}
              contentContainerStyle={styles.gridContent}
              columnWrapperStyle={styles.gridRow}
              showsVerticalScrollIndicator={false}
            />
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="search-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No suggestions found</Text>
            <Text style={styles.emptySubtext}>
              Try searching for your next book manually
            </Text>
          </View>
        )}

        {/* Done Button */}
        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  sectionHeaderContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  gridContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  bookCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookCover: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 10,
  },
  placeholderCover: {
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 40,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  doneButton: {
    backgroundColor: '#6366f1',
    marginHorizontal: 20,
    marginVertical: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SuggestionsScreen;
