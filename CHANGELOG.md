## [Unreleased] - January 26, 2026

### Added

#### 9:40 PM IST - Book Sync & Reviews API Implementation
- **Feature**: Complete backend API for book tracking and reviews
- **Edge Functions Created**:
  - `add-user-book` - Syncs books to database when user adds to reading list
  - `add-review` - Add/update book reviews (requires book in reading list)
  - `get-reviews` - Fetch reviews for a book with average rating
- **Frontend API Integration**:
  - Added `booksApi.addUserBook()` - Sync book to database
  - Added `booksApi.addReview()` - Submit book review
  - Added `booksApi.getReviews()` - Get reviews for a book
- **Storage Sync**:
  - Updated `saveUserBook()` to auto-sync with Supabase database
  - Books now saved to both local storage and cloud database
- **Business Logic**:
  - Users can only review books in their reading list
- **Files Created**:
  - `supabase/functions/add-user-book/index.ts`
  - `supabase/functions/add-review/index.ts`
  - `supabase/functions/get-reviews/index.ts`
- **Files Modified**:
  - `src/services/api.ts` (added booksApi)
  - `src/storage/storage.ts` (added syncBookToDatabase)

#### 10:45 PM IST - Logout Functionality
- **Feature**: Added logout functionality to Settings screen
- **Implementation**:
  - Logout clears user session via `signOut()` from authService
  - Clears all local cached data via `AsyncStorage.clear()`
  - Resets navigation stack to Login screen (prevents back navigation)
- **UI Updates**:
  - Added styled logout button in Settings > Account section
  - Centered icon and text layout
- **Files Modified**:
  - `src/screens/SettingsScreen.tsx`

---

## [Unreleased] - January 25, 2026

### Added

#### 9:50 PM IST - Database Schema for Book Tracking
- **Feature**: Created complete database schema for book tracking functionality
- **Tables Created**:
  - `books` - Cache book data from Google Books API (id, google_books_id, isbn, title, description, thumbnail, page_count, published_date, categories)
  - `authors` - Author information (id, google_author_id, name, bio, image_url)
  - `book_authors` - Junction table for many-to-many book-author relationship (book_id, author_id, role)
  - `user_books` - Track user reading progress (user_id, book_id, status, current_page, start_date, finish_date)
  - `reviews` - Public ratings and comments (user_id, book_id, rating, review_text)
- **Schema Design**:
  - Many-to-many relationship between books and authors
  - Supports multiple authors per book with roles (author, illustrator, etc.)
  - Separate tables for private progress (user_books) and public reviews (reviews)
  - Added `id` column to `users` table for foreign key support
- **Files Created**:
  - `supabase/migrations/002_create_book_tables.sql`

---

## [Unreleased] - January 24, 2026

### Added

#### 7:00 PM IST - Auth Flow Fixes & Email Verification Setup
- **Feature**: Fixed authentication flow and prepared email verification infrastructure
- **Fixes**:
  - Fixed navigation after successful login (now navigates to MainTabs)
  - Fixed signup success message to indicate email verification
  - Added debug logging for API calls (temporary for troubleshooting)
- **Email Verification (Disabled for now)**:
  - Created `verify-email` Edge Function to handle verification links
  - Created `resend-verification` Edge Function for resending verification emails
  - Added email verification check in signin (currently commented out)
  - Integrated Resend API for sending emails (requires domain verification for production)
- **Files Created**:
  - `supabase/functions/verify-email/index.ts`
  - `supabase/functions/resend-verification/index.ts`
- **Files Modified**:
  - `src/screens/LoginScreen.tsx` (added navigation after login)
  - `src/screens/SignupScreen.tsx` (updated success message)
  - `src/services/authService.ts` (added resendVerificationEmail function)
  - `src/services/api.ts` (added resendVerification endpoint)
  - `supabase/functions/signin/index.ts` (email check disabled)
  - `supabase/functions/signup/index.ts` (email sending disabled)

---

## [Unreleased] - January 23, 2026

### Added

