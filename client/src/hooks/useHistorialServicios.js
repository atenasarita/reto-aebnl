import { useEffect, useState, useCallback, useRef } from 'react'
import axios from 'axios'
import { API_URL } from '../utils/config'
import { humanizeError } from '../utils/humanizeError'

const LIMIT = 20

export default function useHistorialServicios() {
  const [servicios, setServicios] = useState([])
  const [hasMore,   setHasMore]   = useState(true)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const pageRef = useRef(0)
  const loadingRef = useRef(false)

  const fetchPage = useCallback(async (pageToFetch) => {
    if (loadingRef.current || !hasMore) return
    loadingRef.current = true
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`${API_URL}/api/servicios/historial`, {
        params: { page: pageToFetch, limit: LIMIT },
        headers: { Authorization: `Bearer ${token}` },
      })
      const { data, hasMore: more } = res.data
      setServicios(prev => pageToFetch === 0 ? data : [...prev, ...data])
      setHasMore(more)
      pageRef.current = pageToFetch + 1
    } catch (err) {
      console.error('Error fetching historial servicios:', err)
      setError(humanizeError(err))
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [hasMore])

  // Carga inicial
  useEffect(() => {
    fetchPage(0)
  }, [])

  const loadMore = useCallback(() => {
    fetchPage(pageRef.current)
  }, [fetchPage])

  const refetch = useCallback(() => {
    pageRef.current = 0
    setServicios([])
    setHasMore(true)
    fetchPage(0)
  }, [])

  return { servicios, hasMore, loading, error, loadMore, refetch }
}