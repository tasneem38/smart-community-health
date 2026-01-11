import React from 'react';
import { Card, Paragraph, Button } from 'react-native-paper';
import { View } from 'react-native';

export default function AlertCard({ alert, onMarkRead }: any) {
  return (
    <Card style={{ marginBottom: 12 }}>
      <Card.Title title={alert.type} subtitle={`${alert.risk} risk`} />
      <Card.Content>
        <Paragraph>{alert.description}</Paragraph>
        <Paragraph style={{ fontSize: 12, marginTop: 6 }}>{new Date(alert.timestamp).toLocaleString()}</Paragraph>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => onMarkRead(alert.id)}>Mark read</Button>
      </Card.Actions>
    </Card>
  );
}
