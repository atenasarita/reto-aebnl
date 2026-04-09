// Validación de nombres y apellidos (true / false)
export const soloLetras = (value) => {
    return /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/.test(value);
}

// Limpieza (string limpio) mientras el beneficiario escribe
export const limpiarSoloLetras = (value) => {
    return value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
}