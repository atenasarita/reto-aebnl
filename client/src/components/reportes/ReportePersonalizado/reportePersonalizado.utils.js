import { METRICA_OPTIONS } from "./reportePersonalizadoConstants";

/** Granularidad de la serie de servicios en Reporte Personalizado */
export const GRANULARIDAD_SERVICIOS = {
  DIA: "dia",
  SEMANA: "semana",
  MES: "mes",
};

function pad2(n) {
  return n < 10 ? `0${n}` : String(n);
}

function parseYmdLocal(fecha) {
  const s = String(fecha || "").slice(0, 10);
  const [y, m, d] = s.split("-").map(Number);
  return { y: y || 0, m: m || 1, d: d || 1, s };
}

/** Fecha local a medianoche (evita desfases TZ al usar T12:00:00). */
function ymdToNoonDate(ymd) {
  const { y, m, d } = parseYmdLocal(ymd);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

/** Días inclusivos entre dos fechas YYYY-MM-DD (1 si desde === hasta). */
export function diasEnRangoInclusive(desde, hasta) {
  if (!desde || !hasta || desde > hasta) return 0;
  const a = ymdToNoonDate(desde);
  const b = ymdToNoonDate(hasta);
  const ms = b.getTime() - a.getTime();
  return Math.floor(ms / 86400000) + 1;
}

/** Más de ~3 meses (91 días inclusivos) → agregación mensual en la gráfica. */
const UMBRAL_DIAS_MENSUAL = 91;

/**
 * Regla: <=45 días diario; 46–90 días semanal; más de 3 meses (>=91 días) mensual.
 * @returns {typeof GRANULARIDAD_SERVICIOS[keyof typeof GRANULARIDAD_SERVICIOS]}
 */
export function resolverGranularidadServicios(desde, hasta) {
  const n = diasEnRangoInclusive(desde, hasta);
  if (n <= 0) return GRANULARIDAD_SERVICIOS.DIA;
  if (n <= 45) return GRANULARIDAD_SERVICIOS.DIA;
  if (n < UMBRAL_DIAS_MENSUAL) return GRANULARIDAD_SERVICIOS.SEMANA;
  return GRANULARIDAD_SERVICIOS.MES;
}

/** Lunes de la semana ISO-local de una fecha YYYY-MM-DD. */
export function lunesSemanaLocal(ymd) {
  const d = ymdToNoonDate(ymd);
  const dow = d.getDay(); // 0 dom … 6 sáb
  const delta = dow === 0 ? -6 : 1 - dow;
  const mon = new Date(d);
  mon.setDate(d.getDate() + delta);
  return `${mon.getFullYear()}-${pad2(mon.getMonth() + 1)}-${pad2(mon.getDate())}`;
}

function addDaysYmd(ymd, days) {
  const d = ymdToNoonDate(ymd);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function formatShortEs(ymd) {
  const t = ymdToNoonDate(ymd).getTime();
  if (Number.isNaN(t)) return ymd;
  return ymdToNoonDate(ymd).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

function formatMonthYearEs(ymd) {
  const d = ymdToNoonDate(`${ymd.slice(0, 7)}-01`);
  return d.toLocaleDateString("es-MX", { month: "short", year: "numeric" });
}

/**
 * Construye la serie para la gráfica a partir de `serviciosPorDia` (diaria del API).
 * Cada punto incluye: chartKey (único), chartLabel (eje X), conteo, bucketInicio, bucketFin, granularidad.
 */
export function construirSerieServiciosVista(serviciosPorDia, granularidad) {
  if (!Array.isArray(serviciosPorDia) || serviciosPorDia.length === 0) return [];

  if (granularidad === GRANULARIDAD_SERVICIOS.DIA) {
    return [...serviciosPorDia]
      .filter((r) => r?.fecha)
      .sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)))
      .map((r) => {
        const fecha = String(r.fecha).slice(0, 10);
        return {
          ...r,
          chartKey: fecha,
          chartLabel: fecha.length >= 10 ? fecha.slice(5) : fecha,
          bucketInicio: fecha,
          bucketFin: fecha,
          granularidad: GRANULARIDAD_SERVICIOS.DIA,
        };
      });
  }

  if (granularidad === GRANULARIDAD_SERVICIOS.SEMANA) {
    const map = new Map();
    for (const r of serviciosPorDia) {
      const fecha = String(r?.fecha || "").slice(0, 10);
      if (!fecha) continue;
      const inicio = lunesSemanaLocal(fecha);
      const fin = addDaysYmd(inicio, 6);
      const prev = map.get(inicio) || { conteo: 0, bucketInicio: inicio, bucketFin: fin };
      prev.conteo += Number(r?.conteo || 0);
      prev.bucketFin = fin;
      map.set(inicio, prev);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([inicio, v]) => ({
        chartKey: `w-${inicio}`,
        chartLabel: formatShortEs(inicio),
        conteo: v.conteo,
        bucketInicio: inicio,
        bucketFin: v.bucketFin,
        granularidad: GRANULARIDAD_SERVICIOS.SEMANA,
      }));
  }

  /* mensual */
  const mapMes = new Map();
  for (const r of serviciosPorDia) {
    const fecha = String(r?.fecha || "").slice(0, 10);
    if (fecha.length < 7) continue;
    const key = fecha.slice(0, 7); // YYYY-MM
    const prev = mapMes.get(key) || { conteo: 0 };
    prev.conteo += Number(r?.conteo || 0);
    mapMes.set(key, prev);
  }
  return [...mapMes.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ym, v]) => {
      const bucketInicio = `${ym}-01`;
      const { y, m } = parseYmdLocal(bucketInicio);
      const ultimo = new Date(y, m, 0).getDate();
      const bucketFin = `${y}-${pad2(m)}-${pad2(ultimo)}`;
      return {
        chartKey: `m-${ym}`,
        chartLabel: formatMonthYearEs(bucketInicio),
        conteo: v.conteo,
        bucketInicio,
        bucketFin,
        granularidad: GRANULARIDAD_SERVICIOS.MES,
      };
    });
}

