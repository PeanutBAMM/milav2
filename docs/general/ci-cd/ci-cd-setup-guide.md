# CI/CD Setup Guide - Van 0 naar Automatische Code Checks

Deze guide helpt je stap-voor-stap om dezelfde CI/CD pipeline op te zetten als in het Mila project.

## Prerequisites

- GitHub account
- GitHub CLI geïnstalleerd (`gh`)
- Node.js 18+
- Git repository

## Stap 1: GitHub Repository Setup

### 1.1 Initialiseer Git (als nog niet gedaan)
```bash
git init
git branch -m main
```

### 1.2 Maak .gitignore
```bash
cat > .gitignore << 'EOF'
node_modules/
.env
.env.local
.expo/
dist/
build/
*.log
.DS_Store
docs/  # Optional: als je docs lokaal wilt houden
EOF
```

### 1.3 Push naar GitHub
```bash
# Via GitHub CLI (makkelijkst)
gh repo create PROJECT_NAME --private --source . --remote origin --push

# Of manually via github.com
```

## Stap 2: Basic CI Workflow

### 2.1 Maak workflow directories
```bash
mkdir -p .github/workflows
```

### 2.2 Maak basis CI workflow
```bash
cat > .github/workflows/checks.yml << 'EOF'
name: CI Checks

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  check:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
      with:
        submodules: false
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
      working-directory: mila  # Pas aan naar jouw project directory
    
    - name: TypeScript Check
      run: npm run typecheck
      working-directory: mila
    
    - name: ESLint Check
      run: npm run lint
      working-directory: mila
    
    - name: Expo Doctor
      run: npx expo-doctor
      working-directory: mila
EOF
```

## Stap 3: Enhanced Compliance Checks

### 3.1 Voeg extra checks toe aan workflow
```yaml
    # Voeg deze toe aan checks.yml na Expo Doctor:
    
    - name: Check Exact Versions
      run: npm run verify-versions
      working-directory: mila
    
    - name: Check for Console Logs
      run: |
        if grep -r "console\.log" src/ --exclude-dir=node_modules; then
          echo "❌ Found console.log in production code!"
          exit 1
        else
          echo "✅ No console.log statements found"
        fi
      working-directory: mila
    
    - name: Security Audit
      run: npm audit --audit-level=high
      working-directory: mila
      continue-on-error: true
    
    - name: Tech Stack Compliance Check
      run: npm run check-compliance
      working-directory: mila
```

### 3.2 Maak verify-versions script
Voeg toe aan package.json scripts:
```json
"verify-versions": "node -e \"const pkg=require('./package.json');const invalid=[...Object.entries(pkg.dependencies||{}),...Object.entries(pkg.devDependencies||{})].filter(([,v])=>v.includes('^')||v.includes('~'));if(invalid.length){console.error('ERROR: Found version ranges:',invalid.map(([k,v])=>k+':'+v));process.exit(1);}else{console.log('✓ All versions are exact');}\""
```

### 3.3 Maak tech stack compliance checker
```bash
mkdir -p mila/scripts
cat > mila/scripts/check-tech-stack-compliance.js << 'EOF'
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

let hasErrors = false;
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));

console.log('🔍 Checking Tech Stack Compliance...\n');

// Check Expo SDK version
console.log('1️⃣ Checking Expo SDK version...');
const expoVersion = packageJson.dependencies.expo;
if (!expoVersion || !expoVersion.startsWith('51.0.')) {
  console.error('❌ Expo SDK must be 51.0.x, found:', expoVersion);
  hasErrors = true;
} else {
  console.log('✅ Expo SDK 51 confirmed:', expoVersion);
}

// Add more checks as needed...

if (hasErrors) {
  console.error('\n❌ Tech stack compliance check FAILED!');
  process.exit(1);
} else {
  console.log('\n✅ Tech stack compliance check PASSED!');
  process.exit(0);
}
EOF

chmod +x mila/scripts/check-tech-stack-compliance.js
```

Voeg toe aan package.json scripts:
```json
"check-compliance": "node scripts/check-tech-stack-compliance.js"
```

## Stap 4: Claude CI Monitoring Setup

