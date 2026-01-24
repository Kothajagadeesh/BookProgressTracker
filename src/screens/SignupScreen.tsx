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
import {signUp, checkUsernameAvailability, checkEmailAvailability} from '../services/authService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SignupScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const {theme: colors} = useTheme();
  
  const [name, setName] = useState('');
  // const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  // const [checkingUsername, setCheckingUsername] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  
  const [nameError, setNameError] = useState('');
  // const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [touched, setTouched] = useState({
    name: false,
    // username: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const handleNameChange = (text: string) => {
    setName(text);
    if (touched.name) {
      if (!text.trim()) {
        setNameError('Name is required');
      } else {
        setNameError('');
      }
    }
  };

  // const handleUsernameChange = async (text: string) => {
  //   // Remove spaces and special characters, allow only alphanumeric and underscore
  //   const cleanText = text.toLowerCase().replace(/[^a-z0-9_]/g, '');
  //   setUsername(cleanText);
  //   
  //   if (!cleanText.trim()) {
  //     setUsernameError('Username is required');
  //     return;
  //   }
  //   
  //   if (cleanText.length < 3) {
  //     setUsernameError('Username must be at least 3 characters');
  //     return;
  //   }
  //   
  //   // Check username availability
  //   setCheckingUsername(true);
  //   setUsernameError('');
  //   
  //   try {
  //     const isAvailable = await checkUsernameAvailability(cleanText);
  //     if (!isAvailable) {
  //       setUsernameError('Username is already taken');
  //     } else {
  //       setUsernameError('');
  //     }
  //   } catch (error) {
  //     console.error('Error checking username:', error);
  //   } finally {
  //     setCheckingUsername(false);
  //   }
  // };

  const handleEmailChange = async (text: string) => {
    setEmail(text);
    
    if (!text.trim()) {
      setEmailError('Email is required');
      return;
    }
    
    if (!validateEmail(text)) {
      setEmailError('Please enter a valid email');
      return;
    }
    
    // Check email availability - disabled until Firebase is configured
    // if (touched.email) {
    //   setCheckingEmail(true);
    //   setEmailError('');
    //   
    //   try {
    //     const isAvailable = await checkEmailAvailability(text);
    //     if (!isAvailable) {
    //       setEmailError('Email is already registered');
    //     } else {
    //       setEmailError('');
    //     }
    //   } catch (error) {
    //     console.error('Error checking email:', error);
    //   } finally {
    //     setCheckingEmail(false);
    //   }
    // }
    setEmailError('');
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (touched.password) {
      if (!text) {
        setPasswordError('Password is required');
      } else if (text.length < 8) {
        setPasswordError('Password must be at least 8 characters');
      } else {
        setPasswordError('');
      }
    }
    if (touched.confirmPassword && confirmPassword) {
      if (text !== confirmPassword) {
        setConfirmPasswordError('Passwords do not match');
      } else {
        setConfirmPasswordError('');
      }
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (touched.confirmPassword) {
      if (!text) {
        setConfirmPasswordError('Please confirm your password');
      } else if (text !== password) {
        setConfirmPasswordError('Passwords do not match');
      } else {
        setConfirmPasswordError('');
      }
    }
  };

  const handleSignup = async () => {
    setTouched({
      name: true,
      // username: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    let hasError = false;

    if (!name.trim()) {
      setNameError('Name is required');
      hasError = true;
    }

    // if (!username.trim()) {
    //   setUsernameError('Username is required');
    //   hasError = true;
    // } else if (username.length < 3) {
    //   setUsernameError('Username must be at least 3 characters');
    //   hasError = true;
    // }

    if (!email.trim()) {
      setEmailError('Email is required');
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    } else if (!validatePassword(password)) {
      setPasswordError('Password must be at least 8 characters');
      hasError = true;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, name);
      Alert.alert(
        'Success',
        'Account created! Please check your email to verify your account before logging in.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error: any) {
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please log in.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      }
      
      Alert.alert('Signup Failed', errorMessage);
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
          <Icon name="book" size={60} color="white" />
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>Start tracking your reading journey</Text>
        </LinearGradient>

        {/* Form */}
        <View style={[styles.formContainer, {backgroundColor: colors.surface}]}>
          
          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, {color: colors.text}]}>Full Name</Text>
            <View style={[styles.inputWrapper, {backgroundColor: colors.background, borderColor: colors.border}]}>
              <Icon name="person-outline" size={20} color={colors.textTertiary} />
              <TextInput
                style={[styles.input, {color: colors.text}]}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textTertiary}
                value={name}
                onChangeText={handleNameChange}
                onBlur={() => setTouched({...touched, name: true})}
                autoCapitalize="words"
              />
            </View>
            {nameError && touched.name && (
              <Text style={[styles.errorText, {color: '#ef4444'}]}>{nameError}</Text>
            )}
          </View>

          {/* Username Input - Commented out for now */}
          {/* <View style={styles.inputContainer}>
            <Text style={[styles.label, {color: colors.text}]}>Username</Text>
            <View style={[styles.inputWrapper, {backgroundColor: colors.background, borderColor: colors.border}]}>
              <Icon name="at-outline" size={20} color={colors.textTertiary} />
              <TextInput
                style={[styles.input, {color: colors.text}]}
                placeholder="Choose a username"
                placeholderTextColor={colors.textTertiary}
                value={username}
                onChangeText={handleUsernameChange}
                onBlur={() => setTouched({...touched, username: true})}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {checkingUsername && (
                <ActivityIndicator size="small" color={colors.primary} />
              )}
              {!checkingUsername && username.length >= 3 && !usernameError && (
                <Icon name="checkmark-circle" size={20} color="#10b981" />
              )}
            </View>
            {usernameError && touched.username ? (
              <Text style={[styles.errorText, {color: '#ef4444'}]}>{usernameError}</Text>
            ) : (
              <Text style={[styles.hint, {color: colors.textTertiary}]}>
                Lowercase letters, numbers, and underscores only
              </Text>
            )}
          </View> */}

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, {color: colors.text}]}>Email</Text>
            <View style={[styles.inputWrapper, {backgroundColor: colors.background, borderColor: colors.border}]}>
              <Icon name="mail-outline" size={20} color={colors.textTertiary} />
              <TextInput
                style={[styles.input, {color: colors.text}]}
                placeholder="Enter your email"
                placeholderTextColor={colors.textTertiary}
                value={email}
                onChangeText={handleEmailChange}
                onBlur={() => setTouched({...touched, email: true})}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {checkingEmail && (
                <ActivityIndicator size="small" color={colors.primary} />
              )}
              {!checkingEmail && email.length > 0 && validateEmail(email) && !emailError && touched.email && (
                <Icon name="checkmark-circle" size={20} color="#10b981" />
              )}
            </View>
            {emailError && touched.email && (
              <Text style={[styles.errorText, {color: '#ef4444'}]}>{emailError}</Text>
            )}
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, {color: colors.text}]}>Password</Text>
            <View style={[styles.inputWrapper, {backgroundColor: colors.background, borderColor: colors.border}]}>
              <Icon name="lock-closed-outline" size={20} color={colors.textTertiary} />
              <TextInput
                style={[styles.input, {color: colors.text}]}
                placeholder="Enter your password"
                placeholderTextColor={colors.textTertiary}
                value={password}
                onChangeText={handlePasswordChange}
                onBlur={() => setTouched({...touched, password: true})}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon 
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'} 
                  size={20} 
                  color={colors.textTertiary} 
                />
              </TouchableOpacity>
            </View>
            {passwordError && touched.password ? (
              <Text style={[styles.errorText, {color: '#ef4444'}]}>{passwordError}</Text>
            ) : (
              <Text style={[styles.hint, {color: colors.textTertiary}]}>
                At least 8 characters
              </Text>
            )}
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, {color: colors.text}]}>Confirm Password</Text>
            <View style={[styles.inputWrapper, {backgroundColor: colors.background, borderColor: colors.border}]}>
              <Icon name="lock-closed-outline" size={20} color={colors.textTertiary} />
              <TextInput
                style={[styles.input, {color: colors.text}]}
                placeholder="Confirm your password"
                placeholderTextColor={colors.textTertiary}
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                onBlur={() => setTouched({...touched, confirmPassword: true})}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Icon 
                  name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} 
                  size={20} 
                  color={colors.textTertiary} 
                />
              </TouchableOpacity>
            </View>
            {confirmPasswordError && touched.confirmPassword && (
              <Text style={[styles.errorText, {color: '#ef4444'}]}>{confirmPasswordError}</Text>
            )}
          </View>

          {/* Signup Button */}
          <TouchableOpacity
            style={[styles.signupButton, {backgroundColor: colors.primary}]}
            onPress={handleSignup}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.signupButtonText}>Create Account</Text>
                <Icon name="arrow-forward" size={20} color="white" />
              </>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, {color: colors.textSecondary}]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.loginLink, {color: colors.primary}]}>
                Log In
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
    paddingTop: 60,
    paddingBottom: 40,
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
    marginTop: 8,
    textAlign: 'center',
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
    marginBottom: 20,
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
  hint: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  signupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  signupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SignupScreen;
