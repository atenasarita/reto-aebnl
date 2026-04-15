import { useMemo, useState } from 'react'
import InventarioBarraAcciones from '../../components/layout/inventario/InventarioBarraAcciones/InventarioBarraAcciones'
import InventarioTabla from '../../components/layout/inventario/InventarioTabla/InventarioTabla'
import { useInventario } from '../../hooks/useInventario'
import {
  buildCategoriaFilterOptions,
  filterInventarioTableRows,
  mapInventarioApiRowToTableRow,
} from './inventarioUi'
import '../styles/Inventario.css'

const ITEMS_POR_PAGINA = 5

export default function Inventario() {
  const { items, loading, error } = useInventario()
  const [consulta, setConsulta] = useState('')
  const [categoria, setCategoria] = useState('')
  const [pagina, setPagina] = useState(1)

  const productosUi = useMemo(
    () => items.map(mapInventarioApiRowToTableRow),
    [items]
  )

  const opcionesCategoria = useMemo(
    () => buildCategoriaFilterOptions(productosUi),
    [productosUi]
  )

  const filtrados = useMemo(
    () =>
      filterInventarioTableRows(productosUi, {
        categoriaId: categoria,
        textoBusqueda: consulta,
      }),
    [consulta, categoria, productosUi]
  )

  const total = filtrados.length
  const totalPaginas = Math.max(1, Math.ceil(total / ITEMS_POR_PAGINA))

  const paginaSegura = Math.min(pagina, totalPaginas)
  const filasPagina = useMemo(() => {
    const start = (paginaSegura - 1) * ITEMS_POR_PAGINA
    return filtrados.slice(start, start + ITEMS_POR_PAGINA)
  }, [filtrados, paginaSegura])

  const handleBusqueda = (valor) => {
    setConsulta(valor)
    setPagina(1)
  }

  const handleCategoria = (valor) => {
    setCategoria(valor)
    setPagina(1)
  }

  const handleCambiarPagina = (nueva) => {
    setPagina(Math.min(Math.max(1, nueva), totalPaginas))
  }

  return (
    <div className="inventario-pagina">
      <div className="content-container">
        <header className="inventario-encabezado">
          <h1 className="inventario-encabezado__titulo">Inventario General</h1>
          <p className="inventario-encabezado__subtitulo">
            Gestión de productos e insumos médicos.
          </p>
        </header>
        <InventarioBarraAcciones
          onBusqueda={handleBusqueda}
          categoria={categoria}
          opcionesCategoria={opcionesCategoria}
          onCategoriaChange={handleCategoria}
          onNuevoProducto={() => {}}
          onRegistrarMovimiento={() => {}}
        />
        {loading && (
          <p className="inventario-estado" role="status">
            Cargando inventario…
          </p>
        )}
        {error && !loading && (
          <p className="inventario-estado inventario-estado--error" role="alert">
            {error}
          </p>
        )}
        {!loading && !error && (
          <InventarioTabla
            filas={filasPagina}
            paginaActual={paginaSegura}
            totalItems={total}
            itemsPorPagina={ITEMS_POR_PAGINA}
            onCambiarPagina={handleCambiarPagina}
          />
        )}
      </div>
    </div>
  )
}

