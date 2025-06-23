#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const packagePath = path.join(process.cwd(), 'package.json');

try {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  const allDeps = {
    ...(pkg.dependencies || {}),
    ...(pkg.devDependencies || {}),
  };

  const invalidDeps = Object.entries(allDeps)
    .filter(([_, version]) => version.includes('^') || version.includes('~'))
    .map(([name, version]) => `${name}: ${version}`);

  if (invalidDeps.length > 0) {
    console.error('\n❌ ERROR: Version ranges (^ or ~) are not allowed!');
    console.error('\nFound the following invalid version specifications:');
    invalidDeps.forEach((dep) => console.error(`  - ${dep}`));
    console.error('\nPlease use exact versions only (no ^ or ~ prefixes).');
    console.error("This is required by the project's stability-first philosophy.\n");
    process.exit(1);
  } else {
    console.log('✅ All package versions are exact. Proceeding with installation...\n');
  }
} catch (error) {
  console.error('Error reading package.json:', error.message);
  process.exit(1);
}
