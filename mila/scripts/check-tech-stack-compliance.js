#!/usr/bin/env node

/**
 * Tech Stack Compliance Checker
 * Validates that the codebase follows tech-stack-research.md requirements
 */

const fs = require('fs');
const path = require('path');

let hasErrors = false;

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));

console.log('🔍 Checking Tech Stack Compliance...\n');

// 1. Check Expo SDK version
console.log('1️⃣ Checking Expo SDK version...');
const expoVersion = packageJson.dependencies.expo;
if (!expoVersion || !expoVersion.startsWith('51.0.')) {
  console.error('❌ Expo SDK must be 51.0.x, found:', expoVersion);
  hasErrors = true;
} else {
  console.log('✅ Expo SDK 51 confirmed:', expoVersion);
}

// 2. Check forbidden SDK versions
console.log('\n2️⃣ Checking for forbidden SDK versions...');
if (expoVersion && (expoVersion.includes('52.') || expoVersion.includes('53.'))) {
  console.error('❌ SDK 52/53 are forbidden (too new). Use SDK 51 only!');
  hasErrors = true;
} else {
  console.log('✅ No forbidden SDK versions found');
}

// 3. Check React Native version
console.log('\n3️⃣ Checking React Native version...');
const rnVersion = packageJson.dependencies['react-native'];
if (!rnVersion || !rnVersion.startsWith('0.74.')) {
  console.error('❌ React Native must be 0.74.x for SDK 51, found:', rnVersion);
  hasErrors = true;
} else {
  console.log('✅ React Native version correct:', rnVersion);
}

// 4. Check required dependencies
console.log('\n4️⃣ Checking required dependencies...');
const requiredDeps = {
  '@supabase/supabase-js': '2.50.0',
  'zustand': '5.0.5',
  '@tanstack/react-query': '5.81.2',
  'nativewind': '2.0.11',
  'expo-secure-store': '13.0.2',
  'expo-updates': '0.25.28'
};

for (const [dep, version] of Object.entries(requiredDeps)) {
  if (!packageJson.dependencies[dep]) {
    console.error(`❌ Missing required dependency: ${dep}`);
    hasErrors = true;
  } else if (packageJson.dependencies[dep] !== version) {
    console.error(`❌ ${dep} must be version ${version}, found: ${packageJson.dependencies[dep]}`);
    hasErrors = true;
  } else {
    console.log(`✅ ${dep} version correct`);
  }
}

// 5. Check for forbidden packages
console.log('\n5️⃣ Checking for forbidden packages...');
const forbiddenPackages = [
  '@react-native-community/async-storage', // Use @react-native-async-storage/async-storage
  'react-native-mmkv', // Explicitly avoided in tech stack
  'firebase', // Using Supabase instead
  '@firebase/app', // Using Supabase instead
];

for (const pkg of forbiddenPackages) {
  if (packageJson.dependencies[pkg] || packageJson.devDependencies[pkg]) {
    console.error(`❌ Forbidden package found: ${pkg}`);
    hasErrors = true;
  }
}
console.log('✅ No forbidden packages found');

// 6. Check for @latest usage in any files
console.log('\n6️⃣ Checking for @latest usage...');
const checkForLatest = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      checkForLatest(filePath);
    } else if (file.endsWith('.md') || file.endsWith('.json') || file.endsWith('.yml')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('@latest')) {
        console.error(`❌ Found @latest in ${filePath}`);
        hasErrors = true;
      }
    }
  }
};

// Only check docs and config files, not source code
const docsPath = path.join(__dirname, '../../docs');
if (fs.existsSync(docsPath)) {
  checkForLatest(docsPath);
}
console.log('✅ No @latest usage found');

// 7. Check main field in package.json
console.log('\n7️⃣ Checking package.json main field...');
if (packageJson.main !== 'node_modules/expo/AppEntry.js') {
  console.error('❌ package.json main field must be "node_modules/expo/AppEntry.js"');
  hasErrors = true;
} else {
  console.log('✅ package.json main field correct');
}

// Exit with error if compliance issues found
if (hasErrors) {
  console.error('\n❌ Tech stack compliance check FAILED!');
  console.error('Please fix the issues above to match tech-stack-research.md requirements.');
  process.exit(1);
} else {
  console.log('\n✅ Tech stack compliance check PASSED!');
  console.log('All requirements from tech-stack-research.md are met.');
  process.exit(0);
}