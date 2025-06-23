import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { familyService } from '../../../services/families';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';
import type { HomeStackParamList } from '../../../types/navigation';

type JoinFamilyScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'JoinFamily'>;

const joinFamilySchema = z.object({
  inviteCode: z
    .string()
    .min(1, 'Uitnodigingscode is verplicht')
    .length(8, 'Uitnodigingscode moet 8 karakters zijn')
    .transform((val) => val.toUpperCase()),
});

type JoinFamilyFormData = z.infer<typeof joinFamilySchema>;

export default function JoinFamilyScreen() {
  const navigation = useNavigation<JoinFamilyScreenNavigationProp>();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinFamilyFormData>({
    resolver: zodResolver(joinFamilySchema),
    defaultValues: {
      inviteCode: '',
    },
  });

  const onSubmit = async (data: JoinFamilyFormData) => {
    try {
      setLoading(true);
      await familyService.joinFamilyByCode(data.inviteCode);

      Alert.alert('Toegevoegd!', 'Je bent succesvol toegevoegd aan de familie.', [
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
          <Text className="text-2xl font-bold text-bolt-black mb-2">Familie joinen</Text>
          <Text className="text-base text-bolt-gray-dark">
            Voer de uitnodigingscode in die je hebt ontvangen van een familielid.
          </Text>
        </View>

        <Controller
          control={control}
          name="inviteCode"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Uitnodigingscode"
              placeholder="ABCD1234"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.inviteCode?.message}
              autoCapitalize="characters"
              maxLength={8}
            />
          )}
        />

        <View className="mt-8">
          <Button
            title="Deelnemen aan familie"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
          />

          <Button
            title="Annuleren"
            variant="secondary"
            onPress={() => navigation.goBack()}
            className="mt-3"
          />
        </View>

        <View className="mt-8 p-4 bg-bolt-gray-light rounded-lg">
          <Text className="text-sm text-bolt-gray-dark">
            <Text className="font-semibold">Let op:</Text> De uitnodigingscode bestaat uit 8
            karakters (letters en cijfers). Vraag je familielid om de code te delen vanuit het
            familie instellingen scherm.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
