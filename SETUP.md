# 🚀 Setup Guide - Book Progress Tracker

This guide will help you set up and run the Book Progress Tracker app on your local machine.

## 📋 Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** or **yarn**
   - npm comes with Node.js
   - For yarn: `npm install -g yarn`

3. **React Native CLI**
   ```bash
   npm install -g react-native-cli
   ```

### For Android Development

4. **Android Studio**
   - Download from: https://developer.android.com/studio
   - Install Android SDK (API Level 33)
   - Install Android SDK Build-Tools
   - Set up ANDROID_HOME environment variable

5. **JDK** (Java Development Kit 11 or higher)
   - Download from: https://www.oracle.com/java/technologies/downloads/

### For iOS Development (Mac only)

6. **Xcode** (14.0 or higher)
   - Download from Mac App Store
   - Install Command Line Tools: `xcode-select --install`

7. **CocoaPods**
   ```bash
   sudo gem install cocoapods
   ```

## 🛠️ Installation Steps

### 1. Clone or Navigate to Project Directory

```bash
cd /Users/jagadeesh.kotha/CascadeProjects/BookProgressTracker
```

### 2. Install Node Dependencies

```bash
npm install
# or
yarn install
```

This will install all required packages including:
- React Native
- Navigation libraries
- AsyncStorage
- Push notifications
- Vector icons
- And more...

### 3. iOS Setup (Mac only)

```bash
cd ios
pod install
cd ..
```

This installs all iOS native dependencies.

### 4. Link Vector Icons (if needed)

The project uses `react-native-vector-icons`. Make sure the fonts are properly linked:

**For Android:** Already configured in `android/app/build.gradle`

**For iOS:** Already configured in `Info.plist`

## 🏃 Running the App

### Start Metro Bundler

Open a terminal and run:

```bash
npm start
# or
yarn start
```

Keep this terminal open while developing.

### Run on Android

Open a **new terminal** and run:

```bash
npm run android
# or
yarn android
```

**Requirements:**
- Android emulator running OR
- Physical Android device connected via USB with USB debugging enabled

**Troubleshooting Android:**
```bash
# If you encounter build errors, try:
cd android
./gradlew clean
cd ..
npm run android
```

### Run on iOS (Mac only)

Open a **new terminal** and run:

```bash
npm run ios
# or
yarn ios
```

**To run on a specific simulator:**
```bash
npx react-native run-ios --simulator="iPhone 15 Pro"
```

**Troubleshooting iOS:**
```bash
# If you encounter pod errors:
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

## 🔧 Configuration

### Notification Permissions

The app requests notification permissions on first launch. Make sure to:

**Android:**
- Permissions are declared in `AndroidManifest.xml`
- Users will be prompted automatically

**iOS:**
- Permissions are requested via `react-native-push-notification`
- Users will see system prompt on first app launch

### API Configuration

The app uses two free APIs:
- **Open Library API**: No API key required
- **Google Books API**: No API key required (using public access)

If you hit rate limits, you can optionally add a Google Books API key:

1. Get a free API key from: https://console.cloud.google.com/
2. In `src/services/bookApi.ts`, add your key to the Google Books API URL

## 📱 Testing on Physical Devices

### Android Device

1. Enable Developer Options on your device
2. Enable USB Debugging
3. Connect device via USB
4. Run: `adb devices` to verify connection
5. Run: `npm run android`

### iOS Device (Mac only)

1. Open `ios/BookProgressTracker.xcworkspace` in Xcode
2. Select your device as the target
3. Sign the app with your Apple Developer account
4. Click Run button in Xcode

## 🐛 Common Issues & Solutions

### Issue: Metro bundler port already in use

```bash
# Kill the process on port 8081
npx react-native start --reset-cache
```

### Issue: Build failed due to node_modules

```bash
# Clean and reinstall
rm -rf node_modules
npm install
# or
yarn install
```

### Issue: Android build fails

```bash
cd android
./gradlew clean
./gradlew assembleDebug
cd ..
```

### Issue: iOS build fails

```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

### Issue: Vector icons not displaying

```bash
# Rebuild the app completely
npm start -- --reset-cache
# Then run android/ios again
```

### Issue: Notifications not working

**Android:**
- Check that all permissions are granted in device settings
- Verify SCHEDULE_EXACT_ALARM permission (Android 12+)

**iOS:**
- Check notification permissions in device settings
- Ensure Info.plist has proper configuration

## 🔍 Debugging

### React Native Debugger

1. Install React Native Debugger
2. Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android)
3. Select "Debug"

### View Logs

**Android:**
```bash
npx react-native log-android
```

**iOS:**
```bash
npx react-native log-ios
```

## 📦 Building for Production

### Android APK

```bash
cd android
./gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/release/app-release.apk`

### iOS Archive

1. Open `ios/BookProgressTracker.xcworkspace` in Xcode
2. Select "Any iOS Device" as target
3. Product → Archive
4. Follow Xcode's distribution wizard

## 🎨 Customization

### Change App Colors

Edit `src/screens/*Screen.tsx` files and update color values:
- Primary: `#6366f1` (Indigo)
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Amber)

### Change App Name

1. Edit `app.json` → `displayName`
2. Android: Edit `android/app/src/main/res/values/strings.xml`
3. iOS: Edit `ios/BookProgressTracker/Info.plist` → `CFBundleDisplayName`

### Change App Icon

1. Generate icons using a service like https://appicon.co/
2. Replace icons in:
   - Android: `android/app/src/main/res/mipmap-*/`
   - iOS: Add to Xcode project

## 📚 Additional Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [React Navigation Docs](https://reactnavigation.org/docs/getting-started)
- [Open Library API](https://openlibrary.org/developers/api)
- [Google Books API](https://developers.google.com/books/docs/v1/using)

## 🆘 Getting Help

If you encounter issues:

1. Check this setup guide
2. Search existing issues on GitHub
3. Check React Native troubleshooting docs
4. Create a new issue with:
   - Error message
   - Platform (iOS/Android)
   - React Native version
   - Steps to reproduce

---

**Happy Coding! 🚀📚**
