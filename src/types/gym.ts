export interface GymColors {
  primary:     string
  primaryDark: string
  background:  string
  surface:     string
  surfaceAlt:  string
  text:        string
  textMuted:   string
}

export interface GymFont {
  name:    string
  weights: number[]
}

export interface GymCoach {
  nombre:         string
  titulo:         string
  especialidades: string[]
  bio:            string[]
  fotoUrl:        string
}

export interface GymStat {
  valor: string
  label: string
}

export interface GymHero {
  eyebrow:   string
  titulo:    string
  subtitulo: string
  stats:     GymStat[]
}

export interface GymServicio {
  nombre:      string
  descripcion: string
  features:    string[]
  destacado:   boolean
  badgeText?:  string
}

export interface GymSeo {
  titulo:      string
  descripcion: string
  ogImage:     string
}

export interface GymConfig {
  nombre:    string
  tagline:   string
  slug:      string
  ciudad:    string
  pais:      string
  whatsapp:  string
  instagram: string
  facebook?: string
  colors:    GymColors
  fonts: {
    heading: GymFont
    body:    GymFont
  }
  coaches:   GymCoach[]
  hero:      GymHero
  servicios: GymServicio[]
  seo:       GymSeo
}
