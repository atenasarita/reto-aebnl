import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { API_URL } from '../utils/config'

export default function useCategoriasServicios() {
  const [categorias, setCategorias] = useState([])
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState(null)

  const fetchCategorias = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`${API_URL}/api/servicios/categorias`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setCategorias(res.data.data)
    } catch (err) {
      console.error('Error fetching categorias:', err)
      setError(err.response?.data?.message ?? err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategorias()
  }, [fetchCategorias])

  return { categorias, loading, error, refetch: fetchCategorias }
}