import { useState } from "react";
import {
  Search,
  ClipboardList,
  Package,
  Wallet,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Calendar,
  User,
  Stethoscope,
  CreditCard,
  CheckCircle2,
} from "lucide-react";

import "./BusquedaBeneficiarioVista.css";

const PASOS = [
  { id: 1, tab: "Búsqueda", Icon: Search },
  { id: 2, tab: "Detalles", Icon: ClipboardList },
  { id: 3, tab: "Insumos", Icon: Package },
  { id: 4, tab: "Finanzas", Icon: Wallet },
];

const TIPOS_SERVICIO = [
  "Consulta general",
  "Fisioterapia",
  "Neurología",
  "Ortopedia",
  "Urología",
  "Psicología",
  "Trabajo social",
];

const MEDICOS = [
  "Dr. Alejandro García",
  "Dra. María López",
  "Dr. Carlos Ramírez",
  "Dra. Sofía Torres",
  "Dr. Juan Hernández",
];

const METODOS_PAGO = ["Efectivo", "Transferencia", "Tarjeta débito", "Tarjeta crédito", "Cheque"];

const PRODUCTOS_MOCK = [
  { id: 1, nombre: "Sonda vesical Fr14", precio: 85 },
  { id: 2, nombre: "Catéter intermitente", precio: 120 },
  { id: 3, nombre: "Bolsa colectora 2L", precio: 45 },
  { id: 4, nombre: "Gasas estériles x10", precio: 30 },
  { id: 5, nombre: "Guantes látex M x100", precio: 90 },
];

const BENEFICIARIOS_MOCK = [
  { folio: "BEN-001", nombre: "Ana Martínez Flores", curp: "MAFA001012MNLRLN01", membresia: "Activa" },
  { folio: "BEN-002", nombre: "Carlos Ruiz Sánchez", curp: "RUSC990305HNLLRR02", membresia: "Activa" },
  { folio: "BEN-003", nombre: "Sofía Pérez Luna", curp: "PELS020718MNLRNS03", membresia: "Inactiva" },
];

const CITAS_HOY = [
  { id: "CITA-041", beneficiario: "Ana Martínez Flores", hora: "09:00", tipo: "Fisioterapia", medico: "Dr. Alejandro García" },
  { id: "CITA-042", beneficiario: "Carlos Ruiz Sánchez", hora: "10:30", tipo: "Neurología", medico: "Dra. María López" },
];

