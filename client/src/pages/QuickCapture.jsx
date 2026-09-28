import { useEffect, useState } from 'react'
import { listNotes, createNote, deleteNote } from '../api'

export default function QuickCapture() {
  const [status, setStatus] = useState('loading')
  const [notes, setNotes] = useState([])
  const [error, setError] = useState(null)
  const [text, setText] = useState('')

  async function load() {
    setStatus('loading')
    try {
      setNotes(await listNotes())
      setStatus('ready')
    } catch (caught) {
      setError(caught)
      setStatus('error')
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function submit(e) {
    e.preventDefault()
    if (!text.trim()) return
    const value = text.trim()
    setText('')
    try {
      const created = await createNote(value)
      setNotes((prev) => [created, ...prev])
    } catch (caught) {
      setError(caught)
    }
  }

  async function handleDelete(id) {
    const previous = notes
    setNotes(notes.filter((n) => n.id !== id)) // optimistic
    try {
      await deleteNote(id)
    } catch (caught) {
      setNotes(previous)
      setError(caught)
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <form onSubmit={submit} className="flex gap-2 mb-6">
        <label className="sr-only" htmlFor="new-note">New idea</label>
        <input
          id="new-note"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="jot an idea before you forget it..."
          className="flex-1 bg-surface rounded-lg px-4 py-3 text-body outline-none"
        />
        <button
          type="submit"
          aria-label="Save note"
          className="bg-primary text-ink rounded-lg px-4 border border-ink"
        >
          →
        </button>
      </form>

      {error && <p className="text-primary mb-4" role="alert">{error.message}</p>}
      {status === 'loading' && <p className="text-ink/60">loading...</p>}

      {status === 'ready' && (
        <ul className="space-y-2">
          {notes.length === 0 && <p className="text-small text-ink/50">No notes yet.</p>}
          {notes.map((note) => (
            <li key={note.id} className="flex items-center justify-between bg-surface rounded-lg px-4 py-3">
              <span className="text-body">{note.text}</span>
              <button
                type="button"
                onClick={() => handleDelete(note.id)}
                aria-label="Delete note"
                className="text-ink/50 hover:text-ink"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
