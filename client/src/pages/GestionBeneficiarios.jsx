import { useState } from 'react'
import './styles/GestionBeneficiarios.css'
import SearchBar from '../components/ui/SearchBar'
import Dropdown from '../components/ui/Dropdown'
import Button from '../components/ui/Button'
import BeneficiarioGrid from '../components/layout/beneficiarios/BeneficiarioGrid/BenecifiarioGrid'

import { FiUserPlus, FiSearch } from 'react-icons/fi'

function GestionBeneficiarios() {
  const [query, setQuery] = useState('')

  const handleSearch = (value) => {
    setQuery(value)
    // TODO: filter your beneficiaries list here, e.g.
    // setFiltered( allBeneficiaries.filter(b => 
    //   b.name.toLowerCase().includes(value.toLowerCase()) ||
    //   b.folio.toLowerCase().includes(value.toLowerCase()) ||
    //   b.curp.toLowerCase().includes(value.toLowerCase())
    // ))
  }

  return (
    <>
      <main>
        <div className='content-container'> 
          <div className='description'> 
            <h1 className='title'>Gestion de Beneficiarios</h1>
            <h2 className='subtitle'>Administra los beneficiarios, estatus y diagnostico</h2>
          </div>

          <div className='filter-bar'>
            <SearchBar icon={<FiSearch/>} className='search-gestion' onSearch={handleSearch} debounceMs={250} />
            <Button className='buscar-beneficiarios-btn' onClick={() => console.log('clicked buscar')}> Buscar </Button>

            <Dropdown className='dropdown-gestion' />
            <Button className='nuevo-beneficiario-btn' iconLeft={<FiUserPlus style={{margin: '4px 0 0'}}/>} onClick={() => console.log('clicked nuevo beneficiario')}> Nuevo Beneficiario </Button>
          </div>

          <div className='main-grid-beneficiarios'>
            <BeneficiarioGrid />
          </div>

        </div>
      </main>
    </>
  )
}

export default GestionBeneficiarios