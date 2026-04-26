import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";

// Auth / públicas
import Login from "./pages/login/login";

// Páginas internas (main)
import GestionBeneficiarios from "./pages/GestionBeneficiarios/GestionBeneficiarios";
import Prerregistro from "./pages/prerregistro/Prerregistro";
import Inventario from "./pages/inventario/Inventario";
import RegistroBeneficiario from "./pages/registro_beneficiario/registro_beneficiario";
import Recibos from './pages/Recibos/Recibos' 
import Reportes from "./pages/reportes/Reportes";

// Dashboard del tablero (elige UNA línea según tu estructura)
// Si tu dashboard está en: client/src/pages/dashboard.jsx
import Dashboard from "./pages/dashboard";

// Si lo moviste a: client/src/pages/dashboard/Dashboard.jsx
// import Dashboard from "./pages/dashboard/Dashboard";

import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pública */}
        <Route path="/login" element={<Login />} />

        {/* Privadas dentro del layout (Navbar + etc) */}
        <Route element={<MainLayout />}>
          {/* ✅ Este es el cambio clave: /dashboard usa TU tablero */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Beneficiarios */}
          <Route path="/beneficiarios" element={<GestionBeneficiarios />} />

          {/* Registro de Nuevo Beneficiario */}
          <Route path="/registro_beneficiario" element={<RegistroBeneficiario /> }/>

          {/* Prerregistro */}
          <Route path="/prerregistro" element={<Prerregistro />} />

          {/* Inventario */}
          <Route path="/inventario" element={<Inventario />} />
            
          <Route path="/recibos" element={<Recibos />} />
          <Route path="/reportes" element={<Reportes />} />

          {/* Default */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}