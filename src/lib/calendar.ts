export function formatGoogleCalendarLink(
  title: string,
  details: string,
  startDate: string,
  durationMinutes: number = 60,
) {
  const start = new Date(startDate)
  const end = new Date(start.getTime() + durationMinutes * 60000)
  const format = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '')
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${format(start)}/${format(end)}&details=${encodeURIComponent(details)}`
}

export function downloadIcs(
  title: string,
  details: string,
  startDate: string,
  durationMinutes: number = 60,
) {
  const start = new Date(startDate)
  const end = new Date(start.getTime() + durationMinutes * 60000)
  const format = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '')

  const icsData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${format(start)}`,
    `DTEND:${format(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${details}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\n')

  const blob = new Blob([icsData], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'consulta.ics'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
