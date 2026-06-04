import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../utils/config";

export default function useFondoDonaciones() {
  const [saldo, setSaldo] = useState(null);
  const [donadores, setDonadores] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  });

  const fetchSaldo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/api/fondo_donaciones/saldo`, {
        headers: getHeaders(),
      });
      setSaldo(res.data.data);
      return res.data.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDonadores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/api/fondo_donaciones/donadores`, {
        headers: getHeaders(),
      });
      setDonadores(res.data.data ?? []);
      return res.data.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMovimientos = useCallback(async (limite = 100) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `${API_URL}/api/fondo_donaciones/movimientos?limite=${limite}`,
        { headers: getHeaders() }
      );
      setMovimientos(res.data.data ?? []);
      return res.data.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const registrarAbono = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(
        `${API_URL}/api/fondo_donaciones/abonos`,
        payload,
        { headers: getHeaders() }
      );
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const crearDonador = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(
        `${API_URL}/api/fondo_donaciones/donadores`,
        payload,
        { headers: getHeaders() }
      );
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const refrescar = useCallback(async () => {
    await Promise.all([fetchSaldo(), fetchDonadores(), fetchMovimientos()]);
  }, [fetchSaldo, fetchDonadores, fetchMovimientos]);

  useEffect(() => {
    fetchSaldo().catch(() => {});
    fetchDonadores().catch(() => {});
  }, [fetchSaldo, fetchDonadores]);

  return {
    saldo,
    donadores,
    movimientos,
    loading,
    error,
    fetchSaldo,
    fetchDonadores,
    fetchMovimientos,
    registrarAbono,
    crearDonador,
    refrescar,
  };
}
