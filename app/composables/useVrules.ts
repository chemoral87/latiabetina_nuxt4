const vrules = {
  required: (value: unknown) => {
    if (value === null || value === undefined) return "El campo es obligatorio."
    if (typeof value === "string") return value.trim().length > 0 || "El campo es obligatorio."
    if (typeof value === "number") return true
    if (Array.isArray(value)) return value.length > 0 || "El campo es obligatorio."
    return true
  },

  requiredField: (fieldName: string) => (value: unknown) => {
    const result = vrules.required(value)
    if (typeof result === 'string' && result.startsWith('El campo')) {
      return `El campo ${fieldName} es obligatorio.`
    }
    return result
  },

  email: (value: unknown) => {
    if (!value) return true
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(String(value)) || "El campo debe ser una dirección de correo válida."
  },

  minLength: (min: number) => (value: unknown) => {
    if (!value) return true
    return (String(value).length >= min) || `El campo debe tener al menos ${min} caracteres.`
  },

  maxLength: (max: number) => (value: unknown) => {
    if (!value) return true
    return (String(value).length <= max) || `El campo no debe tener más de ${max} caracteres.`
  },

  between: (min: number, max: number) => (value: unknown) => {
    if (!value) return true
    const len = String(value).length
    return (len >= min && len <= max) || `El campo debe tener entre ${min} y ${max} caracteres.`
  },

  numeric: (value: unknown) => {
    if (value === null || value === undefined || value === "") return true
    return !isNaN(parseFloat(String(value))) && isFinite(Number(value)) || "El campo debe ser un número."
  },

  integer: (value: unknown) => {
    if (value === null || value === undefined || value === "") return true
    return Number.isInteger(Number(value)) || "El campo debe ser un número entero."
  },

  alpha: (value: unknown) => {
    if (!value) return true
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(String(value)) || "El campo sólo debe contener letras."
  },

  alphaNum: (value: unknown) => {
    if (!value) return true
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s]+$/.test(String(value)) || "El campo sólo debe contener letras y números."
  },

  url: (value: unknown) => {
    if (!value) return true
    try {
      const url = new URL(String(value))
      return !!url
    } catch {
      return "El campo debe ser una URL válida."
    }
  },

  pattern: (regex: RegExp, message = "El formato del campo es inválido.") => (value: unknown) => {
    if (!value) return true
    return regex.test(String(value)) || message
  },

  confirmed: (matchValue: unknown) => (value: unknown) => {
    if (!value && !matchValue) return true
    return value === matchValue || "La confirmación no coincide."
  },

  phone: (value: unknown) => {
    if (!value) return true
    return /^\+?[\d\s()-]{7,15}$/.test(String(value)) || "El campo debe ser un número de teléfono válido."
  },

  min: (min: number) => (value: unknown) => {
    if (value === null || value === undefined || value === "") return true
    return Number(value) >= min || `El campo debe ser mayor o igual a ${min}.`
  },

  max: (max: number) => (value: unknown) => {
    if (value === null || value === undefined || value === "") return true
    return Number(value) <= max || `El campo debe ser menor o igual a ${max}.`
  },
}

export function useVrules() {
  return { vrules }
}
