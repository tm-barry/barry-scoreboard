import { openDB } from 'idb';
import type { Bracket } from '../interfaces/bracket';
import { toRaw } from 'vue';

const DB_NAME = 'barryscoreboard-db';
const DB_VERSION = 1;

export const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    // Brackets store
    if (!db.objectStoreNames.contains('brackets')) {
      db.createObjectStore('brackets', { keyPath: 'id' });
    }

    // Preferences store
    if (!db.objectStoreNames.contains('preferences')) {
      db.createObjectStore('preferences');
    }
  },
});

export async function saveBracket(bracket: Bracket) {
  const db = await dbPromise;
  return db.put('brackets', toRaw(bracket));
}

export async function getBracket(id: string): Promise<Bracket | undefined> {
  const db = await dbPromise;
  return db.get('brackets', id);
}

export async function getAllBrackets(): Promise<Bracket[]> {
  const db = await dbPromise;
  return db.getAll('brackets');
}

export async function deleteBracket(id: string) {
  const db = await dbPromise;
  return db.delete('brackets', id);
}
