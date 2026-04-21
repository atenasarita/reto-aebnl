import { soloLetras, validarCURP, cpValido, telefonoValido } from './validator';

export function validateField(name, value) {
  let error = '';

  switch (name) {
    case 'contacto_telefono':
      if (value && !telefonoValido(value)) {
        error = 'No es un numero de telefono valido';
      }
      break;

      case 'telefono':
      if (value && !telefonoValido(value)) {
        error = 'No es un numero de telefono valido';
      }
      break;

    case 'domicilio_cp':
      if (value && !cpValido(value)) {
        error = 'No es un codigo postal valido';
      }
      break;
    
    case 'nombres':
    case 'apellido_paterno':
    case 'apellido_materno':
    case 'contacto_nombre':
    case 'contacto_parentesco':
      if (value && !soloLetras(value)) {
        error = 'Solo se permiten letras';
      }
      break;

    case 'CURP':
      if (value && !validarCURP(value)) {
        error = 'CURP invalida';
      }
      break;

    default:
      break;
  }

  return error;
}

export function validateStep(stepIndex, formData, fechaNacimiento) {
  switch (stepIndex) {
    case 0:
      return (
        formData.nombres &&
        formData.apellido_paterno &&
        formData.apellido_materno &&
        validarCURP(formData.CURP) &&
        formData.genero &&
        formData.estado_nacimiento &&
        fechaNacimiento
      );

    case 1:
      return (
        formData.contacto_nombre &&
        telefonoValido(formData.contacto_telefono) &&
        formData.contacto_parentesco &&
        formData.tipo_sanguineo &&
        formData.tipo_espinas.length > 0 &&
        formData.alergias
      );

    case 2:
      return (
        formData.domicilio_calle &&
        cpValido(formData.domicilio_cp) &&
        formData.domicilio_ciudad &&
        formData.domicilio_estado
      );

    case 3:
      return (
        Boolean(formData.fecha_inicio_membresia) &&
        Number(formData.meses_membresia) > 0
      );

    default:
      return false;
  }
}