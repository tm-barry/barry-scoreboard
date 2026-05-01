import { openDB } from 'idb';
import type { Bracket } from '../interfaces/bracket';
import type { Scoreboard } from '../interfaces/scoreboard';
import { toRaw } from 'vue';

const DB_NAME = 'barryscoreboard-db';
const DB_VERSION = 1;

const SCOREBOARD_KEY = 'latest';

export const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    // Brackets store
    if (!db.objectStoreNames.contains('brackets')) {
      db.createObjectStore('brackets', { keyPath: 'id' });
    }

    // Scoreboard store
    if (!db.objectStoreNames.contains('scoreboard')) {
      db.createObjectStore('scoreboard');
    }

    // Preferences store
    if (!db.objectStoreNames.contains('preferences')) {
      db.createObjectStore('preferences');
    }
  },
});

// ======================================================
// Brackets
// ======================================================

export async function saveBracket(bracket: Bracket) {
  const db = await dbPromise;

  const raw = toRaw(bracket);
  const clean = structuredClone(JSON.parse(JSON.stringify(raw)));

  await db.put('brackets', clean);
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

// ======================================================
// Scoreboard
// ======================================================

export async function saveScoreboard(scoreboard: Scoreboard) {
  const db = await dbPromise;

  const raw = toRaw(scoreboard);
  const clean = structuredClone(JSON.parse(JSON.stringify(raw)));

  await db.put('scoreboard', clean, SCOREBOARD_KEY);
}

export async function getScoreboard(): Promise<Scoreboard | undefined> {
  const db = await dbPromise;
  return db.get('scoreboard', SCOREBOARD_KEY);
}

export async function deleteScoreboard() {
  const db = await dbPromise;
  return db.delete('scoreboard', SCOREBOARD_KEY);
}
