'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function addProject(formData: FormData) {
  const name = String(formData.get('name') || '').trim()
  if (!name) return

  const supabase = await createClient()
  const { data: userRes } = await supabase.auth.getUser()
  if (!userRes.user) return

  await supabase.from('projects').insert({ name })
  revalidatePath('/dashboard')
}

export async function deleteProject(id: number) {
  const supabase = await createClient()
  const { data: userRes } = await supabase.auth.getUser()
  if (!userRes.user) return

  await supabase.from('projects').delete().eq('id', id)
  revalidatePath('/dashboard')
}
