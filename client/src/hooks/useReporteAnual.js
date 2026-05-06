import { useCallback, useEffect, useState } from "react";
import { getReporteAnual } from "../services/reportesService";

const INITIAL_DATA = {
  anio: 0,
  periodo: { desde: "", hasta: "" },
  nuevosBeneficiarios: 0,
  beneficiariosAtendidos: 0,
  serviciosPeriodo: 0,
  porMes: [],
  distribucionGenero: [],
  distribucionEtapaVida: [],
  distribucionEstado: [],
};

export function useReporteAnual(anio) {
  const [data, setData] = useState(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReporteAnual = useCallback(async () => {
    if (!anio) return;
    setLoading(true);
    setError("");

    try {
      const response = await getReporteAnual(anio);
      setData(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al cargar el reporte anual.";
      setError(message);
      setData(INITIAL_DATA);
    } finally {
      setLoading(false);
    }
  }, [anio]);

  useEffect(() => {
    void fetchReporteAnual();
  }, [fetchReporteAnual]);

  return {
    data,
    loading,
    error,
    refetch: fetchReporteAnual,
  };
}
