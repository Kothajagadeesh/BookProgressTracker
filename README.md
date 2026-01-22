wd# 📚 Book Progress Tracker

A beautiful cross-platform mobile app for tracking your reading progress, setting reading goals, and earning badges for your reading achievements!

## ✨ Features

### 📖 Book Management
- **Search Books**: Search for any book using Open Library API and Google Books API
- **Track Reading**: Mark books as "Want to Read", "Reading", or "Completed"
- **Progress Tracking**: Track your current page and reading progress
- **Book Details**: View comprehensive book information including cover, author, pages, and description

### 🎯 Reading Goals
- **Flexible Goals**: Set goals by pages per day or completion duration (in months)
- **Daily Reminders**: Get notifications at 6:00 AM to keep you on track
- **Progress Visualization**: Beautiful progress bars to see how you're doing

### 🏆 Achievement System
- **7 Badges to Unlock**:
  - 📚 Bookworm (25 books)
  - 📖 Book Enthusiast (50 books)
  - 📕 Avid Reader (75 books)
  - 🏆 Century Reader (100 books)
  - 🌟 Master Reader (150 books)
  - 👑 Reading Legend (200 books)
  - 🎖️ Ultimate Bibliophile (500 books)

### 📱 Social Features
- **Share Progress**: Share when you start reading a book
- **Share Completions**: Share book completions with ratings and comments
- **Share Achievements**: Share badge achievements on social media

### ⭐ Reviews & Ratings
- **Rate Books**: Give star ratings (1-5) for completed books
- **Write Reviews**: Add personal comments and thoughts
- **Only for Completed Books**: Ensure authentic reviews

### 👤 Profile
- **Lifetime Statistics**: See total books completed and currently reading
- **Badge Collection**: View earned and locked badges
- **Reading Journey**: Track your reading milestones

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- React Native CLI
- For iOS: Xcode 15+, CocoaPods
- For Android: Android Studio, JDK 17, Android SDK 34

### Installation

1. **Clone and install dependencies**:
```bash
git clone <repository-url>
cd BookProgressTracker
npm install
```

2. **Firebase Setup** (Required for authentication):
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Email/Password authentication
   - Enable Firestore database
   
   **For Android:**
   - Download `google-services.json` from Firebase Console
   - Place it in `android/app/google-services.json`
   
   **For iOS:**
   - Download `GoogleService-Info.plist` from Firebase Console
   - Place it in `ios/BookProgressTracker/GoogleService-Info.plist`

---

## 📱 Running on Android

### Setup
```bash
# Ensure Android SDK 34 is installed
# Start Android emulator or connect device

# Check connected devices
adb devices
```

### Launch App
```bash
# Start Metro bundler (Terminal 1)
npx react-native start

# Run on Android (Terminal 2)
npx react-native run-android
```

### If Metro connection fails:
```bash
# Setup port forwarding
adb reverse tcp:8081 tcp:8081

# Or bundle JS into APK (works offline)
mkdir -p android/app/src/main/assets
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

# Then run
npx react-native run-android
```

---

## 🍎 Running on iOS

### Setup
```bash
cd ios

# Install CocoaPods dependencies (use Homebrew pod if system Ruby fails)
/opt/homebrew/bin/pod install
# or
pod install

cd ..
```

### Launch App
```bash
# Start Metro bundler (Terminal 1)
npx react-native start

# Run on iOS Simulator (Terminal 2)
npx react-native run-ios

# Run on specific simulator
npx react-native run-ios --simulator="iPhone 15 Pro"
```

### Troubleshooting iOS Build:
```bash
# Clean build if needed
cd ios
rm -rf Pods Podfile.lock
/opt/homebrew/bin/pod install
cd ..

# Clean Xcode derived data
rm -rf ~/Library/Developer/Xcode/DerivedData
```

---

## 📱 Platform Requirements

### Android
- Minimum SDK: 23 (Android 6.0)
- Target SDK: 34
- Compile SDK: 34
- Permissions: Internet, Notifications

### iOS
- Minimum iOS Version: 15.0
- Permissions: Notifications

## 🛠️ Tech Stack

- **Framework**: React Native 0.73.2
- **Language**: TypeScript
- **Navigation**: React Navigation v6
- **State Management**: React Hooks & AsyncStorage
- **APIs**: 
  - Open Library API
  - Google Books API
- **Key Libraries**:
  - react-native-push-notification (Daily reminders)
  - react-native-share (Social sharing)
  - react-native-vector-icons (Beautiful icons)
  - react-native-linear-gradient (Gradients)
  - react-native-ratings (Star ratings)
  - axios (API calls)

## 📂 Project Structure

```
BookProgressTracker/
├── src/
│   ├── components/          # Reusable UI components
│   ├── navigation/          # Navigation configuration
│   ├── screens/            # App screens
│   │   ├── HomeScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── BookDetailScreen.tsx
│   │   ├── AddBookScreen.tsx
│   │   └── EditProgressScreen.tsx
│   ├── services/           # API and notification services
│   │   ├── bookApi.ts
│   │   └── notificationService.ts
│   ├── storage/            # Local storage management
│   │   └── storage.ts
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   └── utils/              # Utility functions
│       ├── dateUtils.ts
│       └── shareUtils.ts
├── android/                # Android native code
├── ios/                    # iOS native code
├── App.tsx                 # Main app component
├── index.js               # App entry point
└── package.json           # Dependencies
```

## 🎨 Features Highlights

### Home Screen
- View currently reading books with progress bars
- See recently completed books
- Quick access to book details

### Search Screen
- Search books from multiple sources
- Beautiful book cards with covers
- Add books directly to your library

### Profile Screen
- View reading statistics
- Track earned and locked badges
- Share achievements

### Book Detail Screen
- Complete book information
- Progress tracking
- Edit functionality
- Delete option

### Add Book Screen
- Select reading status
- Set start date
- Configure reading goals
- Enable daily reminders

### Edit Progress Screen
- Update current page
- Quick add buttons (+10, +25, +50 pages)
- Modify reading goals
- Complete book with rating and review

## 🔔 Notifications

The app sends daily notifications at 6:00 AM if you have:
- An active reading goal enabled
- Books in "Reading" status

## 💾 Data Storage

All data is stored locally using AsyncStorage:
- User books and progress
- User profile and statistics
- Badge achievements
- No internet required for stored data

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and enhancement requests.

## 📝 License

This project is open source and available under the MIT License.

## 🌟 Future Enhancements

- [ ] Reading statistics and charts
- [ ] Reading streak tracking
- [ ] Book recommendations
- [ ] Reading challenges
- [ ] Multiple user profiles
- [ ] Cloud sync
- [ ] Dark mode
- [ ] Reading timer
- [ ] Book notes and highlights
- [ ] Import from Goodreads

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

**Happy Reading! 📚✨**
