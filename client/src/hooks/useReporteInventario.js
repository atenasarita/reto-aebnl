import { useCallback, useEffect, useState } from "react";
import { getReporteInventario } from "../services/reportesService";

const INITIAL_DATA = {
  periodo: { desde: "", hasta: "" },
  articulosActivos: 0,
  productosBajoStock: 0,
  valorInventario: 0,
  entradasUnidades: 0,
  salidasUnidades: 0,
  movimientosRegistrados: 0,
  productosPorCategoria: [],
  movimientosPorDia: [],
  historial: [],
  listaBajoStock: [],
};

/**
 * Carga el reporte de inventario por rango (`/api/reportes/analytics/inventario`).
 * Si `desde` o `hasta` están vacíos, no hace petición.
 *
 * @param {string} desde YYYY-MM-DD
 * @param {string} hasta YYYY-MM-DD
 */
export function useReporteInventario(desde, hasta) {
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
      const response = await getReporteInventario(desde, hasta);
      setData(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al cargar el reporte de inventario.";
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
