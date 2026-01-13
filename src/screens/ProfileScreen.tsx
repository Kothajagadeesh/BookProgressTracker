import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
  Platform,
  ActionSheetIOS,
  Modal,
  TextInput,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
import {getUserProfile, getBadges, saveProfilePicture, getProfilePicture} from '../storage/storage';
import {UserProfile, Badge} from '../types';
import {formatDate} from '../utils/dateUtils';
import {shareMilestone} from '../utils/shareUtils';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../context/ThemeContext';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const {theme: colors} = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [editNameModalVisible, setEditNameModalVisible] = useState(false);
  const [editedName, setEditedName] = useState('');

  const loadProfile = async () => {
    const userProfile = await getUserProfile();
    setProfile(userProfile);
    const picture = await getProfilePicture();
    setProfilePicture(picture);
  };

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const handleChangeProfilePicture = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        buttonIndex => {
          if (buttonIndex === 1) {
            openCamera();
          } else if (buttonIndex === 2) {
            openImageLibrary();
          }
        },
      );
    } else {
      Alert.alert(
        'Change Profile Picture',
        'Choose an option',
        [
          {text: 'Take Photo', onPress: openCamera},
          {text: 'Choose from Library', onPress: openImageLibrary},
          {text: 'Cancel', style: 'cancel'},
        ],
      );
    }
  };

  const openCamera = () => {
    launchCamera(
      {
        mediaType: 'photo',
        cameraType: 'front',
        quality: 0.8,
      },
      response => {
        if (response.assets && response.assets[0].uri) {
          const uri = response.assets[0].uri;
          setProfilePicture(uri);
          saveProfilePicture(uri);
        }
      },
    );
  };

  const openImageLibrary = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      response => {
        if (response.assets && response.assets[0].uri) {
          const uri = response.assets[0].uri;
          setProfilePicture(uri);
          saveProfilePicture(uri);
        }
      },
    );
  };

  const handleEditName = () => {
    if (profile) {
      setEditedName(profile.name);
      setEditNameModalVisible(true);
    }
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    if (profile) {
      const updatedProfile = {...profile, name: editedName.trim()};
      setProfile(updatedProfile);
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      setEditNameModalVisible(false);
      Alert.alert('Success', 'Name updated successfully!');
    }
  };

  const handleShareBadge = (badge: Badge) => {
    if (badge.earned) {
      shareMilestone(badge.name, badge.booksRequired);
    } else {
      Alert.alert(
        'Badge Not Earned',
        `Complete ${badge.booksRequired} books to earn this badge!`,
      );
    }
  };

  const renderBadge = (badge: Badge) => (
    <TouchableOpacity
      key={badge.id}
      style={[
        styles.badgeCard,
        !badge.earned && styles.badgeCardLocked,
      ]}
      onPress={() => handleShareBadge(badge)}>
      <View style={styles.badgeIconContainer}>
        <Text style={[styles.badgeIcon, !badge.earned && styles.badgeIconLocked]}>
          {badge.icon}
        </Text>
        {badge.earned && (
          <View style={styles.earnedBadge}>
            <Icon name="checkmark-circle" size={20} color="#10b981" />
          </View>
        )}
      </View>
      <Text style={[styles.badgeName, !badge.earned && styles.badgeTextLocked]}>
        {badge.name}
      </Text>
      <Text style={[styles.badgeRequirement, !badge.earned && styles.badgeTextLocked]}>
        {badge.booksRequired} books
      </Text>
      {badge.earned && badge.earnedDate && (
        <Text style={styles.earnedDate}>
          Earned {formatDate(badge.earnedDate)}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const earnedBadges = profile.badges.filter(b => b.earned);
  const lockedBadges = profile.badges.filter(b => !b.earned);

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.background}]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
        <LinearGradient
          colors={[colors.primary, '#8b5cf6']}
          style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {profile.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.nameContainer}>
          <Text style={styles.profileName}>{profile.name}</Text>
          <TouchableOpacity onPress={handleEditName} style={styles.editIconButton}>
            <Icon name="create-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
        <Text style={styles.joinedDate}>
          Member since {formatDate(profile.joinedDate)}
        </Text>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, {backgroundColor: colors.surface}]}>
          <Icon name="book" size={32} color={colors.primary} />
          <Text style={[styles.statNumber, {color: colors.text}]}>{profile.booksCompleted}</Text>
          <Text style={[styles.statLabel, {color: colors.textSecondary}]}>Books Completed</Text>
        </View>
        <View style={[styles.statCard, {backgroundColor: colors.surface}]}>
          <Icon name="hourglass" size={32} color="#f59e0b" />
          <Text style={[styles.statNumber, {color: colors.text}]}>{profile.booksReading}</Text>
          <Text style={[styles.statLabel, {color: colors.textSecondary}]}>Currently Reading</Text>
        </View>
        <View style={[styles.statCard, {backgroundColor: colors.surface}]}>
          <Icon name="trophy" size={32} color="#10b981" />
          <Text style={[styles.statNumber, {color: colors.text}]}>{earnedBadges.length}</Text>
          <Text style={[styles.statLabel, {color: colors.textSecondary}]}>Badges Earned</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>🏆 Achievements</Text>
        <Text style={[styles.sectionSubtitle, {color: colors.textSecondary}]}>
          {earnedBadges.length} of {profile.badges.length} earned • Tap to share
        </Text>

        {earnedBadges.length > 0 && (
          <View style={styles.badgesSection}>
            <Text style={styles.badgesSectionTitle}>Earned Badges</Text>
            <View style={styles.badgesGrid}>
              {earnedBadges.map(renderBadge)}
            </View>
          </View>
        )}

        {lockedBadges.length > 0 && (
          <View style={styles.badgesSection}>
            <Text style={styles.badgesSectionTitle}>Locked Badges</Text>
            <View style={styles.badgesGrid}>
              {lockedBadges.map(renderBadge)}
            </View>
          </View>
        )}
      </View>

      {/* Edit Name Modal */}
      <Modal
        visible={editNameModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditNameModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Name</Text>
            
            <TextInput
              style={styles.nameInput}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Enter your name"
              placeholderTextColor="#9ca3af"
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditNameModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveName}>
                <Text style={styles.saveButtonText}>Save</Text>
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
    backgroundColor: '#f5f5f5',
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: 'white',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  profileName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  editIconButton: {
    marginLeft: 10,
    padding: 5,
  },
  joinedDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: -30,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginHorizontal: 20,
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  createChallengeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  createChallengeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  badgesSection: {
    marginTop: 15,
  },
  badgesSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
  },
  badgeCard: {
    width: '30%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    margin: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeCardLocked: {
    opacity: 0.5,
  },
  badgeIconContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  badgeIcon: {
    fontSize: 40,
  },
  badgeIconLocked: {
    opacity: 0.5,
  },
  earnedBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeRequirement: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
  },
  badgeTextLocked: {
    color: '#9ca3af',
  },
  earnedDate: {
    fontSize: 10,
    color: '#10b981',
    textAlign: 'center',
    marginTop: 4,
  },
  statsDetailCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  statsLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  statsValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
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
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
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
    backgroundColor: '#6366f1',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