#### 9:30 PM IST - Supabase Backend Migration with Edge Functions
- **Feature**: Migrated from Firebase to Supabase with proper backend architecture
- **Backend Changes**:
  - Created Supabase Edge Functions for `signup` and `signin`
  - Edge Functions validate data server-side before database operations
  - Signup validates: email format, password (6+ chars), username (2-30 chars)
  - Checks for duplicate email and username before insert
  - Signin validates credentials server-side
- **Frontend Changes**:
  - Created `src/services/api.ts` - API service layer to call Edge Functions
  - Updated `src/services/authService.ts` to use backend API instead of direct DB calls
  - Removed Firebase initialization from iOS `AppDelegate.mm`
  - Added `react-native-url-polyfill` for Supabase compatibility
- **Architecture**:
  - Before: `App → Direct Database Insert` (insecure)
  - After: `App → API Service → Edge Functions → Validate → Database` (secure)
- **Files Created**:
  - `supabase/functions/signup/index.ts`
  - `supabase/functions/signin/index.ts`
  - `src/services/api.ts`
- **Files Modified**:
  - `src/services/authService.ts`
  - `ios/BookProgressTracker/AppDelegate.mm`
  - `index.js` (added URL polyfill)
  - `.gitignore` (added supabase/.temp/)

---

## [Unreleased] - January 21, 2026

### Added

#### 9:15 PM IST - Firestore Integration for User Signup
- **Feature**: Integrated Firestore to store user data upon signup.
- **Implementation**:
  - Modified `src/services/authService.ts` to include Firestore operations.
  - When a new user signs up, a corresponding document is created in the `users` collection in Firestore.
  - The user document stores `uid`, `name`, `username`, `email`, and a `createdAt` timestamp.
  - Updated the `checkUsernameAvailability` function to query the `users` collection in Firestore, ensuring real-time username validation.
  - Removed the old `AsyncStorage` logic for storing user information, making Firestore the single source of truth.
- **Files Modified**:
  - `src/services/authService.ts`
  - `package.json` (to add `@react-native-firebase/firestore`)
  - `package-lock.json`

# Book Progress Tracker - Changelog

## [Unreleased] - January 22, 2026

### Added

#### 10:30 PM IST - Firebase Integration & Platform Build Fixes
- **Feature**: Fixed Firebase integration for both Android and iOS platforms
- **Android Fixes**:
  - Updated `compileSdkVersion` and `targetSdkVersion` to 34 in `android/build.gradle`
  - Fixed React Native paths in `android/app/build.gradle` (changed `../node_modules` to `../../node_modules`)
  - Created missing `rn_edit_text_material.xml` drawable resource
  - Removed missing `ic_launcher_round` reference from `AndroidManifest.xml`
  - Generated debug keystore for signing
  - Updated `react-native-screens` to version 3.29.0 for compatibility
  - Added vector icons font linking via `fonts.gradle`
  - Bundled JS into APK for offline loading
- **iOS Fixes**:
  - Configured `Podfile` with `use_frameworks! :linkage => :static`
  - Added `$RNFirebaseAsStaticFramework = true` for Firebase compatibility
  - Set iOS deployment target to 15.0
  - Added `use_modular_headers!` for Swift pod compatibility
  - Successfully ran `pod install` with 81 pods installed
- **Files Modified**:
  - `android/build.gradle`
  - `android/app/build.gradle`
  - `android/app/src/main/AndroidManifest.xml`
  - `android/app/src/main/res/drawable/rn_edit_text_material.xml` (created)
  - `android/app/debug.keystore` (generated)
  - `ios/Podfile`
- **Status**: Android app running on emulator, iOS build in progress

---

## [Previous] - January 6, 2026

### Added

#### 4:45 PM IST - Bold Shelf Names in Toast Notifications
- **Enhancement**: Made shelf names bold in success notification messages
- **Implementation**:
  - Updated toast messages to use markdown-style bold syntax (`**text**`)
  - Enhanced ToastNotification component to parse and render bold text
  - Added `renderMessage()` function to split and format message parts
  - Bold text uses extra heavy font weight (800) for emphasis
