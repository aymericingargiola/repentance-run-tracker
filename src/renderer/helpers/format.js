import { DateTime } from 'luxon'
export default { 
  formatDate(unixDate, format) {
    return unixDate && format ? DateTime.fromSeconds(unixDate).toFormat(format) : null
  }
}