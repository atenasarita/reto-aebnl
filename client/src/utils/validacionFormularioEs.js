
/** @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} input */
export function mensajeValidacionNativa(input) {
  const v = input.validity

  if (v.valueMissing) {
    if (input.tagName === 'SELECT') return 'Selecciona una opción.'
    return 'Completa este campo.'
  }
  if (v.rangeUnderflow) {
    const min = input.min !== '' ? input.min : '0'
    return `El valor debe ser mayor o igual a ${min}.`
  }
  if (v.rangeOverflow) {
    const max = input.max
    return max !== ''
      ? `El valor debe ser menor o igual a ${max}.`
      : 'El valor es demasiado alto.'
  }
  if (v.stepMismatch) return 'Introduce un número válido.'
  if (v.typeMismatch) return 'El formato no es válido.'
  if (v.tooLong && input.maxLength > 0) {
    return `Máximo ${input.maxLength} caracteres.`
  }
  if (v.tooShort && input.minLength > 0) {
    return `Mínimo ${input.minLength} caracteres.`
  }
  if (v.patternMismatch) return 'El formato no es válido.'

  return 'Valor no válido.'
}

/** @param {Event} e */
export function onInvalidCampoEspanol(e) {
  const el = e.target
  if (
    el instanceof HTMLInputElement ||
    el instanceof HTMLSelectElement ||
    el instanceof HTMLTextAreaElement
  ) {
    el.setCustomValidity(mensajeValidacionNativa(el))
  }
}

/** @param {Event} e */
export function onInputLimpiarValidacion(e) {
  const el = e.target
  if (
    el instanceof HTMLInputElement ||
    el instanceof HTMLSelectElement ||
    el instanceof HTMLTextAreaElement
  ) {
    el.setCustomValidity('')
  }
}
  
export const propsFormularioValidacionEs = {
  lang: 'es',
  onInvalidCapture: onInvalidCampoEspanol,
  onInputCapture: onInputLimpiarValidacion,
}
