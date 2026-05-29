import { useState, useEffect, useMemo, useCallback } from "react";
import { CheckCircle2, RefreshCw } from "lucide-react";
import useFondoDonaciones from "../../hooks/useFondoDonaciones";
import "../styles/Recibos.css";
import "../styles/BusquedaBeneficiarioVista.css";
import "../styles/Donaciones.css";

const fmt = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n ?? 0);

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

function validateField(name, { origenTipo, origenNombre, monto, concepto }) {
  switch (name) {
    case "origenTipo":
      return origenTipo ? "" : "Seleccione si la donación proviene de una marca o una familia.";
    case "origenNombre":
      return origenNombre.trim() ? "" : "Ingrese el nombre de la marca o familia.";
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

function validateAll(values) {
  const fields = ["origenTipo", "origenNombre", "monto", "concepto"];
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
    const folio = m.folio_servicio ?? m.id_servicio_otorgado;
    return folio ? `Servicio #${folio}` : "Servicio";
  }
  if (m.origen_tipo) {
    const label = m.origen_tipo === "marca" ? "Marca" : "Familia";
    return `${label}: ${m.origen_nombre}`;
  }
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
  const { saldo, movimientos, loading, error, fetchSaldo, fetchMovimientos, registrarAbono } =
    useFondoDonaciones();

  const [origenTipo, setOrigenTipo] = useState("");
  const [origenNombre, setOrigenNombre] = useState("");
  const [monto, setMonto] = useState("");
  const [concepto, setConcepto] = useState("");
  const [guardado, setGuardado] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  const formValues = useMemo(
    () => ({ origenTipo, origenNombre, monto, concepto }),
    [origenTipo, origenNombre, monto, concepto]
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

  const handleBlur = (name) => {
    const message = validateField(name, formValues);
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });
  };

  const handleOrigenTipo = (tipo) => {
    setOrigenTipo(tipo);
    clearFieldError("origenTipo");
    if (fieldErrors.origenNombre) handleBlur("origenNombre");
  };

  const handleTabKeyDown = (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    handleOrigenTipo(origenTipo === "marca" ? "familia" : "marca");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardado(false);

    const errors = validateAll(formValues);
    const hasErrors = Object.values(errors).some(Boolean);
    setFieldErrors(errors);
    if (hasErrors) return;

    setGuardando(true);
    try {
      await registrarAbono({
        monto: parseFloat(monto),
        origen_tipo: origenTipo,
        origen_nombre: origenNombre.trim(),
        concepto: concepto.trim(),
      });
      setGuardado(true);
      setOrigenTipo("");
      setOrigenNombre("");
      setMonto("");
      setConcepto("");
      setFieldErrors({});
      await Promise.all([fetchSaldo(), fetchMovimientos()]);
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

  const origenNombreLabel =
    origenTipo === "marca"
      ? "Nombre de la marca o empresa"
      : origenTipo === "familia"
      ? "Nombre de la familia"
      : "Nombre de la marca o familia";

  const saldoLoading = loading && !saldo;

  return (
    <main className="recibos-page donaciones-page" aria-labelledby="donaciones-page-title">
      <header className="recibos-header page-header donaciones-header">
        <div className="recibos-heading">
          <h1 id="donaciones-page-title" className="page-header-title">
            Fondo de Donaciones
          </h1>
          <p className="page-header-subtitle">
            Registre abonos y consulte movimientos para cubrir servicios con donación.
          </p>
        </div>
        <div className="donaciones-saldo" aria-live="polite">
          <span className="donaciones-saldo-label">Saldo disponible</span>
          {saldoLoading ? (
            <div className="donaciones-skeleton-value" aria-hidden="true" />
          ) : (
            <span className="donaciones-saldo-value">{fmt(saldo?.saldo)}</span>
          )}
        </div>
      </header>

      <div className="donaciones-layout">
        <section className="recibos-section" aria-labelledby="donaciones-form-title">
          <div className="section-title-row">
            <div>
              <h2 id="donaciones-form-title" className="section-title">
                Registrar donación
              </h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="donaciones-form" noValidate>
            <div className="field">
              <span className="fieldLabel" id="origen-tipo-label">
                Tipo de origen
              </span>
              <div className="recibos-tabs-wrap donaciones-tabs-wrap">
                <div
                  className="recibos-tabs"
                  role="tablist"
                  aria-labelledby="origen-tipo-label"
                  aria-describedby={fieldErrors.origenTipo ? "origen-tipo-error" : undefined}
                  onKeyDown={handleTabKeyDown}
                >
                  <button
                    type="button"
                    role="tab"
                    id="origen-tab-marca"
                    aria-selected={origenTipo === "marca"}
                    aria-controls="origen-nombre"
                    tabIndex={origenTipo === "marca" || !origenTipo ? 0 : -1}
                    className={`recibos-tab ${origenTipo === "marca" ? "is-active" : ""} ${
                      fieldErrors.origenTipo ? "is-invalid" : ""
                    }`}
                    onClick={() => handleOrigenTipo("marca")}
                  >
                    Marca / empresa
                  </button>
                  <button
                    type="button"
                    role="tab"
                    id="origen-tab-familia"
                    aria-selected={origenTipo === "familia"}
                    aria-controls="origen-nombre"
                    tabIndex={origenTipo === "familia" ? 0 : -1}
                    className={`recibos-tab ${origenTipo === "familia" ? "is-active" : ""} ${
                      fieldErrors.origenTipo ? "is-invalid" : ""
                    }`}
                    onClick={() => handleOrigenTipo("familia")}
                  >
                    Familia
                  </button>
                </div>
              </div>
              <FieldError id="origen-tipo-error" message={fieldErrors.origenTipo} />
            </div>

            <div className="field">
              <label className="fieldLabel" htmlFor="origen-nombre">
                {origenNombreLabel}
              </label>
              <input
                id="origen-nombre"
                type="text"
                className={`input donaciones-input ${fieldErrors.origenNombre ? "is-invalid" : ""}`}
                placeholder="Ej. Fundación XYZ o Familia García"
                value={origenNombre}
                onChange={(e) => {
                  setOrigenNombre(e.target.value);
                  clearFieldError("origenNombre");
                }}
                onBlur={() => handleBlur("origenNombre")}
                aria-invalid={Boolean(fieldErrors.origenNombre)}
                aria-describedby={fieldErrors.origenNombre ? "origen-nombre-error" : undefined}
                autoComplete="organization"
              />
              <FieldError id="origen-nombre-error" message={fieldErrors.origenNombre} />
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
                  onBlur={() => handleBlur("monto")}
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
                onBlur={() => handleBlur("concepto")}
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
              {guardando ? "Registrando..." : "Registrar donación"}
            </button>
          </form>
        </section>

        <section className="recibos-section" aria-labelledby="donaciones-historial-title">
          <div className="section-title-row">
            <div>
              <h2 id="donaciones-historial-title" className="section-title">
                Movimientos recientes
              </h2>
              <p className="section-sub">
                Abonos y egresos del fondo global
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

          <div className="recibos-card">
            {loading && movimientos.length === 0 ? (
              <Skeleton rows={5} />
            ) : movimientos.length === 0 ? (
              <div className="estado-msg">
                Sin movimientos registrados. Registre la primera donación para abastecer el fondo.
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
                                m.tipo_movimiento === "abono" ? "badge-donacion" : "badge-egreso"
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
                          <td className={`text-right donaciones-monto--${m.tipo_movimiento}`}>
                            {m.tipo_movimiento === "egreso" ? "− " : "+ "}
                            {fmt(m.monto)}
                          </td>
                          <td className="text-right">{fmt(m.saldo_nuevo)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
