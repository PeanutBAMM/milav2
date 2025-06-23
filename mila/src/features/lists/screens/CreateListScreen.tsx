import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CreateListScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nieuwe Lijst</Text>
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
  },
});
