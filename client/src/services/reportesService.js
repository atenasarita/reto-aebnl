import { BASE_URL, getAuthHeaders, parseErrorMessage } from "./apiService";

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toPercent(value, total) {
  if (!total) return 0;
  return Math.round((toNumber(value) / total) * 100);
}

function mapGeneroLabel(genero) {
  if (genero === "femenino") return "Femenino";
  if (genero === "masculino") return "Masculino";
  return "Otro";
}

function mapEtapaCodigoLabel(codigo, etiqueta) {
  if (etiqueta) return etiqueta;
  const map = {
    infancia_0_12: "Infancia (0-12 años)",
    adolescencia_13_17: "Adolescencia (13-17 años)",
    adultez_18_59: "Adultez (18-59 años)",
    adulto_mayor_60_mas: "Adulto mayor (60+ años)",
  };
  return map[codigo] || "Sin etapa";
}

function estadoDisplayLabel(raw) {
  const s = String(raw ?? "").trim();
  if (!s || s.toLowerCase() === "sin_estado") return "Sin estado";
  return s
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeReporteGeneral(payload) {
  const beneficiariosActivos = toNumber(payload?.beneficiarios_activos);
  const beneficiariosInactivos = toNumber(payload?.beneficiarios_inactivos);
  const totalBeneficiarios = beneficiariosActivos + beneficiariosInactivos;

  const beneficiariosPorGenero = Array.isArray(payload?.beneficiarios_por_genero)
    ? payload.beneficiarios_por_genero
    : [];
  const beneficiariosPorEtapaVida = Array.isArray(payload?.beneficiarios_por_etapa_vida)
    ? payload.beneficiarios_por_etapa_vida
    : [];
  const beneficiariosPorEstado = Array.isArray(payload?.beneficiarios_por_estado)
    ? payload.beneficiarios_por_estado
    : [];

  const distribucionGenero = beneficiariosPorGenero.map((item) => {
    const value = toNumber(item?.conteo);
    return {
      key: String(item?.genero ?? "otro"),
      label: mapGeneroLabel(item?.genero),
      value,
      porcentaje: toNumber(item?.porcentaje) || toPercent(value, totalBeneficiarios),
    };
  });

  const totalEtapas = beneficiariosPorEtapaVida.reduce((acc, item) => acc + toNumber(item?.conteo), 0);
  const distribucionEtapaVida = beneficiariosPorEtapaVida.map((item) => {
    const value = toNumber(item?.conteo);
    return {
      key: String(item?.codigo ?? item?.etiqueta ?? "sin-etapa"),
      label: mapEtapaCodigoLabel(item?.codigo, item?.etiqueta),
      value,
      porcentaje: toPercent(value, totalEtapas),
    };
  });

  const totalPorEstado = beneficiariosPorEstado.reduce((acc, item) => acc + toNumber(item?.conteo), 0);
  const distribucionEstado = beneficiariosPorEstado.map((item) => {
    const raw = String(item?.estado ?? "sin_estado");
    const value = toNumber(item?.conteo);
    return {
      key: raw,
      label: estadoDisplayLabel(raw),
      value,
      porcentaje: toNumber(item?.porcentaje) || toPercent(value, totalPorEstado || 1),
    };
  });

  return {
    totalBeneficiarios,
    beneficiariosActivos,
    beneficiariosInactivos,
    distribucionGenero,
    distribucionEtapaVida,
    distribucionEstado,
  };
}

export async function getReporteGeneral() {
  const response = await fetch(`${BASE_URL}/api/reportes/analytics`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const data = await response.json();
  return normalizeReporteGeneral(data);
}

const NOMBRES_MES_LARGO = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function pad2(n) {
  const v = Number(n) || 0;
  return v < 10 ? `0${v}` : String(v);
}

function normalizeServiciosPorDia(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map((item) => {
    const dia = Number(item?.dia) || Number(String(item?.fecha || "").slice(8, 10)) || 0;
    return {
      fecha: String(item?.fecha ?? ""),
      dia,
      diaLabel: pad2(dia),
      conteo: toNumber(item?.conteo),
    };
  });
}

/** Género, etapa y estado de beneficiarios atendidos en el periodo (mensual / anual / rango). */
function mapDistribucionesBeneficiariosDesdePayload(payload) {
  const beneficiariosPorGenero = Array.isArray(payload?.beneficiarios_por_genero)
    ? payload.beneficiarios_por_genero
    : [];
  const beneficiariosPorEtapaVida = Array.isArray(payload?.beneficiarios_por_etapa_vida)
    ? payload.beneficiarios_por_etapa_vida
    : [];
  const beneficiariosPorEstado = Array.isArray(payload?.beneficiarios_por_estado)
    ? payload.beneficiarios_por_estado
    : [];

  const totalGenero = beneficiariosPorGenero.reduce(
    (acc, item) => acc + toNumber(item?.conteo),
    0,
  );
  const distribucionGenero = beneficiariosPorGenero.map((item) => {
    const value = toNumber(item?.conteo);
    return {
      key: String(item?.genero ?? "otro"),
      label: mapGeneroLabel(item?.genero),
      value,
      porcentaje: toNumber(item?.porcentaje) || toPercent(value, totalGenero),
    };
  });

  const totalEtapas = beneficiariosPorEtapaVida.reduce(
    (acc, item) => acc + toNumber(item?.conteo),
    0,
  );
  const distribucionEtapaVida = beneficiariosPorEtapaVida.map((item) => {
    const value = toNumber(item?.conteo);
    return {
      key: String(item?.codigo ?? item?.etiqueta ?? "sin-etapa"),
      label: mapEtapaCodigoLabel(item?.codigo, item?.etiqueta),
      value,
      porcentaje: toPercent(value, totalEtapas),
    };
  });

  const totalPorEstado = beneficiariosPorEstado.reduce(
    (acc, item) => acc + toNumber(item?.conteo),
    0,
  );
  const distribucionEstado = beneficiariosPorEstado.map((item) => {
    const raw = String(item?.estado ?? "sin_estado");
    const value = toNumber(item?.conteo);
    return {
      key: raw,
      label: estadoDisplayLabel(raw),
      value,
      porcentaje: toNumber(item?.porcentaje) || toPercent(value, totalPorEstado || 1),
    };
  });

  return { distribucionGenero, distribucionEtapaVida, distribucionEstado };
}

function normalizeReporteMensual(payload, mes, anio) {
  const nuevosBeneficiarios = toNumber(payload?.nuevos_beneficiarios);
  const beneficiariosAtendidos = toNumber(payload?.beneficiarios_atendidos);
  const serviciosPeriodo = toNumber(payload?.servicios_periodo);

  const { distribucionGenero, distribucionEtapaVida, distribucionEstado } =
    mapDistribucionesBeneficiariosDesdePayload(payload);

  const periodo = payload?.periodo ?? {};
  const mesNum = toNumber(payload?.mes) || Number(mes) || 0;
  const anioNum = toNumber(payload?.anio) || Number(anio) || 0;
  const mesNombre = mesNum >= 1 && mesNum <= 12 ? NOMBRES_MES_LARGO[mesNum - 1] : "";

  return {
    mes: mesNum,
    anio: anioNum,
    mesNombre,
    periodo: {
      desde: String(periodo.desde ?? ""),
      hasta: String(periodo.hasta ?? ""),
    },
    nuevosBeneficiarios,
    beneficiariosAtendidos,
    serviciosPeriodo,
    serviciosPorDia: normalizeServiciosPorDia(payload?.servicios_por_dia),
    distribucionGenero,
    distribucionEtapaVida,
    distribucionEstado,
  };
}

export async function getReporteMensual(mes, anio) {
  const params = new URLSearchParams({ mes: String(mes), anio: String(anio) });
  const response = await fetch(
    `${BASE_URL}/api/reportes/analytics/mensual?${params.toString()}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const data = await response.json();
  return normalizeReporteMensual(data, mes, anio);
}

function normalizePorMesAnual(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map((item) => {
    const mes = toNumber(item?.mes);
    const mesLabel =
      mes >= 1 && mes <= 12 ? NOMBRES_MES_LARGO[mes - 1] : "";
    return {
      mes,
      mesLabel,
      servicios: toNumber(item?.servicios_otorgados ?? item?.servicios),
      nuevosBeneficiarios: toNumber(
        item?.nuevos_beneficiarios ?? item?.nuevosBeneficiarios,
      ),
    };
  });
}

function normalizeReporteAnual(payload, anio) {
  const periodo = payload?.periodo ?? {};
  const anioNum = toNumber(payload?.anio) || Number(anio) || 0;

  const { distribucionGenero, distribucionEtapaVida, distribucionEstado } =
    mapDistribucionesBeneficiariosDesdePayload(payload);

  return {
    anio: anioNum,
    periodo: {
      desde: String(periodo.desde ?? ""),
      hasta: String(periodo.hasta ?? ""),
    },
    nuevosBeneficiarios: toNumber(payload?.nuevos_beneficiarios),
    beneficiariosAtendidos: toNumber(payload?.beneficiarios_atendidos),
    serviciosPeriodo: toNumber(payload?.servicios_periodo),
    porMes: normalizePorMesAnual(payload?.por_mes),
    distribucionGenero,
    distribucionEtapaVida,
    distribucionEstado,
  };
}

export async function getReporteAnual(anio) {
  const params = new URLSearchParams({ anio: String(anio) });
  const response = await fetch(
    `${BASE_URL}/api/reportes/analytics/anual?${params.toString()}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const data = await response.json();
  return normalizeReporteAnual(data, anio);
}

/** Serie diaria en rango arbitrario (ej. reporte por periodo / personalizado). */
function normalizeServiciosPorPeriodo(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map((item) => {
    const fecha = String(item?.fecha ?? "");
    return {
      fecha,
      dia: Number(item?.dia) || 0,
      diaLabel: fecha.length >= 10 ? fecha.slice(5) : "",
      conteo: toNumber(item?.conteo),
    };
  });
}

/**
 * Normaliza `GET /api/reportes/analytics/periodo?desde=&hasta=`.
 */
function normalizeReportePeriodo(payload) {
  const nuevosBeneficiarios = toNumber(payload?.nuevos_beneficiarios);
  const beneficiariosAtendidos = toNumber(payload?.beneficiarios_atendidos);
  const serviciosPeriodo = toNumber(payload?.servicios_periodo);
  const citasPeriodo = toNumber(payload?.citas_periodo);

  const { distribucionGenero, distribucionEtapaVida, distribucionEstado } =
    mapDistribucionesBeneficiariosDesdePayload(payload);

  const periodo = payload?.periodo ?? {};

  return {
    periodo: {
      desde: String(periodo.desde ?? ""),
      hasta: String(periodo.hasta ?? ""),
    },
    citasPeriodo,
    nuevosBeneficiarios,
    beneficiariosAtendidos,
    serviciosPeriodo,
    serviciosPorDia: normalizeServiciosPorPeriodo(payload?.servicios_por_dia),
    distribucionGenero,
    distribucionEtapaVida,
    distribucionEstado,
  };
}

export async function getReportePeriodo(desde, hasta) {
  const params = new URLSearchParams({
    desde: String(desde),
    hasta: String(hasta),
  });
  const response = await fetch(
    `${BASE_URL}/api/reportes/analytics/periodo?${params.toString()}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const data = await response.json();
  return normalizeReportePeriodo(data);
}
