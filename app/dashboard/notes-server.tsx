import { createClient } from '@/lib/supabase/server'
import { addNote, deleteNote } from './actions'

export default async function NotesServer() {
  const supabase = await createClient()

  const { data: userRes } = await supabase.auth.getUser()
  const user = userRes.user
  if (!user) return null

  const { data: notes, error } = await supabase
    .from('notes')
    .select('id, content, created_at')
    .order('id', { ascending: false })

  return (
    <section style={{ marginTop: 16 }}>
      <h2>Notes (server-rendered)</h2>

      <form action={addNote} style={{ display: 'flex', gap: 8, margin: '10px 0' }}>
        <input name="content" placeholder="Write a note..." required style={{ flex: 1 }} />
        <button type="submit">Add</button>
      </form>

      {error && <p style={{ color: 'crimson' }}>{error.message}</p>}

      {!notes || notes.length === 0 ? (
        <p>No notes.</p>
      ) : (
        <ul>
          {notes.map((n) => (
            <li key={n.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span>
                #{n.id} — {n.content}
              </span>

              <form
                action={async () => {
                  'use server'
                  await deleteNote(n.id)
                }}
              >
                <button type="submit">Delete</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
