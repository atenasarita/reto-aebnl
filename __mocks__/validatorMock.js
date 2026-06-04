export const limpiarSoloLetras = (v) => v.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '');
export const validarCURP = (v) => v.length === 18;