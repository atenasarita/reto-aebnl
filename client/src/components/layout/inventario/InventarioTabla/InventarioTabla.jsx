import PropTypes from 'prop-types'
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
        <table>
          <thead className={styles.cabecera}>
            <tr className={styles.filaCabecera}>
              {COLUMNAS.map((col) => (
                <th key={col.id} scope="col" className={styles.celdaCabecera}>
                  {col.etiqueta}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={styles.cuerpo}>
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
          </tbody>
        </table>
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

InventarioTabla.propTypes = {
  filas: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    categoria: PropTypes.string,
    nombre: PropTypes.string,
    clave: PropTypes.string,
    cantidad: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    precio: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  })).isRequired,
  paginaActual: PropTypes.number.isRequired,
  totalItems: PropTypes.number.isRequired,
  itemsPorPagina: PropTypes.number.isRequired,
  onCambiarPagina: PropTypes.func.isRequired,
  onEditarProducto: PropTypes.func,
  onBorrarProducto: PropTypes.func,
  accionesDeshabilitadas: PropTypes.bool,
}

export default InventarioTabla
