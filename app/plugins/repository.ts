import FactoryRepository from "../repositories/factory/FactoryRepository"

export default defineNuxtPlugin(() => {
  const { $api } = useApi()
  const repository = FactoryRepository($api)
  return {
    provide: {
      repository,
    },
  }
})