import React from 'react';
import { Card, Paragraph, Button } from 'react-native-paper';
import { View } from 'react-native';

const getRiskColor = (risk: string) => {
  switch (risk?.toLowerCase()) {
    case 'high': return '#D9534F'; // Red
    case 'medium': return '#F0AD4E'; // Orange
    case 'low': return '#5CB85C'; // Green
    default: return '#0275D8'; // Blue
  }
};

export default function AlertCard({ alert, onMarkRead }: any) {
  const riskColor = getRiskColor(alert.risk);

  return (
    <Card style={{ marginBottom: 16, borderRadius: 12, borderLeftWidth: 6, borderLeftColor: riskColor, elevation: 3 }}>
      <Card.Title
        title={alert.type}
        titleStyle={{ fontWeight: 'bold' }}
        subtitle={`${alert.risk?.toUpperCase()} RISK`}
        subtitleStyle={{ color: riskColor, fontWeight: '700' }}
      />
      <Card.Content>
        <Paragraph style={{ fontSize: 15 }}>{alert.description}</Paragraph>
        <Paragraph style={{ fontSize: 12, marginTop: 8, color: '#666' }}>
          {new Date(alert.timestamp).toLocaleString()}
        </Paragraph>
      </Card.Content>
      <Card.Actions>
        <Button
          textColor={riskColor}
          onPress={() => onMarkRead(alert.id)}
        >
          Dismiss
        </Button>
      </Card.Actions>
    </Card>
  );
}
