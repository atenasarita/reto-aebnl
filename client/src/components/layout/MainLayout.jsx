import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar/Navbar";

const RUTA_A_ENLACE_ACTIVO = {
  "/dashboard": "Tablero",
  "/tablero": "Tablero",

  "/beneficiarios": "Beneficiarios",
  "/registro_beneficiario": "Beneficiarios",
  "/registro_beneficiario/registro_beneficiario": "Beneficiarios",

  "/inventario": "Inventario",
  "/preregistro": "Preregistro",
  "/prerregistro": "Preregistro",
};

function MainLayout() {
  const { pathname } = useLocation();
  const activeLink = RUTA_A_ENLACE_ACTIVO[pathname] ?? "Beneficiarios";

  return (
    <>
      <Navbar activeLink={activeLink} />
      <main className="page-container">
        <Outlet />
      </main>
    </>
  );
}

export default MainLayout;