import type { Metadata, Viewport } from 'next'
import config from '../../gym.config'
import './globals.css'

export const viewport: Viewport = {
  themeColor:   config.colors.primary,
  width:        'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title:       config.seo.titulo,
  description: config.seo.descripcion,
  openGraph: {
    title:       config.seo.titulo,
    description: config.seo.descripcion,
    images:      [config.seo.ogImage],
  },
  icons: {
    apple: '/icons/icon-192x192.png',
  },
  appleWebApp: {
    capable:        true,
    statusBarStyle: 'black-translucent',
    title:          config.nombre,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { colors, fonts } = config

  // Sobreescribimos las variables de shadcn/ui con los colores del gym.
  // --primary y --primary-foreground son los que usan todos los componentes shadcn.
  const gymTheme = `
    :root {
      --primary:            ${colors.primary};
      --primary-dark:       ${colors.primaryDark};
      --primary-glow:       ${colors.primary}40;
      --primary-foreground: #ffffff;
      --ring:               ${colors.primary};
      --gym-bg:             ${colors.background};
      --gym-surface:        ${colors.surface};
      --gym-surface-alt:    ${colors.surfaceAlt};
      --gym-text:           ${colors.text};
      --gym-muted:          ${colors.textMuted};
      --gym-border:         rgba(255,255,255,0.08);
      --font-heading:       '${fonts.heading.name}', sans-serif;
      --font-body:          '${fonts.body.name}', sans-serif;
    }
    html { scroll-behavior: smooth; }
    body { background: ${colors.background}; color: ${colors.text}; }
  `

  const googleFontsUrl = buildGoogleFontsUrl(fonts)

  return (
    <html lang="es" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={googleFontsUrl} rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: gymTheme }} />
      </head>
      <body
        className="min-h-full antialiased"
        style={{ fontFamily: `'${fonts.body.name}', sans-serif` }}
      >
        {children}
      </body>
    </html>
  )
}

function buildGoogleFontsUrl(fonts: typeof config.fonts): string {
  const w = fonts.heading.weights
  // Google Fonts requiere: ital,wght@0,400;0,700;1,400;1,700 (cada combo con prefijo)
  const combos = [
    ...w.map(n => `0,${n}`),
    ...w.map(n => `1,${n}`),
  ].join(';')

  const families = [
    `family=${encodeURIComponent(fonts.heading.name)}:ital,wght@${combos}`,
    `family=${encodeURIComponent(fonts.body.name)}:wght@${fonts.body.weights.join(';')}`,
  ]
  return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`
}