export default function BusquedaBeneficiarioVista() {
  const [pasoActual, setPasoActual] = useState(1);
  const [busquedaTab, setBusquedaTab] = useState("beneficiario");
  const [query, setQuery] = useState("");
  const [beneficiarioSeleccionado, setBeneficiarioSeleccionado] = useState(null);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  // Paso 2
  const [fecha, setFecha] = useState("");
  const [tipoServicio, setTipoServicio] = useState("");
  const [medico, setMedico] = useState("");
  const [notas, setNotas] = useState("");

  // Paso 3
  const [insumos, setInsumos] = useState([]);
  const [productoSelec, setProductoSelec] = useState("");
  const [cantidadProducto, setCantidadProducto] = useState(1);

  // Paso 4
  const [metodoPago, setMetodoPago] = useState("");
  const [montoPagado, setMontoPagado] = useState("");
  const [descuento, setDescuento] = useState(0);
  const [guardado, setGuardado] = useState(false);

  const totalPasos = PASOS.length;
  const progresoPct = (pasoActual / totalPasos) * 100;

  const beneficiarioFinal = beneficiarioSeleccionado
    ? BENEFICIARIOS_MOCK.find((b) => b.folio === beneficiarioSeleccionado)
    : citaSeleccionada
    ? { nombre: CITAS_HOY.find((c) => c.id === citaSeleccionada)?.beneficiario }
    : null;

  const citaInfo = citaSeleccionada ? CITAS_HOY.find((c) => c.id === citaSeleccionada) : null;

  const subtotalInsumos = insumos.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  const totalServicio = subtotalInsumos;
  const totalConDescuento = totalServicio - descuento;
  const saldoRestante = totalConDescuento - (parseFloat(montoPagado) || 0);

  const resultados = query.length >= 2
    ? BENEFICIARIOS_MOCK.filter(
        (b) =>
          b.nombre.toLowerCase().includes(query.toLowerCase()) ||
          b.folio.toLowerCase().includes(query.toLowerCase()) ||
          b.curp.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const agregarInsumo = () => {
    if (!productoSelec) return;
    const prod = PRODUCTOS_MOCK.find((p) => p.id === parseInt(productoSelec));
    if (!prod) return;
    const existe = insumos.find((i) => i.id === prod.id);
    if (existe) {
      setInsumos(insumos.map((i) => i.id === prod.id ? { ...i, cantidad: i.cantidad + cantidadProducto } : i));
    } else {
      setInsumos([...insumos, { ...prod, cantidad: cantidadProducto }]);
    }
    setProductoSelec("");
    setCantidadProducto(1);
  };

  const quitarInsumo = (id) => setInsumos(insumos.filter((i) => i.id !== id));

  const puedeAvanzar = () => {
    if (pasoActual === 1) return !!(beneficiarioSeleccionado || citaSeleccionada);
    if (pasoActual === 2) return !!(fecha && tipoServicio && medico);
    if (pasoActual === 3) return true;
    if (pasoActual === 4) return !!(metodoPago && montoPagado);
    return false;
  };

  const handleGuardar = () => setGuardado(true);

  if (guardado) {
    return (
      <div style={styles.page}>
        <div style={styles.inner}>
          <div style={{ ...styles.card, textAlign: "center", padding: "80px 40px" }}>
            <CheckCircle2 size={64} color="#0f766e" style={{ marginBottom: 24 }} />
            <h2 style={{ fontSize: 28, fontWeight: 800, color: "#121317", margin: "0 0 12px" }}>
              Servicio registrado exitosamente
            </h2>
            <p style={{ color: "#666e85", fontSize: 16 }}>
              El servicio para <strong>{beneficiarioFinal?.nombre}</strong> ha sido guardado correctamente.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 32 }}>
              <button
                style={{ ...styles.btnPrimary, background: "#1e3b8a" }}
                onClick={() => {
                  setGuardado(false);
                  setPasoActual(1);
                  setBeneficiarioSeleccionado(null);
                  setCitaSeleccionada(null);
                  setQuery("");
                  setFecha(""); setTipoServicio(""); setMedico(""); setNotas("");
                  setInsumos([]); setMetodoPago(""); setMontoPagado(""); setDescuento(0);
                }}
              >
                Nuevo servicio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.inner}>

        {/* Tabs */}
        <nav style={styles.tabsWrap}>
          {PASOS.map((paso) => {
            const activo = pasoActual === paso.id;
            const completado = pasoActual > paso.id;
            const { Icon } = paso;
            return (
              <div
                key={paso.id}
                style={{
                  ...styles.tab,
                  ...(activo ? styles.tabActive : {}),
                  ...(completado ? styles.tabDone : {}),
                }}
              >
                <Icon size={16} strokeWidth={2} />
                <span>{paso.tab}</span>
                {completado && <CheckCircle2 size={14} color="#0f766e" />}
              </div>
            );
          })}
        </nav>

        <div style={styles.grid}>

          {/* ── MAIN ── */}
          <main style={styles.main}>
            <header style={{ marginBottom: 24 }}>
              <h2 style={styles.mainTitle}>
                {pasoActual === 1 && "Búsqueda de beneficiario"}
                {pasoActual === 2 && "Detalles del servicio"}
                {pasoActual === 3 && "Medicamentos y suministros"}
                {pasoActual === 4 && "Información financiera"}
              </h2>
              <p style={styles.mainSub}>
                Paso {pasoActual} de {totalPasos} ·{" "}
                {pasoActual === 1 && "Seleccionar beneficiario"}
                {pasoActual === 2 && "Completar datos del servicio"}
                {pasoActual === 3 && "Agregar insumos utilizados"}
                {pasoActual === 4 && "Registrar pago"}
              </p>
            </header>

            {/* ─── PASO 1 ─── */}
            {pasoActual === 1 && (
              <div style={styles.panel}>
                <p style={styles.hint}>Selecciona por beneficiario activo o toma una cita programada para hoy.</p>

                <div style={styles.segmented}>
                  <button
                    style={{ ...styles.segBtn, ...(busquedaTab === "beneficiario" ? styles.segBtnActive : {}) }}
                    onClick={() => { setBusquedaTab("beneficiario"); setCitaSeleccionada(null); }}
                  >
                    Por beneficiario
                  </button>
                  <button
                    style={{ ...styles.segBtn, ...(busquedaTab === "citas" ? styles.segBtnActive : {}) }}
                    onClick={() => { setBusquedaTab("citas"); setBeneficiarioSeleccionado(null); setQuery(""); }}
                  >
                    Citas del día
                  </button>
                </div>

                {busquedaTab === "beneficiario" && (
                  <>
                    <div style={styles.field}>
                      <span style={styles.fieldLabel}>Buscar beneficiario</span>
                      <div style={{ position: "relative" }}>
                        <Search size={16} color="#9ca3af" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
                        <input
                          style={{ ...styles.input, paddingLeft: 44 }}
                          placeholder="Nombre, folio o CURP"
                          value={query}
                          onChange={(e) => { setQuery(e.target.value); setBeneficiarioSeleccionado(null); }}
                        />
                      </div>
                    </div>

                    {query.length >= 2 && resultados.length === 0 && (
                      <p style={styles.empty}>No hay coincidencias.</p>
                    )}

                    {resultados.length > 0 && (
                      <div style={styles.resultList}>
                        {resultados.map((b) => (
                          <div
                            key={b.folio}
                            onClick={() => setBeneficiarioSeleccionado(b.folio)}
                            style={{
                              ...styles.resultRow,
                              ...(beneficiarioSeleccionado === b.folio ? styles.resultRowActive : {}),
                            }}
                          >
                            <div style={styles.avatarCircle}>
                              <User size={16} color="#1e3b8a" />
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#121317" }}>{b.nombre}</p>
                              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#666e85" }}>{b.folio} · {b.curp}</p>
                            </div>
                            <span style={{
                              fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
                              background: b.membresia === "Activa" ? "#dcfce7" : "#fee2e2",
                              color: b.membresia === "Activa" ? "#166534" : "#991b1b",
                            }}>
                              {b.membresia}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {busquedaTab === "citas" && (
                  <div style={styles.resultList}>
                    {CITAS_HOY.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => setCitaSeleccionada(c.id)}
                        style={{
                          ...styles.resultRow,
                          ...(citaSeleccionada === c.id ? styles.resultRowActive : {}),
                        }}
                      >
                        <div style={{ ...styles.avatarCircle, background: "#fef3c7" }}>
                          <Calendar size={16} color="#d97706" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#121317" }}>{c.beneficiario}</p>
                          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#666e85" }}>
                            {c.hora} · {c.tipo} · {c.medico}
                          </p>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "#dbeafe", color: "#1e40af" }}>
                          {c.id}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── PASO 2 ─── */}
            {pasoActual === 2 && (
              <div style={styles.panel}>
                <div style={styles.formGrid3}>
                  <div style={styles.field}>
                    <label style={styles.fieldLabel}>
                      <Calendar size={13} style={{ marginRight: 5 }} />Fecha del servicio
                    </label>
                    <input type="date" style={styles.input} value={fecha} onChange={(e) => setFecha(e.target.value)} />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.fieldLabel}>
                      <Stethoscope size={13} style={{ marginRight: 5 }} />Tipo de servicio
                    </label>
                    <select style={styles.select} value={tipoServicio} onChange={(e) => setTipoServicio(e.target.value)}>
                      <option value="">Seleccionar...</option>
                      {TIPOS_SERVICIO.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div style={styles.field}>
                    <label style={styles.fieldLabel}>
                      <User size={13} style={{ marginRight: 5 }} />Médico responsable
                    </label>
                    <select style={styles.select} value={medico} onChange={(e) => setMedico(e.target.value)}>
                      <option value="">Seleccionar...</option>
                      {MEDICOS.map((m) => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.fieldLabel}>Notas / diagnóstico (opcional)</label>
                  <textarea
                    style={{ ...styles.input, minHeight: 100, resize: "vertical", lineHeight: 1.5 }}
                    placeholder="Observaciones del servicio..."
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                  />
                </div>

                {citaInfo && (
                  <div style={styles.infoBanner}>
                    <Calendar size={16} color="#1e3b8a" />
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1e3b8a" }}>Cita vinculada: {citaInfo.id}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#3d5a99" }}>{citaInfo.hora} · {citaInfo.tipo}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── PASO 3 ─── */}
            {pasoActual === 3 && (
              <div style={styles.panel}>
                <p style={styles.hint}>Agrega los medicamentos e insumos utilizados durante el servicio.</p>

                <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
                  <div style={{ ...styles.field, flex: 3 }}>
                    <label style={styles.fieldLabel}>Producto / insumo</label>
                    <select style={styles.select} value={productoSelec} onChange={(e) => setProductoSelec(e.target.value)}>
                      <option value="">Seleccionar producto...</option>
                      {PRODUCTOS_MOCK.map((p) => (
                        <option key={p.id} value={p.id}>{p.nombre} — ${p.precio.toFixed(2)}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ ...styles.field, flex: 1 }}>
                    <label style={styles.fieldLabel}>Cantidad</label>
                    <input
                      type="number" min={1} style={styles.input}
                      value={cantidadProducto}
                      onChange={(e) => setCantidadProducto(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <button onClick={agregarInsumo} style={{ ...styles.btnPrimary, marginBottom: 0, height: 48, padding: "0 20px" }}>
                    <Plus size={16} /> Agregar
                  </button>
                </div>

                {insumos.length === 0 ? (
                  <div style={styles.emptyBox}>
                    <Package size={32} color="#c4c9d8" />
                    <p style={{ margin: "10px 0 0", color: "#9ca3af", fontSize: 14 }}>No se han agregado insumos.</p>
                  </div>
                ) : (
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Producto</th>
                        <th style={{ ...styles.th, textAlign: "right" }}>Cant.</th>
                        <th style={{ ...styles.th, textAlign: "right" }}>Precio u.</th>
                        <th style={{ ...styles.th, textAlign: "right" }}>Subtotal</th>
                        <th style={styles.th}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {insumos.map((i) => (
                        <tr key={i.id} style={styles.tr}>
                          <td style={styles.td}>{i.nombre}</td>
                          <td style={{ ...styles.td, textAlign: "right" }}>{i.cantidad}</td>
                          <td style={{ ...styles.td, textAlign: "right" }}>${i.precio.toFixed(2)}</td>
                          <td style={{ ...styles.td, textAlign: "right", fontWeight: 700 }}>${(i.precio * i.cantidad).toFixed(2)}</td>
                          <td style={{ ...styles.td, textAlign: "right" }}>
                            <button onClick={() => quitarInsumo(i.id)} style={styles.btnDelete}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} style={{ ...styles.td, fontWeight: 700, color: "#121317" }}>Total insumos</td>
                        <td style={{ ...styles.td, textAlign: "right", fontWeight: 800, color: "#1e3b8a", fontSize: 16 }}>
                          ${subtotalInsumos.toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>
            )}

            {/* ─── PASO 4 ─── */}
            {pasoActual === 4 && (
              <div style={styles.panel}>
                <div style={styles.formGrid3}>
                  <div style={styles.field}>
                    <label style={styles.fieldLabel}><CreditCard size={13} style={{ marginRight: 5 }} />Método de pago</label>
                    <select style={styles.select} value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
                      <option value="">Seleccionar...</option>
                      {METODOS_PAGO.map((m) => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div style={styles.field}>
                    <label style={styles.fieldLabel}>Monto pagado ($)</label>
                    <input
                      type="number" min={0} step={0.01} style={styles.input}
                      placeholder="0.00"
                      value={montoPagado}
                      onChange={(e) => setMontoPagado(e.target.value)}
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.fieldLabel}>Descuento ($)</label>
                    <input
                      type="number" min={0} step={0.01} style={styles.input}
                      placeholder="0.00"
                      value={descuento}
                      onChange={(e) => setDescuento(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div style={styles.resumenFinanciero}>
                  <div style={styles.resumenRow}>
                    <span style={{ color: "#666e85" }}>Subtotal insumos</span>
                    <span style={{ fontWeight: 600 }}>${subtotalInsumos.toFixed(2)}</span>
                  </div>
                  <div style={styles.resumenRow}>
                    <span style={{ color: "#666e85" }}>Descuento</span>
                    <span style={{ fontWeight: 600, color: "#dc2626" }}>-${descuento.toFixed(2)}</span>
                  </div>
                  <div style={{ ...styles.resumenRow, borderTop: "1px solid #e5e7eb", paddingTop: 12, marginTop: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>Total</span>
                    <span style={{ fontWeight: 800, fontSize: 20, color: "#1e3b8a" }}>${totalConDescuento.toFixed(2)}</span>
                  </div>
                  <div style={styles.resumenRow}>
                    <span style={{ color: "#666e85" }}>Pagado</span>
                    <span style={{ fontWeight: 600, color: "#0f766e" }}>${(parseFloat(montoPagado) || 0).toFixed(2)}</span>
                  </div>
                  <div style={{ ...styles.resumenRow, background: saldoRestante > 0 ? "#fef2f2" : "#f0fdf4", borderRadius: 10, padding: "10px 14px", marginTop: 4 }}>
                    <span style={{ fontWeight: 700, color: saldoRestante > 0 ? "#991b1b" : "#166534" }}>Saldo restante</span>
                    <span style={{ fontWeight: 800, fontSize: 18, color: saldoRestante > 0 ? "#dc2626" : "#16a34a" }}>
                      ${saldoRestante.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Navegación */}
            <div style={styles.navRow}>
              {pasoActual > 1 && (
                <button style={styles.btnSecondary} onClick={() => setPasoActual(pasoActual - 1)}>
                  <ChevronLeft size={16} /> Anterior
                </button>
              )}
              <div style={{ flex: 1 }} />
              {pasoActual < totalPasos ? (
                <button
                  style={{ ...styles.btnPrimary, opacity: puedeAvanzar() ? 1 : 0.45, cursor: puedeAvanzar() ? "pointer" : "not-allowed" }}
                  onClick={() => puedeAvanzar() && setPasoActual(pasoActual + 1)}
                >
                  Continuar a {PASOS[pasoActual]?.tab} <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  style={{ ...styles.btnPrimary, background: "#0f766e", opacity: puedeAvanzar() ? 1 : 0.45, cursor: puedeAvanzar() ? "pointer" : "not-allowed" }}
                  onClick={() => puedeAvanzar() && handleGuardar()}
                >
                  <CheckCircle2 size={16} /> Guardar servicio
                </button>
              )}
            </div>
          </main>

          {/* ── ASIDE ── */}
          <aside style={styles.aside}>
            <header style={styles.asideHeader}>
              <div style={styles.asideIconWrap}><ClipboardList size={20} color="#1e3b8a" /></div>
              <h3 style={styles.asideTitle}>Resumen del Registro</h3>
            </header>

            <div style={styles.procesoBadge}>
              <p style={styles.procesoLabel}>ESTADO DEL PROCESO</p>
              <p style={styles.procesoStep}>Paso {pasoActual} de {totalPasos}</p>
              <div style={styles.track}>
                <div style={{ ...styles.fill, width: `${progresoPct}%` }} />
              </div>
            </div>

            <dl style={styles.dl}>
              <div style={styles.dlRow}>
                <dt>Beneficiario:</dt>
                <dd>{beneficiarioFinal?.nombre || "—"}</dd>
              </div>
              <div style={styles.dlRow}>
                <dt>Fecha:</dt>
                <dd>{fecha || "—"}</dd>
              </div>
              <div style={styles.dlRow}>
                <dt>Servicio:</dt>
                <dd>{tipoServicio || "—"}</dd>
              </div>
              <div style={styles.dlRow}>
                <dt>Médico:</dt>
                <dd>{medico || "—"}</dd>
              </div>
              {citaInfo && (
                <div style={styles.dlRow}>
                  <dt>Cita:</dt>
                  <dd style={{ color: "#1e3b8a" }}>{citaInfo.id}</dd>
                </div>
              )}
            </dl>

            <div style={styles.totales}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#666e85", fontSize: 14 }}>Total:</span>
                <strong style={{ fontSize: 18, color: "#121317" }}>${totalConDescuento.toFixed(2)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#666e85", fontSize: 14 }}>Saldo Restante:</span>
                <strong style={{ fontSize: 14, color: saldoRestante > 0 ? "#dc2626" : "#0f766e" }}>
                  ${saldoRestante.toFixed(2)}
                </strong>
              </div>
              <p style={styles.extra}>Inventario: ${subtotalInsumos.toFixed(2)}</p>
              <p style={styles.extra}>Descuento: ${descuento.toFixed(2)}</p>
              <p style={styles.extra}>Cita: {citaInfo ? citaInfo.id : "Sin cita"}</p>
              <p style={styles.extra}>Método: {metodoPago || "Pendiente"}</p>
              <p style={styles.extra}>Pagado: ${(parseFloat(montoPagado) || 0).toFixed(2)}</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Styles
// ─────────────────────────────────────────
const styles = {
  page: {
    padding: "28px 0 40px",
    color: "#121317",
    background: "#f6f6f8",
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    minHeight: "100vh",
  },
  inner: {
    maxWidth: 1200,
    width: "min(1200px, calc(100% - 80px))",
    marginLeft: "auto",
    marginRight: "auto",
  },
  tabsWrap: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 0,
    marginBottom: 24,
    padding: 4,
    border: "1px solid #f1f1f4",
    borderRadius: 16,
    background: "#fff",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  tab: {
    minHeight: 52,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    color: "#666e85",
    fontSize: 14,
    fontWeight: 600,
    borderRadius: "12px 12px 0 0",
    borderBottom: "2px solid transparent",
  },
  tabActive: {
    borderBottomColor: "#1e3b8a",
    background: "rgba(220,225,255,0.2)",
    color: "#1e3b8a",
  },
  tabDone: {
    color: "#0f766e",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(0,2fr) minmax(290px,1fr)",
    gap: 32,
    alignItems: "start",
  },
  main: {
    padding: 32,
    border: "1px solid #f1f1f4",
    borderRadius: 16,
    background: "#fff",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  mainTitle: { margin: 0, color: "#121317", fontSize: 20, fontWeight: 700, lineHeight: 1.2 },
  mainSub: { margin: "6px 0 0", color: "#666e85", fontSize: 15 },
  panel: { display: "flex", flexDirection: "column", gap: 16 },
  hint: { margin: 0, color: "#666e85", fontSize: 15 },
  segmented: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  segBtn: {
    border: "1px solid #e5e7eb", borderRadius: 12, minHeight: 48,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "#fff", color: "#121317", fontWeight: 600, fontSize: 15, cursor: "pointer",
  },
  segBtnActive: { borderColor: "#1e3b8a", color: "#1e3b8a" },
  field: { display: "flex", flexDirection: "column", gap: 8 },
  fieldLabel: {
    color: "#666e85", fontSize: 12, fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "0.06em",
    display: "flex", alignItems: "center",
  },
  input: {
    width: "100%", minHeight: 48, border: "1px solid #e5e7eb", borderRadius: 12,
    background: "#f8fafc", padding: "0 16px", color: "#121317", fontSize: 15,
    boxSizing: "border-box", outline: "none", fontFamily: "inherit",
  },
  select: {
    width: "100%", minHeight: 48, border: "1px solid #e5e7eb", borderRadius: 12,
    background: "#f8fafc", padding: "0 16px", color: "#121317", fontSize: 15,
    boxSizing: "border-box", outline: "none", fontFamily: "inherit",
  },
  empty: { margin: 0, color: "#666e85", fontSize: 14 },
  emptyBox: { textAlign: "center", padding: "40px 0", border: "1px dashed #e5e7eb", borderRadius: 12 },
  resultList: { display: "flex", flexDirection: "column", gap: 8 },
  resultRow: {
    display: "flex", alignItems: "center", gap: 14,
    padding: "12px 16px", border: "1px solid #e5e7eb", borderRadius: 12,
    background: "#fafafa", cursor: "pointer",
  },
  resultRowActive: { borderColor: "#1e3b8a", background: "rgba(220,225,255,0.15)" },
  avatarCircle: {
    width: 38, height: 38, borderRadius: 10, background: "#dce1ff",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  formGrid3: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 },
  infoBanner: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "14px 16px", border: "1px solid #bfdbfe",
    borderRadius: 12, background: "#eff6ff",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  th: { padding: "8px 12px", background: "#f8fafc", fontWeight: 700, color: "#666e85", fontSize: 12, textTransform: "uppercase", textAlign: "left" },
  tr: { borderBottom: "1px solid #f1f1f4" },
  td: { padding: "10px 12px", color: "#121317" },
  btnDelete: { background: "#fee2e2", border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer", color: "#dc2626", display: "flex", alignItems: "center" },
  resumenFinanciero: { background: "#f8fafc", border: "1px solid #f1f1f4", borderRadius: 14, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 10 },
  resumenRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  navRow: { display: "flex", alignItems: "center", marginTop: 28, paddingTop: 20, borderTop: "1px solid #f1f1f4" },
  btnPrimary: {
    display: "inline-flex", alignItems: "center", gap: 8,
    minHeight: 44, borderRadius: 12, padding: "0 28px",
    background: "#7c8dbb", color: "#fff", fontWeight: 700, fontSize: 15,
    border: "none", cursor: "pointer",
  },
  btnSecondary: {
    display: "inline-flex", alignItems: "center", gap: 8,
    minHeight: 44, borderRadius: 12, padding: "0 22px",
    background: "#f1f1f4", color: "#3d4565", fontWeight: 600, fontSize: 15,
    border: "none", cursor: "pointer",
  },
  aside: { border: "1px solid #f1f1f4", borderRadius: 16, background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", padding: 24 },
  asideHeader: { display: "flex", alignItems: "center", gap: 12, marginBottom: 18, paddingBottom: 16, borderBottom: "1px solid #f1f1f4" },
  asideIconWrap: { width: 40, height: 40, borderRadius: 12, background: "#dce1ff", display: "flex", alignItems: "center", justifyContent: "center" },
  asideTitle: { margin: 0, color: "#121317", fontSize: 18, fontWeight: 700 },
  procesoBadge: { border: "1px solid #f1f1f4", borderRadius: 12, background: "#f8fafc", padding: 16 },
  procesoLabel: { margin: 0, color: "#666e85", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em" },
  procesoStep: { margin: "8px 0 10px", color: "#1e3b8a", fontSize: 14, fontWeight: 600 },
  track: { height: 6, borderRadius: 999, background: "#f1f1f4", overflow: "hidden" },
  fill: { height: "100%", background: "#1e3b8a", borderRadius: 999, transition: "width 0.4s ease" },
  dl: { margin: "16px 0 0", display: "grid", gap: 12 },
  dlRow: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 },
  totales: { borderTop: "1px dashed #e5e7eb", marginTop: 16, paddingTop: 14, display: "grid", gap: 8 },
  extra: { margin: 0, color: "#3d4565", fontSize: 12 },
};