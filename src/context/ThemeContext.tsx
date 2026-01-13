import React, {createContext, useState, useContext, useEffect, ReactNode} from 'react';
import {useColorScheme} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'device';

type Theme = {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  primary: string;
  primaryLight: string;
  border: string;
  borderLight: string;
  error: string;
  success: string;
  warning: string;
  placeholder: string;
  shadow: string;
  tabBarBackground: string;
  tabBarInactive: string;
};

const lightTheme: Theme = {
  background: '#f9fafb',
  surface: '#ffffff',
  card: '#ffffff',
  text: '#1f2937',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  primary: '#6366f1',
  primaryLight: '#eef2ff',
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  error: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
  placeholder: '#d1d5db',
  shadow: '#000000',
  tabBarBackground: '#ffffff',
  tabBarInactive: '#6b7280',
};

const darkTheme: Theme = {
  background: '#111827',
  surface: '#1f2937',
  card: '#374151',
  text: '#f9fafb',
  textSecondary: '#d1d5db',
  textTertiary: '#9ca3af',
  primary: '#818cf8',
  primaryLight: '#312e81',
  border: '#4b5563',
  borderLight: '#374151',
  error: '#f87171',
  success: '#34d399',
  warning: '#fbbf24',
  placeholder: '#6b7280',
  shadow: '#000000',
  tabBarBackground: '#1f2937',
  tabBarInactive: '#9ca3af',
};

type ThemeContextType = {
  theme: Theme;
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({children}: {children: ReactNode}) => {
  const deviceColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('device');
  
  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setThemeModeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await AsyncStorage.setItem('theme', mode);
  };

  const getEffectiveTheme = (): Theme => {
    if (themeMode === 'device') {
      return deviceColorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return themeMode === 'dark' ? darkTheme : lightTheme;
  };

  const isDark = themeMode === 'dark' || (themeMode === 'device' && deviceColorScheme === 'dark');

  return (
    <ThemeContext.Provider
      value={{
        theme: getEffectiveTheme(),
        themeMode,
        isDark,
        setThemeMode,
      }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
