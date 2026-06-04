import { useState, useEffect, useCallback } from 'react'
import { API_URL } from '../utils/config'
import { humanizeError } from '../utils/humanizeError'

const CACHE_KEY = 'aebnl_cache_productos'

function getCached() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null') } catch { return null }
}

export function useProductos() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProductos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/inventario`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar productos')
      }

      const mapped = data.map((row) => ({
        id: row.ID_INVENTARIO,
        nombre: row.NOMBRE ?? '',
        precio: Number(row.PRECIO) || 0,
        stock: Number(row.CANTIDAD) || 0,
      }))
      setProductos(mapped)
      localStorage.setItem(CACHE_KEY, JSON.stringify(mapped))
    } catch (err) {
      const cached = getCached()
      if (cached) {
        setProductos(cached)
      } else {
        setError(humanizeError(err))
        setProductos([])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchProductos()
  }, [fetchProductos])

  return { productos, loading, error }
}