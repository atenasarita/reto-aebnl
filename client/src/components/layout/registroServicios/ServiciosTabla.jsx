import InventarioFilaProducto from '../inventario/InventarioFilaProducto/InventarioFilaProducto'

import Pagination from '../../ui/Pagination'
import styles from '../inventario/InventarioTabla/InventarioTabla.module.css'

const COLUMNAS = [
  { id: 'beneficiario', etiqueta: 'BENEFICIARIO' },
  { id: 'nombre',       etiqueta: 'SERVICIO' },
  { id: 'categoria',    etiqueta: 'CATEGORÍA' },
  { id: 'cuotaTotal',   etiqueta: 'CUOTA TOTAL' },
  { id: 'acciones',     etiqueta: '' },
]

export default function ServiciosTabla({
  filas,
  paginaActual,
  totalItems,
  itemsPorPagina,
  onCambiarPagina,
  onVerDetalle,
}) {
  return (
    <section className={styles.envoltorio} aria-label="Historial de servicios otorgados">
      <div className={styles.marco}>
        <div className={styles.cabecera} role="rowgroup">
          <div className={styles.filaCabecera} role="row">
            {COLUMNAS.map((col) => (
              <div key={col.id} className={styles.celdaCabecera} role="columnheader">
                {col.etiqueta}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.cuerpo} role="rowgroup">
          {filas.length === 0 ? (
            <p className="inventario-estado">No hay servicios que coincidan.</p>
          ) : (
            filas.map((item) => (
              <InventarioFilaProducto
                key={item.id}
                categoria={item.beneficiario}
                nombre={item.nombre}
                clave={item.categoria}
                cantidad={item.cuotaTotalFormateado}
                acciones={
                  <button
                    className="inventario-form__btnSec"
                    onClick={() => onVerDetalle(item)}
                    aria-label={`Ver detalle de ${item.nombre}`}
                  >
                    Ver detalle
                  </button>
                }
              />
            ))
          )}
        </div>

        <Pagination
          currentPage={paginaActual}
          totalItems={totalItems}
          itemsPerPage={itemsPorPagina}
          onPageChange={onCambiarPagina}
        />
      </div>
    </section>
  )
}