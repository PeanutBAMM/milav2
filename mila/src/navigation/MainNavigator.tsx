import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types/navigation';
import HomeNavigator from './HomeNavigator';
import ListsNavigator from './ListsNavigator';
import ExpensesScreen from '../features/expenses/screens/ExpensesScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Lists') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Expenses') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#34D186',
        tabBarInactiveTintColor: '#6C7072',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#EBEDF0',
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#EBEDF0',
        },
        headerTintColor: '#2E3333',
        headerTitleStyle: {
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeNavigator}
        options={{ headerShown: false, title: 'Home' }}
      />
      <Tab.Screen
        name="Lists"
        component={ListsNavigator}
        options={{ headerShown: false, title: 'Lijsten' }}
      />
      <Tab.Screen name="Expenses" component={ExpensesScreen} options={{ title: 'Uitgaven' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profiel' }} />
    </Tab.Navigator>
  );
}
