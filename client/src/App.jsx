import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import GestionBeneficiarios from './pages/GestionBeneficiarios'
import Login from './pages/login'
import RegistroBeneficiario from './pages/registro_beneficiario'

import './App.css'

function App() {
return (
    <BrowserRouter>
      <Routes>
        {/* Login primero */}
        <Route path="/" element={<Login />} />

        {/* Rutas con layout (navbar, etc.) */}
        <Route element={<MainLayout />}>
          <Route path="/GestionBeneficiarios" element={<GestionBeneficiarios />} />
          <Route path="/registro_beneficiario" element={<RegistroBeneficiario />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
