# 📐 Book Progress Tracker - Design System

A comprehensive design system for recreating the app UI in Figma or any design tool.

---

## 🎨 Color Palette

### Light Theme
| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#f9fafb` | Main app background |
| `surface` | `#ffffff` | Cards, modals, sheets |
| `card` | `#ffffff` | Card backgrounds |
| `text` | `#1f2937` | Primary text |
| `textSecondary` | `#6b7280` | Secondary text, subtitles |
| `textTertiary` | `#9ca3af` | Hints, placeholders |
| `primary` | `#6366f1` | Primary actions, links, progress |
| `primaryLight` | `#eef2ff` | Primary backgrounds, highlights |
| `border` | `#e5e7eb` | Card borders, dividers |
| `borderLight` | `#f3f4f6` | Subtle borders |
| `error` | `#ef4444` | Error states, delete actions |
| `success` | `#10b981` | Success states, completed |
| `warning` | `#f59e0b` | Warning states |
| `placeholder` | `#d1d5db` | Input placeholders |

### Dark Theme
| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#111827` | Main app background |
| `surface` | `#1f2937` | Cards, modals, sheets |
| `card` | `#374151` | Card backgrounds |
| `text` | `#f9fafb` | Primary text |
| `textSecondary` | `#d1d5db` | Secondary text |
| `textTertiary` | `#9ca3af` | Hints, placeholders |
| `primary` | `#818cf8` | Primary actions |
| `primaryLight` | `#312e81` | Primary backgrounds |
| `border` | `#4b5563` | Borders |
| `borderLight` | `#374151` | Subtle borders |
| `error` | `#f87171` | Error states |
| `success` | `#34d399` | Success states |
| `warning` | `#fbbf24` | Warning states |

### Gradients
| Name | Colors | Usage |
|------|--------|-------|
| `primaryGradient` | `#6366f1` → `#8b5cf6` | Headers, buttons |
| `successGradient` | `#10b981` → `#059669` | Progress completion |

---

## 📝 Typography

### Font Family
- **iOS**: San Francisco (System)
- **Android**: Roboto (System)

### Text Styles
| Style | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `h1` | 28px | 700 (Bold) | 36px | Screen titles |
| `h2` | 24px | 700 (Bold) | 32px | Section headers |
| `h3` | 20px | 600 (SemiBold) | 28px | Card titles |
| `h4` | 18px | 600 (SemiBold) | 24px | Subsection headers |
| `body` | 16px | 400 (Regular) | 24px | Body text |
| `bodyMedium` | 16px | 500 (Medium) | 24px | Emphasized body |
| `bodySemiBold` | 16px | 600 (SemiBold) | 24px | Button text |
| `caption` | 14px | 400 (Regular) | 20px | Captions, metadata |
| `captionMedium` | 14px | 500 (Medium) | 20px | Emphasized captions |
| `small` | 12px | 400 (Regular) | 16px | Labels, hints |
| `tiny` | 10px | 500 (Medium) | 14px | Badges, tags |

---

## 📏 Spacing System

### Base Unit: 4px

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Tight spacing |
| `sm` | 8px | Icon gaps, small margins |
| `md` | 12px | Card padding, gaps |
| `lg` | 16px | Section padding |
| `xl` | 20px | Large card padding |
| `2xl` | 24px | Section margins |
| `3xl` | 32px | Screen padding top |
| `4xl` | 48px | Large section gaps |

### Screen Padding
- Horizontal: 16px
- Vertical: 24px

---

## 🔲 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `none` | 0px | No rounding |
| `sm` | 4px | Small buttons, tags |
| `md` | 8px | Input fields, small cards |
| `lg` | 12px | Cards, book covers |
| `xl` | 16px | Large cards, modals |
| `2xl` | 20px | Bottom sheets |
| `full` | 9999px | Circles, pills |

---

## 🌑 Shadows

### Card Shadow (Light)
```css
shadow-color: #000000
shadow-offset: 0px 1px
shadow-opacity: 0.1
shadow-radius: 3px
elevation: 2 (Android)
```

### Modal Shadow
```css
shadow-color: #000000
shadow-offset: 0px 4px
shadow-opacity: 0.15
shadow-radius: 12px
elevation: 8 (Android)
```

---

## 🧩 Components

### 1. Buttons

