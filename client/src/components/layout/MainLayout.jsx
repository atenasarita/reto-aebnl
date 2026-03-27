import { Outlet } from 'react-router-dom'
import Navbar from './Navbar/Navbar'

function MainLayout() {
  return (
    <>
      <Navbar activeLink="Beneficiarios" />
      <main>
        <Outlet />
      </main>
    </>
  )
}

export default MainLayout