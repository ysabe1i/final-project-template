import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { pool } from './db/pool.js'
import { requireAuth } from './authMiddleware.js'
import * as kits from './kitsRepo.js'
import * as projects from './projectsRepo.js'
import * as notes from './notesRepo.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',').map((o) => o.trim()).filter(Boolean)

app.use(cors({ origin: allowedOrigins }))
app.use(express.json({ limit: '100kb' }))

const uploadsDir = path.join(__dirname, 'uploads')
app.use('/uploads', express.static(uploadsDir))

const ALLOWED_MIME_TYPES = new Set([
  'image/png', 'image/jpeg', 'image/webp', 'image/gif',
  'font/ttf', 'font/otf', 'font/woff', 'font/woff2',
  'application/font-woff', 'application/font-woff2', 'application/x-font-ttf',
  'application/octet-stream',
])

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (request, file, callback) => {
      const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_')
      callback(null, `${Date.now()}-${safeName}`)
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase()
    const allowedExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.ttf', '.otf', '.woff', '.woff2'])
    if (ALLOWED_MIME_TYPES.has(file.mimetype) || allowedExtensions.has(extension)) {
      callback(null, true)
    } else {
      callback(new Error('Only image and font files are allowed'))
    }
  },
})

app.get('/healthz', (request, response) => response.json({ ok: true }))

app.get('/readyz', async (request, response) => {
  try {
    await pool.query('SELECT 1')
    response.json({ ok: true, db: 'up' })
  } catch (error) {
    console.error('readyz failed:', error.message)
    response.status(503).json({ ok: false, db: 'down' })
  }
})

// Every /api/* route below requires a verified Firebase ID token.
// request.userId is set by requireAuth and scopes all data per-owner.
app.use('/api', requireAuth)

app.post('/api/uploads', (request, response) => {
  upload.single('file')(request, response, (error) => {
    if (error) return response.status(400).json({ error: error.message })
    if (!request.file) return response.status(400).json({ error: 'No file uploaded' })
    response.status(201).json({ url: `/uploads/${request.file.filename}` })
  })
})

function validateKit(body) {
  const errors = []
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const tag = typeof body.tag === 'string' ? body.tag.trim() : ''
  const colors = Array.isArray(body.colors) ? body.colors : []
  const logos = Array.isArray(body.logos) ? body.logos : []
  const fonts = Array.isArray(body.fonts) ? body.fonts : []

  if (!name) errors.push('name is required')
  if (name.length > 120) errors.push('name must be 120 characters or fewer')
  for (const color of colors) {
    if (typeof color.hex !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(color.hex)) {
      errors.push(`invalid color hex: ${color.hex}`)
    }
  }
  return { errors, value: { name, tag, colors, logos, fonts } }
}

app.get('/api/kits', async (request, response, next) => {
  try { response.json(await kits.getAll(pool, request.userId)) } catch (error) { next(error) }
})

app.get('/api/kits/:id', async (request, response, next) => {
  try {
    const row = await kits.getById(pool, request.userId, request.params.id)
    if (!row) return response.status(404).json({ error: 'Not found' })
    response.json(row)
  } catch (error) { next(error) }
})

app.post('/api/kits', async (request, response, next) => {
  const { errors, value } = validateKit(request.body ?? {})
  if (errors.length > 0) return response.status(400).json({ error: errors.join('; ') })
  try { response.status(201).json(await kits.create(pool, request.userId, value)) } catch (error) { next(error) }
})

app.put('/api/kits/:id', async (request, response, next) => {
  const { errors, value } = validateKit(request.body ?? {})
  if (errors.length > 0) return response.status(400).json({ error: errors.join('; ') })
  try {
    const row = await kits.update(pool, request.userId, request.params.id, value)
    if (!row) return response.status(404).json({ error: 'Not found' })
    response.json(row)
  } catch (error) { next(error) }
})

app.delete('/api/kits/:id', async (request, response, next) => {
  try {
    const removed = await kits.remove(pool, request.userId, request.params.id)
    if (!removed) return response.status(404).json({ error: 'Not found' })
    response.status(204).end()
  } catch (error) { next(error) }
})

function validateProject(body) {
  const errors = []
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const notesWorked = typeof body.notes_worked === 'string' ? body.notes_worked.trim() : ''
  const notesToChange = typeof body.notes_to_change === 'string' ? body.notes_to_change.trim() : ''

  if (!title) errors.push('title is required')
  if (title.length > 200) errors.push('title must be 200 characters or fewer')
  if (notesWorked.length > 4000) errors.push('reflection must be 4000 characters or fewer')

  return {
    errors,
    value: { title, image_url: body.image_url ?? null, kit_id: body.kit_id || null, notes_worked: notesWorked, notes_to_change: notesToChange },
  }
}

app.get('/api/projects', async (request, response, next) => {
  try { response.json(await projects.getAll(pool, request.userId)) } catch (error) { next(error) }
})

app.get('/api/projects/:id', async (request, response, next) => {
  try {
    const row = await projects.getById(pool, request.userId, request.params.id)
    if (!row) return response.status(404).json({ error: 'Not found' })
    response.json(row)
  } catch (error) { next(error) }
})

app.post('/api/projects', async (request, response, next) => {
  const { errors, value } = validateProject(request.body ?? {})
  if (errors.length > 0) return response.status(400).json({ error: errors.join('; ') })
  try { response.status(201).json(await projects.create(pool, request.userId, value)) } catch (error) { next(error) }
})

app.put('/api/projects/:id', async (request, response, next) => {
  const { errors, value } = validateProject(request.body ?? {})
  if (errors.length > 0) return response.status(400).json({ error: errors.join('; ') })
  try {
    const row = await projects.update(pool, request.userId, request.params.id, value)
    if (!row) return response.status(404).json({ error: 'Not found' })
    response.json(row)
  } catch (error) { next(error) }
})

app.delete('/api/projects/:id', async (request, response, next) => {
  try {
    const removed = await projects.remove(pool, request.userId, request.params.id)
    if (!removed) return response.status(404).json({ error: 'Not found' })
    response.status(204).end()
  } catch (error) { next(error) }
})

app.get('/api/notes', async (request, response, next) => {
  try { response.json(await notes.getAll(pool, request.userId)) } catch (error) { next(error) }
})

app.post('/api/notes', async (request, response, next) => {
  const text = typeof request.body?.text === 'string' ? request.body.text.trim() : ''
  if (!text) return response.status(400).json({ error: 'text is required' })
  if (text.length > 500) return response.status(400).json({ error: 'text must be 500 characters or fewer' })
  try { response.status(201).json(await notes.create(pool, request.userId, text)) } catch (error) { next(error) }
})

app.delete('/api/notes/:id', async (request, response, next) => {
  try {
    const removed = await notes.remove(pool, request.userId, request.params.id)
    if (!removed) return response.status(404).json({ error: 'Not found' })
    response.status(204).end()
  } catch (error) { next(error) }
})

app.use((request, response) => response.status(404).json({ error: 'No such route' }))

app.use((error, request, response, next) => {
  console.error(error)
  response.status(500).json({ error: 'Something went wrong on the server' })
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
  console.log(`CORS allows: ${allowedOrigins.join(', ')}`)
})