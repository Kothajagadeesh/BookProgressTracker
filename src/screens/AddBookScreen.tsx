import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Animated,
} from 'react-native';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {saveUserBook} from '../storage/storage';
import {UserBook, Book} from '../types';
import {scheduleDailyNotification} from '../services/notificationService';
import {shareBookStart} from '../utils/shareUtils';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../context/ThemeContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import ToastNotification from '../components/ToastNotification';

type AddBookRouteProp = RouteProp<RootStackParamList, 'AddBook'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AddBookScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AddBookRouteProp>();
  const {theme: colors} = useTheme();
  const book: Book = route.params.book;

  const [status, setStatus] = useState<'reading' | 'completed' | 'want-to-read'>('reading');
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [goalEnabled, setGoalEnabled] = useState(false);
  const [goalType, setGoalType] = useState<'duration' | 'pages'>('pages');
  const [goalValue, setGoalValue] = useState('10');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation when screen loads
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSave = async () => {
    const userBook: UserBook = {
      bookId: book.id,
      book: book,
      status: status,
      startDate: status === 'reading' ? startDate.toISOString() : undefined,
      completedDate: status === 'completed' ? new Date().toISOString() : undefined,
      goalEnabled: status === 'reading' ? goalEnabled : false,
      goalType: goalEnabled ? goalType : undefined,
      goalValue: goalEnabled ? parseInt(goalValue) : undefined,
      currentPage: 0,
    };

    await saveUserBook(userBook);

    // Schedule notification if goal is enabled
    if (status === 'reading' && goalEnabled) {
      scheduleDailyNotification(userBook);
    }

    // Show success notification
    const statusMessages = {
      'reading': 'Book added to **In Progress**!',
      'completed': 'Book added to **Books Read**!',
      'want-to-read': 'Book added to **Want to Read**!',
    };
    setToastMessage(statusMessages[status]);
    setToastVisible(true);

    // Offer to share only if status is completed
    if (status === 'completed') {
      setTimeout(() => {
        Alert.alert(
          'Share Your Achievement',
          'Would you like to share that you completed this book?',
          [
            {
              text: 'Not Now', 
              onPress: () => navigation.navigate('Suggestions', {book: book})
            },
            {
              text: 'Share',
              onPress: async () => {
                await shareBookStart(userBook);
                navigation.navigate('Suggestions', {book: book});
              },
            },
          ],
        );
      }, 1000);
    } else {
      setTimeout(() => {
        navigation.navigate('MainTabs');
      }, 2000);
    }
  };

  return (
    <View style={[styles.wrapper, {backgroundColor: colors.background}]}>
      <ToastNotification
        visible={toastVisible}
        message={toastMessage}
        type="success"
        onDismiss={() => setToastVisible(false)}
      />
      <Animated.ScrollView 
        style={[styles.container, {opacity: fadeAnim}]}>
        <View style={[styles.bookHeader, {backgroundColor: colors.surface}]}>
        {book.coverUrl ? (
          <Image source={{uri: book.coverUrl}} style={styles.coverImage} />
        ) : (
          <View style={[styles.coverImage, styles.placeholderCover, {backgroundColor: colors.borderLight}]}>
            <Text style={styles.placeholderText}>📚</Text>
          </View>
        )}
        <View style={styles.bookInfo}>
          <Text style={[styles.title, {color: colors.text}]} numberOfLines={3}>
            {book.title}
          </Text>
          <Text style={[styles.author, {color: colors.textSecondary}]} numberOfLines={2}>
            {book.author}
          </Text>
          {book.isbn && (
            <Text style={[styles.isbn, {color: colors.textTertiary}]}>ISBN: {book.isbn}</Text>
          )}
        </View>
      </View>

      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>Reading Status</Text>
        <View style={styles.statusButtons}>
          <TouchableOpacity
            style={[
              styles.statusButton,
              status === 'want-to-read' && styles.statusButtonActive,
            ]}
            onPress={() => setStatus('want-to-read')}>
            <Text
              style={[
                styles.statusButtonText,
                status === 'want-to-read' && styles.statusButtonTextActive,
              ]}>
              📌 Want to Read
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.statusButton,
              status === 'reading' && styles.statusButtonActive,
            ]}
            onPress={() => setStatus('reading')}>
            <Text
              style={[
                styles.statusButtonText,
                status === 'reading' && styles.statusButtonTextActive,
              ]}>
              📖 Reading
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.statusButton,
              status === 'completed' && styles.statusButtonActive,
            ]}
            onPress={() => setStatus('completed')}>
            <Text
              style={[
                styles.statusButtonText,
                status === 'completed' && styles.statusButtonTextActive,
              ]}>
              ✅ Completed
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {status === 'reading' && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Start Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}>
              <Icon name="calendar" size={20} color="#6366f1" />
              <Text style={styles.dateText}>
                {startDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setStartDate(selectedDate);
                  }
                }}
                maximumDate={new Date()}
              />
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.goalHeader}>
              <Text style={styles.sectionTitle}>Set Reading Goal</Text>
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
                    You'll receive daily reminders at 6:00 AM
                  </Text>
                </View>
              </>
            )}
          </View>
        </>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Icon name="checkmark-circle" size={24} color="white" />
        <Text style={styles.saveButtonText}>Add to Shelf</Text>
      </TouchableOpacity>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  bookHeader: {
    backgroundColor: 'white',
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  coverImage: {
    width: 100,
    height: 150,
    borderRadius: 8,
    marginRight: 15,
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
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  author: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 8,
  },
  isbn: {
    fontSize: 13,
    color: '#9ca3af',
  },
  pages: {
    fontSize: 13,
    color: '#9ca3af',
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
  statusButtons: {
    gap: 10,
  },
  statusButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  statusButtonActive: {
    borderColor: '#6366f1',
    backgroundColor: '#ede9fe',
  },
  statusButtonText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '600',
  },
  statusButtonTextActive: {
    color: '#6366f1',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  dateText: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 10,
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
});

export default AddBookScreen;
