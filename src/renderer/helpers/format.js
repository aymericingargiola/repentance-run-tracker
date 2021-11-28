import moment from 'moment'
export default { 
  formatDate(unixDate, format) {
    return unixDate && format ? moment.unix(unixDate).format(format) : null
  }
}