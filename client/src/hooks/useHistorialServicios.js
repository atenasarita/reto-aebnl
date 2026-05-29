import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { API_URL } from '../utils/config'

export default function useHistorialServicios(limit = 50) {
  const [historial, setHistorial] = useState([])
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)

  const fetchHistorial = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(
        `${API_URL}/api/servicios/historial?limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setHistorial(res.data.data)
    } catch (err) {
      console.error('Error fetching historial servicios:', err)
      setError(err.response?.data?.message ?? err.message)
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchHistorial()
  }, [fetchHistorial])

  return { historial, loading, error, refetch: fetchHistorial }
}