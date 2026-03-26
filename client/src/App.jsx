import { useState } from "react";
import "./App.css";

function App() {
  const [folio, setFolio] = useState("");
  const [beneficiario, setBeneficiario] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const consultarBeneficiario = async () => {
    if (!folio.trim()) {
      setError("Ingresa un folio.");
      setBeneficiario(null);
      return;
    }

    try {
      setCargando(true);
      setError("");
      setBeneficiario(null);

      const response = await fetch(`http://localhost:3000/api/beneficiarios/${folio}`);

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(data?.message || "No se pudo consultar el beneficiario.");
      }

      setBeneficiario(data);
    } catch (err) {
      setError(err.message || "Ocurrió un error.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="pagina">
      <div className="contenedor">
        <h1>Consulta de Beneficiarios</h1>
        <p className="subtexto">     --- </p>

        <div className="busqueda">
          <input
            type="text"
            placeholder="Ejemplo: AEB-0001"
            value={folio}
            onChange={(e) => setFolio(e.target.value)}
          />
          <button onClick={consultarBeneficiario}>Consultar</button>
        </div>

        {cargando && <p className="cargando">Consultando...</p>}
        {error && <p className="error">{error}</p>}

        {beneficiario && (
          <div className="tarjeta">
            <h2>Datos generales</h2>
            <p><strong>ID:</strong> {beneficiario.id_beneficiario}</p>
            <p><strong>Folio:</strong> {beneficiario.folio}</p>
            <p><strong>Fecha de ingreso:</strong> {beneficiario.fecha_ingreso || "Sin dato"}</p>
            <p><strong>Género:</strong> {beneficiario.genero || "Sin dato"}</p>
            <p><strong>Estado:</strong> {beneficiario.estado || "Sin dato"}</p>
            <p><strong>Tipo de espina bífida:</strong> {beneficiario.tipo_espina?.nombre || "Sin dato"}</p>

            <h2>Identificadores</h2>
            <p><strong>CURP:</strong> {beneficiario.identificadores?.curp || "Sin dato"}</p>
            <p>
              <strong>Nombre:</strong>{" "}
              {[
                beneficiario.identificadores?.nombres,
                beneficiario.identificadores?.apellido_paterno,
                beneficiario.identificadores?.apellido_materno,
              ]
                .filter(Boolean)
                .join(" ") || "Sin dato"}
            </p>
            <p><strong>Fecha de nacimiento:</strong> {beneficiario.identificadores?.fecha_nacimiento || "Sin dato"}</p>
            <p><strong>Teléfono:</strong> {beneficiario.identificadores?.telefono || "Sin dato"}</p>
            <p><strong>Email:</strong> {beneficiario.identificadores?.email || "Sin dato"}</p>

            <h2>Datos médicos</h2>
            <p><strong>Contacto:</strong> {beneficiario.datos_medicos?.contacto_nombre || "Sin dato"}</p>
            <p><strong>Teléfono contacto:</strong> {beneficiario.datos_medicos?.contacto_telefono || "Sin dato"}</p>
            <p><strong>Parentesco:</strong> {beneficiario.datos_medicos?.contacto_parentesco || "Sin dato"}</p>
            <p><strong>Alergias:</strong> {beneficiario.datos_medicos?.alergias || "Sin dato"}</p>
            <p><strong>Tipo sanguíneo:</strong> {beneficiario.datos_medicos?.tipo_sanguineo || "Sin dato"}</p>

            <h2>Dirección</h2>
            <p><strong>Calle:</strong> {beneficiario.direccion?.domicilio_calle || "Sin dato"}</p>
            <p><strong>CP:</strong> {beneficiario.direccion?.domicilio_cp || "Sin dato"}</p>
            <p><strong>Ciudad:</strong> {beneficiario.direccion?.domicilio_ciudad || "Sin dato"}</p>
            <p><strong>Estado:</strong> {beneficiario.direccion?.domicilio_estado || "Sin dato"}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;