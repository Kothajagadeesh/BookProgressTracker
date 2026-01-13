# App Icon Setup Guide

This guide will help you create and install a custom app icon for Book Progress Tracker.

## 🎨 Design Specifications

### Required Sizes

**iOS (all required):**
- 1024x1024px (App Store)
- 180x180px (iPhone @3x)
- 120x120px (iPhone @2x)
- 87x87px (iPhone @3x Settings)
- 80x80px (iPhone @2x Settings)
- 60x60px (iPhone @2x Spotlight)
- 58x58px (iPhone @2x Settings)
- 40x40px (iPhone @2x Notifications)

**Android (all required):**
- 512x512px (Play Store)
- 192x192px (xxxhdpi)
- 144x144px (xxhdpi)
- 96x96px (xhdpi)
- 72x72px (hdpi)
- 48x48px (mdpi)

### Design Guidelines

**Theme:** Book Progress Tracker
**Colors:** Purple gradient (#6366f1 → #8b5cf6 → #a855f7)
**Style:** Modern, minimal, recognizable

**Design Ideas:**
1. **Open book icon** with purple gradient background
2. **Book with bookmark** in center
3. **Stacked books** with progress indicator
4. **Letter "B"** styled as a book
5. **Reading icon** with circular progress

**Best Practices:**
- Keep it simple and recognizable at small sizes
- Avoid text (except single letter)
- Use high contrast
- No transparency (fill background)
- Rounded corners handled automatically by OS

## 🛠️ Method 1: Use Online Icon Generator (Easiest)

### Step 1: Create Your Icon Design

**Option A: Use Canva (Free)**
1. Go to [Canva.com](https://canva.com)
2. Create custom size: 1024x1024px
3. Design your icon:
   - Add book icon from elements
   - Apply purple gradient background
   - Keep design centered
   - Export as PNG

**Option B: Use Figma (Free)**
1. Go to [Figma.com](https://figma.com)
2. Create 1024x1024px frame
3. Design your icon
4. Export as PNG (2x resolution)

**Option C: Use Simple Design Tool**
- [AppIcon.co](https://appicon.co) - Has built-in templates
- [MakeAppIcon](https://makeappicon.com) - Simple interface

### Step 2: Generate All Icon Sizes

**Recommended Tool: AppIcon.co**

1. Go to [https://www.appicon.co](https://www.appicon.co)
2. Upload your 1024x1024px icon
3. Select platforms: iOS and Android
4. Click "Generate"
5. Download the zip file

**Alternative: MakeAppIcon**

1. Go to [https://makeappicon.com](https://makeappicon.com)
2. Upload your 1024x1024px icon
3. Download iOS and Android assets

### Step 3: Install iOS Icons

1. **Extract the downloaded zip file**

2. **Open Xcode:**
   ```bash
   cd ios
   open BookProgressTracker.xcworkspace
   ```

3. **In Xcode:**
   - Navigate to `BookProgressTracker` → `Images.xcassets` → `AppIcon`
   - Delete existing placeholder icons
   - Drag and drop all iOS icons from the generated folder
   - Make sure each size slot is filled

4. **Verify:**
   - All icon slots should show your new icon
   - No empty slots or warnings

### Step 4: Install Android Icons

1. **Navigate to Android res folder:**
   ```bash
   cd android/app/src/main/res
   ```

2. **Replace icons in each folder:**
   - `mipmap-mdpi/ic_launcher.png` (48x48)
   - `mipmap-hdpi/ic_launcher.png` (72x72)
   - `mipmap-xhdpi/ic_launcher.png` (96x96)
   - `mipmap-xxhdpi/ic_launcher.png` (144x144)
   - `mipmap-xxxhdpi/ic_launcher.png` (192x192)

3. **Also replace round icons:**
   - `mipmap-mdpi/ic_launcher_round.png`
   - `mipmap-hdpi/ic_launcher_round.png`
   - `mipmap-xhdpi/ic_launcher_round.png`
   - `mipmap-xxhdpi/ic_launcher_round.png`
   - `mipmap-xxxhdpi/ic_launcher_round.png`

### Step 5: Clean and Rebuild

**iOS:**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
npx react-native run-ios
```

**Android:**
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

## 🛠️ Method 2: Use React Native Asset Tool

### Step 1: Install the Tool

```bash
npm install -g react-native-asset
```

### Step 2: Prepare Your Icon

1. Create a folder: `assets/`
2. Place your 1024x1024px icon: `assets/app-icon.png`

### Step 3: Configure

Create `react-native.config.js` in project root:

```javascript
module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./assets/'],
};
```

### Step 4: Generate Icons

```bash
react-native-asset
```

This will automatically:
- Generate all required sizes
- Place them in correct folders
- Update native configurations

### Step 5: Rebuild

```bash
# iOS
cd ios && pod install && cd ..
npx react-native run-ios

# Android
cd android && ./gradlew clean && cd ..
npx react-native run-android
```

## 🎨 Quick Design Template

If you want a simple design to start with, here's a concept:

**Purple Gradient Book Icon:**
- Background: Linear gradient (#6366f1 → #8b5cf6)
- Icon: White book symbol (Ionicons "book" or "book-outline")
- Size: Icon 60% of canvas
- Centered with slight shadow

**You can create this in Canva:**
1. 1024x1024px canvas
2. Add rectangle, apply gradient
3. Add book icon from elements
4. Make it white, center it
5. Add subtle shadow
6. Export as PNG

## 📱 Testing Your Icon

### iOS Simulator:
1. Build and run app
2. Press Cmd + Shift + H (go to home screen)
3. See your new icon on home screen

### Android Emulator:
1. Build and run app
2. Open app drawer
3. See your new icon

### Real Device:
1. Delete old app first
2. Install new build
3. Check home screen

## 🔍 Troubleshooting

**Icon not updating on iOS:**
- Clean build: Product → Clean Build Folder in Xcode
- Delete app from simulator
- Rebuild and reinstall

**Icon not updating on Android:**
- Run: `cd android && ./gradlew clean && cd ..`
- Delete app from device/emulator
- Rebuild and reinstall

**Icon looks blurry:**
- Make sure you're using PNG format
- Ensure original is 1024x1024px
- Don't use JPG (use PNG)

**Wrong icon showing:**
- Clear cache: `npx react-native start --reset-cache`
- Rebuild app completely

## 📦 Recommended Design Resources

**Free Icon Design Tools:**
- [Canva](https://canva.com) - Easy drag-and-drop
- [Figma](https://figma.com) - Professional design
- [Photopea](https://photopea.com) - Photoshop alternative

**Icon Generators:**
- [AppIcon.co](https://appicon.co) - Best for React Native
- [MakeAppIcon](https://makeappicon.com) - Simple and fast
- [Icon Kitchen](https://icon.kitchen) - Android focused

**Free Icon Resources:**
- [Ionicons](https://ionic.io/ionicons) - Already in your project
- [Flaticon](https://flaticon.com) - Free icons
- [Icons8](https://icons8.com) - Large collection

## 🎯 Quick Start (Recommended)

1. **Design icon in Canva** (1024x1024px with purple gradient + book)
2. **Generate sizes at AppIcon.co**
3. **Replace iOS icons in Xcode**
4. **Replace Android icons in res folders**
5. **Clean build and test**

Total time: ~15-30 minutes

---

**Your app will look professional with a custom icon!** 🎨📚

The icon appears on:
- Home screen
- App switcher
- Settings
- Notifications
- App Store/Play Store
- Splash screen (optional)
