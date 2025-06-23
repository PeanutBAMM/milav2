import React from 'react';
import { View, Text, Alert } from 'react-native';
import { useAuth } from '../../auth/context/AuthContext';
import Button from '../../../shared/components/Button';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    Alert.alert('Uitloggen', 'Weet je zeker dat je wilt uitloggen?', [
      { text: 'Annuleren', style: 'cancel' },
      {
        text: 'Uitloggen',
        onPress: async () => {
          try {
            await signOut();
          } catch {
            Alert.alert('Fout', 'Er ging iets fout bij het uitloggen');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <View className="flex-1 bg-white p-5">
      <View className="mb-8">
        <Text className="text-2xl font-bold text-bolt-black mb-2">Profiel</Text>
        {user && <Text className="text-base text-bolt-gray-dark">{user.email}</Text>}
      </View>

      <View className="flex-1" />

      <Button title="Uitloggen" variant="secondary" onPress={handleSignOut} />
    </View>
  );
}
