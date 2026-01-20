import { createClient } from '@/lib/supabase/server'
import { updateDisplayName } from './profile-actions'

export default async function ProfileSection() {
  const supabase = await createClient()

  const { data: userRes } = await supabase.auth.getUser()
  const user = userRes.user
  if (!user) return null

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('email, display_name')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <section style={{ marginTop: 16 }}>

      {error && <p style={{ color: 'crimson' }}>{error.message}</p>}

      <p>Email: {profile?.email ?? user.email}</p>

      <form action={updateDisplayName} style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <input
          name="display_name"
          placeholder="Display name"
          defaultValue={profile?.display_name ?? ''}
          style={{ flex: 1 }}
        />
        <button type="submit">Save</button>
      </form>
    </section>
  )
}


