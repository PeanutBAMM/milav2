# Design Reference: Bolt Food Style Guide

## Design Inspiration
We gebruiken **Bolt Food** als design reference voor de Mila shopping list app. Bolt Food staat bekend om zijn clean, minimalistisch design met focus op usability.

## Core Design Principles (Bolt Food Style)

### 1. Color Palette
```scss
// Primary Colors
$bolt-green: #34D186;        // Primary action color
$bolt-green-dark: #2BB673;   // Hover/pressed state
$bolt-black: #2E3333;        // Primary text
$bolt-gray-dark: #6C7072;    // Secondary text
$bolt-gray-light: #EBEDF0;   // Backgrounds, borders
$white: #FFFFFF;             // Card backgrounds

// Semantic Colors
$success: #34D186;
$warning: #FFB800;
$error: #FF5B5B;
$info: #4B9BFF;

// Shopping Categories (Bolt style)
$category-groceries: #34D186;
$category-meat: #FF6B6B;
$category-dairy: #4ECDC4;
$category-bakery: #FFD93D;
$category-household: #95A5A6;
```

### 2. Typography
```scss
// Font Family
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

// Font Sizes (Bolt scale)
$text-xs: 12px;     // Captions, labels
$text-sm: 14px;     // Body small
$text-base: 16px;   // Body default
$text-lg: 18px;     // Subtitles
$text-xl: 24px;     // Headers
$text-2xl: 32px;    // Page titles

// Font Weights
$font-regular: 400;
$font-medium: 500;
$font-semibold: 600;
$font-bold: 700;
```

### 3. Component Patterns

#### Cards (Bolt Style)
```jsx
// Shopping List Card
<View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
  <View className="flex-row justify-between items-center">
    <View>
      <Text className="text-lg font-semibold text-bolt-black">
        Wekelijkse Boodschappen
      </Text>
      <Text className="text-sm text-bolt-gray-dark mt-1">
        12 items • €45.30
      </Text>
    </View>
    <View className="bg-bolt-green rounded-full w-12 h-12 items-center justify-center">
      <Icon name="arrow-right" color="white" />
    </View>
  </View>
</View>
```

#### Buttons (Bolt Style)
```jsx
// Primary Button
<TouchableOpacity className="bg-bolt-green rounded-2xl py-4 px-6">
  <Text className="text-white text-base font-semibold text-center">
    Toevoegen aan lijst
  </Text>
</TouchableOpacity>

// Secondary Button
<TouchableOpacity className="bg-bolt-gray-light rounded-2xl py-4 px-6">
  <Text className="text-bolt-black text-base font-medium text-center">
    Annuleren
  </Text>
</TouchableOpacity>
```

#### List Items (Bolt Style)
```jsx
// Product List Item
<View className="bg-white flex-row items-center py-4 border-b border-bolt-gray-light">
  <Image 
    source={productImage} 
    className="w-16 h-16 rounded-xl mr-4"
  />
  <View className="flex-1">
    <Text className="text-base font-medium text-bolt-black">
      Melk 1L
    </Text>
    <Text className="text-sm text-bolt-gray-dark mt-1">
      €1.29
    </Text>
  </View>
  <TouchableOpacity className="bg-bolt-green rounded-xl px-4 py-2">
    <Text className="text-white font-medium">+</Text>
  </TouchableOpacity>
</View>
```

### 4. Layout Principles

#### Spacing System (8px base)
```scss
$space-1: 4px;    // Tight spacing
$space-2: 8px;    // Small spacing
$space-3: 12px;   // Default spacing
$space-4: 16px;   // Medium spacing
$space-5: 20px;   // Large spacing
$space-6: 24px;   // Extra large
$space-8: 32px;   // Huge spacing
```

#### Border Radius
```scss
$rounded-sm: 8px;   // Small elements
$rounded-md: 12px;  // Buttons, inputs
$rounded-lg: 16px;  // Cards
$rounded-xl: 20px;  // Large cards
$rounded-2xl: 24px; // Hero elements
$rounded-full: 9999px; // Pills, avatars
```

### 5. Animations (Bolt-style micro-interactions)

