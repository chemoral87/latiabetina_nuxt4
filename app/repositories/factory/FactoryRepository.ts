import CommonRepository from "./CommonRepository"
import { createRoleRepository } from "../RoleRepository"

export default ($api: <T = unknown>(path: string, opts?: Record<string, unknown>) => Promise<T>) => ({
  Organization: CommonRepository($api)("/organization"),
  User: CommonRepository($api)("/user"),
  Role: createRoleRepository($api, "/role"),
  Permission: CommonRepository($api)("/permission"),
})
