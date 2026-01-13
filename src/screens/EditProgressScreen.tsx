import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {saveUserBook} from '../storage/storage';
import {UserBook} from '../types';
import {updateBookNotification} from '../services/notificationService';
import {shareBookCompletion} from '../utils/shareUtils';
import {calculateProgress} from '../utils/dateUtils';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../context/ThemeContext';
import {Rating} from 'react-native-ratings';

type EditProgressRouteProp = RouteProp<RootStackParamList, 'EditProgress'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const EditProgressScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EditProgressRouteProp>();
  const {theme: colors} = useTheme();
  const originalBook: UserBook = route.params.userBook;

  const [currentPage, setCurrentPage] = useState(
    (originalBook.currentPage || 0).toString(),
  );
  const [goalEnabled, setGoalEnabled] = useState(originalBook.goalEnabled);
  const [goalType, setGoalType] = useState<'duration' | 'pages'>(
    originalBook.goalType || 'pages',
  );
  const [goalValue, setGoalValue] = useState(
    (originalBook.goalValue || 10).toString(),
  );
  const [isCompleted, setIsCompleted] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSave = async () => {
    const updatedBook: UserBook = {
      ...originalBook,
      currentPage: parseInt(currentPage) || 0,
      goalEnabled: goalEnabled,
      goalType: goalEnabled ? goalType : undefined,
      goalValue: goalEnabled ? parseInt(goalValue) : undefined,
    };

    await saveUserBook(updatedBook);
    updateBookNotification(updatedBook);
    navigation.goBack();
  };

  const handleMarkAsCompleted = () => {
    setIsCompleted(true);
  };

  const handleCompleteBook = async () => {
    const completedBook: UserBook = {
      ...originalBook,
      status: 'completed',
      completedDate: new Date().toISOString(),
      rating: rating || undefined,
      comment: comment || undefined,
    };

    await saveUserBook(completedBook);

    Alert.alert(
      '🎉 Congratulations!',
      'You completed the book! Would you like to share your achievement?',
      [
        {
          text: 'Not Now', 
          onPress: () => navigation.navigate('Suggestions', {book: originalBook.book})
        },
        {
          text: 'Share',
          onPress: async () => {
            await shareBookCompletion(completedBook);
            navigation.navigate('Suggestions', {book: originalBook.book});
          },
        },
      ],
    );
  };

  if (isCompleted) {
    return (
      <ScrollView style={[styles.container, {backgroundColor: colors.background}]}>
        <View style={[styles.completionHeader, {backgroundColor: colors.surface}]}>
          <Text style={styles.completionEmoji}>🎉</Text>
          <Text style={[styles.completionTitle, {color: colors.text}]}>Book Completed!</Text>
          <Text style={[styles.completionSubtitle, {color: colors.textSecondary}]}>
            Share your thoughts about "{originalBook.book.title}"
          </Text>
        </View>

        <View style={[styles.section, {backgroundColor: colors.surface}]}>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Rate this book</Text>
          <View style={styles.ratingContainer}>
            <Rating
              type="custom"
              startingValue={0}
              onFinishRating={setRating}
              imageSize={40}
              tintColor={colors.surface}
              ratingColor="#fbbf24"
              ratingBackgroundColor={colors.placeholder}
              style={{paddingVertical: 10}}
            />
          </View>
        </View>

        <View style={[styles.section, {backgroundColor: colors.surface}]}>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Your review (optional)</Text>
          <TextInput
            style={[styles.commentInput, {backgroundColor: colors.background, borderColor: colors.border, color: colors.text}]}
            placeholder="What did you think about this book?"
            placeholderTextColor={colors.textTertiary}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity style={[styles.saveButton, {backgroundColor: colors.primary}]} onPress={handleCompleteBook}>
          <Icon name="checkmark-circle" size={24} color="white" />
          <Text style={styles.saveButtonText}>Complete Book</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.bookInfo, {backgroundColor: colors.surface}]}>
        <Text style={[styles.bookTitle, {color: colors.text}]}>{originalBook.book.title}</Text>
        <Text style={[styles.bookAuthor, {color: colors.textSecondary}]}>{originalBook.book.author}</Text>
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>Current Progress</Text>
        <View style={styles.progressInputContainer}>
          <TextInput
            style={styles.pageInput}
            value={currentPage}
            onChangeText={setCurrentPage}
            keyboardType="number-pad"
            placeholder="0"
          />
          <Text style={styles.pageInputLabel}>pages read</Text>
        </View>

        <View style={styles.quickButtons}>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => {
              const current = parseInt(currentPage) || 0;
              setCurrentPage((current + 10).toString());
            }}>
            <Text style={styles.quickButtonText}>+10 pages</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => {
              const current = parseInt(currentPage) || 0;
              setCurrentPage((current + 25).toString());
            }}>
            <Text style={styles.quickButtonText}>+25 pages</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => {
              const current = parseInt(currentPage) || 0;
              setCurrentPage((current + 50).toString());
            }}>
            <Text style={styles.quickButtonText}>+50 pages</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.goalHeader}>
          <Text style={styles.sectionTitle}>Reading Goal</Text>
          <Switch
            value={goalEnabled}
            onValueChange={setGoalEnabled}
            trackColor={{false: '#d1d5db', true: '#a5b4fc'}}
            thumbColor={goalEnabled ? '#6366f1' : '#f3f4f6'}
          />
        </View>
        {goalEnabled && (
          <>
            <View style={styles.goalTypeButtons}>
              <TouchableOpacity
                style={[
                  styles.goalTypeButton,
                  goalType === 'pages' && styles.goalTypeButtonActive,
                ]}
                onPress={() => setGoalType('pages')}>
                <Text
                  style={[
                    styles.goalTypeText,
                    goalType === 'pages' && styles.goalTypeTextActive,
                  ]}>
                  Pages per Day
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.goalTypeButton,
                  goalType === 'duration' && styles.goalTypeButtonActive,
                ]}
                onPress={() => setGoalType('duration')}>
                <Text
                  style={[
                    styles.goalTypeText,
                    goalType === 'duration' && styles.goalTypeTextActive,
                  ]}>
                  Complete in Months
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={goalValue}
                onChangeText={setGoalValue}
                keyboardType="number-pad"
                placeholder={goalType === 'pages' ? '10' : '2'}
              />
              <Text style={styles.inputLabel}>
                {goalType === 'pages' ? 'pages per day' : 'months'}
              </Text>
            </View>
            <View style={styles.notificationInfo}>
              <Icon name="notifications" size={18} color="#6366f1" />
              <Text style={styles.notificationText}>
                Daily reminders at 6:00 AM
              </Text>
            </View>
          </>
        )}
      </View>

      <TouchableOpacity style={styles.completeButton} onPress={handleMarkAsCompleted}>
        <Icon name="checkmark-circle" size={24} color="white" />
        <Text style={styles.completeButtonText}>Mark as Completed</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Icon name="save" size={24} color="white" />
        <Text style={styles.saveButtonText}>Save Progress</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  bookInfo: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  bookAuthor: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 15,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  progressInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  pageInput: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
    minWidth: 100,
    textAlign: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 10,
  },
  pageInputLabel: {
    fontSize: 18,
    color: '#6b7280',
    marginLeft: 15,
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
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 15,
  },
  quickButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  quickButton: {
    flex: 1,
    backgroundColor: '#ede9fe',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickButtonText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalTypeButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  goalTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  goalTypeButtonActive: {
    borderColor: '#6366f1',
    backgroundColor: '#ede9fe',
  },
  goalTypeText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '600',
  },
  goalTypeTextActive: {
    color: '#6366f1',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  input: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    minWidth: 60,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 10,
  },
  notificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ede9fe',
    padding: 12,
    borderRadius: 8,
  },
  notificationText: {
    fontSize: 13,
    color: '#6366f1',
    marginLeft: 8,
    flex: 1,
  },
  completionHeader: {
    backgroundColor: 'white',
    padding: 40,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  completionEmoji: {
    fontSize: 64,
    marginBottom: 15,
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  completionSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  ratingContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  commentInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#1f2937',
    minHeight: 120,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#6366f1',
    marginHorizontal: 20,
    marginVertical: 30,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  completeButton: {
    flexDirection: 'row',
    backgroundColor: '#10b981',
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 10,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default EditProgressScreen;
