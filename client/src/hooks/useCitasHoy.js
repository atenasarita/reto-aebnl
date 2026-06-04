import { useState, useEffect } from "react"
import { API_URL } from '../utils/config'
import { todayDate } from '../utils/dateTime'
import { humanizeError } from '../utils/humanizeError'

const CACHE_KEY = 'aebnl_cache_citas_hoy'

function getCached() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null') } catch { return null }
}

export default function useAgendaHoy() {
  const [agendaItems, setAgendaItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function fetchAgenda() {
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")

      const res = await fetch(`${API_URL}/api/dashboard/agenda-hoy?fecha=${todayDate()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Error al cargar agenda")
      }

      setAgendaItems(data)
      localStorage.setItem(CACHE_KEY, JSON.stringify(data))

    } catch (err) {
      const cached = getCached()
      if (cached) {
        setAgendaItems(cached)
      } else {
        setError(humanizeError(err))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAgenda()
  }, [])

  return {
    agendaItems,
    loading,
    error,
    fetchAgenda,
  }
}