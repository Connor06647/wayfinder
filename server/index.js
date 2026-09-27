import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { db, upsertGame, hydrateLibraryEntry, getLibraryEntryRow } from './db.js'
import {
  hashPassword,
  verifyPassword,
  createSession,
  deleteSession,
  getSessionUser,
  getSessionToken,
  setSessionCookie,
  clearSessionCookie,
  requireAuth,
} from './auth.js'
import { handleGamesRequest } from './rawg.js'

const serverDir = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(serverDir, '../dist')

const app = express()
app.use(express.json())

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

app.post('/api/auth/register', (req, res) => {
  const { email, password, displayName } = req.body ?? {}
  if (!email || !password || !displayName) {
    res.status(400).json({ message: 'Email, password and display name are required.' })
    return
  }
  if (!EMAIL_PATTERN.test(email)) {
    res.status(400).json({ message: 'Enter a valid email address.' })
    return
  }
  if (password.length < 6) {
    res.status(400).json({ message: 'Password must be at least 6 characters.' })
    return
  }

  const normalizedEmail = email.toLowerCase()
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail)
  if (existing) {
    res.status(409).json({ message: 'An account with that email already exists.' })
    return
  }

  const info = db
    .prepare('INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)')
    .run(normalizedEmail, hashPassword(password), displayName)
  const token = createSession(Number(info.lastInsertRowid))
  setSessionCookie(res, token)
  res.status(201).json({ id: Number(info.lastInsertRowid), email: normalizedEmail, displayName })
})

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body ?? {}
  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required.' })
    return
  }
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase())
  if (!user || !verifyPassword(password, user.password_hash)) {
    res.status(401).json({ message: 'Incorrect email or password.' })
    return
  }
  const token = createSession(user.id)
  setSessionCookie(res, token)
  res.json({ id: user.id, email: user.email, displayName: user.display_name })
})

app.post('/api/auth/logout', (req, res) => {
  const token = getSessionToken(req)
  if (token) deleteSession(token)
  clearSessionCookie(res)
  res.json({ ok: true })
})

app.get('/api/auth/me', (req, res) => {
  const user = getSessionUser(getSessionToken(req))
  if (!user) {
    res.status(401).json({ message: 'Not authenticated.' })
    return
  }
  res.json(user)
})

app.get('/api/library', requireAuth, (req, res) => {
  const rows = db
    .prepare(
      `SELECT library_entries.*, games.title AS title, games.image AS image, games.platforms AS platforms
       FROM library_entries JOIN games ON games.id = library_entries.game_id
       WHERE library_entries.user_id = ?
       ORDER BY library_entries.updated_at DESC`,
    )
    .all(req.user.id)
  res.json({ entries: rows.map(hydrateLibraryEntry) })
})

app.post('/api/library', requireAuth, (req, res) => {
  const { title, image, platforms, released, rawgId, rawgRating, genres, tags, status } = req.body ?? {}
  if (!title) {
    res.status(400).json({ message: 'A game title is required.' })
    return
  }

  const gameId = upsertGame({ rawgId, title, image, platforms, released, rawgRating, genres, tags })
  const existing = db.prepare('SELECT id FROM library_entries WHERE user_id = ? AND game_id = ?').get(req.user.id, gameId)
  if (existing) {
    res.status(409).json({ message: `${title} is already in your library` })
    return
  }

  const info = db
    .prepare('INSERT INTO library_entries (user_id, game_id, status) VALUES (?, ?, ?)')
    .run(req.user.id, gameId, status ?? 'Want to play')
  res.status(201).json(hydrateLibraryEntry(getLibraryEntryRow(Number(info.lastInsertRowid))))
})

app.patch('/api/library/:id', requireAuth, (req, res) => {
  const entry = db.prepare('SELECT * FROM library_entries WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)
  if (!entry) {
    res.status(404).json({ message: 'Library entry not found.' })
    return
  }

  const { status, rating, review } = req.body ?? {}
  const fields = []
  const values = []
  if (status !== undefined) { fields.push('status = ?'); values.push(status) }
  if (rating !== undefined) { fields.push('rating = ?'); values.push(rating) }
  if (review !== undefined) { fields.push('review = ?'); values.push(review) }
  fields.push("updated_at = datetime('now')")
  values.push(req.params.id)
  db.prepare(`UPDATE library_entries SET ${fields.join(', ')} WHERE id = ?`).run(...values)
  res.json(hydrateLibraryEntry(getLibraryEntryRow(Number(req.params.id))))
})

app.delete('/api/library/:id', requireAuth, (req, res) => {
  const entry = db.prepare('SELECT * FROM library_entries WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)
  if (!entry) {
    res.status(404).json({ message: 'Library entry not found.' })
    return
  }
  db.prepare('DELETE FROM library_entries WHERE id = ?').run(req.params.id)
  res.json({ id: Number(req.params.id) })
})

app.get('/api/games', handleGamesRequest)

app.use(express.static(distDir))
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'), (error) => {
    if (error) res.status(404).send('Run "npm run build" to generate the production frontend.')
  })
})

const port = process.env.PORT ?? 4000
app.listen(port, () => console.log(`Wayfinder server listening on http://localhost:${port}`))
