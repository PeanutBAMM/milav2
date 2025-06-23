import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../features/home/screens/HomeScreen';
import CreateFamilyScreen from '../features/family/screens/CreateFamilyScreen';
import JoinFamilyScreen from '../features/family/screens/JoinFamilyScreen';
import type { HomeStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#2E3333',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="HomeOverview" component={HomeScreen} options={{ title: 'Home' }} />
      <Stack.Screen
        name="CreateFamily"
        component={CreateFamilyScreen}
        options={{ title: 'Nieuwe Familie' }}
      />
      <Stack.Screen
        name="JoinFamily"
        component={JoinFamilyScreen}
        options={{ title: 'Familie Joinen' }}
      />
    </Stack.Navigator>
  );
}
