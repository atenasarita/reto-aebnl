import PropTypes from 'prop-types'
import { AlertTriangle } from "lucide-react";
import './ServiciosComponents.css'

function fmt(num) {
  if (num == null) return '—'
  return `$${Number(num).toFixed(2)}`
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

Skeleton.propTypes = {
  rows: PropTypes.number,
};

const servicioShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  beneficiario: PropTypes.string,
  nombre: PropTypes.string,
  categoria: PropTypes.string,
  cuotaTotal: PropTypes.number,
  yaAporto: PropTypes.bool,
});

function ServicioRow({ servicio, onVerDetalle, onVerRecibo }) {
  return (
    <tr className="recibo-row">
      <th scope="row" className="td-folio">#{servicio.id}</th>
      <td>{servicio.beneficiario}</td>
      <td>{servicio.nombre}</td>
      <td>{servicio.categoria}</td>
      <td className="text-right td-monto">{fmt(servicio.cuotaTotal)}</td>
      <td className="td-acciones">
        <div className="servicios-acciones-celda">
          <button
            type="button"
            className="btn-ver"
            onClick={() => onVerDetalle?.(servicio)}
            aria-label={`Ver detalle del servicio ${servicio.id}`}
          >
            Ver Detalle
          </button>
          <button
            type="button"
            className="btn-ver--seg"
            onClick={() => onVerRecibo?.(servicio)}
            aria-label={`Ver recibo del servicio ${servicio.id}`}
          >
            Ir a Recibo
          </button>
        </div>
      </td>
    </tr>
  )
}

ServicioRow.propTypes = {
  servicio: servicioShape.isRequired,
  onVerDetalle: PropTypes.func,
  onVerRecibo: PropTypes.func,
};

function ServiciosTabla({
  filas,
  loading,
  error,
  onVerDetalle,
  onVerRecibo,
  mostrarFecha = false,
}) {
  if (loading) return <Skeleton rows={4} />
  if (error)   return <div className="estado-msg estado-error"><AlertTriangle size={14} /> {error}</div>
  if (!filas?.length) return <div className="estado-msg">No hay servicios registrados.</div>

  return (
    <>
      <div className="table-wrap">
        <table className="recibos-table">
          <thead>
            <tr>
              <th>Folio</th>
              <th>Beneficiario</th>
              <th>Servicio</th>
              <th>Categoría</th>
              <th className="text-right" scope="col">
                Total
              </th>
              <th className="th-acciones" scope="col">
                Acciones
              </th>
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

ServiciosTabla.propTypes = {
  filas: PropTypes.arrayOf(servicioShape),
  loading: PropTypes.bool,
  error: PropTypes.string,
  onVerDetalle: PropTypes.func,
  onVerRecibo: PropTypes.func,
  mostrarFecha: PropTypes.bool,
};

export default ServiciosTabla;