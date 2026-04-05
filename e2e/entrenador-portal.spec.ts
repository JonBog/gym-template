import { test, expect } from '@playwright/test'
import { login } from './helpers'

const ENTRENADOR_EMAIL = 'zuny@ddr.com'
const PASSWORD = 'test1234'

test.describe('Entrenador portal', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, ENTRENADOR_EMAIL, PASSWORD)
    await page.waitForURL('/entrenador')
  })

  test('Dashboard loads after login', async ({ page }) => {
    await expect(page).toHaveURL('/entrenador')
    // Stat cards are hardcoded mock data — check one known label
    await expect(page.getByText('Alumnos activos')).toBeVisible()
  })

  test('Can navigate to Alumnos page', async ({ page }) => {
    await page.getByRole('link', { name: 'Mis Alumnos' }).click()
    await page.waitForURL('/entrenador/alumnos')
    await expect(page).toHaveURL('/entrenador/alumnos')
  })

  test('Alumnos page shows student list', async ({ page }) => {
    await page.goto('/entrenador/alumnos')
    await page.waitForURL('/entrenador/alumnos')
    // The seed assigns 3 students to zuny — verify the grid renders at least one card/row
    const alumnoItems = page.locator('[data-testid="alumno-card"], table tbody tr').first()
    // Fallback: check that the page has some student-related content
    await expect(page.locator('body')).not.toBeEmpty()
    // At least one student name should appear (seed: carlos, maria, lucas)
    const hasStudents =
      (await page.getByText('carlos', { exact: false }).count()) > 0 ||
      (await page.getByText('maria', { exact: false }).count()) > 0 ||
      (await page.getByText('lucas', { exact: false }).count()) > 0
    expect(hasStudents).toBe(true)
  })

  test('Can navigate to Nuevo alumno form', async ({ page }) => {
    await page.goto('/entrenador/alumnos')
    await page.waitForURL('/entrenador/alumnos')
    await page.goto('/entrenador/alumnos/nuevo')
    await page.waitForURL('/entrenador/alumnos/nuevo')
    await expect(page).toHaveURL('/entrenador/alumnos/nuevo')
  })

  test('Nuevo alumno form has required fields', async ({ page }) => {
    await page.goto('/entrenador/alumnos/nuevo')
    await page.waitForURL('/entrenador/alumnos/nuevo')

    // Required fields: Nombre, Apellido, Email, Contraseña temporal
    await expect(page.getByPlaceholder('Ej: Carlos')).toBeVisible()
    await expect(page.getByPlaceholder('Ej: González')).toBeVisible()
    await expect(page.getByPlaceholder('alumno@email.com')).toBeVisible()
    await expect(page.getByPlaceholder('Mínimo 6 caracteres')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Registrar Alumno' })).toBeVisible()
  })
})
