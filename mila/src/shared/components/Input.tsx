import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<TextInput, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <View className="mb-4">
        {label && <Text className="text-sm font-medium text-bolt-black mb-2">{label}</Text>}
        <TextInput
          ref={ref}
          className={`
            bg-bolt-gray-light px-4 py-3 rounded-xl text-base text-bolt-black
            ${error ? 'border border-red-500' : ''}
            ${className}
          `}
          placeholderTextColor="#6C7072"
          {...props}
        />
        {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
      </View>
    );
  },
);

Input.displayName = 'Input';

export default Input;
