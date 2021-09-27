import { Model } from '@vuex-orm/core'

export default class Run extends Model {
    static entity = 'trashRuns'
    static fields() {
        return {
            id: this.attr(null),
            customName: this.string(''),
            seed: this.string(''),
            gameState: this.number(0),
            gameMode: this.string(''),
            gameOptions: this.attr(null),
            runStart: this.attr(null),
            runUpdate: this.attr(null),
            runUserUpdate: this.attr(null),
            runEnd: this.attr(null),
            runDuration: this.string(''),
            characters: this.attr(null),
            floors: this.attr(null),
            toRemove: this.attr(null)
        }
    }
}