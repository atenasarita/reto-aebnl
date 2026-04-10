import { useCallback, useEffect, useState } from 'react'
import { getInventario } from '../services/inventarioService'

/*Carga inventario desde el API y expone estado para la UI. */
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
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al cargar el inventario'
      setError(message)
      setItems([])
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
