export type ApiFn = <T = unknown>(path: string, opts?: Record<string, unknown>) => Promise<T>
