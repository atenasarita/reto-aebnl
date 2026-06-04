import { useCallback, useEffect, useState } from 'react'
import { getInventario } from '../services/inventarioService'
import { humanizeError } from '../utils/humanizeError'

const CACHE_KEY = 'aebnl_cache_inventario'

function getCached() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null') } catch { return null }
}

export function useInventario() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchInventario = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getInventario()
      setItems(data)
      localStorage.setItem(CACHE_KEY, JSON.stringify(data))
    } catch (err) {
      const cached = getCached()
      if (cached) {
        setItems(cached)
      } else {
        setError(humanizeError(err))
        setItems([])
      }
      console.error('Error al obtener inventario:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchInventario()
  }, [fetchInventario])

  return { items, loading, error, fetchInventario }
}
