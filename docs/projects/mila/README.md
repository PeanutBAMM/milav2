# Mila Project Documentation

Family shopping list app with expense tracking built with React Native and Expo.

<project-info>
- **Type**: React Native (Expo SDK 51)
- **Status**: Active Development
- **Current Sprint**: Week 1 - Authentication
- **Primary Goal**: Stable, real-time family collaboration app
</project-info>

<quick-links>
- [Project CLAUDE.md](../../../mila/CLAUDE.md) - Project-specific guidelines
- [Project Plan](./implementation/projectplan.md) - Complete roadmap and milestones
- [Tech Stack](./implementation/tech-stack-research.md) - Technology decisions
</quick-links>

<architecture>
- [Design Reference](./architecture/design-reference.md) - Bolt Food style guide
</architecture>

<implementation>
- [Project Plan](./implementation/projectplan.md) - Detailed 4-week roadmap
- [Tech Stack Research](./implementation/tech-stack-research.md) - Version analysis and decisions
- [Implementation Plan](./implementation/implementation-plan.md) - Initial implementation strategy
- [EAS Secrets Setup](./implementation/eas-secrets-setup.md) - Environment configuration
- [PR Workflow](./implementation/pr-workflow.md) - Code review process
- [Session Summary](./implementation/session-summary-2025-01-23.md) - Latest development updates
</implementation>

<features>
Features will be documented as they are implemented.
</features>

<api>
API documentation will be added as services are created.
</api>

<scripts>
Located in [`mila/scripts/`](../../../mila/scripts/):
- [`pre-install-check.js`](../../../mila/scripts/pre-install-check.js) - Enforces exact versions (no ^ or ~)
- [`check-tech-stack-compliance.js`](../../../mila/scripts/check-tech-stack-compliance.js) - Validates dependencies
- [`create-icon.js`](../../../mila/scripts/create-icon.js) - Generate app icons
- [`create-splash-jimp.js`](../../../mila/scripts/create-splash-jimp.js) - Generate splash screens
</scripts>

<commands>
```bash
# Daily development
npm start           # Start Expo
npm run ios        # iOS simulator
npm run android    # Android emulator

# Quality checks
npm run typecheck  # TypeScript validation
npm run lint       # ESLint checks
npm run push       # Push with CI monitoring

# Building
npx expo run:ios     # Local iOS build
npx expo run:android # Local Android build
eas build            # Cloud builds
```
</commands>

<status>
### Completed ✅
- Project setup with Expo SDK 51
- Navigation structure
- Authentication screens
- Supabase integration
- CI/CD pipeline

### In Progress 🚧
- Auth context implementation
- Protected routes
- Family creation flow

### Upcoming 📋
- Shopping list CRUD
- Real-time sync
- Expense tracking
- Performance optimization
</status>

---

**Navigation**: [Back to General](../../general/README.md) | [Mila Project](../../../mila/)