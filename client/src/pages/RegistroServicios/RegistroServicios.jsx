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
import useAgendaHoy from "../../hooks/useCitasHoy";
import useServicios from "../../hooks/useServicios";
import useRegistrarServicio from "../../hooks/useRegistrarServicios";

import StepBusqueda from "../../components/layout/registroServicios/StepBusqueda";
import StepDetalles from "../../components/layout/registroServicios/StepDetalles";
import StepInsumos from "../../components/layout/registroServicios/StepInsumos";
import StepFinanzas from "../../components/layout/registroServicios/StepFinanzas.jsx";

const PASOS = [
  { id: 1, tab: "Búsqueda", Icon: Search },
  { id: 2, tab: "Detalles", Icon: ClipboardList },
  { id: 3, tab: "Insumos", Icon: Package },
  { id: 4, tab: "Finanzas", Icon: Wallet },
];

export default function RegistroServicios() {
  const [pasoActual, setPasoActual] = useState(1);
  const [query, setQuery] = useState("");

  const [beneficiarioSeleccionado, setBeneficiarioSeleccionado] = useState(null);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  const { data, loading } = useBeneficiarios();
  const { agendaItems, loading: loadingCitas } = useAgendaHoy();

  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [notas, setNotas] = useState("");
  const [categoriaServicio, setCategoriaServicio] = useState("");
  const [tipoServicio, setTipoServicio] = useState("");
  const [precioServicio, setPrecioServicio] = useState(0);

  const { tipos, loading: loadingServicios } = useServicios();

  const [insumos, setInsumos] = useState([]);
  const { productos, loading: loadingProductos, error: errorProductos } = useProductos();

  const [metodoPago, setMetodoPago] = useState("");
  const [montoPagado, setMontoPagado] = useState("");
  const [descuento, setDescuento] = useState(0);
  const [yaAporto, setYaAporto] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState(null);

  const { registrar, loading: guardando } = useRegistrarServicio();

  const totalPasos = PASOS.length;
  const progresoPct = (pasoActual / totalPasos) * 100;

  // ── Categorías únicas ──────────────────────────────────────
  const categoriasOptions = [
    { label: "Seleccionar categoría", value: "" },
    ...[...new Set((tipos || []).map(t => t.categoria))]
      .filter(Boolean)
      .map(c => ({ label: c, value: c }))
  ];

  // ── Servicios filtrados por categoría ─────────────────────
  const tiposOptions = (tipos || [])
    .filter(t => !categoriaServicio || t.categoria === categoriaServicio)
    .map(t => ({ label: t.nombre, value: t.id, precio: t.precio }));

  useEffect(() => {
    setTipoServicio("");
    setPrecioServicio(0);
  }, [categoriaServicio]);

  // ── Precio del servicio seleccionado ──────────────────────
  useEffect(() => {
    const found = (tipos || []).find(t => String(t.id) === String(tipoServicio));
    setPrecioServicio(found?.precio || 0);
  }, [tipoServicio, tipos]);

  const subtotalInsumos = insumos.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  const totalServicio = precioServicio;
  const totalFinal = totalServicio + subtotalInsumos;
  const totalConDescuento = Math.max(0, totalFinal - (parseFloat(descuento) || 0));
  const saldoRestante = totalConDescuento - (parseFloat(montoPagado) || 0);

  const servicioLabel = tiposOptions.find(
    t => String(t.value) === String(tipoServicio)
  )?.label;

  // ── Resultados de búsqueda ─────────────────────────────────
  const resultados = query.length >= 2
    ? data
        .filter((b) => {
          if (b.estado !== 'activo') return false;
          const nombre = `${b.identificadores?.nombres ?? ''} ${b.identificadores?.apellido_paterno ?? ''}`.toLowerCase();
          const folio = b.folio?.toLowerCase() ?? '';
          const curp = b.identificadores?.CURP?.toLowerCase() ?? '';
          const q = query.toLowerCase();
          return nombre.includes(q) || folio.includes(q) || curp.includes(q);
        })
        .map((b) => ({
          id_beneficiario: b.id_beneficiario,
          folio: b.folio,
          nombre: `${b.identificadores?.nombres ?? ''} ${b.identificadores?.apellido_paterno ?? ''}`.trim(),
          curp: b.identificadores?.CURP ?? '',
          membresia: b.estado === 'activo' ? 'Activa' : 'Inactiva',
        }))
    : [];

  // ── Citas de hoy — incluye id_beneficiario ─────────────────
  const citasFormateadas = (agendaItems || []).map((c) => ({
    id:              c.id_cita,
    id_beneficiario: c.id_beneficiario, // 👈 necesario para el guardado
    nombre:          c.nombre_completo,
    beneficiario:    c.nombre_completo,
    hora:            c.hora,
    tipo:            c.servicio_nombre,
    medico:          c.especialista_nombre,
  }));

  // ── Beneficiario mostrado en el resumen ────────────────────
  const beneficiarioFinal = beneficiarioSeleccionado
    ? resultados.find((b) => b.folio === beneficiarioSeleccionado)
    : citaSeleccionada
    ? citasFormateadas.find((c) => c.id === citaSeleccionada)
    : null;

  // ── Guardar ────────────────────────────────────────────────
  const handleGuardar = async () => {
    setErrorGuardado(null);

    // Resolver id_beneficiario según el origen (búsqueda o cita)
    const id_beneficiario = beneficiarioSeleccionado
      ? resultados.find((b) => b.folio === beneficiarioSeleccionado)?.id_beneficiario
      : citasFormateadas.find((c) => c.id === citaSeleccionada)?.id_beneficiario;

    if (!id_beneficiario) {
      setErrorGuardado('No se pudo identificar al beneficiario. Vuelve al paso 1.');
      return;
    }

    try {
      await registrar({
      id_beneficiario,
      id_catalogo_servicio: tipoServicio,
      fecha,
      hora,
      id_cita: citaSeleccionada ?? null,
      notas,

      id_usuario: 1,

      insumos: insumos.map(i => ({
        id: i.id,
        cantidad: i.cantidad,
        precio: i.precio,
      })),

      monto_servicio: totalServicio,
      monto_inventario: subtotalInsumos,
      descuento: parseFloat(descuento) || 0,
      cuota_total: totalConDescuento,
      monto_pagado: parseFloat(montoPagado) || 0,
      metodo_pago: metodoPago,
      ya_aporto: yaAporto,
    });

      setGuardado(true);

    } catch (err) {
      console.error('Error al guardar:', err);
      setErrorGuardado(err.message || 'Ocurrió un error al guardar el servicio.');
    }
  };

  const puedeAvanzar = () => {
    if (pasoActual === 1) return !!(beneficiarioSeleccionado || citaSeleccionada);
    if (pasoActual === 2) return !!(fecha && hora);
    if (pasoActual === 3) return !!(tipoServicio || insumos.length > 0);
    if (pasoActual === 4) return !!(metodoPago && montoPagado);
    return true;
  };

  // ── Pantalla de éxito ──────────────────────────────────────
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
        <h2 className='subtitle'>Complete los datos para registrar un servicio otorgado.</h2>
      </div>
      <div className='inner'>

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
          <main className='main'>

            {pasoActual === 1 && (
              <StepBusqueda
                setQuery={setQuery}
                query={query}
                resultados={resultados}
                loading={loading}
                loadingCitas={loadingCitas}
                beneficiarioSeleccionado={beneficiarioSeleccionado}
                setBeneficiarioSeleccionado={setBeneficiarioSeleccionado}
                citaSeleccionada={citaSeleccionada}
                setCitaSeleccionada={setCitaSeleccionada}
                CITAS_HOY={citasFormateadas}
              />
            )}

            {pasoActual === 2 && (
              <StepDetalles
                fecha={fecha}
                setFecha={setFecha}
                hora={hora}
                setHora={setHora}
                categoriaServicio={categoriaServicio}
                setCategoriaServicio={setCategoriaServicio}
                tipoServicio={tipoServicio}
                setTipoServicio={setTipoServicio}
                categoriasOptions={categoriasOptions}
                tiposOptions={tiposOptions}
                loadingServicios={loadingServicios}
                notas={notas}
                setNotas={setNotas}
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
                total={totalConDescuento}
                metodoPago={metodoPago}
                setMetodoPago={setMetodoPago}
                montoPagado={montoPagado}
                setMontoPagado={setMontoPagado}
                descuento={descuento}
                setDescuento={setDescuento}
                yaAporto={yaAporto}
                setYaAporto={setYaAporto}
              />
            )}

            {/* Error al guardar */}
            {errorGuardado && (
              <p style={{ color: '#dc2626', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                {errorGuardado}
              </p>
            )}

            <div className='navRow'>
              {pasoActual > 1 && (
                <button className='btnSecondary' onClick={() => setPasoActual(pasoActual - 1)}>
                  <ChevronLeft size={16} /> Anterior
                </button>
              )}
              <div style={{ flex: 1 }} />
              {pasoActual < totalPasos ? (
                <button
                  className='btnPrimary'
                  style={{ opacity: puedeAvanzar() ? 1 : 0.2 }}
                  onClick={() => puedeAvanzar() && setPasoActual(pasoActual + 1)}
                >
                  Continuar <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  className='btnPrimary'
                  onClick={handleGuardar}
                  disabled={guardando || !puedeAvanzar()}
                >
                  {guardando ? 'Guardando...' : 'Guardar'} <CheckCircle2 size={16} />
                </button>
              )}
            </div>

            {pasoActual === 3 && !tipoServicio && insumos.length === 0 && (
              <p className="registro-servicios__hint">
                Debe seleccionar al menos un servicio o un insumo para continuar.
              </p>
            )}

          </main>

          <aside className='aside'>
            <div className='asideHeader'>
              <div className='asideIconWrap'>
                <ClipboardList size={20} color="#1e3b8a" />
              </div>
              <h3 className='asideTitle'>Resumen del Registro</h3>
            </div>

            <div className='procesoBadge'>
              <p className='procesoLabel'>ESTADO DEL PROCESO</p>
              <p className='procesoStep'>Paso {pasoActual} de {totalPasos}</p>
              <div className='track'>
                <div className='fill' style={{ width: `${progresoPct}%` }} />
              </div>
            </div>

            <dl className='dl'>
              <div className='dlRow'>
                <dt>Beneficiario:</dt>
                <dd>{beneficiarioFinal?.nombre || beneficiarioFinal?.beneficiario || "—"}</dd>
              </div>
              <div className='dlRow'>
                <dt>Fecha:</dt>
                <dd>{fecha || "—"}</dd>
              </div>
              <div className='dlRow'>
                <dt>Hora:</dt>
                <dd>{hora || "—"}</dd>
              </div>
              <div className='dlRow'>
                <dt>Categoría:</dt>
                <dd>{categoriaServicio || "—"}</dd>
              </div>
              <div className='dlRow'>
                <dt>Servicio:</dt>
                <dd>{servicioLabel || "—"}</dd>
              </div>
              <div className='dlRow'>
                <dt>Ya Aportó:</dt>
                <dd style={{ color: yaAporto ? '#166534' : '#dc2626', fontWeight: 700 }}>
                  {yaAporto ? 'Sí' : 'No'}
                </dd>
              </div>
            </dl>

            <div className='totales'>
              <div className='totalesRow'>
                <span>Servicio:</span>
                <strong>${totalServicio.toFixed(2)}</strong>
              </div>
              <div className='totalesRow'>
                <span>Insumos:</span>
                <strong>${subtotalInsumos.toFixed(2)}</strong>
              </div>
              <div className='totalesRow'>
                <span>Descuento:</span>
                <strong>- ${(parseFloat(descuento) || 0).toFixed(2)}</strong>
              </div>
              <div className='totalesRow'>
                <span>Total:</span>
                <strong className='totalesTotal'>${totalConDescuento.toFixed(2)}</strong>
              </div>
              <div className='totalesRow'>
                <span>Aportación:</span>
                <strong>${(parseFloat(montoPagado) || 0).toFixed(2)}</strong>
              </div>
              <div className='totalesRow'>
                <span>Saldo:</span>
                <strong
                  className='totalesSaldo'
                  style={{ color: saldoRestante > 0 ? "#dc2626" : "#0f766e" }}
                >
                  ${saldoRestante.toFixed(2)}
                </strong>
              </div>
              <p className='totalesExtra'>Método: {metodoPago || "Pendiente"}</p>
              <p className='totalesExtra'>Cita: {citaSeleccionada ?? "Sin cita"}</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}