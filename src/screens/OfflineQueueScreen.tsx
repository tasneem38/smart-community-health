import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { getPendingQueue, markQueueItem } from '../db/db';
import { Card, Button, Paragraph } from 'react-native-paper';
import { startSyncManager } from '../services/syncService';

export default function OfflineQueueScreen() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(()=> {
    (async ()=>{
      const q = await getPendingQueue();
      setItems(q);
    })();
    startSyncManager();
    return () => {};
  },[]);

  return (
    <ScrollView style={{ padding: 12 }}>
      {items.length === 0 && <Paragraph>No pending items</Paragraph>}
      {items.map(it => (
        <Card key={it.id} style={{ marginBottom: 12 }}>
          <Card.Title title={it.type} subtitle={new Date(it.created_at).toLocaleString()} />
          <Card.Content><Paragraph numberOfLines={3}>{it.payload}</Paragraph></Card.Content>
          <Card.Actions>
            <Button onPress={() => { markQueueItem(it.id, 'failed'); setItems(items.filter(i=>i.id!==it.id)); }}>Mark failed</Button>
          </Card.Actions>
        </Card>
      ))}
    </ScrollView>
  );
}
