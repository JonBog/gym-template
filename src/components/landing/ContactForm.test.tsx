import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactForm from './ContactForm'

const GYM_WHATSAPP = '+595 981 123 456'

describe('ContactForm', () => {
  beforeEach(() => {
    vi.stubGlobal('open', vi.fn())
  })

  it('renders all form fields', () => {
    render(<ContactForm whatsapp={GYM_WHATSAPP} />)

    expect(screen.getByPlaceholderText('¿Cómo te llamás?')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('+595 XXX XXX XXX')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/alguna lesión/i)).toBeInTheDocument()
  })

  it('renders the submit button', () => {
    render(<ContactForm whatsapp={GYM_WHATSAPP} />)

    expect(screen.getByRole('button', { name: /enviar por whatsapp/i })).toBeInTheDocument()
  })

  it('renders all objective options in the select', () => {
    render(<ContactForm whatsapp={GYM_WHATSAPP} />)

    expect(screen.getByRole('option', { name: 'Perder peso' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Ganar músculo' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Mejorar condición física' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Solo nutrición' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Plan integral (todo)' })).toBeInTheDocument()
  })

  it('opens a WhatsApp URL on submit with the correct phone number', async () => {
    const user = userEvent.setup()
    render(<ContactForm whatsapp={GYM_WHATSAPP} />)

    await user.type(screen.getByPlaceholderText('¿Cómo te llamás?'), 'Juan')
    await user.type(screen.getByPlaceholderText('+595 XXX XXX XXX'), '+595 981 000 111')
    await user.selectOptions(screen.getByRole('combobox'), 'ganar-musculo')

    await user.click(screen.getByRole('button', { name: /enviar por whatsapp/i }))

    expect(window.open).toHaveBeenCalledOnce()

    const [url, target] = vi.mocked(window.open).mock.calls[0]
    expect(target).toBe('_blank')
    expect(url).toMatch(/^https:\/\/wa\.me\/595981123456/)
  })

  it('encodes the user name in the WhatsApp message text', async () => {
    const user = userEvent.setup()
    render(<ContactForm whatsapp={GYM_WHATSAPP} />)

    await user.type(screen.getByPlaceholderText('¿Cómo te llamás?'), 'María')
    await user.type(screen.getByPlaceholderText('+595 XXX XXX XXX'), '+595 981 000 222')
    await user.selectOptions(screen.getByRole('combobox'), 'perder-peso')

    await user.click(screen.getByRole('button', { name: /enviar por whatsapp/i }))

    const url = vi.mocked(window.open).mock.calls[0][0] as string
    const decoded = decodeURIComponent(url.split('?text=')[1])

    expect(decoded).toContain('Soy *María*')
    expect(decoded).toContain('Perder peso')
  })

  it('encodes the selected objective label (not the value) in the message', async () => {
    const user = userEvent.setup()
    render(<ContactForm whatsapp={GYM_WHATSAPP} />)

    await user.type(screen.getByPlaceholderText('¿Cómo te llamás?'), 'Test')
    await user.type(screen.getByPlaceholderText('+595 XXX XXX XXX'), '+595 981 000 333')
    await user.selectOptions(screen.getByRole('combobox'), 'plan-integral')

    await user.click(screen.getByRole('button', { name: /enviar por whatsapp/i }))

    const url = vi.mocked(window.open).mock.calls[0][0] as string
    const decoded = decodeURIComponent(url.split('?text=')[1])

    expect(decoded).toContain('Plan integral (todo)')
    expect(decoded).not.toContain('plan-integral')
  })

  it('includes the optional message when provided', async () => {
    const user = userEvent.setup()
    render(<ContactForm whatsapp={GYM_WHATSAPP} />)

    await user.type(screen.getByPlaceholderText('¿Cómo te llamás?'), 'Ana')
    await user.type(screen.getByPlaceholderText('+595 XXX XXX XXX'), '+595 981 000 444')
    await user.selectOptions(screen.getByRole('combobox'), 'nutricion')
    await user.type(screen.getByPlaceholderText(/alguna lesión/i), 'Tengo una lesión en la rodilla')

    await user.click(screen.getByRole('button', { name: /enviar por whatsapp/i }))

    const url = vi.mocked(window.open).mock.calls[0][0] as string
    const decoded = decodeURIComponent(url.split('?text=')[1])

    expect(decoded).toContain('Tengo una lesión en la rodilla')
  })

  it('includes the user WhatsApp number in the message', async () => {
    const user = userEvent.setup()
    render(<ContactForm whatsapp={GYM_WHATSAPP} />)

    await user.type(screen.getByPlaceholderText('¿Cómo te llamás?'), 'Pedro')
    await user.type(screen.getByPlaceholderText('+595 XXX XXX XXX'), '+595 981 777 888')
    await user.selectOptions(screen.getByRole('combobox'), 'mejorar-condicion')

    await user.click(screen.getByRole('button', { name: /enviar por whatsapp/i }))

    const url = vi.mocked(window.open).mock.calls[0][0] as string
    const decoded = decodeURIComponent(url.split('?text=')[1])

    expect(decoded).toContain('+595 981 777 888')
  })

  it('strips non-digits from the gym whatsapp number in the URL', async () => {
    const user = userEvent.setup()
    render(<ContactForm whatsapp="+1 (800) 555-1234" />)

    await user.type(screen.getByPlaceholderText('¿Cómo te llamás?'), 'Test')
    await user.type(screen.getByPlaceholderText('+595 XXX XXX XXX'), '+595 981 000 999')
    await user.selectOptions(screen.getByRole('combobox'), 'ganar-musculo')

    await user.click(screen.getByRole('button', { name: /enviar por whatsapp/i }))

    const url = vi.mocked(window.open).mock.calls[0][0] as string
    expect(url).toMatch(/^https:\/\/wa\.me\/18005551234/)
  })

  it('does not call window.open when form is submitted without required fields', async () => {
    const user = userEvent.setup()
    render(<ContactForm whatsapp={GYM_WHATSAPP} />)

    await user.click(screen.getByRole('button', { name: /enviar por whatsapp/i }))

    expect(window.open).not.toHaveBeenCalled()
  })
})
