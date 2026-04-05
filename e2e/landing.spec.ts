import { test, expect } from '@playwright/test'

test.describe('Landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('loads with gym name in navbar', async ({ page }) => {
    await expect(page.getByText('DDR FITNESS CLUB').first()).toBeVisible()
  })

  test('Hero section displays title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Tu mejor versión empieza acá' })).toBeVisible()
  })

  test('Servicios section shows 3 service cards', async ({ page }) => {
    await page.locator('#servicios').scrollIntoViewIfNeeded()
    // Each service card is a direct child div of the 3-column grid inside #servicios
    const cards = page.locator('#servicios .grid.md\\:grid-cols-3 > div')
    await expect(cards).toHaveCount(3)
  })

  test('navigation links are visible', async ({ page }) => {
    // Desktop nav links (hidden on mobile, visible on md+)
    await expect(page.getByRole('link', { name: 'Coach', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Servicios', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Rutinas', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Contacto', exact: true }).first()).toBeVisible()
  })

  test('/login page is accessible', async ({ page }) => {
    await page.goto('/login')
    await page.waitForURL('/login')
    await expect(page.getByRole('button', { name: 'Ingresar' })).toBeVisible()
  })
})
