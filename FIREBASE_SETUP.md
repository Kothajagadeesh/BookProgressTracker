# Firebase Integration Guide

This guide will walk you through setting up Firebase Authentication for your Book Progress Tracker app.

## Prerequisites

- Node.js and npm installed
- React Native development environment set up
- Xcode (for iOS) and Android Studio (for Android)

## Step 1: Install Firebase Dependencies

The required packages are already in your `package.json`:

```bash
npm install @react-native-firebase/app @react-native-firebase/auth
```

Or if using yarn:

```bash
yarn add @react-native-firebase/app @react-native-firebase/auth
```

## Step 2: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `BookProgressTracker` (or your preferred name)
4. Enable/disable Google Analytics (optional)
5. Click **"Create project"**

## Step 3: Enable Authentication

1. In Firebase Console, go to **Build** → **Authentication**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable **"Email/Password"** provider
5. Click **"Save"**

## Step 4: iOS Configuration

### 4.1 Register iOS App

1. In Firebase Console, click the iOS icon to add an iOS app
2. Enter iOS bundle ID: `org.reactjs.native.example.BookProgressTracker`
   - Find this in `ios/BookProgressTracker/Info.plist` under `CFBundleIdentifier`
3. Enter App nickname (optional): `BookProgressTracker iOS`
4. Enter App Store ID (optional, leave blank for now)
5. Click **"Register app"**

### 4.2 Download GoogleService-Info.plist

1. Download the `GoogleService-Info.plist` file
2. Open Xcode: `open ios/BookProgressTracker.xcworkspace`
3. Drag `GoogleService-Info.plist` into the project in Xcode
   - Make sure to add it to the `BookProgressTracker` folder
   - Check **"Copy items if needed"**
   - Select **"BookProgressTracker"** target

### 4.3 Initialize Firebase in iOS

The initialization is already handled by `@react-native-firebase/app`. No additional code needed!

### 4.4 Install iOS Pods

```bash
cd ios
pod install
cd ..
```

## Step 5: Android Configuration

### 5.1 Register Android App

1. In Firebase Console, click the Android icon to add an Android app
2. Enter Android package name: `com.bookprogresstracker`
   - Find this in `android/app/build.gradle` under `applicationId`
3. Enter App nickname (optional): `BookProgressTracker Android`
4. Enter Debug signing certificate SHA-1 (optional for now)
5. Click **"Register app"**

### 5.2 Download google-services.json

1. Download the `google-services.json` file
2. Move it to: `android/app/google-services.json`

```bash
# From your project root
mv ~/Downloads/google-services.json android/app/
```

### 5.3 Configure Android Build Files

The configuration should already be in place, but verify:

**android/build.gradle:**
```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```

**android/app/build.gradle:**
```gradle
apply plugin: 'com.android.application'
apply plugin: 'com.google.gms.google-services' // Add this line at the bottom
```

## Step 6: Rebuild Your App

### For iOS:

```bash
# Clean build
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..

# Run app
npx react-native run-ios
```

### For Android:

```bash
# Clean build
cd android
./gradlew clean
cd ..

# Run app
npx react-native run-android
```

## Step 7: Test Authentication

1. **Start Metro bundler:**
   ```bash
   npx react-native start --reset-cache
   ```

2. **Test Signup Flow:**
   - Open the app (should show Login screen)
   - Click "Don't have an account? Sign up"
   - Fill in:
     - Full Name: `Test User`
     - Username: `testuser123`
     - Email: `test@example.com`
     - Password: `password123` (min 8 characters)
     - Confirm Password: `password123`
   - Click "Create Account"
   - Should see success message and navigate to Login

3. **Test Login Flow:**
   - Enter email: `test@example.com`
   - Enter password: `password123`
   - Click "Login"
   - Should navigate to main app

4. **Test Forgot Password:**
   - On Login screen, click "Forgot Password?"
   - Enter email: `test@example.com`
   - Click "Send Reset Link"
   - Check email for password reset link

5. **Test Logout:**
   - Navigate to Settings tab
   - Scroll down and click "Logout"
   - Confirm logout
   - Should return to Login screen

## Verify in Firebase Console

1. Go to Firebase Console → Authentication → Users
2. You should see your test user listed with:
   - Email
   - User UID
   - Created date
   - Sign-in provider: Email/Password

## Troubleshooting

### iOS Issues

**Error: "No Firebase App '[DEFAULT]' has been created"**
- Make sure `GoogleService-Info.plist` is added to Xcode project
- Rebuild: `cd ios && pod install && cd ..`
- Clean build in Xcode: Product → Clean Build Folder

**Error: "Module not found: @react-native-firebase/app"**
- Run: `cd ios && pod install && cd ..`
- Restart Metro: `npx react-native start --reset-cache`

### Android Issues

**Error: "google-services.json is missing"**
- Verify file location: `android/app/google-services.json`
- Make sure filename is exactly `google-services.json`

**Error: "Default FirebaseApp is not initialized"**
- Check `google-services.json` is in correct location
- Verify `apply plugin: 'com.google.gms.google-services'` is in `android/app/build.gradle`
- Clean build: `cd android && ./gradlew clean && cd ..`

### Common Issues

**Email already in use:**
- Firebase automatically prevents duplicate emails
- Use a different email or delete the user from Firebase Console

**Weak password:**
- Firebase requires minimum 6 characters (we enforce 8)
- Use a stronger password

**Network error:**
- Check internet connection
- Verify Firebase project is active in console

## Security Best Practices

1. **Never commit Firebase config files to public repos:**
   - Add to `.gitignore`:
     ```
     ios/GoogleService-Info.plist
     android/app/google-services.json
     ```

2. **Enable Email Verification (Optional):**
   - In Firebase Console → Authentication → Settings
   - Enable email verification for new signups

3. **Set up Password Policy (Optional):**
   - In Firebase Console → Authentication → Settings
   - Configure password requirements

4. **Monitor Authentication:**
   - Check Firebase Console → Authentication → Users regularly
   - Review sign-in methods and activity

## Next Steps

1. **Add Firestore (Optional):**
   - Store user profiles, usernames, book data
   - Enable in Firebase Console → Build → Firestore Database

2. **Add Cloud Storage (Optional):**
   - Store user profile pictures, book covers
   - Enable in Firebase Console → Build → Storage

3. **Add Push Notifications (Optional):**
   - Use Firebase Cloud Messaging (FCM)
   - Enable in Firebase Console → Build → Cloud Messaging

4. **Add Analytics (Optional):**
   - Track user behavior and app usage
   - Enable in Firebase Console → Build → Analytics

## Support

- [React Native Firebase Documentation](https://rnfirebase.io/)
- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Console](https://console.firebase.google.com/)

---

**Your app is now ready to use Firebase Authentication!** 🎉

All authentication screens (Login, Signup, Forgot Password) are already implemented and will work once Firebase is configured.
