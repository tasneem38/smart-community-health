import React from 'react';
import { Button } from 'react-native-paper';

export default function AppButton({ children, ...rest }: any) {
  return (
    <Button mode="contained" uppercase={false} style={{ paddingVertical: 6 }} {...rest}>{children}</Button>
  );
}
