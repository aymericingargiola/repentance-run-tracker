import { Model } from '@vuex-orm/core'

export default class Character extends Model {
    static entity = 'characters'
    static fields() {
        return {
            id: this.string(''),
            variant: this.number(0),
            name: this.string(''),
            trueName: this.string(''),
            version: this.string(''),
            ignore: this.boolean(false)
        }
    }
}