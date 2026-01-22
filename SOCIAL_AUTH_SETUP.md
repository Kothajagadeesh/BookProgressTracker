# Social Authentication Setup Guide

Complete guide to set up Apple Sign In and Google Sign In for Book Progress Tracker.

## 📦 Packages Installed

✅ `@react-native-google-signin/google-signin` - Google Sign In
✅ `@invertase/react-native-apple-authentication` - Apple Sign In

## 🔥 Firebase Configuration

### Enable Sign-In Methods in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Authentication** → **Sign-in method**
4. Enable the following providers:
   - ✅ **Email/Password** (already enabled)
   - ✅ **Google**
   - ✅ **Apple**

---

## 🍎 Apple Sign In Setup

### Step 1: Enable Apple Sign In Capability in Xcode

1. **Open Xcode:**
   ```bash
   cd ios
   open BookProgressTracker.xcworkspace
   ```

2. **Select your project** in the left sidebar (BookProgressTracker)

3. **Select the target** (BookProgressTracker under TARGETS)

4. **Go to "Signing & Capabilities" tab**

5. **Click "+ Capability"** button

6. **Search for and add "Sign in with Apple"**

### Step 2: Configure Apple Developer Account

1. Go to [Apple Developer Portal](https://developer.apple.com/account)

2. **Register an App ID:**
   - Go to **Certificates, Identifiers & Profiles** → **Identifiers**
   - Click **+** to create new identifier
   - Select **App IDs** → Continue
   - Description: `Book Progress Tracker`
   - Bundle ID: `com.bookprogresstracker` (explicit)
   - Scroll down and check **Sign in with Apple**
   - Click **Continue** → **Register**

3. **Create a Service ID** (for web/Firebase):
   - Go to **Identifiers** → Click **+**
   - Select **Services IDs** → Continue
   - Description: `Book Progress Tracker Auth`
   - Identifier: `com.bookprogresstracker.auth`
   - Check **Sign in with Apple**
   - Click **Configure** next to Sign in with Apple
   - Add your Firebase OAuth redirect URL (get from Firebase Console)
   - Click **Continue** → **Register**

### Step 3: Configure Firebase for Apple Sign In

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click on **Apple** provider
3. Click **Enable**
4. Enter your **Service ID**: `com.bookprogresstracker.auth`
5. **Team ID** and **Key ID**: Get from Apple Developer Portal
6. Upload your **Private Key** (.p8 file from Apple)
7. Click **Save**

### Step 4: Update Info.plist (if needed)

The Apple Sign In capability should automatically update your Info.plist. Verify it contains:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.bookprogresstracker</string>
    </array>
  </dict>
</array>
```

---

## 🔴 Google Sign In Setup

### Step 1: Get Google Web Client ID from Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Project Settings** (gear icon)
4. Scroll down to **Your apps** section
5. Find your **Web app** (or create one if it doesn't exist)
6. Copy the **Web client ID** (looks like: `123456789-abcdefg.apps.googleusercontent.com`)

### Step 2: Configure Google Sign In in Your App

Create a configuration file or add to your app initialization:

**In `App.tsx` or `index.js`, add:**

```typescript
import {GoogleSignin} from '@react-native-google-signin/google-signin';

// Configure Google Sign In
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID_FROM_FIREBASE.apps.googleusercontent.com',
  offlineAccess: true,
});
```

### Step 3: iOS Configuration

1. **Get iOS Client ID:**
   - In Firebase Console → Project Settings
   - Under **Your apps**, find your iOS app
   - Copy the **iOS client ID**

2. **Update Info.plist:**
   ```bash
   open ios/BookProgressTracker/Info.plist
   ```

   Add the following (replace with your reversed client ID):

   ```xml
   <key>CFBundleURLTypes</key>
   <array>
     <dict>
       <key>CFBundleTypeRole</key>
       <string>Editor</string>
       <key>CFBundleURLSchemes</key>
       <array>
         <string>com.googleusercontent.apps.YOUR-CLIENT-ID</string>
       </array>
     </dict>
   </array>
   ```

   The reversed client ID format: `com.googleusercontent.apps.123456789-abcdefg`

3. **Install Pods:**
   ```bash
   cd ios
   pod install
   cd ..
   ```

### Step 4: Android Configuration

1. **Get Android SHA-1 Certificate:**
   ```bash
   cd android
   ./gradlew signingReport
   ```

   Copy the **SHA-1** from the debug variant.

2. **Add SHA-1 to Firebase:**
   - Firebase Console → Project Settings
   - Scroll to **Your apps** → Android app
   - Click **Add fingerprint**
   - Paste your SHA-1 certificate

3. **Download google-services.json:**
   - Firebase Console → Project Settings
   - Download `google-services.json`
   - Place it in `android/app/`

---

## 🎨 UI Implementation

### Login Screen Updates

The LoginScreen now includes:

✅ **Apple Sign In button** (iOS only)
✅ **Google Sign In button** (iOS & Android)
✅ **Divider with "OR"** text
✅ **Themed buttons** matching your app design
✅ **Loading states** for all sign-in methods
✅ **Error handling** with user-friendly messages

### Button Appearance

**Apple Sign In:**
- Black Apple logo icon
- "Continue with Apple" text
- Shows only on iOS devices

**Google Sign In:**
- Red Google logo icon
- "Continue with Google" text
- Shows on both iOS and Android

---

## 🔧 Code Implementation

### Auth Service Methods

**`src/services/authService.ts`** now includes:

```typescript
// Google Sign In
export const signInWithGoogle = async () => {
  // Handles Google OAuth flow
  // Returns Firebase user
}