- **Messages**:
  - "Book added to **In Progress**!"
  - "Book added to **Books Read**!"
  - "Book added to **Want to Read**!"
- **Files Modified**: 
  - `src/screens/AddBookScreen.tsx`
  - `src/components/ToastNotification.tsx`

#### 4:43 PM IST - Success Notification After Adding Book
- **Feature**: Added success notification banner when user adds a book to shelf
- **Implementation**:
  - Integrated ToastNotification component into AddBookScreen
  - Shows green success banner with checkmark icon
  - Different messages based on selected shelf status
  - Auto-dismisses after 3 seconds with smooth animation
  - Delays navigation to allow user to see notification (2 seconds for non-completed, 1 second before share dialog for completed)
- **UI Components**:
  - Green success banner sliding from top
  - Checkmark circle icon
  - Contextual message based on shelf selection
  - Manual dismiss option with close button
- **Files Modified**: 
  - `src/screens/AddBookScreen.tsx`
  - `src/components/ToastNotification.tsx` (created)

#### 4:36 PM IST - App Launch
- Successfully launched the app on iOS Simulator (iPhone 17 Pro, iOS 26.1)
- Metro bundler running on port 8081
- All recent features tested and verified

#### 9:21 PM IST (Previous Day) - In-App Notification Banner for Shelf Selection
- **Feature**: Added notification banner when user switches between shelves
- **Implementation**:
  - Created reusable ToastNotification component with animations
  - Added toast state management to ShelfScreen
  - Shows notification when filter is changed via dropdown
  - Smooth slide-in animation from top with spring effect
  - Auto-dismisses after 3 seconds
  - Manual dismiss with close button
- **UI Components**:
  - Animated banner with icon, message, and close button
  - 4 notification types: success (green), info (blue), warning (orange), error (red)
  - Positioned at top with shadow and elevation
- **Messages**:
  - "Viewing Books Read"
  - "Viewing In Progress"
  - "Viewing Want to Read"
- **Files Modified**: 
  - `src/screens/ShelfScreen.tsx`
  - `src/components/ToastNotification.tsx` (created)

#### 9:19 PM IST (Previous Day) - Fixed See All Navigation in HomeScreen
- **Bug Fix**: Corrected "See All" button navigation for Continue Reading and Recently Completed sections
- **Changes**:
  - Continue Reading "See All" → Now navigates to Shelf with "In Progress" filter (was: Search screen)
  - Recently Completed "See All" → Now navigates to Shelf with "Books Read" filter (was: Search screen)
- **Files Modified**: `src/screens/HomeScreen.tsx`

#### 9:15 PM IST (Previous Day) - Fixed Recently Completed Books Order
- **Bug Fix**: Recently completed books now display in correct chronological order
- **Implementation**:
  - Added sorting by `completedDate` field in descending order
  - Most recently completed books appear first
  - Books without completion dates appear at the end
- **Files Modified**: `src/screens/HomeScreen.tsx`

#### 9:12 PM IST (Previous Day) - List/Tile View Toggle in Shelf Screen
- **Feature**: Added ability to switch between list and tile view in ShelfScreen
- **Implementation**:
  - Added view mode state management (`list` | `tile`)
  - Created toggle buttons with list and grid icons in header
  - Implemented `renderListBook` function for vertical list layout
  - Implemented `renderTileBook` function for 2-column grid layout
  - Added dynamic FlatList configuration with `numColumns` based on view mode
  - Created comprehensive styles for both view modes
- **UI Components**:
  - View toggle buttons in header (next to filter dropdown)
  - Active state highlighting for selected view
  - List view: Horizontal cards with cover, title, author, rating, and chevron
  - Tile view: 2-column grid with large covers and compact text below
- **Files Modified**: `src/screens/ShelfScreen.tsx`

#### 10:22 PM IST (Previous Day) - Database Integration Discussion
- Discussed integration options with real databases
- Evaluated Firebase, Supabase, MongoDB Atlas, and AWS options
- Provided cost analysis and free tier comparisons
- Recommended Firebase for quick setup with zero initial cost

