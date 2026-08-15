export const dashboardChartColors = {
  date: {
    blue: "#3B82F6",
    highlight: "#60A5FA",
    cyan: "#22D3EE",
  },
  doctor: {
    top: "#C084FC",
    middle: "#8B5CF6",
    bottom: "#4F46E5",
  },
  condition: {
    purple: "#A855F7",
    indigo: "#6366F1",
    blue: "#3B82F6",
    cyan: "#22D3EE",
    teal: "#2DD4BF",
    mint: "#6EE7B7",
    amber: "#F59E0B",
    coral: "#FB7185",
    other: "#6B7280",
  },
} as const

const conditionPalette = [
  dashboardChartColors.condition.purple,
  dashboardChartColors.condition.indigo,
  dashboardChartColors.condition.blue,
  dashboardChartColors.condition.cyan,
  dashboardChartColors.condition.teal,
  dashboardChartColors.condition.mint,
  dashboardChartColors.condition.amber,
  dashboardChartColors.condition.coral,
] as const

export function getConditionChartColor(condition: string, index: number): string {
  if (condition.trim().toLocaleLowerCase() === "other") {
    return dashboardChartColors.condition.other
  }

  return conditionPalette[index % conditionPalette.length] ?? dashboardChartColors.condition.other
}

export function withHexAlpha(color: string, alpha: string): string {
  return `${color}${alpha}`
}
