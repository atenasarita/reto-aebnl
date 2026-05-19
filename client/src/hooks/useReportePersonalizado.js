import { useCallback, useEffect, useState } from "react";
import { getReportePeriodo } from "../services/reportesService";

const INITIAL_DATA = {
  periodo: { desde: "", hasta: "" },
  citasPeriodo: 0,
  nuevosBeneficiarios: 0,
  beneficiariosAtendidos: 0,
  serviciosPeriodo: 0,
  serviciosPorDia: [],
  distribucionGenero: [],
  distribucionEtapaVida: [],
  distribucionEstado: [],
};

/**
 * Carga el reporte por rango (`/api/reportes/analytics/periodo`).
 * Si `desde` o `hasta` están vacíos, no hace petición y devuelve datos iniciales.
 *
 * @param {string} desde YYYY-MM-DD
 * @param {string} hasta YYYY-MM-DD
 */
export function useReportePersonalizado(desde, hasta) {
  const [data, setData] = useState(INITIAL_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReporte = useCallback(async () => {
    if (!desde?.trim() || !hasta?.trim()) {
      setData(INITIAL_DATA);
      setError("");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getReportePeriodo(desde, hasta);
      setData(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al cargar el reporte personalizado.";
      setError(message);
      setData(INITIAL_DATA);
    } finally {
      setLoading(false);
    }
  }, [desde, hasta]);


  useEffect(() => {
    void fetchReporte();
  }, [fetchReporte]);

  return {
    data,
    loading,
    error,
    refetch: fetchReporte,
  };
}
