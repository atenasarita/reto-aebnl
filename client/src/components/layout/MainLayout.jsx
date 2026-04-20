import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar/Navbar";

const RUTA_A_ENLACE_ACTIVO = {
  "/dashboard": "Tablero",
  "/beneficiarios": "Beneficiarios",
  "/registro_beneficiario": "Beneficiarios",
  "/prerregistro": "Prerregistro",
  "/servicios": "Servicios",
  "/inventario": "Inventario",
  "/citas": "Citas",
  "/reportes": "Reportes",
};

function MainLayout() {
  const { pathname } = useLocation();
  const activeLink = RUTA_A_ENLACE_ACTIVO[pathname] ?? "Tablero";

  return (
    <>
      <Navbar activeLink={activeLink} />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default MainLayout;