# Claude CI Monitoring Workflow

## Overview
Een geautomatiseerd systeem waarbij Claude tijdens coding sessies automatisch CI failures detecteert, logs analyseert en fixes voorstelt.

## How It Works

### 1. Automatic Monitoring
Bij elke push tijdens een Claude sessie:
```bash
# Claude gebruikt dit commando:
npm run push  # Push + automatische CI monitoring
```

### 2. CI Status Detection
Het `ci-watch.sh` script:
- Wacht tot CI klaar is (elke 3 sec check)
- Toont groene vink ✅ bij succes
- Haalt automatisch error logs op bij failure ❌

### 3. Error Analysis
Bij failures analyseert Claude:
- TypeScript errors
- ESLint violations  
- Console.log detectie
- Tech stack compliance
- Security vulnerabilities

### 4. Fix Proposals
Claude stelt direct fixes voor en kan deze implementeren na goedkeuring.

## Available Commands

```bash
# In mila/ directory:
npm run push         # Push + auto monitor CI
npm run ci:watch    # Monitor latest CI run
npm run ci:status   # Show recent CI runs
```

## Example Workflow

1. **Claude maakt code wijziging**
2. **Push met monitoring**:
   ```
   npm run push
   ```
3. **Bij failure**: Claude ziet direct:
   - Welke check faalde
   - Exacte error messages
   - File en regel nummer
4. **Claude stelt fix voor**
5. **Na goedkeuring**: Fix wordt toegepast
6. **Nieuwe push**: Verifieert dat alles groen is

## Benefits

- ✅ Geen manual log checking nodig
- ✅ Snellere feedback loop
- ✅ Claude kan proactief fixes voorstellen
- ✅ Minder context switches voor gebruiker
- ✅ Betere code kwaliteit

## Testing

Test het systeem met:
```bash
# Voeg opzettelijke fout toe
echo "const x: string = 123;" > src/test-error.ts

# Push en zie Claude reageren
npm run push
```

## Troubleshooting

- Script toont oude run? → Wacht 5 sec en run opnieuw
- Geen output? → Check `gh auth status`
- Te veel logs? → Check `/tmp/ci-failure-*.log`