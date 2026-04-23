export function buildBeneficiarioPayload(formData, fechaRegistro, fechaNacimiento) {
  return {
    fecha_ingreso: new Date(fechaRegistro),
    genero: formData.genero,
    tipo_espinas: formData.tipo_espinas,
    identificadores: {
      CURP: formData.CURP,
      nombres: formData.nombres,
      apellido_paterno: formData.apellido_paterno,
      apellido_materno: formData.apellido_materno,
      fecha_nacimiento: new Date(fechaNacimiento),
      estado_nacimiento: formData.estado_nacimiento,
      fotografia: formData.fotografia,
      telefono: formData.telefono,
      email: formData.email
    },
    datos_medicos: {
      contacto_nombre: formData.contacto_nombre,
      contacto_telefono: formData.contacto_telefono,
      contacto_parentesco: formData.contacto_parentesco,
      alergias: formData.alergias,
      tipo_sanguineo: formData.tipo_sanguineo,
      valvula: formData.valvula === true || formData.valvula === 'true',
      hospital: formData.hospital,
      padres: [
        {
          tipo_padre: 'padre',
          nombre_completo: formData.padre_nombre || null,
          fecha_nacimiento: formData.padre_fecha_nacimiento || null,
          email: formData.padre_email || null,
          telefono: formData.padre_telefono || null,
          telefono_casa: formData.padre_telefono_casa || null,
          telefono_trabajo: formData.padre_telefono_trabajo || null,
        },
        {
          tipo_padre: 'madre',
          nombre_completo: formData.madre_nombre || null,
          fecha_nacimiento: formData.madre_fecha_nacimiento || null,
          email: formData.madre_email || null,
          telefono: formData.madre_telefono || null,
          telefono_casa: formData.madre_telefono_casa || null,
          telefono_trabajo: formData.madre_telefono_trabajo || null,
        }
      ]
    },
    direccion: {
      domicilio_calle: formData.domicilio_calle,
      domicilio_cp: formData.domicilio_cp,
      domicilio_ciudad: formData.domicilio_ciudad,
      domicilio_estado: formData.domicilio_estado
    },
    membresia: {
      fecha_inicio: new Date(formData.fecha_inicio_membresia),
      meses: Number(formData.meses_membresia),
      precio_mensual: 0,
      metodo_pago: 'donacion'
    }
  };
}