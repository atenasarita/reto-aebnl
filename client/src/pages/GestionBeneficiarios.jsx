import { useState } from 'react'
import './styles/GestionBeneficiarios.css'
import SearchBar  from '../components/ui/SearchBar'

function GestionBeneficiarios() {
  return (
    <>
      <main>
        <div className='content-container'> 
          <div className='description'> 
            <h1 className='title'>Gestion de Beneficiarios</h1>
            <h2 className='subtitle'>Administra los beneficiarios, estatus y diagnostico</h2>
          </div>

          <div className='filter-bar'>
            < SearchBar/>
          </div>
        </div>
        

      </main>
    </>
  )
}

export default GestionBeneficiarios