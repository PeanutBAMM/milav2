import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../auth/context/AuthContext';
import { familyService } from '../../../services/families';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';
import type { HomeStackParamList } from '../../../types/navigation';

type CreateFamilyScreenNavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  'CreateFamily'
>;

const createFamilySchema = z.object({
  name: z.string().min(1, 'Familie naam is verplicht').max(50, 'Naam is te lang'),
});

type CreateFamilyFormData = z.infer<typeof createFamilySchema>;

export default function CreateFamilyScreen() {
  const navigation = useNavigation<CreateFamilyScreenNavigationProp>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateFamilyFormData>({
    resolver: zodResolver(createFamilySchema),
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = async (data: CreateFamilyFormData) => {
    if (!user) return;

    try {
      setLoading(true);
      const family = await familyService.createFamily({
        name: data.name,
        created_by: user.id,
      });

      Alert.alert('Familie aangemaakt!', `Je familie "${family.name}" is succesvol aangemaakt.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Fout', error instanceof Error ? error.message : 'Er is iets fout gegaan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 px-5 pt-5">
        <View className="mb-8">
          <Text className="text-2xl font-bold text-bolt-black mb-2">Nieuwe familie</Text>
          <Text className="text-base text-bolt-gray-dark">
            Maak een nieuwe familie aan om samen boodschappenlijsten te beheren.
          </Text>
        </View>

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Familie naam"
              placeholder="Bijv. Familie Jansen"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.name?.message}
              autoCapitalize="words"
            />
          )}
        />

        <View className="mt-8">
          <Button title="Familie aanmaken" onPress={handleSubmit(onSubmit)} loading={loading} />

          <Button
            title="Annuleren"
            variant="secondary"
            onPress={() => navigation.goBack()}
            className="mt-3"
          />
        </View>

        <View className="mt-8 p-4 bg-bolt-gray-light rounded-lg">
          <Text className="text-sm text-bolt-gray-dark">
            <Text className="font-semibold">Tip:</Text> Na het aanmaken krijg je een
            uitnodigingscode die je kunt delen met andere gezinsleden om ze uit te nodigen.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
