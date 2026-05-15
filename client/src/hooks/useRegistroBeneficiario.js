import { useEffect, useRef, useState } from 'react';
import { limpiarSoloLetras, telefonoValido  } from '../utils/validator';
import { initialFormData, registroSteps } from '../utils/beneficiarioConstants';
import { validateField, validateStep } from '../utils/beneficiarioValidation';
import { buildBeneficiarioPayload } from '../utils/beneficiarioPayload';
import { fetchSiguienteFolio, createBeneficiario } from '../services/beneficiariosService';
import { API_URL } from '../utils/config';

export function useRegistroBeneficiario(navigate) {
  const [currentStep, setCurrentStep] = useState(0);
  const [folio, setFolio] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedSteps, setTouchedSteps] = useState([]);
  const [fechaRegistro] = useState(new Date().toISOString().split('T')[0]);
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [formData, setFormData] = useState(initialFormData(fechaRegistro));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fechaNacimientoRef = useRef(null);
  const fechaMembresiaRef = useRef(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const loadFolio = async () => {
      try {
        const token = localStorage.getItem('token');
        const siguienteFolio = await fetchSiguienteFolio(token);
        setFolio(siguienteFolio);
      } catch (err) {
        setError(String(err.message || err));
      }
    };

    loadFolio();
  }, []);

  const handleInputChange = (e) => {
    const {name, value} = e.target;

    let cleanValue = value;

    const camposSoloLetras = [
      'nombres',
      'apellido_paterno',
      'apellido_materno',
      'contacto_nombre',
      'contacto_parentesco',
      'padre_nombre',
      'madre_nombre'
    ]

    const camposTelefono = [
      'contacto_telefono',
      'telefono',
      'padre_telefono',
      'padre_telefono_casa',
      'padre_telefono_trabajo',
      'madre_telefono',
      'madre_telefono_casa',
      'madre_telefono_trabajo'
    ]

    if(camposSoloLetras.includes(name)){
      cleanValue = limpiarSoloLetras(value);
    }

    if(camposTelefono.includes(name)){
      cleanValue = value.replace(/\D/g, '').slice(0, 10);
    }

    if(name === 'valvula'){
      cleanValue = value === 'true';
    }

    if(name === 'CURP'){
      cleanValue = value.toUpperCase().slice(0, 18);
    }

    setFormData(prev => ({
      ...prev,
      [name]: cleanValue
    }));


    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;

    const newError = validateField(name, value);

    setFieldErrors(prev => ({
      ...prev,
      [name]: newError
    }));
    if (newError) return;

  };

  const handleTipoEspinasChange = (e) => {
    const { value, checked } = e.target;
    const id = parseInt(value);

    setFormData(prev => ({
      ...prev,
      tipo_espinas: checked
        ? [...prev.tipo_espinas, id]
        : prev.tipo_espinas.filter(t => t !== id)
    }));
  };

  const handleFotoChange = (fotoBase64) => {
    setFormData(prev => ({
      ...prev,
      fotografiaFile: fotoBase64?.file || null,
      fotografiaPreview: fotoBase64?.preview || "",
      fotografia: ""
    }));
    setError('');
  };

  const handleFotoError = (mensaje) => {
    setError(mensaje);
  };


  const calculateFechaVigencia = () => {
  const inicio = new Date(`${formData.fecha_inicio_membresia || fechaRegistro}T00:00:00`);
  if (Number.isNaN(inicio.getTime())) return '';

  const vigencia = new Date(inicio);
  vigencia.setMonth(vigencia.getMonth() + Number(formData.meses_membresia || 6));
  vigencia.setDate(vigencia.getDate() - 1);

  // Ajuste clave para evitar desfase
  const offset = vigencia.getTimezoneOffset();
  vigencia.setMinutes(vigencia.getMinutes() - offset);

  return vigencia.toISOString().split('T')[0];
};

  const handleNext = () => {
    setTouchedSteps(prev => [...new Set([...prev, currentStep])]);
    if (currentStep < registroSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const stepIsComplete = (index) => validateStep(index, formData, fechaNacimiento);
  const areAllStepsComplete = registroSteps.every((_, index) => stepIsComplete(index));

  const subirFotoBeneficiario = async (fotoFile, token) => {
    const formDataFoto = new FormData();

    formDataFoto.append("fotografia", fotoFile);

    const response = await fetch (`${API_URL}/api/beneficiarios/upload-foto`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formDataFoto
    });

    const data = await response.json();

    if(!response.ok){
      throw new Error(data.message || "Error al subir la fotografía");
    }
    return data.ruta;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const incompleteSteps = registroSteps
        .map((_, index) => ({
          index,
          isComplete: stepIsComplete(index)
        }))
        .filter(step => !step.isComplete);

      if (incompleteSteps.length > 0) {
        setError('Debes completar todos los apartados antes de registrar al beneficiario');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');

      let rutaFoto = "";

      if (formData.fotografiaFile){
        rutaFoto = await subirFotoBeneficiario(formData.fotografiaFile, token);
      }
      const payload = buildBeneficiarioPayload(
        {...formData,
          fotografia: rutaFoto
        },
        fechaRegistro, 
        fechaNacimiento
      );

      await createBeneficiario(payload, token);
      setFormData(prev => ({
        ...prev,
        fotografiaFile: null,
        fotografiaPreview: "",
        fotografia: rutaFoto
      }));
      setShowSuccessModal(true);

    } catch (err) {
  try {
    const parsed = JSON.parse(err.message);

    // Tomar el primer error que encuentre
    const firstKey = Object.keys(parsed)[0];
    const firstError = parsed[firstKey]?.[0];

    setError(firstError || 'Error al registrar');
  } catch {
    setError(err.message || 'Error inesperado');
  }
    } finally {
      setLoading(false);
    }
  };

  return {
    currentStep,
    folio,
    fieldErrors,
    touchedSteps,
    fechaRegistro,
    fechaNacimiento,
    formData,
    loading,
    error,
    fechaNacimientoRef,
    fechaMembresiaRef,
    showSuccessModal,
    setShowSuccessModal,
    setFechaNacimiento,
    handleInputChange,
    handleBlur,
    handleTipoEspinasChange,
    handleFotoChange,
    handleFotoError,
    calculateFechaVigencia,
    handleNext,
    handlePrev,
    handleSubmit,
    validateStep: stepIsComplete,
    areAllStepsComplete,
  };
}