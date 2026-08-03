export interface Classification {
  value: string
  label: string
  hex: string
}

export const classifications: Classification[] = [
  { value: "general", label: "General", hex: "#9e9e9e" },
  { value: "kids", label: "Kids", hex: "#4CAF50" },
  { value: "jv3s", label: "JV3S", hex: "#f97316" },
  { value: "jv3s-teen", label: "JV3S Origen", hex: "#2196f3" },
  { value: "jv3s-impulso", label: "JV3S Impulso", hex: "#195defff" },
  { value: "jv3s-legado", label: "JV3S Legado", hex: "#f44336" },
]

export function classificationColor(value?: string | null): string {
  const match = classifications.find((item) => item.value === value)
  return match ? match.hex : "#041845"
}
