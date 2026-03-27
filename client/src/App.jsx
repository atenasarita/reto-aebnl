import './App.css';
import { useState } from 'react';
import RegistroBeneficiario from './pages/registro_beneficiario';
import Login from './pages/login';

function App() {
  const [page, setPage] = useState('login');

  return (
    <>
      {page === 'login' && <Login onLoginSuccess={() => setPage('registro')} />}
      {page === 'registro' && <RegistroBeneficiario />}
    </>
  );
}

export default App;
