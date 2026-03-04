import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveWaterTestPostgres, saveSymptomReportPostgres, fetchAlertsFromPostgres } from '../api/postgres/client';

// ---------------------------------------------------------
// WEB FALLBACK: Simple Queue Implementation using AsyncStorage
// (AsyncStorage works on web too, backed by localStorage)
// ---------------------------------------------------------
const WEB_QUEUE_KEY = 'offline_queue';

// SQLite DB - Only applicable for mobile
const db = Platform.OS !== 'web' ? SQLite.openDatabase('smart_health_v2.db') : null;

export function initDB() {
  if (Platform.OS === 'web') return; // No init needed for web

  db?.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS queue (
        id TEXT PRIMARY KEY NOT NULL,
        type TEXT,
        payload TEXT,
        status TEXT,
        created_at TEXT
      );`
    );
    // ... other tables remain but we focus on queue
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS water_sources (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT,
        village TEXT
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY NOT NULL,
        type TEXT,
        description TEXT,
        risk TEXT,
        timestamp TEXT,
        read INTEGER
      );`
    );
  });
}

// ---------------------------------------------------------
// QUEUE OPERATIONS (Platform Agnostic)
// ---------------------------------------------------------

async function insertToQueue(entry: { id: string; type: string; payload: object }) {
  if (Platform.OS === 'web') {
    const currentQueue = JSON.parse(await AsyncStorage.getItem(WEB_QUEUE_KEY) || '[]');
    currentQueue.push({ ...entry, status: 'pending', created_at: new Date().toISOString() });
    await AsyncStorage.setItem(WEB_QUEUE_KEY, JSON.stringify(currentQueue));
  } else {
    return new Promise<void>((resolve, reject) => {
      db?.transaction(tx => {
        tx.executeSql(
          'INSERT INTO queue (id,type,payload,status,created_at) values (?,?,?,?,?);',
          [entry.id, entry.type, JSON.stringify(entry.payload), 'pending', new Date().toISOString()],
          () => resolve(),
          (_, err) => { reject(err); return false; }
        );
      });
    });
  }
}

async function getQueueItems() {
  if (Platform.OS === 'web') {
    return JSON.parse(await AsyncStorage.getItem(WEB_QUEUE_KEY) || '[]');
  } else {
    return new Promise<any[]>((resolve) => {
      db?.transaction(tx => {
        tx.executeSql('SELECT * FROM queue WHERE status = ? ORDER BY created_at ASC;', ['pending'], (_, { rows }) => {
          resolve(rows._array);
        });
      });
    });
  }
}

async function removeFromQueue(id: string) {
  if (Platform.OS === 'web') {
    const currentQueue = JSON.parse(await AsyncStorage.getItem(WEB_QUEUE_KEY) || '[]');
    const newQueue = currentQueue.filter((item: any) => item.id !== id);
    await AsyncStorage.setItem(WEB_QUEUE_KEY, JSON.stringify(newQueue));
  } else {
    return new Promise<void>((resolve) => {
      db?.transaction(tx => {
        tx.executeSql('DELETE FROM queue WHERE id = ?;', [id], () => resolve());
      });
    });
  }
}

// ---------------------------------------------------------
// PUBLIC API
// ---------------------------------------------------------

export async function addToQueue(entry: { id: string; type: string; payload: object }) {
  console.log(`[Queue] Adding item: ${entry.type}`);
  await insertToQueue(entry);

  // Try to sync immediately
  syncQueue().catch(err => console.log("Background sync failed (offline?):", err.message));
}

export async function syncQueue() {
  const items = await getQueueItems();
  if (items.length === 0) return;

  console.log(`[Sync] Found ${items.length} pending items`);

  for (const item of items) {
    try {
      const payload = typeof item.payload === 'string' ? JSON.parse(item.payload) : item.payload;

      console.log(`[Sync] Uploading ${item.type}...`);

      if (item.type === 'WATER_TEST') {
        await saveWaterTestPostgres(payload);
      } else if (item.type === 'SYMPTOM') {
        const report = {
          village: payload.village || "Unknown",
          name: payload.name || "Anonymous",
          symptoms: payload.symptoms || [],
          timestamp: payload.timestamp,
          reporterRole: payload.reporterRole || "ASHA"
        };
        await saveSymptomReportPostgres(report);
      }

      // If successful, remove from queue
      await removeFromQueue(item.id);
      console.log(`[Sync] Success: ${item.id}`);
    } catch (err) {
      console.error(`[Sync] Failed item ${item.id}:`, err);
      // Keep in queue to retry later
    }
  }
}

export async function getAlertsFromDB() {
  try {
    // Online First: Try to fetch from API
    const alerts = await fetchAlertsFromPostgres();
    return alerts;
  } catch (err) {
    return [];
  }
}

export function getPendingQueue() {
  return getQueueItems();
}

export function addAlert(alert: any) {
  // Can be implemented for local caching if needed
  db?.transaction(tx => {
    tx.executeSql(
      `INSERT OR REPLACE INTO alerts 
        (id, type, description, risk, timestamp, read)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [
        alert.id,
        alert.type,
        alert.description,
        alert.risk,
        alert.timestamp,
        0, // default unread
      ]
    );
  });
}

export function clearQueue() {
  return new Promise<void>((resolve, reject) => {
    if (Platform.OS === 'web') {
      AsyncStorage.removeItem(WEB_QUEUE_KEY).then(resolve).catch(reject);
    } else {
      db?.transaction(tx => {
        tx.executeSql(
          "DELETE FROM queue;",
          [],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    }
  });
}

export function markQueueItem(id: string, status: 'pending' | 'synced' | 'failed') {
  // This function is no longer directly used as items are removed on sync success
  // If needed for web, it would require finding and updating an item in AsyncStorage
  // For now, it's a no-op or can be adapted if a 'failed' status needs to persist
  console.warn("markQueueItem is deprecated with the new sync logic. Items are removed on success.");
  if (Platform.OS === 'web') {
    // No-op for web as items are removed, not marked
  } else {
    db?.transaction(tx => {
      tx.executeSql('UPDATE queue SET status = ? WHERE id = ?;', [status, id]);
    });
  }
}

export default db;
