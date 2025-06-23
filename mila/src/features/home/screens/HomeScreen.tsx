import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../auth/context/AuthContext';
import { familyService } from '../../../services/families';
import Button from '../../../shared/components/Button';
import type { HomeStackParamList } from '../../../types/navigation';
import type { Family } from '../../../types/database';

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeOverview'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuth();
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFamilies = async () => {
    try {
      const data = await familyService.getUserFamilies();
      setFamilies(data || []);
    } catch (error) {
      console.error('Error loading families:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFamilies();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadFamilies();
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-bolt-gray-dark">Laden...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View className="px-5 pt-5">
        <Text className="text-3xl font-bold text-bolt-black mb-2">
          Welkom {user?.user_metadata?.full_name || 'daar'}!
        </Text>

        {families.length === 0 ? (
          <View className="mt-10">
            <Text className="text-lg text-bolt-gray-dark text-center mb-8">
              Je bent nog geen lid van een familie. Maak een nieuwe familie aan of join een
              bestaande familie met een uitnodigingscode.
            </Text>

            <Button
              title="Nieuwe familie aanmaken"
              onPress={() => navigation.navigate('CreateFamily')}
              className="mb-3"
            />

            <Button
              title="Familie joinen"
              variant="secondary"
              onPress={() => navigation.navigate('JoinFamily')}
            />
          </View>
        ) : (
          <>
            <Text className="text-base text-bolt-gray-dark mb-6">
              Selecteer een familie om te beginnen
            </Text>

            <View className="mb-6">
              {families.map((family) => (
                <TouchableOpacity
                  key={family.id}
                  onPress={() => navigation.navigate('FamilyDetails', { familyId: family.id })}
                  className="bg-white border border-bolt-gray-light rounded-lg p-4 mb-3 shadow-sm"
                >
                  <Text className="text-lg font-semibold text-bolt-black">{family.name}</Text>
                  {family.invite_code && (
                    <Text className="text-sm text-bolt-gray-dark mt-1">
                      Uitnodigingscode: {family.invite_code}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View className="mt-6">
              <Button
                title="Nieuwe familie aanmaken"
                variant="secondary"
                onPress={() => navigation.navigate('CreateFamily')}
                className="mb-3"
              />

              <Button
                title="Familie joinen"
                variant="secondary"
                onPress={() => navigation.navigate('JoinFamily')}
              />
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}
