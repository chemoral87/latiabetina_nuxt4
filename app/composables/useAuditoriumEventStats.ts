import { STATUS_CONFIG } from "~/constants/auditorium"
import type { Section } from "~/types/auditorium"

/**
 * Aggregate seat statistics for the mark page header and stats panel:
 * totals, per-status breakdown, percentage, and a color for the percentage.
 */
export function useAuditoriumEventStats(sections: Ref<Section[]>) {
  const activeStatusCfg = computed(() => {
    return Object.keys(STATUS_CONFIG)
      .filter((k) => STATUS_CONFIG[k].active !== false)
      .reduce(
        (acc, k) => {
          acc[k] = STATUS_CONFIG[k]
          return acc
        },
        {} as Record<
          string,
          (typeof STATUS_CONFIG)[keyof typeof STATUS_CONFIG]
        >,
      )
  })

  const statusBreakdown = computed(() => {
    const counts: Record<string, number> = {}
    const validKeys = Object.keys(STATUS_CONFIG)
    validKeys.forEach((k) => {
      counts[k] = 0
    })

    sections.value.forEach((section) => {
      const rawSubs = section.ss || section.subsections
      if (!rawSubs) return
      rawSubs.forEach((sub) => {
        const seatsSource = sub.s || sub.seats
        if (!seatsSource) return
        seatsSource.forEach((row) => {
          row.forEach((seat) => {
            if (!seat) return
            const s = seat.status
            const key = s && validKeys.includes(s) ? s : "e"
            counts[key]++
          })
        })
      })
    })
    return counts
  })

  const totalSeats = computed(() => {
    let count = 0
    sections.value.forEach((section) => {
      const rawSubs = section.ss || section.subsections
      if (!rawSubs) return
      rawSubs.forEach((subsection) => {
        const seatsSource = subsection.s || subsection.seats
        if (!seatsSource) return
        seatsSource.forEach((row) => {
          row.forEach((seat) => {
            if (seat) count++
          })
        })
      })
    })
    return count
  })

  const totalSeatsWithStatus = computed(() => {
    let count = 0
    sections.value.forEach((section) => {
      const rawSubs = section.ss || section.subsections
      if (!rawSubs) return
      rawSubs.forEach((subsection) => {
        const seatsSource = subsection.s || subsection.seats
        if (!seatsSource) return
        seatsSource.forEach((row) => {
          row.forEach((seat) => {
            if (seat && seat.status) count++
          })
        })
      })
    })
    return count
  })

  const percentajeTotalSeats = computed(() => {
    if (totalSeats.value === 0) return 0
    return ((totalSeatsWithStatus.value / totalSeats.value) * 100).toFixed(1)
  })

  const percentageColor = computed(() => {
    const percentage = parseFloat(String(percentajeTotalSeats.value))
    if (percentage >= 0 && percentage <= 60) return "#4CAF50"
    if (percentage >= 61 && percentage <= 90) return "#FF9800"
    if (percentage >= 91) return "#F44336"
    return "#000000"
  })

  function getStatusPercentage(key: string) {
    if (!totalSeats.value) return 0
    const count = statusBreakdown.value[key] || 0
    return ((count / totalSeats.value) * 100).toFixed(1)
  }

  return {
    activeStatusCfg,
    statusBreakdown,
    totalSeats,
    totalSeatsWithStatus,
    percentajeTotalSeats,
    percentageColor,
    getStatusPercentage,
  }
}