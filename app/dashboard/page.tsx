import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SignOutButton from './sign-out-button'
import NotesServer from './notes-server'
import ProfileSection from './profile-section'
import ProjectsSection from './projects-section'
import UpgradeButton from './upgrade-button'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', data.user.id)
    .maybeSingle()

  const plan = profile?.plan ?? 'free'

  return (
    <main style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <p>Signed in as: {data.user.email}</p>
      <SignOutButton />

      <p style={{ marginTop: 12 }}>
        Plan: <strong>{plan}</strong>
      </p>

      {plan !== 'pro' && (
        <div style={{ marginTop: 8 }}>
          <UpgradeButton />
        </div>
      )}

      <NotesServer />
      <ProfileSection />
      <ProjectsSection />
    </main>
  )
}


