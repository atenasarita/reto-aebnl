import { FiPlus, FiSearch } from 'react-icons/fi'
import SearchBar from '../../../ui/SearchBar'
import Dropdown from '../../../ui/Dropdown'
import styles from './InventarioBarraAcciones.module.css'

function InventarioBarraAcciones({
  onBusqueda,
  categoria,
  opcionesCategoria,
  onCategoriaChange,
  onNuevoProducto,
  onRegistrarMovimiento,
}) {
  return (
    <div className={styles.barra}>
      <SearchBar
        icon={<FiSearch size={20} />}
        className={`search-gestion ${styles.busqueda}`}
        placeholder="Buscar por nombre o clave"
        onSearch={onBusqueda}
        debounceMs={300}
      />
      <Dropdown
        className={`dropdown-gestion ${styles.filtroCategoria}`}
        options={opcionesCategoria}
        value={categoria}
        onChange={onCategoriaChange}
      />
      <button
        type="button"
        className={styles.btnSecundario}
        onClick={onNuevoProducto}
      >
        <FiPlus size={22} aria-hidden />
        <span>Nuevo Producto</span>
      </button>
      <button
        type="button"
        className={styles.btnPrimario}
        onClick={onRegistrarMovimiento}
      >
        <FiPlus size={22} aria-hidden />
        <span>Registrar Movimiento</span>
      </button>
    </div>
  )
}

export default InventarioBarraAcciones
