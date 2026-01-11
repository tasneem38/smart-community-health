import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('smart_health_v2.db');

export function initDB() {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS queue (
        id TEXT PRIMARY KEY NOT NULL,
        type TEXT,
        payload TEXT,
        status TEXT,
        created_at TEXT
      );`
    );
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

export function addToQueue(entry: { id: string; type: string; payload: object }) {
  return new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO queue (id,type,payload,status,created_at) values (?,?,?,?,?);',
        [entry.id, entry.type, JSON.stringify(entry.payload), 'pending', new Date().toISOString()],
        () => resolve(),
        (_, err) => { reject(err); return false; }
      );
    });
  });
}

export function getPendingQueue() {
  return new Promise<any[]>((resolve) => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM queue WHERE status = ? ORDER BY created_at ASC;', ['pending'], (_, { rows }) => {
        resolve(rows._array);
      });
    });
  });
}

export function markQueueItem(id:string, status:'pending'|'synced'|'failed') {
  db.transaction(tx=> {
    tx.executeSql('UPDATE queue SET status = ? WHERE id = ?;', [status, id]);
  });
}

export function getAlertsFromDB(){
  return new Promise<any[]>((resolve)=> {
    db.transaction(tx=>{
      tx.executeSql('SELECT * FROM alerts ORDER BY timestamp DESC;', [], (_, { rows }) => resolve(rows._array));
    });
  });
}

export function clearQueue() {
  return new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
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
  });
}

export function addAlert(alert: any) {
  db.transaction(tx => {
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

export default db;
