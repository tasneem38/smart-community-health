import React from 'react';
import { TextInput } from 'react-native-paper';

export default function AppInput(props: any) {
  return (
    <TextInput
      mode="outlined"
      style={{ marginBottom: 14, width: '100%' }}
      {...props}
    />
  );
}
