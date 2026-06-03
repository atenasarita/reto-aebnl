/** @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} input */
function getValueMissingMessage(input) {
  if (input.tagName === 'SELECT') return 'Selecciona una opción.'
  return 'Completa este campo.'
}

/** @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} input */
function getRangeUnderflowMessage(input) {
  const min = input.min === '' ? '0' : input.min
  return `El valor debe ser mayor o igual a ${min}.`
}

/** @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} input */
function getRangeOverflowMessage(input) {
  if (input.max !== '') {
    return `El valor debe ser menor o igual a ${input.max}.`
  }

  return 'El valor es demasiado alto.'
}

/** @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} input */
function getLengthMessage(input) {
  const { validity } = input

  if (validity.tooLong && input.maxLength > 0) {
    return `Máximo ${input.maxLength} caracteres.`
  }

  if (validity.tooShort && input.minLength > 0) {
    return `Mínimo ${input.minLength} caracteres.`
  }

  return null
}

/** @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} input */
export function mensajeValidacionNativa(input) {
  const { validity } = input

  if (validity.valueMissing) return getValueMissingMessage(input)
  if (validity.rangeUnderflow) return getRangeUnderflowMessage(input)
  if (validity.rangeOverflow) return getRangeOverflowMessage(input)
  if (validity.stepMismatch) return 'Introduce un número válido.'
  if (validity.typeMismatch) return 'El formato no es válido.'
  if (validity.patternMismatch) return 'El formato no es válido.'

  return getLengthMessage(input) || 'Valor no válido.'
}

/** @param {EventTarget | null} target */
function isValidatableElement(target) {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
  )
}

/** @param {Event} e */
export function onInvalidCampoEspanol(e) {
  const el = e.target

  if (!isValidatableElement(el)) return

  el.setCustomValidity(mensajeValidacionNativa(el))
}

/** @param {Event} e */
export function onInputLimpiarValidacion(e) {
  const el = e.target

  if (!isValidatableElement(el)) return

  el.setCustomValidity('')
}

export const propsFormularioValidacionEs = {
  lang: 'es',
  onInvalidCapture: onInvalidCampoEspanol,
  onInputCapture: onInputLimpiarValidacion,
}
