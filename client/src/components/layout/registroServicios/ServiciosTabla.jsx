import '../../../pages/styles/Servicios.css'

/* ── Helpers ── */
function fmt(num) {
  if (num == null) return '—'
  return `$${Number(num).toFixed(2)}`
}

function fmtFecha(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function Skeleton({ rows = 4 }) {
  return (
    <div className="skeleton-wrap" role="status" aria-live="polite" aria-label="Cargando servicios">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-row" style={{ animationDelay: `${i * 0.07}s` }} />
      ))}
    </div>
  )
}

function ServicioRow({ servicio, onVerDetalle, onVerRecibo, mostrarFecha }) {
  return (
    <tr className="recibo-row servicios-page">
      <th scope="row" className="td-folio">#{servicio.id}</th>
      <td>{servicio.beneficiario}</td>
      <td>{servicio.nombre}</td>
      <td>{servicio.categoria}</td>
      <td>{fmt(servicio.cuotaTotal)}</td>
     
      <td className="td-acciones">

        <button
          className="btn-ver"
          onClick={() => onVerDetalle?.(servicio)}
          aria-label={`Ver detalle del servicio ${servicio.id}`}
        >
          Ver Detalle
        </button>

        <button
          className="btn-ver--seg"
          onClick={() => onVerRecibo?.(servicio)}
          aria-label={`Ver recibo del servicio ${servicio.id}`}
        >
          Ir a Recibo
        </button>
        
      </td>
    </tr>
  )
}

/* ── ServiciosTabla ── */
export default function ServiciosTabla({
  filas,
  loading,
  error,
  onVerDetalle,
  onVerRecibo,
  mostrarFecha = false,
}) {
  if (loading) return <Skeleton rows={4} />
  if (error)   return <div className="estado-msg estado-error">⚠ {error}</div>
  if (!filas?.length) return <div className="estado-msg">No hay servicios registrados.</div>

  return (
    <>
      <div className="table-wrap">
        <table className="servicios-table">
          <thead>
            <tr>
              <th>Folio</th>
              <th>Beneficiario</th>
              <th>Servicio</th>
              <th>Categoría</th>
              <th className="text-right">Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((s) => (
              <ServicioRow
                key={s.id}
                servicio={s}
                onVerDetalle={onVerDetalle}
                onVerRecibo={onVerRecibo}
                mostrarFecha={mostrarFecha}
              />
            ))}
          </tbody>
        </table>
      </div>

    </>
  )
}