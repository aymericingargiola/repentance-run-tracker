import store from '../store'
import NationalDayOff from '../classes/NationalDayOff'
import axios from 'axios'
import moment from 'moment'
moment.locale('fr')
export default {
    async retrieveNationalDaysOff() {
        console.time('National days off retrieve in')
        const apiUrl = 'https://calendrier.api.gouv.fr/jours-feries/metropole.json'
        // function timeout(ms) { return new Promise(resolve => setTimeout(resolve, ms)) } await timeout(5000)
        const years = [(moment().get('year') - 1).toString(), (moment().get('year')).toString(), (moment().get('year') + 1).toString()]
        const nationalDaysOffArray = await axios.get(apiUrl).then(response => {
            const daysArray = []
            if (response.status === 200) {
                const days = response.data
                let i = 0
                for (let date in days) {
                    if (years.some(year => date.includes(year))) {
                        const unixDate = moment(date, 'YYYY-MM-DD').format('X')
                        daysArray.push(
                            {
                                id: i,
                                date: date,
                                unixDate: unixDate,
                                name: days[date],
                                start: unixDate,
                                end: unixDate
                            }
                        )
                        i++
                    }
                }
                console.timeEnd('National days off retrieve in')
                return daysArray
            } else {
                console.warn(`Not possible to retrieve national days off from ${apiUrl}, empty array returned`)
                return daysArray
            }
        }).catch(error => {
            console.warn(`Not possible to retrieve national days off from ${apiUrl}, empty array returned [${error}]`)
            return []
        });
        return store.$repo(NationalDayOff).fresh(nationalDaysOffArray)
    }
}