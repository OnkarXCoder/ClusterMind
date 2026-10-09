export const formatRangeDate = (date) =>
  new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

export function currentMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
    label: `${formatRangeDate(start)} - ${formatRangeDate(end)}`,
  }
}
