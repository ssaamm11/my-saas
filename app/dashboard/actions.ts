'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function addNote(formData: FormData) {
  const content = String(formData.get('content') || '').trim()
  if (!content) return

  const supabase = await createClient()
  const { data: userRes } = await supabase.auth.getUser()
  if (!userRes.user) return

  await supabase.from('notes').insert({ content })
  revalidatePath('/dashboard')
}

export async function deleteNote(id: number) {
  const supabase = await createClient()
  const { data: userRes } = await supabase.auth.getUser()
  if (!userRes.user) return

  await supabase.from('notes').delete().eq('id', id)
  revalidatePath('/dashboard')
}


