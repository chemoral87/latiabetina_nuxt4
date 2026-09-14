interface PermissionItem {
  id: number
  name: string
}

let inFlightPromise: Promise<string[]> | null = null

export function usePermissionCatalog() {
  const catalog = useState<string[]>('permission-catalog-names', () => [])
  const loading = useState<boolean>('permission-catalog-loading', () => false)
  const { Permission } = useRepository()

  async function loadCatalog(): Promise<string[]> {
    if (catalog.value.length > 0) {
      return catalog.value
    }
    if (inFlightPromise) {
      return inFlightPromise
    }

    loading.value = true
    inFlightPromise = (async () => {
      try {
        const res = await Permission.index<{ data: PermissionItem[] }>({ itemsPerPage: -1 })
        if (res?.data && Array.isArray(res.data)) {
          catalog.value = res.data.map(p => p.name)
        }
      } catch (error) {
        console.error('Unable to load permission catalog', error)
      } finally {
        loading.value = false
        inFlightPromise = null
      }
      return catalog.value
    })()

    return inFlightPromise
  }

  return {
    catalog,
    loading,
    loadCatalog,
  }
}
