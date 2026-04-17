import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar/Navbar'

const RUTA_A_ENLACE_ACTIVO = {
  '/beneficiarios': 'Beneficiarios',
  '/registro_beneficiario': 'Beneficiarios',
  '/inventario': 'Inventario',
  '/busqueda_beneficiario': 'Servicios',  
}

function MainLayout() {
  const { pathname } = useLocation()
  const activeLink = RUTA_A_ENLACE_ACTIVO[pathname] ?? 'Beneficiarios'

  return (
    <>
      <Navbar activeLink={activeLink} />
      <main>
        <Outlet />
      </main>
    </>
  )
}

export default MainLayout