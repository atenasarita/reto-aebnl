import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar/Navbar";

const RUTAS_NAV = [
  { prefix: "/registro_beneficiario", label: "Beneficiarios", exact: true },
  { prefix: "/beneficiarios", label: "Beneficiarios" },
  { prefix: "/prerregistro", label: "Prerregistro" },
  { prefix: "/servicios", label: "Servicios" },
  { prefix: "/inventario", label: "Inventario" },
  { prefix: "/citas", label: "Citas" },
  { prefix: "/reportes", label: "Reportes" },
  { prefix: "/recibos", label: "Recibos" },
  { prefix: "/dashboard", label: "Tablero" },
];

function resolveActiveNavLabel(pathname) {
  for (const { prefix, label, exact } of RUTAS_NAV) {
    if (exact) {
      if (pathname === prefix) return label;
      continue;
    }
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return label;
  }
  return "Tablero";
}

function MainLayout() {
  const { pathname } = useLocation();
  const activeLink = resolveActiveNavLabel(pathname);

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
        role: "Administrador",
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