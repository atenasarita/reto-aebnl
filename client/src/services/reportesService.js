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

  return {
    totalBeneficiarios,
    beneficiariosActivos,
    beneficiariosInactivos,
    distribucionGenero,
    distribucionEtapaVida,
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
