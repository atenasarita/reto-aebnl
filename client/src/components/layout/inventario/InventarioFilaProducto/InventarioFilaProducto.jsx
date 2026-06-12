import PropTypes from 'prop-types'
import styles from './InventarioFilaProducto.module.css'

function InventarioFilaProducto({ categoria, nombre, clave, cantidad, precio, acciones }) {
  return (
    <tr className={styles.fila}>
      <td className={styles.celda} data-label="Categoría">{categoria}</td>
      <td className={styles.celda} data-label="Nombre">{nombre}</td>
      <td className={styles.celda} data-label="Clave">{clave}</td>
      <td className={styles.celda} data-label="Cantidad">{cantidad}</td>
      <td className={styles.celda} data-label="Precio">{precio}</td>
      <td className={styles.acciones} data-label="Acciones">{acciones ?? null}</td>
    </tr>
  )
}

InventarioFilaProducto.propTypes = {
  categoria: PropTypes.string,
  nombre: PropTypes.string,
  clave: PropTypes.string,
  cantidad: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  precio: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  acciones: PropTypes.node,
}

export default InventarioFilaProducto
