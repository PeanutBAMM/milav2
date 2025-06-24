# EAS Secrets Setup Guide

<overview>
This guide explains how to configure environment variables and secrets for EAS Build without exposing them in your codebase.

## Setting up EAS Secrets

### 1. Install EAS CLI
```bash
npm install -g eas-cli
eas login
```

### 2. Configure Secrets
Set your Supabase environment variables as EAS secrets:

```bash
# Set production secrets
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "your-supabase-url"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-anon-key"
```

### 3. Verify Secrets
```bash
eas secret:list
```

## Local Development

For local development, use the `.env.local` file (already in .gitignore):

```bash
# .env.local
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Build Time

EAS Build will automatically inject the secrets during the build process. The app will have access to:
- `process.env.EXPO_PUBLIC_SUPABASE_URL`
- `process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Security Best Practices

1. **Never commit secrets** to version control
2. **Use different keys** for development and production
3. **Rotate keys regularly**
4. **Limit key permissions** in Supabase dashboard
5. **Monitor key usage** via Supabase logs

## Troubleshooting

### Secrets not available in build
- Ensure secrets are set with `--scope project`
- Check secret names match exactly (case-sensitive)
- Rebuild after adding new secrets

### Local development issues
- Verify `.env.local` exists and is not empty
- Restart Metro bundler after changing env vars
- Check that `.env.local` is in `.gitignore`
</overview>