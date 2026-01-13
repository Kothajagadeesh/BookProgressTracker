import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  Modal,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../context/ThemeContext';
import LinearGradient from 'react-native-linear-gradient';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const GENDER_OPTIONS = ['Male', 'Female', 'Others', 'Prefer not to share'];

const ProfileSetupScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const {theme: colors} = useTheme();
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!gender) {
      Alert.alert('Error', 'Please select your gender');
      return;
    }

    if (!dateOfBirth) {
      Alert.alert('Error', 'Please select your date of birth');
      return;
    }

    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    
    // Get default badges
    const DEFAULT_BADGES = [
      {id: '1', name: 'Beginner', description: 'Read 25 books', booksRequired: 25, icon: '📚', earned: false},
      {id: '2', name: 'Bookworm', description: 'Read 50 books', booksRequired: 50, icon: '🐛', earned: false},
      {id: '3', name: 'Scholar', description: 'Read 75 books', booksRequired: 75, icon: '🎓', earned: false},
      {id: '4', name: 'Expert', description: 'Read 100 books', booksRequired: 100, icon: '⭐', earned: false},
      {id: '5', name: 'Master', description: 'Read 150 books', booksRequired: 150, icon: '👑', earned: false},
      {id: '6', name: 'Legend', description: 'Read 200 books', booksRequired: 200, icon: '🏆', earned: false},
      {id: '7', name: 'Ultimate', description: 'Read 500 books', booksRequired: 500, icon: '💎', earned: false},
    ];

    const userProfile = {
      id: 'user-1',
      name: name.trim(),
      email: '',
      gender: gender,
      dateOfBirth: dateOfBirth.toISOString(),
      booksCompleted: 0,
      booksReading: 0,
      badges: DEFAULT_BADGES,
      joinedDate: new Date().toISOString(),
    };

    await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
    await AsyncStorage.setItem('profileSetupComplete', 'true');
    
    // Navigate to main app
    navigation.replace('MainTabs');
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Select Date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <ScrollView style={[styles.container, {backgroundColor: colors.background}]}>
      <LinearGradient
        colors={[colors.primary, '#8b5cf6']}
        style={styles.header}>
        <Icon name="book" size={60} color="white" />
        <Text style={styles.headerTitle}>Welcome to Book Tracker!</Text>
        <Text style={styles.headerSubtitle}>Let's set up your profile</Text>
      </LinearGradient>

      <View style={[styles.formContainer, {backgroundColor: colors.surface}]}>
        <Text style={[styles.label, {color: colors.text}]}>Name *</Text>
        <TextInput
          style={[styles.input, {backgroundColor: colors.background, borderColor: colors.border, color: colors.text}]}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          placeholderTextColor={colors.textTertiary}
        />

        <Text style={[styles.label, {color: colors.text}]}>Gender *</Text>
        <TouchableOpacity
          style={[styles.dropdownButton, {backgroundColor: colors.background, borderColor: colors.border}]}
          onPress={() => setShowGenderPicker(true)}>
          <Text style={[styles.dropdownText, {color: colors.text}, !gender && {color: colors.textTertiary}]}>
            {gender || 'Select Gender'}
          </Text>
          <Icon name="chevron-down" size={20} color={colors.primary} />
        </TouchableOpacity>

        <Text style={[styles.label, {color: colors.text}]}>Date of Birth *</Text>
        <TouchableOpacity
          style={[styles.dateButton, {backgroundColor: colors.background, borderColor: colors.border}]}
          onPress={() => setShowDatePicker(true)}>
          <Icon name="calendar" size={20} color={colors.primary} />
          <Text style={[styles.dateButtonText, {color: colors.text}]}>{formatDate(dateOfBirth)}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={dateOfBirth || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveProfile}>
          <Text style={styles.saveButtonText}>Get Started</Text>
        </TouchableOpacity>
      </View>

      {/* Gender Picker Modal */}
      <Modal
        visible={showGenderPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGenderPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Gender</Text>
            {GENDER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.optionButton}
                onPress={() => {
                  setGender(option);
                  setShowGenderPicker(false);
                }}>
                <Text style={styles.optionText}>{option}</Text>
                {gender === option && (
                  <Icon name="checkmark" size={24} color="#6366f1" />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowGenderPicker(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dropdownText: {
    fontSize: 16,
    color: '#374151',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 10,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  saveButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 40,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '50%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
});

export default ProfileSetupScreen;
