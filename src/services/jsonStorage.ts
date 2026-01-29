import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function readJsonFile<T>(filename: string): T[] {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

export function writeJsonFile<T>(filename: string, data: T[]): void {
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    throw error;
  }
}

export function appendToJsonFile<T>(filename: string, item: T): void {
  const data = readJsonFile<T>(filename);
  data.push(item);
  writeJsonFile(filename, data);
}

export function updateJsonFile<T extends { id: string }>(
  filename: string,
  id: string,
  updates: Partial<T>
): T | null {
  const data = readJsonFile<T>(filename);
  const index = data.findIndex((item) => item.id === id);
  if (index === -1) {
    return null;
  }
  data[index] = { ...data[index], ...updates };
  writeJsonFile(filename, data);
  return data[index];
}

export function deleteFromJsonFile<T extends { id: string }>(
  filename: string,
  id: string
): boolean {
  const data = readJsonFile<T>(filename);
  const filtered = data.filter((item) => item.id !== id);
  if (filtered.length === data.length) {
    return false;
  }
  writeJsonFile(filename, filtered);
  return true;
}
