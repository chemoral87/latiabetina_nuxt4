import type { FetchError } from "ofetch"

export interface ValidationErrors {
  [field: string]: string[]
}

const state = reactive<{ errors: ValidationErrors | null }>({
  errors: null,
})

export function useValidationErrors() {
  function setErrors(e: ValidationErrors) {
    state.errors = e
  }

  function clearErrors() {
    state.errors = null
  }

  function extractFromError(err: unknown) {
    if (!err || typeof err !== "object") return
    const fetchErr = err as FetchError
    if (fetchErr.response?.status === 422 && fetchErr.response._data?.errors) {
      setErrors(fetchErr.response._data.errors as ValidationErrors)
    }
  }

  return {
    errors: computed(() => state.errors),
    setErrors,
    clearErrors,
    extractFromError,
  }
}
