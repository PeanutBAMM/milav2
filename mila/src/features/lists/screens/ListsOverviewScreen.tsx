import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ListsOverviewScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Boodschappenlijsten</Text>
      <Text style={styles.subtitle}>Geen lijsten nog</Text>
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
    fontSize: 16,
    color: '#6C7072',
  },
});
