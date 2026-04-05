import { RutinaBuilderView, RutinaInitialData } from '@/components/portal/alumnos/RutinaBuilderView'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { actualizarRutina } from './actions'

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export default async function EditarRutinaPage({
  params,
}: {
  params: Promise<{ alumnoId: string; rutinaId: string }>
}) {
  const { alumnoId, rutinaId } = await params

  const [alumno, rutina] = await Promise.all([
    prisma.user.findUnique({
      where: { id: alumnoId },
      select: { nombre: true, apellido: true },
    }),
    prisma.rutina.findUnique({
      where: { id: rutinaId },
      include: {
        dias: {
          include: { ejercicios: { orderBy: { orden: 'asc' } } },
          orderBy: { orden: 'asc' },
        },
      },
    }),
  ])

  if (!alumno || !rutina || rutina.alumnoId !== alumnoId) {
    notFound()
  }

  const initialData: RutinaInitialData = {
    id: rutina.id,
    nombre: rutina.nombre,
    descripcion: rutina.descripcion ?? '',
    vigenciaDesde: toDateInputValue(rutina.vigenciaDesde),
    vigenciaHasta: rutina.vigenciaHasta ? toDateInputValue(rutina.vigenciaHasta) : '',
    dias: rutina.dias.map((dia) => ({
      dia: dia.dia,
      nombre: dia.nombre ?? '',
      tipo: dia.tipo ?? 'Fuerza',
      ejercicios: dia.ejercicios.map((ej) => ({
        nombre: ej.nombre,
        series: ej.series,
        repsMin: ej.repsMin,
        repsMax: ej.repsMax,
        pesoKg: ej.pesoKg,
        pesoNota: ej.pesoNota ?? '',
        descansoSeg: ej.descansoSeg,
        videoUrl: ej.videoUrl ?? '',
        orden: ej.orden,
      })),
    })),
  }

  return (
    <RutinaBuilderView
      alumnoId={alumnoId}
      alumnoNombre={`${alumno.nombre} ${alumno.apellido}`}
      basePath="/entrenador/alumnos"
      actualizarRutinaAction={actualizarRutina}
      initialData={initialData}
    />
  )
}
