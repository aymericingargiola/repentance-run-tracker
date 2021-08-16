import { Model } from '@vuex-orm/core'

export default class Floor extends Model {
    static entity = 'floors'
    static fields() {
        return {
            id: this.string(''),
            igId: this.string(''),
            name: this.string(''),
            group: this.string(''),
            shortName: this.string('')
        }
    }
}