import 'dotenv/config'
import { PrismaClient, DiaSemana } from '@prisma/client'
import bcrypt from 'bcryptjs'
import config from '../gym.config'

const prisma = new PrismaClient()

const PASS = 'test1234'

// ── Seed Types ────────────────────────────────────────────────────────────────

interface EjercicioSeed {
  nombre: string
  series?: number
  repsMin?: number
  repsMax?: number
  pesoKg?: number
  descansoSeg?: number
  duracionMin?: number
  notas?: string
}

interface DiaSeed {
  dia: DiaSemana
  nombre: string
  tipo: string
  ejercicios: EjercicioSeed[]
}

interface RutinaSeed {
  nombre: string
  descripcion: string
  dias: DiaSeed[]
}

interface ProgresoSeed {
  diasAtras: number
  pesoKg: number
  grasaCorporal: number
  masaMuscularKg: number
  cinturaCm?: number
  caderaCm?: number
  pechoCm?: number
  brazoCm?: number
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

// ── Data ─────────────────────────────────────────────────────────────────────

const RUTINA_CARLOS = {
  nombre: 'Push Pull Legs — Hipertrofia',
  descripcion: 'Rutina de 6 días enfocada en hipertrofia muscular con progresión lineal.',
  dias: [
    {
      dia: 'LUNES' as DiaSemana,
      nombre: 'Push A',
      tipo: 'Fuerza',
      ejercicios: [
        { nombre: 'Press banca plano', series: 4, repsMin: 8, repsMax: 10, pesoKg: 60, descansoSeg: 120, notas: 'Controlar excéntrica 3s' },
        { nombre: 'Press inclinado mancuernas', series: 3, repsMin: 10, repsMax: 12, pesoKg: 22, descansoSeg: 90 },
        { nombre: 'Aperturas en polea', series: 3, repsMin: 12, repsMax: 15, descansoSeg: 60 },
        { nombre: 'Press militar con barra', series: 4, repsMin: 8, repsMax: 10, pesoKg: 40, descansoSeg: 120 },
        { nombre: 'Elevaciones laterales', series: 4, repsMin: 12, repsMax: 15, pesoKg: 10, descansoSeg: 60 },
        { nombre: 'Tríceps en polea', series: 3, repsMin: 12, repsMax: 15, descansoSeg: 60 },
      ],
    },
    {
      dia: 'MARTES' as DiaSemana,
      nombre: 'Pull A',
      tipo: 'Fuerza',
      ejercicios: [
        { nombre: 'Dominadas lastradas', series: 4, repsMin: 6, repsMax: 8, pesoKg: 10, descansoSeg: 120, notas: 'Si no llegás, hacé asistidas' },
        { nombre: 'Remo con barra', series: 4, repsMin: 8, repsMax: 10, pesoKg: 50, descansoSeg: 90 },
        { nombre: 'Remo en polea baja', series: 3, repsMin: 10, repsMax: 12, descansoSeg: 90 },
        { nombre: 'Face pulls', series: 3, repsMin: 15, repsMax: 20, descansoSeg: 60 },
        { nombre: 'Curl bíceps con barra', series: 3, repsMin: 10, repsMax: 12, pesoKg: 25, descansoSeg: 60 },
        { nombre: 'Curl martillo', series: 3, repsMin: 10, repsMax: 12, pesoKg: 12, descansoSeg: 60 },
      ],
    },
    {
      dia: 'MIERCOLES' as DiaSemana,
      nombre: 'Legs A',
      tipo: 'Fuerza',
      ejercicios: [
        { nombre: 'Sentadilla con barra', series: 4, repsMin: 6, repsMax: 8, pesoKg: 80, descansoSeg: 180, notas: 'Profundidad paralela mínimo' },
        { nombre: 'Prensa inclinada', series: 4, repsMin: 10, repsMax: 12, pesoKg: 120, descansoSeg: 120 },
        { nombre: 'Extensión de cuádriceps', series: 3, repsMin: 12, repsMax: 15, descansoSeg: 60 },
        { nombre: 'Curl femoral acostado', series: 3, repsMin: 10, repsMax: 12, descansoSeg: 60 },
        { nombre: 'Peso muerto rumano', series: 3, repsMin: 10, repsMax: 12, pesoKg: 60, descansoSeg: 90 },
        { nombre: 'Elevación de gemelos', series: 4, repsMin: 15, repsMax: 20, pesoKg: 40, descansoSeg: 60 },
      ],
    },
    {
      dia: 'JUEVES' as DiaSemana,
      nombre: 'Push B',
      tipo: 'Fuerza',
      ejercicios: [
        { nombre: 'Press banca inclinado barra', series: 4, repsMin: 8, repsMax: 10, pesoKg: 50, descansoSeg: 120 },
        { nombre: 'Press plano mancuernas', series: 3, repsMin: 10, repsMax: 12, pesoKg: 24, descansoSeg: 90 },
        { nombre: 'Cruces en polea alta', series: 3, repsMin: 12, repsMax: 15, descansoSeg: 60 },
        { nombre: 'Press Arnold', series: 3, repsMin: 10, repsMax: 12, pesoKg: 16, descansoSeg: 90 },
        { nombre: 'Elevaciones frontales', series: 3, repsMin: 12, repsMax: 15, pesoKg: 8, descansoSeg: 60 },
        { nombre: 'Fondos en paralelas', series: 3, repsMin: 10, repsMax: 12, descansoSeg: 90, notas: 'Agregar peso si hacés más de 12' },
      ],
    },
    {
      dia: 'VIERNES' as DiaSemana,
      nombre: 'Pull B',
      tipo: 'Fuerza',
      ejercicios: [
        { nombre: 'Jalón al pecho agarre ancho', series: 4, repsMin: 8, repsMax: 10, descansoSeg: 90 },
        { nombre: 'Remo con mancuerna', series: 3, repsMin: 10, repsMax: 12, pesoKg: 28, descansoSeg: 90 },
        { nombre: 'Pullover en polea', series: 3, repsMin: 12, repsMax: 15, descansoSeg: 60 },
        { nombre: 'Encogimientos con barra', series: 4, repsMin: 12, repsMax: 15, pesoKg: 50, descansoSeg: 60 },
        { nombre: 'Curl concentrado', series: 3, repsMin: 10, repsMax: 12, pesoKg: 14, descansoSeg: 60 },
        { nombre: 'Curl en predicador', series: 3, repsMin: 10, repsMax: 12, descansoSeg: 60 },
      ],
    },
    {
      dia: 'SABADO' as DiaSemana,
      nombre: 'Legs B',
      tipo: 'Fuerza',
      ejercicios: [
        { nombre: 'Peso muerto convencional', series: 4, repsMin: 5, repsMax: 6, pesoKg: 100, descansoSeg: 180, notas: 'Cinturón obligatorio arriba de 80kg' },
        { nombre: 'Sentadilla búlgara', series: 3, repsMin: 10, repsMax: 12, pesoKg: 16, descansoSeg: 90 },
        { nombre: 'Hip thrust con barra', series: 4, repsMin: 10, repsMax: 12, pesoKg: 70, descansoSeg: 90 },
        { nombre: 'Extensión de cuádriceps unilateral', series: 3, repsMin: 12, repsMax: 15, descansoSeg: 60 },
        { nombre: 'Curl femoral sentado', series: 3, repsMin: 12, repsMax: 15, descansoSeg: 60 },
        { nombre: 'Caminata en puntas de pie', series: 3, repsMin: 20, repsMax: 25, descansoSeg: 45 },
      ],
    },
  ],
}

const RUTINA_MARIA = {
  nombre: 'Full Body — Tonificación',
  descripcion: 'Rutina de 4 días full body enfocada en tonificación y pérdida de grasa.',
  dias: [
    {
      dia: 'LUNES' as DiaSemana,
      nombre: 'Full Body A',
      tipo: 'Mixto',
      ejercicios: [
        { nombre: 'Sentadilla goblet', series: 3, repsMin: 12, repsMax: 15, pesoKg: 16, descansoSeg: 60 },
        { nombre: 'Press banca mancuernas', series: 3, repsMin: 10, repsMax: 12, pesoKg: 10, descansoSeg: 60 },
        { nombre: 'Remo en máquina', series: 3, repsMin: 12, repsMax: 15, descansoSeg: 60 },
        { nombre: 'Zancadas caminando', series: 3, repsMin: 12, repsMax: 12, pesoKg: 10, descansoSeg: 60, notas: '12 por pierna' },
        { nombre: 'Plancha frontal', series: 3, duracionMin: 0.5, descansoSeg: 45, notas: '30 segundos' },
      ],
    },
    {
      dia: 'MIERCOLES' as DiaSemana,
      nombre: 'Full Body B',
      tipo: 'Mixto',
      ejercicios: [
        { nombre: 'Peso muerto rumano', series: 3, repsMin: 10, repsMax: 12, pesoKg: 30, descansoSeg: 90 },
        { nombre: 'Press militar mancuernas', series: 3, repsMin: 10, repsMax: 12, pesoKg: 8, descansoSeg: 60 },
        { nombre: 'Jalón al pecho', series: 3, repsMin: 12, repsMax: 15, descansoSeg: 60 },
        { nombre: 'Step ups', series: 3, repsMin: 10, repsMax: 10, pesoKg: 12, descansoSeg: 60, notas: '10 por pierna' },
        { nombre: 'Crunch en polea', series: 3, repsMin: 15, repsMax: 20, descansoSeg: 45 },
      ],
    },
    {
      dia: 'VIERNES' as DiaSemana,
      nombre: 'Full Body C',
      tipo: 'Funcional',
      ejercicios: [
        { nombre: 'Sentadilla sumo', series: 3, repsMin: 12, repsMax: 15, pesoKg: 20, descansoSeg: 60 },
        { nombre: 'Push ups', series: 3, repsMin: 12, repsMax: 15, descansoSeg: 45 },
        { nombre: 'Remo con banda', series: 3, repsMin: 15, repsMax: 20, descansoSeg: 45 },
        { nombre: 'Puente de glúteos', series: 3, repsMin: 15, repsMax: 20, pesoKg: 20, descansoSeg: 60 },
        { nombre: 'Mountain climbers', series: 3, duracionMin: 0.5, descansoSeg: 30, notas: '30 segundos' },
        { nombre: 'Plancha lateral', series: 3, duracionMin: 0.33, descansoSeg: 30, notas: '20 seg por lado' },
      ],
    },
    {
      dia: 'SABADO' as DiaSemana,
      nombre: 'Cardio + Core',
      tipo: 'Cardio',
      ejercicios: [
        { nombre: 'Cinta — intervalos', duracionMin: 20, notas: '1 min rápido / 1 min lento' },
        { nombre: 'Bicicleta estática', duracionMin: 10, notas: 'Resistencia media-alta' },
        { nombre: 'Crunch bicicleta', series: 3, repsMin: 20, repsMax: 20, descansoSeg: 30 },
        { nombre: 'Elevación de piernas', series: 3, repsMin: 15, repsMax: 15, descansoSeg: 30 },
        { nombre: 'Russian twist', series: 3, repsMin: 20, repsMax: 20, pesoKg: 5, descansoSeg: 30 },
      ],
    },
  ],
}

const RUTINA_LUCAS = {
  nombre: 'Funcional + Cardio',
  descripcion: 'Rutina de 3 días combinando entrenamiento funcional con cardio HIIT.',
  dias: [
    {
      dia: 'MARTES' as DiaSemana,
      nombre: 'Funcional Upper',
      tipo: 'Funcional',
      ejercicios: [
        { nombre: 'Burpees', series: 4, repsMin: 10, repsMax: 10, descansoSeg: 60 },
        { nombre: 'Push ups diamante', series: 3, repsMin: 10, repsMax: 15, descansoSeg: 45 },
        { nombre: 'Remo invertido en TRX', series: 3, repsMin: 12, repsMax: 15, descansoSeg: 45 },
        { nombre: 'Kettlebell swing', series: 4, repsMin: 15, repsMax: 20, pesoKg: 16, descansoSeg: 60 },
        { nombre: 'Plancha con toque de hombro', series: 3, duracionMin: 0.5, descansoSeg: 30 },
      ],
    },
    {
      dia: 'JUEVES' as DiaSemana,
      nombre: 'Funcional Lower',
      tipo: 'Funcional',
      ejercicios: [
        { nombre: 'Box jumps', series: 4, repsMin: 8, repsMax: 10, descansoSeg: 60 },
        { nombre: 'Sentadilla con salto', series: 3, repsMin: 12, repsMax: 15, descansoSeg: 45 },
        { nombre: 'Zancadas con mancuernas', series: 3, repsMin: 10, repsMax: 10, pesoKg: 12, descansoSeg: 60, notas: '10 por pierna' },
        { nombre: 'Wall sit', series: 3, duracionMin: 0.75, descansoSeg: 45, notas: '45 segundos' },
        { nombre: 'Sprint en cinta', series: 5, duracionMin: 0.33, descansoSeg: 30, notas: '20s sprint / 30s descanso' },
      ],
    },
    {
      dia: 'SABADO' as DiaSemana,
      nombre: 'HIIT Total Body',
      tipo: 'Cardio',
      ejercicios: [
        { nombre: 'Thrusters con mancuernas', series: 4, repsMin: 12, repsMax: 15, pesoKg: 10, descansoSeg: 45 },
        { nombre: 'Battle ropes', series: 4, duracionMin: 0.5, descansoSeg: 30, notas: '30 segundos' },
        { nombre: 'Salto a cajón + burpee', series: 3, repsMin: 8, repsMax: 10, descansoSeg: 60 },
        { nombre: 'Remo en ergómetro', duracionMin: 5, notas: '500m lo más rápido posible' },
        { nombre: 'Abs: circuito 3 ejercicios', series: 2, duracionMin: 3, descansoSeg: 60, notas: 'Crunch + plancha + bicicleta — 1 min c/u' },
      ],
    },
  ],
}

const PLAN_CARLOS = {
  nombre: 'Volumen limpio — 2800 kcal',
  objetivo: 'Ganancia muscular con mínima grasa',
  kcalObjetivo: 2800,
  proteinaG: 180,
  carbosG: 350,
  grasaG: 80,
  dias: [
    {
      dia: 'LUNES' as DiaSemana,
      nombre: 'Día de entrenamiento',
      comidas: [
        {
          nombre: 'Desayuno',
          hora: '07:00',
          alimentos: [
            { nombre: 'Avena', cantidad: 80, unidad: 'g', kcal: 300, proteinaG: 10, carbosG: 54, grasaG: 5 },
            { nombre: 'Banana', cantidad: 1, unidad: 'unidad', kcal: 105, proteinaG: 1.3, carbosG: 27, grasaG: 0.4 },
            { nombre: 'Whey protein', cantidad: 30, unidad: 'g', kcal: 120, proteinaG: 24, carbosG: 3, grasaG: 1.5 },
            { nombre: 'Mantequilla de maní', cantidad: 15, unidad: 'g', kcal: 90, proteinaG: 4, carbosG: 3, grasaG: 8 },
          ],
        },
        {
          nombre: 'Almuerzo',
          hora: '12:30',
          alimentos: [
            { nombre: 'Pechuga de pollo', cantidad: 200, unidad: 'g', kcal: 330, proteinaG: 62, carbosG: 0, grasaG: 7 },
            { nombre: 'Arroz integral', cantidad: 150, unidad: 'g', kcal: 170, proteinaG: 4, carbosG: 36, grasaG: 1.5 },
            { nombre: 'Brócoli', cantidad: 150, unidad: 'g', kcal: 50, proteinaG: 4, carbosG: 10, grasaG: 0.5 },
            { nombre: 'Aceite de oliva', cantidad: 10, unidad: 'ml', kcal: 90, proteinaG: 0, carbosG: 0, grasaG: 10 },
          ],
        },
        {
          nombre: 'Pre-entreno',
          hora: '16:00',
          alimentos: [
            { nombre: 'Tostadas integrales', cantidad: 2, unidad: 'rebanadas', kcal: 140, proteinaG: 6, carbosG: 26, grasaG: 2 },
            { nombre: 'Mermelada sin azúcar', cantidad: 20, unidad: 'g', kcal: 30, proteinaG: 0, carbosG: 7, grasaG: 0 },
            { nombre: 'Café negro', cantidad: 200, unidad: 'ml', kcal: 2, proteinaG: 0, carbosG: 0, grasaG: 0 },
          ],
        },
        {
          nombre: 'Post-entreno',
          hora: '18:30',
          alimentos: [
            { nombre: 'Whey protein', cantidad: 30, unidad: 'g', kcal: 120, proteinaG: 24, carbosG: 3, grasaG: 1.5 },
            { nombre: 'Banana', cantidad: 1, unidad: 'unidad', kcal: 105, proteinaG: 1.3, carbosG: 27, grasaG: 0.4 },
          ],
        },
        {
          nombre: 'Cena',
          hora: '21:00',
          alimentos: [
            { nombre: 'Carne magra', cantidad: 180, unidad: 'g', kcal: 280, proteinaG: 40, carbosG: 0, grasaG: 12 },
            { nombre: 'Batata', cantidad: 200, unidad: 'g', kcal: 180, proteinaG: 3, carbosG: 42, grasaG: 0 },
            { nombre: 'Ensalada mixta', cantidad: 1, unidad: 'porción', kcal: 50, proteinaG: 2, carbosG: 8, grasaG: 1 },
            { nombre: 'Aceite de oliva', cantidad: 10, unidad: 'ml', kcal: 90, proteinaG: 0, carbosG: 0, grasaG: 10 },
          ],
        },
      ],
    },
    {
      dia: 'MARTES' as DiaSemana,
      nombre: 'Día de entrenamiento',
      comidas: [
        {
          nombre: 'Desayuno',
          hora: '07:00',
          alimentos: [
            { nombre: 'Huevos revueltos', cantidad: 4, unidad: 'unidades', kcal: 280, proteinaG: 24, carbosG: 2, grasaG: 20 },
            { nombre: 'Pan integral', cantidad: 2, unidad: 'rebanadas', kcal: 140, proteinaG: 6, carbosG: 26, grasaG: 2 },
            { nombre: 'Palta', cantidad: 50, unidad: 'g', kcal: 80, proteinaG: 1, carbosG: 4, grasaG: 7 },
          ],
        },
        {
          nombre: 'Almuerzo',
          hora: '12:30',
          alimentos: [
            { nombre: 'Salmón', cantidad: 180, unidad: 'g', kcal: 370, proteinaG: 36, carbosG: 0, grasaG: 24 },
            { nombre: 'Quinoa', cantidad: 120, unidad: 'g', kcal: 140, proteinaG: 5, carbosG: 25, grasaG: 2.5 },
            { nombre: 'Espárragos', cantidad: 150, unidad: 'g', kcal: 30, proteinaG: 3, carbosG: 5, grasaG: 0 },
          ],
        },
        {
          nombre: 'Merienda',
          hora: '16:00',
          alimentos: [
            { nombre: 'Yogur griego', cantidad: 200, unidad: 'g', kcal: 130, proteinaG: 20, carbosG: 6, grasaG: 3 },
            { nombre: 'Granola', cantidad: 40, unidad: 'g', kcal: 180, proteinaG: 4, carbosG: 30, grasaG: 6 },
            { nombre: 'Arándanos', cantidad: 50, unidad: 'g', kcal: 30, proteinaG: 0.5, carbosG: 7, grasaG: 0 },
          ],
        },
        {
          nombre: 'Cena',
          hora: '20:30',
          alimentos: [
            { nombre: 'Milanesa de pollo al horno', cantidad: 200, unidad: 'g', kcal: 350, proteinaG: 45, carbosG: 20, grasaG: 10 },
            { nombre: 'Puré de papas', cantidad: 200, unidad: 'g', kcal: 180, proteinaG: 4, carbosG: 36, grasaG: 2 },
            { nombre: 'Ensalada de tomate', cantidad: 1, unidad: 'porción', kcal: 40, proteinaG: 1, carbosG: 8, grasaG: 0.5 },
          ],
        },
      ],
    },
  ],
}

const PLAN_MARIA = {
  nombre: 'Déficit controlado — 1800 kcal',
  objetivo: 'Pérdida de grasa manteniendo masa muscular',
  kcalObjetivo: 1800,
  proteinaG: 130,
  carbosG: 180,
  grasaG: 55,
  dias: [
    {
      dia: 'LUNES' as DiaSemana,
      nombre: 'Día de entrenamiento',
      comidas: [
        {
          nombre: 'Desayuno',
          hora: '07:30',
          alimentos: [
            { nombre: 'Claras de huevo', cantidad: 5, unidad: 'unidades', kcal: 85, proteinaG: 18, carbosG: 1, grasaG: 0 },
            { nombre: 'Huevo entero', cantidad: 1, unidad: 'unidad', kcal: 70, proteinaG: 6, carbosG: 0.5, grasaG: 5 },
            { nombre: 'Tostada integral', cantidad: 1, unidad: 'rebanada', kcal: 70, proteinaG: 3, carbosG: 13, grasaG: 1 },
            { nombre: 'Frutillas', cantidad: 100, unidad: 'g', kcal: 33, proteinaG: 0.7, carbosG: 8, grasaG: 0.3 },
          ],
        },
        {
          nombre: 'Almuerzo',
          hora: '12:30',
          alimentos: [
            { nombre: 'Pollo grillado', cantidad: 150, unidad: 'g', kcal: 250, proteinaG: 46, carbosG: 0, grasaG: 5.5 },
            { nombre: 'Arroz yamaní', cantidad: 80, unidad: 'g', kcal: 100, proteinaG: 2.5, carbosG: 22, grasaG: 0.5 },
            { nombre: 'Zucchini grillado', cantidad: 150, unidad: 'g', kcal: 25, proteinaG: 2, carbosG: 4, grasaG: 0.5 },
          ],
        },
        {
          nombre: 'Merienda',
          hora: '16:00',
          alimentos: [
            { nombre: 'Yogur descremado', cantidad: 200, unidad: 'g', kcal: 80, proteinaG: 12, carbosG: 8, grasaG: 0.5 },
            { nombre: 'Almendras', cantidad: 15, unidad: 'g', kcal: 90, proteinaG: 3, carbosG: 3, grasaG: 7.5 },
          ],
        },
        {
          nombre: 'Cena',
          hora: '20:00',
          alimentos: [
            { nombre: 'Merluza al horno', cantidad: 200, unidad: 'g', kcal: 180, proteinaG: 36, carbosG: 0, grasaG: 3 },
            { nombre: 'Ensalada verde grande', cantidad: 1, unidad: 'porción', kcal: 60, proteinaG: 3, carbosG: 10, grasaG: 1 },
            { nombre: 'Aceite de oliva', cantidad: 10, unidad: 'ml', kcal: 90, proteinaG: 0, carbosG: 0, grasaG: 10 },
          ],
        },
      ],
    },
  ],
}

const PROGRESO_CARLOS = [
  { diasAtras: 90, pesoKg: 82, grasaCorporal: 22, masaMuscularKg: 32, cinturaCm: 92, pechoCm: 100, brazoCm: 34 },
  { diasAtras: 75, pesoKg: 81.5, grasaCorporal: 21.5, masaMuscularKg: 32.5, cinturaCm: 91, pechoCm: 100.5, brazoCm: 34.2 },
  { diasAtras: 60, pesoKg: 81, grasaCorporal: 20.8, masaMuscularKg: 33, cinturaCm: 90, pechoCm: 101, brazoCm: 34.5 },
  { diasAtras: 45, pesoKg: 80.5, grasaCorporal: 20, masaMuscularKg: 33.5, cinturaCm: 89, pechoCm: 101.5, brazoCm: 35 },
  { diasAtras: 30, pesoKg: 80, grasaCorporal: 19.2, masaMuscularKg: 34, cinturaCm: 88, pechoCm: 102, brazoCm: 35.3 },
  { diasAtras: 15, pesoKg: 79.5, grasaCorporal: 18.5, masaMuscularKg: 34.5, cinturaCm: 87, pechoCm: 102.5, brazoCm: 35.5 },
  { diasAtras: 0, pesoKg: 79, grasaCorporal: 18, masaMuscularKg: 35, cinturaCm: 86.5, pechoCm: 103, brazoCm: 36 },
]

const PROGRESO_MARIA = [
  { diasAtras: 60, pesoKg: 68, grasaCorporal: 28, masaMuscularKg: 24, cinturaCm: 78, caderaCm: 100 },
  { diasAtras: 45, pesoKg: 67, grasaCorporal: 27, masaMuscularKg: 24.5, cinturaCm: 77, caderaCm: 99 },
  { diasAtras: 30, pesoKg: 66, grasaCorporal: 25.5, masaMuscularKg: 25, cinturaCm: 75.5, caderaCm: 98 },
  { diasAtras: 15, pesoKg: 65.5, grasaCorporal: 25, masaMuscularKg: 25.2, cinturaCm: 75, caderaCm: 97 },
  { diasAtras: 0, pesoKg: 65, grasaCorporal: 24, masaMuscularKg: 25.5, cinturaCm: 74, caderaCm: 96.5 },
]

const PROGRESO_LUCAS = [
  { diasAtras: 30, pesoKg: 75, grasaCorporal: 20, masaMuscularKg: 30 },
  { diasAtras: 15, pesoKg: 74.5, grasaCorporal: 19, masaMuscularKg: 30.5 },
  { diasAtras: 0, pesoKg: 74, grasaCorporal: 18.5, masaMuscularKg: 31 },
]

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding database for:', config.nombre)

