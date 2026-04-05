import type { MetadataRoute } from 'next'
import config from '../../gym.config'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             config.nombre,
    short_name:       config.slug,
    description:      config.tagline,
    theme_color:      config.colors.primary,
    background_color: config.colors.background,
    display:          'standalone',
    orientation:      'portrait',
    start_url:        '/alumno',
    scope:            '/',
    icons: [
      {
        src:     '/icons/icon-192x192.png',
        sizes:   '192x192',
        type:    'image/png',
      },
      {
        src:     '/icons/icon-512x512.png',
        sizes:   '512x512',
        type:    'image/png',
      },
      {
        src:     '/icons/icon-maskable-512x512.png',
        sizes:   '512x512',
        type:    'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
