import { DateTime, Duration } from 'luxon'
export default {
  formatDate(unixDate, format, locale) {
    if (unixDate && format && locale) return DateTime.fromSeconds(unixDate).setLocale(locale).toFormat(format)
    return unixDate && format ? DateTime.fromSeconds(unixDate).toFormat(format) : null
  },
  durationToMinutes(strDuration) {
    const duration = strDuration.split(":")
    const time = Duration.fromObject({hour:parseInt(duration[0]),minute:parseInt(duration[1]),second:parseInt(duration[2])}).as('seconds') / 60
    return time > 0 ? time : 1;
  }
}