export function tituloServiciosPorGranularidad(granularidad) {
  if (granularidad === GRANULARIDAD_SERVICIOS.SEMANA) return "Servicios otorgados por semana";
  if (granularidad === GRANULARIDAD_SERVICIOS.MES) return "Servicios otorgados por mes";
  return "Servicios otorgados por día";
}

export function formatNumber(value) {
  return Number(value || 0).toLocaleString("es-MX");
}

export function defaultRangoMesActual() {
  const t = new Date();
  const y = t.getFullYear();
  const m = t.getMonth() + 1;
  const pad = (n) => (n < 10 ? `0${n}` : String(n));
  const ultimo = new Date(y, m, 0).getDate();
  return {
    desde: `${y}-${pad(m)}-01`,
    hasta: `${y}-${pad(m)}-${pad(ultimo)}`,
  };
}

export function formatRangoLegible(desde, hasta) {
  if (!desde || !hasta) return "";
  const opts = { day: "numeric", month: "short", year: "numeric" };
  const d0 = new Date(`${desde}T12:00:00`);
  const d1 = new Date(`${hasta}T12:00:00`);
  if (Number.isNaN(d0.getTime()) || Number.isNaN(d1.getTime())) return `${desde} — ${hasta}`;
  return `${d0.toLocaleDateString("es-MX", opts)} — ${d1.toLocaleDateString("es-MX", opts)}`;
}

export function esRangoFechaValido(desde, hasta) {
  return /^\d{4}-\d{2}-\d{2}$/.test(desde) && /^\d{4}-\d{2}-\d{2}$/.test(hasta) && desde <= hasta;
}

export function filtrarDistribucionPorClaves(rows, seleccion) {
  if (!(seleccion instanceof Set) || seleccion.size === 0) return [];
  const filtradas = rows.filter((r) => seleccion.has(r.key));
  const total = filtradas.reduce((acc, r) => acc + Number(r.value || 0), 0);
  return filtradas.map((r) => ({
    ...r,
    porcentaje: total ? Math.round((Number(r.value || 0) / total) * 100) : 0,
  }));
}

export function resolverSeleccion(filas, seleccion) {
  const todas = new Set(filas.map((r) => r.key));
  if (seleccion === null) return todas;
  return new Set([...seleccion].filter((k) => todas.has(k)));
}

export function textoMetricas(metricasSet) {
  return [...metricasSet]
    .map((id) => METRICA_OPTIONS.find((m) => m.id === id)?.label ?? id)
    .join(", ");
}
