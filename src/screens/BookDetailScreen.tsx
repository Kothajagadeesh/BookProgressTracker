import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {getUserBooks, deleteUserBook, saveUserBook} from '../storage/storage';
import {UserBook} from '../types';
import {formatDate, calculateProgress, getGoalDescription} from '../utils/dateUtils';
import {shareBookCompletion} from '../utils/shareUtils';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../context/ThemeContext';
import {Rating} from 'react-native-ratings';

type BookDetailRouteProp = RouteProp<RootStackParamList, 'BookDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const BookDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<BookDetailRouteProp>();
  const {theme: colors} = useTheme();
  const [userBook, setUserBook] = useState<UserBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    loadBook();
  }, [route.params.bookId]);

  const loadBook = async () => {
    const books = await getUserBooks();
    const book = books.find(b => b.bookId === route.params.bookId);
    setUserBook(book || null);
    setLoading(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Book',
      'Are you sure you want to remove this book from your library?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteUserBook(route.params.bookId);
            navigation.goBack();
          },
        },
      ],
    );
  };

  const handleShare = () => {
    if (userBook && userBook.status === 'completed') {
      shareBookCompletion(userBook);
    }
  };

  const handleStartReading = async () => {
    if (!userBook) return;
    
    const updatedBook: UserBook = {
      ...userBook,
      status: 'reading',
      startDate: new Date().toISOString(),
    };
    
    await saveUserBook(updatedBook);
    await loadBook(); // Reload to show updated status
    
    Alert.alert(
      '📖 Started Reading',
      `"${userBook.book.title}" has been moved to In Progress!`,
      [{text: 'OK'}]
    );
  };


  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!userBook) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Book not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={styles.coverContainer}>
        {userBook.book.coverUrl ? (
          <Image
            source={{uri: userBook.book.coverUrl}}
            style={styles.coverImage}
          />
        ) : (
          <View style={[styles.coverImage, styles.placeholderCover, {backgroundColor: colors.borderLight}]}>
            <Text style={styles.placeholderText}>📚</Text>
          </View>
        )}
      </View>

      <View style={[styles.content, {backgroundColor: colors.surface}]}>
        <Text style={[styles.title, {color: colors.text}]}>{userBook.book.title}</Text>
        <Text style={[styles.author, {color: colors.textSecondary}]}>{userBook.book.author}</Text>

        <View style={[styles.statusBadge, {backgroundColor: colors.primaryLight}]}>
          <Text style={[styles.statusText, {color: colors.primary}]}>
            {userBook.status === 'reading' && '📖 Reading'}
            {userBook.status === 'completed' && '✅ Completed'}
            {userBook.status === 'want-to-read' && '📌 Want to Read'}
          </Text>
        </View>

        {userBook.status === 'reading' && (
          <View style={styles.progressSection}>
            <Text style={[styles.sectionTitle, {color: colors.text}]}>Reading Progress</Text>
            {userBook.goalEnabled && (
              <View style={[styles.goalInfo, {backgroundColor: colors.primaryLight}]}>
                <Icon name="flag" size={16} color={colors.primary} />
                <Text style={[styles.goalText, {color: colors.primary}]}>
                  {getGoalDescription(userBook.goalType, userBook.goalValue)}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={[styles.updateButton, {backgroundColor: colors.primary}]}
              onPress={() =>
                navigation.navigate('EditProgress', {userBook: userBook})
              }>
              <Icon name="create" size={20} color="white" />
              <Text style={styles.updateButtonText}>Update Progress</Text>
            </TouchableOpacity>
          </View>
        )}

        {userBook.status === 'want-to-read' && (
          <View style={styles.wantToReadSection}>
            <Text style={[styles.sectionTitle, {color: colors.text}]}>Ready to Start?</Text>
            <TouchableOpacity
              style={[styles.startReadingButton, {backgroundColor: colors.primary}]}
              onPress={handleStartReading}>
              <Icon name="book" size={20} color="white" />
              <Text style={styles.startReadingButtonText}>Start Reading</Text>
            </TouchableOpacity>
          </View>
        )}

        {userBook.status === 'completed' && (
          <View style={styles.completedSection}>
            <Text style={styles.sectionTitle}>Your Review</Text>
            {userBook.rating && (
              <View style={styles.ratingContainer}>
                <Rating
                  readonly
                  startingValue={userBook.rating}
                  imageSize={24}
                  tintColor="white"
                  ratingColor="#fbbf24"
                  ratingBackgroundColor="#e5e7eb"
                />
              </View>
            )}
            {userBook.comment && (
              <View style={styles.commentBox}>
                <Text style={styles.commentText}>{userBook.comment}</Text>
              </View>
            )}
            {userBook.completedDate && (
              <Text style={styles.completedDate}>
                Completed on {formatDate(userBook.completedDate)}
              </Text>
            )}
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}>
              <Icon name="share-social" size={20} color="white" />
              <Text style={styles.shareButtonText}>Share Achievement</Text>
            </TouchableOpacity>
          </View>
        )}

        {userBook.startDate && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Started:</Text>
              <Text style={styles.infoValue}>{formatDate(userBook.startDate)}</Text>
            </View>
            {userBook.book.publishedDate && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Published:</Text>
                <Text style={styles.infoValue}>{userBook.book.publishedDate}</Text>
              </View>
            )}
            {userBook.book.isbn && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>ISBN:</Text>
                <Text style={styles.infoValue}>{userBook.book.isbn}</Text>
              </View>
            )}
          </View>
        )}

        {userBook.book.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text 
              style={styles.descriptionText}
              numberOfLines={showFullDescription ? undefined : 4}>
              {userBook.book.description}
            </Text>
            <TouchableOpacity 
              onPress={() => setShowFullDescription(!showFullDescription)}
              style={styles.viewMoreButton}>
              <Text style={styles.viewMoreText}>
                {showFullDescription ? 'View Less' : 'View More'}
              </Text>
              <Icon 
                name={showFullDescription ? 'chevron-up' : 'chevron-down'} 
                size={16} 
                color="#6366f1" 
              />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}>
          <Icon name="trash" size={20} color="#ef4444" />
          <Text style={styles.deleteButtonText}>Remove from Library</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverContainer: {
    backgroundColor: 'white',
    alignItems: 'center',
    paddingVertical: 30,
  },
  coverImage: {
    width: 200,
    height: 300,
    borderRadius: 12,
  },
  placeholderCover: {
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 64,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  author: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 15,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  progressSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 15,
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  goalText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
    marginLeft: 8,
  },
  updateButton: {
    flexDirection: 'row',
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  wantToReadSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  startReadingButton: {
    flexDirection: 'row',
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  startReadingButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  markAsReadButton: {
    flexDirection: 'row',
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markAsReadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  completedSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  ratingContainer: {
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  commentBox: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  commentText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  completedDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 15,
  },
  shareButton: {
    flexDirection: 'row',
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 15,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
  },
  descriptionSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 8,
  },
  viewMoreText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
    marginRight: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
    marginBottom: 30,
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
  },
});

export default BookDetailScreen;
