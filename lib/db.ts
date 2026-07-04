import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'mycofilter.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    image_path TEXT NOT NULL,
    analyte TEXT NOT NULL,
    reference_rgb TEXT NOT NULL,
    raw_rgb TEXT NOT NULL,
    corrected_rgb TEXT NOT NULL,
    estimated_ppm REAL NOT NULL,
    notes TEXT
  );
`);

export interface Reading {
  id: number;
  created_at: string;
  lat: number;
  lng: number;
  image_path: string;
  analyte: string;
  reference_rgb: string;
  raw_rgb: string;
  corrected_rgb: string;
  estimated_ppm: number;
  notes: string | null;
}

export function insertReading(
  reading: Omit<Reading, 'id'>
): Reading {
  const stmt = db.prepare(`
    INSERT INTO readings
      (created_at, lat, lng, image_path, analyte, reference_rgb, raw_rgb, corrected_rgb, estimated_ppm, notes)
    VALUES
      (@created_at, @lat, @lng, @image_path, @analyte, @reference_rgb, @raw_rgb, @corrected_rgb, @estimated_ppm, @notes)
  `);
  const info = stmt.run(reading);
  return { id: Number(info.lastInsertRowid), ...reading };
}

export function listReadings(): Reading[] {
  return db.prepare('SELECT * FROM readings ORDER BY created_at DESC').all() as Reading[];
}

export default db;
