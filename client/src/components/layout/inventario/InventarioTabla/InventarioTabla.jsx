import InventarioAccionesFila from '../InventarioAccionesFila/InventarioAccionesFila'
import InventarioFilaProducto from '../InventarioFilaProducto/InventarioFilaProducto'
import InventarioPaginacion from '../InventarioPaginacion/InventarioPaginacion'
import styles from './InventarioTabla.module.css'

const COLUMNAS = [
  { id: 'categoria', etiqueta: 'CATEGORIA' },
  { id: 'nombre', etiqueta: 'NOMBRE' },
  { id: 'clave', etiqueta: 'CLAVE' },
  { id: 'cantidad', etiqueta: 'CANTIDAD' },
  { id: 'precio', etiqueta: 'PRECIO' },
  { id: 'acciones', etiqueta: 'ACCIONES' },
]

function InventarioTabla({
  filas,
  paginaActual,
  totalItems,
  itemsPorPagina,
  onCambiarPagina,
  onEditarProducto,
  onBorrarProducto,
  accionesDeshabilitadas = false,
}) {
  return (
    <section className={styles.envoltorio} aria-label="Tabla de inventario">
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
          {filas.map((item) => (
            <InventarioFilaProducto
              key={item.id}
              categoria={item.categoria}
              nombre={item.nombre}
              clave={item.clave}
              cantidad={item.cantidad}
              precio={item.precio}
              acciones={
                <InventarioAccionesFila
                  deshabilitado={accionesDeshabilitadas}
                  onEditar={() => onEditarProducto?.(item.id)}
                  onBorrar={() => onBorrarProducto?.(item.id)}
                />
              }
            />
          ))}
        </div>
        <InventarioPaginacion
          paginaActual={paginaActual}
          totalItems={totalItems}
          itemsPorPagina={itemsPorPagina}
          onCambiarPagina={onCambiarPagina}
        />
      </div>
    </section>
  )
}

export default InventarioTabla
