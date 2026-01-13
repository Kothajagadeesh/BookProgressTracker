import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../context/ThemeContext';
import {resetPassword} from '../services/authService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const {theme: colors} = useTheme();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [touched, setTouched] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    // Only validate if user has started typing (field has content or was touched)
    if (text.length > 0 || touched) {
      if (!text.trim()) {
        setEmailError('Email is required');
      } else if (!validateEmail(text)) {
        setEmailError('Please enter a valid email');
      } else {
        setEmailError('');
      }
    }
  };

  const handleResetPassword = async () => {
    setTouched(true);
    setSuccessMessage('');
    setErrorMessage('');

    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email);
      // Always show success message (security best practice - don't reveal if email exists)
      setSuccessMessage('If an account exists with this email address, you will receive password reset instructions shortly. Please check your inbox and spam folder.');
      setEmail('');
    } catch (error: any) {
      // Only show errors for rate limiting or invalid format, not for user-not-found
      if (error.code === 'auth/invalid-email') {
        setErrorMessage('Invalid email address format.');
      } else if (error.code === 'auth/too-many-requests') {
        setErrorMessage('Too many requests. Please try again later.');
      } else if (error.code === 'auth/user-not-found') {
        // Don't reveal that user doesn't exist - show same success message
        setSuccessMessage('If an account exists with this email address, you will receive password reset instructions shortly. Please check your inbox and spam folder.');
        setEmail('');
      } else {
        setErrorMessage('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, {backgroundColor: colors.background}]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <LinearGradient
          colors={[colors.primary, '#8b5cf6']}
          style={styles.header}>
          <Icon name="lock-closed" size={60} color="white" />
          <Text style={styles.headerTitle}>Forgot Password?</Text>
          <Text style={styles.headerSubtitle}>
            Enter your email and we'll send you instructions to reset your password
          </Text>
        </LinearGradient>

        {/* Form */}
        <View style={[styles.formContainer, {backgroundColor: colors.surface}]}>
          
          {/* Success Message */}
          {successMessage && (
            <View style={[styles.messageBox, styles.successBox]}>
              <Icon name="checkmark-circle" size={24} color="#10b981" />
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          )}

          {/* Error Message */}
          {errorMessage && (
            <View style={[styles.messageBox, styles.errorBox]}>
              <Icon name="alert-circle" size={24} color="#ef4444" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}
          
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, {color: colors.text}]}>Email Address</Text>
            <View style={[
              styles.inputWrapper, 
              {
                backgroundColor: colors.background, 
                borderColor: emailError && email.length > 0 ? '#ef4444' : colors.border,
                borderWidth: emailError && email.length > 0 ? 2 : 1,
              }
            ]}>
              <Icon name="mail-outline" size={20} color={emailError && email.length > 0 ? '#ef4444' : colors.textTertiary} />
              <TextInput
                style={[styles.input, {color: colors.text}]}
                placeholder="Enter your email"
                placeholderTextColor={colors.textTertiary}
                value={email}
                onChangeText={handleEmailChange}
                onBlur={() => setTouched(true)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
              {email.length > 0 && !emailError && (
                <Icon name="checkmark-circle" size={20} color="#10b981" />
              )}
            </View>
            {emailError && email.length > 0 && (
              <Text style={[styles.errorText, {color: '#ef4444'}]}>{emailError}</Text>
            )}
          </View>

          {/* Info Text */}
          <View style={[styles.infoBox, {backgroundColor: colors.primaryLight}]}>
            <Icon name="information-circle" size={20} color={colors.primary} />
            <Text style={[styles.infoText, {color: colors.primary}]}>
              You will receive an email with a link to reset your password. The link will expire in 1 hour.
            </Text>
          </View>

          {/* Reset Button */}
          <TouchableOpacity
            style={[styles.resetButton, {backgroundColor: colors.primary}]}
            onPress={handleResetPassword}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.resetButtonText}>Send Reset Link</Text>
                <Icon name="arrow-forward" size={20} color="white" />
              </>
            )}
          </TouchableOpacity>

          {/* Back to Login Link */}
          <View style={styles.backContainer}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={20} color={colors.primary} />
              <Text style={[styles.backText, {color: colors.primary}]}>
                Back to Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 80,
    paddingBottom: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    padding: 0,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  messageBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
    alignItems: 'flex-start',
  },
  successBox: {
    backgroundColor: '#d1fae5',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  successText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#065f46',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;
