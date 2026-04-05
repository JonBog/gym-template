'use client'

import { useTransition } from 'react'

type Props = {
  planId: string
  alumnoId: string
  reactivarAction: (planId: string, alumnoId: string) => Promise<void>
}

export default function ReactivarPlanButton({ planId, alumnoId, reactivarAction }: Props) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => reactivarAction(planId, alumnoId))}
      className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors disabled:opacity-50 flex-shrink-0"
      style={{
        background: 'var(--primary)',
        color: '#0a0a0a',
        fontFamily: 'var(--font-heading)',
      }}
    >
      {isPending ? 'Activando…' : 'Reactivar plan'}
    </button>
  )
}
