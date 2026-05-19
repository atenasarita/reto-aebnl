import InventarioFilaProducto from '../inventario/InventarioFilaProducto/InventarioFilaProducto'

import Pagination from '../../ui/Pagination'
import styles from '../inventario/InventarioTabla/InventarioTabla.module.css'

const COLUMNAS = [
  { id: 'categoria', etiqueta: 'CATEGORÍA' },
  { id: 'nombre',    etiqueta: 'NOMBRE' },
  { id: 'precio',    etiqueta: 'PRECIO' },
  { id: 'acciones',  etiqueta: 'ACCIONES' }, 
]

export default function ServiciosTabla({
  filas,
  paginaActual,
  totalItems,
  itemsPorPagina,
  onCambiarPagina,
}) {
  return (
    <section className={styles.envoltorio} aria-label="Tabla de servicios">
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
                categoria={item.categoria}
                nombre={item.nombre}
                precio={item.precioFormateado}
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