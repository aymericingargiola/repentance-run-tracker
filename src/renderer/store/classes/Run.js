import { Model } from '@vuex-orm/core'

export default class Run extends Model {
    static entity = 'runs'
    static fields() {
        return {
            id: this.attr(null),
            customName: this.string(null),
            seed: this.string(null),
            gameState: this.string(null),
            runStart: this.number(null),
            runUpdate: this.string(null),
            runEnd: this.attr(null),
            character: this.attr(null),
            floors: this.attr(null)
        }
    }
}