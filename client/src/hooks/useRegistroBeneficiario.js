import { useEffect, useRef, useState } from 'react';
import { limpiarSoloLetras, telefonoValido } from '../utils/validator';
import { initialFormData, registroSteps } from '../utils/beneficiarioConstants';
import { validateField, validateStep } from '../utils/beneficiarioValidation';
import { buildBeneficiarioPayload } from '../utils/beneficiarioPayload';
import { fetchSiguienteFolio, createBeneficiario } from '../services/beneficiariosService';

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
    const { name, value } = e.target;

    if (
      name === 'nombres' ||
      name === 'apellido_paterno' ||
      name === 'apellido_materno' ||
      name === 'contacto_nombre' ||
      name === 'contacto_parentesco' ||
      name === 'padre_nombre' ||
      name === 'madre_nombre'
    ) {
      const limpio = limpiarSoloLetras(value);
      setFormData(prev => ({ ...prev, [name]: limpio }));
      return;
    }

    if (
      name === 'contacto_telefono' || 
      name === 'telefono' ||
      name === 'padre_telefono' ||
      name === 'padre_telefono_casa' ||
      name === 'padre_telefono_trabajo' ||
      name === 'madre_telefono' ||
      name === 'madre_telefono_casa' ||
      name === 'madre_telefono_trabajo'
    ) {
    const limpio = value.replace(/\D/g, '').slice(0, 10);
    setFormData(prev => ({ ...prev, [name]: limpio }));

    // Solo actualizar el error si el campo ya fue tocado (hubo blur previo)
    if (fieldErrors[name] !== undefined && fieldErrors[name] !== null) {
      if (limpio && !telefonoValido(limpio)) {
        setFieldErrors(prev => ({
          ...prev,
          [name]: 'No es un numero de telefono valido'
        }));
      } else {
        setFieldErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    }
    return;
  }

    if (name === 'valvula') {
      setFormData(prev => ({
        ...prev,
        [name]: value === 'true'
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validación en tiempo real
    const newError = validateField(name, value);

    setFieldErrors(prev => ({
      ...prev,
      [name]: newError
    }));

    // Si el campo ya es válido → quitar error global
    if (!newError) {
      setError('');
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const newError = validateField(name, value);

    setFieldErrors(prev => ({
      ...prev,
      [name]: newError
    }));
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
      fotografia: fotoBase64
    }));
    setError('');
  };

  const handleFotoError = (mensaje) => {
    setError(mensaje);
  };

  // const calculateFechaVigencia = () => {
  //   const inicio = new Date(formData.fecha_inicio_membresia);
  //   if (Number.isNaN(inicio.getTime())) return '';

  //   const vigencia = new Date(inicio);
  //   vigencia.setMonth(vigencia.getMonth() + Number(formData.meses_membresia));
  //   return vigencia.toISOString().split('T')[0];
  // };

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
      const payload = buildBeneficiarioPayload(formData, fechaRegistro, fechaNacimiento);

      await createBeneficiario(payload, token);
      alert('Beneficiario registrado exitosamente');
      navigate('/beneficiarios');
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
    areAllStepsComplete
  };
}