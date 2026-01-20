'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Note = {
  id: number
  user_id: string
  content: string
  created_at: string
}

export default function Notes() {
  const supabase = createClient()
  const [notes, setNotes] = useState<Note[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setError(null)
    setLoading(true)

    const { data, error } = await supabase
      .from('notes')
      .select('id,user_id,content,created_at')
      .order('id', { ascending: false })

    if (error) setError(error.message)
    setNotes((data as Note[]) ?? [])
    setLoading(false)
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const { error } = await supabase.from('notes').insert({ content })

    if (error) {
      setError(error.message)
      return
    }

    setContent('')
    await load()
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <section style={{ marginTop: 16 }}>
      <h2>Notes (RLS test)</h2>

      <form onSubmit={addNote} style={{ display: 'flex', gap: 8, margin: '10px 0' }}>
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a note..."
          required
          style={{ flex: 1 }}
        />
        <button type="submit">Add</button>
      </form>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : notes.length === 0 ? (
        <p>No notes.</p>
      ) : (
        <ul>
          {notes.map((n) => (
            <li key={n.id}>
              #{n.id} — {n.content}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
