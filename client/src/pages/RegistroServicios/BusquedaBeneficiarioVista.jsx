import { useState, useEffect } from "react";
import {
  Search,
  ClipboardList,
  Package,
  Wallet,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
} from "lucide-react";

import "../styles/BusquedaBeneficiarioVista.css";

import { useProductos } from "../../hooks/useProductos";
import useBeneficiarios from "../../hooks/useBeneficiarios"
import useCitasHoy from "../../hooks/useCitasHoy";


import StepBusqueda from "../../components/layout/registroServicios/StepBusqueda";
import StepDetalles from "../../components/layout/registroServicios/StepDetalles";
import StepInsumos from "../../components/layout/registroServicios/StepInsumos";
import StepFinanzas from "../../components/layout/registroServicios/StepFinanzas";

const PASOS = [
  { id: 1, tab: "Búsqueda", Icon: Search },
  { id: 2, tab: "Detalles", Icon: ClipboardList },
  { id: 3, tab: "Insumos", Icon: Package },
  { id: 4, tab: "Finanzas", Icon: Wallet },
];

export default function BusquedaBeneficiarioVista() {
  const [pasoActual, setPasoActual] = useState(1);
  const [query, setQuery] = useState("");


  const [beneficiarioSeleccionado, setBeneficiarioSeleccionado] = useState(null);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  const { data, loading, error, fetchBeneficiarios } = useBeneficiarios()
  const { citas, loading: loadingCitas } = useCitasHoy();

  const [fecha, setFecha] = useState("");
  const [tipoServicio, setTipoServicio] = useState("");
  const [medico, setMedico] = useState("");

  const [insumos, setInsumos] = useState([]);
  const { productos, loading: loadingProductos, error: errorProductos } = useProductos()


  const [metodoPago, setMetodoPago] = useState("");
  const [montoPagado, setMontoPagado] = useState("");
  const [descuento, setDescuento] = useState(0);
  const [guardado, setGuardado] = useState(false);

  const totalPasos = PASOS.length;
  const progresoPct = (pasoActual / totalPasos) * 100;

  const subtotalInsumos = insumos.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  const totalConDescuento = subtotalInsumos - descuento;
  const saldoRestante = totalConDescuento - (parseFloat(montoPagado) || 0);

  useEffect(() => {
    if (query.length >= 2) {
      fetchBeneficiarios(query)
    }
  }, [query])

  const resultados = query.length >= 2
    ? data
        .filter((b) => {
          const nombre = `${b.identificadores?.nombres ?? ''} ${b.identificadores?.apellido_paterno ?? ''}`.toLowerCase()
          const folio = b.folio?.toLowerCase() ?? ''
          const curp = b.identificadores?.curp?.toLowerCase() ?? ''

          const q = query.toLowerCase()

          return (
            nombre.includes(q) ||
            folio.includes(q) ||
            curp.includes(q)
          )
        })
        .map((b) => ({
          folio: b.folio,
          nombre: `${b.identificadores?.nombres ?? ''} ${b.identificadores?.apellido_paterno ?? ''}`.trim(),
          curp: b.identificadores?.curp ?? '',
          membresia: b.estado === 'activo' ? 'Activa' : 'Inactiva',
        }))
  : []

  const citasFormateadas = (citas || []).map((c) => ({
    id: c.id_cita,
    beneficiario: c.nombre_completo,
    hora: c.hora,
    tipo: c.servicio_nombre,
    medico: c.especialista_nombre,
  }));


  const beneficiarioFinal = beneficiarioSeleccionado
  ? resultados.find((b) => b.folio === beneficiarioSeleccionado)
  : citaSeleccionada
  ? citasFormateadas.find((c) => c.id === citaSeleccionada)
  : null;

  const puedeAvanzar = () => {
    if (pasoActual === 1) return !!(beneficiarioSeleccionado || citaSeleccionada);
    if (pasoActual === 2) return !!(fecha && tipoServicio && medico);
    if (pasoActual === 3) return insumos.length > 0;
    if (pasoActual === 4) return !!(metodoPago && montoPagado);
    return true;
  };

  if (guardado) {
    return (
      <div className='page'>
        <div className='inner'>
          <div className='main'>
            <CheckCircle2 size={64} color="#0f766e" />
            <h2>Servicio registrado</h2>
            <button className='btnPrimary' onClick={() => setGuardado(false)}>
              Nuevo servicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='page'>
        <div className='description'>
          <h1 className='title'>Registrar Nuevo Servicio</h1>
          <h2 className='subtitle'>Complete los datos para dar de alta un nuevo servicio medico.</h2>
        </div>
      <div className='inner'>

        {/* Tabs */}
        <nav className='tabsWrap'>
          {PASOS.map((paso) => {
            const activo = pasoActual === paso.id;
            const completado = pasoActual > paso.id;
            const { Icon } = paso;

            return (
              <div
                key={paso.id}
                className={`tab ${activo ? "tabActive" : ""} ${completado ? "tabDone" : ""}`}
              >
                <Icon size={16} />
                <span>{paso.tab}</span>
              </div>
            );
          })}
        </nav>

        <div className='grid'>

          {/* MAIN */}
          <main className='main'>

          {/* MAIN */}

          {pasoActual === 1 && (
            <StepBusqueda
              setQuery={setQuery}
              resultados={resultados}
              loading={loading}
              loadingCitas={loadingCitas}
              beneficiarioSeleccionado={beneficiarioSeleccionado}
              setBeneficiarioSeleccionado={setBeneficiarioSeleccionado}
              citaSeleccionada={citaSeleccionada}
              setCitaSeleccionada={setCitaSeleccionada}
              CITAS_HOY={citasFormateadas}   // 👈 YA NO MOCK
            />
          )}
            
            {pasoActual === 2 && (
              <StepDetalles
                key="step-detalles" 
                fecha={fecha}
                setFecha={setFecha}
                tipoServicio={tipoServicio}
                setTipoServicio={setTipoServicio}
                medico={medico}
                setMedico={setMedico}
              />
            )}  


            {pasoActual === 3 && (
              <StepInsumos
                insumos={insumos}
                setInsumos={setInsumos}
                productos={productos}
                loadingProductos={loadingProductos}
                errorProductos={errorProductos}
              />
            )}

            

            {pasoActual === 4 && (
              <StepFinanzas
                total={subtotalInsumos}
                metodoPago={metodoPago}
                setMetodoPago={setMetodoPago}
                montoPagado={montoPagado}
                setMontoPagado={setMontoPagado}
                descuento={descuento}
                setDescuento={setDescuento}
              />
            )}

            {/* NAV */}
            <div className='navRow'>
              {pasoActual > 1 && (
                <button
                  className='btnSecondary'
                  onClick={() => setPasoActual(pasoActual - 1)}
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
              )}

              <div style={{ flex: 1 }} />

              {pasoActual < totalPasos ? (
                <button
                  className='btnPrimary'
                  style={{
                    opacity: puedeAvanzar() ? 1 : 0.2,
                  }}
                  onClick={() => puedeAvanzar() && setPasoActual(pasoActual + 1)}
                >
                  Continuar <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  className='btnPrimary'
                  onClick={() => setGuardado(true)}
                >
                  Guardar <CheckCircle2 size={16} />
                </button>
              )}
            </div>

          </main>

          {/* ASIDE */}
          <aside className='aside'>
            
            {/* Header */}
            <div className='asideHeader'>
              <div className='asideIconWrap'>
                <ClipboardList size={20} color="#1e3b8a" />
              </div>
              <h3 className='asideTitle'>Resumen del Registro</h3>
            </div>

            {/* Progreso */}
            <div className='procesoBadge'>
              <p className='procesoLabel'>ESTADO DEL PROCESO</p>
              <p className='procesoStep'>Paso {pasoActual} de {totalPasos}</p>
              <div className='track'>
                <div className='fill' style={{ width: `${progresoPct}%` }} />
              </div>
            </div>

            {/* Datos */}
            <dl className='dl'>
              <div className='dlRow'>
                <dt>Beneficiario:</dt>
                <dd>{beneficiarioFinal?.nombre || "—"}</dd>
              </div>
              <div className='dlRow'>
                <dt>Fecha:</dt>
                <dd>{fecha || "—"}</dd>
              </div>
              <div className='dlRow'>
                <dt>Servicio:</dt>
                <dd>{tipoServicio || "—"}</dd>
              </div>
              <div className='dlRow'>
                <dt>Médico:</dt>
                <dd>{medico || "—"}</dd>
              </div>
            </dl>

            {/* Totales */}
            <div className='totales'>
              <div className='totalesRow'>
                <span>Total:</span>
                <strong className='totalesTotal'>${totalConDescuento.toFixed(2)}</strong>
              </div>
              <div className='totalesRow'>
                <span>Saldo Restante:</span>
                <strong className='totalesSaldo' style={{ color: saldoRestante > 0 ? "#dc2626" : "#0f766e" }}>
                  ${saldoRestante.toFixed(2)}
                </strong>
              </div>
              <p className='totalesExtra'>Inventario: ${subtotalInsumos.toFixed(2)}</p>
              <p className='totalesExtra'>Descuento: ${descuento.toFixed(2)}</p>
              <p className='totalesExtra'>Cita: {citaSeleccionada ?? "Sin cita"}</p>
              <p className='totalesExtra'>Método: {metodoPago || "Pendiente"}</p>
              <p className='totalesExtra'>Pagado: ${(parseFloat(montoPagado) || 0).toFixed(2)}</p>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}