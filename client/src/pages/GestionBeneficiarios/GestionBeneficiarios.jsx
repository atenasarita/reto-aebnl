import { useState, useEffect, useMemo } from 'react'
import '../styles/GestionBeneficiarios.css'
import useBeneficiarios from '../../hooks/useBeneficiarios'
import SearchBar from '../../components/ui/SearchBar'
import Dropdown from '../../components/ui/Dropdown'
import Button from '../../components/ui/Button'
import BeneficiarioGrid from '../../components/layout/beneficiarios/BeneficiarioGrid/BeneficiarioGrid'


import { FiUserPlus, FiSearch } from 'react-icons/fi'


const ESTATUS_OPTIONS = [
  { label: 'Todos',    value: ''         },
  { label: 'Activo',   value: 'activo'   }, 
  { label: 'Inactivo', value: 'inactivo' }, 
]

function GestionBeneficiarios() {
  const { data, loading, error, buscarPorFolio } = useBeneficiarios()

  const [query, setQuery] = useState('')
  const [estatus, setEstatus] = useState('')

  const filtered = useMemo(() => {
    if (!estatus) return data
    return data.filter(b => b.estado === estatus)
  }, [data, estatus])

  function handleBuscar() {
    buscarPorFolio(query)
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
            placeholder='Buscar por nombre, folio o CURP...'
            icon={<FiSearch />}
            className='search-gestion'
            onSearch={setQuery}          
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