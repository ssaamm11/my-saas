import Link from 'next/link'

export default function BillingCancelPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Checkout canceled</h1>
      <p>No changes were made.</p>
      <Link href="/dashboard">Back to dashboard</Link>
    </main>
  )
}

