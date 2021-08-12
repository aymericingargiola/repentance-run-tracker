import { Model } from '@vuex-orm/core'

export default class Entity extends Model {
    static entity = 'entities'
    static fields() {
        return {
            id: this.number(0),
            subtype: this.number(0),
            variant: this.number(0),
            boss: this.number(0),
            champion: this.number(0),
            name: this.string('')
        }
    }
}