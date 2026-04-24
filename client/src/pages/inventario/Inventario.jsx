import { useMemo, useState } from 'react'
import InventarioBarraAcciones from '../../components/layout/inventario/InventarioBarraAcciones/InventarioBarraAcciones'
import InventarioMovimientoModal from '../../components/layout/inventario/InventarioMovimientoModal/InventarioMovimientoModal'
import InventarioNuevoProductoModal from '../../components/layout/inventario/InventarioNuevoProductoModal/InventarioNuevoProductoModal'
import InventarioTabla from '../../components/layout/inventario/InventarioTabla/InventarioTabla'
import { useInventario } from '../../hooks/useInventario'
import {
  buildCategoriaFilterOptions,
  filterInventarioTableRows,
  mapInventarioApiRowToTableRow,
} from './inventarioUi'
import '../styles/Inventario.css'

const ITEMS_POR_PAGINA = 5

function getCantidadNumero(valor) {
  if (typeof valor === 'number') return valor
  const match = String(valor ?? '').match(/\d+(\.\d+)?/)
  return match ? Number(match[0]) : 0
}

export default function Inventario() {
  const { items, loading, error, fetchInventario } = useInventario()
  const [consulta, setConsulta] = useState('')
  const [categoria, setCategoria] = useState('')
  const [ordenCantidad, setOrdenCantidad] = useState('')
  const [pagina, setPagina] = useState(1)
  const [modalNuevoProducto, setModalNuevoProducto] = useState(false)
  const [modalMovimiento, setModalMovimiento] = useState(false)

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

  const filtradosYOrdenados = useMemo(() => {
    const resultado = [...filtrados]

    if (ordenCantidad === 'asc') {
      resultado.sort(
        (a, b) => getCantidadNumero(a.cantidad) - getCantidadNumero(b.cantidad)
      )
    }

    if (ordenCantidad === 'desc') {
      resultado.sort(
        (a, b) => getCantidadNumero(b.cantidad) - getCantidadNumero(a.cantidad)
      )
    }

    return resultado
  }, [filtrados, ordenCantidad])

  const total = filtradosYOrdenados.length
  const totalPaginas = Math.max(1, Math.ceil(total / ITEMS_POR_PAGINA))

  const paginaSegura = Math.min(pagina, totalPaginas)
  const filasPagina = useMemo(() => {
    const start = (paginaSegura - 1) * ITEMS_POR_PAGINA
    return filtradosYOrdenados.slice(start, start + ITEMS_POR_PAGINA)
  }, [filtradosYOrdenados, paginaSegura])

  const handleBusqueda = (valor) => {
    setConsulta(valor)
    setPagina(1)
  }

  const handleCategoria = (valor) => {
    setCategoria(valor)
    setPagina(1)
  }

  const handleOrdenCantidad = (valor) => {
    setOrdenCantidad(valor)
    setPagina(1)
  }

  const handleCambiarPagina = (nueva) => {
    setPagina(Math.min(Math.max(1, nueva), totalPaginas))
  }

  const handleTrasGuardar = () => {
    void fetchInventario()
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
          ordenCantidad={ordenCantidad}
          onOrdenCantidadChange={handleOrdenCantidad}
          onNuevoProducto={() => setModalNuevoProducto(true)}
          onRegistrarMovimiento={() => setModalMovimiento(true)}
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

      <InventarioNuevoProductoModal
        open={modalNuevoProducto}
        onClose={() => setModalNuevoProducto(false)}
        onExito={handleTrasGuardar}
      />

      <InventarioMovimientoModal
        open={modalMovimiento}
        onClose={() => setModalMovimiento(false)}
        onExito={handleTrasGuardar}
        items={items}
        loading={loading}
        loadError={error}
      />
    </div>
  )
}