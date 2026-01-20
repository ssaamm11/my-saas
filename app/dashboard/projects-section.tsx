import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { addProject, deleteProject } from './projects-actions'

export default async function ProjectsSection() {
  const supabase = await createClient()

  const { data: userRes } = await supabase.auth.getUser()
  if (!userRes.user) return null

  const { data: projects, error } = await supabase
    .from('projects')
    .select('id,name,created_at')
    .order('id', { ascending: false })

  return (
    <section style={{ marginTop: 16 }}>
      <h2>Projects (user-owned table pattern)</h2>

      <form action={addProject} style={{ display: 'flex', gap: 8, margin: '10px 0' }}>
        <input name="name" placeholder="New project name..." required style={{ flex: 1 }} />
        <button type="submit">Add</button>
      </form>

      {error && <p style={{ color: 'crimson' }}>{error.message}</p>}

      {!projects || projects.length === 0 ? (
        <p>No projects.</p>
      ) : (
        <ul>
          {projects.map((p) => (
            <li key={p.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Link href={`/projects/${p.id}`}>
                #{p.id} — {p.name}
              </Link>

              <form
                action={async () => {
                  'use server'
                  await deleteProject(p.id)
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
