import './login.css';
import logo from '../assets/logo_aebnl.jpg';
import { FaUser, FaLock} from 'react-icons/fa';

function Login() {
    return(
        <div className='login-page'>
            <div className='login-card'>
                <div className='login-left'>
                    <img src={logo}
                    alt="Asociación de Espina Bifida" 
                    className='logo-main'/>

                    <div className='brand-text'>
                        <h1>ASEB</h1>
                        <h2>Administración</h2>
                    </div>
                </div>

                <div className='login-right'>
                    <div className='login-form-box'>
                        <h1 className='login-title'>Iniciar Sesión</h1>
                        <p className='login-subtitle'>Ingrese sus credenciales para acceder</p>

                        <div className='form-group'>
                            <label>Usuario</label>
                            <div className='input-box'>
                                <FaUser className="step-icon" /> <input type="text" placeholder='Usuario 1' /> 
                            </div>
                        </div>

                        <div className='form-group'>
                            <label>Contraseña</label>
                            <div className='input-box'>
                                <FaLock className="step-icon" /><input type="password" placeholder='********'/>
                            </div>
                        </div>

                        <div className='checkbox-row'>
                            <input type="checkbox" id='mostrar' />
                            <label htmlFor="mostrar" className='checkbox-label'>Mostrar Contraseña</label>
                        </div>

                        <button className='login-button'>Iniciar Sesión</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;