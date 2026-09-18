<template>
  <div>
    <VRow dense class="mb-4">
      <VCol cols="auto" style="min-width: 300px">
        <div class="text-subtitle-1 font-weight-bold mb-2">
          <VIcon class="mr-1" size="small">mdi-chart-bar</VIcon>
          Asistencia
        </div>
        <MyDateRange v-model="dateRange" variant="outlined" label="Rango de fechas" />
      </VCol>
    </VRow>

    <VSheet rounded="lg" class="mb-4 pa-4">
      <Bar
        v-if="chartData"
        :data="chartData"
        style="height: 300px"
        :options="chartOptions"
        :plugins="[totalOnTop]"
      />
      <div v-else class="text-center text-medium-emphasis py-8">
        {{ loading ? 'Cargando datos...' : 'Sin datos disponibles' }}
      </div>
    </VSheet>

    <VRow dense>
      <VCol v-for="item in summaryItems" :key="item.label" cols="6">
        <VSheet rounded="lg" class="pa-3 text-center">
          <div :style="{ color: item.color }" class="text-h5 font-weight-bold">
            {{ item.value }}
          </div>
          <div class="text-caption text-medium-emphasis">{{ item.label }}</div>
        </VSheet>
      </VCol>
    </VRow>
  </div>
</template>

<script setup lang="ts">
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    type Plugin,
  } from 'chart.js'
  import { Bar } from 'vue-chartjs'

  ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

  const totalOnTop: Plugin = {
    id: 'totalOnTop',
    afterDatasetsDraw(chart) {
      const { ctx } = chart
      chart.data.datasets.forEach((_, i) => {
        const meta = chart.getDatasetMeta(i)
        if (i < chart.data.datasets.length - 1) return
        meta.data.forEach(bar => {
          const { x, y } = bar.getProps(['x', 'y'], true)
          const total = chart.data.datasets.reduce((sum, ds) => {
            const val = (ds as { data: number[] }).data[meta.data.indexOf(bar)]
            return sum + (typeof val === 'number' ? val : 0)
          }, 0)
          if (total > 0) {
            ctx.save()
            ctx.font = 'bold 12px sans-serif'
            ctx.fillStyle = '#333'
            ctx.textAlign = 'center'
            ctx.fillText(String(total), x, y - 6)
            ctx.restore()
          }
        })
      })
    },
  }

  interface AssistanceRow {
    assistance_date: string
    service_time: string
    adults: number
    teens: number
    kids: number
    babies: number
  }

  const { Assistance } = useRepository()

  const now = new Date()
  const fiveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
  const pad = (n: number) => String(n).padStart(2, '0')
  const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

  const dateRange = ref<(string | null)[]>([toISO(fiveMonthsAgo), toISO(now)])
  const loading = ref(true)
  const rows = ref<AssistanceRow[]>([])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true },
    },
  }

  const chartData = computed(() => {
    if (!rows.value.length) return null

    const grouped = new Map<
      string,
      { adults: number; teens: number; kids: number; babies: number }
    >()
    for (const row of rows.value) {
      const key = row.assistance_date
      if (!grouped.has(key)) {
        grouped.set(key, { adults: 0, teens: 0, kids: 0, babies: 0 })
      }
      const acc = grouped.get(key)!
      acc.adults += row.adults
      acc.teens += row.teens
      acc.kids += row.kids
      acc.babies += row.babies
    }

    const sorted = [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b))
    const labels = sorted.map(([date]) => {
      const [y, m, d] = date.split('-')
      const months = [
        'Ene',
        'Feb',
        'Mar',
        'Abr',
        'May',
        'Jun',
        'Jul',
        'Ago',
        'Sep',
        'Oct',
        'Nov',
        'Dic',
      ]
      return `${d} ${months[parseInt(m, 10) - 1]}`
    })

    return {
      labels,
      datasets: [
        { label: 'Adultos', data: sorted.map(([, v]) => v.adults), backgroundColor: '#1976D2' },
        { label: 'Adolescentes', data: sorted.map(([, v]) => v.teens), backgroundColor: '#FB8C00' },
        { label: 'Niños', data: sorted.map(([, v]) => v.kids), backgroundColor: '#4CAF50' },
        { label: 'Bebés', data: sorted.map(([, v]) => v.babies), backgroundColor: '#00BCD4' },
      ],
    }
  })

  const totalAdults = computed(() => rows.value.reduce((s, r) => s + r.adults, 0))
  const totalTeens = computed(() => rows.value.reduce((s, r) => s + r.teens, 0))
  const totalKids = computed(() => rows.value.reduce((s, r) => s + r.kids, 0))
  const totalBabies = computed(() => rows.value.reduce((s, r) => s + r.babies, 0))

  const summaryItems = computed(() => [
    { label: 'Adultos', value: totalAdults.value, color: '#1976D2' },
    { label: 'Adolescentes', value: totalTeens.value, color: '#FB8C00' },
    { label: 'Niños', value: totalKids.value, color: '#4CAF50' },
    { label: 'Bebés', value: totalBabies.value, color: '#00BCD4' },
  ])

  async function fetchData() {
    loading.value = true
    const params: Record<string, unknown> = {}
    if (dateRange.value?.[0]) params.start_date = dateRange.value[0]
    if (dateRange.value?.[1]) params.end_date = dateRange.value[1]

    const res = await Assistance.chart<{ data: AssistanceRow[] }>(params).catch(() => ({
      data: [],
    }))
    rows.value = res.data || []
    loading.value = false
  }

  watch(dateRange, () => fetchData(), { deep: true })

  onMounted(() => fetchData())
</script>
