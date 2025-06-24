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
// Note: This is a polyfill for MaxListeners in environments without Node.js process
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof global !== 'undefined' && (global as any).EventTarget) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const EventTargetPrototype = (global as any).EventTarget.prototype;
  const originalAddEventListener = EventTargetPrototype.addEventListener;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  EventTargetPrototype.addEventListener = function(this: any, type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((this as any).setMaxListeners && type === 'abort') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any).setMaxListeners(20);
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
