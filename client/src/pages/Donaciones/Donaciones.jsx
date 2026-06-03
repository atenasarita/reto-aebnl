import { useState, useEffect, useMemo, useCallback } from "react";
import { CheckCircle2, RefreshCw } from "lucide-react";
import useFondoDonaciones from "../../hooks/useFondoDonaciones";
import "../styles/Recibos.css";
import "../styles/OperationalPage.css";
import "../styles/RegistroServicio.css";
import "../styles/Donaciones.css";
import PropTypes from "prop-types";

const fmt = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n ?? 0);

function Skeleton({ rows = 4 }) {
  const skeletonRows = Array.from({ length: rows }, (_, index) => `skeleton-row-${index}`);

  return (
    <div
      className="skeleton-wrap"
      role="status"
      aria-live="polite"
      aria-label="Cargando movimientos"
    >
      {skeletonRows.map((rowKey) => (
        <div key={rowKey} className="skeleton-row" />
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
      const n = Number.parseFloat(monto);
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

function SaldoCard({ loading, saldo }) {
  const saldoLoading = loading && !saldo;

  return (
    <div className="donaciones-saldo" aria-live="polite">
      <span className="donaciones-saldo-label">Saldo disponible</span>
      {saldoLoading ? (
        <div className="donaciones-skeleton-value" aria-hidden="true" />
      ) : (
        <span className="donaciones-saldo-value">{fmt(saldo?.saldo)}</span>
      )}
    </div>
  );
}

function MovimientosTable({ loading, movimientos }) {
  if (loading && movimientos.length === 0) {
    return <Skeleton rows={5} />;
  }

  if (movimientos.length === 0) {
    return (
      <div className="estado-msg">
        Sin movimientos registrados. Usa “Registrar donación” para agregar el primero.
      </div>
    );
  }

  return (
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
            <th className="text-right" scope="col">Monto</th>
            <th className="text-right" scope="col">Saldo</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.map((movimiento) => (
            <MovimientoRow key={movimiento.id_movimiento} movimiento={movimiento} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MovimientoRow({ movimiento }) {
  const conceptoTexto = formatConcepto(movimiento);
  const esEgreso = movimiento.tipo_movimiento === "egreso";

  return (
    <tr className="recibo-row">
      <td className="text-muted">{movimiento.fecha}</td>
      <td>
        <span className={`badge ${esEgreso ? "badge-egreso" : "badge-donacion"}`}>
          {esEgreso ? "Egreso" : "Abono"}
        </span>
      </td>
      <td>{formatOrigen(movimiento)}</td>
      <td className="donaciones-col-concepto">
        <span className="donaciones-concepto-text" title={conceptoTexto}>
          {conceptoTexto}
        </span>
      </td>
      <td className={`text-right donaciones-monto--${movimiento.tipo_movimiento}`}>
        {esEgreso ? "− " : "+ "}
        {fmt(movimiento.monto)}
      </td>
      <td className="text-right">{fmt(movimiento.saldo_nuevo)}</td>
    </tr>
  );
}

function HistorialSubtitle({ loading, movimientos, stats }) {
  if (loading || movimientos.length === 0) {
    return (
      <p className="section-sub">
        Abonos y egresos del fondo global.
      </p>
    );
  }

  return (
    <p className="section-sub">
      Abonos y egresos del fondo global · {stats.abonos}{" "}
      {stats.abonos === 1 ? "abono" : "abonos"} · {stats.egresos}{" "}
      {stats.egresos === 1 ? "egreso" : "egresos"}.
    </p>
  );
}

function DonacionForm({
  fieldErrors,
  origenTipo,
  origenNombre,
  monto,
  concepto,
  guardado,
  guardando,
  error,
  origenNombreLabel,
  handleSubmit,
  handleTabKeyDown,
  handleOrigenTipo,
  setOrigenNombre,
  setMonto,
  setConcepto,
  clearFieldError,
  handleBlur
}) {
  return (
    <form
      id="donaciones-registro-form"
      onSubmit={handleSubmit}
      className="donaciones-form donaciones-form-panel"
      noValidate
    >
      <div className="field">
        <span className="fieldLabel" id="origen-tipo-label">
          Tipo de origen
        </span>

        <div className="recibos-tabs-wrap donaciones-tabs-wrap">
          <div
            className="recibos-tabs recibos-tabs--two"
            role="tablist"
            aria-labelledby="origen-tipo-label"
            aria-describedby={fieldErrors.origenTipo ? "origen-tipo-error" : undefined}
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
          onKeyDown={handleTabKeyDown}
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
          onKeyDown={handleTabKeyDown}
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
        <output className="donaciones-exito">
          <CheckCircle2 size={18} aria-hidden="true" />
          <span>Donación registrada. El saldo del fondo se actualizó.</span>
        </output>
      )}

      <button type="submit" className="btnPrimary" disabled={guardando}>
        {guardando ? "Registrando..." : "Guardar donación"}
      </button>
    </form>
  );
}

function getOrigenNombreLabel(origenTipo) {
  if (origenTipo === "marca") {
    return "Nombre de la marca o empresa";
  }

  if (origenTipo === "familia") {
    return "Nombre de la familia";
  }

  return "Nombre de la marca o familia";
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
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

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
        monto: Number.parseFloat(monto),
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
      setMostrarFormulario(false);
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

  const origenNombreLabel = getOrigenNombreLabel(origenTipo);
    
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
        <SaldoCard loading={loading} saldo={saldo} />
      </header>

      <section className="recibos-section" aria-labelledby="donaciones-historial-title">
        <div className="section-title-row">
          <div>
            <h2 id="donaciones-historial-title" className="section-title">
              Historial de donaciones
            </h2>
              <HistorialSubtitle loading={loading} movimientos={movimientos} stats={stats} />
          </div>
          <div className="donaciones-actions">
            <button
              type="button"
              className="btnPrimary"
              onClick={() => setMostrarFormulario((prev) => !prev)}
              aria-expanded={mostrarFormulario}
              aria-controls="donaciones-registro-form"
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
          <DonacionForm
            fieldErrors={fieldErrors}
            origenTipo={origenTipo}
            origenNombre={origenNombre}
            monto={monto}
            concepto={concepto}
            guardado={guardado}
            guardando={guardando}
            error={error}
            origenNombreLabel={origenNombreLabel}
            handleSubmit={handleSubmit}
            handleTabKeyDown={handleTabKeyDown}
            handleOrigenTipo={handleOrigenTipo}
            setOrigenNombre={setOrigenNombre}
            setMonto={setMonto}
            setConcepto={setConcepto}
            clearFieldError={clearFieldError}
            handleBlur={handleBlur}
          />

        )}

        <div className="recibos-card">
            <MovimientosTable loading={loading} movimientos={movimientos} />
        </div>
      </section>
    </main>
  );
}

Skeleton.propTypes = {
  rows: PropTypes.number,
};

FieldError.propTypes = {
  id: PropTypes.string.isRequired,
  message: PropTypes.string,
};

SaldoCard.propTypes = {
  loading: PropTypes.bool.isRequired,
  saldo: PropTypes.shape({
    saldo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
};

MovimientosTable.propTypes = {
  loading: PropTypes.bool.isRequired,
  movimientos: PropTypes.arrayOf(
    PropTypes.shape({
      id_movimiento: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      fecha: PropTypes.string,
      tipo_movimiento: PropTypes.string,
      origen_tipo: PropTypes.string,
      origen_nombre: PropTypes.string,
      concepto: PropTypes.string,
      motivo: PropTypes.string,
      monto: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      saldo_nuevo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      folio_servicio: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      id_servicio_otorgado: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      servicio_nombre: PropTypes.string,
    })
  ).isRequired,
};

MovimientoRow.propTypes = {
  movimiento: PropTypes.shape({
    id_movimiento: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    fecha: PropTypes.string,
    tipo_movimiento: PropTypes.string,
    origen_tipo: PropTypes.string,
    origen_nombre: PropTypes.string,
    concepto: PropTypes.string,
    motivo: PropTypes.string,
    monto: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    saldo_nuevo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    folio_servicio: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    id_servicio_otorgado: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    servicio_nombre: PropTypes.string,
  }).isRequired,
};

HistorialSubtitle.propTypes = {
  loading: PropTypes.bool.isRequired,
  movimientos: PropTypes.array.isRequired,
  stats: PropTypes.shape({
    abonos: PropTypes.number.isRequired,
    egresos: PropTypes.number.isRequired,
  }).isRequired,
};

DonacionForm.propTypes = {
  fieldErrors: PropTypes.object.isRequired,
  origenTipo: PropTypes.string.isRequired,
  origenNombre: PropTypes.string.isRequired,
  monto: PropTypes.string.isRequired,
  concepto: PropTypes.string.isRequired,
  guardado: PropTypes.bool.isRequired,
  guardando: PropTypes.bool.isRequired,
  error: PropTypes.string,
  origenNombreLabel: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleTabKeyDown: PropTypes.func.isRequired,
  handleOrigenTipo: PropTypes.func.isRequired,
  setOrigenNombre: PropTypes.func.isRequired,
  setMonto: PropTypes.func.isRequired,
  setConcepto: PropTypes.func.isRequired,
  clearFieldError: PropTypes.func.isRequired,
  handleBlur: PropTypes.func.isRequired,
};
