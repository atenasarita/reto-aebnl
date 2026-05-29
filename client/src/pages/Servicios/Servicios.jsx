import { useMemo, useState, useRef, useId } from 'react'
import ServiciosNuevoServicioModal from './Serviciosnuevoserviciomodal'
import ServiciosTabla from '../../components/layout/registroServicios/ServiciosTabla'
import ServiciosDetalleModal from '../../components/layout/registroServicios/ServiciosDetalleModal'
import ServiciosBeneficiario from '../../components/layout/registroServicios/ServiciosBeneficiario'
import { useNavigate } from 'react-router-dom'

import SearchBar from '../../components/ui/SearchBar'
import Dropdown from '../../components/ui/Dropdown'
import { FiSearch } from 'react-icons/fi'

import '../styles/Servicios.css'

const HISTORIAL_PLACEHOLDER = [
  { id:145, beneficiario:'María García López',  nombre:'Consulta general',    categoria:'Consultas',     metodoPago:'Efectivo',      montoServicio:350, montoInventario:0,   descuento:0,  cuotaTotal:350, montoPagado:350, yaAporto:1 },
  { id:2,   beneficiario:'Carlos Pérez Ruiz',   nombre:'Hemograma completo',  categoria:'Laboratorio',   metodoPago:'Tarjeta',        montoServicio:220, montoInventario:50,  descuento:20, cuotaTotal:250, montoPagado:250, yaAporto:1 },
  { id:3,   beneficiario:'Ana Martínez',        nombre:'Rayos X tórax',       categoria:'Estudios',      metodoPago:'Transferencia',  montoServicio:480, montoInventario:0,   descuento:0,  cuotaTotal:480, montoPagado:0,   yaAporto:0 },
  { id:4,   beneficiario:'Luis Hernández',      nombre:'Fisioterapia lumbar', categoria:'Rehabilitación',metodoPago:'Efectivo',       montoServicio:600, montoInventario:100, descuento:50, cuotaTotal:650, montoPagado:650, yaAporto:1 },
  { id:5,   beneficiario:'Sofía Torres',        nombre:'Terapia de lenguaje', categoria:'Terapia',       metodoPago:'Efectivo',       montoServicio:500, montoInventario:0,   descuento:0,  cuotaTotal:500, montoPagado:250, yaAporto:0 },
  { id:6,   beneficiario:'Roberto Díaz',        nombre:'Curación de herida',  categoria:'Procedimiento', metodoPago:'Tarjeta',        montoServicio:180, montoInventario:80,  descuento:0,  cuotaTotal:260, montoPagado:260, yaAporto:1 },
  { id:7,   beneficiario:'María Garcia',        nombre:'Rayos X columna',     categoria:'Estudios',      metodoPago:'Transferencia',  montoServicio:520, montoInventario:0,   descuento:50, cuotaTotal:470, montoPagado:470, yaAporto:1 },
  { id:15,  beneficiario:'María Garcia',        nombre:'Consulta general',    categoria:'Consultas',     metodoPago:'Efectivo',       montoServicio:350, montoInventario:0,   descuento:0,  cuotaTotal:350, montoPagado:350, yaAporto:1 },
  { id:12,  beneficiario:'Carlos Garcia',       nombre:'Hemograma completo',  categoria:'Laboratorio',   metodoPago:'Tarjeta',        montoServicio:220, montoInventario:50,  descuento:20, cuotaTotal:250, montoPagado:250, yaAporto:1 },
  { id:13,  beneficiario:'Ana Garcia',          nombre:'Rayos X tórax',       categoria:'Estudios',      metodoPago:'Transferencia',  montoServicio:480, montoInventario:0,   descuento:0,  cuotaTotal:480, montoPagado:0,   yaAporto:0 },
  { id:14,  beneficiario:'Luis Torres',         nombre:'Fisioterapia lumbar', categoria:'Rehabilitación',metodoPago:'Efectivo',       montoServicio:600, montoInventario:100, descuento:50, cuotaTotal:650, montoPagado:650, yaAporto:1 },
  { id:16,  beneficiario:'Roberto Mario',       nombre:'Curación de herida',  categoria:'Procedimiento', metodoPago:'Tarjeta',        montoServicio:180, montoInventario:80,  descuento:0,  cuotaTotal:260, montoPagado:260, yaAporto:1 },
  { id:17,  beneficiario:'María Lopez',         nombre:'Rayos X columna',     categoria:'Estudios',      metodoPago:'Transferencia',  montoServicio:520, montoInventario:0,   descuento:50, cuotaTotal:470, montoPagado:470, yaAporto:1 },
]

