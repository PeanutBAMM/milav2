# Mila Project - Development Guidelines & Memory

## Project Context
Building a React Native family shopping list app with expense tracking. Focus on stability, real-time sync, and family collaboration.

## Core Development Rules

### 🛑 Stability-First Philosophy
- **NO bleeding edge**: Alleen dependencies met proven track record
- **Version locks**: Exact versions, geen ^ of ~ in package.json
- **Test incrementeel**: Elke feature moet werken op beide platforms voor je verder gaat
- **Error prevention**: Beter om features te skippen dan instabiliteit te introduceren

### 📱 Tech Stack
See `tech-stack-research.md` for exact versions and rationale.

**Key rules:**
- NO @latest tags - use exact versions only
- Lock all dependencies with exact versions
- Test every dependency on both platforms before adding

### 🔄 Development Workflow

#### Daily Checkpoint Protocol
Start elke dag met deze checks:
```bash
# 1. Clean install test
rm -rf node_modules && npm install

# 2. Platform builds
npm run ios
npm run android

# 3. Type checking
npm run typecheck

# 4. Lint check
npm run lint
```

#### Error Response Protocol
Bij ELKE error:
1. **STOP** - Geen nieuwe code tot error opgelost
2. **Document** - In `troubleshooting.md`
3. **Rollback** - Git reset naar laatste werkende staat
4. **Research** - Root cause analysis
5. **Fix** - Targeted oplossing
6. **Verify** - Test alle features opnieuw

### 📦 Dependency Management

#### Addition Checklist
Voor ELKE nieuwe dependency:
- [ ] Weekly downloads > 1,000?
- [ ] Last breaking change > 6 months ago?
- [ ] TypeScript types available?
- [ ] Expo compatible verified?
- [ ] Alternative packages considered?
- [ ] Installed in isolation first?
- [ ] Both platforms tested?


#### Forbidden Packages
- ❌ Alpha/Beta/RC versions
- ❌ Packages with "experimental" in name
- ❌ Dependencies requiring linking (pre-Expo SDK 49)
- ❌ Packages with native code zonder Expo support

### 🏗️ Code Standards

#### File Organization
```
src/features/[feature]/
├── components/     # Feature-specific components
├── screens/        # Screen components
├── hooks/          # Custom hooks
├── services/       # API calls
├── types/          # TypeScript types
└── utils/          # Helper functions
```

#### Naming Conventions
- **Components**: PascalCase (UserProfile.tsx)
- **Hooks**: camelCase with 'use' prefix (useAuth.ts)
- **Utils**: camelCase (formatDate.ts)
- **Types**: PascalCase with 'T' prefix (TUser.ts)
- **Constants**: UPPER_SNAKE_CASE

#### Import Order
```typescript
// 1. React/React Native
import React from 'react';
import { View, Text } from 'react-native';

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query';

// 3. Local imports
import { Button } from '@/shared/components';
import { useAuth } from '@/features/auth/hooks';

// 4. Types
import type { TUser } from '@/types';
```

### 🧪 Testing Requirements

#### Before Committing
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] iOS simulator tested
- [ ] Android emulator tested
- [ ] Offline mode tested
- [ ] No console warnings

#### Feature Complete Definition
Een feature is PAS complete als:
1. Werkt op iOS zonder errors
2. Werkt op Android zonder errors
3. Offline scenario's afgehandeld
4. Loading states zichtbaar
5. Error states user-friendly
6. Performance acceptable (<300ms interactions)

### 🚫 Verboden Practices

#### NEVER Do This
- 🚫 `npm install <package>@latest`
- 🚫 `npx create-expo-app@latest` (gebruik specifieke versie)
- 🚫 Skip platform testing ("works on iOS so Android is fine")
- 🚫 Ignore TypeScript errors ("// @ts-ignore")
- 🚫 Direct state mutations
- 🚫 Inline styles in components
- 🚫 Console.log in production code
- 🚫 Hardcoded API URLs
- 🚫 Commit without testing offline mode

#### Performance Anti-patterns
- 🚫 Unnecessary re-renders (use React.memo)
- 🚫 Large images without optimization
- 🚫 Synchronous storage operations
- 🚫 Unvirtualized long lists
- 🚫 Memory leaks (cleanup useEffect)

