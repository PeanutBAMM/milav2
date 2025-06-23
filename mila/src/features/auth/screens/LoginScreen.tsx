import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthStackParamList } from '../../../types/navigation';
import { loginSchema, LoginFormData } from '../schemas/authSchemas';
import { useAuth } from '../context/AuthContext';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      await signIn(data.email, data.password);
    } catch (error) {
      Alert.alert(
        'Login mislukt',
        error instanceof Error ? error.message : 'Er is iets fout gegaan',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 px-5 pt-20">
        <View className="mb-10">
          <Text className="text-3xl font-bold text-bolt-black mb-2">Welkom terug</Text>
          <Text className="text-base text-bolt-gray-dark">Log in om door te gaan</Text>
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

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Wachtwoord"
              placeholder="••••••••"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.password?.message}
              secureTextEntry
            />
          )}
        />

        <TouchableOpacity className="mb-6" onPress={() => navigation.navigate('ForgotPassword')}>
          <Text className="text-bolt-green text-sm text-right">Wachtwoord vergeten?</Text>
        </TouchableOpacity>

        <Button
          title="Inloggen"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          className="mb-4"
        />

        <View className="flex-row justify-center">
          <Text className="text-bolt-gray-dark">Nog geen account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text className="text-bolt-green font-semibold">Registreer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
