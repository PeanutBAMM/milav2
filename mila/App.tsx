import 'react-native-gesture-handler';
import './global.css';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './src/features/auth/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

// MaxListeners configuration is now handled in src/services/supabase.ts
// This keeps the fix close to the source of the issue (Supabase client)

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SafeAreaProvider>
          <RootNavigator />
          <StatusBar style="auto" />
        </SafeAreaProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