### 4.1 Maak CI watch script
```bash
mkdir -p scripts
cat > scripts/ci-watch.sh << 'EOF'
#!/bin/bash

# CI Watcher Script - Automatically monitors CI after push
# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 CI Monitor Started${NC}"
echo "================================"

# Get the latest run ID
echo -e "${YELLOW}Finding latest CI run...${NC}"
RUN_ID=$(gh run list --limit 1 --json databaseId -q '.[0].databaseId')

if [ -z "$RUN_ID" ]; then
    echo -e "${RED}❌ No CI runs found${NC}"
    exit 1
fi

echo -e "Monitoring run: #$RUN_ID"

# Wait for CI to complete
STATUS="in_progress"
DOTS=""
while [ "$STATUS" = "in_progress" ] || [ "$STATUS" = "queued" ]; do
    sleep 3
    STATUS=$(gh run view $RUN_ID --json status -q '.status' 2>/dev/null || echo "in_progress")
    DOTS="${DOTS}."
    echo -ne "\r${YELLOW}Waiting for CI to complete${DOTS}${NC}"
done

echo -e "\n"

# Get the conclusion
CONCLUSION=$(gh run view $RUN_ID --json conclusion -q '.conclusion')

if [ "$CONCLUSION" = "success" ]; then
    echo -e "${GREEN}✅ All CI checks passed!${NC}"
else
    echo -e "${RED}❌ CI Failed!${NC}"
    echo -e "\n${YELLOW}📥 Fetching detailed logs...${NC}"
    gh run view $RUN_ID --log-failed
    exit 1
fi
EOF

chmod +x scripts/ci-watch.sh
```

### 4.2 Voeg npm scripts toe
Voeg toe aan package.json:
```json
"scripts": {
  "push": "git push && bash ../scripts/ci-watch.sh",
  "ci:watch": "bash ../scripts/ci-watch.sh",
  "ci:status": "gh run list --limit 5"
}
```

## Stap 5: Eerste Push & Test

### 5.1 Commit alle changes
```bash
git add .
git commit -m "Setup CI/CD pipeline with automated checks"
```

### 5.2 Push en bekijk CI
```bash
git push origin main
```

### 5.3 Check status
```bash
# Bekijk CI status op GitHub
gh run list --limit 5

# Of ga naar: https://github.com/USERNAME/PROJECT/actions
```

## Stap 6: Branch Protection (Optional)

Als je repository public is:
```bash
gh api repos/USERNAME/PROJECT/branches/main/protection \
  --method PUT \
  -f required_status_checks[strict]=true \
  -f 'required_status_checks[contexts][]=check' \
  -f enforce_admins=false
```

## Stap 7: Test de Workflow

### 7.1 Test met opzettelijke fout
```bash
# Maak een TypeScript error
echo "const x: string = 123;" > mila/src/test-error.ts

# Commit en push
git add . && git commit -m "Test: Force CI failure"

# Gebruik het nieuwe push commando
cd mila && npm run push
```

### 7.2 Bekijk automatische monitoring
Het script zal:
- Wachten tot CI klaar is
- ✅ Tonen bij succes
- ❌ Error logs tonen bij failure

## Troubleshooting

### GitHub CLI niet geauthenticeerd?
```bash
gh auth login
```

### Working directory errors?
Pas `working-directory` aan in workflows naar jouw project structuur.

### Permission denied voor scripts?
```bash
chmod +x scripts/*.sh
```

## Next Steps

1. **Customize checks** - Voeg project-specifieke checks toe
2. **Add badges** - Voeg CI status badge toe aan README
3. **Setup notifications** - GitHub notifications voor failures
4. **Document standards** - Maak .github/CI.md voor team

## Claude Integration

Voor Claude gebruikers: vanaf nu kan Claude bij elke push automatisch:
1. CI status monitoren
2. Bij failures logs analyseren
3. Fixes voorstellen
4. Direct implementeren na goedkeuring

Gebruik gewoon `npm run push` in plaats van `git push`!

---

🎉 **Gefeliciteerd!** Je hebt nu een volledig geautomatiseerde CI/CD pipeline met:
- TypeScript checking
- Code quality (ESLint)
- Security scanning
- Exact version enforcement
- Console.log detection
- Custom compliance checks
- Automatic monitoring