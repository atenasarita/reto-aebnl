import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import GestionBeneficiarios from './pages/GestionBeneficiarios'
import Login from './pages/login'
import RegistroBeneficiario from './pages/registro_beneficiario'

import './App.css'
import Prerregistro from './Prerregistro.jsx'

function App() {
  const [page, setPage] = useState('login');

return (
    <BrowserRouter>
      <Routes>
        {/* Login primero */}
        <Route path="/" element={<Login />} />

        {/* Rutas con layout (navbar, etc.) */}
        <Route element={<MainLayout />}>
          <Route path="/beneficiarios" element={<GestionBeneficiarios />} />
          <Route path="/registro_beneficiario" element={<RegistroBeneficiario />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
