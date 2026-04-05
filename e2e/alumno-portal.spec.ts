import { test, expect } from '@playwright/test'
import { login } from './helpers'

const ALUMNO_EMAIL = 'carlos@test.com'
const PASSWORD = 'test1234'

test.describe('Alumno portal', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, ALUMNO_EMAIL, PASSWORD)
    await page.waitForURL('/alumno')
  })

  test('Dashboard loads after login', async ({ page }) => {
    await expect(page).toHaveURL('/alumno')
    // Stat cards always render — check one heading that always appears
    await expect(page.getByText('Rutina de Hoy')).toBeVisible()
  })

  test('Can navigate to Rutinas page', async ({ page }) => {
    await page.getByRole('link', { name: 'Mis Rutinas' }).click()
    await page.waitForURL('/alumno/rutinas')
    await expect(page).toHaveURL('/alumno/rutinas')
  })

  test('Can navigate to Nutricion page', async ({ page }) => {
    await page.getByRole('link', { name: 'Mi Nutricion' }).click()
    await page.waitForURL('/alumno/nutricion')
    await expect(page).toHaveURL('/alumno/nutricion')
  })

  test('Can navigate to Progreso page', async ({ page }) => {
    await page.getByRole('link', { name: 'Mi Progreso' }).click()
    await page.waitForURL('/alumno/progreso')
    await expect(page).toHaveURL('/alumno/progreso')
  })

  test('Can navigate to Perfil page', async ({ page }) => {
    await page.getByRole('link', { name: 'Perfil' }).click()
    await page.waitForURL('/alumno/perfil')
    await expect(page).toHaveURL('/alumno/perfil')
  })
})
