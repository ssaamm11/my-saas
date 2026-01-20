import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { addTask, toggleTask, deleteTask } from '../actions'

export const dynamic = 'force-dynamic'

function toId(value: string) {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return null
  return n
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const projectId = toId(id)
  if (!projectId) notFound()

  const supabase = await createClient()

  const { data: userRes } = await supabase.auth.getUser()
  if (!userRes.user) redirect('/login')

  // 🔒 Pro gate (server-side)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', userRes.user.id)
    .single()

  if (profileError) return <p>Failed to load profile.</p>

  if ((profile?.plan ?? 'free') !== 'pro') {
    return (
      <main style={{ padding: 24 }}>
        <h1>Project</h1>
        <p>This feature is available on the Pro plan.</p>
        <a href="/dashboard">Back to dashboard</a>
      </main>
    )
  }

  const { data: project } = await supabase
    .from('projects')
    .select('id,name')
    .eq('id', projectId)
    .maybeSingle()

  if (!project) notFound()

  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('id,title,is_done,created_at')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (tasksError) return <p>Failed to load tasks.</p>

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <h1>{project.name}</h1>

      <form action={addTask} style={{ display: 'flex', gap: 8 }}>
        <input type="hidden" name="projectId" value={projectId} />
        <input name="title" placeholder="New task..." />
        <button type="submit">Add</button>
      </form>

      {!tasks || tasks.length === 0 ? (
        <p>No tasks yet.</p>
      ) : (
        <ul style={{ display: 'grid', gap: 8, paddingLeft: 18 }}>
          {tasks.map((t) => (
            <li key={t.id} style={{ display: 'flex', gap: 8 }}>
              <span style={{ textDecoration: t.is_done ? 'line-through' : '' }}>
                {t.title}
              </span>

              <form action={toggleTask}>
                <input type="hidden" name="projectId" value={projectId} />
                <input type="hidden" name="taskId" value={t.id} />
                <input
                  type="hidden"
                  name="nextDone"
                  value={(!t.is_done).toString()}
                />
                <button type="submit">{t.is_done ? 'Undo' : 'Done'}</button>
              </form>

              <form action={deleteTask}>
                <input type="hidden" name="projectId" value={projectId} />
                <input type="hidden" name="taskId" value={t.id} />
                <button type="submit">Delete</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}


