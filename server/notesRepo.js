export async function getAll(pool, userId) {
  const result = await pool.query('SELECT * FROM quick_notes WHERE user_id = $1 ORDER BY created_at DESC', [userId])
  return result.rows
}

export async function create(pool, userId, text) {
  const result = await pool.query('INSERT INTO quick_notes (user_id, text) VALUES ($1, $2) RETURNING *', [userId, text])
  return result.rows[0]
}

export async function remove(pool, userId, id) {
  const result = await pool.query('DELETE FROM quick_notes WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId])
  return result.rowCount > 0
}