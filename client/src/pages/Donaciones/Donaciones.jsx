import { useState, useEffect } from "react";
import { Heart, AlertTriangle, CheckCircle2 } from "lucide-react";
import Dropdown from "../../components/ui/Dropdown";
import SearchBar from "../../components/ui/SearchBar";
import useFondoDonaciones from "../../hooks/useFondoDonaciones";
import "../styles/Donaciones.css";

const UMBRAL_REVISION = 10000;

const ORIGEN_OPTIONS = [
  { label: "Seleccionar origen...", value: "" },
  { label: "Marca / empresa", value: "marca" },
  { label: "Familia", value: "familia" },
];

const fmt = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n ?? 0);

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

  const montoNum = parseFloat(monto) || 0;
  const requiereRevision = montoNum > UMBRAL_REVISION;

  useEffect(() => {
    fetchMovimientos().catch(() => {});
  }, [fetchMovimientos]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorForm(null);
    setGuardado(false);

    if (!origenTipo) {
      setErrorForm("Seleccione el tipo de origen (marca o familia).");
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

  const cargarHistorial = () => {
    fetchMovimientos().catch(() => {});
  };

  return (
    <main className="donaciones-page">
      <header className="donaciones-header page-header">
        <div>
          <h1 className="page-header-title">Fondo de Donaciones</h1>
          <p className="page-header-subtitle">
            Registre abonos al fondo global y consulte movimientos recientes.
          </p>
        </div>
        <div className="donaciones-saldo-card">
          <Heart size={24} color="#166534" />
          <div>
            <p className="donaciones-saldo-label">Saldo disponible</p>
            <p className="donaciones-saldo-value">{fmt(saldo?.saldo)}</p>
          </div>
        </div>
      </header>

      <div className="donaciones-grid">
        <section className="donaciones-form-card">
          <h2>Registrar donación</h2>
          <p className="donaciones-form-sub">
            Capture donaciones de marcas o familias. Montos mayores a {fmt(UMBRAL_REVISION)} quedan
            marcados para revisión.
          </p>

          {requiereRevision && (
            <div className="donaciones-alerta" role="alert">
              <AlertTriangle size={18} />
              <span>
                Esta donación supera {fmt(UMBRAL_REVISION)} y se registrará con bandera de revisión.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="donaciones-form">
            <div className="donaciones-field">
              <label>Tipo de origen</label>
              <Dropdown
                options={ORIGEN_OPTIONS}
                value={origenTipo}
                onChange={setOrigenTipo}
                className="dropdown-servicios"
              />
            </div>

            <div className="donaciones-field">
              <label>Nombre de {origenTipo === "marca" ? "marca / empresa" : origenTipo === "familia" ? "familia" : "origen"}</label>
              <SearchBar
                placeholder="Ej. Fundación XYZ o Familia García"
                value={origenNombre}
                onChange={setOrigenNombre}
                debounceMs={0}
              />
            </div>

            <div className="donaciones-field">
              <label>Monto</label>
              <SearchBar
                placeholder="0.00"
                value={monto}
                onChange={setMonto}
                debounceMs={0}
                prefix="$"
                className="search-finanzas"
              />
            </div>

            <div className="donaciones-field">
              <label>Concepto</label>
              <textarea
                className="donaciones-textarea"
                placeholder="Describa el propósito de la donación..."
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                rows={3}
                maxLength={500}
              />
            </div>

            {errorForm && <p className="donaciones-error">{errorForm}</p>}
            {error && !errorForm && <p className="donaciones-error">{error}</p>}

            {guardado && (
              <div className="donaciones-exito">
                <CheckCircle2 size={18} />
                <span>Donación registrada correctamente.</span>
              </div>
            )}

            <button type="submit" className="btnPrimary" disabled={guardando || loading}>
              {guardando ? "Registrando..." : "Registrar donación"}
            </button>
          </form>
        </section>

        <section className="donaciones-historial-card">
          <div className="donaciones-historial-header">
            <h2>Movimientos recientes</h2>
            <button type="button" className="btnSecondary" onClick={cargarHistorial}>
              Actualizar
            </button>
          </div>

          {movimientos.length === 0 ? (
            <p className="donaciones-empty">Sin movimientos registrados.</p>
          ) : (
            <div className="donaciones-table-wrap">
              <table className="donaciones-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Origen</th>
                    <th>Concepto</th>
                    <th className="text-right">Monto</th>
                    <th className="text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.map((m) => (
                    <tr key={m.id_movimiento}>
                      <td>{m.fecha}</td>
                      <td>
                        <span className={`donaciones-badge donaciones-badge--${m.tipo_movimiento}`}>
                          {m.tipo_movimiento === "abono" ? "Abono" : "Egreso"}
                        </span>
                        {m.requiere_revision && (
                          <span className="donaciones-badge donaciones-badge--revision" title="Requiere revisión">
                            &gt;10k
                          </span>
                        )}
                      </td>
                      <td>
                        {m.origen_tipo
                          ? `${m.origen_tipo === "marca" ? "Marca" : "Familia"}: ${m.origen_nombre}`
                          : "—"}
                      </td>
                      <td>{m.concepto || m.motivo || "—"}</td>
                      <td className="text-right">{fmt(m.monto)}</td>
                      <td className="text-right">{fmt(m.saldo_nuevo)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
