import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import GestionBeneficiarios from './pages/GestionBeneficiarios';
import Login from './pages/login';
import RegistroBeneficiario from './pages/registro_beneficiario';
import Dashboard from './pages/dashboard';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/beneficiarios" element={<GestionBeneficiarios />} />
          <Route path="/registro_beneficiario" element={<RegistroBeneficiario />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;