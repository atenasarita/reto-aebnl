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

function normalizeReporteMensual(payload, mes, anio) {
  const nuevosBeneficiarios = toNumber(payload?.nuevos_beneficiarios);
  const beneficiariosAtendidos = toNumber(payload?.beneficiarios_atendidos);
  const serviciosPeriodo = toNumber(payload?.servicios_periodo);

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
