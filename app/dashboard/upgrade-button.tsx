'use client'

export default function UpgradeButton() {
  return (
    <button
      onClick={async () => {
        const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          credentials: 'include',
        })
        const data = await res.json()

        if (!res.ok) {
          alert(data?.error ?? 'Checkout failed')
          return
        }

        // Debug proof
        alert(`customerId=${data.customerId} | createdNewCustomer=${data.createdNewCustomer}`)

        if (data?.url) window.location.href = data.url
      }}
    >
      Upgrade to Pro
    </button>
  )
}


