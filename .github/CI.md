# CI Setup

<what-it-does>
## What it does
Every push and PR automatically checks:
- ✅ TypeScript compiles without errors
- ✅ ESLint passes (code quality)
- ✅ Expo compatibility (expo-doctor)
- ✅ Exact versions only (no ^ or ~)
- ✅ No console.log in production code
- ✅ Security vulnerabilities scan
- ✅ Tech Stack Compliance (validates against tech-stack-research.md)

</what-it-does>
## How it works
- Push code → GitHub runs checks → Green ✅ or Red ❌
- Simple as that!

## Branch Protection
The `main` branch requires all checks to pass before merging.

## No maintenance needed
This setup uses only built-in npm scripts. Nothing extra to maintain.
</what-it-does>