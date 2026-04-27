import { useCallback, useEffect, useState } from "react";
import { getReporteGeneral } from "../services/reportesService";

const INITIAL_DATA = {
  totalBeneficiarios: 0,
  beneficiariosActivos: 0,
  beneficiariosInactivos: 0,
  distribucionGenero: [],
  distribucionEtapaVida: [],
  distribucionEstado: [],
};

export function useReporteGeneral() {
  const [data, setData] = useState(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReporteGeneral = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getReporteGeneral();
      setData(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar el reporte general.";
      setError(message);
      setData(INITIAL_DATA);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchReporteGeneral();
  }, [fetchReporteGeneral]);

  return {
    data,
    loading,
    error,
    refetch: fetchReporteGeneral,
  };
}
