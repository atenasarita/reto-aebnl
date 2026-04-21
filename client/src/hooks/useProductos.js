import { useState, useEffect, useCallback } from 'react'

export function useProductos() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProductos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3000/api/inventario', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar productos')
      }

      setProductos(
        data.map((row) => ({
          id: row.ID_INVENTARIO,
          nombre: row.NOMBRE ?? '',
          precio: Number(row.PRECIO) || 0,
        }))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión')
      setProductos([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchProductos()
  }, [fetchProductos])

  return { productos, loading, error }
}