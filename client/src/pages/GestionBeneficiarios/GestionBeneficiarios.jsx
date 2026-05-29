import { useState, useEffect } from 'react'
import '../styles/GestionBeneficiarios.css'
import SearchBar from '../../components/ui/SearchBar'
import Dropdown from '../../components/ui/Dropdown'
import Button from '../../components/ui/Button'
import BeneficiarioGrid from '../../components/layout/beneficiarios/BeneficiarioGrid/BenecifiarioGrid'
import { FiUserPlus, FiSearch } from 'react-icons/fi'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { API_URL } from '../../utils/config'


const ESTATUS_OPTIONS = [
  { label: 'Todos', value: '' },
  { label: 'Activo', value: 'activo' },
  { label: 'Inactivo', value: 'inactivo' },
  { label: 'Por vencer', value: 'por-vencer' },
]

function GestionBeneficiarios() {
  const [all, setAll] = useState([])
  const [filtered, setFiltered] = useState([])
  const [query, setQuery] = useState('')
  const [estatus, setEstatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const beneficiarioEditId = searchParams.get('edit')

  useEffect(() => {
    fetchBeneficiarios()
  }, [])

  async function fetchBeneficiarios() {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/beneficiarios`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar beneficiarios')
      }

      setAll(data)

      if (beneficiarioEditId) {
        const soloBeneficiarioEditado = data.filter(
          (b) => b.id_beneficiario === Number(beneficiarioEditId)
        )
        setFiltered(soloBeneficiarioEditado)
      } else {
        setFiltered(data)
      }
    } catch (err) {
      setError(err.message || 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let result = all

    if (beneficiarioEditId && !query.trim() && !estatus) {
      result = all.filter(
        (b) => b.id_beneficiario === Number(beneficiarioEditId)
      )
      setFiltered(result)
      return
    }

    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter(
        (b) =>
          `${b.identificadores.nombres} ${b.identificadores.apellido_paterno}`.toLowerCase().includes(q) ||
          b.folio.toLowerCase().includes(q)
      )
    }

    if (estatus) {
      if (estatus === 'por-vencer') {
        result = result.filter(
          (b) =>
            b.dias_para_vencer !== undefined &&
            b.dias_para_vencer !== null &&
            b.dias_para_vencer >= 0 &&
            b.dias_para_vencer <= 7
        )
      } else {
        result = result.filter((b) => b.estado === estatus)
      }
    }

    setFiltered(result)
  }, [query, estatus, all, beneficiarioEditId])

  function clearEditQuery() {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('edit')
    setSearchParams(nextParams)
  }

  async function handleBuscar() {
    clearEditQuery()

    if (!query.trim()) {
      fetchBeneficiarios()
      return
    }

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/beneficiarios/folio/${query.trim()}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'No se encontró el beneficiario')
      }

      setFiltered(Array.isArray(data) ? data : [data])
    } catch (err) {
      setError(err.message || 'Error al buscar beneficiario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="gestion-beneficiarios">
      <div className="description page-header">
        <h1 className="page-header-title">Gestion de Beneficiarios</h1>
        <p className="page-header-subtitle">
          Administra los beneficiarios, estatus y diagnostico
        </p>
      </div>

      <div className="filter-bar">
        <div className="filter-bar__group filter-bar__group--filters">
          <Dropdown
            className="dropdown-gestion"
            options={ESTATUS_OPTIONS}
            value={estatus}
            onChange={(val) => setEstatus(val)}
          />

          <SearchBar
            icon={<FiSearch />}
            className="search-gestion"
            onSearch={setQuery}
            debounceMs={250}
          />

          <Button className="buscar-beneficiarios-btn" onClick={handleBuscar}>
            Buscar
          </Button>
        </div>

        <div className="filter-bar__group filter-bar__group--primary">
          <Button
            className="nuevo-beneficiario-btn"
            iconLeft={<FiUserPlus aria-hidden />}
            onClick={() => navigate('/registro_beneficiario')}
          >
            Nuevo Beneficiario
          </Button>
        </div>
      </div>

      {error && <p className="error-msg">{error}</p>}

      <div className="main-grid-beneficiarios">
        <BeneficiarioGrid
          data={filtered}
          loading={loading}
          onRefresh={fetchBeneficiarios}
          beneficiarioEditId={beneficiarioEditId ? Number(beneficiarioEditId) : null}
          clearEditQuery={clearEditQuery}
        />
      </div>
    </div>
  )
}

export default GestionBeneficiarios