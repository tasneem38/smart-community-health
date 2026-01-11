import React from 'react';
import { Card, Paragraph } from 'react-native-paper';

export default function CardItem({ title, subtitle, onPress }: any) {
  return (
    <Card onPress={onPress} style={{ marginVertical: 8 }}>
      <Card.Title title={title} subtitle={subtitle} />
    </Card>
  );
}
