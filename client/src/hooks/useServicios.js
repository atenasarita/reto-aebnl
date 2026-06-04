import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../utils/config";
import { humanizeError } from "../utils/humanizeError";

const CACHE_KEY = 'aebnl_cache_tipos_servicio'

function getCached() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null') } catch { return null }
}

export default function useServicios() {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTipos = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${API_URL}/api/registro_servicios/tipos`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTipos(res.data.data);
      localStorage.setItem(CACHE_KEY, JSON.stringify(res.data.data));

    } catch (err) {
      console.error("Error fetching tipos servicio:", err);
      const cached = getCached();
      if (cached) {
        setTipos(cached);
      } else {
        setError(humanizeError(err));
      }

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTipos();
  }, []);

  return {
    tipos,
    loading,
    error,
    refetch: fetchTipos,
  };
}