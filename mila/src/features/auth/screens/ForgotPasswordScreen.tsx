import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthStackParamList } from '../../../types/navigation';
import { forgotPasswordSchema, ForgotPasswordFormData } from '../schemas/authSchemas';
import { useAuth } from '../context/AuthContext';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'ForgotPassword'
>;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setLoading(true);
      await resetPassword(data.email);
      Alert.alert(
        'Email verstuurd!',
        'Check je inbox voor instructies om je wachtwoord te resetten.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      Alert.alert('Fout', error instanceof Error ? error.message : 'Er is iets fout gegaan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 px-5 pt-10">
        <View className="mb-8">
          <Text className="text-2xl font-bold text-bolt-black mb-2">Wachtwoord vergeten?</Text>
          <Text className="text-base text-bolt-gray-dark">
            Geen probleem! Vul je email in en we sturen je een link om een nieuw wachtwoord in te
            stellen.
          </Text>
        </View>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email"
              placeholder="je@email.nl"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.email?.message}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          )}
        />

        <Button
          title="Reset link versturen"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          className="mt-4"
        />
      </View>
    </ScrollView>
  );
}