#### Primary Button
- Background: `primary` (#6366f1)
- Text: White
- Padding: 16px vertical, 24px horizontal
- Border Radius: 12px
- Font: 16px SemiBold

#### Secondary Button
- Background: `primaryLight` (#eef2ff)
- Text: `primary` (#6366f1)
- Border: 1px `primary`
- Padding: 16px vertical, 24px horizontal
- Border Radius: 12px

#### Text Button
- Background: Transparent
- Text: `primary` (#6366f1)
- Padding: 8px

#### Destructive Button
- Background: `error` (#ef4444)
- Text: White
- Same dimensions as Primary

### 2. Input Fields

#### Text Input
- Height: 52px
- Background: `surface` (#ffffff)
- Border: 1px `border` (#e5e7eb)
- Border Radius: 12px
- Padding: 16px horizontal
- Icon (left): 20px, color `textTertiary`
- Font: 16px Regular

#### Text Input (Error State)
- Border: 1px `error` (#ef4444)
- Error text below: 12px, color `error`

#### Text Input (Focused)
- Border: 2px `primary` (#6366f1)

### 3. Cards

#### Book Card (Horizontal - Continue Reading)
- Width: 280px
- Background: `surface`
- Border Radius: 12px
- Padding: 12px
- Shadow: Card Shadow
- **Book Cover**: 80×120px, radius 8px
- **Title**: 16px SemiBold, max 2 lines
- **Author**: 14px Regular, `textSecondary`
- **Progress Bar**: 6px height, radius 3px

#### Book Card (Vertical - Completed)
- Width: 120px
- **Cover**: 120×160px, radius 12px
- **Title**: 14px SemiBold, max 2 lines
- **Rating**: 12px, star icons

#### Stat Card
- Flex: 1 (equal width)
- Background: `borderLight` (#f3f4f6)
- Padding: 20px
- Border Radius: 12px
- **Number**: 24px Bold, `primary`
- **Label**: 12px Regular, `textSecondary`

### 4. Progress Bar
- Height: 6px
- Background: `border` (#e5e7eb)
- Fill: `primary` (#6366f1)
- Border Radius: 3px

### 5. Navigation

#### Tab Bar
- Height: 60px + safe area
- Background: `surface`
- Border Top: 1px `borderLight`
- **Active Icon**: `primary` (#6366f1)
- **Inactive Icon**: `textSecondary` (#6b7280)
- **Label**: 10px Medium

#### Header
- Height: 56px
- Background: Transparent or `surface`
- **Title**: 18px SemiBold, centered
- **Back Button**: 24px icon

### 6. Modal / Bottom Sheet
- Background: `surface`
- Border Radius: 20px (top corners)
- Handle: 40px × 4px, `border`, radius 2px
- Padding: 24px

### 7. Toast Notification
- Background: `success` (#10b981) / `error` / `warning` / `primary`
- Border Radius: 12px
- Padding: 16px
- **Icon**: 24px, White
- **Message**: 14px Medium, White
- Position: Top, 16px from edges

---

## 🖼️ Image Sizes

| Component | Width | Height | Ratio |
|-----------|-------|--------|-------|
| Book Cover (Small) | 60px | 90px | 2:3 |
| Book Cover (Medium) | 80px | 120px | 2:3 |
| Book Cover (Large) | 120px | 180px | 2:3 |
| Book Cover (Detail) | 140px | 210px | 2:3 |
| Profile Avatar | 80px | 80px | 1:1 |
| Profile Avatar (Small) | 40px | 40px | 1:1 |
| Badge Icon | 60px | 60px | 1:1 |

### Placeholder Cover
- Background: `borderLight` (#f3f4f6)
- Icon: Book outline, 32px, `textTertiary`

---

## 🎯 Icons

### Icon Library
- **Ionicons** (react-native-vector-icons)

### Common Icons
| Icon | Name | Usage |
|------|------|-------|
| 🏠 | `home-outline` / `home` | Home tab |
| 🔍 | `search-outline` / `search` | Search tab |
| 📚 | `library-outline` / `library` | Shelf tab |
| 📊 | `stats-chart-outline` / `stats-chart` | Dashboard tab |
| 👤 | `person-outline` / `person` | Profile tab |
| ← | `chevron-back` | Back navigation |
| → | `chevron-forward` | Forward/detail |
| ✓ | `checkmark-circle` | Success, completed |
| ✕ | `close` | Close, dismiss |
| ⭐ | `star` / `star-outline` | Ratings |
| 📖 | `book-outline` | Book placeholder |
| 📧 | `mail-outline` | Email input |
| 🔒 | `lock-closed-outline` | Password input |
| 👁️ | `eye-outline` / `eye-off-outline` | Password visibility |
| ➕ | `add` | Add action |
| 🗑️ | `trash-outline` | Delete |
| ✏️ | `create-outline` | Edit |
| 📤 | `share-outline` | Share |
| ⚙️ | `settings-outline` | Settings |
| 🔔 | `notifications-outline` | Notifications |

### Icon Sizes
| Size | Value | Usage |
|------|-------|-------|
| Small | 16px | Inline icons |
| Medium | 20px | Input icons |
| Large | 24px | Action icons |
| XL | 32px | Feature icons |

---

## 📱 Screen Dimensions

### Design For
- **iPhone 14 Pro**: 393 × 852 (safe area: 59px top, 34px bottom)
- **Android**: 360 × 800 (standard)

### Safe Areas
- Status Bar: ~47px (iOS) / ~24px (Android)
- Tab Bar: 60px + bottom safe area
- Home Indicator: 34px (iOS)

---

## 🔄 States

### Button States
- **Default**: Normal appearance
- **Pressed**: 0.7 opacity
- **Disabled**: 0.5 opacity, no interaction
- **Loading**: ActivityIndicator, disabled

### Input States
- **Empty**: Placeholder text visible
- **Filled**: Value text visible
- **Focused**: Primary border
- **Error**: Error border + message
- **Disabled**: 0.5 opacity

### Card States
- **Default**: Normal shadow
- **Pressed**: Scale 0.98, darker shadow

---

## 🎬 Animations

### Transitions
- **Duration**: 200-300ms
- **Easing**: ease-in-out

### Common Animations
| Animation | Duration | Type |
|-----------|----------|------|
| Button Press | 100ms | Scale to 0.95 |
| Modal Open | 300ms | Slide up + fade |
| Toast | 300ms | Slide down from top |
| Page Transition | 250ms | Slide left/right |
| Refresh | 1000ms | Spin |

---

*Last Updated: January 23, 2026*
