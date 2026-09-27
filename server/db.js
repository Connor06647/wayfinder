import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const serverDir = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(serverDir, 'data')
mkdirSync(dataDir, { recursive: true })

export const db = new DatabaseSync(path.join(dataDir, 'wayfinder.db'))

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rawg_id INTEGER UNIQUE,
    title TEXT NOT NULL,
    image TEXT,
    platforms TEXT,
    released TEXT,
    rawg_rating REAL
  );

  CREATE TABLE IF NOT EXISTS genres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS game_genres (
    game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    genre_id INTEGER NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (game_id, genre_id)
  );

  CREATE TABLE IF NOT EXISTS game_tags (
    game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (game_id, tag_id)
  );

  CREATE TABLE IF NOT EXISTS library_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'Want to play',
    rating REAL,
    review TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, game_id)
  );
`)

function getOrCreateGame({ rawgId, title, image, platforms, released, rawgRating }) {
  const existing = rawgId
    ? db.prepare('SELECT * FROM games WHERE rawg_id = ?').get(rawgId)
    : db.prepare('SELECT * FROM games WHERE rawg_id IS NULL AND title = ?').get(title)
  if (existing) return existing.id

  const info = db
    .prepare('INSERT INTO games (rawg_id, title, image, platforms, released, rawg_rating) VALUES (?, ?, ?, ?, ?, ?)')
    .run(rawgId ?? null, title, image ?? null, platforms ?? null, released ?? null, rawgRating ?? null)
  return Number(info.lastInsertRowid)
}

function linkGenres(gameId, genres = []) {
  for (const genre of genres) {
    db.prepare('INSERT OR IGNORE INTO genres (slug, name) VALUES (?, ?)').run(genre.slug, genre.name)
    const row = db.prepare('SELECT id FROM genres WHERE slug = ?').get(genre.slug)
    db.prepare('INSERT OR IGNORE INTO game_genres (game_id, genre_id) VALUES (?, ?)').run(gameId, row.id)
  }
}

function linkTags(gameId, tags = []) {
  for (const tag of tags) {
    db.prepare('INSERT OR IGNORE INTO tags (slug, name) VALUES (?, ?)').run(tag.slug, tag.name)
    const row = db.prepare('SELECT id FROM tags WHERE slug = ?').get(tag.slug)
    db.prepare('INSERT OR IGNORE INTO game_tags (game_id, tag_id) VALUES (?, ?)').run(gameId, row.id)
  }
}

export function upsertGame(payload) {
  const gameId = getOrCreateGame(payload)
  linkGenres(gameId, payload.genres)
  linkTags(gameId, payload.tags)
  return gameId
}

export function getGenreSlugs(gameId) {
  return db
    .prepare('SELECT genres.slug AS slug FROM game_genres JOIN genres ON genres.id = game_genres.genre_id WHERE game_genres.game_id = ?')
    .all(gameId)
    .map((row) => row.slug)
}

export function getTagSlugs(gameId) {
  return db
    .prepare('SELECT tags.slug AS slug FROM game_tags JOIN tags ON tags.id = game_tags.tag_id WHERE game_tags.game_id = ?')
    .all(gameId)
    .map((row) => row.slug)
}

export function hydrateLibraryEntry(row) {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    image: row.image,
    platforms: row.platforms,
    rating: row.rating,
    review: row.review,
    updatedAt: row.updated_at,
    genreSlugs: getGenreSlugs(row.game_id),
    tagSlugs: getTagSlugs(row.game_id),
  }
}

export function getLibraryEntryRow(id) {
  return db
    .prepare(
      `SELECT library_entries.*, games.title AS title, games.image AS image, games.platforms AS platforms
       FROM library_entries JOIN games ON games.id = library_entries.game_id
       WHERE library_entries.id = ?`,
    )
    .get(id)
}
