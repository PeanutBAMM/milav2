# Getting Started

Welkom bij het Mila project! Deze sectie helpt je om snel aan de slag te gaan.


<quick-start>
This section covers quick start.


### 1. [CI/CD Setup Guide](../ci-cd/ci-cd-setup-guide.md)
Complete stap-voor-stap handleiding om de geautomatiseerde CI/CD pipeline op te zetten:
- GitHub Actions configuratie
- Automatische code checks (TypeScript, ESLint, Security)
- Branch protection
- Claude integratie voor automatische error detectie

### 2. Project Setup (Coming Soon)
- Development environment setup
- Dependencies installatie
- Environment variables configuratie

### 3. Development Workflow (Coming Soon)
- Git workflow
- Code standards
- Testing approach
</quick-start>

<new-developers>
Start met deze volgorde:
1. **Setup CI/CD** - Volg de [CI/CD Setup Guide](../ci-cd/ci-cd-setup-guide.md)
2. **Clone & Install** - Clone het project en installeer dependencies
3. **Environment** - Configureer je .env.local file
4. **First Run** - Start de development server
</new-developers>

<tips>
This section covers tips.

- Gebruik `npm run push` in plaats van `git push` voor automatische CI monitoring
- Check altijd `npm run ci:status` om recente CI runs te zien
- Bij CI failures, gebruik `npm run ci:watch` voor gedetailleerde logs
</tips>

<meer-documentatie>
This section covers meer documentatie.

Bekijk ook:
- `/02-development` - Development guidelines
- `/05-ci-cd` - Gedetailleerde CI/CD documentatie
- `/09-troubleshooting` - Oplossingen voor veelvoorkomende problemen
</meer-documentatie>