// lib/offlineOutbox.ts
// IndexedDB outbox for offline mutations.
// Every offline action is written here first, then replayed when connection returns.

export type ActionType = 'createWalkInOrder' | 'createPayment' | 'finalizePayment' | 'createGuestCustomer' | 'updateOrderStatus' | 'clockIn' | 'clockOut';

export interface PendingAction {
  id: string;           // UUID generated on device
  type: ActionType;
  payload: Record<string, unknown>;
  createdAt: number;    // Date.now()
  retries: number;
  synced: boolean;
}

const DB_NAME = 'washlab_outbox';
const DB_VERSION = 1;
const STORE = 'pendingActions';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('synced', 'synced', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function enqueue(type: ActionType, payload: Record<string, unknown>): Promise<PendingAction> {
  const db = await openDB();
  const action: PendingAction = {
    id: crypto.randomUUID(),
    type,
    payload,
    createdAt: Date.now(),
    retries: 0,
    synced: false,
  };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).add(action);
    tx.oncomplete = () => resolve(action);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPending(): Promise<PendingAction[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).index('createdAt').getAll();
    req.onsuccess = () => resolve((req.result as PendingAction[]).filter(a => !a.synced));
    req.onerror = () => reject(req.error);
  });
}

export async function markSynced(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const req = store.get(id);
    req.onsuccess = () => {
      const record = req.result as PendingAction;
      if (record) { record.synced = true; store.put(record); }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function incrementRetry(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const req = store.get(id);
    req.onsuccess = () => {
      const record = req.result as PendingAction;
      if (record) { record.retries += 1; store.put(record); }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPendingCount(): Promise<number> {
  const pending = await getPending();
  return pending.length;
}

/** Delete synced records older than maxAgeMs (default 7 days) to keep IndexedDB lean */
export async function deleteOld(maxAgeMs = 7 * 24 * 60 * 60 * 1000): Promise<void> {
  const db = await openDB();
  const cutoff = Date.now() - maxAgeMs;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const req = store.openCursor();
    req.onsuccess = () => {
      const cursor = req.result as IDBCursorWithValue | null;
      if (!cursor) return;
      const record = cursor.value as PendingAction;
      if (record.synced && record.createdAt < cutoff) cursor.delete();
      cursor.continue();
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
