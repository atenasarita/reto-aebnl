import { Pencil, Trash2 } from 'lucide-react'
import styles from './InventarioAccionesFila.module.css'

function InventarioAccionesFila({ onEditar, onBorrar, deshabilitado = false }) {
  return (
    <div className={styles.grupo}>
      <button
        type="button"
        className={styles.btn}
        onClick={onEditar}
        disabled={deshabilitado}
        title="Editar producto"
        aria-label="Editar producto"
      >
        <Pencil size={16} aria-hidden />
      </button>
      <button
        type="button"
        className={`${styles.btn} ${styles.btnBorrar}`}
        onClick={onBorrar}
        disabled={deshabilitado}
        title="Eliminar producto"
        aria-label="Eliminar producto"
      >
        <Trash2 size={16} aria-hidden />
      </button>
    </div>
  )
}

export default InventarioAccionesFila
