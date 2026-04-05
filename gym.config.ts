import type { GymConfig } from '@/types/gym'

const config: GymConfig = {
  // ── Identidad ─────────────────────────────────────────────────────────────
  nombre:   'DDR Fitness Club',
  tagline:  'Vamos con todo!',
  slug:     'ddr-fitness',
  ciudad:   'Caaguazú',
  pais:     'Paraguay',

  // ── Contacto ──────────────────────────────────────────────────────────────
  whatsapp:  '595XXXXXXXXX',       // reemplazar con número real
  instagram: 'ddrfitnessclub_',
  facebook:  'p/DDR-Fitness-Club-100064599147214',

  // ── Colores ───────────────────────────────────────────────────────────────
  colors: {
    primary:     '#ffaa19',
    primaryDark: '#e09510',
    background:  '#0a0a0a',
    surface:     '#111111',
    surfaceAlt:  '#1a1a1a',
    text:        '#ffffff',
    textMuted:   '#999999',
  },

  // ── Tipografía ────────────────────────────────────────────────────────────
  fonts: {
    heading: {
      name:    'Barlow Condensed',
      weights: [400, 600, 700, 800, 900],
    },
    body: {
      name:    'Barlow',
      weights: [400, 500, 600],
    },
  },

  // ── Coaches ───────────────────────────────────────────────────────────────
  coaches: [
    {
      nombre:         'Diego Da Rosa',
      titulo:         'Fundador & Head Coach',
      especialidades: ['Fuerza & Acondicionamiento', 'Coaching Deportivo'],
      bio: [
        'Fundador de DDR Fitness Club, Diego lleva más de una década formando atletas y transformando vidas a través del entrenamiento de alta intensidad.',
        'Su filosofía es simple: disciplina, constancia y cero excusas. Cada plan tiene un propósito, cada repetición cuenta.',
      ],
      fotoUrl: '/gym/coach-diego.png',
    },
    {
      nombre:         'Zuny Galeano',
      titulo:         'Coach Nutrición & Training',
      especialidades: ['Personal Trainer', 'Nutrición Deportiva'],
      bio: [
        'Con años de experiencia en entrenamiento funcional y nutrición deportiva, Zuny diseña planes 100% adaptados a tus objetivos, tu estilo de vida y tu cuerpo.',
        'En DDR Fitness Club no hay un plan genérico — hay tu plan.',
      ],
      fotoUrl: '/gym/coach-zuny.png',
    },
    {
      nombre:         'Marcos Benítez',
      titulo:         'Coach Funcional',
      especialidades: ['Entrenamiento Funcional', 'Rehabilitación'],
      bio: [
        'Especialista en movimiento funcional y rehabilitación deportiva. Marcos trabaja con alumnos que buscan mejorar su movilidad, prevenir lesiones y rendir al máximo.',
        'Si tu cuerpo se mueve bien, todo lo demás viene solo.',
      ],
      fotoUrl: '/gym/coach-marcos.png',
    },
    {
      nombre:         'Camila Ortiz',
      titulo:         'Coach Fitness',
      especialidades: ['Musculación', 'Pérdida de Grasa'],
      bio: [
        'Camila se especializa en transformación corporal. Planes de musculación y pérdida de grasa basados en evidencia, sin dietas mágicas ni promesas vacías.',
        'Los resultados llegan cuando el proceso es el correcto.',
      ],
      fotoUrl: '/gym/coach-camila.png',
    },
  ],

  // ── Landing — Hero ────────────────────────────────────────────────────────
  hero: {
    eyebrow:   'Caaguazú, Paraguay',
    titulo:    'Tu mejor versión empieza acá.',
    subtitulo: 'Entrenamiento personalizado y nutrición deportiva diseñados para vos.',
    stats: [
      { valor: '100%', label: 'Personalizado' },
      { valor: '+5',   label: 'Años de experiencia' },
      { valor: '2',    label: 'Especialidades' },
    ],
  },

  // ── Landing — Servicios ───────────────────────────────────────────────────
  servicios: [
    {
      nombre:      'Entrenamiento Personalizado',
      descripcion: 'Rutinas diseñadas específicamente para tus metas.',
      features: [
        'Plan de entrenamiento semanal',
        'Seguimiento y ajuste continuo',
        'Técnica y prevención de lesiones',
      ],
      destacado: false,
    },
    {
      nombre:      'Plan Integral',
      descripcion: 'La combinación perfecta: entrenamiento + nutrición.',
      features: [
        'Rutinas personalizadas',
        'Plan nutricional deportivo',
        'Seguimiento semanal',
        'Consultas ilimitadas',
      ],
      destacado: true,
      badgeText: 'Más popular',
    },
    {
      nombre:      'Nutrición Deportiva',
      descripcion: 'Planificación nutricional adaptada a tus objetivos.',
      features: [
        'Plan nutricional personalizado',
        'Educación alimentaria',
        'Ajuste según progreso',
      ],
      destacado: false,
    },
  ],

  // ── SEO / Meta ────────────────────────────────────────────────────────────
  seo: {
    titulo:      'DDR Fitness Club — Vamos con todo!',
    descripcion: 'Entrenamiento personalizado y nutrición deportiva con Zuny Galeano. Caaguazú, Paraguay.',
    ogImage:     '/gym/og-image.jpg',
  },
}

export default config
