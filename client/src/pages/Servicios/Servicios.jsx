import { useMemo, useState } from 'react'
import ServiciosNuevoServicioModal from './ServiciosNuevoServicioModal'
import ServiciosTabla from '../../components/layout/registroServicios/ServiciosTabla'
import ServiciosDetalleModal from '../../components/layout/registroServicios/ServiciosDetalleModal'
import ServiciosBeneficiario from '../../components/layout/registroServicios/ServiciosBeneficiario'
import { useNavigate } from 'react-router-dom'

import SearchBar from '../../components/ui/SearchBar'
import Dropdown from '../../components/ui/Dropdown'

import '../styles/Servicios.css'

const HISTORIAL_PLACEHOLDER = [
  { id:145, beneficiario:'María García López',  nombre:'Consulta general',    categoria:'Consultas',     metodoPago:'Efectivo',      montoServicio:350, montoInventario:0,   descuento:0,  cuotaTotal:350, montoPagado:350, yaAporto:1 },
  { id:2, beneficiario:'Carlos Pérez Ruiz',   nombre:'Hemograma completo',  categoria:'Laboratorio',   metodoPago:'Tarjeta',        montoServicio:220, montoInventario:50,  descuento:20, cuotaTotal:250, montoPagado:250, yaAporto:1 },
  { id:3, beneficiario:'Ana Martínez',        nombre:'Rayos X tórax',       categoria:'Estudios',      metodoPago:'Transferencia',  montoServicio:480, montoInventario:0,   descuento:0,  cuotaTotal:480, montoPagado:0,   yaAporto:0 },
  { id:4, beneficiario:'Luis Hernández',      nombre:'Fisioterapia lumbar', categoria:'Rehabilitación',metodoPago:'Efectivo',       montoServicio:600, montoInventario:100, descuento:50, cuotaTotal:650, montoPagado:650, yaAporto:1 },
  { id:5, beneficiario:'Sofía Torres',        nombre:'Terapia de lenguaje', categoria:'Terapia',       metodoPago:'Efectivo',       montoServicio:500, montoInventario:0,   descuento:0,  cuotaTotal:500, montoPagado:250, yaAporto:0 },
  { id:6, beneficiario:'Roberto Díaz',        nombre:'Curación de herida',  categoria:'Procedimiento', metodoPago:'Tarjeta',        montoServicio:180, montoInventario:80,  descuento:0,  cuotaTotal:260, montoPagado:260, yaAporto:1 },
  { id:7, beneficiario:'María García López',  nombre:'Rayos X columna',     categoria:'Estudios',      metodoPago:'Transferencia',  montoServicio:520, montoInventario:0,   descuento:50, cuotaTotal:470, montoPagado:470, yaAporto:1 },
]
 
export default function Servicios() {
  const [historial]       = useState(HISTORIAL_PLACEHOLDER)
  const [categoriasExtras, setCategoriasExtras] = useState([])
  const [consulta, setConsulta]         = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('')
  const [modalServicio, setModalServicio] = useState(false)
  const [detalleItem, setDetalleItem]     = useState(null)
 
  const navigate = useNavigate()
 
  const todasCategorias = [
    'Consultas', 'Estudios', 'Laboratorio', 'Procedimiento',
    'Rehabilitación', 'Terapia', 'Material',
    ...(categoriasExtras ?? []),
  ]
 
  const filtrados = useMemo(() => {
    const q = consulta.toLowerCase()
    return historial.filter((s) => {
      const matchCat    = !categoriaFiltro || s.categoria === categoriaFiltro
      const matchTexto  = !q
        || s.nombre.toLowerCase().includes(q)
        || s.beneficiario.toLowerCase().includes(q)
        || s.categoria.toLowerCase().includes(q)
      return matchCat && matchTexto
    })
  }, [historial, consulta, categoriaFiltro])
 
  return (
    <div className="inventario-pagina">
      <header className="inventario-encabezado page-header">
        <h1 className="page-header-title inventario-encabezado__titulo">Servicios otorgados</h1>
        <p className="page-header-subtitle inventario-encabezado__subtitulo">
          Registro e historial de servicios brindados.
        </p>
      </header>
 
      <section className="inventario-bloque inventario-bloque--filtros" aria-label="Filtros y acciones">
        <div className="inventario-barra-acciones">
          <button className="inventario-form__btnSec" onClick={() => setModalServicio(true)}>
            + Nuevo servicio
          </button>
          <button className="inventario-form__btnPri" onClick={() => navigate('/registro_servicios')}>
            + Registrar atención
          </button>
        </div>
      </section>

      <div className='consultas-filtros-contenedor'>
        <section aria-label="Historial de servicios">
          <div className="servicios-barra-acciones"> 
            <SearchBar
              className="inventario-barra-acciones__busqueda"
              placeholder="Buscar por servicio…"
              value={consulta}
              onChange={(val) => setConsulta(val)}
            />
            <Dropdown
              className="inventario-barra-acciones__select"
              value={categoriaFiltro}
              onChange={(val) => setCategoriaFiltro(val)}
              options={[
                { label: 'Todas las categorías', value: '' },
                ...todasCategorias.map((c) => ({ label: c, value: c })),
              ]}
            />
          </div>
          <ServiciosTabla
            filas={filtrados}
            onVerDetalle={setDetalleItem}
            onVerRecibo={(item) => navigate(`/recibos?folio=${item.id}`)}
          />  
        </section>
      </div>

      <section className="inventario-bloque" aria-label="Historial por beneficiario">
        <ServiciosBeneficiario
          historial={historial}
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