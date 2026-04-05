import { test, expect } from '@playwright/test'
import { login } from './helpers'

const ALUMNO_EMAIL = 'carlos@test.com'
const ENTRENADOR_EMAIL = 'zuny@ddr.com'
const PASSWORD = 'test1234'

test.describe('Navigation guards', () => {
  test('unauthenticated user accessing /alumno is redirected to /login', async ({ page }) => {
    await page.goto('/alumno')

    await page.waitForURL('**/login**')
    expect(page.url()).toContain('/login')
  })

  test('unauthenticated user accessing /admin is redirected to /login', async ({ page }) => {
    await page.goto('/admin')

    await page.waitForURL('**/login**')
    expect(page.url()).toContain('/login')
  })

  test('ALUMNO accessing /admin is redirected to /alumno', async ({ page }) => {
    await login(page, ALUMNO_EMAIL, PASSWORD)
    await page.waitForURL('**/alumno**')

    await page.goto('/admin')

    await page.waitForURL('**/alumno**')
    expect(page.url()).toContain('/alumno')
  })

  test('ALUMNO accessing /entrenador is redirected to /alumno', async ({ page }) => {
    await login(page, ALUMNO_EMAIL, PASSWORD)
    await page.waitForURL('**/alumno**')

    await page.goto('/entrenador')

    await page.waitForURL('**/alumno**')
    expect(page.url()).toContain('/alumno')
  })

  test('ENTRENADOR accessing /admin is redirected to /entrenador', async ({ page }) => {
    await login(page, ENTRENADOR_EMAIL, PASSWORD)
    await page.waitForURL('**/entrenador**')

    await page.goto('/admin')

    await page.waitForURL('**/entrenador**')
    expect(page.url()).toContain('/entrenador')
  })
})
