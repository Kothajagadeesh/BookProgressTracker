import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {useTheme} from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const GENRES = [
  'Art',
  'Biography',
  'Business',
  'Chick Lit',
  "Children's",
  'Christian',
  'Classics',
  'Comics',
  'Contemporary',
  'Cookbooks',
  'Crime',
  'Ebooks',
  'Fantasy',
  'Fiction',
  'Gay and Lesbian',
  'Graphic Novels',
  'Historical Fiction',
  'History',
  'Horror',
  'Humor and Comedy',
  'Manga',
  'Memoir',
  'Music',
  'Mystery',
  'Nonfiction',
  'Paranormal',
  'Philosophy',
  'Poetry',
  'Psychology',
  'Religion',
  'Romance',
  'Science',
  'Science Fiction',
  'Self Help',
  'Suspense',
  'Spirituality',
  'Sports',
  'Thriller',
  'Travel',
  'Young Adult',
];

interface GenreSelectionScreenProps {
  route?: {
    params?: {
      isFirstTime?: boolean;
    };
  };
}

const GenreSelectionScreen: React.FC<GenreSelectionScreenProps> = ({route}) => {
  const navigation = useNavigation<NavigationProp>();
  const {theme: colors} = useTheme();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const isFirstTime = route?.params?.isFirstTime ?? true;

  useEffect(() => {
    loadSavedGenres();
  }, []);

  const loadSavedGenres = async () => {
    try {
      const saved = await AsyncStorage.getItem('favoriteGenres');
      if (saved) {
        setSelectedGenres(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading genres:', error);
    }
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => {
      if (prev.includes(genre)) {
        return prev.filter(g => g !== genre);
      } else {
        return [...prev, genre];
      }
    });
  };

  const handleContinue = async () => {
    if (selectedGenres.length === 0) {
      Alert.alert(
        'Select Genres',
        'Please select at least one genre to continue.',
      );
      return;
    }

    try {
      await AsyncStorage.setItem(
        'favoriteGenres',
        JSON.stringify(selectedGenres),
      );
      await AsyncStorage.setItem('genreSelectionComplete', 'true');

      if (isFirstTime) {
        navigation.replace('MainTabs');
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error saving genres:', error);
      Alert.alert('Error', 'Failed to save your preferences. Please try again.');
    }
  };

  const handleSkip = () => {
    if (isFirstTime) {
      navigation.replace('MainTabs');
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          {!isFirstTime && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          )}
          <Text style={[styles.title, {color: colors.text}]}>
            {isFirstTime
              ? 'Next, select your favorite genres.'
              : 'Update your favorite genres'}
          </Text>
          <Text style={[styles.subtitle, {color: colors.textSecondary}]}>
            We use your favorite genres to make better book recommendations and
            tailor what you see in your Updates feed.
          </Text>
        </View>

        {/* Genre Grid */}
        <View style={styles.genreGrid}>
          {GENRES.map(genre => {
            const isSelected = selectedGenres.includes(genre);
            return (
              <TouchableOpacity
                key={genre}
                style={[
                  styles.genreCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                onPress={() => toggleGenre(genre)}>
                <View style={styles.genreContent}>
                  <View
                    style={[
                      styles.checkbox,
                      {
                        borderColor: isSelected
                          ? colors.primary
                          : colors.border,
                        backgroundColor: isSelected
                          ? colors.primary
                          : 'transparent',
                      },
                    ]}>
                    {isSelected && (
                      <Icon name="checkmark" size={16} color="white" />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.genreText,
                      {
                        color: isSelected ? colors.primary : colors.text,
                        fontWeight: isSelected ? '600' : '400',
                      },
                    ]}>
                    {genre}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Info Message */}
        <View
          style={[
            styles.infoBox,
            {backgroundColor: colors.primary + '15', borderColor: colors.primary + '30'},
          ]}>
          <Icon name="information-circle" size={20} color={colors.primary} />
          <Text style={[styles.infoText, {color: colors.text}]}>
            Don't see your favorite genres here? You can always update your
            preferences later from your profile.
          </Text>
        </View>

        {/* Selected Count */}
        {selectedGenres.length > 0 && (
          <Text style={[styles.selectedCount, {color: colors.textSecondary}]}>
            {selectedGenres.length} genre{selectedGenres.length !== 1 ? 's' : ''}{' '}
            selected
          </Text>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, {backgroundColor: colors.surface}]}>
        {isFirstTime && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={[styles.skipText, {color: colors.textSecondary}]}>
              Skip for now
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.continueButton,
            {
              backgroundColor:
                selectedGenres.length > 0 ? colors.primary : colors.border,
            },
          ]}
          onPress={handleContinue}
          disabled={selectedGenres.length === 0}>
          <Text style={styles.continueText}>
            {isFirstTime ? 'Continue' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 16,
    width: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  genreCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 4,
  },
  genreContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genreText: {
    fontSize: 15,
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  selectedCount: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 34,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GenreSelectionScreen;