export default function Servicios() {
  const [historial]     = useState(HISTORIAL_PLACEHOLDER)
  const [categoriasExtras, setCategoriasExtras] = useState([])
  const [consulta, setConsulta]               = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('')
  const [modalServicio, setModalServicio]     = useState(false)
  const [detalleItem, setDetalleItem]         = useState(null)
  const [vistaActiva, setVistaActiva]         = useState('historial')

  const navigate = useNavigate()

  const tabsHintId       = useId()
  const tabHistorialId   = useId()
  const tabBeneficiarioId = useId()
  const panelHistorialId  = useId()
  const panelBeneficiarioId = useId()
  const tabHistorialRef   = useRef(null)
  const tabBeneficiarioRef = useRef(null)

  const todasCategorias = [
    'Consultas', 'Estudios', 'Laboratorio', 'Procedimiento',
    'Rehabilitación', 'Terapia', 'Material',
    ...(categoriasExtras ?? []),
  ]

  const filtrados = useMemo(() => {
    const q = consulta.toLowerCase()
    return historial.filter((s) => {
      const matchCat   = !categoriaFiltro || s.categoria === categoriaFiltro
      const matchTexto = !q
        || s.nombre.toLowerCase().includes(q)
        || s.categoria.toLowerCase().includes(q)
      return matchCat && matchTexto
    })
  }, [historial, consulta, categoriaFiltro])

  const onTabsKeyDown = (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return
    e.preventDefault()
    if (e.key === 'Home') {
      setVistaActiva('historial')
      tabHistorialRef.current?.focus()
      return
    }
    if (e.key === 'End') {
      setVistaActiva('beneficiario')
      tabBeneficiarioRef.current?.focus()
      return
    }
    const next = vistaActiva === 'historial' ? 'beneficiario' : 'historial'
    setVistaActiva(next)
    if (next === 'historial') tabHistorialRef.current?.focus()
    else tabBeneficiarioRef.current?.focus()
  }

  return (
    <div className="inventario-pagina">

      {/* Header */}
      <header className="servicios-page-header">
        <section className="page-header-text">
          <h1 className="page-header-title description">Servicios otorgados</h1>
          <p className="page-header-subtitle description">
            Registro e historial de servicios brindados.
          </p>
        </section>
        <div className="servicios-acciones">
          <button
            className="inventario-form__btnSec"
            onClick={() => setModalServicio(true)}
          >
            + Nuevo servicio
          </button>
          <button
            className="inventario-form__btnPri"
            onClick={() => navigate('/registro_servicios')}
          >
            + Registrar atención
          </button>
        </div>
      </header>

      <div>
        <p id={tabsHintId} className="sr-only">
          Usa las flechas izquierda y derecha para cambiar entre pestañas.
        </p>
        <div
          className="servicios-tabs"
          role="tablist"
          aria-describedby={tabsHintId}
          onKeyDown={onTabsKeyDown}
        >
          <button
            ref={tabHistorialRef}
            id={tabHistorialId}
            role="tab"
            type="button"
            aria-selected={vistaActiva === 'historial'}
            aria-controls={panelHistorialId}
            tabIndex={vistaActiva === 'historial' ? 0 : -1}
            className={`servicios-tab ${vistaActiva === 'historial' ? 'is-active' : ''}`}
            onClick={() => setVistaActiva('historial')}
          >
            Historial general
          </button>
          <button
            ref={tabBeneficiarioRef}
            id={tabBeneficiarioId}
            role="tab"
            type="button"
            aria-selected={vistaActiva === 'beneficiario'}
            aria-controls={panelBeneficiarioId}
            tabIndex={vistaActiva === 'beneficiario' ? 0 : -1}
            className={`servicios-tab ${vistaActiva === 'beneficiario' ? 'is-active' : ''}`}
            onClick={() => setVistaActiva('beneficiario')}
          >
            Por beneficiario
          </button>
        </div>
      </div>

      {/* Panel: Historial general */}
      {vistaActiva === 'historial' && (
        <section
          id={panelHistorialId}
          className="recibos-section"
          role="tabpanel"
          aria-labelledby={tabHistorialId}
        >
          <div className="section-title-row">
            <div>
              <h2 className="section-title">Historial general</h2>
              <p className="section-sub">{historial.length} servicios registrados</p>
            </div>
            <div className="servicios-barra-acciones">
              <SearchBar
                icon={<FiSearch />}
                placeholder="Buscar por servicio…"
                value={consulta}
                onChange={(val) => setConsulta(val)}
              />
              <Dropdown
                value={categoriaFiltro}
                onChange={(val) => setCategoriaFiltro(val)}
                options={[
                  { label: 'Todas las categorías', value: '' },
                  ...todasCategorias.map((c) => ({ label: c, value: c })),
                ]}
              />
            </div>
          </div>

          <div className="recibos-card">
            <ServiciosTabla
              filas={filtrados}
              onVerDetalle={setDetalleItem}
              onVerRecibo={(item) => navigate(`/recibos?folio=${item.id}`)}
            />
            {filtrados.length > 0 && (
              <p className="tabla-footer">
                Mostrando {filtrados.length} de {historial.length} servicios
              </p>
            )}
          </div>
        </section>
      )}

      {/* Panel: Por beneficiario */}
      {vistaActiva === 'beneficiario' && (
        <section
          id={panelBeneficiarioId}
          className="recibos-section"
          role="tabpanel"
          aria-labelledby={tabBeneficiarioId}
        >
          <div className="section-title-row">
            <div>
              <h2 className="section-title">Por beneficiario</h2>
              <p className="section-sub">Consulta el historial completo de un beneficiario</p>
            </div>
          </div>

          <ServiciosBeneficiario
            historial={historial}
            onVerDetalle={setDetalleItem}
          />
        </section>
      )}

      {/* Modales */}
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