# Mila - Family Shopping List App

<overview>
Een React Native shopping list app voor families met expense tracking, gebouwd met Expo SDK 51.
</overview>

<tech-stack>
## Tech Stack

- **Expo SDK**: 51.0.0 (stabiele versie)
- **React Native**: 0.74.5
- **TypeScript**: Strict mode enabled
- **Navigation**: React Navigation v6
- **Styling**: NativeWind v2 (Tailwind CSS)
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **State Management**: Zustand + React Query (TODO)
- **CI/CD**: ✅ GitHub Actions (automatic checks on every push)
- **Branch Strategy**: Feature branches with PR workflow

</tech-stack>
## Ontwikkeling

### Prerequisites

- Node.js 18+
- npm of yarn
- Expo CLI
- iOS Simulator (Mac) of Android Emulator

### Setup

1. Clone de repository
2. Installeer dependencies:

   ```bash
   npm install
   ```

3. Kopieer `.env.local.example` naar `.env.local` en vul je Supabase credentials in

4. Start de development server:
   ```bash
   npm start
   ```

### ⚠️ Security Note

**Environment variables en secrets worden NIET in de codebase opgeslagen.** 
- Voor lokale development: gebruik `.env.local` (in .gitignore)
- Voor EAS builds: gebruik EAS Secrets (zie [EAS Secrets Setup Guide](./docs/05-ci-cd/eas-secrets-setup.md))

### Available Scripts

- `npm start` - Start Expo development server
- `npm run ios` - Run op iOS simulator
- `npm run android` - Run op Android emulator
- `npm run typecheck` - TypeScript type checking
- `npm run lint` - ESLint checking
- `npm run push` - Git push met automatische CI monitoring
- `npm run ci:status` - Check laatste CI runs

### Development Workflow

1. **Feature Development**:
   ```bash
   git checkout -b feature/feature-name
   # Make changes
   git push -u origin feature/feature-name
   gh pr create
   ```

2. **CI Monitoring**:
   - Gebruik `npm run push` voor automatische CI monitoring
   - PR's krijgen automatisch quality checks

### Development Builds

Voor features die native modules vereisen:

```bash
# Lokale development build
npx expo run:ios
npx expo run:android

# EAS development build
eas build --profile development --platform all
```

## Project Structuur

```
src/
├── features/           # Feature-based modules
│   ├── auth/          # Authentication
│   ├── lists/         # Shopping lists
│   ├── expenses/      # Expense tracking
│   └── profile/       # User profile
├── navigation/        # React Navigation setup
├── shared/            # Shared components
├── services/          # API services
└── types/            # TypeScript types
```

## Design System

De app gebruikt het Bolt Food design system met:

- Primary color: `#34D186` (Bolt green)
- Font: System fonts
- Border radius: 8-24px
- Shadows: Minimaal gebruik

## Database Schema

Zie `projectplan.md` voor het complete database schema.

## 📚 Documentation

All project documentation is organized in the [`docs/`](./docs) directory:

- [📖 Documentation Index](./docs/README.md) - Complete overview of all guides
- [🚀 Getting Started](./docs/01-getting-started/) - Setup and installation
- [💻 Development](./docs/02-development/) - Development workflow and standards
- [🔧 Troubleshooting](./docs/09-troubleshooting/) - Common issues and solutions
- [📊 Project Management](./docs/10-project-management/) - Planning and progress

## Development Guidelines

Zie `/CLAUDE.md` voor development regels en workflow.

</tech-stack>