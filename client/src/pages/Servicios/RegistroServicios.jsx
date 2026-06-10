import PropTypes from "prop-types";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ClipboardList,
  Package,
  Wallet,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  CloudOff,
} from "lucide-react";

import "../styles/RegistroServicio.css";

import { useProductos } from "../../hooks/useProductos";
import useBeneficiarios from "../../hooks/useBeneficiarios"
import useAgendaHoy from "../../hooks/useCitasHoy";
import useServicios from "../../hooks/useServicios";
import useRegistrarServicio from "../../hooks/useRegistrarServicios";
import useFondoDonaciones from "../../hooks/useFondoDonaciones";

import StepBusqueda from "../../components/layout/servicios/Registro/StepBusqueda.jsx";
import StepDetalles from "../../components/layout/servicios/Registro/StepDetalles.jsx";
import StepInsumos from "../../components/layout/servicios/Registro/StepInsumos.jsx";
import StepFinanzas from "../../components/layout/servicios/Registro/StepFinanzas.jsx";

const getSaldoLabel = (saldo) => {
  if (saldo > 0) return "Saldo pendiente:";
  if (saldo < 0) return "Cambio:";
  return "Saldo:";
};

function PantallaExito({ offline, onNuevo, onHistorial }) {
  return (
    <div className='page'>
      <div className='inner'>
        <div className='main'>
          {offline ? (
            <>
              <CloudOff size={64} color="#d97706" />
              <h2 style={{ margin: '1rem 0 0.5rem', fontSize: '22px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Guardado sin conexión
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '2rem', maxWidth: '360px', textAlign: 'center' }}>
                El registro se guardó localmente y se enviará automáticamente cuando se restablezca la conexión.
              </p>
            </>
          ) : (
            <>
              <CheckCircle2 size={64} color="#1F9D55" />
              <h2 style={{ margin: '1rem 0 0.5rem', fontSize: '22px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Servicio registrado
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '2rem' }}>
                El servicio fue guardado correctamente.
              </p>
            </>
          )}

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className='btnSecondary' type="button" onClick={onNuevo}>
              + Registrar otro servicio
            </button>
            <button className='btnPrimary' type="button" onClick={onHistorial}>
              Ver historial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

PantallaExito.propTypes = {
  offline: PropTypes.bool,
  onNuevo: PropTypes.func.isRequired,
  onHistorial: PropTypes.func.isRequired,
};

const PASOS = [
  { id: 1, tab: "Búsqueda", Icon: Search },
  { id: 2, tab: "Detalles", Icon: ClipboardList },
  { id: 3, tab: "Insumos", Icon: Package },
  { id: 4, tab: "Finanzas", Icon: Wallet },
];

export default function RegistroServicios() {
  const navigate = useNavigate()

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
  const [montoDonacion, setMontoDonacion] = useState("");
  const [fondoSeleccionado, setFondoSeleccionado] = useState("");
  const [descuento, setDescuento] = useState(0);
  const [yaAporto, setYaAporto] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [queuedOffline, setQueuedOffline] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState(null);

  const { registrar, loading: guardando } = useRegistrarServicio();
  const { saldo: saldoFondo, donadores, fetchSaldo, fetchDonadores } = useFondoDonaciones();

  const donacionNum = Math.max(0, Number.parseFloat(montoDonacion) || 0);
  const pagadoNum = Math.max(0, Number.parseFloat(montoPagado) || 0);
  const fondoActivo = donadores.find((d) => String(d.id_fondo) === String(fondoSeleccionado));
  const saldoFondoSel = fondoActivo ? Number(fondoActivo.saldo) : 0;

  useEffect(() => {
    if (pasoActual === 4) {
      fetchSaldo().catch(() => {});
      fetchDonadores().catch(() => {});
    }
  }, [pasoActual, fetchSaldo, fetchDonadores]);

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

  const subtotal = totalServicio + subtotalInsumos;
  const descuentoNum = Math.max(0, Number.parseFloat(descuento) || 0);
  const totalConDescuento = Math.max(0, subtotal - descuentoNum);
  const saldoRestante = totalConDescuento - pagadoNum - donacionNum;

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
    id_beneficiario: c.id_beneficiario, 
    nombre:          c.nombre_completo,
    beneficiario:    c.nombre_completo,
    hora:            c.hora,
    tipo:            c.servicio_nombre,
    medico:          c.especialista_nombre,
  }));

  // ── Beneficiario mostrado en el resumen ────────────────────
  const resolveBeneficiarioFinal = () => {
    if (beneficiarioSeleccionado) return resultados.find((b) => b.folio === beneficiarioSeleccionado);
    if (citaSeleccionada) return citasFormateadas.find((c) => c.id === citaSeleccionada);
    return null;
  };
  const beneficiarioFinal = resolveBeneficiarioFinal();

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
      const result = await registrar({
      id_beneficiario,
      id_catalogo_servicio: tipoServicio,
      fecha,
      hora,
      id_cita: citaSeleccionada ?? null,
      notas,
      cantidad: 1,

      id_usuario: 1,

      insumos: insumos.map(i => ({
        id: i.id,
        cantidad: i.cantidad,
        precio: i.precio,
      })),

      monto_servicio: totalServicio,
      monto_inventario: subtotalInsumos,
      descuento: Number.parseFloat(descuento) || 0,
      cuota_total: totalConDescuento,
      monto_pagado: pagadoNum,
      monto_donacion: donacionNum,
      id_fondo: donacionNum > 0 ? Number(fondoSeleccionado) : null,
      id_donador: donacionNum > 0 ? fondoActivo?.id_donador : null,
      metodo_pago: metodoPago,
      ya_aporto: yaAporto,
    });

      if (result?.queued) {
        setQueuedOffline(true);
      } else {
        fetchSaldo().catch(() => {});
        fetchDonadores().catch(() => {});
      }
      setGuardado(true);

    } catch (err) {
      console.error('Error al guardar:', err);
      setErrorGuardado(err.message || 'Ocurrió un error al guardar el servicio.');
    }
  };

  const validarPasoFinanzas = () => {
    const pagado = Number.parseFloat(montoPagado) || 0;
    const donacion = Number.parseFloat(montoDonacion) || 0;
    if (pagado + donacion > totalConDescuento + 0.001) return false;
    if (donacion > 0 && !fondoSeleccionado) return false;
    if (donacion > saldoFondoSel + 0.001) return false;
    if (pagado > 0 && !metodoPago) return false;
    return true;
  };

  const puedeAvanzar = () => {
    if (pasoActual === 1) return !!(beneficiarioSeleccionado || citaSeleccionada);
    if (pasoActual === 2) return !!(fecha && hora);
    if (pasoActual === 3) return !!(tipoServicio || insumos.length > 0);
    if (pasoActual === 4) return validarPasoFinanzas();
    return true;
  };

  /** Vuelve al inicio del flujo con formulario limpio (solo desactivar guardado deja el paso 4 lleno). */
  const iniciarNuevoServicio = useCallback(() => {
    setPasoActual(1);
    setQuery("");
    setBeneficiarioSeleccionado(null);
    setCitaSeleccionada(null);
    setFecha("");
    setHora("");
    setNotas("");
    setCategoriaServicio("");
    setTipoServicio("");
    setPrecioServicio(0);
    setInsumos([]);
    setMetodoPago("");
    setMontoPagado("");
    setMontoDonacion("");
    setFondoSeleccionado("");
    setDescuento(0);
    setYaAporto(false);
    setErrorGuardado(null);
    setGuardado(false);
    setQueuedOffline(false);
  }, []);

  // ── Pantalla de éxito ──────────────────────────────────────
  if (guardado) {
    return (
      <PantallaExito
        offline={queuedOffline}
        onNuevo={iniciarNuevoServicio}
        onHistorial={() => navigate('/servicios')}
      />
    );
  }

  const puedeContinuar = puedeAvanzar();
  const etiquetaGuardar = guardando ? 'Guardando...' : 'Guardar';

  return (
    <div className='page'>
      <div className='description page-header'>
        <h1 className='page-header-title'>Registrar Nuevo Servicio</h1>
        <p className='page-header-subtitle'>Complete los datos para registrar un servicio otorgado.</p>
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
                total={subtotal}
                totalConDescuento={totalConDescuento}
                saldo={saldoRestante}
                saldoGlobal={saldoFondo?.saldo ?? 0}
                donadores={donadores}
                fondoSeleccionado={fondoSeleccionado}
                setFondoSeleccionado={setFondoSeleccionado}
                metodoPago={metodoPago}
                setMetodoPago={setMetodoPago}
                montoPagado={montoPagado}
                setMontoPagado={setMontoPagado}
                montoDonacion={montoDonacion}
                setMontoDonacion={setMontoDonacion}
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
                  style={{ opacity: puedeContinuar ? 1 : 0.2 }}
                  onClick={() => puedeContinuar && setPasoActual(pasoActual + 1)}
                >
                  Continuar <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  className='btnPrimary'
                  onClick={handleGuardar}
                  disabled={guardando || !puedeContinuar}
                >
                  {etiquetaGuardar} <CheckCircle2 size={16} />
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
                <dd>{beneficiarioFinal?.nombre || "—"}</dd>
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
                <span>Aporte Asociación:</span>
                <strong>
                  - ${descuentoNum.toFixed(2)}
                </strong>
              </div>

              <div className='totalesRow'>
                <span>Total a pagar:</span>
                <strong className='totalesTotal'>
                  ${totalConDescuento.toFixed(2)}
                </strong>
              </div>

              <div className='totalesRow'>
                <span>Aportación familia:</span>
                <strong>
                  ${pagadoNum.toFixed(2)}
                </strong>
              </div>

              <div className='totalesRow'>
                <span>{getSaldoLabel(saldoRestante)}</span>

                <strong
                  className='totalesSaldo'
                  style={{
                    color:
                      saldoRestante > 0
                        ? "#dc2626"
                        : "#0f766e",
                  }}
                >
                  ${Math.abs(saldoRestante).toFixed(2)}
                </strong>
              </div>

              <p className='totalesExtra'>
                Método: {metodoPago || "Pendiente"}
              </p>

              <p className='totalesExtra'>
                Cita: {citaSeleccionada ?? "Sin cita"}
              </p>

            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}