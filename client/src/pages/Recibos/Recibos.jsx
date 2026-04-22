import { useState, useEffect, useCallback } from "react";
import "../styles/Recibos.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const fmt = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n ?? 0);

const fmtFecha = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
};

const hoy = () => new Date().toISOString().split("T")[0];

// Loader
function Skeleton({ rows = 4 }) {
  return (
    <div className="skeleton-wrap">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-row" style={{ animationDelay: `${i * 0.07}s` }} />
      ))}
    </div>
  );
}

// Método de pago
function PagoBadge({ metodo }) {
  const map = {
    efectivo: { label: "Efectivo", cls: "badge-efectivo" },
    tarjeta:  { label: "Tarjeta",  cls: "badge-tarjeta" },
    donacion: { label: "Donación", cls: "badge-donacion" },
  };
  const { label, cls } = map[metodo] ?? { label: metodo, cls: "" };
  return <span className={`badge ${cls}`}>{label}</span>;
}

// Detalles
function ReciboDetalle({ recibo, onClose }) {
  if (!recibo) return null;

  const totalInventario = recibo.items_inventario?.reduce((s, i) => s + Number(i.subtotal), 0) ?? 0;

  return (
    <div className="detalle-overlay" onClick={onClose}>
      <div className="detalle-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="detalle-header">
          <div>
            <p className="detalle-folio">Folio #{recibo.id_servicio_otorgado}</p>
            <h2 className="detalle-nombre">{recibo.beneficiario}</h2>
            <p className="detalle-meta">
              {recibo.servicio} · {fmtFecha(recibo.fecha)} {recibo.hora}
            </p>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {/* Inventario */}
        {recibo.items_inventario?.length > 0 && (
          <section className="detalle-section">
            <h3 className="detalle-section-title">Artículos de inventario</h3>
            <table className="detalle-table">
              <thead>
                <tr>
                  <th>Artículo</th>
                  <th className="text-right">Cant.</th>
                  <th className="text-right">P. Unit.</th>
                  <th className="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {recibo.items_inventario.map((item) => (
                  <tr key={item.id_venta_inventario}>
                    <td>{item.nombre_articulo}</td>
                    <td className="text-right">{item.cantidad}</td>
                    <td className="text-right">{fmt(item.precio_unitario)}</td>
                    <td className="text-right">{fmt(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Resumen financiero */}
        <section className="detalle-section">
          <h3 className="detalle-section-title">Resumen financiero</h3>
          <div className="detalle-financiero">
            <div className="fin-row">
              <span>Monto servicio</span>
              <span>{fmt(recibo.financiero?.monto_servicio)}</span>
            </div>
            {totalInventario > 0 && (
              <div className="fin-row">
                <span>Inventario</span>
                <span>{fmt(totalInventario)}</span>
              </div>
            )}
            {recibo.financiero?.descuento > 0 && (
              <div className="fin-row fin-descuento">
                <span>Descuento</span>
                <span>− {fmt(recibo.financiero.descuento)}</span>
              </div>
            )}
            <div className="fin-row fin-total">
              <span>Total</span>
              <span>{fmt(recibo.financiero?.cuota_total)}</span>
            </div>
            <div className="fin-row fin-pagado">
              <span>Pagado</span>
              <span>{fmt(recibo.financiero?.monto_pagado)}</span>
            </div>
          </div>
          {recibo.financiero?.metodo_pago && (
            <div style={{ marginTop: 12 }}>
              <PagoBadge metodo={recibo.financiero.metodo_ago ?? recibo.financiero.metodo_pago} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// Tabla de recibos
function ReciboRow({ recibo, onClick }) {
  return (
    <tr className="recibo-row" onClick={() => onClick(recibo)}>
      <td className="td-folio">#{recibo.id_servicio_otorgado}</td>
      <td>{recibo.beneficiario}</td>
      <td>{recibo.servicio}</td>
      <td>{recibo.hora}</td>
      <td className="text-right">{fmt(recibo.financiero?.cuota_total)}</td>
      <td className="text-right">{fmt(recibo.financiero?.monto_pagado)}</td>
      <td>
        {recibo.financiero?.metodo_pago
          ? <PagoBadge metodo={recibo.financiero.metodo_pago} />
          : <span className="text-muted">—</span>}
      </td>
    </tr>
  );
}

// Resumen
function ResumenCard({ label, value, sub }) {
  return (
    <div className="resumen-card">
      <p className="resumen-label">{label}</p>
      <p className="resumen-value">{value}</p>
      {sub && <p className="resumen-sub">{sub}</p>}
    </div>
  );
}

// Página principal
export default function Recibos() {
  const [fecha,     setFecha]     = useState(hoy());
  const [recibos,   setRecibos]   = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [busqueda,  setBusqueda]  = useState("");
  const [seleccion, setSeleccion] = useState(null);

  const cargar = useCallback(async (f) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/recibos?fecha=${f}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setRecibos(data);
    } catch (e) {
      setError(e.message || "No se pudo cargar la información.");
      setRecibos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(fecha); }, [fecha, cargar]);

  const filtrados = recibos.filter((r) => {
    const q = busqueda.toLowerCase();
    return (
      !q ||
      r.beneficiario?.toLowerCase().includes(q) ||
      r.servicio?.toLowerCase().includes(q) ||
      String(r.id_servicio_otorgado).includes(q)
    );
  });

  const totalDia   = filtrados.reduce((s, r) => s + Number(r.financiero?.cuota_total  ?? 0), 0);
  const totalPagado= filtrados.reduce((s, r) => s + Number(r.financiero?.monto_pagado ?? 0), 0);

  return (
    <div className="recibos-page">
      {/* Encabezado*/}
      <header className="recibos-header">
        <div>
          <h1 className="recibos-title">Recibos</h1>
          <p className="recibos-subtitle">Registro de servicios y cobros por fecha</p>
        </div>
      </header>

      {/* Controles*/}
      <div className="recibos-toolbar">
        <div className="search-wrap">
          <span className="search-icon">⌕</span>
          <input
            className="search-input"
            type="text"
            placeholder="Buscar beneficiario, servicio o folio…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="fecha-wrap">
          <span className="fecha-label">Fecha</span>
          <input
            className="fecha-input"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
          <button className="btn-hoy" onClick={() => setFecha(hoy())}>Hoy</button>
        </div>
      </div>

      {/* Resumen del día */}
      {!loading && filtrados.length > 0 && (
        <div className="resumen-strip">
          <ResumenCard label="Recibos del día" value={filtrados.length} sub={fmtFecha(fecha)} />
          <ResumenCard label="Total facturado"  value={fmt(totalDia)} />
          <ResumenCard label="Total cobrado"    value={fmt(totalPagado)} />
          <ResumenCard
            label="Diferencia"
            value={fmt(totalDia - totalPagado)}
            sub={totalDia - totalPagado > 0 ? "pendiente" : "al corriente"}
          />
        </div>
      )}

      {/* Tabla */}
      <div className="recibos-card">
        {loading ? (
          <Skeleton rows={5} />
        ) : error ? (
          <div className="estado-msg estado-error">⚠ {error}</div>
        ) : filtrados.length === 0 ? (
          <div className="estado-msg">Sin recibos para esta fecha.</div>
        ) : (
          <div className="table-wrap">
            <table className="recibos-table">
              <thead>
                <tr>
                  <th>Folio</th>
                  <th>Beneficiario</th>
                  <th>Servicio</th>
                  <th>Hora</th>
                  <th className="text-right">Total</th>
                  <th className="text-right">Pagado</th>
                  <th>Método</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((r) => (
                  <ReciboRow key={r.id_servicio_otorgado} recibo={r} onClick={setSeleccion} />
                ))}
              </tbody>
            </table>
            <p className="tabla-footer">
              Mostrando {filtrados.length} de {recibos.length} recibos · {fmtFecha(fecha)}
            </p>
          </div>
        )}
      </div>

      {/* Panel de detalle */}
      <ReciboDetalle recibo={seleccion} onClose={() => setSeleccion(null)} />
    </div>
  );
}