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

  let storedUser = null;

  try {
    storedUser = JSON.parse(localStorage.getItem("user") || "null");
  } catch (error) {
    storedUser = null;
  }

  const navbarUser = storedUser
    ? {
        name: storedUser.nombres || storedUser.usuario || "USUARIO",
        role: storedUser.rol || "administrador",
        avatar: null,
      }
    : {
        name: "USUARIO DEMO",
        role: "administrador",
        avatar: null,
      };

  return (
    <>
      <Navbar activeLink={activeLink} user={navbarUser} />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default MainLayout;