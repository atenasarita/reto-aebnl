export const soloLetras = (value) => /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/.test(value);
export const limpiarSoloLetras = (value) => value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
export const validarCURP = (curp) => /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z]{2}$/.test(curp);
export const cpValido = (value) => /^\d{5}$/.test(value);
export const telefonoValido = (value) => /^\d{10}$/.test(value);
