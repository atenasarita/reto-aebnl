import { useState, useEffect } from 'react'
import '../styles/GestionBeneficiarios.css'
import SearchBar from '../../components/ui/SearchBar'
import Dropdown from '../../components/ui/Dropdown'
import Button from '../../components/ui/Button'
import BeneficiarioGrid from '../../components/layout/beneficiarios/BeneficiarioGrid/BenecifiarioGrid'
import { FiUserPlus, FiSearch } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL;


// 1. Fix ESTATUS_OPTIONS — lowercase to match API
const ESTATUS_OPTIONS = [
  { label: 'Todos',         value: ''               },
  { label: 'Activo',        value: 'activo'         }, 
  { label: 'Inactivo',      value: 'inactivo'       }, 
  { label: 'Por vencer',    value: 'por-vencer'     },
]

function GestionBeneficiarios() {
  const [all, setAll]           = useState([])   // raw list from API
  const [filtered, setFiltered] = useState([])   // what the grid shows
  const [query, setQuery]       = useState('')
  const [estatus, setEstatus]   = useState('')   // '' = show all
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const navigate = useNavigate();

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
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar beneficiarios')
      }

      setAll(data)
      setFiltered(data)
    } catch (err) {
      setError(err.message || 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let result = all

    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter(b =>
        `${b.identificadores.nombres} ${b.identificadores.apellido_paterno}`.toLowerCase().includes(q) ||
        b.folio.toLowerCase().includes(q)   
      )
    }

    if (estatus) {
      if (estatus === 'por-vencer') {
        result = result.filter(b => b.dias_para_vencer !== undefined && b.dias_para_vencer !== null && b.dias_para_vencer >= 0 && b.dias_para_vencer <= 7)
      } else {
        result = result.filter(b => b.estado === estatus) 
      }
    }

    setFiltered(result)
  }, [query, estatus, all])

  async function handleBuscar() {
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
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'No se encontró el beneficiario')
      }

      // endpoint returns a single object, wrap in array for the grid
      setFiltered(Array.isArray(data) ? data : [data])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <div className='content-container'>
        <div className='description'>
          <h1 className='title'>Gestion de Beneficiarios</h1>
          <h2 className='subtitle'>Administra los beneficiarios, estatus y diagnostico</h2>
        </div>

        <div className='filter-bar'>
          <Dropdown
            className='dropdown-gestion'
            options={ESTATUS_OPTIONS}
            value={estatus}
            onChange={(val) => setEstatus(val)}
          />

          <SearchBar
            icon={<FiSearch />}
            className='search-gestion'
            onSearch={setQuery}          // just update query, useEffect does the rest
            debounceMs={250}
          />
          <Button className='buscar-beneficiarios-btn' onClick={handleBuscar}>
            Buscar
          </Button>

  
          <Button
            className='nuevo-beneficiario-btn'
            iconLeft={<FiUserPlus style={{ margin: '4px 0 0' }} />}
            onClick={() => navigate('/registro_beneficiario')}
          >
            Nuevo Beneficiario
          </Button>
        </div>

        {error && <p className='error-msg'>{error}</p>}

        <div className='main-grid-beneficiarios'>
          <BeneficiarioGrid data={filtered} loading={loading} />
        </div>
      </div>
    </main>
  )
}

export default GestionBeneficiarios
