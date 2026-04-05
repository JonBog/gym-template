import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminAlumnosGrid from './AdminAlumnosGrid'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/test'),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}))

const mockAlumnos = [
  {
    id: 'a1',
    nombre: 'Carlos',
    apellido: 'Pérez',
    email: 'carlos@example.com',
    activo: true,
    rutina: 'Fuerza 4 días',
    ultimaSesion: 'Hace 2 días',
    entrenador: 'Marcos López',
    esMio: false,
  },
  {
    id: 'a2',
    nombre: 'Lucía',
    apellido: 'Gómez',
    email: 'lucia@example.com',
    activo: false,
    rutina: 'Sin rutina',
    ultimaSesion: 'Hace 1 mes',
    entrenador: 'Marcos López',
    esMio: false,
  },
  {
    id: 'a3',
    nombre: 'Rodrigo',
    apellido: 'Silva',
    email: 'rodrigo@example.com',
    activo: true,
    rutina: 'Cardio 3 días',
    ultimaSesion: 'Hoy',
    entrenador: null,
    esMio: false,
  },
]

describe('AdminAlumnosGrid', () => {
  it('renders the section heading', () => {
    render(<AdminAlumnosGrid alumnos={mockAlumnos} />)

    expect(screen.getByText('Todos los Alumnos')).toBeInTheDocument()
  })

  it('renders all student cards by default', () => {
    render(<AdminAlumnosGrid alumnos={mockAlumnos} />)

    expect(screen.getByText('Carlos Pérez')).toBeInTheDocument()
    expect(screen.getByText('Lucía Gómez')).toBeInTheDocument()
    expect(screen.getByText('Rodrigo Silva')).toBeInTheDocument()
  })

  it('shows the total count of students', () => {
    render(<AdminAlumnosGrid alumnos={mockAlumnos} />)

    expect(screen.getByText('3 alumnos')).toBeInTheDocument()
  })

  it('shows empty state when no alumnos are provided', () => {
    render(<AdminAlumnosGrid alumnos={[]} />)

    expect(screen.getByText('Sin alumnos aun')).toBeInTheDocument()
    expect(screen.getByText('No hay alumnos registrados en el gym.')).toBeInTheDocument()
  })

  it('filters to show only active students', async () => {
    const user = userEvent.setup()
    render(<AdminAlumnosGrid alumnos={mockAlumnos} />)

    await user.click(screen.getByRole('button', { name: 'Activos' }))

    expect(screen.getByText('Carlos Pérez')).toBeInTheDocument()
    expect(screen.getByText('Rodrigo Silva')).toBeInTheDocument()
    expect(screen.queryByText('Lucía Gómez')).not.toBeInTheDocument()
  })

  it('filters to show only inactive students', async () => {
    const user = userEvent.setup()
    render(<AdminAlumnosGrid alumnos={mockAlumnos} />)

    await user.click(screen.getByRole('button', { name: 'Inactivos' }))

    expect(screen.getByText('Lucía Gómez')).toBeInTheDocument()
    expect(screen.queryByText('Carlos Pérez')).not.toBeInTheDocument()
    expect(screen.queryByText('Rodrigo Silva')).not.toBeInTheDocument()
  })

  it('filters to show only students without trainer', async () => {
    const user = userEvent.setup()
    render(<AdminAlumnosGrid alumnos={mockAlumnos} />)

    await user.click(screen.getByRole('button', { name: 'Sin asignar' }))

    expect(screen.getByText('Rodrigo Silva')).toBeInTheDocument()
    expect(screen.queryByText('Carlos Pérez')).not.toBeInTheDocument()
    expect(screen.queryByText('Lucía Gómez')).not.toBeInTheDocument()
  })

  it('updates count label after filtering', async () => {
    const user = userEvent.setup()
    render(<AdminAlumnosGrid alumnos={mockAlumnos} />)

    await user.click(screen.getByRole('button', { name: 'Activos' }))

    expect(screen.getByText('2 alumnos')).toBeInTheDocument()
  })

  it('shows singular label when only 1 student matches', async () => {
    const user = userEvent.setup()
    render(<AdminAlumnosGrid alumnos={mockAlumnos} />)

    await user.click(screen.getByRole('button', { name: 'Inactivos' }))

    expect(screen.getByText('1 alumno')).toBeInTheDocument()
  })

  it('searches by student name', async () => {
    const user = userEvent.setup()
    render(<AdminAlumnosGrid alumnos={mockAlumnos} />)

    await user.type(screen.getByPlaceholderText(/buscar alumno/i), 'carlos')

    expect(screen.getByText('Carlos Pérez')).toBeInTheDocument()
    expect(screen.queryByText('Lucía Gómez')).not.toBeInTheDocument()
    expect(screen.queryByText('Rodrigo Silva')).not.toBeInTheDocument()
  })

  it('searches by email', async () => {
    const user = userEvent.setup()
    render(<AdminAlumnosGrid alumnos={mockAlumnos} />)

    await user.type(screen.getByPlaceholderText(/buscar alumno/i), 'lucia@example')

    expect(screen.getByText('Lucía Gómez')).toBeInTheDocument()
    expect(screen.queryByText('Carlos Pérez')).not.toBeInTheDocument()
  })

  it('searches by trainer name', async () => {
    const user = userEvent.setup()
    render(<AdminAlumnosGrid alumnos={mockAlumnos} />)

    await user.type(screen.getByPlaceholderText(/buscar alumno/i), 'marcos')

    expect(screen.getByText('Carlos Pérez')).toBeInTheDocument()
    expect(screen.getByText('Lucía Gómez')).toBeInTheDocument()
    expect(screen.queryByText('Rodrigo Silva')).not.toBeInTheDocument()
  })

  it('search is case-insensitive', async () => {
    const user = userEvent.setup()
    render(<AdminAlumnosGrid alumnos={mockAlumnos} />)

    await user.type(screen.getByPlaceholderText(/buscar alumno/i), 'CARLOS')

    expect(screen.getByText('Carlos Pérez')).toBeInTheDocument()
  })

  it('shows no-results state when search yields no matches', async () => {
    const user = userEvent.setup()
    render(<AdminAlumnosGrid alumnos={mockAlumnos} />)

    await user.type(screen.getByPlaceholderText(/buscar alumno/i), 'xyznoexiste')

    expect(screen.getByText('Sin resultados')).toBeInTheDocument()
    expect(screen.getByText('Proba con otro nombre o cambia el filtro.')).toBeInTheDocument()
  })

  it('renders Activo badge for active students', () => {
    render(<AdminAlumnosGrid alumnos={mockAlumnos} />)

    const activoBadges = screen.getAllByText('Activo')
    expect(activoBadges).toHaveLength(2)
  })

  it('renders Inactivo badge for inactive students', () => {
    render(<AdminAlumnosGrid alumnos={mockAlumnos} />)

    expect(screen.getByText('Inactivo')).toBeInTheDocument()
  })

  it('renders Sin asignar badge when trainer is null', () => {
    render(<AdminAlumnosGrid alumnos={mockAlumnos} />)

    const matches = screen.getAllByText('Sin asignar')
    expect(matches.length).toBeGreaterThanOrEqual(1)
  })

  it('renders Ver perfil link pointing to admin profile route', () => {
    render(<AdminAlumnosGrid alumnos={mockAlumnos} />)

    const links = screen.getAllByText('Ver perfil')
    const hrefs = links.map((l) => l.closest('a')?.getAttribute('href'))

    expect(hrefs).toContain('/admin/alumnos/a1')
    expect(hrefs).toContain('/admin/alumnos/a2')
    expect(hrefs).toContain('/admin/alumnos/a3')
  })

  it('shows Mis Alumnos section when admin has assigned students', () => {
    const alumnosConMios = [
      { ...mockAlumnos[0], esMio: true },
      ...mockAlumnos.slice(1),
    ]
    render(<AdminAlumnosGrid alumnos={alumnosConMios} />)

    expect(screen.getByText('Mis Alumnos')).toBeInTheDocument()
    expect(screen.getByText('Todos los alumnos')).toBeInTheDocument()
  })

  it('does not show Mis Alumnos section when admin has no assigned students', () => {
    render(<AdminAlumnosGrid alumnos={mockAlumnos} />)

    expect(screen.queryByText('Mis Alumnos')).not.toBeInTheDocument()
  })

  it('resets to all students when Todos filter is clicked after another filter', async () => {
    const user = userEvent.setup()
    render(<AdminAlumnosGrid alumnos={mockAlumnos} />)

    await user.click(screen.getByRole('button', { name: 'Activos' }))
    await user.click(screen.getByRole('button', { name: 'Todos' }))

    expect(screen.getByText('Carlos Pérez')).toBeInTheDocument()
    expect(screen.getByText('Lucía Gómez')).toBeInTheDocument()
    expect(screen.getByText('Rodrigo Silva')).toBeInTheDocument()
  })
})
