import { useEffect, useState } from "react";
import axios from "axios";

export default function useServicios() {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTipos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      const res = await axios.get(
        'http://localhost:3000/api/registro_servicios/tipos', 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("FULL RESPONSE:", res.data.data);
      setTipos(res.data.data);

    } catch (err) {
      console.error("Error fetching tipos servicio:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTipos();
  }, []);

  return { tipos, loading, error };
}