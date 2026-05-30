import { useMemo, useState, useRef, useId, useEffect } from 'react'
import ServiciosNuevoServicioModal from './Serviciosnuevoserviciomodal'
import ServiciosTabla from '../../components/layout/registroServicios/ServiciosTabla'
import ServiciosDetalleModal from '../../components/layout/registroServicios/Serviciosdetallemodal'
import ServiciosBeneficiario from '../../components/layout/registroServicios/ServiciosBeneficiario'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../../components/ui/SearchBar'
import Dropdown from '../../components/ui/Dropdown'
import { FiSearch } from 'react-icons/fi'
import '../styles/Servicios.css'
import useHistorialServicios from '../../hooks/useHistorialServicios'
import useServicios from '../../hooks/useServicios.js'

export default function Servicios() {
  const { servicios: historial, hasMore, loading, error, loadMore, refetch } = useHistorialServicios()
  const { tipos } = useServicios()

  const sentinelRef        = useRef(null)
  const tabHistorialRef    = useRef(null)
  const tabBeneficiarioRef = useRef(null)

  const [consulta,        setConsulta]        = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('')
  const [modalServicio,   setModalServicio]   = useState(false)
  const [detalleItem,     setDetalleItem]     = useState(null)
  const [vistaActiva,     setVistaActiva]     = useState('historial')

  const navigate = useNavigate()

  const tabsHintId          = useId()
  const tabHistorialId      = useId()
  const tabBeneficiarioId   = useId()
  const panelHistorialId    = useId()
  const panelBeneficiarioId = useId()

  // Categorías desde el hook
  const todasCategorias = useMemo(() => {
    const desdeTipos = [...new Set(tipos.map((t) => t.categoria).filter(Boolean))]
    return desdeTipos.length > 0 ? desdeTipos : [
      'Consultas', 'Estudios', 'Laboratorio', 'Procedimiento',
      'Rehabilitación', 'Terapia', 'Material',
    ]
  }, [tipos])

  // Filtrado local sobre los registros ya cargados
  const filtrados = useMemo(() => {
    const q = consulta.toLowerCase()
    return (historial ?? []).filter((s) => {
      const matchCat   = !categoriaFiltro || s.categoria === categoriaFiltro
      const matchTexto = !q
        || s.nombre.toLowerCase().includes(q)
        || s.categoria.toLowerCase().includes(q)
      return matchCat && matchTexto
    })
  }, [historial, consulta, categoriaFiltro])

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )
    if (sentinelRef.current) observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading, loadMore])

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

      {/* Tabs */}
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
              <p className="section-sub">
                {loading && historial.length === 0
                  ? 'Cargando…'
                  : `${historial.length} servicios registrados`}
              </p>
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
              loading={loading}
              error={error}
              onVerDetalle={setDetalleItem}
              onVerRecibo={(item) => navigate(`/recibos?folio=${item.id}`)}
            />
            {filtrados.length > 0 && (
              <p className="tabla-footer">
                Mostrando {filtrados.length} de {historial.length} servicios
              </p>
            )}
          </div>

          {/* Sentinel — trigger del infinite scroll */}
          <div ref={sentinelRef} style={{ height: '1px' }} />

          {loading && historial.length > 0 && (
            <p style={{ textAlign: 'center', padding: '1rem' }}>Cargando más…</p>
          )}
          {!hasMore && historial.length > 0 && (
            <p style={{ textAlign: 'center', padding: '1rem', color: 'gray' }}>
              Todos los registros cargados.
            </p>
          )}
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

      <ServiciosNuevoServicioModal
        open={modalServicio}
        onClose={() => setModalServicio(false)}
        onExito={refetch}
        serviciosExistentes={historial}
        categorias={todasCategorias}
      />

      <ServiciosDetalleModal
        open={!!detalleItem}
        onClose={() => setDetalleItem(null)}
        servicio={detalleItem}
      />
    </div>
  )
}