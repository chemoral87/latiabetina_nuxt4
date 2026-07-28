import { createCommonRepository } from "~/repositories/factory/createCommonRepository"

export function useRepository() {
  const { $api } = useApi()

  return {
    Organization: createCommonRepository($api, "/organization"),
    // Agrega aquí el resto de los recursos conforme se construyan sus páginas,
    // ej: Auditorium: createCommonRepository($api, "/auditorium"),
  }
}
