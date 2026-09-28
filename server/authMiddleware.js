import { adminAuth } from './firebaseAdmin.js'

export async function requireAuth(request, response, next) {
  const header = request.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return response.status(401).json({ error: 'Missing Authorization header' })
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token)
    if (!decoded.email_verified) {
      return response.status(403).json({ error: 'Email not verified' })
    }
    request.userId = decoded.uid
    next()
  } catch (error) {
    response.status(401).json({ error: 'Invalid or expired token' })
  }
}