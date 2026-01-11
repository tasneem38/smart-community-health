import NetInfo from '@react-native-community/netinfo';
import { getPendingQueue, markQueueItem } from '../db/db';
import { sendSymptomReport, sendWaterTest } from '../api/api';
import * as FileSystem from 'expo-file-system';

let unsubscribe: any = null;

export function startSyncManager() {
  unsubscribe = NetInfo.addEventListener(async state => {
    if (state.isConnected) {
      console.log('Connected -> trying to sync queue');
      const queue = await getPendingQueue();
      for (const item of queue) {
        try {
          const payload = JSON.parse(item.payload);
          if (item.type === 'SYMPTOM') {
            const res = await sendSymptomReport(payload);
            if (res.ok) markQueueItem(item.id, 'synced');
          } else if (item.type === 'WATER_TEST') {
            const res = await sendWaterTest(payload);
            if (res.ok) markQueueItem(item.id, 'synced');
          }
        } catch (err) {
          console.log('Sync failed for', item.id, err);
          markQueueItem(item.id, 'failed');
        }
      }
    } else {
      console.log('Offline - queue will persist');
    }
  });
}

export function stopSyncManager() {
  if (unsubscribe) unsubscribe();
}
