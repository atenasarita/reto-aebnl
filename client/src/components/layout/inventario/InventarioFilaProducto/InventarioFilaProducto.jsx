import styles from './InventarioFilaProducto.module.css'

function InventarioFilaProducto({ categoria, nombre, clave, cantidad, precio, acciones }) {
  return (
    <div className={styles.fila} role="row">
      <span className={styles.celda} data-label="Categoría">
        {categoria}
      </span>
      <span className={styles.celda} data-label="Nombre">
        {nombre}
      </span>
      <span className={styles.celda} data-label="Clave">
        {clave}
      </span>
      <span className={styles.celda} data-label="Cantidad">
        {cantidad}
      </span>
      <span className={styles.celda} data-label="Precio">
        {precio}
      </span>
      <div className={styles.acciones} data-label="Acciones">
        {acciones ?? null}
      </div>
    </div>
  )
}

export default InventarioFilaProducto
