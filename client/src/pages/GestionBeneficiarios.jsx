import { useState } from 'react'
import Navbar from '../components/layout/Navbar/Navbar'

function GestionBeneficiarios() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Navbar activeLink="Beneficiarios" />
      <main>
        <h1>Gestion de Beneficiarios</h1>
        <h2>Administra los beneficiarios, estatus y diagnostico</h2>
        <div>
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
        </div>
      </main>
    </>
  )
}

export default GestionBeneficiarios