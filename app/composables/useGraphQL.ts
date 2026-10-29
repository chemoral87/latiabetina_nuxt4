interface GraphQLError {
  message: string
  extensions?: Record<string, unknown>
}

interface GraphQLResponse<T> {
  data?: T | null
  errors?: GraphQLError[]
}

/**
 * Minimal GraphQL client for the Lighthouse endpoint at `{baseUrl}/graphql`.
 *
 * Reuses `useApi().$api` so JWT refresh, token storage and the global progress
 * bar behave exactly like the REST repositories. GraphQL is the read path only;
 * writes stay on REST.
 */
export function useGraphQL() {
  const { $api } = useApi()

  async function query<T>(document: string, variables: Record<string, unknown> = {}): Promise<T> {
    const res = await $api<GraphQLResponse<T>>('/graphql', {
      method: 'POST',
      body: { query: document, variables },
    })

    if (res?.errors?.length) {
      const first = res.errors[0]!
      throw Object.assign(new Error(first.message), {
        code: (first.extensions?.code as string) ?? 'GRAPHQL_ERROR',
        errors: res.errors,
      })
    }

    return res.data as T
  }

  return { query }
}
