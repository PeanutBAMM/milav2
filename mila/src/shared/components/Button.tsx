import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
}

export default function Button({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'py-4 px-6 rounded-3xl items-center';

  const variants = {
    primary: 'bg-bolt-green',
    secondary: 'bg-bolt-gray-light',
    ghost: 'bg-transparent',
  };

  const textVariants = {
    primary: 'text-white',
    secondary: 'text-bolt-black',
    ghost: 'text-bolt-green',
  };

  return (
    <TouchableOpacity
      className={`${baseStyles} ${variants[variant]} ${disabled || loading ? 'opacity-50' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : '#34D186'} />
      ) : (
        <Text className={`text-base font-semibold ${textVariants[variant]}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
