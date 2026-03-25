import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import GestionBeneficiarios from './pages/GestionBeneficiarios'

import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/beneficiarios" element={<GestionBeneficiarios />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
