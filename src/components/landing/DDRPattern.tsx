/**
 * Patrón de fondo con "DDR" repetido en diagonal, tenue.
 *
 * - Sin rotación dentro del SVG (evita clipping)
 * - 2 instancias por tile en posiciones escalonadas → menos cuadriculado
 * - El contenedor rotado cubre toda la sección
 */
export default function DDRPattern({ opacity = 0.02 }: { opacity?: number }) {
  const fill = `rgba(255,255,255,${opacity})`

  // Tile 260×90 con dos DDR en posiciones irregulares
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="90">
  <text x="30"  y="42"
    font-family="'Barlow Condensed','Arial Narrow',sans-serif"
    font-weight="900" font-size="38" letter-spacing="4" fill="${fill}">DDR</text>
  <text x="155" y="82"
    font-family="'Barlow Condensed','Arial Narrow',sans-serif"
    font-weight="900" font-size="38" letter-spacing="4" fill="${fill}">DDR</text>
</svg>`

  const dataUri = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`

  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none select-none overflow-hidden"
    >
      <div
        style={{
          position: 'absolute',
          inset: '-60%',
          backgroundImage: dataUri,
          backgroundRepeat: 'repeat',
          backgroundSize: '260px 90px',
          transform: 'rotate(-15deg)',
        }}
      />
    </div>
  )
}
