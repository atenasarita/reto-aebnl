// Validación de nombres y apellidos (true / false)
export const soloLetras = (value) => {
    return /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/.test(value);
}

// Limpieza (string limpio) mientras el beneficiario escribe
export const limpiarSoloLetras = (value) => {
    return value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
}

export const validarCURP = (curp) => {
    const regex = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z]{2}$/;
    return regex.test(curp);
};