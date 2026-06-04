import { useState, useEffect, useMemo, useCallback } from "react";
import { CheckCircle2, RefreshCw } from "lucide-react";
import Dropdown from "../../components/ui/Dropdown";
import useFondoDonaciones from "../../hooks/useFondoDonaciones";
import "../styles/Recibos.css";
import "../styles/OperationalPage.css";
import "../styles/RegistroServicio.css";
import "../styles/Donaciones.css";

const fmt = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n ?? 0);

function MontoCell({ tipo, monto }) {
  const egreso = tipo === "egreso";
  return (
    <td className="donaciones-col-numeric">
      <span className={`donaciones-money donaciones-money--${tipo}`}>
        <span className="donaciones-money__sign" aria-hidden="true">
          {egreso ? "−" : "+"}
        </span>
        <span className="donaciones-money__value">{fmt(monto)}</span>
      </span>
    </td>
  );
}

function SaldoCell({ value, variant = "balance" }) {
  return (
    <td className={`donaciones-col-numeric donaciones-balance donaciones-balance--${variant}`}>
      <span className="donaciones-money__value">{fmt(value)}</span>
    </td>
  );
}

function Skeleton({ rows = 4 }) {
  return (
    <div className="skeleton-wrap" role="status" aria-live="polite" aria-label="Cargando movimientos">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-row" />
      ))}
    </div>
  );
}

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className="donaciones-field-error" role="alert">
      {message}
    </p>
  );
}

function validateField(name, { donadorSeleccionado, monto, concepto, nuevoTipo, nuevoNombre }) {
  switch (name) {
    case "donadorSeleccionado":
      return donadorSeleccionado ? "" : "Seleccione la marca o familia.";
    case "nuevoTipo":
      return nuevoTipo ? "" : "Seleccione si es marca o familia.";
    case "nuevoNombre":
      return nuevoNombre.trim() ? "" : "Ingrese el nombre.";
    case "monto": {
      const n = parseFloat(monto);
      if (!monto.trim()) return "Ingrese el monto de la donación.";
      if (Number.isNaN(n) || n <= 0) return "El monto debe ser mayor a cero.";
      return "";
    }
    case "concepto":
      return concepto.trim() ? "" : "El concepto es obligatorio.";
    default:
      return "";
  }
}

function validateAbono(values) {
  const fields = ["donadorSeleccionado", "monto", "concepto"];
  return Object.fromEntries(fields.map((f) => [f, validateField(f, values)]));
}

function validateCrearDonador(values) {
  const fields = ["nuevoTipo", "nuevoNombre"];
  return Object.fromEntries(fields.map((f) => [f, validateField(f, values)]));
}

function sanitizeMonto(value) {
  const cleaned = value.replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length <= 1) return cleaned;
  return `${parts[0]}.${parts.slice(1).join("")}`;
}

function formatOrigen(m) {
  if (m.tipo_movimiento?.toLowerCase() === "egreso") {
    if (m.donador_nombre) return `Fondo: ${m.donador_nombre}`;
    const folio = m.folio_servicio ?? m.id_servicio_otorgado;
    return folio ? `Servicio #${folio}` : "Servicio";
  }
  if (m.origen_tipo) {
    const label = m.origen_tipo === "marca" ? "Marca" : "Familia";
    return `${label}: ${m.origen_nombre ?? m.donador_nombre ?? "—"}`;
  }
  if (m.donador_nombre) return m.donador_nombre;
  return "—";
}

function formatConcepto(m) {
  if (m.tipo_movimiento?.toLowerCase() === "egreso") {
    const folio = m.folio_servicio ?? m.id_servicio_otorgado;
    const nombre = m.servicio_nombre?.trim();
    if (folio && nombre) return `Folio #${folio} · ${nombre}`;
    if (folio) return `Folio #${folio}`;
  }
  return m.concepto || m.motivo || "—";
}