#### 10:19 PM IST (Previous Day) - Technology Stack Documentation
- Documented complete technology stack used in the app
- Listed all dependencies and their purposes
- Outlined project structure and key features

#### 10:14 PM IST (Previous Day) - Profile Setup Enhancement
- **Feature**: Made gender and date of birth required fields during sign-up
- **Implementation**:
  - Updated `UserProfile` interface to make `gender` and `dateOfBirth` required (removed optional `?`)
  - Changed gender selection from buttons to dropdown modal
  - Added gender options: Male, Female, Others, Prefer not to share
  - Added validation for all three required fields (name, gender, DOB)
  - Created bottom sheet modal for gender selection with checkmark indicator
- **UI Components**:
  - Dropdown button for gender selection with chevron icon
  - Modal with 4 gender options
  - All fields marked with asterisk (*) to indicate required
  - Native date picker for date of birth
- **Files Modified**: 
  - `src/types/index.ts`
  - `src/screens/ProfileSetupScreen.tsx`

#### 10:11 PM IST (Previous Day) - Community Challenges Section Rename
- **Change**: Renamed "Community Challenges" to "Join a Community Challenge"
- **Files Modified**: `src/screens/ChallengesScreen.tsx`

#### 10:09 PM IST (Previous Day) - Create Challenge Feature Migration
- **Feature**: Moved Create Challenge section from ProfileScreen to ChallengesScreen
- **Implementation**:
  - Removed all challenge-related code from ProfileScreen (state, handlers, UI, modal)
  - Added Create Challenge section to ChallengesScreen before Community Challenges
  - Implemented challenge creation modal with name and description inputs
  - Added state management for challenge creation
  - Integrated with shared challenges storage
- **UI Components**:
  - "Create Your Own Challenge" section with purple button
  - Modal with name and description text inputs
  - Form validation and success alerts
- **Files Modified**: 
  - `src/screens/ProfileScreen.tsx` (removed challenge code)
  - `src/screens/ChallengesScreen.tsx` (added challenge creation)

## Previous Sessions

### Profile Setup Screen Creation
- Created comprehensive ProfileSetupScreen for first-time user onboarding
- Added welcome screen with gradient header
- Implemented name, gender, and date of birth collection
- Added navigation logic to show setup screen only on first launch
- Integrated with AsyncStorage for profile persistence

### Community Challenges System
- Implemented shared challenges visible to all users
- Added ability to create challenges with name and description
- Implemented join challenge functionality
- Added participant count tracking
- Created community challenges display with join buttons

### Reading Goals Feature
- Added 2026 reading goals (Books, Pages, Hours)
- Implemented goal setting modals
- Added goal progress tracking
- Created goal cards in ChallengesScreen

### UI/UX Improvements
- Fixed singular/plural book count text in ChallengesScreen
- Added "no books" message with search navigation
- Removed dummy challenges data
- Enhanced profile editing capabilities
- Added profile picture support (camera/gallery)

### Core Features (Earlier Development)
- Book search using Open Library API & Google Books API
- Reading progress tracking with current page updates
- Multiple reading statuses (Reading, Completed, Want to Read)
- Badge system (25, 50, 75, 100, 150, 200, 500 books)
- Book ratings and reviews for completed books
- Social media sharing for milestones
- Daily notifications at 6 AM for reading reminders
- Dashboard with reading statistics and insights
- Profile screen with lifetime statistics

---

## Technology Stack

### Core
- React Native 0.73.2
- TypeScript
- React Navigation v6

### Storage & Data
- AsyncStorage (local persistence)

### UI Libraries
- react-native-vector-icons (Ionicons)
- react-native-linear-gradient
- react-native-ratings
- @react-native-community/datetimepicker

### Media & Sharing
- react-native-image-picker
- react-native-share
- react-native-push-notification

### APIs
- axios
- Open Library API
- Google Books API

---

## Notes

- All data currently stored locally using AsyncStorage
- App supports both iOS and Android platforms
- Metro bundler used for development
- No backend server required (can be integrated with Firebase/Supabase in future)

---

*Last Updated: January 23, 2026, 9:40 PM IST*