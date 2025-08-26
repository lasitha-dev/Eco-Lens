import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { colors } from '../constants/themeLogin'; // Updated reference

const Input = ({ value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize, style }) => (
  <TextInput
    style={[styles.input, style]}
    value={value}
    onChangeText={onChangeText}
    placeholder={placeholder}
    secureTextEntry={secureTextEntry}
    keyboardType={keyboardType}
    autoCapitalize={autoCapitalize}
  />
);

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    borderRadius: 5,
    backgroundColor: colors.white,
  },
});

export default Input;