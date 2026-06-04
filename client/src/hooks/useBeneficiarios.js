import { useState, useEffect } from 'react'
import { API_URL } from '../utils/config'
import { humanizeError } from '../utils/humanizeError'

const CACHE_KEY = 'aebnl_cache_beneficiarios'

function getCached() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null') } catch { return null }
}

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
        `${API_URL}/api/beneficiarios`,
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
      localStorage.setItem(CACHE_KEY, JSON.stringify(result))

    } catch (err) {
      const cached = getCached()
      if (cached) {
        setData(cached)
      } else {
        setError(humanizeError(err))
      }
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
        `${API_URL}/api/beneficiarios/folio/${query.trim()}`,
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