import { DateTime } from 'luxon'
export default { 
  formatDate(unixDate, format, locale) {
    if (unixDate && format && locale) return DateTime.fromSeconds(unixDate).setLocale(locale).toFormat(format)
    return unixDate && format ? DateTime.fromSeconds(unixDate).toFormat(format) : null
  },
  formatDuration(duration) {
    return duration ? DateTime.fromFormat(duration, 'hh:mm:ss').toSeconds() : 0
  }
}