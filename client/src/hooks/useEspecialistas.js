import { useState, useEffect, useCallback } from 'react'

export function useEspecialistas(idEspecialidad) {
  const [especialistas, setEspecialistas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchEspecialistas = useCallback(async () => {
    if (!idEspecialidad) {
      setEspecialistas([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')

      const response = await fetch(
        `http://localhost:3000/api/registro_servicios/especialistas/${idEspecialidad}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error al cargar especialistas')
      }

      setEspecialistas(
        result.data.map((row) => ({
          id: row.id,
          nombre: row.nombre ?? '',
          especialidad: row.especialidad,
        }))
      )

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión')
      setEspecialistas([])
    } finally {
      setLoading(false)
    }
  }, [idEspecialidad])

  useEffect(() => {
    void fetchEspecialistas()
  }, [fetchEspecialistas])

  return { especialistas, loading, error }
}