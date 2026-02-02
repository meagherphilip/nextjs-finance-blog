import Database from 'better-sqlite3';

const db = new Database('./blog.db');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      date TEXT NOT NULL,
      author TEXT NOT NULL,
      tags TEXT NOT NULL
    )
  `);
}

initDb();

export default db;
