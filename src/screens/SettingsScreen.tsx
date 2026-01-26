import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useTheme} from '../context/ThemeContext';
import {signOut} from '../services/authService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SettingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const {theme: colors, themeMode, setThemeMode, isDark} = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationTime, setNotificationTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedNotifications = await AsyncStorage.getItem('notificationsEnabled');
      const savedTime = await AsyncStorage.getItem('notificationTime');

      if (savedNotifications) {
        setNotificationsEnabled(savedNotifications === 'true');
      }
      if (savedTime) {
        setNotificationTime(new Date(savedTime));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'device') => {
    setThemeMode(newTheme);
  };

  const handleLogout = async () => {
    try {
      // Sign out from auth service (clears user session)
      await signOut();
      // Clear all local cached data
      await AsyncStorage.clear();
      // Navigate to Login screen and reset navigation stack
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  const handleNotificationToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem('notificationsEnabled', value.toString());
  };

  const handleTimeChange = async (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setNotificationTime(selectedTime);
      await AsyncStorage.setItem('notificationTime', selectedTime.toISOString());
      Alert.alert(
        'Time Updated',
        `Notification time set to ${selectedTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`
      );
    }
  };

  return (
    <ScrollView style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.header, {backgroundColor: colors.surface, borderBottomColor: colors.border}]}>
        <Icon name="settings" size={40} color={colors.primary} />
        <Text style={[styles.headerTitle, {color: colors.text}]}>Settings</Text>
        <Text style={[styles.headerSubtitle, {color: colors.textSecondary}]}>Customize your reading experience</Text>
      </View>

      {/* Theme Section */}
      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <View style={styles.sectionHeader}>
          <Icon name="color-palette" size={24} color={colors.primary} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Theme</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.optionButton,
            {borderColor: colors.border},
            themeMode === 'light' && {borderColor: colors.primary, backgroundColor: colors.primaryLight}
          ]}
          onPress={() => handleThemeChange('light')}>
          <Icon name="sunny" size={24} color={themeMode === 'light' ? colors.primary : colors.textSecondary} />
          <Text style={[
            styles.optionText,
            {color: colors.textSecondary},
            themeMode === 'light' && {color: colors.primary, fontWeight: '600'}
          ]}>
            Light Mode
          </Text>
          {themeMode === 'light' && <Icon name="checkmark-circle" size={24} color={colors.primary} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionButton,
            {borderColor: colors.border},
            themeMode === 'dark' && {borderColor: colors.primary, backgroundColor: colors.primaryLight}
          ]}
          onPress={() => handleThemeChange('dark')}>
          <Icon name="moon" size={24} color={themeMode === 'dark' ? colors.primary : colors.textSecondary} />
          <Text style={[
            styles.optionText,
            {color: colors.textSecondary},
            themeMode === 'dark' && {color: colors.primary, fontWeight: '600'}
          ]}>
            Dark Mode
          </Text>
          {themeMode === 'dark' && <Icon name="checkmark-circle" size={24} color={colors.primary} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionButton,
            {borderColor: colors.border},
            themeMode === 'device' && {borderColor: colors.primary, backgroundColor: colors.primaryLight}
          ]}
          onPress={() => handleThemeChange('device')}>
          <Icon name="phone-portrait" size={24} color={themeMode === 'device' ? colors.primary : colors.textSecondary} />
          <Text style={[
            styles.optionText,
            {color: colors.textSecondary},
            themeMode === 'device' && {color: colors.primary, fontWeight: '600'}
          ]}>
            Device Default
          </Text>
          {themeMode === 'device' && <Icon name="checkmark-circle" size={24} color={colors.primary} />}
        </TouchableOpacity>
      </View>

      {/* Notifications Section */}
      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <View style={styles.sectionHeader}>
          <Icon name="notifications" size={24} color={colors.primary} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Notifications</Text>
        </View>
        <Text style={[styles.sectionDescription, {color: colors.textSecondary}]}>
          Manage your reading reminders
        </Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, {color: colors.text}]}>Enable Notifications</Text>
            <Text style={[styles.settingSubtext, {color: colors.textSecondary}]}>
              Receive daily reading reminders
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleNotificationToggle}
            trackColor={{
              false: isDark ? '#39424E' : '#D1D5DB',
              true: isDark ? '#0A84FF' : '#34C759'
            }}
            thumbColor='#FFFFFF'
            ios_backgroundColor={isDark ? '#39424E' : '#D1D5DB'}
            style={{transform: [{scaleX: 0.9}, {scaleY: 0.9}]}}
          />
        </View>

        {notificationsEnabled && (
          <View style={[styles.timeSection, {borderTopColor: colors.border}]}>
            <Text style={[styles.timeLabel, {color: colors.text}]}>Notification Time</Text>
            <TouchableOpacity
              style={[styles.timeButton, {backgroundColor: colors.background, borderColor: colors.border}]}
              onPress={() => setShowTimePicker(true)}>
              <Icon name="time" size={20} color={colors.primary} />
              <Text style={[styles.timeText, {color: colors.text}]}>
                {notificationTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
              </Text>
              <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={notificationTime}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}
          </View>
        )}
      </View>

      {/* Account Section */}
      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <View style={styles.sectionHeader}>
          <Icon name="person-circle" size={24} color={colors.primary} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Account</Text>
        </View>
        
        <Text style={[styles.sectionDescription, {color: colors.textSecondary}]}>
          Manage your account settings
        </Text>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}>
          <View style={styles.logoutButtonContent}>
            <Icon name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* About Section */}
      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <View style={styles.sectionHeader}>
          <Icon name="information-circle" size={24} color={colors.primary} />
          <Text style={[styles.sectionTitle, {color: colors.text}]}>About</Text>
        </View>
        
        <View style={[styles.infoRow, {borderBottomColor: colors.borderLight}]}>
          <Text style={[styles.infoLabel, {color: colors.textSecondary}]}>Version</Text>
          <Text style={[styles.infoValue, {color: colors.text}]}>1.0.0</Text>
        </View>
        
        <View style={[styles.infoRow, {borderBottomColor: colors.borderLight}]}>
          <Text style={[styles.infoLabel, {color: colors.textSecondary}]}>Build</Text>
          <Text style={[styles.infoValue, {color: colors.text}]}>2026.01.06</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: 'white',
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    backgroundColor: 'white',
    marginTop: 20,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginBottom: 12,
    gap: 12,
  },
  optionButtonActive: {
    borderColor: '#6366f1',
    backgroundColor: '#eef2ff',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#6366f1',
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  settingSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  timeSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  timeText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    borderRadius: 16,
    marginTop: 8,
    shadowColor: '#ef4444',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: 'white',
  },
  logoutButtonSubtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
});

export default SettingsScreen;
