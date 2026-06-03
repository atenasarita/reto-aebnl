import "../styles/login.css";
import navLogo from "../../assets/espina.png";
import { Lock, User } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { AEBNL_ASSETS } from "../../constants/aebnlSiteAssets";
import { API_URL } from "../../utils/config";
import { saveSession } from "../../utils/auth";

function Login() {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, contrasena }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Usuario o contraseña incorrectos");
      }

      saveSession(data.token, data.user);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg" aria-hidden>
        <img
          src={AEBNL_ASSETS.consultasPhotos[0]}
          alt=""
          className="login-bg-photo"
        />
        <div className="login-bg-overlay" />
      </div>

      <header className="login-nav-outer">
        <nav className="login-nav-pill" aria-label="Acceso">
          <Link to="/" className="login-nav-brand" aria-label="Inicio">
            <img src={navLogo} alt="AEBNL" />
          </Link>
          <Link to="/" className="login-nav-back">
            Volver al sitio
          </Link>
        </nav>
      </header>

      <div className="login-shell">
        <aside className="login-brand" aria-hidden="true">
          <p className="login-brand-eyebrow">Asociación Espina Bífida NL</p>
          <h1 className="login-brand-title">
            Sistema<br />administrativo
          </h1>
          <p className="login-brand-copy">
            Acceso reservado al equipo de la asociación.
          </p>
        </aside>

        <div className="login-card">
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-form-head">
              <h2 className="login-title">Iniciar sesión</h2>
              <p className="login-subtitle">Ingresa tus credenciales de acceso</p>
            </div>

            <div className="login-field">
              <label htmlFor="login-usuario">Usuario</label>
              <div className="login-input-wrap">
                <User size={18} className="login-input-icon" aria-hidden />
                <input
                  id="login-usuario"
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="Tu usuario"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="login-contrasena">Contraseña</label>
              <div className="login-input-wrap">
                <Lock size={18} className="login-input-icon" aria-hidden />
                <input
                  id="login-contrasena"
                  type={showPassword ? "text" : "password"}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="Contraseña"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <label className="login-check">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              <span>Mostrar contraseña</span>
            </label>

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            <button className="login-submit" type="submit" disabled={loading}>
              {loading ? "Validando..." : "Entrar al sistema"}
            </button>

            <p className="login-footer-note">
              ¿Nuevo beneficiario?{" "}
              <a href="/#preregistro" className="login-footer-link">
                Inicia pre-registro
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
