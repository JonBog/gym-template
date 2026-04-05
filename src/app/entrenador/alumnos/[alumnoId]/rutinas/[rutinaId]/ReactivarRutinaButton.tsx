'use client'

import { useTransition } from 'react'

type Props = {
  rutinaId: string
  alumnoId: string
  reactivarAction: (rutinaId: string, alumnoId: string) => Promise<void>
}

export default function ReactivarRutinaButton({ rutinaId, alumnoId, reactivarAction }: Props) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => reactivarAction(rutinaId, alumnoId))}
      className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors disabled:opacity-50 flex-shrink-0"
      style={{
        background: 'var(--primary)',
        color: '#0a0a0a',
        fontFamily: 'var(--font-heading)',
      }}
    >
      {isPending ? 'Activando…' : 'Reactivar rutina'}
    </button>
  )
}