// Apple Sign In
export const signInWithApple = async () => {
  // Handles Apple OAuth flow
  // Returns Firebase user
}
```

### Features

✅ **Automatic user profile creation**
✅ **Username generation** from email or name
✅ **Local storage** of user data (AsyncStorage)
✅ **Firebase authentication** integration
✅ **Error handling** with descriptive messages

---

## 🧪 Testing

### Test Apple Sign In (iOS only)

1. Run the app on a real iOS device or simulator (iOS 13+)
2. Tap "Continue with Apple"
3. Sign in with your Apple ID
4. Grant permissions
5. User should be logged in automatically

**Note:** Apple Sign In requires:
- iOS 13 or later
- Real device or simulator with Apple ID signed in
- Proper provisioning profile

### Test Google Sign In

1. Run the app on iOS or Android
2. Tap "Continue with Google"
3. Select your Google account
4. Grant permissions
5. User should be logged in automatically

**Note:** For Android, ensure:
- SHA-1 certificate is added to Firebase
- google-services.json is in place
- Google Play Services is available

---

## 🐛 Troubleshooting

### Apple Sign In Issues

**"Invalid client" error:**
- Verify Service ID in Firebase matches Apple Developer Portal
- Check Team ID and Key ID are correct
- Ensure Private Key (.p8) is uploaded to Firebase

**Button doesn't appear:**
- Check Platform.OS === 'ios' condition
- Verify capability is added in Xcode
- Ensure iOS version is 13+

### Google Sign In Issues

**"Developer Error" or "10":**
- Verify webClientId is correct (from Firebase Web app)
- Check SHA-1 certificate is added to Firebase
- Ensure google-services.json is up to date

**"Sign in cancelled" error:**
- User cancelled the sign-in flow
- This is normal behavior, no action needed

**"Network error":**
- Check internet connection
- Verify Firebase project is active
- Check Google Sign In is enabled in Firebase Console

---

## 📱 Build and Run

### iOS

```bash
# Install dependencies
cd ios
pod install
cd ..

# Run app
npx react-native run-ios
```

### Android

```bash
# Clean build
cd android
./gradlew clean
cd ..

# Run app
npx react-native run-android
```

---

## 🔐 Security Best Practices

1. **Never commit:**
   - `google-services.json` (Android)
   - `GoogleService-Info.plist` (iOS)
   - Private keys (.p8 files)

2. **Use environment variables** for sensitive data

3. **Enable App Check** in Firebase for production

4. **Implement proper error handling** (already done)

5. **Test on real devices** before production release

---

## 📋 Checklist

### Firebase Setup
- [ ] Enable Google Sign In provider
- [ ] Enable Apple Sign In provider
- [ ] Configure OAuth redirect URLs
- [ ] Add SHA-1 certificate (Android)

### iOS Setup
- [ ] Add "Sign in with Apple" capability in Xcode
- [ ] Configure App ID in Apple Developer Portal
- [ ] Create Service ID for Apple Sign In
- [ ] Update Info.plist with URL schemes
- [ ] Install pods

### Android Setup
- [ ] Add google-services.json
- [ ] Add SHA-1 fingerprint to Firebase
- [ ] Configure Google Sign In

### Code Setup
- [ ] Configure GoogleSignin in App.tsx
- [ ] Test Apple Sign In (iOS)
- [ ] Test Google Sign In (iOS & Android)

---

## 🎉 You're All Set!

Your Book Progress Tracker app now supports:
- ✅ Email/Password authentication
- ✅ Apple Sign In (iOS)
- ✅ Google Sign In (iOS & Android)
- ✅ Forgot Password functionality
- ✅ Username validation
- ✅ Dark mode support

Users can now sign in with their preferred method! 🚀📚
