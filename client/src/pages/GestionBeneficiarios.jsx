import { useState } from 'react'
import '../App.css'
import Navbar from '../components/layout/Navbar/Navbar'

function GestionBeneficiarios() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Navbar activeLink="Beneficiarios" />
      <main>
        <h1>gestion de beneficiarios</h1>
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