import { Model } from '@vuex-orm/core'
import Floor from './Floor'
export default class Entity extends Model {
    static entity = 'entities'
    static fields() {
        return {
            id: this.string(''),
            name: this.string(''),
            champion: this.number(0),
            boss: this.boolean(false),
            bossId: this.number(0),
            lastBoss: this.boolean(false),
            floor_ids: this.attr(null),
            floors: this.hasManyBy(Floor, 'floors_ids'),
            portrait: this.number(0)
        }
    }
}