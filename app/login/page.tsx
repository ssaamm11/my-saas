'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error

        // Ensure the client session exists before navigating to a server-protected route
        await supabase.auth.getSession()

        router.replace('/dashboard')
        router.refresh()
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('Signup successful. If email confirmation is enabled, check your inbox before logging in.')
      }
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 420 }}>
      <h1>Auth</h1>

      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        <button type="button" onClick={() => setMode('login')} disabled={mode === 'login'}>
          Login
        </button>
        <button type="button" onClick={() => setMode('signup')} disabled={mode === 'signup'}>
          Signup
        </button>
      </div>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10 }}>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>

        <label>
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Working...' : mode === 'login' ? 'Login' : 'Create account'}
        </button>

        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        {message && <p>{message}</p>}
      </form>
    </main>
  )
}

