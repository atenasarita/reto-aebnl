import { useState, useEffect } from "react"

const API_URL = "http://localhost:3000/api"

export default function useAgendaHoy() {
  const [agendaItems, setAgendaItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function fetchAgenda() {
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")

      const res = await fetch(`${API_URL}/dashboard/agenda-hoy`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Error al cargar agenda")
      }

      setAgendaItems(data)

    } catch (err) {
      setError(err.message || "Error de conexión")
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