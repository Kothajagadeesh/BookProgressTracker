import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ThemeProvider, useTheme} from '../context/ThemeContext';

// Screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BookDetailScreen from '../screens/BookDetailScreen';
import AddBookScreen from '../screens/AddBookScreen';
import EditProgressScreen from '../screens/EditProgressScreen';
import ShelfScreen from '../screens/ShelfScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ChallengesScreen from '../screens/ChallengesScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import SuggestionsScreen from '../screens/SuggestionsScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  ProfileSetup: undefined;
  MainTabs: undefined;
  BookDetail: {bookId: string};
  AddBook: {book: any};
  EditProgress: {userBook: any};
  Shelf: {filter: 'completed' | 'reading' | 'want-to-read'};
  Search: {query?: string} | undefined;
  Profile: undefined;
  Suggestions: {book: any};
};

export type TabParamList = {
  Home: undefined;
  MyShelf: undefined;
  Dashboard: undefined;
  Challenges: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => {
  const {theme, isDark} = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName: string;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Dashboard') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'MyShelf') {
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === 'Challenges') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.tabBarInactive,
        tabBarStyle: {
          backgroundColor: theme.tabBarBackground,
          borderTopColor: theme.border,
        },
        headerShown: false,
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen 
        name="MyShelf" 
        component={ShelfScreen} 
        options={{
          title: 'My Shelf',
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Challenges" component={ChallengesScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const MainNavigator = () => {
  const {theme} = useTheme();
  const [isProfileSetup, setIsProfileSetup] = useState<boolean | null>(null);

  useEffect(() => {
    checkProfileSetup();
  }, []);

  const checkProfileSetup = async () => {
    try {
      const setupComplete = await AsyncStorage.getItem('profileSetupComplete');
      setIsProfileSetup(setupComplete === 'true');
    } catch (error) {
      setIsProfileSetup(false);
    }
  };

  if (isProfileSetup === null) {
    return null; // Loading
  }

  return (
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.surface,
          },
          headerTintColor: theme.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerShadowVisible: true,
          headerBackTitleVisible: false,
        }}>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Signup"
          component={SignupScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ProfileSetup"
          component={ProfileSetupScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="BookDetail"
          component={BookDetailScreen}
          options={{title: 'Book Details'}}
        />
        <Stack.Screen
          name="AddBook"
          component={AddBookScreen}
          options={{title: 'Add Book'}}
        />
        <Stack.Screen
          name="EditProgress"
          component={EditProgressScreen}
          options={{title: 'Edit Progress'}}
        />
        <Stack.Screen
          name="Shelf"
          component={ShelfScreen}
          options={{title: 'My Shelf'}}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{title: 'Search Books'}}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{title: 'Profile'}}
        />
        <Stack.Screen
          name="Suggestions"
          component={SuggestionsScreen}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return (
      <ThemeProvider>
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <NavigationContainer>
        <MainNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
};

export default AppNavigator;
