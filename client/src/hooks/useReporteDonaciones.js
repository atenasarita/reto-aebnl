import { useCallback, useState } from "react";
import axios from "axios";
import { API_URL } from "../utils/config";
import { humanizeError } from "../utils/humanizeError";

function getHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  };
}

export function useReporteDonaciones() {
  const [donadores, setDonadores] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [loadingDonadores, setLoadingDonadores] = useState(false);
  const [loadingMovimientos, setLoadingMovimientos] = useState(false);
  const [error, setError] = useState(null);

  const fetchDonadores = useCallback(async () => {
    setLoadingDonadores(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/api/fondo_donaciones/donadores`, {
        headers: getHeaders(),
      });
      const data = res.data.data ?? [];
      setDonadores(data);
      return data;
    } catch (err) {
      const msg = humanizeError(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoadingDonadores(false);
    }
  }, []);

  const fetchMovimientosPorDonador = useCallback(async (idDonador, limite = 300) => {
    if (!idDonador) {
      setMovimientos([]);
      return [];
    }
    setLoadingMovimientos(true);
    setError(null);
    try {
      const res = await axios.get(
        `${API_URL}/api/fondo_donaciones/movimientos?limite=${limite}&id_donador=${idDonador}`,
        { headers: getHeaders() }
      );
      const data = res.data.data ?? [];
      setMovimientos(data);
      return data;
    } catch (err) {
      const msg = humanizeError(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoadingMovimientos(false);
    }
  }, []);

  return {
    donadores,
    movimientos,
    loadingDonadores,
    loadingMovimientos,
    error,
    fetchDonadores,
    fetchMovimientosPorDonador,
    setMovimientos,
  };
}
