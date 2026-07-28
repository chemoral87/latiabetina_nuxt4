import { createCommonRepository } from "~/repositories/factory/createCommonRepository"

export function useRepository() {
  const { $api } = useApi()

  return {
    Organization: createCommonRepository($api, "/organization"),
    User: createCommonRepository($api, "/user"),
  }
}