  // ── Gym ──────────────────────────────────────────────────────────────────
  const gym = await prisma.gym.upsert({
    where: { slug: config.slug },
    update: {},
    create: {
      slug: config.slug,
      nombre: config.nombre,
      ciudad: config.ciudad,
      pais: config.pais,
      whatsapp: config.whatsapp,
      instagram: config.instagram,
      facebook: config.facebook,
    },
  })
  console.log('✓ Gym:', gym.nombre)

  // ── Users ────────────────────────────────────────────────────────────────
  const passHash = await bcrypt.hash(PASS, 12)

  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (adminEmail && adminPassword) {
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        gymId: gym.id,
        nombre: 'Admin',
        apellido: config.nombre,
        email: adminEmail,
        passwordHash: await bcrypt.hash(adminPassword, 12),
        rol: 'ADMIN_GYM',
      },
    })
    console.log('✓ Admin:', adminEmail)
  }

  const zuny = await prisma.user.upsert({
    where: { email: 'zuny@ddr.com' },
    update: {},
    create: {
      gymId: gym.id,
      nombre: 'Zuny',
      apellido: 'Galeano',
      email: 'zuny@ddr.com',
      passwordHash: passHash,
      rol: 'ENTRENADOR',
      telefono: '+595981234567',
    },
  })
  console.log('✓ Entrenadora:', zuny.email)

  const diego = await prisma.user.upsert({
    where: { email: 'diego@ddr.com' },
    update: {},
    create: {
      gymId: gym.id,
      nombre: 'Diego',
      apellido: 'Da Rosa',
      email: 'diego@ddr.com',
      passwordHash: passHash,
      rol: 'ENTRENADOR',
      telefono: '+595987654321',
    },
  })
  console.log('✓ Entrenador:', diego.email)

  const carlos = await prisma.user.upsert({
    where: { email: 'carlos@test.com' },
    update: {},
    create: {
      gymId: gym.id,
      nombre: 'Carlos',
      apellido: 'González',
      email: 'carlos@test.com',
      passwordHash: passHash,
      rol: 'ALUMNO',
      telefono: '+595971111111',
      fechaNacimiento: new Date('1995-03-15'),
    },
  })
  console.log('✓ Alumno:', carlos.email)

  const maria = await prisma.user.upsert({
    where: { email: 'maria@test.com' },
    update: {},
    create: {
      gymId: gym.id,
      nombre: 'María',
      apellido: 'Fernández',
      email: 'maria@test.com',
      passwordHash: passHash,
      rol: 'ALUMNO',
      telefono: '+595972222222',
      fechaNacimiento: new Date('1998-07-22'),
    },
  })
  console.log('✓ Alumna:', maria.email)

  const lucas = await prisma.user.upsert({
    where: { email: 'lucas@test.com' },
    update: {},
    create: {
      gymId: gym.id,
      nombre: 'Lucas',
      apellido: 'Benítez',
      email: 'lucas@test.com',
      passwordHash: passHash,
      rol: 'ALUMNO',
      fechaNacimiento: new Date('2000-11-08'),
    },
  })
  console.log('✓ Alumno:', lucas.email)

  // Alumno extra sin entrenador (para probar "sin asignar")
  const sofia = await prisma.user.upsert({
    where: { email: 'sofia@test.com' },
    update: {},
    create: {
      gymId: gym.id,
      nombre: 'Sofía',
      apellido: 'Ramírez',
      email: 'sofia@test.com',
      passwordHash: passHash,
      rol: 'ALUMNO',
    },
  })
  console.log('✓ Alumna (sin asignar):', sofia.email)

  // Alumno inactivo (para probar filtros)
  await prisma.user.upsert({
    where: { email: 'pedro@test.com' },
    update: {},
    create: {
      gymId: gym.id,
      nombre: 'Pedro',
      apellido: 'Martínez',
      email: 'pedro@test.com',
      passwordHash: passHash,
      rol: 'ALUMNO',
      activo: false,
    },
  })
  console.log('✓ Alumno (inactivo): pedro@test.com')

  // ── Asignaciones ─────────────────────────────────────────────────────────
  for (const alumno of [carlos, maria, lucas]) {
    await prisma.asignacionAlumno.upsert({
      where: { entrenadorId_alumnoId: { entrenadorId: zuny.id, alumnoId: alumno.id } },
      update: {},
      create: { entrenadorId: zuny.id, alumnoId: alumno.id },
    })
  }
  console.log('✓ Asignaciones: Carlos, María, Lucas → Zuny')

  // ── Rutinas ──────────────────────────────────────────────────────────────
  async function crearRutina(
    alumnoId: string,
    entrenadorId: string,
    data: RutinaSeed,
  ) {
    // Desactivar rutinas anteriores
    await prisma.rutina.updateMany({
      where: { alumnoId, activa: true },
      data: { activa: false },
    })

    return prisma.rutina.create({
      data: {
        alumnoId,
        entrenadorId,
        nombre: data.nombre,
        descripcion: data.descripcion,
        activa: true,
        vigenciaDesde: daysAgo(30),
        dias: {
          create: data.dias.map((d, di) => ({
            dia: d.dia,
            nombre: d.nombre,
            tipo: d.tipo,
            orden: di,
            ejercicios: {
              create: d.ejercicios.map((e, ei) => ({
                nombre: e.nombre,
                orden: ei,
                series: e.series ?? null,
                repsMin: e.repsMin ?? null,
                repsMax: e.repsMax ?? null,
                pesoKg: e.pesoKg ?? null,
                descansoSeg: e.descansoSeg ?? null,
                duracionMin: e.duracionMin ?? null,
                notas: e.notas ?? null,
              })),
            },
          })),
        },
      },
      include: { dias: { include: { ejercicios: true } } },
    })
  }

  const rutinaCarlos = await crearRutina(carlos.id, zuny.id, RUTINA_CARLOS)
  console.log(`✓ Rutina Carlos: ${rutinaCarlos.nombre} (${rutinaCarlos.dias.length} días, ${rutinaCarlos.dias.reduce((a, d) => a + d.ejercicios.length, 0)} ejercicios)`)

  const rutinaMaria = await crearRutina(maria.id, zuny.id, RUTINA_MARIA)
  console.log(`✓ Rutina María: ${rutinaMaria.nombre} (${rutinaMaria.dias.length} días, ${rutinaMaria.dias.reduce((a, d) => a + d.ejercicios.length, 0)} ejercicios)`)

  const rutinaLucas = await crearRutina(lucas.id, zuny.id, RUTINA_LUCAS)
  console.log(`✓ Rutina Lucas: ${rutinaLucas.nombre} (${rutinaLucas.dias.length} días, ${rutinaLucas.dias.reduce((a, d) => a + d.ejercicios.length, 0)} ejercicios)`)

  // ── Ejercicios completados (últimos 14 días) ────────────────────────────
  let completadosCount = 0

  for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
    const fecha = startOfDay(daysAgo(dayOffset))
    const dayOfWeek = fecha.getDay()

    // Carlos entrena L-S (1-6)
    if (dayOfWeek >= 1 && dayOfWeek <= 6) {
      const diaMap: Record<number, DiaSemana> = {
        1: 'LUNES', 2: 'MARTES', 3: 'MIERCOLES', 4: 'JUEVES', 5: 'VIERNES', 6: 'SABADO',
      }
      const dia = rutinaCarlos.dias.find(d => d.dia === diaMap[dayOfWeek])
      if (dia) {
        // Completó ~80% de los ejercicios
        const completar = dia.ejercicios.filter((_, i) => i < Math.ceil(dia.ejercicios.length * 0.8))
        for (const ej of completar) {
          await prisma.ejercicioCompletado.upsert({
            where: { ejercicioId_alumnoId_fecha: { ejercicioId: ej.id, alumnoId: carlos.id, fecha } },
            update: {},
            create: {
              ejercicioId: ej.id,
              alumnoId: carlos.id,
              fecha,
              seriesHechas: ej.series,
              repsHechas: ej.repsMax,
              pesoUsadoKg: ej.pesoKg,
            },
          })
          completadosCount++
        }
      }
    }

    // María entrena L, X, V, S (1, 3, 5, 6)
    if ([1, 3, 5, 6].includes(dayOfWeek)) {
      const diaMap: Record<number, DiaSemana> = {
        1: 'LUNES', 3: 'MIERCOLES', 5: 'VIERNES', 6: 'SABADO',
      }
      const dia = rutinaMaria.dias.find(d => d.dia === diaMap[dayOfWeek])
      if (dia) {
        for (const ej of dia.ejercicios) {
          await prisma.ejercicioCompletado.upsert({
            where: { ejercicioId_alumnoId_fecha: { ejercicioId: ej.id, alumnoId: maria.id, fecha } },
            update: {},
            create: {
              ejercicioId: ej.id,
              alumnoId: maria.id,
              fecha,
              seriesHechas: ej.series,
              repsHechas: ej.repsMax,
            },
          })
          completadosCount++
        }
      }
    }
  }
  console.log(`✓ Ejercicios completados: ${completadosCount} registros (últimos 14 días)`)

  // ── Planes nutricionales ─────────────────────────────────────────────────
  async function crearPlan(
    alumnoId: string,
    entrenadorId: string,
    data: typeof PLAN_CARLOS,
  ) {
    await prisma.planNutricional.updateMany({
      where: { alumnoId, activo: true },
      data: { activo: false },
    })

    return prisma.planNutricional.create({
      data: {
        alumnoId,
        entrenadorId,
        nombre: data.nombre,
        objetivo: data.objetivo,
        activo: true,
        kcalObjetivo: data.kcalObjetivo,
        proteinaG: data.proteinaG,
        carbosG: data.carbosG,
        grasaG: data.grasaG,
        vigenciaDesde: daysAgo(30),
        dias: {
          create: data.dias.map(d => ({
            dia: d.dia,
            nombre: d.nombre,
            comidas: {
              create: d.comidas.map((c, ci) => ({
                nombre: c.nombre,
                hora: c.hora,
                orden: ci,
                alimentos: {
                  create: c.alimentos.map((a, ai) => ({
                    nombre: a.nombre,
                    cantidad: a.cantidad,
                    unidad: a.unidad,
                    kcal: a.kcal,
                    proteinaG: a.proteinaG,
                    carbosG: a.carbosG,
                    grasaG: a.grasaG,
                    orden: ai,
                  })),
                },
              })),
            },
          })),
        },
      },
      include: { dias: { include: { comidas: { include: { alimentos: true } } } } },
    })
  }

  const planCarlos = await crearPlan(carlos.id, zuny.id, PLAN_CARLOS)
  const alimentosCarlos = planCarlos.dias.reduce((a, d) => a + d.comidas.reduce((b, c) => b + c.alimentos.length, 0), 0)
  console.log(`✓ Plan Carlos: ${planCarlos.nombre} (${planCarlos.dias.length} días, ${alimentosCarlos} alimentos)`)

  const planMaria = await crearPlan(maria.id, zuny.id, PLAN_MARIA)
  const alimentosMaria = planMaria.dias.reduce((a, d) => a + d.comidas.reduce((b, c) => b + c.alimentos.length, 0), 0)
  console.log(`✓ Plan María: ${planMaria.nombre} (${planMaria.dias.length} días, ${alimentosMaria} alimentos)`)

  // ── Progreso ─────────────────────────────────────────────────────────────
  async function crearProgreso(alumnoId: string, entries: ProgresoSeed[]) {
    for (const p of entries) {
      const fecha = startOfDay(daysAgo(p.diasAtras))
      await prisma.progreso.create({
        data: {
          alumnoId,
          fecha,
          pesoKg: p.pesoKg,
          grasaCorporal: p.grasaCorporal,
          masaMuscularKg: p.masaMuscularKg,
          cinturaCm: p.cinturaCm ?? null,
          caderaCm: p.caderaCm ?? null,
          pechoCm: p.pechoCm ?? null,
          brazoCm: p.brazoCm ?? null,
        },
      })
    }
  }

  await crearProgreso(carlos.id, PROGRESO_CARLOS)
  console.log(`✓ Progreso Carlos: ${PROGRESO_CARLOS.length} mediciones (últimos 90 días)`)

  await crearProgreso(maria.id, PROGRESO_MARIA)
  console.log(`✓ Progreso María: ${PROGRESO_MARIA.length} mediciones (últimos 60 días)`)

  await crearProgreso(lucas.id, PROGRESO_LUCAS)
  console.log(`✓ Progreso Lucas: ${PROGRESO_LUCAS.length} mediciones (últimos 30 días)`)

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log('\n📊 Seed completado:')
  console.log('   Usuarios: 1 admin + 2 entrenadores + 5 alumnos (1 inactivo, 1 sin asignar)')
  console.log('   Rutinas: 3 activas (PPL 6d, Full Body 4d, Funcional 3d)')
  console.log('   Ejercicios: ~50 ejercicios distintos')
  console.log(`   Completados: ${completadosCount} registros`)
  console.log('   Planes nutricionales: 2 (volumen 2800kcal, déficit 1800kcal)')
  console.log('   Progreso: 15 mediciones corporales')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
