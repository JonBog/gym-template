import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RutinaDiaClient from './RutinaDiaClient'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/test'),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}))

vi.mock('@/app/alumno/rutinas/actions', () => ({
  toggleEjercicioCompletado: vi.fn(),
}))

import { toggleEjercicioCompletado } from '@/app/alumno/rutinas/actions'

const mockEjercicios = [
  {
    id: 'ej-1',
    nombre: 'Sentadilla',
    descripcion: null,
    series: 4,
    repsMin: 8,
    repsMax: 12,
    pesoKg: 80,
    pesoNota: null,
    descansoSeg: 90,
    duracionMin: null,
    distanciaKm: null,
    notas: null,
    orden: 0,
  },
  {
    id: 'ej-2',
    nombre: 'Press banca',
    descripcion: null,
    series: 3,
    repsMin: 10,
    repsMax: 10,
    pesoKg: null,
    pesoNota: 'Peso corporal',
    descansoSeg: 60,
    duracionMin: null,
    distanciaKm: null,
    notas: null,
    orden: 1,
  },
  {
    id: 'ej-3',
    nombre: 'Correr',
    descripcion: null,
    series: 1,
    repsMin: null,
    repsMax: null,
    pesoKg: null,
    pesoNota: null,
    descansoSeg: null,
    duracionMin: null,
    distanciaKm: 5,
    notas: null,
    orden: 2,
  },
]

const defaultProps = {
  dia: 'lunes',
  nombreDia: 'Lunes',
  rutinaDiaNombre: 'Piernas y Core',
  rutinaDiaTipo: 'Fuerza',
  ejercicios: mockEjercicios,
  completadosIniciales: [],
}

describe('RutinaDiaClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(toggleEjercicioCompletado).mockResolvedValue(undefined as never)
  })

  it('renders the day name and routine name in the header', () => {
    render(<RutinaDiaClient {...defaultProps} />)

    expect(screen.getByText('Lunes — Piernas y Core')).toBeInTheDocument()
  })

  it('renders the tipo badge when rutinaDiaTipo is provided', () => {
    render(<RutinaDiaClient {...defaultProps} />)

    expect(screen.getByText('Fuerza')).toBeInTheDocument()
  })

  it('does not render tipo badge when rutinaDiaTipo is null', () => {
    render(<RutinaDiaClient {...defaultProps} rutinaDiaTipo={null} />)

    expect(screen.queryByText('Fuerza')).not.toBeInTheDocument()
  })

  it('renders all exercise names', () => {
    render(<RutinaDiaClient {...defaultProps} />)

    expect(screen.getByText('Sentadilla')).toBeInTheDocument()
    expect(screen.getByText('Press banca')).toBeInTheDocument()
    expect(screen.getByText('Correr')).toBeInTheDocument()
  })

  it('shows initial progress as 0 of 3 — 0%', () => {
    render(<RutinaDiaClient {...defaultProps} />)

    expect(screen.getByText(/0\s*de\s*3\s*—\s*0%/)).toBeInTheDocument()
  })

  it('shows correct progress when completadosIniciales has entries', () => {
    render(<RutinaDiaClient {...defaultProps} completadosIniciales={['ej-1', 'ej-2']} />)

    expect(screen.getByText(/2\s*de\s*3\s*—\s*67%/)).toBeInTheDocument()
  })

  it('marks an exercise as complete when clicked (optimistic update)', async () => {
    const user = userEvent.setup()
    render(<RutinaDiaClient {...defaultProps} />)

    const sentadillaCard = screen.getByText('Sentadilla').closest('[class*="rounded"]')!
    await user.click(sentadillaCard)

    await waitFor(() => {
      expect(screen.getByText(/1\s*de\s*3\s*—\s*33%/)).toBeInTheDocument()
    })
  })

  it('calls toggleEjercicioCompletado with the exercise id on click', async () => {
    const user = userEvent.setup()
    render(<RutinaDiaClient {...defaultProps} />)

    const sentadillaCard = screen.getByText('Sentadilla').closest('[class*="rounded"]')!
    await user.click(sentadillaCard)

    await waitFor(() => {
      expect(toggleEjercicioCompletado).toHaveBeenCalledWith('ej-1')
    })
  })

  it('toggles exercise back to incomplete when clicked again', async () => {
    const user = userEvent.setup()
    render(<RutinaDiaClient {...defaultProps} />)

    const sentadillaCard = screen.getByText('Sentadilla').closest('[class*="rounded"]')!
    await user.click(sentadillaCard)

    await waitFor(() => {
      expect(screen.getByText(/1\s*de\s*3\s*—\s*33%/)).toBeInTheDocument()
    })

    await user.click(sentadillaCard)

    await waitFor(() => {
      expect(screen.getByText(/0\s*de\s*3\s*—\s*0%/)).toBeInTheDocument()
    })
  })

  it('reverts optimistic update when server action throws', async () => {
    vi.mocked(toggleEjercicioCompletado).mockRejectedValue(new Error('Server error'))
    const user = userEvent.setup()
    render(<RutinaDiaClient {...defaultProps} />)

    const sentadillaCard = screen.getByText('Sentadilla').closest('[class*="rounded"]')!
    await user.click(sentadillaCard)

    await waitFor(() => {
      expect(screen.getByText(/0\s*de\s*3\s*—\s*0%/)).toBeInTheDocument()
    })
  })

  it('renders back link to /alumno/rutinas', () => {
    render(<RutinaDiaClient {...defaultProps} />)

    const link = screen.getByText('Volver a mis rutinas').closest('a')
    expect(link).toHaveAttribute('href', '/alumno/rutinas')
  })

  it('renders exercise with distance when distanciaKm is set', () => {
    render(<RutinaDiaClient {...defaultProps} />)

    expect(screen.getByText('5km')).toBeInTheDocument()
  })

  it('renders exercise with pesoNota when provided', () => {
    render(<RutinaDiaClient {...defaultProps} />)

    expect(screen.getByText('Peso corporal')).toBeInTheDocument()
  })

  it('renders descanso formatted correctly for seconds under a minute', () => {
    const ejercicioConDescansoCorto = {
      ...mockEjercicios[1],
      descansoSeg: 45,
    }
    render(
      <RutinaDiaClient
        {...defaultProps}
        ejercicios={[ejercicioConDescansoCorto]}
      />
    )

    expect(screen.getByText(/Descanso:.*45s/)).toBeInTheDocument()
  })

  it('renders descanso formatted as minutes for 90 seconds', () => {
    render(<RutinaDiaClient {...defaultProps} />)

    expect(screen.getByText(/Descanso:.*1min 30s/)).toBeInTheDocument()
  })
})
