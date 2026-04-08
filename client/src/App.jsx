import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import GestionBeneficiarios from './pages/GestionBeneficiarios/GestionBeneficiarios'
import Login from './pages/login/login'
import RegistroBeneficiario from './pages/registro_beneficiario/registro_beneficiario'

import './App.css'
import Prerregistro from './pages/Prerregistro/Prerregistro'

function App() {
return (
    <BrowserRouter>
      <Routes>
        {/* Login primero */}
        <Route path="/" element={<Login />} />
        <Route path="/prerregistro" element={<Prerregistro />} />

        {/* Rutas con layout (navbar, etc.) */}
        <Route element={<MainLayout />}>
          <Route path="/beneficiarios" element={<GestionBeneficiarios />} />
          <Route path="/registro_beneficiario" element={<RegistroBeneficiario />} />
          <Route path="/prerregistro" element={<Prerregistro />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
