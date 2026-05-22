import { useMemo, useState } from 'react'
import ServiciosNuevoServicioModal from './ServiciosNuevoServicioModal'
import ServiciosTabla from '../../components/layout/registroServicios/ServiciosTabla'
import ServiciosDetalleModal from '../../components/layout/registroServicios/Serviciosdetallemodal'

// Placeholder — reemplaza con tu hook/servicio real que consulte SERVICIOS_FINANCIEROS
const HISTORIAL_PLACEHOLDER = [
  {
    id: 1,
    beneficiario:  'María García López',
    nombre:        'Consulta general',
    categoria:     'Consultas',
    metodoPago:    'Efectivo',
    montoServicio: 350,
    montoInventario: 0,
    descuento:     0,
    cuotaTotal:    350,
    montoPagado:   350,
    yaAporto:      1,
  },
  {
    id: 2,
    beneficiario:  'Carlos Pérez Ruiz',
    nombre:        'Hemograma completo',
    categoria:     'Laboratorio',
    metodoPago:    'Tarjeta',
    montoServicio: 220,
    montoInventario: 50,
    descuento:     20,
    cuotaTotal:    250,
    montoPagado:   250,
    yaAporto:      1,
  },
  {
    id: 3,
    beneficiario:  'Ana Martínez',
    nombre:        'Rayos X tórax',
    categoria:     'Estudios',
    metodoPago:    'Transferencia',
    montoServicio: 480,
    montoInventario: 0,
    descuento:     0,
    cuotaTotal:    480,
    montoPagado:   0,
    yaAporto:      0,
  },
  {
    id: 4,
    beneficiario:  'Luis Hernández',
    nombre:        'Fisioterapia lumbar',
    categoria:     'Rehabilitación',
    metodoPago:    'Efectivo',
    montoServicio: 600,
    montoInventario: 100,
    descuento:     50,
    cuotaTotal:    650,
    montoPagado:   650,
    yaAporto:      1,
  },
  {
    id: 5,
    beneficiario:  'Sofía Torres',
    nombre:        'Terapia de lenguaje',
    categoria:     'Terapia',
    metodoPago:    'Efectivo',
    montoServicio: 500,
    montoInventario: 0,
    descuento:     0,
    cuotaTotal:    500,
    montoPagado:   250,
    yaAporto:      0,
  },
  {
    id: 6,
    beneficiario:  'Roberto Díaz',
    nombre:        'Curación de herida',
    categoria:     'Procedimiento',
    metodoPago:    'Tarjeta',
    montoServicio: 180,
    montoInventario: 80,
    descuento:     0,
    cuotaTotal:    260,
    montoPagado:   260,
    yaAporto:      1,
  },
]

const ITEMS_POR_PAGINA = 5

function fmt(num) {
  if (num == null) return null
  return `$${Number(num).toFixed(2)}`
}

function mapFila(s) {
  return {
    ...s,
    montoServicioFormateado:   fmt(s.montoServicio),
    montoInventarioFormateado: fmt(s.montoInventario),
    descuentoFormateado:       fmt(s.descuento),
    cuotaTotalFormateado:      fmt(s.cuotaTotal),
    montoPagadoFormateado:     fmt(s.montoPagado),
  }
}

export default function Servicios() {
  const [historial]             = useState(HISTORIAL_PLACEHOLDER)
  const [categoriasExtras, setCategoriasExtras] = useState([])
  const [consulta, setConsulta] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('')
  const [pagina, setPagina]     = useState(1)
  const [modalServicio, setModalServicio] = useState(false)
  const [detalleItem, setDetalleItem]     = useState(null)

  const todasCategorias = [
    'Consultas', 'Estudios', 'Laboratorio', 'Procedimiento',
    'Rehabilitación', 'Terapia', 'Material',
    ...categoriasExtras,
  ]

  const filtrados = useMemo(() => {
    const q = consulta.toLowerCase()
    return historial.filter((s) => {
      const matchCat = !categoriaFiltro || s.categoria === categoriaFiltro
      const matchTexto =
        !q ||
        s.nombre.toLowerCase().includes(q) ||
        s.beneficiario.toLowerCase().includes(q) ||
        s.categoria.toLowerCase().includes(q)
      return matchCat && matchTexto
    })
  }, [historial, consulta, categoriaFiltro])

  const total        = filtrados.length
  const totalPaginas = Math.max(1, Math.ceil(total / ITEMS_POR_PAGINA))
  const paginaSegura = Math.min(pagina, totalPaginas)

  const filasPagina = useMemo(() => {
    const start = (paginaSegura - 1) * ITEMS_POR_PAGINA
    return filtrados.slice(start, start + ITEMS_POR_PAGINA).map(mapFila)
  }, [filtrados, paginaSegura])

  const handleBusqueda  = (e) => { setConsulta(e.target.value); setPagina(1) }
  const handleCategoria = (e) => { setCategoriaFiltro(e.target.value); setPagina(1) }

  return (
    <div className="inventario-pagina">
      <header className="inventario-encabezado page-header">
        <h1 className="page-header-title inventario-encabezado__titulo">
          Servicios otorgados
        </h1>
        <p className="page-header-subtitle inventario-encabezado__subtitulo">
          Historial de servicios financieros registrados.
        </p>
      </header>

      <section
        className="inventario-bloque inventario-bloque--filtros"
        aria-label="Filtros y acciones"
      >
        <div className="inventario-barra-acciones">
          <input
            type="text"
            className="inventario-barra-acciones__busqueda"
            placeholder="Buscar por beneficiario o servicio…"
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
        aria-label="Historial de servicios"
      >
        <ServiciosTabla
          filas={filasPagina}
          paginaActual={paginaSegura}
          totalItems={total}
          itemsPorPagina={ITEMS_POR_PAGINA}
          onCambiarPagina={(nueva) =>
            setPagina(Math.min(Math.max(1, nueva), totalPaginas))
          }
          onVerDetalle={setDetalleItem}
        />
      </section>

      <ServiciosNuevoServicioModal
        open={modalServicio}
        onClose={() => setModalServicio(false)}
        onExito={() => { /* TODO: void fetchHistorial() */ }}
        serviciosExistentes={historial}
        categoriasExtras={categoriasExtras}
        onNuevaCategoria={(cat) => setCategoriasExtras((p) => [...p, cat])}
      />

      <ServiciosDetalleModal
        open={!!detalleItem}
        onClose={() => setDetalleItem(null)}
        servicio={detalleItem}
      />
    </div>
  )
}