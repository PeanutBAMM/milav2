# Tech Stack Research - Mila Shopping List App

## Executive Summary

Na uitgebreid onderzoek zijn dit de aanbevelingen voor een stabiele, production-ready tech stack:

### 🎯 Recommended Stack
- **Expo SDK**: 51 (NIET 52 of hoger) met Development Builds
- **React Native**: 0.74.x (komt met SDK 51)
- **Backend**: Supabase (Database + Auth + Storage)
- **State Management**: Zustand + React Query
- **Styling**: NativeWind v2
- **Storage**: SecureStore + AsyncStorage (geen MMKV)
- **Development**: expo-dev-client voor development builds

## 1. Expo SDK Version Analysis

### Waarom Expo SDK 51?
- **Released**: Mei 2024 (1+ jaar production-tested)
- **React Native**: 0.74 (stabiel en mature)
- **Support Status**: Nog steeds actief ondersteund
- **iOS 18 SDK**: Voldoet aan Apple's requirements
- **Stability**: Bewezen track record zonder major issues

### Waarom NIET SDK 52+?
- SDK 52 bevat experimentele features (React Server Components)
- New Architecture is default (compatibility risico's)
- SDK 49/50 zijn End of Life (geen security updates meer)
- SDK 53 te nieuw (April 2025 release)

### Exact Version Lock
```json
{
  "expo": "~51.0.0",
  "react-native": "0.74.5",
  "typescript": "^5.3.3",
  "@types/react": "~18.2.79"
}
```

## 2. Backend Comparison: Firebase vs Supabase

### 🏆 Winner: Supabase (voor deze use case)

#### Supabase Voordelen
1. **MCP Tool beschikbaar** - Automatische project setup via mijn tools
2. **PostgreSQL power** - Full SQL capabilities, joins, views
3. **Open source** - Geen vendor lock-in
4. **Betere pricing** - Genereuze free tier
5. **TypeScript generation** - Auto-generated types van database

#### Supabase Implementatie
```sql
-- Complete database schema beschikbaar
-- Migrations via MCP tool
-- Real-time subscriptions out-of-the-box
-- Row Level Security voor veilige multi-tenant
```

#### Waarom niet Firebase?
- Geen MCP tool voor automatisatie
- NoSQL beperkingen voor complexe relaties
- Vendor lock-in risico
- Handmatige setup vereist

### Cost Analysis (100 gezinnen, 1000 lijsten/maand)
- **Supabase Free Tier**: 500MB database, 2GB bandwidth
- **Firebase**: ~$0-10/maand maar kan snel oplopen

## 3. Authentication Architecture

### Recommended Auth Flow

```javascript
// Gebruik Expo SecureStore voor tokens
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

class AuthService {
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    // Extra secure storage voor gevoelige data
    if (data.session?.access_token) {
      await SecureStore.setItemAsync('accessToken', data.session.access_token);
    }
    
    return data.user;
  }

  async autoLogin() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user || null;
  }
}
```

### Security Best Practices
1. **Token Storage**: Alleen Expo SecureStore
2. **Biometric Auth**: Optional voor snelle toegang
3. **Session Management**: 30 minuten timeout
4. **Multi-device**: Track active sessions
5. **Deep Linking**: Voor password reset

## 4. Storage Strategy

### Storage Strategy (Zonder MMKV)

| Data Type | Storage Solution | Reason |
|-----------|-----------------|---------|
| Auth Tokens | Expo SecureStore | Hardware encryption |
| User Preferences | AsyncStorage + Zustand | Stabiel, geen native deps |
| Offline Cache | Supabase + Custom Queue | Controlled sync |
| Images | Supabase Storage | S3-compatible, goedkoper |
| Sensitive Data | SecureStore | Maximum security |

### Implementation Example
```javascript
// Storage Manager - Geen MMKV complexiteit
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

class StorageManager {
  // Tokens (hardware encrypted)
  async saveAuthToken(token) {
    await SecureStore.setItemAsync('authToken', token, {
      requireAuthentication: true // Biometric optional
    });
  }

  // Preferences via Zustand + AsyncStorage
  usePreferences = create(
    persist(
      (set) => ({
        theme: 'light',
        setTheme: (theme) => set({ theme }),
      }),
      {
        name: 'app-preferences',
        storage: createJSONStorage(() => AsyncStorage),
      }
    )
  );

  // Supabase handles real-time sync
}
```

## 5. Complete Dependency List

### Core Dependencies
```json
{
  "dependencies": {
    "expo": "51.0.0",
    "expo-dev-client": "4.0.29",
    "react": "18.2.0",
    "react-native": "0.74.5",
    "@supabase/supabase-js": "2.50.0",
    "@react-native-async-storage/async-storage": "1.23.1",
    "@react-navigation/native": "6.1.17",
    "@react-navigation/stack": "6.3.29",
    "@react-navigation/bottom-tabs": "6.5.20",
    "@react-navigation/native-stack": "6.9.26",
    "react-native-screens": "3.31.1",
    "react-native-safe-area-context": "4.10.5",
    "react-native-gesture-handler": "2.16.1",
    "zustand": "5.0.5",
    "@tanstack/react-query": "5.81.2",
    "react-hook-form": "7.58.1",
    "zod": "3.25.67",
    "nativewind": "2.0.11",
    "tailwindcss": "3.3.0",
    "expo-secure-store": "13.0.2",
    "expo-status-bar": "1.12.1",
    "@expo/vector-icons": "14.0.3",
    "@hookform/resolvers": "5.1.1"
  },
  "devDependencies": {
    "@types/react": "18.2.79",
    "typescript": "5.3.3",
    "@typescript-eslint/eslint-plugin": "8.34.1",
    "@typescript-eslint/parser": "8.34.1",
    "eslint": "8.57.1",
    "eslint-config-prettier": "10.1.5",
    "eslint-plugin-react": "7.37.5",
    "eslint-plugin-react-hooks": "5.2.0",
    "prettier": "3.6.0",
    "husky": "9.1.7",
    "lint-staged": "16.1.2",
    "@babel/core": "7.24.0"
  }
}
```

### Development Build Setup

#### Initial Setup
```bash
# Create expo project
npx create-expo-app milav2 --template blank-typescript
cd milav2

# Install dev client
npx expo install expo-dev-client

# Install dependencies
npm install

# Create development builds
eas build --profile development --platform all

# Of lokaal builden:
npx expo run:ios
npx expo run:android
```

#### Platform Configuration
```json
// eas.json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

## 6. Architecture Patterns

### State Management Architecture
```typescript
// Zustand for local state
interface AppStore {
  user: User | null;
  selectedFamily: string | null;
  setUser: (user: User | null) => void;
  setSelectedFamily: (familyId: string) => void;
}

// React Query for server state
const useShoppingLists = (familyId: string) => {
  return useQuery({
    queryKey: ['lists', familyId],
    queryFn: () => fetchListsFromFirestore(familyId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

### Folder Structure
```
src/
├── features/           # Feature-based modules
│   ├── auth/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── hooks/
│   │   └── services/
│   ├── lists/
│   ├── profile/
│   └── expenses/
├── shared/            # Shared code
│   ├── components/
│   ├── hooks/
│   └── utils/
├── services/          # External services
│   ├── firebase/
│   ├── storage/
│   └── analytics/
└── types/            # TypeScript definitions
```

## 7. Performance Optimizations

### List Performance
```javascript
// Use FlashList instead of FlatList
import { FlashList } from "@shopify/flash-list";

<FlashList
  data={items}
  renderItem={renderItem}
  estimatedItemSize={72}
  recycleItems={true}
/>

// Offline Queue voor Supabase
class OfflineQueue {
  private queue: any[] = [];
  
  async addToQueue(operation: any) {
    this.queue.push(operation);
    await AsyncStorage.setItem('offline_queue', JSON.stringify(this.queue));
  }
  
  async syncWhenOnline() {
    // Process queue when connection restored
    for (const op of this.queue) {
      await this.executeOperation(op);
    }
    this.queue = [];
    await AsyncStorage.removeItem('offline_queue');
  }
}
```

### Image Optimization
```javascript
// Use expo-image for better performance
import { Image } from 'expo-image';

<Image
  source={{ uri: avatarUrl }}
  style={styles.avatar}
  cachePolicy="memory-disk"
  contentFit="cover"
  transition={200}
/>
```

## 8. Known Issues & Workarounds

### Issue 1: Supabase met Development Builds
**Problem**: Geen native dependencies, werkt overal
**Solution**: Geen workarounds nodig!
```javascript
// Werkt direct in development builds
const supabase = createClient(url, key);
```

### Issue 2: NativeWind v2 with Expo SDK 51
**Problem**: Some styling inconsistencies
**Solution**: Use stable className patterns
```jsx
// Good
<View className="flex-1 bg-white">

// Avoid dynamic classes
<View className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}>
```

### Issue 3: Development Build Workflow
**Setup**: Eenmalige setup, daarna smooth sailing
```bash
# First time only
eas build --profile development

# Daily development
npx expo start --dev-client

# Scan QR with your dev build app
```

## 9. Testing Strategy

### Unit Testing
```json
{
  "jest": "^29.7.0",
  "@testing-library/react-native": "^12.4.5",
  "@testing-library/jest-native": "^5.4.3"
}
```

### E2E Testing
```bash
# Maestro for E2E testing (simpler than Detox)
npx maestro test flows/

# Example Maestro flow
# flows/login.yaml
appId: com.yourcompany.mila
---
- launchApp
- tapOn: "Sign In"
- inputText: "test@example.com"
- tapOn: "Password"
- inputText: "password123"
- tapOn: "Login"
- assertVisible: "Shopping Lists"
```

## 10. Deployment Preparation

### Build Configuration
```json
// app.json
{
  "expo": {
    "name": "Mila",
    "slug": "mila-shopping-list",
    "version": "1.0.0",
    "runtimeVersion": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourcompany.mila",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.yourcompany.mila",
      "versionCode": 1
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

### Environment Variables
```javascript
// .env.local
EXPO_PUBLIC_SUPABASE_URL=xxx
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxx

// Gebruik in code
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
```

## Development Workflow

### Daily Development
```bash
# Start metro bundler
npx expo start --dev-client

# Run on specific platform
npx expo run:ios
npx expo run:android

# Clear cache when needed
npx expo start --clear
```

### GitHub Workflow (CLI)
```bash
# Use gh CLI instead of MCP
gh repo create mila-app --private
gh issue create --title "Setup Supabase"
gh pr create --title "Add auth flow"
```

## Testing Roadmap

### Week 3: Jest Setup
- Unit tests voor business logic
- Component testing met React Testing Library
- Mock Supabase client voor tests

### Week 4: Maestro E2E
- User flow testing
- Cross-platform test scenarios
- CI/CD integration

## Conclusion

Deze tech stack biedt de beste balans tussen:
- **Stabiliteit**: Alleen proven, stabiele versies
- **Automatisatie**: Supabase MCP voor snelle setup
- **Performance**: Geen MMKV complexity, toch snel genoeg
- **Developer Experience**: Development builds vanaf begin
- **Budget**: Supabase free tier zeer genereus

Start met deze exact versies en upgrade pas na 6 maanden productie-ervaring.