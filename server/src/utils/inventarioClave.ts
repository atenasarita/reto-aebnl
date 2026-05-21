/** Prefijo de 3 letras a partir de la descripción de categoría (p. ej. "Medicamentos" → "med"). */
export function prefijoClaveDesdeCategoria(descripcion: string | null | undefined): string {
    const sinAcentos = (descripcion ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    const soloLetras = sinAcentos.toLowerCase().replace(/[^a-z]/g, '');
    return (soloLetras + 'gen').slice(0, 3);
}

/** Formato `med-004` (prefijo + guion + al menos 3 dígitos). */
export function formatearClaveInventario(prefijo: string, numeroSecuencia: number): string {
    const pref = (prefijo.toLowerCase().replace(/[^a-z]/g, '') + 'gen').slice(0, 3);
    const n = Math.max(1, Math.floor(numeroSecuencia));
    const digitos = n >= 1000 ? String(n) : String(n).padStart(3, '0');
    return `${pref}-${digitos}`;
}

const PREFIJO_CLAVE_REGEX = /^[a-z]{3}$/;

function normalizarPrefijoClave(prefijo: string): string {
    return (prefijo.toLowerCase().replace(/[^a-z]/g, '') + 'gen').slice(0, 3);
}

/**
 * Siguiente consecutivo a partir de claves existentes con el mismo prefijo (p. ej. MED-003 → 4).
 */
export function siguienteNumeroClaveInventario(
    clavesExistentes: string[],
    prefijo: string,
    desfase = 0,
): number {
    const pref = normalizarPrefijoClave(prefijo);
    if (!PREFIJO_CLAVE_REGEX.test(pref)) {
        return 1 + desfase;
    }

    const patron = new RegExp(`^${pref}-(\\d+)$`, 'i');
    let maxSufijo = 0;

    for (const clave of clavesExistentes) {
        const coincidencia = String(clave ?? '').trim().match(patron);
        if (coincidencia) {
            maxSufijo = Math.max(maxSufijo, Number(coincidencia[1]));
        }
    }

    return maxSufijo + 1 + desfase;
}
