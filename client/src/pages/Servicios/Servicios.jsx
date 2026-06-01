import { useMemo, useState, useRef, useId, useEffect } from 'react'
import ServiciosNuevoServicioModal from './Serviciosnuevoserviciomodal.jsx'
import ServiciosTabla from '../../components/layout/registroServicios/ServiciosTabla'
import ServiciosDetalleModal from '../../components/layout/registroServicios/Serviciosdetallemodal'
import ServiciosBeneficiario from '../../components/layout/registroServicios/ServiciosBeneficiario'
import ServiciosCatalogo from '../../components/layout/registroServicios/ServiciosCatalogo'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../../components/ui/SearchBar'
import Dropdown from '../../components/ui/Dropdown'
import { FiSearch } from 'react-icons/fi'
import '../styles/Servicios.css'
import useHistorialServicios from '../../hooks/useHistorialServicios'
import useServicios from '../../hooks/useServicios.js'

function fmt(num) {
  if (num == null) return null
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(num)
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
  const { servicios: historial, hasMore, loading, error, loadMore, refetch } = useHistorialServicios()
  const { tipos, loading: loadingTipos, refetch: refetchTipos } = useServicios()

  const sentinelRef        = useRef(null)
  const tabHistorialRef    = useRef(null)
  const tabBeneficiarioRef = useRef(null)
  const tabCatalogoRef     = useRef(null)

  const [consulta,        setConsulta]        = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('')
  const [modalServicio,   setModalServicio]   = useState(false)
  const [detalleItem,     setDetalleItem]     = useState(null)
  const [vistaActiva,     setVistaActiva]     = useState('historial')

  const navigate = useNavigate()

  const tabsHintId          = useId()
  const tabHistorialId      = useId()
  const tabBeneficiarioId   = useId()
  const tabCatalogoId       = useId()
  const panelHistorialId    = useId()
  const panelBeneficiarioId = useId()
  const panelCatalogoId     = useId()

  const todasCategorias = useMemo(() => {
    const desdeTipos = [...new Set(tipos.map((t) => t.categoria).filter(Boolean))]
    return desdeTipos.length > 0 ? desdeTipos : [
      'Consultas', 'Estudios', 'Laboratorio', 'Procedimiento',
      'Rehabilitación', 'Terapia', 'Material',
    ]
  }, [tipos])

  const filtrados = useMemo(() => {
    const q = consulta.toLowerCase()
    return (historial ?? [])
      .filter((s) => {
        const matchCat   = !categoriaFiltro || s.categoria === categoriaFiltro
        const matchTexto = !q
          || s.nombre?.toLowerCase().includes(q)
          || s.categoria?.toLowerCase().includes(q)
          || s.beneficiario?.toLowerCase().includes(q)
        return matchCat && matchTexto
      })
      .map(mapFila)
  }, [historial, consulta, categoriaFiltro])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) loadMore()
      },
      { threshold: 0.1 }
    )
    if (sentinelRef.current) observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading, loadMore])

  const TABS    = ['historial', 'beneficiario', 'catalogo']
  const tabRefs = { historial: tabHistorialRef, beneficiario: tabBeneficiarioRef, catalogo: tabCatalogoRef }

  const onTabsKeyDown = (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return
    e.preventDefault()
    const idx = TABS.indexOf(vistaActiva)
    let next
    if (e.key === 'Home')       next = TABS[0]
    else if (e.key === 'End')   next = TABS[TABS.length - 1]
    else if (e.key === 'ArrowRight') next = TABS[(idx + 1) % TABS.length]
    else                        next = TABS[(idx - 1 + TABS.length) % TABS.length]
    setVistaActiva(next)
    tabRefs[next].current?.focus()
  }

  const handleExitoNuevoServicio = () => {
    refetch()       // refresca historial
    refetchTipos()  // refresca catálogo
  }

  return (
    <div className="inventario-pagina">

      <header className="servicios-page-header">
        <section className="page-header-text">
          <h1 className="page-header-title description">Servicios otorgados</h1>
          <p className="page-header-subtitle description">
            Registro e historial de servicios brindados.
          </p>
        </section>
        <div className="servicios-acciones">
          <button className="inventario-form__btnPri" onClick={() => navigate('/registro_servicios')}>
            + Registrar atención
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div>
        <p id={tabsHintId} className="sr-only">
          Usa las flechas izquierda y derecha para cambiar entre pestañas.
        </p>
        <div className="servicios-tabs" role="tablist" aria-describedby={tabsHintId} onKeyDown={onTabsKeyDown}>
          <button
            ref={tabHistorialRef} id={tabHistorialId}
            role="tab" type="button"
            aria-selected={vistaActiva === 'historial'}
            aria-controls={panelHistorialId}
            tabIndex={vistaActiva === 'historial' ? 0 : -1}
            className={`servicios-tab ${vistaActiva === 'historial' ? 'is-active' : ''}`}
            onClick={() => setVistaActiva('historial')}
          >
            Historial general
          </button>
          <button
            ref={tabBeneficiarioRef} id={tabBeneficiarioId}
            role="tab" type="button"
            aria-selected={vistaActiva === 'beneficiario'}
            aria-controls={panelBeneficiarioId}
            tabIndex={vistaActiva === 'beneficiario' ? 0 : -1}
            className={`servicios-tab ${vistaActiva === 'beneficiario' ? 'is-active' : ''}`}
            onClick={() => setVistaActiva('beneficiario')}
          >
            Por beneficiario
          </button>
          <button
            ref={tabCatalogoRef} id={tabCatalogoId}
            role="tab" type="button"
            aria-selected={vistaActiva === 'catalogo'}
            aria-controls={panelCatalogoId}
            tabIndex={vistaActiva === 'catalogo' ? 0 : -1}
            className={`servicios-tab ${vistaActiva === 'catalogo' ? 'is-active' : ''}`}
            onClick={() => setVistaActiva('catalogo')}
          >
            Catálogo
          </button>
        </div>
      </div>

      {/* Panel: Historial general */}
      {vistaActiva === 'historial' && (
        <section id={panelHistorialId} className="recibos-section" role="tabpanel" aria-labelledby={tabHistorialId}>
          <div className="section-title-row">
            <div>
              <h2 className="section-title">Historial general</h2>
              <p className="section-sub">
                {loading && historial.length === 0 ? 'Cargando…' : `${historial.length} servicios registrados`}
              </p>
            </div>
            <div className="servicios-barra-acciones">
              <SearchBar
                icon={<FiSearch />}
                placeholder="Buscar por servicio o beneficiario…"
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
              loading={loading && historial.length === 0}
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

          <div ref={sentinelRef} style={{ height: '1px' }} />
          {loading && historial.length > 0 && (
            <p style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-text-muted)' }}>Cargando más…</p>
          )}
          {!hasMore && historial.length > 0 && (
            <p style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-text-muted)' }}>Todos los registros cargados.</p>
          )}
        </section>
      )}

      {/* Panel: Por beneficiario */}
      {vistaActiva === 'beneficiario' && (
        <section id={panelBeneficiarioId} className="recibos-section" role="tabpanel" aria-labelledby={tabBeneficiarioId}>
          <div className="section-title-row">
            <div>
              <h2 className="section-title">Por beneficiario</h2>
              <p className="section-sub">Consulta el historial completo de un beneficiario</p>
            </div>
          </div>
          <ServiciosBeneficiario
            historial={historial}
            onVerDetalle={(s) => setDetalleItem(mapFila(s))}
          />
        </section>
      )}

      {/* Panel: Catálogo */}
      {vistaActiva === 'catalogo' && (
        <section id={panelCatalogoId} className="recibos-section" role="tabpanel" aria-labelledby={tabCatalogoId}>
          <div className="section-title-row">
            <div>
              <h2 className="section-title">Catálogo de servicios</h2>
              <p className="section-sub">
                {loadingTipos ? 'Cargando…' : `${tipos.length} servicios disponibles`}
              </p>
            </div>
          </div>
          <div className="recibos-card">
            <ServiciosCatalogo
              tipos={tipos}
              loading={loadingTipos}
              onNuevoServicio={() => setModalServicio(true)}
            />
          </div>
        </section>
      )}

      {/* Modales — solo una instancia de cada uno */}
      <ServiciosNuevoServicioModal
        open={modalServicio}
        onClose={() => setModalServicio(false)}
        onExito={handleExitoNuevoServicio}
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