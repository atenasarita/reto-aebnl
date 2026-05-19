import { useMemo, useState } from 'react'
import ServiciosNuevoServicioModal from './ServiciosNuevoServicioModal'
import ServiciosTabla from '../../components/layout/registroServicios/ServiciosTabla'

// Datos placeholder — reemplaza con tu hook/servicio real
const SERVICIOS_PLACEHOLDER = [
  { id: 1, nombre: 'Consulta general',    categoria: 'Consultas',      precio: 350 },
  { id: 2, nombre: 'Hemograma completo',  categoria: 'Laboratorio',    precio: 220 },
  { id: 3, nombre: 'Rayos X tórax',       categoria: 'Estudios',       precio: 480 },
  { id: 4, nombre: 'Fisioterapia lumbar', categoria: 'Rehabilitación', precio: 600 },
  { id: 5, nombre: 'Terapia de lenguaje', categoria: 'Terapia',        precio: 500 },
  { id: 6, nombre: 'Curacion de herida',  categoria: 'Procedimiento',  precio: 180 },
]

const ITEMS_POR_PAGINA = 5

function mapServicioToFila(s) {
  return {
    ...s,
    precioFormateado: `$${Number(s.precio).toFixed(2)}`,
  }
}

export default function Servicios() {
  const [servicios, setServicios] = useState(SERVICIOS_PLACEHOLDER)
  const [categoriasExtras, setCategoriasExtras] = useState([])
  const [consulta, setConsulta] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('')
  const [pagina, setPagina] = useState(1)
  const [modalServicio, setModalServicio] = useState(false)

  const todasCategorias = [
    'Consultas', 'Estudios', 'Laboratorio', 'Procedimiento',
    'Rehabilitación', 'Terapia', 'Material',
    ...categoriasExtras,
  ]

  const filtrados = useMemo(() => {
    const q = consulta.toLowerCase()
    return servicios.filter((s) => {
      const matchCat = !categoriaFiltro || s.categoria === categoriaFiltro
      const matchTexto =
        !q ||
        s.nombre.toLowerCase().includes(q) ||
        s.categoria.toLowerCase().includes(q)
      return matchCat && matchTexto
    })
  }, [servicios, consulta, categoriaFiltro])

  const total = filtrados.length
  const totalPaginas = Math.max(1, Math.ceil(total / ITEMS_POR_PAGINA))
  const paginaSegura = Math.min(pagina, totalPaginas)

  const filasPagina = useMemo(() => {
    const start = (paginaSegura - 1) * ITEMS_POR_PAGINA
    return filtrados.slice(start, start + ITEMS_POR_PAGINA).map(mapServicioToFila)
  }, [filtrados, paginaSegura])

  const handleBusqueda = (e) => { setConsulta(e.target.value); setPagina(1) }
  const handleCategoria = (e) => { setCategoriaFiltro(e.target.value); setPagina(1) }

  const handleNuevaCategoria = (nombre) => {
    setCategoriasExtras((prev) => [...prev, nombre])
  }

  const handleExitoServicio = () => {
    // TODO: void fetchServicios()
  }

  const handleExitoTipo = (nombreCategoria) => {
    handleNuevaCategoria(nombreCategoria)
    // TODO: void fetchCategorias()
  }

  return (
    <div className="inventario-pagina">
      <header className="inventario-encabezado page-header">
        <h1 className="page-header-title inventario-encabezado__titulo">
          Servicios otorgados
        </h1>
        <p className="page-header-subtitle inventario-encabezado__subtitulo">
          Catálogo de servicios médicos registrados.
        </p>
      </header>

      <section
        className="inventario-bloque inventario-bloque--filtros"
        aria-label="Filtros y acciones de servicios"
      >
        <div className="inventario-barra-acciones">
          <input
            type="text"
            className="inventario-barra-acciones__busqueda"
            placeholder="Buscar servicio…"
            value={consulta}
            onChange={handleBusqueda}
          />
          <select
            className="inventario-barra-acciones__select"
            value={categoriaFiltro}
            onChange={handleCategoria}
          >
            <option value="">Todas las categorías</option>
            {todasCategorias.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            className="inventario-form__btnPri"
            onClick={() => setModalServicio(true)}
          >
            + Nuevo servicio
          </button>
          
        </div>
      </section>

      <section
        className="inventario-bloque inventario-bloque--tabla"
        aria-label="Listado de servicios"
      >
        <ServiciosTabla
          filas={filasPagina}
          paginaActual={paginaSegura}
          totalItems={total}
          itemsPorPagina={ITEMS_POR_PAGINA}
          onCambiarPagina={(nueva) =>
            setPagina(Math.min(Math.max(1, nueva), totalPaginas))
          }
        />
      </section>

      <ServiciosNuevoServicioModal
        open={modalServicio}
        onClose={() => setModalServicio(false)}
        onExito={handleExitoServicio}
        serviciosExistentes={servicios}
        categoriasExtras={categoriasExtras}
        onNuevaCategoria={handleNuevaCategoria}
      />

    </div>
  )
}