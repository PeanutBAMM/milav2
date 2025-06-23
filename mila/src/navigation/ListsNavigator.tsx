import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ListsStackParamList } from '../types/navigation';
import ListsOverviewScreen from '../features/lists/screens/ListsOverviewScreen';
import ListDetailScreen from '../features/lists/screens/ListDetailScreen';
import CreateListScreen from '../features/lists/screens/CreateListScreen';

const Stack = createNativeStackNavigator<ListsStackParamList>();

export default function ListsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#2E3333',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="ListsOverview"
        component={ListsOverviewScreen}
        options={{ title: 'Boodschappenlijsten' }}
      />
      <Stack.Screen
        name="ListDetail"
        component={ListDetailScreen}
        options={{ title: 'Lijst details' }}
      />
      <Stack.Screen
        name="CreateList"
        component={CreateListScreen}
        options={{ title: 'Nieuwe lijst' }}
      />
    </Stack.Navigator>
  );
}
