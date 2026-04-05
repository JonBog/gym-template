import { test, expect } from '@playwright/test'
import { login } from './helpers'

const ALUMNO_EMAIL = 'carlos@test.com'
const ENTRENADOR_EMAIL = 'zuny@ddr.com'
const PASSWORD = 'test1234'

test.describe('Auth flow', () => {
  test('shows login page with form elements', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByPlaceholder('tu@email.com')).toBeVisible()
    await expect(page.getByPlaceholder('••••••••')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Ingresar' })).toBeVisible()
  })

  test('shows error on invalid credentials', async ({ page }) => {
    await login(page, 'no-existe@test.com', 'wrongpassword')

    await expect(page.getByText('Email o contraseña incorrectos')).toBeVisible()
  })

  test('ALUMNO can log in and reaches /alumno', async ({ page }) => {
    await login(page, ALUMNO_EMAIL, PASSWORD)

    await page.waitForURL('**/alumno**')
    expect(page.url()).toContain('/alumno')
  })

  test('ENTRENADOR can log in and reaches /entrenador', async ({ page }) => {
    await login(page, ENTRENADOR_EMAIL, PASSWORD)

    await page.waitForURL('**/entrenador**')
    expect(page.url()).toContain('/entrenador')
  })

  test('logged-in user visiting /login is redirected to their dashboard', async ({ page }) => {
    // Log in as alumno first
    await login(page, ALUMNO_EMAIL, PASSWORD)
    await page.waitForURL('**/alumno**')

    // Attempt to visit /login again
    await page.goto('/login')

    await page.waitForURL('**/alumno**')
    expect(page.url()).toContain('/alumno')
  })
})
