import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { db } from './db.js'

const SESSION_COOKIE = 'wayfinder_session'

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const hashBuffer = Buffer.from(hash, 'hex')
  const candidate = scryptSync(password, salt, 64)
  return candidate.length === hashBuffer.length && timingSafeEqual(candidate, hashBuffer)
}

export function createSession(userId) {
  const token = randomBytes(32).toString('hex')
  db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(token, userId)
  return token
}

export function deleteSession(token) {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token)
}

export function getSessionUser(token) {
  if (!token) return null
  const row = db
    .prepare(
      `SELECT users.id AS id, users.email AS email, users.display_name AS displayName
       FROM sessions JOIN users ON users.id = sessions.user_id
       WHERE sessions.token = ?`,
    )
    .get(token)
  return row ?? null
}

export function parseCookies(header) {
  const cookies = {}
  if (!header) return cookies
  header.split(';').forEach((pair) => {
    const separator = pair.indexOf('=')
    if (separator === -1) return
    const key = pair.slice(0, separator).trim()
    const value = pair.slice(separator + 1).trim()
    cookies[key] = decodeURIComponent(value)
  })
  return cookies
}

export function setSessionCookie(res, token) {
  const maxAgeSeconds = 60 * 60 * 24 * 30
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`)
}

export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`)
}

export function getSessionToken(req) {
  return parseCookies(req.headers.cookie)[SESSION_COOKIE]
}

export function requireAuth(req, res, next) {
  const user = getSessionUser(getSessionToken(req))
  if (!user) {
    res.status(401).json({ message: 'Not authenticated.' })
    return
  }
  req.user = user
  next()
}
