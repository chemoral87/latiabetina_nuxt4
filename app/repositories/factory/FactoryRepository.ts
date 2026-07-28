import CommonRepository from "./CommonRepository"

export default ($api) => ({
  Organization: CommonRepository($api)("/organization"),
})