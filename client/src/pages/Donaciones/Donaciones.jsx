import { useState, useEffect, useMemo } from "react";
import { CheckCircle2, RefreshCw } from "lucide-react";
import SearchBar from "../../components/ui/SearchBar";
import useFondoDonaciones from "../../hooks/useFondoDonaciones";
import "../styles/Recibos.css";
import "../styles/BusquedaBeneficiarioVista.css";
import "../styles/Donaciones.css";

const fmt = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n ?? 0);

function ResumenCard({ label, value, sub, index = 0, loading = false }) {
  return (
    <div
      className="resumen-card recibos-fade-up"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <p className="resumen-label">{label}</p>
      {loading ? (
        <div className="donaciones-skeleton-value" aria-hidden="true" />
      ) : (
        <p className="resumen-value">{value}</p>
      )}
      {sub && !loading && <p className="resumen-sub">{sub}</p>}
    </div>
  );
}

function Skeleton({ rows = 4 }) {
  return (
    <div className="skeleton-wrap" role="status" aria-live="polite" aria-label="Cargando movimientos">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-row" style={{ animationDelay: `${i * 0.07}s` }} />
      ))}
    </div>
  );
}

export default function Donaciones() {
  const { saldo, movimientos, loading, error, fetchSaldo, fetchMovimientos, registrarAbono } =
    useFondoDonaciones();

  const [origenTipo, setOrigenTipo] = useState("");
  const [origenNombre, setOrigenNombre] = useState("");
  const [monto, setMonto] = useState("");
  const [concepto, setConcepto] = useState("");
  const [guardado, setGuardado] = useState(false);
  const [errorForm, setErrorForm] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  const montoNum = parseFloat(monto) || 0;

  const stats = useMemo(() => {
    const abonos = movimientos.filter((m) => m.tipo_movimiento === "abono");
    const egresos = movimientos.filter((m) => m.tipo_movimiento === "egreso");
    return { abonos: abonos.length, egresos: egresos.length };
  }, [movimientos]);

  useEffect(() => {
    fetchMovimientos().catch(() => {});
  }, [fetchMovimientos]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorForm(null);
    setGuardado(false);

    if (!origenTipo) {
      setErrorForm("Seleccione si la donación proviene de una marca o una familia.");
      return;
    }
    if (!origenNombre.trim()) {
      setErrorForm("Ingrese el nombre de la marca o familia.");
      return;
    }
    if (montoNum <= 0) {
      setErrorForm("El monto debe ser mayor a cero.");
      return;
    }
    if (!concepto.trim()) {
      setErrorForm("El concepto es obligatorio.");
      return;
    }

    setGuardando(true);
    try {
      await registrarAbono({
        monto: montoNum,
        origen_tipo: origenTipo,
        origen_nombre: origenNombre.trim(),
        concepto: concepto.trim(),
      });
      setGuardado(true);
      setOrigenTipo("");
      setOrigenNombre("");
      setMonto("");
      setConcepto("");
      await Promise.all([fetchSaldo(), fetchMovimientos()]);
    } catch (err) {
      setErrorForm(err.message || "Error al registrar la donación.");
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

  const origenLabel =
    origenTipo === "marca"
      ? "Marca o empresa"
      : origenTipo === "familia"
      ? "Familia"
      : "Origen";

  return (
    <main className="recibos-page donaciones-page" aria-labelledby="donaciones-page-title">
      <header className="recibos-header page-header recibos-fade-panel">
        <div className="recibos-heading">
          <h1 id="donaciones-page-title" className="page-header-title">
            Fondo de Donaciones
          </h1>
          <p className="page-header-subtitle">
            Abonos al fondo global y consulta de movimientos para pagar servicios.
          </p>
        </div>
      </header>

      <div className="resumen-strip donaciones-resumen-strip recibos-fade-panel">
        <ResumenCard
          label="Saldo disponible"
          value={fmt(saldo?.saldo)}
          sub="Para cubrir servicios con donación"
          index={0}
          loading={loading && !saldo}
        />
        <ResumenCard
          label="Abonos registrados"
          value={stats.abonos}
          sub="Entradas al fondo global"
          index={1}
          loading={loading && movimientos.length === 0}
        />
        <ResumenCard
          label="Egresos por servicios"
          value={stats.egresos}
          sub="Pagos aplicados desde el fondo"
          index={2}
          loading={loading && movimientos.length === 0}
        />
      </div>

      <div className="donaciones-layout">
        <section
          className="recibos-section recibos-fade-panel"
          aria-labelledby="donaciones-form-title"
        >
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
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={origenTipo === "marca"}
                    className={`recibos-tab ${origenTipo === "marca" ? "is-active" : ""}`}
                    onClick={() => setOrigenTipo("marca")}
                  >
                    Marca / empresa
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={origenTipo === "familia"}
                    className={`recibos-tab ${origenTipo === "familia" ? "is-active" : ""}`}
                    onClick={() => setOrigenTipo("familia")}
                  >
                    Familia
                  </button>
                </div>
              </div>
            </div>

            <div className="field">
              <label className="fieldLabel" htmlFor="origen-nombre">
                Nombre de {origenLabel.toLowerCase()}
              </label>
              <SearchBar
                id="origen-nombre"
                placeholder="Ej. Fundación XYZ o Familia García"
                value={origenNombre}
                onChange={setOrigenNombre}
                debounceMs={0}
              />
            </div>

            <div className="field">
              <label className="fieldLabel" htmlFor="monto-donacion">
                Monto
              </label>
              <SearchBar
                id="monto-donacion"
                placeholder="0.00"
                value={monto}
                onChange={setMonto}
                debounceMs={0}
                prefix="$"
                className="search-finanzas"
              />
            </div>

            <div className="field">
              <label className="fieldLabel" htmlFor="concepto-donacion">
                Concepto
              </label>
              <textarea
                id="concepto-donacion"
                className="donaciones-textarea"
                placeholder="Propósito de la donación, campaña o acuerdo..."
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                rows={3}
                maxLength={500}
                aria-describedby="concepto-count"
              />
              <p id="concepto-count" className="donaciones-char-count">
                {concepto.length}/500
              </p>
            </div>

            {errorForm && (
              <div className="estado-msg estado-error" role="alert">
                {errorForm}
              </div>
            )}
            {error && !errorForm && (
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

            <button type="submit" className="btnPrimary" disabled={guardando || loading}>
              {guardando ? "Registrando..." : "Registrar donación"}
            </button>
          </form>
        </section>

        <section
          className="recibos-section recibos-fade-panel"
          aria-labelledby="donaciones-historial-title"
        >
          <div className="section-title-row">
            <div>
              <h2 id="donaciones-historial-title" className="section-title">
                Movimientos recientes
              </h2>
              <p className="section-sub">Abonos y egresos del fondo global.</p>
            </div>
            <button
              type="button"
              className="btnSecondary"
              onClick={cargarHistorial}
              disabled={cargandoHistorial || loading}
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
                    {movimientos.map((m, index) => (
                      <tr
                        key={m.id_movimiento}
                        className="recibo-row recibos-fade-up"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="text-muted">{m.fecha}</td>
                        <td>
                          <span
                            className={`badge ${
                              m.tipo_movimiento === "abono"
                                ? "badge-donacion"
                                : "badge-egreso"
                            }`}
                          >
                            {m.tipo_movimiento === "abono" ? "Abono" : "Egreso"}
                          </span>
                        </td>
                        <td>
                          {m.origen_tipo
                            ? `${m.origen_tipo === "marca" ? "Marca" : "Familia"}: ${m.origen_nombre}`
                            : "—"}
                        </td>
                        <td className="donaciones-col-concepto" title={m.concepto || m.motivo || ""}>
                          {m.concepto || m.motivo || "—"}
                        </td>
                        <td
                          className={`text-right donaciones-monto--${m.tipo_movimiento}`}
                        >
                          {m.tipo_movimiento === "egreso" ? "− " : "+ "}
                          {fmt(m.monto)}
                        </td>
                        <td className="text-right">{fmt(m.saldo_nuevo)}</td>
                      </tr>
                    ))}
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
