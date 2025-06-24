# Mila Project - Development Guidelines

<project-context>
## Project Context
Building a React Native family shopping list app with expense tracking. Focus on stability, real-time sync, and family collaboration.

### Base Guidelines
This project follows all general development rules from:
- [Apps Workspace Guidelines](../CLAUDE.md)
- [General Documentation](../docs/general/README.md)

The rules below are PROJECT-SPECIFIC extensions and overrides.

## Mila-Specific Configuration

### 📱 Tech Stack (LOCKED VERSIONS)
See [tech-stack-research.md](../docs/projects/mila/implementation/tech-stack-research.md) for exact versions and rationale.

**Core Dependencies**:
- **Framework**: React Native with Expo SDK 51 (51.0.39)
- **Navigation**: React Navigation v6
- **State Management**: Zustand (5.0.5) + React Query (5.81.2)
- **Backend**: Supabase (2.50.0)
- **Styling**: NativeWind v2 (2.0.11) - NOT v4
- **Forms**: React Hook Form (7.58.1) + Zod (3.25.67)

**Key rules**:
- NO @latest tags - use exact versions only
- Lock all dependencies with exact versions
- Test every dependency on both platforms before adding

### Design Philosophy
- **Reference**: Bolt Food app design patterns
- **Primary Color**: #34D186 (Bolt green)
- **Typography**: System fonts for native feel
- **Animations**: Subtle micro-interactions
- **Component Library**: Build reusable Bolt-style components
- **See**: [Design Reference](../docs/projects/mila/architecture/design-reference.md)

## Project-Specific Workflow

### Standard Mila Workflow
1. **Think first**: Read codebase for relevant files
2. **Plan**: Write plan to projectplan.md with todo items
3. **Verify**: Check plan with user before proceeding
4. **Implement**: Work on todos, marking complete as you go
5. **Communicate**: High-level explanation of changes at each step
6. **Simplicity**: Every change should impact minimal code
7. **Review**: Add summary to projectplan.md when done

### Current Sprint Focus
- **Week 1**: Foundation & Authentication
- **Priority**: Stable auth flow for family features
- **Status**: See [Project Plan](../docs/projects/mila/implementation/projectplan.md)

## Architecture Decisions

### Why These Choices
- **Zustand**: Simple, TypeScript friendly local state
- **React Query**: Powerful server state with caching
- **Feature-based folders**: Scalability and clarity
- **Supabase**: Real-time, auth, storage in one
- **NativeWind v2**: Stable Tailwind-style styling
- **Development builds**: expo-dev-client from start
- **No MMKV**: Avoid unnecessary complexity

### Project Structure
```
src/features/[feature]/
├── components/     # Feature-specific components
├── screens/        # Screen components
├── hooks/          # Custom hooks
├── services/       # API calls
├── types/          # TypeScript types
└── utils/          # Helper functions
```

## Testing Requirements

### Feature Complete Definition
A feature is ONLY complete when:
1. ✅ Works on iOS without errors
2. ✅ Works on Android without errors
3. ✅ Offline scenarios handled
4. ✅ Loading states visible
5. ✅ Error states user-friendly
6. ✅ Performance acceptable (<300ms interactions)

## Project Commands

### Development
```bash
# Start Expo
npm start

# Platform specific
npm run ios       # iOS simulator  
npm run android   # Android emulator

# Quality checks
npm run typecheck # TypeScript check
npm run lint      # ESLint

# CI Integration
npm run push      # Push + auto CI monitor
```

### Building
```bash
# Development builds
npx expo run:ios       # Local iOS build
npx expo run:android   # Local Android build

# Production builds
eas build --platform ios      # iOS production
eas build --platform android  # Android production
```

## Known Issues & Solutions

### Current Issues
- None yet (update as discovered)

### Common Solutions
- **Metro cache**: `npx expo start --clear`
- **iOS build fail**: Check certificates in Apple Developer
- **Android build fail**: Check gradle version compatibility
- **Type errors**: Run `npm run typecheck` before push

<quick-links>
## Quick Links

### Essential Docs
- [Project Plan](../docs/projects/mila/implementation/projectplan.md) - Full roadmap
- [Tech Stack Research](../docs/projects/mila/implementation/tech-stack-research.md) - Version decisions
- [Session Summary](../docs/projects/mila/implementation/session-summary-2025-01-23.md) - Latest updates
- [PR Workflow](../docs/projects/mila/implementation/pr-workflow.md) - Code review process

---

Remember: **Stability > Features**. A working app with 3 features is better than a crashing app </project-context>
with</quick-links>
 10 features.