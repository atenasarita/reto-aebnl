import { useMemo, useState } from 'react'
import InventarioBarraAcciones from '../../components/layout/inventario/InventarioBarraAcciones/InventarioBarraAcciones'
import InventarioTabla from '../../components/layout/inventario/InventarioTabla/InventarioTabla'
import {
  MOCK_PRODUCTOS,
  CATEGORIAS_INVENTARIO,
} from '../../components/layout/inventario/mockProductos'
import '../styles/Inventario.css'

const ITEMS_POR_PAGINA = 5

const OPCIONES_CATEGORIA = [
  { label: 'Todas las categorías', value: '' },
  ...CATEGORIAS_INVENTARIO.map((c) => ({ label: c, value: c })),
]

export default function Inventario() {
  const [consulta, setConsulta] = useState('')
  const [categoria, setCategoria] = useState('')
  const [pagina, setPagina] = useState(1)

  const filtrados = useMemo(() => {
    let lista = MOCK_PRODUCTOS
    if (categoria) {
      lista = lista.filter((p) => p.categoria === categoria)
    }
    const q = consulta.trim().toLowerCase()
    if (!q) {
      return lista
    }
    return lista.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.clave.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q)
    )
  }, [consulta, categoria])

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
          opcionesCategoria={OPCIONES_CATEGORIA}
          onCategoriaChange={handleCategoria}
          onNuevoProducto={() => {}}
          onRegistrarMovimiento={() => {}}
        />
        <InventarioTabla
          filas={filasPagina}
          paginaActual={paginaSegura}
          totalItems={total}
          itemsPorPagina={ITEMS_POR_PAGINA}
          onCambiarPagina={handleCambiarPagina}
        />
      </div>
    </div>
  )
}

