import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {getUserBooks, getUserProfile} from '../storage/storage';
import {UserBook} from '../types';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../context/ThemeContext';
import LinearGradient from 'react-native-linear-gradient';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ChallengesScreen = () => {
  const {theme: colors} = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [booksReadThisYear, setBooksReadThisYear] = useState(0);
  const [readingGoal, setReadingGoal] = useState(0);
  const [pagesGoal, setPagesGoal] = useState(0);
  const [hoursGoal, setHoursGoal] = useState(0);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [goalType, setGoalType] = useState<'books' | 'pages' | 'hours'>('books');
  const [goalInput, setGoalInput] = useState('');
  const [sharedChallenges, setSharedChallenges] = useState<any[]>([]);
  const [joinedChallenges, setJoinedChallenges] = useState<string[]>([]);
  const [createChallengeModalVisible, setCreateChallengeModalVisible] = useState(false);
  const [challengeName, setChallengeName] = useState('');
  const [challengeDescription, setChallengeDescription] = useState('');
  const [userName, setUserName] = useState('User');

  const loadChallenges = async () => {
    const books = await getUserBooks();
    const currentYear = new Date().getFullYear();
    
    const booksThisYear = books.filter(b => {
      if (b.status === 'completed' && b.completedDate) {
        const completedYear = new Date(b.completedDate).getFullYear();
        return completedYear === currentYear;
      }
      return false;
    }).length;

    setBooksReadThisYear(booksThisYear);

    // Load saved goals from AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const savedGoals = await AsyncStorage.getItem('readingGoals');
    if (savedGoals) {
      const goals = JSON.parse(savedGoals);
      setReadingGoal(goals.books || 0);
      setPagesGoal(goals.pages || 0);
      setHoursGoal(goals.hours || 0);
    }

    // Load shared challenges
    const savedChallenges = await AsyncStorage.getItem('sharedChallenges');
    if (savedChallenges) {
      const challenges = JSON.parse(savedChallenges);
      setSharedChallenges(challenges);
    }

    // Load user's joined challenges
    const userJoined = await AsyncStorage.getItem('joinedChallenges');
    if (userJoined) {
      setJoinedChallenges(JSON.parse(userJoined));
    }

    // Load user profile for name
    const userProfile = await getUserProfile();
    if (userProfile) {
      setUserName(userProfile.name);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadChallenges();
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChallenges();
    setRefreshing(false);
  };

  const handleOpenGoalModal = (type: 'books' | 'pages' | 'hours') => {
    setGoalType(type);
    setGoalInput('');
    setGoalModalVisible(true);
  };

  const handleSaveGoal = async () => {
    const value = parseInt(goalInput);
    if (!value || value <= 0) {
      Alert.alert('Error', 'Please enter a valid number');
      return;
    }

    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const savedGoals = await AsyncStorage.getItem('readingGoals');
    const goals = savedGoals ? JSON.parse(savedGoals) : {};

    if (goalType === 'books') {
      goals.books = value;
      setReadingGoal(value);
    } else if (goalType === 'pages') {
      goals.pages = value;
      setPagesGoal(value);
    } else {
      goals.hours = value;
      setHoursGoal(value);
    }

    await AsyncStorage.setItem('readingGoals', JSON.stringify(goals));
    setGoalModalVisible(false);
    Alert.alert('Success', `${goalType === 'books' ? 'Reading' : goalType === 'pages' ? 'Pages' : 'Hours'} goal set successfully!`);
  };

  const getGoalProgress = () => {
    if (readingGoal === 0) return 0;
    return Math.min((booksReadThisYear / readingGoal) * 100, 100);
  };

  const handleJoinChallenge = async (challengeId: string) => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    
    // Check if already joined
    if (joinedChallenges.includes(challengeId)) {
      Alert.alert('Already Joined', 'You have already joined this challenge!');
      return;
    }

    // Add to joined challenges
    const updatedJoined = [...joinedChallenges, challengeId];
    await AsyncStorage.setItem('joinedChallenges', JSON.stringify(updatedJoined));
    setJoinedChallenges(updatedJoined);

    // Update participant count
    const savedChallenges = await AsyncStorage.getItem('sharedChallenges');
    if (savedChallenges) {
      const challenges = JSON.parse(savedChallenges);
      const updatedChallenges = challenges.map((c: any) => {
        if (c.id === challengeId) {
          return {...c, participants: (c.participants || 0) + 1};
        }
        return c;
      });
      await AsyncStorage.setItem('sharedChallenges', JSON.stringify(updatedChallenges));
      setSharedChallenges(updatedChallenges);
    }

    Alert.alert('Success', 'You have joined the challenge!');
  };

  const handleOpenCreateChallenge = () => {
    setChallengeName('');
    setChallengeDescription('');
    setCreateChallengeModalVisible(true);
  };

  const handleSaveChallenge = async () => {
    if (!challengeName.trim()) {
      Alert.alert('Error', 'Please enter a challenge name');
      return;
    }
    if (!challengeDescription.trim()) {
      Alert.alert('Error', 'Please enter a challenge description');
      return;
    }

    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    
    // Save to shared challenges (accessible to all users)
    const savedChallenges = await AsyncStorage.getItem('sharedChallenges');
    const challenges = savedChallenges ? JSON.parse(savedChallenges) : [];
    
    const newChallenge = {
      id: Date.now().toString(),
      name: challengeName.trim(),
      description: challengeDescription.trim(),
      createdBy: userName,
      createdDate: new Date().toISOString(),
      participants: 0,
    };

    challenges.push(newChallenge);
    await AsyncStorage.setItem('sharedChallenges', JSON.stringify(challenges));
    setSharedChallenges(challenges);
    
    setCreateChallengeModalVisible(false);
    Alert.alert('Success', 'Challenge created and shared with the community!');
  };

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();

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
        <Text style={styles.headerTitle}>Reading Challenges</Text>
        <Text style={styles.headerSubtitle}>Set goals and track progress</Text>
      </LinearGradient>

      {/* 2026 Reading Goals Section */}
      <View style={styles.goalsCard}>
        <Text style={styles.goalsTitle}>{currentYear} Reading Goals</Text>
        {booksReadThisYear === 0 ? (
          <View style={styles.noBooksContainer}>
            <Text style={styles.goalsSubtitle}>
              You have not read any books this year, start your reading here
            </Text>
            <TouchableOpacity 
              style={styles.searchIconButton}
              onPress={() => navigation.navigate('Search', undefined)}>
              <Icon name="search" size={24} color="#14b8a6" />
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.goalsSubtitle}>
            You have read <Text style={styles.highlightText}>{booksReadThisYear} {booksReadThisYear === 1 ? 'book' : 'books'}</Text> this year.
          </Text>
        )}

        {readingGoal > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                {booksReadThisYear} of {readingGoal} books
              </Text>
              <Text style={styles.progressPercentage}>
                {Math.round(getGoalProgress())}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  {width: `${getGoalProgress()}%`}
                ]} 
              />
            </View>
          </View>
        )}

        <View style={styles.goalButtons}>
          <TouchableOpacity
            style={styles.goalButton}
            onPress={() => handleOpenGoalModal('books')}>
            <Icon name="book" size={20} color="white" />
            <Text style={styles.goalButtonText}>
              {readingGoal > 0 ? 'Update Reading Goal' : 'Set Reading Goal'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.goalButton}
            onPress={() => handleOpenGoalModal('pages')}>
            <Icon name="document-text" size={20} color="white" />
            <Text style={styles.goalButtonText}>
              {pagesGoal > 0 ? 'Update Pages Goal' : 'Set Pages Goal'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.goalButton}
            onPress={() => handleOpenGoalModal('hours')}>
            <Icon name="time" size={20} color="white" />
            <Text style={styles.goalButtonText}>
              {hoursGoal > 0 ? 'Update Hours Goal' : 'Set Hours Goal'}
            </Text>
          </TouchableOpacity>
        </View>

        {(readingGoal > 0 || pagesGoal > 0 || hoursGoal > 0) && (
          <View style={styles.goalsOverview}>
            {readingGoal > 0 && (
              <View style={styles.goalItem}>
                <Icon name="book" size={16} color="#6366f1" />
                <Text style={styles.goalItemText}>
                  {readingGoal} books goal
                </Text>
              </View>
            )}
            {pagesGoal > 0 && (
              <View style={styles.goalItem}>
                <Icon name="document-text" size={16} color="#10b981" />
                <Text style={styles.goalItemText}>
                  {pagesGoal} pages goal
                </Text>
              </View>
            )}
            {hoursGoal > 0 && (
              <View style={styles.goalItem}>
                <Icon name="time" size={16} color="#f59e0b" />
                <Text style={styles.goalItemText}>
                  {hoursGoal} hours goal
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Create Challenge Section */}
      <View style={styles.createChallengeSection}>
        <Text style={styles.createChallengeTitle}>Create Your Own Challenge</Text>
        <Text style={styles.createChallengeSubtitle}>
          Share your reading challenge with the community!
        </Text>
        <TouchableOpacity
          style={styles.createChallengeButton}
          onPress={handleOpenCreateChallenge}>
          <Icon name="add-circle" size={24} color="white" />
          <Text style={styles.createChallengeButtonText}>Create New Challenge</Text>
        </TouchableOpacity>
      </View>

      {/* Community Challenges */}
      {sharedChallenges.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Join a Community Challenge</Text>
          
          {sharedChallenges.map((challenge) => (
            <View key={challenge.id} style={styles.communityCard}>
              <View style={styles.communityCardHeader}>
                <Text style={styles.communityCardTitle}>{challenge.name}</Text>
                <View style={styles.participantsBadge}>
                  <Icon name="people" size={14} color="white" />
                  <Text style={styles.participantsText}>{challenge.participants || 0}</Text>
                </View>
              </View>
              <Text style={styles.communityCardDescription}>
                {challenge.description}
              </Text>
              <View style={styles.communityCardFooter}>
                <Text style={styles.communityCardCreator}>
                  <Icon name="person" size={14} color="#6b7280" /> Created by {challenge.createdBy}
                </Text>
                <TouchableOpacity 
                  style={[
                    styles.joinButton,
                    joinedChallenges.includes(challenge.id) && styles.joinedButton
                  ]}
                  onPress={() => handleJoinChallenge(challenge.id)}
                  disabled={joinedChallenges.includes(challenge.id)}>
                  <Text style={[
                    styles.joinButtonText,
                    joinedChallenges.includes(challenge.id) && styles.joinedButtonText
                  ]}>
                    {joinedChallenges.includes(challenge.id) ? 'Joined' : 'Join Challenge'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Goal Setting Modal */}
      <Modal
        visible={goalModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setGoalModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Set {goalType === 'books' ? 'Reading' : goalType === 'pages' ? 'Pages' : 'Hours'} Goal
            </Text>
            <Text style={styles.modalSubtitle}>
              How many {goalType} do you want to {goalType === 'hours' ? 'spend reading' : 'read'} in {currentYear}?
            </Text>
            
            <TextInput
              style={styles.goalInput}
              value={goalInput}
              onChangeText={setGoalInput}
              placeholder={`Enter number of ${goalType}`}
              placeholderTextColor="#9ca3af"
              keyboardType="number-pad"
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setGoalModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveGoal}>
                <Text style={styles.saveButtonText}>Save Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Challenge Modal */}
      <Modal
        visible={createChallengeModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateChallengeModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Challenge</Text>
            
            <Text style={styles.inputLabel}>Challenge Name</Text>
            <TextInput
              style={styles.nameInput}
              value={challengeName}
              onChangeText={setChallengeName}
              placeholder="e.g., Read 10 Books in 3 Months"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.nameInput, styles.descriptionInput]}
              value={challengeDescription}
              onChangeText={setChallengeDescription}
              placeholder="Describe your challenge..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setCreateChallengeModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveChallenge}>
                <Text style={styles.saveButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
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
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  goalsCard: {
    backgroundColor: '#1f2937',
    marginHorizontal: 15,
    marginTop: -15,
    marginBottom: 15,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 8,
    textAlign: 'center',
  },
  goalsSubtitle: {
    fontSize: 14,
    color: '#d1d5db',
    textAlign: 'center',
    marginBottom: 20,
  },
  noBooksContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  searchIconButton: {
    marginTop: 12,
    backgroundColor: '#374151',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightText: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#d1d5db',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  goalButtons: {
    gap: 10,
  },
  goalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#14b8a6',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  goalButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  goalsOverview: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    gap: 8,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalItemText: {
    fontSize: 14,
    color: '#d1d5db',
  },
  challengeCard: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  challengeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  challengeTextContainer: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14b8a6',
    marginBottom: 4,
  },
  challengeSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  section: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  communityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  communityCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  communityCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  participantsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  participantsText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  communityCardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  communityCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  communityCardDuration: {
    fontSize: 13,
    color: '#6b7280',
  },
  communityCardCreator: {
    fontSize: 13,
    color: '#6b7280',
  },
  joinButton: {
    backgroundColor: '#14b8a6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  joinedButton: {
    backgroundColor: '#9ca3af',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  joinedButtonText: {
    color: '#f3f4f6',
  },
  // Create Challenge Section Styles
  createChallengeSection: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createChallengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  createChallengeSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 15,
  },
  createChallengeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  createChallengeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  goalInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 20,
    textAlign: 'center',
  },
  nameInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 20,
  },
  descriptionInput: {
    minHeight: 100,
    paddingTop: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#14b8a6',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChallengesScreen;
