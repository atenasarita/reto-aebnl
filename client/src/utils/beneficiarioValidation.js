import { soloLetras, validarCURP, cpValido, telefonoValido } from './validator';

const req_field = "Favor de llenar este campo"

export function validateField(name, value) {
  let error = '';

  switch (name) {
    case 'contacto_telefono':
    case 'telefono':
      if (value && value.length < 10 && !telefonoValido(value)) {
        error = 'No es un numero de telefono valido';
      }
      break;

    case 'domicilio_cp':
      if (value &&  value.length < 5 &&  !cpValido(value)) {
        error = 'No es un codigo postal valido';
      }
      break;
    
    case 'nombres':
    case 'apellido_paterno':
    case 'apellido_materno':
    case 'contacto_nombre':
    case 'contacto_parentesco':
      if (value &&  !soloLetras(value)) {
        error = 'Solo se permiten letras';
      }
      break;

    case 'CURP':
      if (value && value.length < 18 ) {
        error = 'CURP invalida';
      } else if(value && !validarCURP(value)){
        error = 'CURP invalida';
      }
      break;

    default:
      break;
  }

  return error;
}

const addRequiredError = (errors, fieldName, value) => {
  if(!value){
    errors[fieldName] = req_field;
  }
};

export function validateStepFields(stepIndex, formData, fechaNacimiento) {
  const errors = {};

  switch (stepIndex) {
    case 0:
      addRequiredError(errors, 'nombres', formData.nombres);
      addRequiredError(errors, 'telefono', formData.telefono);
      addRequiredError(errors, 'apellido_paterno', formData.apellido_paterno);
      addRequiredError(errors, 'apellido_materno', formData.apellido_materno);
      addRequiredError(errors, 'CURP', formData.CURP);
      addRequiredError(errors, 'genero', formData.genero);
      addRequiredError(errors, 'estado_nacimiento', formData.estado_nacimiento);
      addRequiredError(errors, 'fecha_nacimiento', fechaNacimiento);
      
      if (formData.CURP && !validarCURP(formData.CURP)) {
        errors.CURP = 'CURP invalida';
      }

      break;

    case 1:
      addRequiredError(errors, 'contacto_nombre', formData.contacto_nombre);
      addRequiredError(errors, 'contacto_telefono', formData.contacto_telefono);
      addRequiredError(errors, 'contacto_parentesco', formData.contacto_parentesco);
      addRequiredError(errors, 'tipo_sanguineo', formData.tipo_sanguineo);
      addRequiredError(errors, "hospital", formData.hospital);

      if (!formData.tipo_espinas || formData.tipo_espinas.length === 0) {
        errors.tipo_espinas = 'Favor de seleccionar al menos una opción';
      }

      if (formData.contacto_telefono && !telefonoValido(formData.contacto_telefono)) {
        errors.contacto_telefono = 'No es un numero de telefono valido';
      }

      break;

    case 2:
      addRequiredError(errors, 'domicilio_calle', formData.domicilio_calle);
      addRequiredError(errors, 'domicilio_cp', formData.domicilio_cp);
      addRequiredError(errors, 'domicilio_ciudad', formData.domicilio_ciudad);
      addRequiredError(errors, 'domicilio_estado', formData.domicilio_estado);

      if (formData.domicilio_cp && !cpValido(formData.domicilio_cp)) {
        errors.domicilio_cp = 'No es un codigo postal valido';
      }

      break;

    case 3:
      addRequiredError(errors, 'fecha_inicio_membresia', formData.fecha_inicio_membresia);

      if (!formData.meses_membresia || Number(formData.meses_membresia) <= 0) {
        errors.meses_membresia = req_field;
      }

      break;

    default:
      break;
  }

  return errors;
}

export function validateStep(stepIndex, formData, fechaNacimiento) {
  const errors = validateStepFields(stepIndex, formData, fechaNacimiento);
  return Object.keys(errors).length === 0;
}