#### Press Feedback
```javascript
// Scale animation on press
const scaleValue = useSharedValue(1);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scaleValue.value }]
}));

const handlePressIn = () => {
  scaleValue.value = withSpring(0.95);
};

const handlePressOut = () => {
  scaleValue.value = withSpring(1);
};
```

#### List Item Swipe
```javascript
// Swipe to delete/check
const translateX = useSharedValue(0);

const swipeGesture = Gesture.Pan()
  .onUpdate((e) => {
    translateX.value = e.translationX;
  })
  .onEnd(() => {
    if (translateX.value < -100) {
      // Delete action
    } else {
      translateX.value = withSpring(0);
    }
  });
```

### 6. Screen Designs

#### Home Screen (Lists Overview)
```
┌─────────────────────────┐
│  👤  Mila          🔔   │  <- Header with avatar
├─────────────────────────┤
│                         │
│  Goedemorgen, Sophie!   │  <- Greeting
│                         │
│  ┌───────────────────┐  │
│  │ 🛒 Wekelijkse     │  │  <- Active list card
│  │    12 items       │  │
│  │    €45.30        │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ 🏠 Huishouden     │  │  <- Category card
│  │    5 items        │  │
│  │    €12.50        │  │
│  └───────────────────┘  │
│                         │
│         (+)             │  <- FAB
└─────────────────────────┘
```

#### List Detail Screen
```
┌─────────────────────────┐
│  ←  Wekelijkse      ⋮   │  <- Header with back
├─────────────────────────┤
│                         │
│  Totaal: €45.30        │  <- Summary bar
│  12 items              │
│                         │
├─────────────────────────┤
│  □ Melk 1L      €1.29  │  <- List items
│  ✓ Brood        €2.50  │
│  □ Kaas         €4.99  │
│  □ Appels 1kg   €2.99  │
│                         │
│  + Item toevoegen       │  <- Add item input
└─────────────────────────┘
```

### 7. Icons & Illustrations

#### Icon Style
- Use Feather Icons or Ionicons
- 24px default size
- 2px stroke width
- Rounded line caps

#### Empty States (Bolt style)
```jsx
<View className="flex-1 items-center justify-center p-8">
  <Image 
    source={require('./empty-cart.png')} 
    className="w-48 h-48 mb-6"
  />
  <Text className="text-xl font-semibold text-bolt-black mb-2">
    Nog geen items
  </Text>
  <Text className="text-base text-bolt-gray-dark text-center">
    Voeg je eerste product toe aan deze lijst
  </Text>
</View>
```

### 8. Implementation with NativeWind

#### tailwind.config.js
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'bolt-green': '#34D186',
        'bolt-green-dark': '#2BB673',
        'bolt-black': '#2E3333',
        'bolt-gray-dark': '#6C7072',
        'bolt-gray-light': '#EBEDF0',
      },
      fontFamily: {
        'sans': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto'],
      },
    },
  },
}
```

### 9. Accessibility

- Minimum touch target: 44x44px
- Color contrast ratio: 4.5:1 minimum
- Clear focus indicators
- Haptic feedback on actions
- Screen reader labels

### 10. Platform Differences

#### iOS
- Use native navigation gestures
- Respect safe areas
- iOS-style modals (slide up)

#### Android
- Material ripple effects
- Android back button support
- Material-style FAB positioning

## Design Assets Needed

1. **App Icon**: Minimalist shopping cart in Bolt green
2. **Splash Screen**: White background with centered logo
3. **Empty State Illustrations**: 
   - Empty shopping list
   - No internet connection
   - No search results
4. **Category Icons**: Simple line icons for each category
5. **Tab Bar Icons**: Home, Lists, Expenses, Profile

## Figma/Design Tool Structure

```
Mila Design System/
├── 🎨 Colors
├── 📝 Typography
├── 🧩 Components/
│   ├── Buttons
│   ├── Cards
│   ├── List Items
│   ├── Inputs
│   └── Navigation
├── 📱 Screens/
│   ├── Onboarding
│   ├── Authentication
│   ├── Home
│   ├── Lists
│   ├── Expenses
│   └── Profile
└── 🎯 Prototypes
```

## References

- Bolt Food App (iOS/Android)
- Study the navigation patterns
- Note the animation timing
- Observe the loading states
- Check the error handling

---

Met deze design reference kunnen we consistent Bolt Food's clean design language toepassen in de Mila app.