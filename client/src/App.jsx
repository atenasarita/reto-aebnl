import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";

import Login from "./pages/login/login";
import Dashboard from "./pages/dashboard";

import GestionBeneficiarios from "./pages/GestionBeneficiarios/GestionBeneficiarios";
import RegistroBeneficiario from "./pages/registro_beneficiario/registro_beneficiario";

import Prerregistro from "./pages/prerregistro/Prerregistro";
import Inventario from "./pages/inventario/Inventario";
import RegistroServicios from "./pages/RegistroServicios/BusquedaBeneficiarioVista";

import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/" element={<Login />} />

        {/* App con Layout */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/beneficiarios" element={<GestionBeneficiarios />} />
          <Route path="/registro_beneficiario" element={<RegistroBeneficiario />} />
          <Route path="/prerregistro" element={<Prerregistro />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/registro_servicios" element={<RegistroServicios />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}