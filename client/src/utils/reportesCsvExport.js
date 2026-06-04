/**
 * Exportación CSV (UTF-8 con BOM para Excel).
 */

/** @param {unknown} val */
export function escapeCsvCell(val) {
  const s = String(val ?? "");
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * @param {string[]} headers
 * @param {Array<Array<string|number>>} rows
 */
export function buildCsv(headers, rows) {
  const lines = [headers.map(escapeCsvCell).join(",")];
  for (const row of rows) {
    lines.push(row.map((c) => escapeCsvCell(c)).join(","));
  }
  return `\uFEFF${lines.join("\r\n")}`;
}

/** @param {string} filename */
export function triggerCsvDownload(filename, csvText) {
  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function distribRows(prefix, lista) {
  /** @type {Array<Array<string|number>>} */
  const out = [];
  for (const row of lista || []) {
    out.push([prefix, row.label ?? "", row.value ?? "", row.porcentaje ?? ""]);
  }
  return out;
}

export function sanitizeFilenamePart(s) {
  return String(s || "")
    .replace(/[^\w\d-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 80);
}

export function exportTimestampSlug() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
}

/** @param {{
 *   totalBeneficiarios?: number,
 *   beneficiariosActivos?: number,
 *   beneficiariosInactivos?: number,
 *   distribucionGenero?: Array<{ label?: string, value?: number, porcentaje?: number|string }>,
 *   distribucionEtapaVida?: Array<{ label?: string, value?: number, porcentaje?: number|string }>,
 *   distribucionEstado?: Array<{ label?: string, value?: number, porcentaje?: number|string }>,
 * }} data
 */
export function buildCsvReporteGeneral(data) {
  const headers = ["Sección", "Concepto", "Valor", "Porcentaje / notas"];
  /** @type {Array<Array<string|number>>} */
  const rows = [
    ["Meta", "Reporte", "General", ""],
    ["Resumen", "Total de beneficiarios", data.totalBeneficiarios ?? 0, ""],
    ["Resumen", "Beneficiarios activos", data.beneficiariosActivos ?? 0, ""],
    ["Resumen", "Beneficiarios inactivos", data.beneficiariosInactivos ?? 0, ""],
  ];

  rows.push(...distribRows("Distribución género", data.distribucionGenero));
  rows.push(...distribRows("Distribución etapa de vida", data.distribucionEtapaVida));
  rows.push(...distribRows("Beneficiarios por estado", data.distribucionEstado));

  return buildCsv(headers, rows);
}

/**
 * Reporte mensual (período fijo mes/año).
 */
export function buildCsvReporteMensual(data, mesNombre, anio) {
  const headers = ["Sección", "Concepto", "Valor", "Porcentaje / período"];

  /** @type {Array<Array<string|number>>} */
  const rows = [
    ["Meta", "Reporte", "Mensual", `${mesNombre || ""} ${anio || ""}`.trim()],
    ["Periodo API", "Desde", data.periodo?.desde ?? "", ""],
    ["Periodo API", "Hasta", data.periodo?.hasta ?? "", ""],
    ["Resumen", "Nuevos beneficiarios", data.nuevosBeneficiarios ?? 0, ""],
    ["Resumen", "Beneficiarios atendidos", data.beneficiariosAtendidos ?? 0, ""],
    ["Resumen", "Servicios del período", data.serviciosPeriodo ?? 0, ""],
  ];

  for (const dia of data.serviciosPorDia || []) {
    rows.push([
      "Servicios por día",
      dia.fecha ?? "",
      dia.conteo ?? 0,
      dia.diaLabel ?? "",
    ]);
  }

  rows.push(...distribRows("Distribución género", data.distribucionGenero));
  rows.push(...distribRows("Distribución etapa de vida", data.distribucionEtapaVida));
  rows.push(...distribRows("Beneficiarios por estado", data.distribucionEstado));

  return buildCsv(headers, rows);
}

/**
 * Reporte personalizado: respeta período aplicado y cortes demográficos de la vista.
 */
export function buildCsvReportePersonalizado({
  desde,
  hasta,
  filtrosMetricasTexto,
  metricasTieneServicios,
  metricasTieneNuevos,
  metricasTieneDemo,
  data,
  distribGeneroVista,
  distribEtapaVista,
  distribEstadoVista,
  serieServiciosVista,
  granularidadLabel,
}) {
  const headers = ["Sección", "Concepto", "Valor", "Detalle"];

  /** @type {Array<Array<string|number>>} */
  const rows = [
    ["Meta", "Reporte", "Personalizado", ""],
    ["Meta", "Periodo desde", desde, ""],
    ["Meta", "Periodo hasta", hasta, ""],
    ["Meta", "Métricas activas", filtrosMetricasTexto, ""],
  ];

  const showServiciosDem =
    metricasTieneDemo && !metricasTieneServicios && !metricasTieneNuevos;

  if (metricasTieneNuevos) {
    rows.push(["KPI", "Nuevos beneficiarios", data.nuevosBeneficiarios ?? 0, ""]);
  }
  if (metricasTieneServicios) {
    rows.push(["KPI", "Total servicios", data.serviciosPeriodo ?? 0, ""]);
    rows.push(["KPI", "Beneficiarios atendidos", data.beneficiariosAtendidos ?? 0, ""]);
  }
  if (showServiciosDem) {
    rows.push(["KPI", "Beneficiarios atendidos", data.beneficiariosAtendidos ?? 0, ""]);
  }

  rows.push(["KPI", "Citas período", data.citasPeriodo ?? 0, ""]);

  if (metricasTieneServicios && Array.isArray(serieServiciosVista)) {
    rows.push(["Meta", "Serie servicios — granularidad", granularidadLabel, ""]);
    for (const p of serieServiciosVista) {
      rows.push([
        "Servicios agregados",
        String(p.bucketInicio ?? p.chartKey ?? ""),
        p.conteo ?? 0,
        `${p.bucketFin ?? ""} · ${p.chartLabel ?? ""}`.trim(),
      ]);
    }
  }

  if (metricasTieneDemo) {
    rows.push(...distribRows("Vista género", distribGeneroVista));
    rows.push(...distribRows("Vista etapa de vida", distribEtapaVista));
    rows.push(...distribRows("Vista estados", distribEstadoVista));
  }

  return buildCsv(headers, rows);
}

/**
 * Historial de movimientos de inventario (rango aplicado en la UI).
 * @param {Array<object>} historial — filas normalizadas del reporte
 * @param {string} desde YYYY-MM-DD
 * @param {string} hasta YYYY-MM-DD
 */
export function buildCsvReporteInventarioHistorial(historial, desde, hasta) {
  const headers = [
    "Periodo desde",
    "Periodo hasta",
    "Fecha",
    "Clave",
    "Producto",
    "Tipo",
    "Cantidad",
    "Stock anterior",
    "Stock nuevo",
    "Motivo",
    "Usuario",
  ];

  /** @type {Array<Array<string|number>>} */
  const rows = (historial || []).map((h) => [
    desde,
    hasta,
    h.fecha ?? "",
    h.clave ?? "",
    h.nombre ?? "",
    h.tipoLabel ?? h.tipo ?? "",
    h.cantidad ?? 0,
    h.cantAnterior ?? 0,
    h.cantNueva ?? 0,
    h.motivo ?? "",
    h.usuario ?? "",
  ]);

  return buildCsv(headers, rows);
}

/**
 * Reporte anual consolidado (`porMes` con servicios y nuevos por mes).
 * @param {object} data
 * @param {number} anio
 */
export function buildCsvReporteAnual(data, anio) {
  const headers = ["Sección", "Concepto", "Valor principal", "Valor secundario / %"];

  /** @type {Array<Array<string|number>>} */
  const rows = [
    ["Meta", `Año (${anio})`, "", ""],
    ["Periodo API", String(data.periodo?.desde ?? ""), "", ""],
    ["Periodo API", String(data.periodo?.hasta ?? ""), "", ""],
    [
      "Resumen",
      "Servicios período",
      data.serviciosPeriodo ?? 0,
      "",
    ],
    ["Resumen", "Nuevos beneficiarios (año)", data.nuevosBeneficiarios ?? 0, ""],
    ["Resumen", "Beneficiarios atendidos", data.beneficiariosAtendidos ?? 0, ""],
  ];

  for (const m of data.porMes || []) {
    rows.push([
      "Serie mensual",
      String(m.mesLabel || `Mes ${m.mes}`),
      m.servicios ?? 0,
      m.nuevosBeneficiarios ?? 0,
    ]);
  }

  rows.push(...distribRows("Distribución género", data.distribucionGenero));
  rows.push(...distribRows("Distribución etapa de vida", data.distribucionEtapaVida));
  rows.push(...distribRows("Beneficiarios por estado", data.distribucionEstado));

  return buildCsv(headers, rows);
}

/**
 * @param {{ nombre?: string, tipo_origen?: string, saldo?: number }} donador
 * @param {Array<Record<string, unknown>>} movimientos
 */
export function buildCsvReporteDonaciones(donador, movimientos) {
  const tipoLabel = donador.tipo_origen === "marca" ? "Marca" : "Familia";
  const headers = [
    "Fecha",
    "Tipo",
    "Origen o destino",
    "Concepto",
    "Monto",
    "Saldo después",
  ];

  /** @type {Array<Array<string|number>>} */
  const rows = [
    ["Donador", donador.nombre ?? "", tipoLabel, "", "", ""],
    ["Saldo actual", donador.saldo ?? 0, "", "", "", ""],
    ["", "", "", "", "", ""],
  ];

  for (const m of movimientos) {
    const egreso = m.tipo_movimiento === "egreso";
    const origen =
      egreso && (m.folio_servicio ?? m.id_servicio_otorgado)
        ? `Servicio #${m.folio_servicio ?? m.id_servicio_otorgado}`
        : m.origen_nombre ?? m.donador_nombre ?? "";
    const concepto =
      egreso && (m.servicio_nombre || m.folio_servicio)
        ? [m.folio_servicio ? `#${m.folio_servicio}` : "", m.servicio_nombre]
            .filter(Boolean)
            .join(" · ")
        : m.concepto ?? m.motivo ?? "";
    rows.push([
      m.fecha ?? "",
      m.tipo_movimiento ?? "",
      origen,
      concepto,
      egreso ? -Number(m.monto || 0) : Number(m.monto || 0),
      m.saldo_nuevo ?? "",
    ]);
  }

  return buildCsv(headers, rows);
}
