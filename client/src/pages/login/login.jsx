import '../styles/login.css';
import logo from '../../assets/espina.png';
import { FaUser, FaLock } from 'react-icons/fa';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/usuarios/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ usuario, contrasena }),
    });

    const text = await response.text();
    console.log("RAW RESPONSE:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Respuesta no es JSON");
    }

    if (!response.ok) {
      console.error("STATUS:", response.status);
      console.error("DATA:", data);
      throw new Error(data.message || 'Error en login');
    }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/beneficiarios');
    } catch (error) {
      setError(error.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='login-page'>
      <div className='login-card'>
        <div className='login-left'>
          <img
            src={logo}
            alt='Asociación de Espina Bífida de Nuevo León, A.B.P.'
            className='logo-main'
          />
          <div className='brand-text'>
            <h1>ASEB</h1>
            <h2>Administración</h2>
          </div>
        </div>

        <div className='login-right'>
          <form className='login-form-box' onSubmit={handleSubmit}>
            <h1 className='login-title'>Iniciar Sesión</h1>
            <p className='login-subtitle'>Ingrese sus credenciales para acceder</p>

            <div className='form-group'>
              <label>Usuario</label>
              <div className='input-box'>
                <FaUser className='step-icon' />
                <input
                  type='text'
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder='Usuario'
                  required
                />
              </div>
            </div>

            <div className='form-group'>
              <label>Contraseña</label>
              <div className='input-box'>
                <FaLock className='step-icon' />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder='********'
                  required
                />
              </div>
            </div>

            <div className='checkbox-row'>
              <input
                type='checkbox'
                id='mostrar'
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              <label htmlFor='mostrar' className='checkbox-label'>
                Mostrar Contraseña
              </label>
            </div>

            {error && <p className='login-error'>{error}</p>}

            <button className='login-button' type='submit' disabled={loading}>
              {loading ? 'Validando...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;