import { useState, useEffect, useCallback } from "react";
import "../styles/Recibos.css";

const API_BASE = import.meta.env.VITE_API_URL || "https://reto-aebnl-production.up.railway.app";

const fmt = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n ?? 0);

const fmtFecha = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
};
 
const fmtMes = (iso) => {
  if (!iso) return "";
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
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

  const totalInv = recibo.items_inventario?.reduce((s, i) => s + Number(i.subtotal), 0) ?? 0;

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
            {totalInv > 0 && (
              <div className="fin-row">
                <span>Inventario</span>
                <span>{fmt(totalInv)}</span>
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
              <PagoBadge metodo={recibo.financiero.metodo_pago} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// Tabla de recibos
function ReciboRow({ recibo, onVerDetalle, mostrarFecha = false }) {
  return (
    <tr className="recibo-row">
      <td className="td-folio">#{recibo.id_servicio_otorgado}</td>
      <td>{recibo.beneficiario}</td>
      <td>{recibo.servicio}</td>
      {mostrarFecha && <td>{fmtFecha(recibo.fecha)}</td>}
      <td>{recibo.hora}</td>
      <td className="text-right">{fmt(recibo.financiero?.cuota_total)}</td>
      <td className="text-right">{fmt(recibo.financiero?.monto_pagado)}</td>
      <td>
        {recibo.financiero?.metodo_pago
          ? <PagoBadge metodo={recibo.financiero.metodo_pago} />
          : <span className="text-muted">—</span>}
      </td>
      <td>
        <button className="btn-ver" onClick={() => onVerDetalle(recibo)}>
          Ver
        </button>
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

// Tabla de recibos
function TablaRecibos({ recibos, loading, error, onVerDetalle, mostrarFecha = false, emptyMsg }) {
  if (loading) return <Skeleton rows={4} />;
  if (error)   return <div className="estado-msg estado-error">⚠ {error}</div>;
  if (!recibos.length) return <div className="estado-msg">{emptyMsg}</div>;
 
  return (
    <div className="table-wrap">
      <table className="recibos-table">
        <thead>
          <tr>
            <th>Folio</th>
            <th>Beneficiario</th>
            <th>Servicio</th>
            {mostrarFecha && <th>Fecha</th>}
            <th>Hora</th>
            <th className="text-right">Total</th>
            <th className="text-right">Pagado</th>
            <th>Método</th>
            <th>Detalles</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {recibos.map((r) => (
            <ReciboRow
              key={r.id_servicio_otorgado}
              recibo={r}
              onVerDetalle={onVerDetalle}
              mostrarFecha={mostrarFecha}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Página principal
export default function Recibos() {
  const [fecha,        setFecha]        = useState(hoy());
  const [busquedaDia,  setBusquedaDia]  = useState("");
  const [busquedaMes,  setBusquedaMes]  = useState("");
 
  const [recibosDay,   setRecibosDay]   = useState([]);
  const [loadingDay,   setLoadingDay]   = useState(false);
  const [errorDay,     setErrorDay]     = useState("");
 
  const [recibosMes,   setRecibosMes]   = useState([]);
  const [loadingMes,   setLoadingMes]   = useState(false);
  const [errorMes,     setErrorMes]     = useState("");
 
  const [seleccion,    setSeleccion]    = useState(null);
 
  const cargarDia = useCallback(async (f) => {
    setLoadingDay(true); setErrorDay("");
    try {
      const res = await fetch(`${API_BASE}/api/recibos?fecha=${f}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setRecibosDay(await res.json());
    } catch (e) {
      setErrorDay(e.message || "No se pudo cargar."); setRecibosDay([]);
    } finally { setLoadingDay(false); }
  }, []);
 
  const cargarMes = useCallback(async (f) => {
    setLoadingMes(true); setErrorMes("");
    try {
      const mes = f.slice(0, 7);
      const res = await fetch(`${API_BASE}/api/recibos/resumen-mes?fecha=${mes}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setRecibosMes(await res.json());
    } catch (e) {
      setErrorMes(e.message || "No se pudo cargar."); setRecibosMes([]);
    } finally { setLoadingMes(false); }
  }, []);
 
  useEffect(() => {
    cargarDia(fecha);
    cargarMes(fecha);
  }, [fecha, cargarDia, cargarMes]);
 
  // Filtros
  const filtrarRecibos = (lista, q) => {
    if (!q) return lista;
    const s = q.toLowerCase();
    return lista.filter(
      (r) =>
        r.beneficiario?.toLowerCase().includes(s) ||
        r.servicio?.toLowerCase().includes(s) ||
        String(r.id_servicio_otorgado).includes(s)
    );
  };
 
  const filtradosDia = filtrarRecibos(recibosDay, busquedaDia);
  const filtradosMes = filtrarRecibos(recibosMes, busquedaMes);
 
  const totalDia    = filtradosDia.reduce((s, r) => s + Number(r.financiero?.cuota_total  ?? 0), 0);
  const pagadoDia   = filtradosDia.reduce((s, r) => s + Number(r.financiero?.monto_pagado ?? 0), 0);
  const totalMes    = filtradosMes.reduce((s, r) => s + Number(r.financiero?.cuota_total  ?? 0), 0);
  const pagadoMes   = filtradosMes.reduce((s, r) => s + Number(r.financiero?.monto_pagado ?? 0), 0);
 
  return (
    <div className="recibos-page">
      <header className="recibos-header">
        <div>
          <h1 className="recibos-title">Recibos</h1>
          <p className="recibos-subtitle">Registro de servicios y cobros</p>
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
      </header>
 
      {/* RECIBOS DEL MES */}
      <section className="recibos-section">
        <div className="section-title-row">
          <div>
            <h2 className="section-title">Recibos del mes</h2>
            <p className="section-sub">{fmtMes(fecha)}</p>
          </div>
          <div className="search-wrap">
            <span className="search-icon">⌕</span>
            <input
              className="search-input"
              type="text"
              placeholder="Buscar en el mes…"
              value={busquedaMes}
              onChange={(e) => setBusquedaMes(e.target.value)}
            />
          </div>
        </div>
 
        {/* Resumen del mes */}
        {!loadingMes && filtradosMes.length > 0 && (
          <div className="resumen-strip resumen-mes">
            <ResumenCard label="Recibos del mes" value={filtradosMes.length} />
            <ResumenCard label="Total facturado"  value={fmt(totalMes)} />
            <ResumenCard label="Total cobrado"    value={fmt(pagadoMes)} />
            <ResumenCard
              label="Diferencia"
              value={fmt(totalMes - pagadoMes)}
              sub={totalMes - pagadoMes > 0 ? "pendiente" : "al corriente"}
            />
          </div>
        )}
 
        <div className="recibos-card">
          <TablaRecibos
            recibos={filtradosMes}
            loading={loadingMes}
            error={errorMes}
            onVerDetalle={setSeleccion}
            mostrarFecha={true}
            emptyMsg="Sin recibos para este mes."
          />
          {!loadingMes && !errorMes && filtradosMes.length > 0 && (
            <p className="tabla-footer">
              Mostrando {filtradosMes.length} de {recibosMes.length} recibos · {fmtMes(fecha)}
            </p>
          )}
        </div>
      </section>
 
      {/* RECIBOS DEL DIA */}
      <section className="recibos-section">
        <div className="section-title-row">
          <div>
            <h2 className="section-title">Recibos del día</h2>
            <p className="section-sub">{fmtFecha(fecha)}</p>
          </div>
          <div className="search-wrap">
            <span className="search-icon">⌕</span>
            <input
              className="search-input"
              type="text"
              placeholder="Buscar en el día…"
              value={busquedaDia}
              onChange={(e) => setBusquedaDia(e.target.value)}
            />
          </div>
        </div>
 
        {/* Resumen del día */}
        {!loadingDay && filtradosDia.length > 0 && (
          <div className="resumen-strip">
            <ResumenCard label="Recibos del día" value={filtradosDia.length} sub={fmtFecha(fecha)} />
            <ResumenCard label="Total facturado"  value={fmt(totalDia)} />
            <ResumenCard label="Total cobrado"    value={fmt(pagadoDia)} />
            <ResumenCard
              label="Diferencia"
              value={fmt(totalDia - pagadoDia)}
              sub={totalDia - pagadoDia > 0 ? "pendiente" : "al corriente"}
            />
          </div>
        )}
 
        <div className="recibos-card">
          <TablaRecibos
            recibos={filtradosDia}
            loading={loadingDay}
            error={errorDay}
            onVerDetalle={setSeleccion}
            mostrarFecha={false}
            emptyMsg="Sin recibos para esta fecha."
          />
          {!loadingDay && !errorDay && filtradosDia.length > 0 && (
            <p className="tabla-footer">
              Mostrando {filtradosDia.length} de {recibosDay.length} recibos · {fmtFecha(fecha)}
            </p>
          )}
        </div>
      </section>
 
      {/* Panel de detalle */}
      <ReciboDetalle recibo={seleccion} onClose={() => setSeleccion(null)} />
    </div>
  );
}
