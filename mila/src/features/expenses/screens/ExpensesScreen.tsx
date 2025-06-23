import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ExpensesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Uitgaven</Text>
      <Text style={styles.subtitle}>€0.00 deze maand</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E3333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#34D186',
    fontWeight: '600',
  },
});
