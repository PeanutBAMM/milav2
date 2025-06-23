# Project Plan: Mila - Family Shopping List & Budget Tracker

## A. Project Overzicht

### Doel van de app
Een stabiele, gebruiksvriendelijke React Native shopping list app waarmee families gezamenlijk boodschappenlijsten kunnen beheren, uitgaven kunnen tracken, en hun huishouden kunnen organiseren. Focus op betrouwbaarheid, real-time synchronisatie en eenvoudig budgetbeheer.

### Core Features (v1)
1. **Gebruikersauthenticatie** - Veilig account systeem met email/wachtwoord
2. **Boodschappenlijsten CRUD** - Volledig beheer van shopping lists met categorieën
3. **Profiel management** - Beheer gezinsleden én huisdieren binnen het huishouden
4. **Uitgave overzicht** - Track uitgaven per categorie, week en maand
5. **Real-time sync en delen** - Live updates tussen gezinsleden met offline support

### Design Philosophy
- **Design Reference**: Bolt Food app
- **Style**: Clean, minimalistisch, gebruiksvriendelijk
- **Colors**: Bolt green (#34D186) als primary color
- **Typography**: System fonts voor native feel
- **Animations**: Subtiele micro-interactions

### Tech Stack Requirements
- **Framework**: React Native met Expo (SDK 52 of lager)
- **Styling**: NativeWind v2 (stabiele versie, GEEN v4)
- **State Management**: Zustand + React Query combo
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Navigation**: React Navigation v6 (mature versie)
- **Forms**: React Hook Form met Zod validation

### Stabiliteits-first filosofie
- Geen bleeding edge technologie
- Alleen battle-tested dependencies (1000+ weekly downloads)
- Incrementele development met continue verificatie
- Error prevention boven error handling
- Platform parity vanaf dag 1

## B. High-Level Checkpoints

### Milestone 1: Foundation & Authentication (Week 1)

#### 1. Research fase
- Verificatie exacte versies alle dependencies
- Supabase vs Firebase final decision
- Auth flow best practices voor React Native
- Secure storage opties vergelijking

#### 2. Planning fase
- Project structuur ontwerp (feature-based folders)
- Database schema v1 (users, families, auth tables)
- Navigation flow diagram
- Error boundary strategy

#### 3. Implementatie taken
- [ ] Expo project initialisatie met SDK 52
- [ ] TypeScript strict mode configuratie
- [ ] ESLint & Prettier setup met pre-commit hooks
- [ ] Supabase project aanmaken en configureren
- [ ] Basic navigatie structuur (Tab + Stack)
- [ ] Auth screens (Login, Register, Forgot Password)
- [ ] Secure token storage met expo-secure-store
- [ ] Auth context met persistence
- [ ] Protected route handling
- [ ] Build test iOS simulator
- [ ] Build test Android emulator

#### 4. Test & verificatie
- Clean install test op nieuwe machine
- Login/logout flow volledig werkend
- Token refresh mechanisme
- Deep linking voor password reset
- Offline auth state persistence

### Milestone 2: Core Features - Lists & Profiles (Week 2)

#### 1. Research fase
- Optimale database normalisatie voor families
- Real-time subscriptions performance
- Image upload best practices
- Offline-first data strategies

#### 2. Planning fase
- Complete database schema (all tables)
- Component hierarchy voor lists
- Profile management flow
- Data sync strategy

#### 3. Implementatie taken
- [ ] Familie groep CRUD operaties
- [ ] Gezinsleden toevoegen (mensen & huisdieren)
- [ ] Avatar upload functionaliteit
- [ ] Rollen & permissies systeem
- [ ] Shopping list creation/deletion
- [ ] List items met categorieën
- [ ] Check/uncheck met animations
- [ ] Drag & drop voor prioritering
- [ ] Quick-add functionaliteit
- [ ] List templates feature

#### 4. Test & verificatie
- Multi-user testing scenarios
- Permission system volledig getest
- Image upload op beide platforms
- List performance met 100+ items
- Smooth animations 60fps

### Milestone 3: Advanced Features - Expenses & Sync (Week 3)

#### 1. Research fase
- Expense tracking patterns
- Data aggregation strategies
- Chart libraries vergelijking
- Real-time sync edge cases

#### 2. Planning fase
- Expense categorization system
- Reporting UI/UX design
- Sync conflict resolution
- Share mechanism design

#### 3. Implementatie taken
- [ ] Uitgave input bij afvinken items
- [ ] Automatic expense categorization
- [ ] Weekly expense overview
- [ ] Monthly budget reports
- [ ] Category-based analytics
- [ ] Real-time sync implementation
- [ ] Offline queue system
- [ ] Conflict resolution UI
- [ ] Share list via invite link
- [ ] QR code sharing option

#### 4. Test & verificatie
- Expense calculations accuracy
- Report generation performance
- Real-time sync latency test
- Offline/online transition smoothness
- Share flow user testing

### Milestone 4: Polish, Performance & Deploy (Week 4)

#### 1. Research fase
- App store requirements checklist
- Performance profiling tools
- Crash reporting services
- Beta testing platforms

#### 2. Planning fase
- UI polish priority list
- Performance bottlenecks
- Launch strategy
- Marketing materials

#### 3. Implementatie taken
- [ ] Loading skeletons implementation
- [ ] Error boundary UI
- [ ] Empty states design
- [ ] Onboarding flow
- [ ] Push notifications setup
- [ ] App icon & splash screen
- [ ] Performance optimizations
- [ ] Memory leak fixes
- [ ] Bundle size reduction
- [ ] Beta build distribution

#### 4. Test & verificatie
- Full regression testing
- Performance metrics (startup, navigation)
- Memory usage profiling
- Battery consumption test
- Accessibility audit
- Beta user feedback integration

## C. Agent Instructies

### 1. Stability Researcher
**Doel**: Identificeer de meest stabiele versie combinaties voor alle dependencies

**Taken**:
- Analyseer npm downloads trends laatste 12 maanden
- Check breaking changes history (moet > 6 maanden oud zijn)
- Verificatie Expo SDK 52 compatibility matrix
- Cross-dependency version compatibility
- Performance benchmarks per versie
- Known security vulnerabilities scan

**Output**: `tech-stack-research.md` met:
- Exact version recommendations met rationale
- Compatibility verification matrix
- Performance comparison table
- Security audit results
- Migration paths voor toekomst

### 2. Error Pattern Analyst
**Doel**: Identificeer en voorkom veelvoorkomende React Native/Expo problemen

**Onderzoek gebieden**:
- Metro bundler configuratie issues
- iOS build failures (certificates, provisioning)
- Android gradle version conflicts
- JavaScript heap out of memory
- Real-time websocket disconnections
- Offline/online state transitions

**Output**: `error-prevention-guide.md` met:
- Top 20 most common RN/Expo errors
- Preventie strategieën per error
- Early warning signs checklist
- Quick fix procedures
- Platform-specific gotchas

### 3. Architecture Planner
**Doel**: Ontwerp schaalbare maar simpele app architectuur

**Focus punten**:
- Feature-based folder structuur
- Shared component strategy
- API layer abstractie patterns
- State management boundaries
- Type safety implementation
- Code splitting opportunities

**Output**: `architecture-blueprint.md` met:
```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── hooks/
│   │   └── services/
│   ├── lists/
│   ├── profile/
│   └── expenses/
├── shared/
│   ├── components/
│   ├── hooks/
│   └── utils/
├── services/
│   ├── api/
│   ├── storage/
│   └── sync/
└── types/
```

### 4. Database Schema Designer
**Doel**: Ontwerp efficiënte, schaalbare database structuur

**Requirements**:
- Normalized maar praktisch
- Real-time subscriptions friendly
- Offline sync capable
- Privacy/security first
- Performance indexed

**Output**: Complete SQL schema met:
- Table definitions
- Indexes strategy
- RLS policies
- Trigger functions
- Migration scripts

### 5. Performance Optimizer
**Doel**: Identificeer en implementeer performance best practices

**Focus areas**:
- Bundle size optimization
- Lazy loading strategies
- Image optimization
- List virtualization
- Memory management
- Animation performance

**Output**: `performance-guidelines.md` met:
- Measurement baselines
- Optimization techniques
- Platform-specific tips
- Testing procedures

## Development Protocol

### Week-by-Week Focus
- **Week 1**: Foundation only - geen features tot auth werkt perfect
- **Week 2**: Core features - lists en profiles volledig af
- **Week 3**: Advanced features - expenses en real-time sync
- **Week 4**: Polish only - geen nieuwe features, alleen verbeteren

### Daily Standup Questions
1. Werkt alles van gisteren nog?
2. Zijn er nieuwe warnings/errors?
3. Is de app size toegenomen?
4. Beide platforms getest?

### Feature Complete Checklist
- [ ] Feature werkt op iOS
- [ ] Feature werkt op Android
- [ ] Offline scenario getest
- [ ] Error states geïmplementeerd
- [ ] Loading states smooth
- [ ] Accessibility getest
- [ ] Performance gemeten

## Database Schema

```sql
-- Users & Authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Families/Households
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  invite_code VARCHAR(8) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family Members (including pets)
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  member_type VARCHAR(20) CHECK (member_type IN ('person', 'pet')),
  pet_type VARCHAR(50), -- 'dog', 'cat', etc if pet
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  avatar_url TEXT,
  color VARCHAR(7), -- hex color for UI
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shopping Lists
CREATE TABLE shopping_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_template BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- List Items
CREATE TABLE list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID REFERENCES shopping_lists(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50),
  quantity DECIMAL(10,2),
  unit VARCHAR(20),
  is_checked BOOLEAN DEFAULT false,
  checked_by UUID REFERENCES users(id),
  checked_at TIMESTAMP WITH TIME ZONE,
  price DECIMAL(10,2),
  assigned_to UUID REFERENCES family_members(id),
  notes TEXT,
  position INTEGER,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expense Tracking
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  list_id UUID REFERENCES shopping_lists(id),
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  store_name VARCHAR(255),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  receipt_url TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(7),
  budget_limit DECIMAL(10,2),
  is_default BOOLEAN DEFAULT false
);

-- Real-time sync tracking
CREATE TABLE sync_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  operation_type VARCHAR(20) NOT NULL,
  table_name VARCHAR(50) NOT NULL,
  record_id UUID NOT NULL,
  data JSONB NOT NULL,
  synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Success Metrics

### Technical Metrics
- App startup time < 2 seconds
- Navigation transition < 300ms
- List render 100 items < 1 second
- Memory usage < 150MB average
- Crash rate < 0.1%
- Offline sync queue < 5 seconds

### User Experience Metrics
- Onboarding completion > 80%
- Daily active users > 60%
- List sharing usage > 40%
- Expense tracking adoption > 50%
- App store rating > 4.5 stars

### Development Metrics
- Zero critical bugs in production
- Test coverage > 80%
- Build time < 5 minutes
- Deploy time < 30 minutes
- Code review turnaround < 24 hours

## Risk Mitigation

### Technical Risks
1. **Expo SDK version** 
   - Mitigation: Lock op SDK 52, test alle features
   - Backup: Bare workflow als laatste redmiddel

2. **Real-time sync complexity**
   - Mitigation: Start met polling, dan websockets
   - Backup: Manual refresh optie altijd beschikbaar

3. **Offline support edge cases**
   - Mitigation: Queue systeem met retry logic
   - Backup: Clear cache optie voor users

4. **Performance met grote families**
   - Mitigation: Pagination en virtualization
   - Backup: Archive oude data optie

### Business Risks
1. **Feature creep**
   - Mitigation: Strict v1 feature freeze
   - Review: Weekly stakeholder check-in

2. **Platform verschillen**
   - Mitigation: Platform-specific testing protocol
   - Budget: 60/40 tijd split iOS/Android

3. **Schaalbaarbeid**
   - Mitigation: Load testing vanaf week 3
   - Architecture: Microservices-ready design

## Next Steps

1. **Immediate Actions**:
   - Setup development environment
   - Create Supabase project
   - Initialize Expo project met SDK 52
   - Configure TypeScript strict mode

2. **First 48 Hours**:
   - Basic auth implementation
   - Navigation structure
   - Verify builds beide platforms
   - Setup CI/CD pipeline

3. **End of Week 1 Goals**:
   - Working auth flow
   - Basic UI components library
   - Database schema implemented
   - Real device testing