export default function Donaciones() {
  const {
    saldo,
    donadores,
    movimientos,
    loading,
    error,
    fetchSaldo,
    fetchDonadores,
    fetchMovimientos,
    registrarAbono,
    crearDonador,
  } = useFondoDonaciones();

  const [donadorSeleccionado, setDonadorSeleccionado] = useState("");
  const [monto, setMonto] = useState("");
  const [concepto, setConcepto] = useState("");
  const [nuevoTipo, setNuevoTipo] = useState("");
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [guardado, setGuardado] = useState(false);
  const [donadorCreado, setDonadorCreado] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [crearErrors, setCrearErrors] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [creando, setCreando] = useState(false);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarCrearDonador, setMostrarCrearDonador] = useState(false);

  const abonoValues = useMemo(
    () => ({ donadorSeleccionado, monto, concepto }),
    [donadorSeleccionado, monto, concepto]
  );

  const crearValues = useMemo(
    () => ({ nuevoTipo, nuevoNombre }),
    [nuevoTipo, nuevoNombre]
  );

  const donadorOptions = useMemo(
    () => [
      { label: "Seleccionar marca o familia...", value: "" },
      ...donadores.map((d) => {
        const tipo = d.tipo_origen === "marca" ? "Marca" : "Familia";
        return {
          label: `${d.nombre} (${tipo}) — ${fmt(d.saldo)}`,
          value: String(d.id_donador),
        };
      }),
    ],
    [donadores]
  );

  const stats = useMemo(() => {
    const abonos = movimientos.filter((m) => m.tipo_movimiento === "abono");
    const egresos = movimientos.filter((m) => m.tipo_movimiento === "egreso");
    return { abonos: abonos.length, egresos: egresos.length };
  }, [movimientos]);

  useEffect(() => {
    fetchMovimientos().catch(() => {});
  }, [fetchMovimientos]);

  const clearFieldError = useCallback((name) => {
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const handleBlurAbono = (name) => {
    const message = validateField(name, { ...abonoValues, nuevoTipo: "", nuevoNombre: "" });
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });
  };

  const handleNuevoTipo = (tipo) => {
    setNuevoTipo(tipo);
    setCrearErrors((prev) => {
      const next = { ...prev };
      delete next.nuevoTipo;
      return next;
    });
  };

  const handleTabKeyDown = (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    handleNuevoTipo(nuevoTipo === "marca" ? "familia" : "marca");
  };

  const handleSubmitCrear = async (e) => {
    e.preventDefault();
    setDonadorCreado(false);

    const errors = validateCrearDonador(crearValues);
    if (Object.values(errors).some(Boolean)) {
      setCrearErrors(errors);
      return;
    }

    setCreando(true);
    try {
      const res = await crearDonador({
        tipo_origen: nuevoTipo,
        nombre: nuevoNombre.trim(),
      });
      setDonadorCreado(true);
      setNuevoTipo("");
      setNuevoNombre("");
      setCrearErrors({});
      setMostrarCrearDonador(false);
      await fetchDonadores();
      if (res?.data?.id_donador) {
        setDonadorSeleccionado(String(res.data.id_donador));
      }
    } catch (err) {
      setCrearErrors({ form: err.message || "Error al crear marca o familia." });
    } finally {
      setCreando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardado(false);

    const errors = validateAbono(abonoValues);
    if (Object.values(errors).some(Boolean)) {
      setFieldErrors(errors);
      return;
    }

    setGuardando(true);
    try {
      await registrarAbono({
        monto: parseFloat(monto),
        id_donador: Number(donadorSeleccionado),
        concepto: concepto.trim(),
      });
      setGuardado(true);
      setDonadorSeleccionado("");
      setMonto("");
      setConcepto("");
      setFieldErrors({});
      setMostrarFormulario(false);
      await Promise.all([fetchSaldo(), fetchDonadores(), fetchMovimientos()]);
    } catch (err) {
      setFieldErrors({
        form: err.message || "Error al registrar la donación.",
      });
    } finally {
      setGuardando(false);
    }
  };

  const cargarHistorial = async () => {
    setCargandoHistorial(true);
    try {
      await fetchMovimientos();
    } finally {
      setCargandoHistorial(false);
    }
  };

  const saldoLoading = loading && !saldo;

  return (
    <main className="recibos-page donaciones-page" aria-labelledby="donaciones-page-title">
      <header className="recibos-header page-header donaciones-header">
        <div className="recibos-heading">
          <h1 id="donaciones-page-title" className="page-header-title">
            Fondo de Donaciones
          </h1>
          <p className="page-header-subtitle">
            Cree marcas o familias, registre abonos y consulte movimientos por fondo.
          </p>
        </div>
        <div className="donaciones-saldo" aria-live="polite">
          <span className="donaciones-saldo-label">Saldo total</span>
          {saldoLoading ? (
            <div className="donaciones-skeleton-value" aria-hidden="true" />
          ) : (
            <span className="donaciones-saldo-value">{fmt(saldo?.saldo)}</span>
          )}
        </div>
      </header>

      <section className="recibos-section" aria-labelledby="donaciones-fondos-title">
        <div className="section-title-row">
          <div>
            <h2 id="donaciones-fondos-title" className="section-title">
              Marcas y familias
            </h2>
            <p className="section-sub">Cada una tiene su propio fondo de donación.</p>
          </div>
          <button
            type="button"
            className="btnSecondary"
            onClick={() => setMostrarCrearDonador((prev) => !prev)}
            aria-expanded={mostrarCrearDonador}
          >
            {mostrarCrearDonador ? "Cancelar" : "Nueva marca / familia"}
          </button>
        </div>

        {mostrarCrearDonador && (
          <form
            onSubmit={handleSubmitCrear}
            className="donaciones-form donaciones-form-panel"
            noValidate
          >
            <div className="field">
              <span className="fieldLabel">Tipo</span>
              <div className="recibos-tabs-wrap donaciones-tabs-wrap">
                <div
                  className="recibos-tabs recibos-tabs--two"
                  role="tablist"
                  onKeyDown={handleTabKeyDown}
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={nuevoTipo === "marca"}
                    className={`recibos-tab ${nuevoTipo === "marca" ? "is-active" : ""} ${
                      crearErrors.nuevoTipo ? "is-invalid" : ""
                    }`}
                    onClick={() => handleNuevoTipo("marca")}
                  >
                    Marca / empresa
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={nuevoTipo === "familia"}
                    className={`recibos-tab ${nuevoTipo === "familia" ? "is-active" : ""} ${
                      crearErrors.nuevoTipo ? "is-invalid" : ""
                    }`}
                    onClick={() => handleNuevoTipo("familia")}
                  >
                    Familia
                  </button>
                </div>
              </div>
              <FieldError message={crearErrors.nuevoTipo} />
            </div>

            <div className="field">
              <label className="fieldLabel" htmlFor="nuevo-donador-nombre">
                Nombre
              </label>
              <input
                id="nuevo-donador-nombre"
                type="text"
                className={`input donaciones-input ${crearErrors.nuevoNombre ? "is-invalid" : ""}`}
                placeholder="Ej. Fundación XYZ"
                value={nuevoNombre}
                onChange={(e) => {
                  setNuevoNombre(e.target.value);
                  setCrearErrors((prev) => {
                    const next = { ...prev };
                    delete next.nuevoNombre;
                    return next;
                  });
                }}
              />
              <FieldError message={crearErrors.nuevoNombre} />
            </div>

            {crearErrors.form && (
              <div className="estado-msg estado-error" role="alert">
                {crearErrors.form}
              </div>
            )}

            {donadorCreado && (
              <div className="donaciones-exito" role="status">
                <CheckCircle2 size={18} aria-hidden="true" />
                <span>Marca o familia creada correctamente.</span>
              </div>
            )}

            <button type="submit" className="btnPrimary" disabled={creando}>
              {creando ? "Creando..." : "Crear fondo"}
            </button>
          </form>
        )}

        <div className="recibos-card" style={{ marginBottom: 24 }}>
          {donadores.length === 0 ? (
            <div className="estado-msg">
              No hay marcas ni familias. Cree una antes de registrar donaciones.
            </div>
          ) : (
            <div className="table-wrap">
              <table className="recibos-table">
                <thead>
                  <tr>
                    <th scope="col">Nombre</th>
                    <th scope="col">Tipo</th>
                    <th className="text-right" scope="col">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {donadores.map((d) => (
                    <tr key={d.id_donador}>
                      <td>{d.nombre}</td>
                      <td>{d.tipo_origen === "marca" ? "Marca" : "Familia"}</td>
                      <SaldoCell value={d.saldo} variant="fondo" />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="recibos-section" aria-labelledby="donaciones-historial-title">
        <div className="section-title-row">
          <div>
            <h2 id="donaciones-historial-title" className="section-title">
              Historial de donaciones
            </h2>
            <p className="section-sub">
              Abonos y egresos de todos los fondos
              {!loading && movimientos.length > 0 && (
                <>
                  {" "}
                  · {stats.abonos} {stats.abonos === 1 ? "abono" : "abonos"} · {stats.egresos}{" "}
                  {stats.egresos === 1 ? "egreso" : "egresos"}
                </>
              )}
              .
            </p>
          </div>
          <div className="donaciones-actions">
            <button
              type="button"
              className="btnPrimary"
              onClick={() => setMostrarFormulario((prev) => !prev)}
              aria-expanded={mostrarFormulario}
              aria-controls="donaciones-registro-form"
              disabled={donadores.length === 0}
            >
              {mostrarFormulario ? "Ocultar formulario" : "Registrar donación"}
            </button>
            <button
              type="button"
              className="btnSecondary"
              onClick={cargarHistorial}
              disabled={cargandoHistorial || loading}
              aria-busy={cargandoHistorial}
            >
              <RefreshCw
                size={15}
                aria-hidden="true"
                className={cargandoHistorial ? "donaciones-spin" : ""}
              />
              Actualizar
            </button>
          </div>
        </div>

        {mostrarFormulario && (
          <form
            id="donaciones-registro-form"
            onSubmit={handleSubmit}
            className="donaciones-form donaciones-form-panel"
            noValidate
          >
            <div className="field">
              <label className="fieldLabel" htmlFor="donador-abono">
                Marca o familia
              </label>
              <Dropdown
                options={donadorOptions}
                value={donadorSeleccionado}
                onChange={(val) => {
                  setDonadorSeleccionado(val);
                  clearFieldError("donadorSeleccionado");
                }}
                className="dropdown-servicios"
              />
              <FieldError id="donador-error" message={fieldErrors.donadorSeleccionado} />
            </div>

            <div className="field">
              <label className="fieldLabel" htmlFor="monto-donacion">
                Monto (MXN)
              </label>
              <div className="donaciones-input-prefix">
                <span className="donaciones-input-prefix-symbol" aria-hidden="true">
                  $
                </span>
                <input
                  id="monto-donacion"
                  type="text"
                  inputMode="decimal"
                  className={`input donaciones-input donaciones-input--monto ${
                    fieldErrors.monto ? "is-invalid" : ""
                  }`}
                  placeholder="0.00"
                  value={monto}
                  onChange={(e) => {
                    setMonto(sanitizeMonto(e.target.value));
                    clearFieldError("monto");
                  }}
                  onBlur={() => handleBlurAbono("monto")}
                  aria-invalid={Boolean(fieldErrors.monto)}
                  aria-describedby={fieldErrors.monto ? "monto-error" : undefined}
                />
              </div>
              <FieldError id="monto-error" message={fieldErrors.monto} />
            </div>

            <div className="field">
              <label className="fieldLabel" htmlFor="concepto-donacion">
                Concepto
              </label>
              <textarea
                id="concepto-donacion"
                className={`donaciones-textarea ${fieldErrors.concepto ? "is-invalid" : ""}`}
                placeholder="Propósito de la donación, campaña o acuerdo..."
                value={concepto}
                onChange={(e) => {
                  setConcepto(e.target.value);
                  clearFieldError("concepto");
                }}
                onBlur={() => handleBlurAbono("concepto")}
                rows={3}
                maxLength={500}
                aria-invalid={Boolean(fieldErrors.concepto)}
                aria-describedby={
                  fieldErrors.concepto ? "concepto-error concepto-count" : "concepto-count"
                }
              />
              <FieldError id="concepto-error" message={fieldErrors.concepto} />
              <p id="concepto-count" className="donaciones-char-count">
                {concepto.length}/500
              </p>
            </div>

            {fieldErrors.form && (
              <div className="estado-msg estado-error" role="alert">
                {fieldErrors.form}
              </div>
            )}
            {error && !fieldErrors.form && (
              <div className="estado-msg estado-error" role="alert">
                {error}
              </div>
            )}

            {guardado && (
              <div className="donaciones-exito" role="status">
                <CheckCircle2 size={18} aria-hidden="true" />
                <span>Donación registrada. El saldo del fondo se actualizó.</span>
              </div>
            )}

            <button type="submit" className="btnPrimary" disabled={guardando}>
              {guardando ? "Registrando..." : "Guardar donación"}
            </button>
          </form>
        )}

        <div className="recibos-card">
          {loading && movimientos.length === 0 ? (
            <Skeleton rows={5} />
          ) : movimientos.length === 0 ? (
            <div className="estado-msg">
              Sin movimientos registrados. Usa “Registrar donación” para agregar el primero.
            </div>
          ) : (
            <div className="table-wrap">
              <table className="recibos-table">
                <caption className="sr-only">
                  Historial de movimientos del fondo de donaciones
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Fecha</th>
                    <th scope="col">Tipo</th>
                    <th scope="col">Origen</th>
                    <th scope="col">Concepto</th>
                    <th className="text-right" scope="col">
                      Monto
                    </th>
                    <th className="text-right" scope="col">
                      Saldo
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.map((m) => {
                    const conceptoTexto = formatConcepto(m);
                    return (
                      <tr key={m.id_movimiento} className="recibo-row">
                        <td className="text-muted">{m.fecha}</td>
                        <td>
                          <span
                            className={`badge ${
                              m.tipo_movimiento === "abono"
                                ? "badge-donacion badge-donacion--abono"
                                : "badge-egreso badge-egreso--egreso"
                            }`}
                          >
                            {m.tipo_movimiento === "abono" ? "Abono" : "Egreso"}
                          </span>
                        </td>
                        <td>{formatOrigen(m)}</td>
                        <td className="donaciones-col-concepto">
                          <span className="donaciones-concepto-text" title={conceptoTexto}>
                            {conceptoTexto}
                          </span>
                        </td>
                        <MontoCell tipo={m.tipo_movimiento} monto={m.monto} />
                        <SaldoCell value={m.saldo_nuevo} />
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
