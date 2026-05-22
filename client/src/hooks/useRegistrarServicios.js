import { useState } from "react";
import axios from "axios";
import { API_URL } from "../utils/config";

export default function useRegistrarServicio() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const registrar = async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${API_URL}/api/registro_servicios`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return res.data;

    } catch (err) {
      console.error("Error registrando servicio:", err);

      const errorMessage =
        err.response?.data?.message || err.message;

      setError(errorMessage);

      throw new Error(errorMessage);

    } finally {
      setLoading(false);
    }
  };

  return {
    registrar,
    loading,
    error,
  };
}