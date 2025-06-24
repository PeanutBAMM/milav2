import 'react-native-gesture-handler';
import './global.css';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './src/features/auth/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

// Increase MaxListeners limit to prevent warning with multiple Supabase requests
if (typeof process !== 'undefined' && process.setMaxListeners) {
  process.setMaxListeners(20);
}

// Alternative method for environments where process is not available
if (typeof global !== 'undefined' && global.EventTarget) {
  const EventTargetPrototype = global.EventTarget.prototype;
  const originalAddEventListener = EventTargetPrototype.addEventListener;
  EventTargetPrototype.addEventListener = function(type, listener, options) {
    if (this.setMaxListeners && type === 'abort') {
      this.setMaxListeners(20);
    }
    return originalAddEventListener.call(this, type, listener, options);
  };
}

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
