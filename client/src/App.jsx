import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";
import RequireAuth from "./components/auth/RequireAuth";
import RedirectIfAuth from "./components/auth/RedirectIfAuth";

// Auth / públicas
import Login from "./pages/login/login";

// Páginas internas (main)
import GestionBeneficiarios from "./pages/GestionBeneficiarios/GestionBeneficiarios";
import Preregistro from "./pages/preregistro/Preregistro";
import Inventario from "./pages/inventario/Inventario";
import RegistroBeneficiario from "./pages/registro_beneficiario/registro_beneficiario";
import Recibos from './pages/Recibos/Recibos' 
import Reportes from "./pages/reportes/Reportes/Reportes";
import ReporteGeneral from "./pages/reportes/ReporteGeneral/ReporteGeneral";
import ReporteInventario from "./pages/reportes/ReporteInventario/ReporteInventario";
import ReporteAnual from "./pages/reportes/ReporteAnual/ReporteAnual";
import ReportesMensual from "./pages/reportes/ReportesMensual/ReportesMensual";
import ReportePersonalizado from "./pages/reportes/ReportePersonalizado/ReportePersonalizado";
import Citas from './pages/Citas/AgendaCitas';
import Dashboard from "./pages/dashboard";
import RegistroServicios from "./pages/Servicios/RegistroServicios";

import Servicios from "./pages/Servicios/Servicios";

import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route
          path="/login"
          element={
            <RedirectIfAuth>
              <Login />
            </RedirectIfAuth>
          }
        />
        <Route path="/preregistro" element={<Preregistro />} />

        {/* Privadas: requieren sesión activa */}
        <Route element={<RequireAuth />}>
          <Route element={<MainLayout />}>
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Beneficiarios */}
          <Route path="/beneficiarios" element={<GestionBeneficiarios />} />

          {/* Registro de Nuevo Beneficiario */}
          <Route path="/registro_beneficiario" element={<RegistroBeneficiario /> }/>

          {/* Registro de Servicios */}
          <Route path="/registro_servicios" element={<RegistroServicios />} />
          <Route path="/servicios" element={<Servicios />} />


          {/* Inventario */}
          <Route path="/inventario" element={<Inventario />} />

          {/* Citas */}
          <Route path="/citas" element={<Citas />} />


            {/*Recibos  */}
          <Route path="/recibos" element={<Recibos />} />
          <Route path="/reportes" element={<Reportes />}>
            <Route index element={<Navigate to="general" replace />} />
            <Route path="general" element={<ReporteGeneral />} />
            <Route path="inventario" element={<ReporteInventario />} />
            <Route path="mensual" element={<ReportesMensual />} />
            <Route path="anual" element={<ReporteAnual />} />
            <Route path="personalizado" element={<ReportePersonalizado />} />
          </Route>

          {/* Citas */}
          <Route path="/citas" element={<Citas />} />

          {/* Default */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}