### 📝 Documentation Requirements

#### Code Comments
- Alleen voor complexe business logic
- GEEN obvious comments ("// Set user name")
- JSDoc voor publieke functions

#### README Updates
Update README.md wanneer:
- Nieuwe setup stappen nodig
- Environment variables toegevoegd
- Major features completed

### 🔍 Debugging Tools

#### Reactotron Setup
```javascript
// Alleen in development
if (__DEV__) {
  import('./ReactotronConfig').then(() => 
    console.log('Reactotron Configured')
  );
}
```

#### Flipper Integration
- Network inspection
- React DevTools
- Layout inspector
- Crash reporter

### 🚀 Release Checklist

#### Before Production
- [ ] All features tested on real devices
- [ ] Performance profiling completed
- [ ] Memory leaks checked
- [ ] Bundle size < 50MB
- [ ] Crash-free rate > 99.9%
- [ ] Offline mode fully functional
- [ ] Security audit passed

### 💡 Quick Reference

#### Common Commands
```bash
# Development
npm start                    # Start Expo
npm run ios                 # iOS simulator  
npm run android             # Android emulator
npm run typecheck           # TypeScript check
npm run lint                # ESLint
npm run test                # Jest tests

# Development Builds (SDK 51)
npx expo start --dev-client # Start with dev client
npx expo run:ios           # Local iOS build
npx expo run:android       # Local Android build

# Building
eas build --profile development --platform all  # Dev builds
eas build --platform ios    # iOS production
eas build --platform android # Android production

# Debugging
npx expo doctor            # Check setup
npx react-native info      # System info
adb logcat                 # Android logs
```

#### Initial Project Setup
See `tech-stack-research.md` section 5 for complete setup instructions.

#### Troubleshooting Contacts
- Expo: forums.expo.dev
- React Native: github.com/react-native-community
- Supabase: github.com/supabase/supabase/discussions

## Project-Specific Notes

### Current Sprint Focus
- Week 1: Foundation & Authentication
- Prioriteit: Stabiele auth flow voor family features

### Design Guidelines
- **Reference**: Bolt Food app design patterns
- **Primary Color**: #34D186 (Bolt green)
- **See**: `/design-reference.md` voor complete style guide
- **Component Library**: Build reusable Bolt-style components

### Known Issues
- None yet (update as discovered)

### Architecture Decisions
- Zustand voor local state (simple, TypeScript friendly)
- React Query voor server state (caching, sync)
- Feature-based folders (scalability)
- Supabase voor backend (real-time, auth, storage)
- NativeWind v2 voor Tailwind-style styling
- Development builds met expo-dev-client (vanaf start)
- Geen MMKV (complexiteit vermijden)

### Development Workflow Memories
- **Standard Workflow**: 
  - First think through the problem, read the codebase for relevant files, and write a plan to projectplan.md.
  - The plan should have a list of todo items that you can check off as you complete them.
  - Before you begin working, check in with me and I will verify the plan.
  - Then, begin working on the todo items, marking them as complete as you go.
  - Please every step of the way just give me a high level explanation of what changes you made.
  - Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
  - Finally, add a review section to the todo.md file with a summary of the changes you made and any other relevant information.

### CI/CD Setup

**Simple CI enabled**: Every push runs TypeScript, ESLint, and Expo checks automatically.
See `.github/CI.md` for details.

### Documentation System

#### Auto-Organization
- **Script**: `docs/scripts/organize-docs.js`
- **Command**: `npm run organize-docs`
- **Hook**: Pre-commit automatically organizes .md files

#### Structure
```
docs/
├── 01-getting-started/     # Setup, installation
├── 02-development/         # Workflow, standards
├── 03-react-native/        # RN specific
├── 04-expo-sdk/           # Expo specific
├── 05-ci-cd/              # CI/CD, GitHub Actions
├── 06-testing/            # Testing
├── 07-architecture/       # Design patterns
├── 08-deployment/         # Build, release
├── 09-troubleshooting/    # Issues, fixes
├── 10-project-management/ # Planning, progress
└── scripts/               # Organization scripts
```

#### Categorization Rules
- Filename-based matching has priority
- Then content-based keyword matching
- Default category: 02-development

---

Remember: **Stability > Features**. Een werkende app met 3 features is beter dan een crashende app met 10 features.