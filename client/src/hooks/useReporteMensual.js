import { useCallback, useEffect, useState } from "react";
import { getReporteMensual } from "../services/reportesService";

const INITIAL_DATA = {
  mes: 0,
  anio: 0,
  mesNombre: "",
  periodo: { desde: "", hasta: "" },
  nuevosBeneficiarios: 0,
  beneficiariosAtendidos: 0,
  serviciosPeriodo: 0,
  serviciosPorDia: [],
  distribucionGenero: [],
  distribucionEtapaVida: [],
  distribucionEstado: [],
};

export function useReporteMensual(mes, anio) {
  const [data, setData] = useState(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReporteMensual = useCallback(async () => {
    if (!mes || !anio) return;
    setLoading(true);
    setError("");

    try {
      const response = await getReporteMensual(mes, anio);
      setData(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al cargar el reporte mensual.";
      setError(message);
      setData(INITIAL_DATA);
    } finally {
      setLoading(false);
    }
  }, [mes, anio]);

  useEffect(() => {
    void fetchReporteMensual();
  }, [fetchReporteMensual]);

  return {
    data,
    loading,
    error,
    refetch: fetchReporteMensual,
  };
}
