import { useState, useEffect } from 'react'

export default function useBeneficiarios() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function fetchBeneficiarios() {
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')

      const response = await fetch(
        'http://localhost:3000/api/beneficiarios',
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error al cargar beneficiarios')
      }

      setData(result)

    } catch (err) {
      setError(err.message || 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  async function buscarPorFolio(query) {
    if (!query.trim()) {
      fetchBeneficiarios()
      return
    }

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')

      const response = await fetch(
        `http://localhost:3000/api/beneficiarios/folio/${query.trim()}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'No se encontró el beneficiario')
      }

      setData(Array.isArray(result) ? result : [result])

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBeneficiarios()
  }, [])

  return {
    data,
    loading,
    error,
    fetchBeneficiarios,
    buscarPorFolio,
  }
}